<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import { getStoredFbParams } from '@/utils/fbclid'
import { trackLead } from '@/utils/tracking'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()

interface Country { code: string; name: string; dial: string; flag: string }
const flagEmoji = (code: string) =>
  [...code.toUpperCase()].map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('')

const PRIORITY = ['EC', 'CO', 'PE', 'MX', 'AR', 'CL', 'VE', 'BO', 'PY', 'UY', 'GT', 'HN', 'SV', 'CR', 'PA', 'DO', 'CU', 'US', 'ES']
const nameMap: Record<string, string> = {
  EC: 'Ecuador', CO: 'Colombia', PE: 'Perú', MX: 'México', AR: 'Argentina', CL: 'Chile',
  VE: 'Venezuela', BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', GT: 'Guatemala',
  HN: 'Honduras', SV: 'El Salvador', CR: 'Costa Rica', PA: 'Panamá', DO: 'Rep. Dominicana',
  CU: 'Cuba', US: 'Estados Unidos', ES: 'España', BR: 'Brasil',
}
const allCountries: Country[] = getCountries().map(code => ({
  code, name: nameMap[code] ?? code, dial: '+' + getCountryCallingCode(code), flag: flagEmoji(code),
}))
const priorityList = PRIORITY.map(code => allCountries.find(c => c.code === code)).filter(Boolean) as Country[]
const otherList = allCountries.filter(c => !PRIORITY.includes(c.code)).sort((a, b) => a.name.localeCompare(b.name))
const countries: Country[] = [...priorityList, { code: '---', name: '─────────', dial: '', flag: '' }, ...otherList]

const selectedCountry = ref<Country>(priorityList[0])
const dropdownOpen = ref(false)
const countrySearch = ref('')
const submitting = ref(false)

const form = ref({ nombre: '', apellido: '', email: '', phone: '' })
const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const formattedPhone = computed(() =>
  form.value.phone ? new AsYouType(selectedCountry.value.code as any).input(form.value.phone) : '',
)
const phoneValid = computed(() => {
  const full = selectedCountry.value.dial + form.value.phone.replace(/\s/g, '')
  return parsePhoneNumberFromString(full, selectedCountry.value.code as any)?.isValid() ?? false
})
const parsedPhoneE164 = computed(() => {
  const full = selectedCountry.value.dial + form.value.phone.replace(/\s/g, '')
  return parsePhoneNumberFromString(full, selectedCountry.value.code as any)?.format('E.164') ?? ''
})
const validators: Record<string, (v: string) => string | null> = {
  nombre: v => v.trim().length < 2 ? 'Ingresa tu nombre' : null,
  apellido: v => v.trim().length < 2 ? 'Ingresa tu apellido' : null,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Email inválido',
  phone: () => phoneValid.value ? null : 'Número inválido para el país seleccionado',
}
const validate = (): boolean => {
  const e: Record<string, string> = {}
  for (const [field, fn] of Object.entries(validators)) {
    const msg = fn(form.value[field as keyof typeof form.value])
    if (msg) e[field] = msg
  }
  errors.value = e
  return Object.keys(e).length === 0
}
const onBlur = (field: string) => {
  touched.value[field] = true
  const msg = validators[field]?.(form.value[field as keyof typeof form.value])
  if (msg) errors.value[field] = msg
  else delete errors.value[field]
}
const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  if (!q) return countries
  return countries.filter(c =>
    c.code !== '---' && (c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q))
  )
})
const selectCountry = (c: Country) => {
  if (c.code === '---') return
  selectedCountry.value = c
  dropdownOpen.value = false
  countrySearch.value = ''
  form.value.phone = ''
}
const handleClickOutside = (e: MouseEvent) => {
  const el = document.querySelector('.rmodal__phone-wrap')
  if (el && !el.contains(e.target as Node)) dropdownOpen.value = false
}

const handleSubmit = async () => {
  touched.value = { nombre: true, apellido: true, email: true, phone: true }
  if (!validate()) return
  submitting.value = true

  const leadEventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const nombreFull = `${form.value.nombre.trim()} ${form.value.apellido.trim()}`
  const emailLower = form.value.email.trim().toLowerCase()
  const telefonoE164 = parsedPhoneE164.value
  const paisNombre = selectedCountry.value.name
  const paisCode = selectedCountry.value.code
  const paisFlag = selectedCountry.value.flag

  const tags = [
    'paso-1-contacto', 'izzu-estudio-web', 'diagnostico-arquitectonico',
    'lead-sin-calificar', `pais-${paisCode.toLowerCase()}`, 'fuente-web-funnel',
  ]
  const nota = [
    '🏗️ *Nuevo lead IZZU Estudio de Arquitectura*', '',
    '📍 *Paso 1 / 3* — Contacto inicial capturado',
    '⏳ *Estado:* Pendiente de calificación', '',
    `👤 *Nombre:* ${nombreFull}`,
    `✉️ *Email:* ${emailLower}`,
    `📱 *WhatsApp:* ${telefonoE164}`,
    `${paisFlag} *País:* ${paisNombre} (${paisCode})`, '',
    `🆔 *Event ID:* ${leadEventId}`,
    `🕒 *Timestamp:* ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
    '', '🎯 *Próximo paso:* Ver video VSL (2 min mínimo) → Calificación → Diagnóstico.',
    '', '💼 *Interés:* Regularización / División / Propiedad Horizontal / Urbanismo',
  ].join('\n')

  const payload = {
    nombre: form.value.nombre.trim(), apellido: form.value.apellido.trim(),
    nombreCompleto: nombreFull, email: emailLower,
    telefono: telefonoE164, telefonoDisplay: selectedCountry.value.dial + ' ' + formattedPhone.value,
    pais: paisNombre, paisCode, paisFlag,
    timestamp: new Date().toISOString(),
    event_id: leadEventId, step: 1, stepName: 'contacto',
    estado: 'lead-sin-calificar',
    nota, notas: nota, note: nota, notes: nota,
    tags, etiquetas: tags.join(', '),
    source: 'izzu-estudio-web',
    landingUrl: window.location.href, referrer: document.referrer, userAgent: navigator.userAgent,
    ...getStoredFbParams(),
  }

  await fetch(import.meta.env.VITE_WEBHOOK_REGISTRO, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})

  ;(window as any).fbq?.('track', 'Lead', { content_name: 'diagnostico-izzu' }, { eventID: leadEventId })

  localStorage.setItem('izzu_contact', JSON.stringify({
    nombre: form.value.nombre.trim(), apellido: form.value.apellido.trim(),
    email: emailLower, phone: telefonoE164, country: paisCode,
    eventId: leadEventId, timestamp: Date.now(),
  }))

  trackLead({
    eventId: leadEventId,
    user: {
      email: emailLower, phone: telefonoE164,
      firstName: form.value.nombre.trim(), lastName: form.value.apellido.trim(),
      country: paisCode, externalId: emailLower,
    },
    custom: { content_name: 'IZZU Estudio - Diagnóstico Arquitectónico', content_category: 'diagnostico-arquitectonico' },
  })

  submitting.value = false
  emit('close')
  router.push({ name: 'video' })
}

const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.open) emit('close') }

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) {
    setTimeout(() => document.getElementById('rm-nombre')?.focus(), 80)
  }
})

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  document.addEventListener('keydown', onKey)
})
onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="rmodal-fade">
      <div v-if="open" class="rmodal-overlay" role="dialog" aria-modal="true" aria-labelledby="rmodal-title" @click.self="emit('close')">
        <div class="rmodal">

          <button class="rmodal__close" type="button" @click="emit('close')" aria-label="Cerrar">
            <i class="fa-solid fa-xmark" />
          </button>

          <span class="rmodal__step">Paso 1 de 3 · Contacto</span>
          <h2 id="rmodal-title" class="rmodal__title">Agenda tu <span>diagnóstico gratuito</span></h2>
          <p class="rmodal__sub">Déjanos tus datos. En el siguiente paso verás un video clave y completarás la calificación.</p>

          <form class="rmodal__form" @submit.prevent="handleSubmit" novalidate>
            <div class="rmodal__row">
              <div class="rmodal__field" :class="{ 'has-error': touched.nombre && errors.nombre }">
                <label for="rm-nombre">Nombre</label>
                <input id="rm-nombre" v-model="form.nombre" type="text" placeholder="Juan" autocomplete="given-name" @blur="onBlur('nombre')" />
                <span v-if="touched.nombre && errors.nombre" class="rmodal__error">{{ errors.nombre }}</span>
              </div>
              <div class="rmodal__field" :class="{ 'has-error': touched.apellido && errors.apellido }">
                <label for="rm-apellido">Apellido</label>
                <input id="rm-apellido" v-model="form.apellido" type="text" placeholder="Pérez" autocomplete="family-name" @blur="onBlur('apellido')" />
                <span v-if="touched.apellido && errors.apellido" class="rmodal__error">{{ errors.apellido }}</span>
              </div>
            </div>

            <div class="rmodal__field" :class="{ 'has-error': touched.email && errors.email }">
              <label for="rm-email">Correo electrónico</label>
              <input id="rm-email" v-model="form.email" type="email" placeholder="juan@empresa.com" autocomplete="email" @blur="onBlur('email')" />
              <span v-if="touched.email && errors.email" class="rmodal__error">{{ errors.email }}</span>
            </div>

            <div class="rmodal__field" :class="{ 'has-error': touched.phone && errors.phone }">
              <label>Teléfono (WhatsApp)</label>
              <div class="rmodal__phone-wrap">
                <button type="button" class="rmodal__country-trigger" :aria-expanded="dropdownOpen" @click="dropdownOpen = !dropdownOpen">
                  <span class="rmodal__flag">{{ selectedCountry.flag }}</span>
                  <span class="rmodal__dial">{{ selectedCountry.dial }}</span>
                  <i class="fa-solid fa-chevron-down" :class="{ open: dropdownOpen }" />
                </button>

                <Transition name="rmodal-dd">
                  <div v-if="dropdownOpen" class="rmodal__country-dd">
                    <input type="text" class="rmodal__country-search" v-model="countrySearch" placeholder="Buscar país..." />
                    <ul>
                      <li v-for="c in filteredCountries" :key="c.code"
                          :class="['rmodal__country-item', { separator: c.code === '---', active: c.code === selectedCountry.code }]"
                          @click="selectCountry(c)">
                        <template v-if="c.code !== '---'">
                          <span class="rmodal__flag">{{ c.flag }}</span>
                          <span class="rmodal__country-name">{{ c.name }}</span>
                          <span class="rmodal__country-dial">{{ c.dial }}</span>
                        </template>
                        <hr v-else />
                      </li>
                    </ul>
                  </div>
                </Transition>

                <input class="rmodal__phone-input" type="tel" :value="form.phone" placeholder="98 493 4039"
                       autocomplete="tel-national" inputmode="tel"
                       @input="(e) => form.phone = (e.target as HTMLInputElement).value.replace(/[^\d\s\-\(\)]/g, '')"
                       @blur="onBlur('phone')" />
                <span class="rmodal__phone-status" :class="{ valid: phoneValid }" aria-hidden="true">
                  <i v-if="phoneValid" class="fa-solid fa-check" />
                </span>
              </div>
              <span v-if="touched.phone && errors.phone" class="rmodal__error">{{ errors.phone }}</span>
            </div>

            <button class="rmodal__submit" type="submit" :disabled="submitting">
              <i v-if="submitting" class="fa-solid fa-spinner rmodal__spin" />
              <i v-else class="fa-solid fa-arrow-right" />
              {{ submitting ? 'Enviando…' : 'CONTINUAR AL VIDEO' }}
            </button>

            <p class="rmodal__legal">
              <i class="fa-solid fa-lock" />
              100% gratuito · Sin compromiso · Datos seguros
            </p>
          </form>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
$primary: #1B365D;
$accent:  #C4956A;
$dark:    #0D1117;

.rmodal-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(13, 17, 23, 0.78);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; overflow-y: auto;
}

.rmodal {
  position: relative;
  width: 100%; max-width: 540px;
  background: #ffffff; color: $dark;
  border: 1px solid rgba(196, 149, 106, 0.25);
  border-radius: 1.5rem; padding: 2.25rem 1.5rem 1.75rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  max-height: 92vh; overflow-y: auto;

  @media (min-width: 560px) { padding: 2.5rem 2rem; }
}

.rmodal__close {
  position: absolute; top: 0.85rem; right: 0.85rem;
  width: 2.25rem; height: 2.25rem;
  border-radius: 999px;
  border: 1px solid rgba(27, 54, 93, 0.1);
  background: rgba(27, 54, 93, 0.04); color: $primary;
  cursor: pointer; display: grid; place-items: center;
  font-size: 0.9rem;
  transition: background 160ms ease, color 160ms ease, border-color 160ms ease;
  &:hover { background: rgba(196, 149, 106, 0.12); color: $accent; border-color: $accent; }
}

.rmodal__step {
  display: inline-flex; align-items: center;
  background: rgba(27, 54, 93, 0.08); color: $primary;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.72rem; letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem; border-radius: 999px;
  text-transform: uppercase; margin-bottom: 0.85rem;
}

.rmodal__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.5rem, 3.5vw, 2rem);
  line-height: 1.18; margin: 0 0 0.5rem; color: $primary;
  span { color: $accent; }
}

.rmodal__sub { color: #6b7280; font-size: 0.9rem; margin: 0 0 1.5rem; line-height: 1.55; }

.rmodal__form { display: flex; flex-direction: column; gap: 0.9rem; }
.rmodal__row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; @media (max-width: 400px) { grid-template-columns: 1fr; } }

.rmodal__field {
  display: flex; flex-direction: column; gap: 0.35rem;
  label {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.74rem; font-weight: 700; color: #4a5f7a;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  input {
    width: 100%; box-sizing: border-box;
    background: #f9fbff; border: 1.5px solid rgba(27, 54, 93, 0.12);
    border-radius: 0.65rem; padding: 0.8rem 0.95rem;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.95rem; color: $dark; outline: none;
    transition: border-color 160ms ease, background 160ms ease, box-shadow 200ms ease;
    &::placeholder { color: #b8cae0; }
    &:focus { border-color: $accent; background: rgba(196, 149, 106, 0.04); box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.12); }
  }
  &.has-error input { border-color: rgba(239, 68, 68, 0.55); }
}
.rmodal__error { font-size: 0.74rem; color: #ef4444; font-weight: 600; }

.rmodal__phone-wrap {
  position: relative; display: flex; align-items: center;
  background: #f9fbff; border: 1.5px solid rgba(27, 54, 93, 0.12);
  border-radius: 0.65rem;
  transition: border-color 160ms ease, box-shadow 200ms ease;
  &:focus-within { border-color: $accent; box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.12); }
  .has-error & { border-color: rgba(239, 68, 68, 0.55); }
}
.rmodal__country-trigger {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.8rem 0.55rem 0.8rem 0.95rem;
  background: none; border: none; border-right: 1px solid rgba(27, 54, 93, 0.12);
  cursor: pointer; flex-shrink: 0;
  i { font-size: 0.7rem; color: rgba(27, 54, 93, 0.5); transition: transform 200ms ease; &.open { transform: rotate(180deg); } }
}
.rmodal__flag { font-size: 1.1rem; line-height: 1; }
.rmodal__dial { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 0.82rem; font-weight: 600; color: #4a5f7a; }
.rmodal__country-dd {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 200;
  width: 280px; max-height: 240px; overflow: hidden;
  background: #ffffff; border: 1px solid rgba(0,0,0,0.1);
  border-radius: 0.85rem; box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
}
.rmodal__country-search {
  width: 100%; box-sizing: border-box; padding: 0.7rem 0.95rem;
  background: rgba(0,0,0,0.02); border: none; border-bottom: 1px solid rgba(0,0,0,0.05);
  color: $dark; font-size: 0.85rem; outline: none;
  &::placeholder { color: #b8cae0; }
}
.rmodal__country-dd ul { list-style: none; padding: 0.25rem; margin: 0; overflow-y: auto; max-height: 190px; }
.rmodal__country-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.55rem 0.6rem; border-radius: 0.5rem; cursor: pointer;
  &:hover:not(.separator) { background: rgba(196, 149, 106, 0.08); }
  &.active { background: rgba(196, 149, 106, 0.14); }
  &.separator { padding: 0.25rem 0.6rem; cursor: default; hr { width: 100%; border: 0; border-top: 1px solid rgba(0,0,0,0.05); } }
}
.rmodal__country-name { font-size: 0.85rem; color: #3a4f6a; flex: 1; }
.rmodal__country-dial { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 0.75rem; color: #a0b0c5; }

.rmodal__phone-input {
  flex: 1; min-width: 0;
  background: transparent !important; border: none !important; outline: none !important;
  padding: 0.8rem 2.4rem 0.8rem 0.85rem !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.95rem; color: $dark;
  &::placeholder { color: #b8cae0; }
}
.rmodal__phone-status {
  position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
  width: 1.3rem; height: 1.3rem; border-radius: 50%; display: grid; place-items: center;
  &.valid { background: rgba(34, 197, 94, 0.15); color: #15803d; font-size: 0.7rem; }
}

.rmodal__submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  margin-top: 0.5rem; padding: 1.1rem 1.4rem;
  background: $primary; color: #ffffff;
  border: 0; border-radius: 0.85rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(27, 54, 93, 0.3);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease, color 160ms ease;
  &:hover:not(:disabled) { transform: translateY(-2px); background: $accent; color: $dark; box-shadow: 0 18px 40px rgba(196, 149, 106, 0.45); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
.rmodal__spin { animation: rmodal-spin 0.8s linear infinite; }
@keyframes rmodal-spin { to { transform: rotate(360deg); } }

.rmodal__legal {
  display: flex; align-items: center; justify-content: center; gap: 0.45rem;
  font-size: 0.72rem; color: #9ca3af; margin: 0.5rem 0 0;
  i { color: $accent; }
}

.rmodal-fade-enter-active { transition: opacity 220ms ease;
  .rmodal { transition: opacity 220ms ease, transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1); }
}
.rmodal-fade-leave-active { transition: opacity 180ms ease;
  .rmodal { transition: opacity 180ms ease, transform 180ms ease; }
}
.rmodal-fade-enter-from { opacity: 0; .rmodal { opacity: 0; transform: scale(0.94) translateY(20px); } }
.rmodal-fade-leave-to   { opacity: 0; .rmodal { opacity: 0; transform: scale(0.97); } }

.rmodal-dd-enter-active { transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.rmodal-dd-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.rmodal-dd-enter-from, .rmodal-dd-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }
</style>

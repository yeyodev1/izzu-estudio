<script setup lang="ts">
/**
 * QualifyModal.vue
 *
 * Filtro de calificación post-registro:
 *   1. ¿Capital tres cifras disponible para la preventa?
 *   2. ¿Lista para comprometerte 1 año entero con Luisa?
 *
 * Ambas "sí" → /registrada (lista VIP)
 * Cualquier "no" → /sin-cupo + cooldown 24h
 */
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trackCompleteRegistration } from '@/utils/tracking'

interface Lead {
  nombre: string
  apellido: string
  email: string
  phone: string
  country: string
  eventId: string
}

const props = defineProps<{
  open: boolean
  lead: Lead | null
}>()
const emit = defineEmits<{ (e: 'close'): void }>()

const router = useRouter()

type ProfileKey = 'dueña-negocio' | 'emprendedora' | 'profesional' | 'mamá' | 'otra'

const PROFILES: { key: ProfileKey; label: string; icon: string }[] = [
  { key: 'dueña-negocio', label: 'Dueña de negocio', icon: 'fa-store' },
  { key: 'emprendedora', label: 'Emprendedora', icon: 'fa-rocket' },
  { key: 'profesional', label: 'Profesional ocupada', icon: 'fa-briefcase' },
  { key: 'mamá', label: 'Mamá ocupada', icon: 'fa-heart' },
  { key: 'otra', label: 'Otra', icon: 'fa-user' },
]

const capital = ref<'si' | 'no' | ''>('')
const compromiso = ref<'si' | 'no' | ''>('')
const profile = ref<ProfileKey | ''>('')
const instagram = ref('')
const submitting = ref(false)

const normalizedInstagram = computed(() => {
  const raw = instagram.value.trim()
  if (!raw) return ''
  return raw.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/$/, '')
})

const isValid = computed(
  () => capital.value !== '' && compromiso.value !== '' && profile.value !== '',
)
const qualifies = computed(
  () => capital.value === 'si' && compromiso.value === 'si',
)

const reset = () => {
  capital.value = ''
  compromiso.value = ''
  profile.value = ''
  instagram.value = ''
  submitting.value = false
}

watch(
  () => props.open,
  (v) => {
    if (v) reset()
  },
)

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

const sendQualificationWebhook = async (calificada: boolean) => {
  const url = import.meta.env.VITE_WEBHOOK_CALIFICACION
  if (!url || !props.lead) return

  const baseTags = [
    'paso-2-calificacion',
    'preventa-comunidad-anual',
    'luisa-pita-web',
    calificada ? 'lead-calificado-vip' : 'lead-no-calificado',
    `capital-${capital.value}`,
    `compromiso-${compromiso.value}`,
    profile.value ? `perfil-${profile.value}` : 'perfil-sin-definir',
  ]

  const etiquetas = baseTags.join(', ')

  const nota = calificada
    ? `🎯 Paso 2 - ✅ CALIFICÓ VIP 🌟. 💰 Capital tres cifras: SI. 📅 Compromiso 1 año: SI. 👩‍💼 Perfil: ${profile.value}. 📸 Instagram: ${normalizedInstagram.value || 'no proporcionado'}. 🚨 Enviar aviso 24h antes de apertura ⏰ + 🎁 código de descuento exclusivo.`
    : `🎯 Paso 2 - ❌ NO CALIFICÓ. 💰 Capital tres cifras: ${capital.value.toUpperCase()}. 📅 Compromiso 1 año: ${compromiso.value.toUpperCase()}. 👩‍💼 Perfil: ${profile.value}. 📸 Instagram: ${normalizedInstagram.value || 'no proporcionado'}. ⏳ Cooldown 48h activo, redirigida a IG @luisapitabejarano 👋.`

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...props.lead,
        calificada,
        capital: capital.value,
        compromiso: compromiso.value,
        perfil: profile.value,
        instagram: normalizedInstagram.value,
        timestamp: new Date().toISOString(),
        source: 'luisa-pita-web',
        step: 2,
        stepName: 'calificacion',
        nota,
        tags: baseTags,
        etiquetas,
      }),
    })
  } catch {
    /* tracking no debe romper UX */
  }
}

const submit = async () => {
  if (!isValid.value || submitting.value) return
  submitting.value = true

  const calificada = qualifies.value

  await sendQualificationWebhook(calificada)

  if (calificada) {
    if (props.lead) {
      trackCompleteRegistration({
        eventId: `${props.lead.eventId}_qual`,
        user: {
          email: props.lead.email,
          phone: props.lead.phone,
          firstName: props.lead.nombre,
          lastName: props.lead.apellido,
          country: props.lead.country,
          externalId: props.lead.email,
        },
        custom: {
          content_name: 'Comunidad Anual Luisa Pita - Preventa VIP',
          content_category: 'community-presale-qualified',
          perfil: profile.value,
          instagram: normalizedInstagram.value,
        },
      })
    }
    emit('close')
    router.push({ name: 'vip-confirmed' })
  } else {
    localStorage.setItem('lpb_disq_at', String(Date.now()))
    emit('close')
    router.push({ name: 'no-space' })
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="qmodal-fade">
      <div
        v-if="open"
        class="qmodal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qmodal-title"
        @click.self="$emit('close')"
      >
        <div class="qmodal">
          <button
            type="button"
            class="qmodal__close"
            aria-label="Cerrar"
            @click="$emit('close')"
          >
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>

          <p class="qmodal__eyebrow">Una pausa antes de cerrar tu cupo</p>
          <h2 id="qmodal-title" class="qmodal__title">
            Solo dos preguntas <span class="qmodal__title-accent">honestas</span>
          </h2>
          <p class="qmodal__subtitle">
            La comunidad anual con Luisa es para mujeres decididas. Responde con sinceridad — esto define si recibes el código de descuento exclusivo.
          </p>

          <form class="qmodal__form" @submit.prevent="submit">
            <fieldset class="qmodal__field" :disabled="submitting">
              <legend class="qmodal__legend">
                1. ¿Tienes disponible un capital de tres cifras (USD) para invertir el día que abra la preventa?
              </legend>
              <label class="qmodal__option">
                <input v-model="capital" type="radio" value="si" />
                <span class="qmodal__option-text">
                  <strong>Sí, lo tengo listo.</strong> Estoy esperando que abra para reservar.
                </span>
              </label>
              <label class="qmodal__option">
                <input v-model="capital" type="radio" value="no" />
                <span class="qmodal__option-text">
                  <strong>Aún no.</strong> Estoy explorando o necesito tiempo para reunirlo.
                </span>
              </label>
            </fieldset>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend class="qmodal__legend">
                2. ¿Estás lista para comprometerte un año entero con Luisa para transformar tu cuerpo y tu vida?
              </legend>
              <label class="qmodal__option">
                <input v-model="compromiso" type="radio" value="si" />
                <span class="qmodal__option-text">
                  <strong>Sí, estoy decidida.</strong> Quiero el año completo, no algo a medias.
                </span>
              </label>
              <label class="qmodal__option">
                <input v-model="compromiso" type="radio" value="no" />
                <span class="qmodal__option-text">
                  <strong>Solo estoy explorando.</strong> Aún no quiero comprometerme un año.
                </span>
              </label>
            </fieldset>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend class="qmodal__legend">
                3. ¿Cómo te describes hoy? <span class="qmodal__hint">(elige la que más te represente)</span>
              </legend>
              <div class="qmodal__chips">
                <label
                  v-for="p in PROFILES"
                  :key="p.key"
                  class="qmodal__chip"
                  :class="{ 'qmodal__chip--active': profile === p.key }"
                >
                  <input v-model="profile" type="radio" :value="p.key" />
                  <i :class="['fa-solid', p.icon]" aria-hidden="true" />
                  <span>{{ p.label }}</span>
                </label>
              </div>
            </fieldset>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend class="qmodal__legend">
                4. Tu Instagram <span class="qmodal__hint">(opcional, nos ayuda a conocerte)</span>
              </legend>
              <div class="qmodal__ig">
                <span class="qmodal__ig-prefix">@</span>
                <input
                  v-model="instagram"
                  type="text"
                  class="qmodal__ig-input"
                  placeholder="tuusuario"
                  autocomplete="off"
                  inputmode="text"
                />
              </div>
            </fieldset>

            <button
              type="submit"
              class="qmodal__submit"
              :disabled="!isValid || submitting"
            >
              <span v-if="submitting" class="qmodal__spinner" aria-hidden="true" />
              <span v-else>Enviar respuestas</span>
            </button>

            <p class="qmodal__legal">
              Si no encajas hoy, no pasa nada — la comunidad está hecha para quien está lista. Podrás registrarte en una próxima cohorte.
            </p>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.qmodal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(13, 17, 23, 0.78);
  backdrop-filter: blur(6px);
  display: grid;
  place-items: center;
  padding: 1rem;
  z-index: 9000;
}

.qmodal {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  color: #0d1117;
  border-radius: 1.25rem;
  padding: 2.25rem 1.75rem 1.75rem;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 640px) {
    padding: 2.5rem 2.25rem 2rem;
  }
}

.qmodal__close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 0;
  background: rgba(13, 17, 23, 0.06);
  color: #0d1117;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 160ms ease;

  &:hover {
    background: rgba(13, 17, 23, 0.12);
  }
}

.qmodal__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 600;
  color: #0a9e68;
  margin: 0 0 0.5rem;
}

.qmodal__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3vw, 1.85rem);
  line-height: 1.15;
  margin: 0 0 0.75rem;
}

.qmodal__title-accent {
  color: #16c784;
}

.qmodal__subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.95rem;
  line-height: 1.5;
  color: #41484f;
  margin: 0 0 1.5rem;
}

.qmodal__form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.qmodal__field {
  border: 0;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qmodal__legend {
  font-family: 'Outfit', system-ui, sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: #0d1117;
  margin-bottom: 0.25rem;
  line-height: 1.35;
}

.qmodal__hint {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  font-weight: 500;
  color: #6b7280;
  margin-left: 0.35rem;
}

.qmodal__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.qmodal__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.9rem;
  border: 1.5px solid #e5e9ec;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: #1f2933;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;

  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  i {
    color: #6b7280;
    font-size: 0.85rem;
    transition: color 160ms ease;
  }

  &:hover {
    border-color: #16c784;
    color: #0a9e68;
  }
}

.qmodal__chip--active {
  border-color: #16c784;
  background: #f0fff8;
  color: #0a9e68;

  i {
    color: #0a9e68;
  }
}

.qmodal__ig {
  display: flex;
  align-items: center;
  border: 1.5px solid #e5e9ec;
  border-radius: 0.75rem;
  background: #ffffff;
  overflow: hidden;
  transition: border-color 160ms ease;

  &:focus-within {
    border-color: #16c784;
  }
}

.qmodal__ig-prefix {
  padding: 0.7rem 0.5rem 0.7rem 0.95rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  color: #6b7280;
  border-right: 1.5px solid #e5e9ec;
  background: #f9fafb;
}

.qmodal__ig-input {
  flex: 1;
  border: 0;
  outline: 0;
  padding: 0.7rem 0.95rem;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.95rem;
  color: #0d1117;
  background: transparent;

  &::placeholder {
    color: #9ca3af;
  }
}

.qmodal__option {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.85rem 1rem;
  border: 1.5px solid #e5e9ec;
  border-radius: 0.85rem;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;

  input {
    margin-top: 0.2rem;
    accent-color: #16c784;
  }

  &:hover {
    border-color: #16c784;
    background: #f0fff8;
  }

  &:has(input:checked) {
    border-color: #16c784;
    background: #f0fff8;
  }
}

.qmodal__option-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.92rem;
  line-height: 1.45;
  color: #1f2933;

  strong {
    display: block;
    color: #0d1117;
    margin-bottom: 0.15rem;
  }
}

.qmodal__submit {
  background: #16c784;
  color: #0d1117;
  border: 0;
  border-radius: 0.85rem;
  padding: 0.95rem 1.25rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition: transform 120ms ease, background 160ms ease, opacity 160ms ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background: #0a9e68;
    color: #ffffff;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
}

.qmodal__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 2.5px solid rgba(13, 17, 23, 0.25);
  border-top-color: #0d1117;
  animation: qmodal-spin 0.8s linear infinite;
}

@keyframes qmodal-spin {
  to {
    transform: rotate(360deg);
  }
}

.qmodal__legal {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  color: #6b7280;
  text-align: center;
  margin: 0.5rem 0 0;
}

.qmodal-fade-enter-active,
.qmodal-fade-leave-active {
  transition: opacity 200ms ease;
}

.qmodal-fade-enter-from,
.qmodal-fade-leave-to {
  opacity: 0;
}
</style>

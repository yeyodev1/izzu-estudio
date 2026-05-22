<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trackCompleteRegistration, trackViewContent } from '@/utils/tracking'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ (e: 'close'): void }>()
const router = useRouter()

type Situacion = 'ya-construi' | 'dividir-terreno' | 'propiedad-horizontal' | 'desarrollador-urbano' | 'herencia'
type Inmueble = 'terreno-baldio' | 'casa' | 'edificio' | 'local' | 'terreno-rural'
type Valor = '-50k' | '50k-200k' | '+200k'

const situacion = ref<Situacion | ''>('')
const inmueble = ref<Inmueble | ''>('')
const valor = ref<Valor | ''>('')
const submitting = ref(false)

const isValid = computed(() => situacion.value !== '' && inmueble.value !== '' && valor.value !== '')

const SITUACION_LABEL: Record<string, string> = {
  'ya-construi': 'Ya construyó sin permisos — necesita regularizar edificación',
  'dividir-terreno': 'Quiere dividir terreno en lotes',
  'propiedad-horizontal': 'Necesita dividir edificio en departamentos/oficinas (Propiedad Horizontal)',
  'desarrollador-urbano': 'Desarrollador — proyecto urbanístico / entrega-recepción',
  'herencia': 'Herencia familiar — división legal entre herederos',
}
const INMUEBLE_LABEL: Record<string, string> = {
  'terreno-baldio': 'Terreno baldío / macrolote',
  'casa': 'Casa unifamiliar',
  'edificio': 'Edificio de departamentos / oficinas',
  'local': 'Local comercial / uso mixto',
  'terreno-rural': 'Terreno rural / finca',
}
const VALOR_LABEL: Record<string, string> = {
  '-50k': 'Menos de $50,000',
  '50k-200k': '$50,000 — $200,000',
  '+200k': 'Más de $200,000',
}

const calculaCalifica = (v: Valor | ''): boolean => v === '50k-200k' || v === '+200k'

const handleSubmit = async () => {
  if (!isValid.value || submitting.value) return
  submitting.value = true

  const leadRaw = localStorage.getItem('izzu_contact')
  if (!leadRaw) { submitting.value = false; return }
  let lead: { nombre: string; apellido: string; email: string; phone: string; country: string; eventId?: string }
  try { lead = JSON.parse(leadRaw) } catch { submitting.value = false; return }

  const califica = calculaCalifica(valor.value as Valor)
  const nombreFull = `${lead.nombre} ${lead.apellido}`.trim()
  const eventId = `${lead.eventId ?? 'lead'}_qual_${Date.now()}`

  const tags = [
    'paso-3-calificacion', 'izzu-diagnostico',
    califica ? 'lead-calificado' : 'lead-descalificado',
    `califica-${califica}`,
    `situacion-${situacion.value}`, `inmueble-${inmueble.value}`, `valor-${valor.value}`,
    `pais-${lead.country.toLowerCase()}`,
  ]

  const titulo = califica
    ? 'Lead CALIFICADO — listo para agendar diagnóstico'
    : 'Lead NO CALIFICA — descartado por valor del inmueble'
  const accion = califica
    ? 'Acción: Lead va al calendario GHL para reservar día/hora.'
    : 'Acción: No contactar. Caso fuera de alcance económico.'

  const nota = [
    titulo, '',
    'Paso 3 / 3 — Calificación completa',
    califica ? 'Estado: Lead aprobado' : 'Estado: Lead descalificado · Cooldown 24h',
    `califica: ${califica}`, '',
    `Nombre: ${nombreFull}`,
    `Email: ${lead.email}`,
    `WhatsApp: ${lead.phone}`,
    `País: ${lead.country}`, '',
    'Respuestas de calificación:',
    `  * Situación: ${SITUACION_LABEL[situacion.value]}`,
    `  * Inmueble: ${INMUEBLE_LABEL[inmueble.value]}`,
    `  * Valor estimado: ${VALOR_LABEL[valor.value]}`, '',
    'Vio video VSL (2 min mínimo) · Respondió 3 preguntas',
    `Event ID: ${eventId}`,
    `Timestamp: ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
    '', accion,
  ].join('\n')

  try {
    await fetch(import.meta.env.VITE_WEBHOOK_CALIFICACION, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead, nombreCompleto: nombreFull,
        situacion: situacion.value, situacionLabel: SITUACION_LABEL[situacion.value],
        inmueble: inmueble.value, inmuebleLabel: INMUEBLE_LABEL[inmueble.value],
        valor: valor.value, valorLabel: VALOR_LABEL[valor.value],
        califica, calificaTexto: String(califica), califica_bool: califica, qualifies: califica,
        timestamp: new Date().toISOString(),
        source: 'izzu-estudio-web', step: 3, stepName: 'calificacion',
        estado: califica ? 'lead-calificado' : 'lead-descalificado',
        event_id: eventId, tags, etiquetas: tags.join(', '),
        nota, notas: nota, note: nota, notes: nota,
      }),
    })
  } catch { /* ignore */ }

  trackCompleteRegistration({
    eventId,
    user: {
      email: lead.email, phone: lead.phone,
      firstName: lead.nombre, lastName: lead.apellido,
      country: lead.country, externalId: lead.email,
    },
    custom: {
      content_name: califica ? 'IZZU - Calificado' : 'IZZU - Descalificado',
      content_category: califica ? 'diagnostico-calificado' : 'diagnostico-descalificado',
      califica, situacion: situacion.value, inmueble: inmueble.value, valor: valor.value,
    },
  })

  submitting.value = false
  emit('close')

  if (califica) {
    localStorage.setItem('izzu_qualified', '1')
    router.push({ name: 'booking' })
  } else {
    localStorage.setItem('izzu_disq_at', String(Date.now()))
    localStorage.removeItem('izzu_qualified')
    router.push({ name: 'thanks' })
  }
}

const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && props.open) emit('close') }

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) trackViewContent({ custom: { content_name: 'IZZU - Calificación abierta', content_category: 'calificacion' } })
})

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="qmodal-fade">
      <div v-if="open" class="qmodal-overlay" role="dialog" aria-modal="true" aria-labelledby="qmodal-title" @click.self="emit('close')">
        <div class="qmodal">

          <button class="qmodal__close" type="button" @click="emit('close')" aria-label="Cerrar">
            <i class="fa-solid fa-xmark" />
          </button>

          <span class="qmodal__step">Paso 3 de 3 · Calificación</span>
          <h2 id="qmodal-title" class="qmodal__title">Cuéntanos sobre tu propiedad</h2>
          <p class="qmodal__sub">3 preguntas rápidas para preparar tu diagnóstico personalizado.</p>

          <form class="qmodal__form" @submit.prevent="handleSubmit" novalidate>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend>1. ¿Cuál es tu situación actual?</legend>
              <label class="qmodal__option">
                <input v-model="situacion" type="radio" value="ya-construi" />
                <i class="fa-solid fa-house-chimney-window" />
                <span><strong>Ya construí sin permisos</strong> y necesito regularizar mi edificación.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="situacion" type="radio" value="dividir-terreno" />
                <i class="fa-solid fa-draw-polygon" />
                <span><strong>Quiero dividir un terreno</strong> en lotes para vender o desarrollar.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="situacion" type="radio" value="propiedad-horizontal" />
                <i class="fa-solid fa-building" />
                <span><strong>Necesito dividir un edificio</strong> en departamentos u oficinas.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="situacion" type="radio" value="desarrollador-urbano" />
                <i class="fa-solid fa-city" />
                <span><strong>Soy desarrollador</strong> y necesito aprobación urbanística o entrega-recepción.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="situacion" type="radio" value="herencia" />
                <i class="fa-solid fa-people-arrows" />
                <span><strong>Es una herencia familiar</strong> que requiere división legal.</span>
              </label>
            </fieldset>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend>2. ¿Qué tipo de inmueble tienes?</legend>
              <label class="qmodal__option">
                <input v-model="inmueble" type="radio" value="terreno-baldio" />
                <i class="fa-solid fa-mountain-sun" />
                <span><strong>Terreno baldío / macrolote</strong> sin construcción.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="inmueble" type="radio" value="casa" />
                <i class="fa-solid fa-house" />
                <span><strong>Casa unifamiliar</strong> con o sin ampliaciones.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="inmueble" type="radio" value="edificio" />
                <i class="fa-solid fa-warehouse" />
                <span><strong>Edificio de departamentos / oficinas</strong> con múltiples unidades.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="inmueble" type="radio" value="local" />
                <i class="fa-solid fa-store" />
                <span><strong>Local comercial</strong> o uso mixto.</span>
              </label>
              <label class="qmodal__option">
                <input v-model="inmueble" type="radio" value="terreno-rural" />
                <i class="fa-solid fa-tractor" />
                <span><strong>Terreno rural</strong> o finca.</span>
              </label>
            </fieldset>

            <fieldset class="qmodal__field" :disabled="submitting">
              <legend>3. ¿Valor estimado de tu propiedad?</legend>
              <div class="qmodal__chips">
                <label class="qmodal__chip" :class="{ active: valor === '-50k' }">
                  <input v-model="valor" type="radio" value="-50k" />
                  <i class="fa-solid fa-coin" />
                  <span>Menos de $50,000</span>
                </label>
                <label class="qmodal__chip" :class="{ active: valor === '50k-200k' }">
                  <input v-model="valor" type="radio" value="50k-200k" />
                  <i class="fa-solid fa-sack-dollar" />
                  <span>$50,000 — $200,000</span>
                </label>
                <label class="qmodal__chip" :class="{ active: valor === '+200k' }">
                  <input v-model="valor" type="radio" value="+200k" />
                  <i class="fa-solid fa-gem" />
                  <span>Más de $200,000</span>
                </label>
              </div>
            </fieldset>

            <button class="qmodal__submit" type="submit" :disabled="!isValid || submitting">
              <i v-if="submitting" class="fa-solid fa-spinner qmodal__spin" />
              <i v-else class="fa-solid fa-arrow-right" />
              {{ submitting ? 'Enviando…' : 'CONFIRMAR Y AGENDAR' }}
            </button>

            <p class="qmodal__legal">Sin compromiso. Si tu caso encaja con nuestros servicios, podrás reservar tu sesión de 20 minutos.</p>
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

.qmodal-overlay {
  position: fixed; inset: 0; z-index: 9000;
  background: rgba(13, 17, 23, 0.78);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  display: flex; align-items: center; justify-content: center;
  padding: 1rem; overflow-y: auto;
}

.qmodal {
  position: relative;
  width: 100%; max-width: 640px;
  background: #ffffff; color: $dark;
  border: 1px solid rgba(196, 149, 106, 0.25);
  border-radius: 1.5rem; padding: 2.25rem 1.5rem 1.75rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
  max-height: 92vh; overflow-y: auto;

  @media (min-width: 560px) { padding: 2.5rem 2rem; }
}

.qmodal__close {
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

.qmodal__step {
  display: inline-flex; align-items: center;
  background: rgba(27, 54, 93, 0.08); color: $primary;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.72rem; letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem; border-radius: 999px;
  text-transform: uppercase; margin-bottom: 0.85rem;
}

.qmodal__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.35rem, 3vw, 1.75rem);
  line-height: 1.18; margin: 0 0 0.35rem; color: $primary;
}

.qmodal__sub { color: #6b7280; font-size: 0.9rem; margin: 0 0 1.25rem; line-height: 1.55; }

.qmodal__form { display: flex; flex-direction: column; gap: 1.25rem; }

.qmodal__field {
  border: 0; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0.5rem;

  legend {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 0.95rem; font-weight: 700; color: $primary;
    margin-bottom: 0.3rem;
  }
}

.qmodal__option {
  display: flex; gap: 0.7rem; align-items: flex-start;
  padding: 0.75rem 0.85rem; border: 1.5px solid rgba(27, 54, 93, 0.1);
  border-radius: 0.75rem; cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;

  input { margin-top: 0.25rem; accent-color: $accent; flex-shrink: 0; }

  > i {
    margin-top: 0.15rem; font-size: 1rem; color: $accent; width: 1.2rem; text-align: center; flex-shrink: 0;
  }

  span {
    font-size: 0.85rem; line-height: 1.45; color: #4b5563; flex: 1;
    strong { display: block; color: $primary; margin-bottom: 0.05rem; }
  }

  &:hover { border-color: $accent; background: #f8f6f1; }
  &:has(input:checked) { border-color: $accent; background: #f8f6f1; box-shadow: 0 4px 14px rgba(196, 149, 106, 0.18); }
}

.qmodal__chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.qmodal__chip {
  display: inline-flex; align-items: center; gap: 0.45rem;
  padding: 0.6rem 1rem; border: 1.5px solid rgba(27, 54, 93, 0.1);
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.82rem; color: #4b5563; cursor: pointer;
  transition: all 160ms ease;
  input { position: absolute; opacity: 0; pointer-events: none; }
  i { font-size: 0.85rem; color: $accent; }
  &:hover { border-color: $accent; color: $primary; }
  &.active { border-color: $accent; background: #f8f6f1; color: $primary; box-shadow: 0 4px 14px rgba(196, 149, 106, 0.18); }
}

.qmodal__submit {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 1.05rem 1.4rem; border-radius: 0.85rem; border: 0;
  background: $primary; color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; box-shadow: 0 12px 30px rgba(27, 54, 93, 0.35);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease, color 160ms ease;

  &:hover:not(:disabled) { transform: translateY(-2px); background: $accent; color: $dark; box-shadow: 0 14px 36px rgba(196, 149, 106, 0.45); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.qmodal__spin { animation: qmodal-spin 0.8s linear infinite; }
@keyframes qmodal-spin { to { transform: rotate(360deg); } }

.qmodal__legal { font-size: 0.75rem; color: #9ca3af; text-align: center; margin: 0.25rem 0 0; }

.qmodal-fade-enter-active { transition: opacity 220ms ease;
  .qmodal { transition: opacity 220ms ease, transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1); }
}
.qmodal-fade-leave-active { transition: opacity 180ms ease;
  .qmodal { transition: opacity 180ms ease, transform 180ms ease; }
}
.qmodal-fade-enter-from { opacity: 0; .qmodal { opacity: 0; transform: scale(0.94) translateY(20px); } }
.qmodal-fade-leave-to   { opacity: 0; .qmodal { opacity: 0; transform: scale(0.97); } }
</style>

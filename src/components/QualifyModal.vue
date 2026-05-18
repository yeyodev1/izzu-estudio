<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { trackCompleteRegistration } from '@/utils/tracking'
import ContractModal from '@/components/ContractModal.vue'

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

type Step = 'video' | 'contract' | 'questions'
const step = ref<Step>('video')

type Situacion = 'ya-construi' | 'dividir-terreno' | 'propiedad-horizontal' | 'desarrollador-urbano' | 'herencia'
type Inmueble = 'terreno-baldio' | 'casa' | 'edificio' | 'local' | 'terreno-rural'
type Valor = '-50k' | '50k-200k' | '+200k'

const situacion = ref<Situacion | ''>('')
const inmueble = ref<Inmueble | ''>('')
const valor = ref<Valor | ''>('')
const submitting = ref(false)

const contractModalOpen = ref(false)

const isValid = computed(() => situacion.value !== '' && inmueble.value !== '' && valor.value !== '')

const wasVideoWatched = (): boolean => {
  try { return localStorage.getItem('izzu_video_watched') === '1' }
  catch { return false }
}

const reset = () => {
  step.value = wasVideoWatched() ? 'contract' : 'video'
  situacion.value = ''
  inmueble.value = ''
  valor.value = ''
  submitting.value = false
}

const goToContract = () => {
  step.value = 'contract'
}

const goToQuestions = () => {
  step.value = 'questions'
}

const openContractModal = () => {
  contractModalOpen.value = true
}

const onContractAccepted = () => {
  contractModalOpen.value = false
  goToQuestions()
}

watch(() => props.open, (v) => { if (v) reset() })

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open && !contractModalOpen.value) emit('close')
}

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => document.removeEventListener('keydown', onKey))

const SITUACION_LABEL: Record<string, string> = {
  'ya-construi': '🏚️ Ya construyó sin permisos — necesita regularizar edificación',
  'dividir-terreno': '🗺️ Quiere dividir terreno en lotes',
  'propiedad-horizontal': '🏢 Necesita dividir edificio en departamentos/oficinas (Propiedad Horizontal)',
  'desarrollador-urbano': '🏗️ Desarrollador — proyecto urbanístico / entrega-recepción',
  'herencia': '👨‍👩‍👧 Herencia familiar — división legal entre herederos',
}

const INMUEBLE_LABEL: Record<string, string> = {
  'terreno-baldio': '🟫 Terreno baldío / macrolote',
  'casa': '🏠 Casa unifamiliar',
  'edificio': '🏢 Edificio de departamentos / oficinas',
  'local': '🏪 Local comercial / uso mixto',
  'terreno-rural': '🌳 Terreno rural / finca',
}

const VALOR_LABEL: Record<string, string> = {
  '-50k': '💵 Menos de $50,000',
  '50k-200k': '💵 $50,000 — $200,000',
  '+200k': '💎 Más de $200,000',
}

// Regla de calificación: valor >= 50k. Caso bajo (<50k) descalifica.
const calculaCalifica = (val: Valor | ''): boolean => val === '50k-200k' || val === '+200k'

const sendQualificationWebhook = async (califica: boolean) => {
  const url = import.meta.env.VITE_WEBHOOK_CALIFICACION
  if (!url || !props.lead) return

  const baseTags = [
    'paso-3-calificacion',
    'izzu-diagnostico',
    califica ? 'lead-calificado' : 'lead-descalificado',
    `califica-${califica}`,
    `situacion-${situacion.value}`,
    `inmueble-${inmueble.value}`,
    `valor-${valor.value}`,
    `pais-${props.lead.country.toLowerCase()}`,
  ]

  const nombreFull = `${props.lead.nombre} ${props.lead.apellido}`.trim()

  const tituloNota = califica
    ? '✅ *Lead CALIFICADO — listo para agendar diagnóstico*'
    : '⛔ *Lead NO CALIFICA — descartado por valor del inmueble*'
  const estadoNota = califica
    ? '🎯 *Estado:* Lead aprobado · Coordinar llamada de 20 min'
    : '🚫 *Estado:* Lead descalificado · Cooldown 24h activado'
  const accionNota = califica
    ? '🚀 *Acción:* Contactar por WhatsApp para coordinar día/hora de diagnóstico técnico-legal gratuito (20 min).'
    : '🛑 *Acción:* No contactar. Caso fuera de alcance económico. Considerar nurturing por Instagram (@izzuestudio).'

  const nota = [
    tituloNota,
    '',
    '📍 *Paso 3 / 3* — Calificación completa',
    estadoNota,
    `🏷️ *califica:* ${califica ? 'true ✅' : 'false ❌'}`,
    '',
    `👤 *Nombre:* ${nombreFull}`,
    `✉️ *Email:* ${props.lead.email}`,
    `📱 *WhatsApp:* ${props.lead.phone}`,
    `🌎 *País:* ${props.lead.country}`,
    '',
    '📋 *Respuestas de calificación:*',
    `  • *Situación:* ${SITUACION_LABEL[situacion.value] ?? situacion.value}`,
    `  • *Inmueble:* ${INMUEBLE_LABEL[inmueble.value] ?? inmueble.value}`,
    `  • *Valor estimado:* ${VALOR_LABEL[valor.value] ?? valor.value}`,
    '',
    '🎬 Vio video VSL · 📝 Aceptó términos · ✏️ Respondió 3 preguntas',
    '',
    `🆔 *Event ID:* ${props.lead.eventId}_qual`,
    `🕒 *Timestamp:* ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
    '',
    accionNota,
  ].join('\n')

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...props.lead,
        nombreCompleto: nombreFull,
        situacion: situacion.value,
        situacionLabel: SITUACION_LABEL[situacion.value] ?? situacion.value,
        inmueble: inmueble.value,
        inmuebleLabel: INMUEBLE_LABEL[inmueble.value] ?? inmueble.value,
        valor: valor.value,
        valorLabel: VALOR_LABEL[valor.value] ?? valor.value,
        califica,
        calificaTexto: califica ? 'true' : 'false',
        califica_bool: califica,
        qualifies: califica,
        timestamp: new Date().toISOString(),
        source: 'izzu-estudio-web',
        step: 3,
        stepName: 'calificacion',
        estado: califica ? 'lead-calificado' : 'lead-descalificado',
        tags: baseTags,
        etiquetas: baseTags.join(', '),
        nota,
        notas: nota,
        note: nota,
      }),
    })
  } catch { /* tracking no debe romper UX */ }
}

const submit = async () => {
  if (!isValid.value || submitting.value) return
  submitting.value = true

  const califica = calculaCalifica(valor.value as Valor)

  await sendQualificationWebhook(califica)

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
        content_name: califica
          ? 'IZZU Estudio - Diagnóstico Calificado'
          : 'IZZU Estudio - Diagnóstico Descalificado',
        content_category: califica ? 'diagnostico-calificado' : 'diagnostico-descalificado',
        califica,
        situacion: situacion.value,
        inmueble: inmueble.value,
        valor: valor.value,
      },
    })
  }

  if (!califica) {
    try { localStorage.setItem('izzu_disq_at', String(Date.now())) } catch { /* ignore */ }
  }

  emit('close')
  router.push({ name: califica ? 'session-booked' : 'no-space' })
}
</script>

<template>
  <Teleport to="body">
    <Transition name="qmodal-fade">
      <div v-if="open" class="qmodal-overlay" role="dialog" aria-modal="true" aria-labelledby="qmodal-title" @click.self="contractModalOpen ? null : $emit('close')">
        <div class="qmodal">

          <!-- Progress -->
          <div class="qmodal__progress">
            <span class="qmodal__dot" :class="{ active: step === 'video', done: step !== 'video' }" />
            <span class="qmodal__bar" :class="{ filled: step !== 'video' }" />
            <span class="qmodal__dot" :class="{ active: step === 'contract', done: step === 'questions' }" />
            <span class="qmodal__bar" :class="{ filled: step === 'questions' }" />
            <span class="qmodal__dot" :class="{ active: step === 'questions' }" />
          </div>

          <!-- ── STEP 1: VIDEO ─────────────────────────────────── -->
          <template v-if="step === 'video'">
            <div class="qmodal__header">
              <span class="qmodal__eyebrow">Paso 1 de 3</span>
              <h2 id="qmodal-title">Conoce la metodología IZZU</h2>
              <p class="qmodal__subtitle">Mira este breve video para entender cómo podemos ayudarte a blindar tu patrimonio.</p>
            </div>

            <div class="qmodal__video">
              <wistia-player media-id="7le35zsekh" aspect="1.7777777777777777"></wistia-player>
            </div>

            <button class="qmodal__btn" type="button" @click="goToContract">
              Ya vi el video, continuar
              <i class="fa-solid fa-arrow-right" aria-hidden="true" />
            </button>
          </template>

          <!-- ── STEP 2: CONTRACT ──────────────────────────────── -->
          <template v-if="step === 'contract'">
            <div class="qmodal__header">
              <span class="qmodal__eyebrow">Paso 2 de 3</span>
              <h2 id="qmodal-title">Confirma tu interés</h2>
              <p class="qmodal__subtitle">Revisa y acepta los términos de nuestro diagnóstico para continuar con la calificación.</p>
            </div>

            <div class="qmodal__contract-card" role="button" tabindex="0" @click="openContractModal" @keydown.enter="openContractModal" @keydown.space.prevent="openContractModal">
              <div class="qmodal__contract-img-wrap">
                <img src="/izzu-thumbnail.png" alt="IZZU Estudio de Arquitectura - Acuerdo de diagnóstico" class="qmodal__contract-img" loading="eager" />
                <div class="qmodal__contract-overlay">
                  <i class="fa-solid fa-file-signature" aria-hidden="true" />
                  <span>Ver acuerdo de servicio</span>
                </div>
              </div>
              <div class="qmodal__contract-info">
                <h3>Acuerdo de Servicio Profesional</h3>
                <p>Al hacer clic aquí podrás leer y aceptar los términos del diagnóstico técnico-legal gratuito de IZZU Estudio de Arquitectura.</p>
                <span class="qmodal__contract-cta">
                  Leer y aceptar términos
                  <i class="fa-solid fa-arrow-right" aria-hidden="true" />
                </span>
              </div>
            </div>
          </template>

          <!-- ── STEP 3: QUESTIONS ─────────────────────────────── -->
          <template v-if="step === 'questions'">
            <button type="button" class="qmodal__back" @click="step = 'contract'" aria-label="Volver">
              <i class="fa-solid fa-arrow-left" aria-hidden="true" />
            </button>

            <div class="qmodal__header">
              <span class="qmodal__eyebrow">Paso 3 de 3</span>
              <h2 id="qmodal-title">Cuéntanos sobre tu propiedad</h2>
              <p class="qmodal__subtitle">Esto nos ayuda a preparar tu diagnóstico personalizado. Sin compromiso.</p>
            </div>

            <form class="qmodal__form" @submit.prevent="submit">
              <fieldset class="qmodal__field" :disabled="submitting">
                <legend class="qmodal__legend">1. ¿Cuál es tu situación actual?</legend>
                <label class="qmodal__option">
                  <input v-model="situacion" type="radio" value="ya-construi" />
                  <span class="qmodal__option-text"><strong>Ya construí sin permisos</strong> y necesito regularizar mi edificación.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="situacion" type="radio" value="dividir-terreno" />
                  <span class="qmodal__option-text"><strong>Quiero dividir un terreno</strong> en lotes más pequeños para vender o desarrollar.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="situacion" type="radio" value="propiedad-horizontal" />
                  <span class="qmodal__option-text"><strong>Necesito dividir un edificio</strong> en departamentos u oficinas (Propiedad Horizontal).</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="situacion" type="radio" value="desarrollador-urbano" />
                  <span class="qmodal__option-text"><strong>Soy desarrollador</strong> y necesito aprobación de proyecto urbanístico o entrega-recepción.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="situacion" type="radio" value="herencia" />
                  <span class="qmodal__option-text"><strong>Es una herencia familiar</strong> que necesita división legal para los herederos.</span>
                </label>
              </fieldset>

              <fieldset class="qmodal__field" :disabled="submitting">
                <legend class="qmodal__legend">2. ¿Qué tipo de inmueble tienes?</legend>
                <label class="qmodal__option">
                  <input v-model="inmueble" type="radio" value="terreno-baldio" />
                  <span class="qmodal__option-text"><strong>Terreno baldío / macrolote</strong> sin construcción.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="inmueble" type="radio" value="casa" />
                  <span class="qmodal__option-text"><strong>Casa unifamiliar</strong> con o sin ampliaciones.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="inmueble" type="radio" value="edificio" />
                  <span class="qmodal__option-text"><strong>Edificio de departamentos / oficinas</strong> con múltiples unidades.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="inmueble" type="radio" value="local" />
                  <span class="qmodal__option-text"><strong>Local comercial</strong> o espacio de uso mixto.</span>
                </label>
                <label class="qmodal__option">
                  <input v-model="inmueble" type="radio" value="terreno-rural" />
                  <span class="qmodal__option-text"><strong>Terreno rural</strong> o finca con vocación de división.</span>
                </label>
              </fieldset>

              <fieldset class="qmodal__field" :disabled="submitting">
                <legend class="qmodal__legend">3. ¿En qué rango estimas el valor de tu propiedad?</legend>
                <div class="qmodal__chips">
                  <label class="qmodal__chip" :class="{ active: valor === '-50k' }">
                    <input v-model="valor" type="radio" value="-50k" />
                    <span>Menos de $50,000</span>
                  </label>
                  <label class="qmodal__chip" :class="{ active: valor === '50k-200k' }">
                    <input v-model="valor" type="radio" value="50k-200k" />
                    <span>Entre $50,000 y $200,000</span>
                  </label>
                  <label class="qmodal__chip" :class="{ active: valor === '+200k' }">
                    <input v-model="valor" type="radio" value="+200k" />
                    <span>Más de $200,000</span>
                  </label>
                </div>
              </fieldset>

              <button type="submit" class="qmodal__btn qmodal__btn--submit" :disabled="!isValid || submitting">
                <span v-if="submitting" class="qmodal__spinner" aria-hidden="true" />
                <span v-else>
                  Agendar mi diagnóstico gratuito
                  <i class="fa-solid fa-arrow-right" aria-hidden="true" />
                </span>
              </button>

              <p class="qmodal__legal">Sin compromiso. Si tu caso encaja con nuestros servicios, te agendaremos una sesión de 20 minutos.</p>
            </form>
          </template>

        </div>

        <ContractModal :open="contractModalOpen" @close="contractModalOpen = false" @accepted="onContractAccepted" />
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
  max-width: 640px;
  background: #ffffff;
  color: #0D1117;
  border-radius: 1.25rem;
  padding: 2.25rem 1.75rem 1.75rem;
  box-shadow: 0 32px 80px rgba(0, 0, 0, 0.35);
  max-height: 90vh;
  overflow-y: auto;

  @media (min-width: 640px) {
    padding: 2.5rem 2.25rem 2rem;
  }
}

.qmodal__progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 1.75rem;
}

.qmodal__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e5e9ec;
  flex-shrink: 0;
  transition: background 0.3s ease, transform 0.3s ease;

  &.active {
    background: #1B365D;
    transform: scale(1.3);
  }

  &.done {
    background: #C4956A;
  }
}

.qmodal__bar {
  width: 60px;
  height: 2px;
  background: #e5e9ec;
  flex-shrink: 0;
  transition: background 0.3s ease;

  @media (min-width: 480px) { width: 100px; }

  &.filled {
    background: #C4956A;
  }
}

.qmodal__header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.qmodal__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.72rem;
  font-weight: 600;
  color: #C4956A;
  margin: 0 0 0.5rem;
  display: block;
  font-family: 'Space Grotesk', system-ui, sans-serif;
}

.qmodal__header h2 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.35rem, 3vw, 1.75rem);
  line-height: 1.15;
  margin: 0 0 0.75rem;
  color: #1B365D;
}

.qmodal__subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #6b7280;
  margin: 0;
}

.qmodal__video {
  border-radius: 1rem;
  overflow: hidden;
  margin-bottom: 1.5rem;
  box-shadow: 0 8px 24px rgba(13, 17, 23, 0.12);
  background: #1B365D;
  aspect-ratio: 16 / 9;

  wistia-player {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.qmodal__btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #1B365D;
  color: #ffffff;
  border: 0;
  border-radius: 0.85rem;
  padding: 1rem 1.5rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 120ms ease, background 160ms ease, box-shadow 200ms ease;
  box-shadow: 0 8px 24px rgba(27, 54, 93, 0.3);

  &:hover:not(:disabled) {
    background: #2a4a7a;
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(27, 54, 93, 0.4);
  }

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  i { font-size: 0.9rem; }
}

.qmodal__btn--submit {
  background: #C4956A;
  color: #0D1117;
  box-shadow: 0 8px 24px rgba(196, 149, 106, 0.35);

  &:hover:not(:disabled) {
    background: #A0784F;
    color: #ffffff;
    box-shadow: 0 12px 32px rgba(160, 120, 79, 0.4);
  }
}

.qmodal__back {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 0;
  background: rgba(13, 17, 23, 0.06);
  color: #0D1117;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 160ms ease;

  &:hover { background: rgba(13, 17, 23, 0.12); }
}

// ── CONTRACT CARD ──────────────────────────────────────────────
.qmodal__contract-card {
  cursor: pointer;
  border-radius: 1.25rem;
  overflow: hidden;
  background: #ffffff;
  border: 2px solid rgba(27, 54, 93, 0.1);
  transition: border-color 200ms ease, box-shadow 200ms ease;
  outline: none;

  &:hover, &:focus-visible {
    border-color: #C4956A;
    box-shadow: 0 8px 28px rgba(196, 149, 106, 0.2);
  }
}

.qmodal__contract-img-wrap {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: #F5F7FA;
}

.qmodal__contract-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 300ms ease;

  .qmodal__contract-card:hover & { transform: scale(1.03); }
}

.qmodal__contract-overlay {
  position: absolute;
  inset: 0;
  background: rgba(27, 54, 93, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #ffffff;
  opacity: 0;
  transition: opacity 250ms ease;

  i {
    font-size: 2.2rem;
    color: #C4956A;
  }

  span {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1rem;
    letter-spacing: 0.04em;
  }

  .qmodal__contract-card:hover &,
  .qmodal__contract-card:focus-visible & {
    opacity: 1;
  }
}

.qmodal__contract-info {
  padding: 1.25rem 1.25rem 1.5rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    margin: 0 0 0.4rem;
    color: #1B365D;
  }

  p {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.85rem;
    color: #6b7280;
    line-height: 1.5;
    margin: 0 0 1rem;
  }
}

.qmodal__contract-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  color: #C4956A;
  transition: gap 200ms ease;

  .qmodal__contract-card:hover & { gap: 0.75rem; }

  i { font-size: 0.8rem; }
}

// ── FORM (step 3) ──────────────────────────────────────────────
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
  color: #1B365D;
  margin-bottom: 0.25rem;
  line-height: 1.35;
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

  input { margin-top: 0.2rem; accent-color: #C4956A; }

  &:hover {
    border-color: #C4956A;
    background: #F5F7FA;
  }

  &:has(input:checked) {
    border-color: #C4956A;
    background: #F5F7FA;
  }
}

.qmodal__option-text {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.9rem;
  line-height: 1.45;
  color: #4b5563;

  strong {
    display: block;
    color: #1B365D;
    margin-bottom: 0.1rem;
  }
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
  padding: 0.65rem 1.1rem;
  border: 1.5px solid #e5e9ec;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  color: #4b5563;
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease, color 160ms ease;

  input { position: absolute; opacity: 0; pointer-events: none; }

  &:hover { border-color: #C4956A; color: #A0784F; }

  &.active {
    border-color: #C4956A;
    background: #F5F7FA;
    color: #1B365D;
  }
}

.qmodal__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: 50%;
  border: 2.5px solid rgba(255,255,255,0.25);
  border-top-color: #ffffff;
  animation: qmodal-spin 0.8s linear infinite;
}

@keyframes qmodal-spin { to { transform: rotate(360deg); } }

.qmodal__legal {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  color: #9ca3af;
  text-align: center;
  margin: 0.5rem 0 0;
}

.qmodal-fade-enter-active,
.qmodal-fade-leave-active { transition: opacity 200ms ease; }
.qmodal-fade-enter-from,
.qmodal-fade-leave-to { opacity: 0; }
</style>

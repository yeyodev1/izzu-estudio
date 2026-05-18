<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IzzuHeader from '@/components/IzzuHeader.vue'
import UrgencyBar from '@/components/UrgencyBar.vue'
import { trackCompleteRegistration, trackViewContent } from '@/utils/tracking'

const router = useRouter()

const LOCK_MS = 2 * 60 * 1000
const STORAGE_KEY = 'izzu_video_start'

interface StoredLead {
  nombre: string; apellido: string; email: string; phone: string; country: string; eventId?: string
}

const lead = ref<StoredLead | null>(null)
const now = ref(Date.now())
const startedAt = ref<number>(0)
let timerId: ReturnType<typeof setInterval> | null = null

const elapsed = computed(() => Math.max(0, now.value - startedAt.value))
const remaining = computed(() => Math.max(0, LOCK_MS - elapsed.value))
const unlocked = computed(() => remaining.value <= 0)
const progress = computed(() => Math.min(100, (elapsed.value / LOCK_MS) * 100))

const mmss = computed(() => {
  const total = Math.ceil(remaining.value / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
})

// ── Qualification form ──────────────────────────────────────────
type Situacion = 'ya-construi' | 'dividir-terreno' | 'propiedad-horizontal' | 'desarrollador-urbano' | 'herencia'
type Inmueble = 'terreno-baldio' | 'casa' | 'edificio' | 'local' | 'terreno-rural'
type Valor = '-50k' | '50k-200k' | '+200k'

const situacion = ref<Situacion | ''>('')
const inmueble = ref<Inmueble | ''>('')
const valor = ref<Valor | ''>('')
const submitting = ref(false)
const showForm = ref(false)

const isValid = computed(() => situacion.value !== '' && inmueble.value !== '' && valor.value !== '')

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

const calculaCalifica = (v: Valor | ''): boolean => v === '50k-200k' || v === '+200k'

const unlockAndShowForm = () => {
  if (!unlocked.value) return
  showForm.value = true
  trackViewContent({ custom: { content_name: 'IZZU - Calificación abierta', content_category: 'calificacion' } })
}

const submit = async () => {
  if (!isValid.value || submitting.value || !lead.value) return
  submitting.value = true

  const califica = calculaCalifica(valor.value as Valor)
  const nombreFull = `${lead.value.nombre} ${lead.value.apellido}`.trim()
  const eventId = `${lead.value.eventId ?? 'lead'}_qual_${Date.now()}`

  const tags = [
    'paso-3-calificacion', 'izzu-diagnostico',
    califica ? 'lead-calificado' : 'lead-descalificado',
    `califica-${califica}`,
    `situacion-${situacion.value}`, `inmueble-${inmueble.value}`, `valor-${valor.value}`,
    `pais-${lead.value.country.toLowerCase()}`,
  ]

  const titulo = califica
    ? '✅ *Lead CALIFICADO — listo para agendar diagnóstico*'
    : '⛔ *Lead NO CALIFICA — descartado por valor del inmueble*'
  const accion = califica
    ? '🚀 *Acción:* Lead va al calendario GHL para reservar día/hora.'
    : '🛑 *Acción:* No contactar. Caso fuera de alcance económico.'

  const nota = [
    titulo, '',
    '📍 *Paso 3 / 3* — Calificación completa',
    califica ? '🎯 *Estado:* Lead aprobado' : '🚫 *Estado:* Lead descalificado · Cooldown 24h',
    `🏷️ *califica:* ${califica ? 'true ✅' : 'false ❌'}`, '',
    `👤 *Nombre:* ${nombreFull}`,
    `✉️ *Email:* ${lead.value.email}`,
    `📱 *WhatsApp:* ${lead.value.phone}`,
    `🌎 *País:* ${lead.value.country}`, '',
    '📋 *Respuestas de calificación:*',
    `  • *Situación:* ${SITUACION_LABEL[situacion.value]}`,
    `  • *Inmueble:* ${INMUEBLE_LABEL[inmueble.value]}`,
    `  • *Valor estimado:* ${VALOR_LABEL[valor.value]}`, '',
    '🎬 Vio video VSL (2 min mínimo) · ✏️ Respondió 3 preguntas',
    `🆔 *Event ID:* ${eventId}`,
    `🕒 *Timestamp:* ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
    '', accion,
  ].join('\n')

  try {
    await fetch(import.meta.env.VITE_WEBHOOK_CALIFICACION, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...lead.value, nombreCompleto: nombreFull,
        situacion: situacion.value, situacionLabel: SITUACION_LABEL[situacion.value],
        inmueble: inmueble.value, inmuebleLabel: INMUEBLE_LABEL[inmueble.value],
        valor: valor.value, valorLabel: VALOR_LABEL[valor.value],
        califica, calificaTexto: String(califica), califica_bool: califica, qualifies: califica,
        timestamp: new Date().toISOString(),
        source: 'izzu-estudio-web', step: 3, stepName: 'calificacion',
        estado: califica ? 'lead-calificado' : 'lead-descalificado',
        event_id: eventId, tags, etiquetas: tags.join(', '),
        nota, notas: nota, note: nota,
      }),
    })
  } catch { /* ignore */ }

  trackCompleteRegistration({
    eventId,
    user: {
      email: lead.value.email, phone: lead.value.phone,
      firstName: lead.value.nombre, lastName: lead.value.apellido,
      country: lead.value.country, externalId: lead.value.email,
    },
    custom: {
      content_name: califica ? 'IZZU - Calificado' : 'IZZU - Descalificado',
      content_category: califica ? 'diagnostico-calificado' : 'diagnostico-descalificado',
      califica, situacion: situacion.value, inmueble: inmueble.value, valor: valor.value,
    },
  })

  if (califica) {
    localStorage.setItem('izzu_qualified', '1')
    router.push({ name: 'booking' })
  } else {
    localStorage.setItem('izzu_disq_at', String(Date.now()))
    router.push({ name: 'thanks' })
  }
}

onMounted(() => {
  const raw = localStorage.getItem('izzu_contact')
  if (!raw) { router.replace({ name: 'registration' }); return }
  try { lead.value = JSON.parse(raw) } catch { router.replace({ name: 'registration' }); return }

  const stored = Number(localStorage.getItem(STORAGE_KEY) ?? '0')
  if (!stored) {
    startedAt.value = Date.now()
    localStorage.setItem(STORAGE_KEY, String(startedAt.value))
  } else {
    startedAt.value = stored
  }
  now.value = Date.now()
  timerId = setInterval(() => { now.value = Date.now() }, 500)
})

onBeforeUnmount(() => { if (timerId) clearInterval(timerId) })

const scrollToQualify = () => {
  document.getElementById('izzu-qualify')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <UrgencyBar @cta="scrollToQualify" />
  <IzzuHeader variant="dark" />

  <main class="izvid">

    <section class="izvid__progress">
      <div class="izvid__progress-inner">
        <span class="izvid__step done"><i class="fa-solid fa-check" /></span>
        <span class="izvid__progress-line filled" />
        <span class="izvid__step active">2</span>
        <span class="izvid__progress-line" />
        <span class="izvid__step">3</span>
      </div>
      <p class="izvid__progress-label">Paso 2 de 3 — Mira el video y completa la calificación</p>
    </section>

    <section class="izvid__hero">
      <span class="izvid__eyebrow">
        <i class="fa-solid fa-circle-play" />
        Video diagnóstico · {{ Math.floor(LOCK_MS / 60000) }} minutos
      </span>
      <h1 class="izvid__title">
        Antes de agendar tu sesión, <span>mira esto completo</span>
      </h1>
      <p class="izvid__sub">
        Te explicamos cómo opera IZZU en regularización y blindaje patrimonial. Después del video se
        habilita la calificación.
      </p>

      <div class="izvid__player">
        <wistia-player media-id="7le35zsekh" aspect="1.7777777777777777"></wistia-player>
      </div>

      <div class="izvid__lock" :class="{ 'izvid__lock--unlocked': unlocked }">
        <div class="izvid__lock-meter">
          <div class="izvid__lock-fill" :style="{ width: progress + '%' }"></div>
        </div>
        <p v-if="!unlocked" class="izvid__lock-label">
          <i class="fa-solid fa-lock" />
          Calificación bloqueada — disponible en
          <strong>{{ mmss }}</strong>
        </p>
        <p v-else class="izvid__lock-label izvid__lock-label--ok">
          <i class="fa-solid fa-lock-open" />
          ¡Listo! Ya puedes continuar a la calificación.
        </p>

        <button
          class="izvid__cta"
          type="button"
          :disabled="!unlocked"
          :class="{ 'izvid__cta--locked': !unlocked }"
          @click="unlockAndShowForm"
        >
          <i v-if="!unlocked" class="fa-solid fa-hourglass-half" />
          <i v-else class="fa-solid fa-arrow-right" />
          {{ unlocked ? 'Continuar a la calificación' : `Espera ${mmss}` }}
        </button>
      </div>
    </section>

    <section v-if="showForm" id="izzu-qualify" class="izvid__qualify">
      <div class="izvid__qualify-inner">
        <span class="izvid__qualify-step">Paso 3 de 3 · Calificación</span>
        <h2>Cuéntanos sobre tu propiedad</h2>
        <p class="izvid__qualify-sub">3 preguntas rápidas para preparar tu diagnóstico personalizado.</p>

        <form class="izvid__form" @submit.prevent="submit">

          <fieldset class="izvid__field" :disabled="submitting">
            <legend>1. ¿Cuál es tu situación actual?</legend>
            <label class="izvid__option"><input v-model="situacion" type="radio" value="ya-construi" /><span><strong>Ya construí sin permisos</strong> y necesito regularizar mi edificación.</span></label>
            <label class="izvid__option"><input v-model="situacion" type="radio" value="dividir-terreno" /><span><strong>Quiero dividir un terreno</strong> en lotes para vender o desarrollar.</span></label>
            <label class="izvid__option"><input v-model="situacion" type="radio" value="propiedad-horizontal" /><span><strong>Necesito dividir un edificio</strong> en departamentos u oficinas.</span></label>
            <label class="izvid__option"><input v-model="situacion" type="radio" value="desarrollador-urbano" /><span><strong>Soy desarrollador</strong> y necesito aprobación urbanística o entrega-recepción.</span></label>
            <label class="izvid__option"><input v-model="situacion" type="radio" value="herencia" /><span><strong>Es una herencia familiar</strong> que requiere división legal.</span></label>
          </fieldset>

          <fieldset class="izvid__field" :disabled="submitting">
            <legend>2. ¿Qué tipo de inmueble tienes?</legend>
            <label class="izvid__option"><input v-model="inmueble" type="radio" value="terreno-baldio" /><span><strong>Terreno baldío / macrolote</strong> sin construcción.</span></label>
            <label class="izvid__option"><input v-model="inmueble" type="radio" value="casa" /><span><strong>Casa unifamiliar</strong> con o sin ampliaciones.</span></label>
            <label class="izvid__option"><input v-model="inmueble" type="radio" value="edificio" /><span><strong>Edificio de departamentos / oficinas</strong> con múltiples unidades.</span></label>
            <label class="izvid__option"><input v-model="inmueble" type="radio" value="local" /><span><strong>Local comercial</strong> o uso mixto.</span></label>
            <label class="izvid__option"><input v-model="inmueble" type="radio" value="terreno-rural" /><span><strong>Terreno rural</strong> o finca.</span></label>
          </fieldset>

          <fieldset class="izvid__field" :disabled="submitting">
            <legend>3. ¿Valor estimado de tu propiedad?</legend>
            <div class="izvid__chips">
              <label class="izvid__chip" :class="{ active: valor === '-50k' }"><input v-model="valor" type="radio" value="-50k" /><span>Menos de $50,000</span></label>
              <label class="izvid__chip" :class="{ active: valor === '50k-200k' }"><input v-model="valor" type="radio" value="50k-200k" /><span>$50,000 — $200,000</span></label>
              <label class="izvid__chip" :class="{ active: valor === '+200k' }"><input v-model="valor" type="radio" value="+200k" /><span>Más de $200,000</span></label>
            </div>
          </fieldset>

          <button type="submit" class="izvid__submit" :disabled="!isValid || submitting">
            <i v-if="submitting" class="fa-solid fa-spinner izvid__spin" />
            <i v-else class="fa-solid fa-arrow-right" />
            {{ submitting ? 'Enviando…' : 'CONFIRMAR Y AGENDAR' }}
          </button>

          <p class="izvid__legal">Sin compromiso. Si tu caso encaja con nuestros servicios, podrás reservar tu sesión de 20 minutos.</p>
        </form>
      </div>
    </section>

    <footer class="izvid__foot">
      <div class="izvid__foot-inner">
        <span>© IZZU Estudio de Arquitectura</span>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>
  </main>
</template>

<style lang="scss" scoped>
$primary: #1B365D;
$accent:  #C4956A;
$dark:    #0D1117;

.izvid {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #ffffff;
  background: linear-gradient(180deg, #0a0d12 0%, #16202d 100%);
  min-height: 100vh;
}

// ── PROGRESS ────────────────────────────────────────────────────
.izvid__progress { padding: 1.5rem 1rem 0; text-align: center; }
.izvid__progress-inner { display: inline-flex; align-items: center; gap: 0; max-width: 100%; }
.izvid__step {
  width: 1.85rem; height: 1.85rem; border-radius: 999px;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);
  font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800;
  display: grid; place-items: center; flex-shrink: 0; transition: all 200ms ease;
  &.active { background: $accent; color: $dark; box-shadow: 0 0 0 4px rgba(196, 149, 106, 0.18); }
  &.done   { background: $primary; color: $accent; }
}
.izvid__progress-line {
  width: 60px; height: 2px; background: rgba(255,255,255,0.12); flex-shrink: 0;
  &.filled { background: $accent; }
  @media (min-width: 480px) { width: 80px; }
}
.izvid__progress-label {
  margin: 0.65rem 0 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-size: 0.78rem; color: rgba(255,255,255,0.65);
  letter-spacing: 0.04em; text-transform: uppercase;
}

// ── HERO + PLAYER ──────────────────────────────────────────────
.izvid__hero {
  max-width: 880px; margin: 0 auto;
  padding: 2rem 1.25rem 3rem; text-align: center;
  display: flex; flex-direction: column; gap: 1rem; align-items: center;

  @media (min-width: 768px) { padding: 2.5rem 2rem 3.5rem; }
}

.izvid__eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(196, 149, 106, 0.14); color: $accent;
  border: 1px solid rgba(196, 149, 106, 0.3);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.74rem; letter-spacing: 0.08em;
  padding: 0.45rem 0.9rem; border-radius: 999px; text-transform: uppercase;
}

.izvid__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.6rem, 4.5vw, 2.4rem);
  line-height: 1.15; margin: 0; max-width: 720px;
  span { color: $accent; }
}

.izvid__sub { font-size: 0.95rem; color: #c8d2dd; max-width: 620px; line-height: 1.6; margin: 0; }

.izvid__player {
  width: 100%; max-width: 880px; aspect-ratio: 16 / 9;
  border-radius: 1rem; overflow: hidden;
  background: #000; border: 2px solid rgba(196, 149, 106, 0.3);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.55);
  margin: 0.5rem 0 0.25rem;
  wistia-player { width: 100%; height: 100%; display: block; }
}

// ── LOCK BUTTON ────────────────────────────────────────────────
.izvid__lock {
  width: 100%; max-width: 720px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem; padding: 1.25rem 1.25rem;
  display: flex; flex-direction: column; gap: 0.75rem; align-items: stretch;
  transition: border-color 240ms ease, background 240ms ease;

  &--unlocked {
    border-color: rgba(196, 149, 106, 0.5);
    background: rgba(196, 149, 106, 0.07);
  }
}

.izvid__lock-meter {
  width: 100%; height: 6px;
  background: rgba(255,255,255,0.08); border-radius: 999px; overflow: hidden;
}
.izvid__lock-fill {
  height: 100%;
  background: linear-gradient(90deg, $primary 0%, $accent 100%);
  transition: width 500ms linear;
}

.izvid__lock-label {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  margin: 0; font-size: 0.92rem; color: rgba(255,255,255,0.75);
  strong { color: $accent; font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800; font-variant-numeric: tabular-nums; }
  i { color: $accent; }

  &--ok {
    color: #86efac;
    i { color: #86efac; }
  }
}

.izvid__cta {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 1rem 1.4rem; border-radius: 0.85rem; border: 0;
  background: $accent; color: $dark;
  font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 800;
  font-size: 0.95rem; letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
  box-shadow: 0 12px 30px rgba(196, 149, 106, 0.4);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease, opacity 200ms ease;

  &:hover:not(:disabled) { transform: translateY(-2px); background: #fbbf24; box-shadow: 0 16px 40px rgba(251, 191, 36, 0.5); }
  &:disabled { cursor: not-allowed; }

  &--locked {
    background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.55);
    box-shadow: none;
    border: 1px dashed rgba(255,255,255,0.18);
  }
}

// ── QUALIFY FORM ────────────────────────────────────────────────
.izvid__qualify {
  background: #ffffff; color: $dark;
  padding: 3rem 1.25rem 4rem;
  border-top: 1px solid rgba(196, 149, 106, 0.18);

  @media (min-width: 768px) { padding: 4rem 2rem; }
}
.izvid__qualify-inner {
  max-width: 720px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 1rem;
}
.izvid__qualify-step {
  display: inline-block;
  background: rgba(27, 54, 93, 0.08); color: $primary;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.72rem; letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem; border-radius: 999px; text-transform: uppercase;
  align-self: flex-start;
}
.izvid__qualify h2 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.5rem, 3.5vw, 2rem);
  color: $primary; margin: 0; line-height: 1.18;
}
.izvid__qualify-sub { color: #6b7280; margin: 0 0 0.75rem; font-size: 0.95rem; line-height: 1.55; }

.izvid__form { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 0.5rem; }

.izvid__field {
  border: 0; padding: 0; margin: 0;
  display: flex; flex-direction: column; gap: 0.65rem;

  legend {
    font-family: 'Outfit', system-ui, sans-serif;
    font-size: 1rem; font-weight: 700; color: $primary;
    margin-bottom: 0.4rem; line-height: 1.35;
  }
}

.izvid__option {
  display: flex; gap: 0.85rem; align-items: flex-start;
  padding: 0.95rem 1.05rem; border: 1.5px solid rgba(27, 54, 93, 0.1);
  border-radius: 0.85rem; cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;

  input { margin-top: 0.2rem; accent-color: $accent; flex-shrink: 0; }

  span {
    font-size: 0.92rem; line-height: 1.5; color: #4b5563;
    strong { display: block; color: $primary; margin-bottom: 0.1rem; }
  }

  &:hover { border-color: $accent; background: #f8f6f1; }
  &:has(input:checked) { border-color: $accent; background: #f8f6f1; box-shadow: 0 4px 14px rgba(196, 149, 106, 0.18); }
}

.izvid__chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.izvid__chip {
  display: inline-flex; align-items: center;
  padding: 0.7rem 1.15rem; border: 1.5px solid rgba(27, 54, 93, 0.1);
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.85rem; color: #4b5563; cursor: pointer;
  transition: all 160ms ease;
  input { position: absolute; opacity: 0; pointer-events: none; }
  &:hover { border-color: $accent; color: $primary; }
  &.active { border-color: $accent; background: #f8f6f1; color: $primary; box-shadow: 0 4px 14px rgba(196, 149, 106, 0.18); }
}

.izvid__submit {
  width: 100%; display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  padding: 1.05rem 1.4rem; border-radius: 0.85rem; border: 0;
  background: $accent; color: $dark;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; box-shadow: 0 12px 30px rgba(196, 149, 106, 0.4);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease;

  &:hover:not(:disabled) { transform: translateY(-2px); background: #fbbf24; box-shadow: 0 16px 40px rgba(251, 191, 36, 0.55); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
}
.izvid__spin { animation: izvid-spin 0.8s linear infinite; }
@keyframes izvid-spin { to { transform: rotate(360deg); } }

.izvid__legal { font-size: 0.78rem; color: #9ca3af; text-align: center; margin: 0.5rem 0 0; line-height: 1.5; }

// ── FOOTER ──────────────────────────────────────────────────────
.izvid__foot {
  background: #06080c; border-top: 1px solid rgba(196, 149, 106, 0.15);
  padding: 1.5rem 1.25rem;
}
.izvid__foot-inner {
  max-width: 1200px; margin: 0 auto;
  display: flex; flex-direction: column; gap: 0.75rem; align-items: center; text-align: center;
  font-size: 0.8rem; color: #c8d2dd;
  @media (min-width: 640px) { flex-direction: row; justify-content: space-between; }
  nav { display: flex; gap: 1rem; }
  a { color: $accent; text-decoration: none; &:hover { text-decoration: underline; } }
}
</style>

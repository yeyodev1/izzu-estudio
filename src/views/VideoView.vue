<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IzzuHeader from '@/components/IzzuHeader.vue'
import UrgencyBar from '@/components/UrgencyBar.vue'
import QualifyModal from '@/components/QualifyModal.vue'

const router = useRouter()
const qualifyModalOpen = ref(false)

const isLocalhost = () => {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.endsWith('.local')
}
const LOCK_MS = isLocalhost() ? 3 * 1000 : 2 * 60 * 1000
const STORAGE_KEY = 'izzu_video_start'

const lead = ref<{ nombre: string; apellido: string; email: string; phone: string; country: string; eventId?: string } | null>(null)
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

const openQualify = () => {
  if (!unlocked.value) return
  qualifyModalOpen.value = true
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
</script>

<template>
  <UrgencyBar @cta="openQualify" />
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
          @click="openQualify"
        >
          <i v-if="!unlocked" class="fa-solid fa-hourglass-half" />
          <i v-else class="fa-solid fa-arrow-right" />
          {{ unlocked ? 'Continuar a la calificación' : `Espera ${mmss}` }}
        </button>
      </div>
    </section>

    <QualifyModal :open="qualifyModalOpen" @close="qualifyModalOpen = false" />

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

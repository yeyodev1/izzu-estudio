<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const STORAGE_KEY = 'izzu_urgency_start'
const SLOTS_KEY = 'izzu_slots_left'
const DURATION_MS = 6 * 60 * 60 * 1000
const INITIAL_SLOTS = 7
const MIN_SLOTS = 2

const emit = defineEmits<{ (e: 'cta'): void }>()

const now = ref(Date.now())
const startedAt = ref<number>(0)
const slots = ref<number>(INITIAL_SLOTS)

const remainingMs = computed(() => {
  if (!startedAt.value) return DURATION_MS
  return Math.max(0, startedAt.value + DURATION_MS - now.value)
})

const expired = computed(() => remainingMs.value <= 0)

const formatted = computed(() => {
  const total = Math.floor(remainingMs.value / 1000)
  const h = String(Math.floor(total / 3600)).padStart(2, '0')
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const s = String(total % 60).padStart(2, '0')
  return { h, m, s }
})

let timerId: ReturnType<typeof setInterval> | null = null
let slotsTimer: ReturnType<typeof setInterval> | null = null

const decaySlots = () => {
  if (slots.value <= MIN_SLOTS) return
  // 30% chance per tick to decrement, so it feels organic
  if (Math.random() < 0.32) {
    slots.value -= 1
    try { localStorage.setItem(SLOTS_KEY, String(slots.value)) } catch { /* ignore */ }
  }
}

onMounted(() => {
  const stored = Number(localStorage.getItem(STORAGE_KEY) ?? '0')
  if (!stored) {
    startedAt.value = Date.now()
    localStorage.setItem(STORAGE_KEY, String(startedAt.value))
  } else {
    startedAt.value = stored
  }

  const storedSlots = Number(localStorage.getItem(SLOTS_KEY) ?? '0')
  slots.value = storedSlots > 0 ? Math.max(MIN_SLOTS, storedSlots) : INITIAL_SLOTS
  try { localStorage.setItem(SLOTS_KEY, String(slots.value)) } catch { /* ignore */ }

  now.value = Date.now()
  timerId = setInterval(() => { now.value = Date.now() }, 1000)
  // Slot decay every 90–150 seconds for realism
  slotsTimer = setInterval(decaySlots, 95000)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
  if (slotsTimer) clearInterval(slotsTimer)
})
</script>

<template>
  <div class="urgency" :class="{ 'urgency--expired': expired }" role="status" aria-live="polite">
    <div class="urgency__inner">
      <span class="urgency__icon" aria-hidden="true">
        <i class="fa-solid fa-fire" />
      </span>

      <span class="urgency__msg">
        <template v-if="expired">
          <strong>ÚLTIMA OPORTUNIDAD —</strong> los últimos cupos cierran esta semana.
        </template>
        <template v-else>
          <strong>DEMANDA ALTA HOY:</strong> quedan
          <span class="urgency__slots">{{ slots }}</span>
          cupos de diagnóstico técnico-legal gratuito.
        </template>
      </span>

      <span class="urgency__clock" aria-label="Tiempo restante">
        <i class="fa-solid fa-stopwatch urgency__clock-i" aria-hidden="true" />
        <span class="urgency__digit">{{ formatted.h }}</span>
        <span class="urgency__sep">:</span>
        <span class="urgency__digit">{{ formatted.m }}</span>
        <span class="urgency__sep">:</span>
        <span class="urgency__digit">{{ formatted.s }}</span>
      </span>

      <button type="button" class="urgency__cta" @click="emit('cta')">
        <i class="fa-solid fa-bolt" aria-hidden="true" />
        Asegurar mi cupo
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.urgency {
  position: sticky;
  top: 0;
  z-index: 8500;
  background: linear-gradient(90deg, #7f1d1d 0%, #c4956a 28%, #1B365D 60%, #0D1117 100%);
  background-size: 240% 100%;
  animation: urgency-shift 7s ease-in-out infinite;
  color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  box-shadow: 0 8px 24px rgba(13, 17, 23, 0.35);
  border-bottom: 2px solid rgba(196, 149, 106, 0.4);
}

.urgency--expired {
  background: linear-gradient(90deg, #7f1d1d 0%, #b91c1c 50%, #7f1d1d 100%);
  animation: urgency-pulse 1.4s ease-in-out infinite;
}

.urgency__inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0.55rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.8rem;
  line-height: 1.25;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 1rem;
    font-size: 0.92rem;
    padding: 0.65rem 1.75rem;
  }
}

.urgency__icon {
  display: inline-grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.32);
  color: #fbbf24;
  animation: urgency-fire 1.2s ease-in-out infinite;
  font-size: 0.85rem;
  flex-shrink: 0;
  border: 1px solid rgba(251, 191, 36, 0.4);
}

.urgency__msg {
  letter-spacing: 0.01em;

  strong {
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #fbbf24;
    text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
  }
}

.urgency__slots {
  display: inline-grid;
  place-items: center;
  min-width: 1.6rem;
  height: 1.6rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #fbbf24;
  color: #7f1d1d;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.85rem;
  letter-spacing: 0;
  margin: 0 0.2rem;
  animation: urgency-slot-pulse 1.4s ease-in-out infinite;
  box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.25);
}

.urgency__clock {
  display: inline-flex;
  align-items: center;
  gap: 0.22rem;
  background: rgba(0, 0, 0, 0.4);
  padding: 0.35rem 0.7rem;
  border-radius: 0.55rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0.04em;
  border: 1px solid rgba(196, 149, 106, 0.45);
}

.urgency__clock-i {
  font-size: 0.78rem;
  color: #C4956A;
  margin-right: 0.3rem;
}

.urgency__digit {
  color: #fbbf24;
  min-width: 1.85ch;
  display: inline-block;
  text-align: center;
}

.urgency__sep {
  color: rgba(251, 191, 36, 0.55);
  animation: urgency-blink 1s steps(2, jump-none) infinite;
}

.urgency__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: #fbbf24;
  color: #7f1d1d;
  border: 0;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 6px 18px rgba(251, 191, 36, 0.45);
  transition: transform 140ms ease, background 160ms ease, color 160ms ease;
  animation: urgency-cta-pulse 1.6s ease-in-out infinite;

  &:hover {
    background: #ffffff;
    color: #b91c1c;
    transform: translateY(-1px);
  }

  i { font-size: 0.7rem; }

  @media (min-width: 768px) {
    font-size: 0.88rem;
    padding: 0.55rem 1.15rem;
  }
}

@keyframes urgency-slot-pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.25); transform: scale(1); }
  50% { box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.05); transform: scale(1.06); }
}

@keyframes urgency-cta-pulse {
  0%, 100% { box-shadow: 0 6px 18px rgba(251, 191, 36, 0.45); }
  50% { box-shadow: 0 6px 26px rgba(251, 191, 36, 0.85); }
}

@keyframes urgency-shift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes urgency-pulse {
  0%, 100% { box-shadow: 0 8px 24px rgba(127, 29, 29, 0.6); }
  50% { box-shadow: 0 10px 36px rgba(185, 28, 28, 0.85); }
}

@keyframes urgency-fire {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.18); }
}

@keyframes urgency-blink {
  0%, 60% { opacity: 1; }
  61%, 100% { opacity: 0.3; }
}

@media (prefers-reduced-motion: reduce) {
  .urgency, .urgency__icon, .urgency__sep, .urgency--expired, .urgency__slots, .urgency__cta {
    animation: none;
  }
}
</style>

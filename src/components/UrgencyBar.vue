<script setup lang="ts">
/**
 * UrgencyBar.vue
 *
 * Barra fija al top con cuenta regresiva de 6h para registro a la lista VIP.
 * Persistente: usa localStorage para que el contador no se reinicie al refrescar
 * — la urgencia es real, no truco visual.
 *
 * Cuando llega a 0, muestra "ÚLTIMA HORA" sin desaparecer (mantiene presión).
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const STORAGE_KEY = 'lpb_urgency_start'
const DURATION_MS = 6 * 60 * 60 * 1000 // 6 horas

const emit = defineEmits<{ (e: 'cta'): void }>()

const now = ref(Date.now())
const startedAt = ref<number>(0)

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

onMounted(() => {
  const stored = Number(localStorage.getItem(STORAGE_KEY) ?? '0')
  if (!stored) {
    startedAt.value = Date.now()
    localStorage.setItem(STORAGE_KEY, String(startedAt.value))
  } else {
    startedAt.value = stored
  }
  now.value = Date.now()
  timerId = setInterval(() => {
    now.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
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
          <strong>ÚLTIMA HORA:</strong> el descuento exclusivo se cierra hoy.
        </template>
        <template v-else>
          <strong>SOLO POR 6 HORAS:</strong> reserva tu cupo VIP y asegura tu código de descuento.
        </template>
      </span>
      <span class="urgency__clock" aria-label="Tiempo restante">
        <span class="urgency__digit">{{ formatted.h }}</span>
        <span class="urgency__sep">:</span>
        <span class="urgency__digit">{{ formatted.m }}</span>
        <span class="urgency__sep">:</span>
        <span class="urgency__digit">{{ formatted.s }}</span>
      </span>
      <button type="button" class="urgency__cta" @click="emit('cta')">
        Reservar mi cupo
        <i class="fa-solid fa-arrow-right" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.urgency {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 8500;
  background: linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #ea580c 100%);
  background-size: 200% 100%;
  animation: urgency-shift 6s ease-in-out infinite;
  color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.35);
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.urgency--expired {
  background: linear-gradient(90deg, #7f1d1d 0%, #991b1b 50%, #7f1d1d 100%);
  animation: urgency-pulse 1.6s ease-in-out infinite;
}

.urgency__inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.55rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  line-height: 1.25;
  text-align: center;
  justify-content: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    gap: 0.85rem;
    font-size: 0.92rem;
    padding: 0.65rem 1.5rem;
  }
}

.urgency__icon {
  display: inline-grid;
  place-items: center;
  width: 1.6rem;
  height: 1.6rem;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.2);
  color: #fde047;
  animation: urgency-fire 1.4s ease-in-out infinite;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.urgency__msg {
  white-space: normal;
  letter-spacing: 0.01em;

  strong {
    font-weight: 800;
    letter-spacing: 0.04em;
  }
}

.urgency__clock {
  display: inline-flex;
  align-items: center;
  gap: 0.18rem;
  background: rgba(0, 0, 0, 0.35);
  padding: 0.3rem 0.7rem;
  border-radius: 0.5rem;
  font-variant-numeric: tabular-nums;
  font-weight: 800;
  letter-spacing: 0.04em;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.urgency__digit {
  color: #fde047;
  min-width: 1.85ch;
  display: inline-block;
  text-align: center;
}

.urgency__sep {
  color: rgba(253, 224, 71, 0.65);
  animation: urgency-blink 1s steps(2, jump-none) infinite;
}

.urgency__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #fde047;
  color: #0d1117;
  border: 0;
  padding: 0.45rem 0.95rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.78rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  transition: transform 140ms ease, background 160ms ease, color 160ms ease;
  animation: urgency-cta-pulse 1.8s ease-in-out infinite;

  &:hover {
    background: #ffffff;
    color: #b91c1c;
    transform: translateY(-1px);
  }

  i {
    font-size: 0.7rem;
  }

  @media (min-width: 768px) {
    font-size: 0.85rem;
    padding: 0.5rem 1.1rem;
  }
}

@keyframes urgency-cta-pulse {
  0%,
  100% {
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
  }
  50% {
    box-shadow: 0 4px 22px rgba(253, 224, 71, 0.65);
  }
}

@keyframes urgency-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes urgency-pulse {
  0%,
  100% {
    box-shadow: 0 6px 20px rgba(127, 29, 29, 0.55);
  }
  50% {
    box-shadow: 0 8px 32px rgba(220, 38, 38, 0.7);
  }
}

@keyframes urgency-fire {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.12);
  }
}

@keyframes urgency-blink {
  0%,
  60% {
    opacity: 1;
  }
  61%,
  100% {
    opacity: 0.25;
  }
}

@media (prefers-reduced-motion: reduce) {
  .urgency,
  .urgency__icon,
  .urgency__sep,
  .urgency--expired {
    animation: none;
  }
}
</style>

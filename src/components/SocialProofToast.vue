<script setup lang="ts">
/**
 * SocialProofToast.vue
 *
 * Toast cíclico de prueba social: muestra propietarios que agendaron diagnóstico.
 * Nombres parcialmente anonimizados con bullets · ubicación general.
 * Ciclo: 5s visible + 2s gap = 7s total.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

interface ProofItem {
  name: string
  city: string
  ago: string
}

const items: ProofItem[] = [
  { name: 'Ca•••• R••••', city: 'Quito · Ecuador', ago: 'hace 3 min' },
  { name: 'Ma•••• P••••', city: 'Guayaquil · Ecuador', ago: 'hace 5 min' },
  { name: 'An•••• M•••', city: 'Bogotá · Colombia', ago: 'hace 7 min' },
  { name: 'Jo••• G••••', city: 'Lima · Perú', ago: 'hace 9 min' },
  { name: 'Pa•••• V•••', city: 'Cuenca · Ecuador', ago: 'hace 12 min' },
  { name: 'Ro••••• S••', city: 'Manta · Ecuador', ago: 'hace 14 min' },
  { name: 'Fe••••• L••', city: 'Madrid · España', ago: 'hace 17 min' },
  { name: 'Da•••• C••', city: 'Santiago · Chile', ago: 'hace 20 min' },
  { name: 'Lu••• E••••', city: 'CDMX · México', ago: 'hace 23 min' },
  { name: 'Ma••••• H••', city: 'Guayaquil · Ecuador', ago: 'hace 26 min' },
  { name: 'Ca••• T••••', city: 'Buenos Aires · Argentina', ago: 'hace 30 min' },
  { name: 'An•••• N••', city: 'Loja · Ecuador', ago: 'hace 34 min' },
]

const route = useRoute()
const visible = ref(false)
const idx = ref(0)
const current = ref<ProofItem>(items[0])

let cycleTimer: ReturnType<typeof setTimeout> | null = null

const showNext = () => {
  current.value = items[idx.value % items.length]
  idx.value += 1
  visible.value = true
  cycleTimer = setTimeout(() => {
    visible.value = false
    cycleTimer = setTimeout(showNext, 2000)
  }, 5000)
}

onMounted(() => {
  cycleTimer = setTimeout(showNext, 4000)
})

onBeforeUnmount(() => {
  if (cycleTimer) clearTimeout(cycleTimer)
})

const shouldShow = () => route.name === 'registration'
</script>

<template>
  <Transition name="proof-fade">
    <aside
      v-if="visible && shouldShow()"
      class="proof"
      role="status"
      aria-live="polite"
    >
      <span class="proof__icon" aria-hidden="true">
        <i class="fa-solid fa-check" />
      </span>
      <div class="proof__body">
        <p class="proof__line">
          <strong>{{ current.name }}</strong> agendó su diagnóstico
        </p>
        <p class="proof__meta">
          {{ current.city }} · {{ current.ago }}
        </p>
      </div>
    </aside>
  </Transition>
</template>

<style lang="scss" scoped>
.proof {
  position: fixed;
  bottom: 1.25rem;
  left: 1.25rem;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: #ffffff;
  color: #0d1117;
  border: 1px solid #e5e9ec;
  padding: 0.75rem 1rem;
  border-radius: 0.85rem;
  box-shadow: 0 14px 32px rgba(13, 17, 23, 0.16);
  z-index: 6000;
  max-width: calc(100vw - 2.5rem);
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.proof__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: #1B365D;
  color: #ffffff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  font-size: 0.85rem;
}

.proof__body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.proof__line {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.3;

  strong {
    font-weight: 700;
    color: #1B365D;
  }
}

.proof__meta {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
}

.proof-fade-enter-active,
.proof-fade-leave-active {
  transition: opacity 280ms ease, transform 280ms ease;
}

.proof-fade-enter-from,
.proof-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>

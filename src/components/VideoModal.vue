<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'cta'): void
}>()

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && props.open) emit('close')
}

const markWatched = () => {
  try { localStorage.setItem('izzu_video_watched', '1') } catch { /* ignore */ }
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
  if (val) markWatched()
})

onMounted(() => document.addEventListener('keydown', onKey))
onUnmounted(() => {
  document.removeEventListener('keydown', onKey)
  document.body.style.overflow = ''
})

const onCta = () => {
  markWatched()
  emit('cta')
}
</script>

<template>
  <Teleport to="body">
    <Transition name="vmodal-fade">
      <div v-if="open" class="vmodal-overlay" role="dialog" aria-modal="true" @click.self="emit('close')">
        <div class="vmodal">
          <button class="vmodal__close" type="button" @click="emit('close')" aria-label="Cerrar">
            <i class="fa-solid fa-xmark" aria-hidden="true" />
          </button>

          <div class="vmodal__head">
            <span class="vmodal__eyebrow">
              <i class="fa-solid fa-circle-play" aria-hidden="true" />
              Mira esto antes de agendar
            </span>
            <h2 class="vmodal__title">
              Lo que <span>el municipio</span> no te dice sobre tu propiedad
            </h2>
          </div>

          <div class="vmodal__video">
            <wistia-player media-id="7le35zsekh" aspect="1.7777777777777777"></wistia-player>
          </div>

          <button class="vmodal__cta" type="button" @click="onCta">
            <i class="fa-solid fa-calendar-check" aria-hidden="true" />
            Quiero mi diagnóstico gratuito
            <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>

          <p class="vmodal__legal">
            <i class="fa-solid fa-lock" aria-hidden="true" />
            Sesión de 20 minutos · 100% gratuita · Sin compromiso
          </p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.vmodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9500;
  background: rgba(13, 17, 23, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: grid;
  place-items: center;
  padding: 1rem;
  overflow-y: auto;
}

.vmodal {
  position: relative;
  width: 100%;
  max-width: 760px;
  background: linear-gradient(180deg, #0d1117 0%, #16202d 100%);
  color: #ffffff;
  border: 1px solid rgba(196, 149, 106, 0.25);
  border-radius: 1.5rem;
  padding: 2.5rem 1.5rem 1.75rem;
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @media (min-width: 768px) {
    padding: 2.75rem 2.5rem 2rem;
  }
}

.vmodal__close {
  position: absolute;
  top: 0.85rem;
  right: 0.85rem;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 0.9rem;
  transition: background 160ms ease, border-color 160ms ease;

  &:hover {
    background: rgba(196, 149, 106, 0.18);
    border-color: rgba(196, 149, 106, 0.45);
  }
}

.vmodal__head {
  text-align: center;
}

.vmodal__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(196, 149, 106, 0.14);
  color: #C4956A;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  margin-bottom: 0.85rem;
}

.vmodal__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.25rem, 3vw, 1.7rem);
  line-height: 1.18;
  margin: 0 0 0.25rem;
  color: #ffffff;

  span { color: #C4956A; }
}

.vmodal__video {
  border-radius: 1rem;
  overflow: hidden;
  background: #000;
  aspect-ratio: 16 / 9;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(196, 149, 106, 0.2);

  wistia-player {
    width: 100%;
    height: 100%;
    display: block;
  }
}

.vmodal__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  background: #C4956A;
  color: #0D1117;
  border: 0;
  border-radius: 0.95rem;
  padding: 1.05rem 1.4rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(196, 149, 106, 0.4);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease;
  animation: vmodal-pulse 1.8s ease-in-out infinite;

  &:hover {
    transform: translateY(-2px);
    background: #ffffff;
    box-shadow: 0 18px 38px rgba(196, 149, 106, 0.55);
  }

  i { font-size: 0.85rem; }
}

.vmodal__legal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;

  i { color: #C4956A; }
}

@keyframes vmodal-pulse {
  0%, 100% { box-shadow: 0 14px 32px rgba(196, 149, 106, 0.4); }
  50% { box-shadow: 0 14px 44px rgba(196, 149, 106, 0.7); }
}

.vmodal-fade-enter-active {
  transition: opacity 220ms ease;
  .vmodal { transition: opacity 220ms ease, transform 280ms cubic-bezier(0.34, 1.4, 0.64, 1); }
}
.vmodal-fade-leave-active {
  transition: opacity 180ms ease;
  .vmodal { transition: opacity 180ms ease, transform 180ms ease; }
}
.vmodal-fade-enter-from {
  opacity: 0;
  .vmodal { opacity: 0; transform: scale(0.94) translateY(20px); }
}
.vmodal-fade-leave-to {
  opacity: 0;
  .vmodal { opacity: 0; transform: scale(0.96); }
}
</style>

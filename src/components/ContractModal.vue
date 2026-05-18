<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'accepted'): void
}>()

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
}

watch(() => props.open, (val) => {
  document.body.style.overflow = val ? 'hidden' : ''
})

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="cmodal-fade">
      <div v-if="props.open" class="cmodal-overlay" @click.self="$emit('close')" role="dialog" aria-modal="true" aria-labelledby="cmodal-title">
        <div class="cmodal">
          <button class="cmodal__close" @click="$emit('close')" aria-label="Cerrar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <div class="cmodal__header">
            <span class="cmodal__badge">
              <i class="fa-solid fa-file-signature" aria-hidden="true" />
              Acuerdo de Servicio
            </span>
            <h2 id="cmodal-title">Términos del Diagnóstico Técnico-Legal</h2>
            <p class="cmodal__subtitle">Por favor, lee y acepta los términos para continuar con tu sesión de diagnóstico gratuito.</p>
          </div>

          <div class="cmodal__body">
            <div class="cmodal__section">
              <h3><i class="fa-solid fa-handshake" aria-hidden="true" /> Alcance del diagnóstico</h3>
              <p>Esta sesión de diagnóstico técnico-legal gratuita tiene como objetivo analizar la situación actual de tu inmueble, identificar los cuellos de botella regulatorios y proponer una hoja de ruta personalizada. No constituye un contrato de servicios profesionales ni una obligación de contratación futura.</p>
            </div>

            <div class="cmodal__section">
              <h3><i class="fa-solid fa-lock" aria-hidden="true" /> Confidencialidad</h3>
              <p>Toda la información compartida durante el diagnóstico será tratada con estricta confidencialidad. IZZU Estudio de Arquitectura no divulgará datos de tu propiedad, documentos personales ni información financiera a terceros sin tu autorización expresa.</p>
            </div>

            <div class="cmodal__section">
              <h3><i class="fa-solid fa-scale-balanced" aria-hidden="true" /> Sin compromiso</h3>
              <p>Al aceptar estos términos, confirmas que entiendes que el diagnóstico es informativo y no vinculante. No genera obligación de contratar los servicios de IZZU. La decisión de avanzar con cualquier servicio adicional es completamente voluntaria.</p>
            </div>

            <div class="cmodal__section">
              <h3><i class="fa-solid fa-shield-halved" aria-hidden="true" /> Protección de datos</h3>
              <p>Tus datos personales serán tratados conforme a nuestra <RouterLink to="/politicas-privacidad" target="_blank">Política de Privacidad</RouterLink>. Al aceptar, autorizas el uso de tus datos para contactarte respecto al diagnóstico y servicios relacionados.</p>
            </div>
          </div>

          <div class="cmodal__actions">
            <button class="cmodal__btn cmodal__btn--secondary" @click="$emit('close')">
              <i class="fa-solid fa-xmark" aria-hidden="true" />
              Cancelar
            </button>
            <button class="cmodal__btn cmodal__btn--primary" @click="$emit('accepted')">
              <i class="fa-solid fa-check" aria-hidden="true" />
              Aceptar términos y continuar
            </button>
          </div>

          <p class="cmodal__legal">Al hacer clic en "Aceptar" confirmas que has leído y aceptas los términos descritos.</p>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
.cmodal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9500;
  background: rgba(13, 17, 23, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  overflow-y: auto;
}

.cmodal {
  position: relative;
  width: 100%;
  max-width: 640px;
  background: #ffffff;
  border-radius: 24px;
  padding: 48px 40px 36px;
  box-shadow: 0 32px 80px rgba(13, 17, 23, 0.4);
  max-height: 90vh;
  overflow-y: auto;

  @media (max-width: 560px) {
    padding: 44px 20px 28px;
    border-radius: 20px;
  }
}

.cmodal__close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.08);
  background: rgba(255,255,255,0.03);
  color: #7a8ea5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s, color 0.2s, background 0.2s;

  &:hover {
    border-color: rgba(#C4956A, 0.4);
    color: #C4956A;
    background: rgba(#C4956A, 0.06);
  }
}

.cmodal__header {
  text-align: center;
  margin-bottom: 28px;
}

.cmodal__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #1B365D;
  color: #C4956A;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.06em;
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  text-transform: uppercase;
  margin-bottom: 1rem;

  i { font-size: 0.78rem; }
}

.cmodal__header h2 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.4rem, 3vw, 1.8rem);
  margin: 0 0 8px;
  color: #1B365D;
}

.cmodal__subtitle {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.88rem;
  color: #6b7280;
  margin: 0;
}

.cmodal__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 28px;
}

.cmodal__section {
  background: #F5F7FA;
  border-radius: 14px;
  padding: 18px 20px;
  border: 1px solid rgba(27, 54, 93, 0.06);

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.95rem;
    margin: 0 0 8px;
    color: #1B365D;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    i {
      color: #C4956A;
      font-size: 0.9rem;
    }
  }

  p {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.85rem;
    color: #4b5563;
    line-height: 1.55;
    margin: 0;
  }

  a {
    color: #C4956A;
    font-weight: 600;
    text-decoration: underline;
  }
}

.cmodal__actions {
  display: flex;
  gap: 12px;
  flex-direction: column;

  @media (min-width: 480px) {
    flex-direction: row;
  }
}

.cmodal__btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 20px;
  border-radius: 12px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  border: 0;
  transition: transform 140ms ease, box-shadow 200ms ease, background 160ms ease, color 160ms ease;

  i { font-size: 0.85rem; }
}

.cmodal__btn--secondary {
  background: #F5F7FA;
  color: #4b5563;
  border: 1.5px solid rgba(0,0,0,0.06);

  &:hover {
    background: #e5e9ec;
    color: #1f2933;
  }
}

.cmodal__btn--primary {
  background: #1B365D;
  color: #ffffff;
  box-shadow: 0 8px 24px rgba(27, 54, 93, 0.3);

  &:hover {
    background: #2a4a7a;
    transform: translateY(-1px);
    box-shadow: 0 12px 32px rgba(27, 54, 93, 0.4);
  }
}

.cmodal__legal {
  text-align: center;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.72rem;
  color: #9ca3af;
  margin: 16px 0 0;
}

.cmodal-fade-enter-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
  .cmodal { transition: opacity 0.3s ease, transform 0.38s cubic-bezier(0.34, 1.4, 0.64, 1); }
}
.cmodal-fade-leave-active {
  transition: opacity 0.22s ease;
  .cmodal { transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.55, 0, 1, 0.45); }
}
.cmodal-fade-enter-from {
  opacity: 0;
  .cmodal { opacity: 0; transform: scale(0.92) translateY(24px); }
}
.cmodal-fade-leave-to {
  opacity: 0;
  .cmodal { opacity: 0; transform: scale(0.95) translateY(10px); }
}
</style>

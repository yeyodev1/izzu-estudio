<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import IzzuHeader from '@/components/IzzuHeader.vue'

const router = useRouter()
const contactName = ref<string>('')

const BOOKING_URL = 'https://api.leadconnectorhq.com/widget/booking/ihxxTpoKpfX0nJZXoNlx'
const GHL_ENDPOINT = 'booking-analytics/event/submit'

const isLocalhost = () => {
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.endsWith('.local')
}

const goToBooked = () => {
  localStorage.setItem('izzu_booked_at', String(Date.now()))
  router.push({ name: 'session-booked' })
}

// ── PerformanceObserver — solo en producción ─────────────────────
let perfObserver: PerformanceObserver | null = null

if (!isLocalhost()) {
  try {
    perfObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(GHL_ENDPOINT)) {
          goToBooked()
          return
        }
      }
    })
    perfObserver.observe({ type: 'resource', buffered: true })
  } catch { /* ignore */ }
}

// ── postMessage — solo en producción ─────────────────────────────
if (!isLocalhost()) {
  window.addEventListener('message', (e: MessageEvent) => {
    try {
      const d = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      const str = JSON.stringify(d).toLowerCase()
      if (str.includes('booking_confirmed') || str.includes('confirmed') || str.includes('success') || str.includes('event/submit')) {
        goToBooked()
      }
    } catch { /* ignore */ }
  })
}

// ── Poll — solo en producción ───────────────────────────────────
let pollId: ReturnType<typeof setInterval> | null = null

if (!isLocalhost()) {
  const checkPerf = () => {
    try {
      const entries = performance.getEntriesByType('resource')
      for (const entry of entries) {
        if (entry.name.includes(GHL_ENDPOINT)) {
          const r = entry as PerformanceResourceTiming
          if (!r.responseStatus || r.responseStatus === 201) return true
        }
      }
    } catch { /* ignore */ }
    return false
  }

  pollId = setInterval(() => {
    if (localStorage.getItem('izzu_booked_at') || checkPerf()) {
      goToBooked()
    }
  }, 1500)
}

onMounted(() => {
  if (localStorage.getItem('izzu_qualified') !== '1') {
    router.replace({ name: 'registration' })
    return
  }
  try {
    const raw = localStorage.getItem('izzu_contact')
    if (raw) {
      const data = JSON.parse(raw) as { nombre?: string }
      if (data?.nombre) contactName.value = data.nombre.split(' ')[0]
    }
  } catch { /* ignore */ }
})

onBeforeUnmount(() => {
  if (perfObserver) perfObserver.disconnect()
  if (pollId) clearInterval(pollId)
})
</script>

<template>
  <IzzuHeader variant="light" />
  <main class="izbook">
    <section class="izbook__head">
      <div class="izbook__container">
        <span class="izbook__badge">
          <i class="fa-solid fa-check" />
          Calificación aprobada
        </span>
        <h1>
          <template v-if="contactName">{{ contactName }}, reserva</template>
          <template v-else>Reserva</template>
          tu <span>diagnóstico</span> ahora
        </h1>
        <p>
          Elige el día y la hora que mejor te acomoden. Te enviaremos confirmación al correo y
          WhatsApp registrados. La sesión dura 20 minutos.
        </p>

        <ul class="izbook__check">
          <li><i class="fa-solid fa-circle-check" /> 100% gratuito · Sin compromiso</li>
          <li><i class="fa-solid fa-circle-check" /> Análisis de escrituras + catastro</li>
          <li><i class="fa-solid fa-circle-check" /> Plan de acción personalizado</li>
        </ul>
      </div>
    </section>

    <section class="izbook__widget">
      <div class="izbook__container">
        <div class="izbook__iframe-wrap">
          <iframe
            :src="BOOKING_URL"
            title="Agenda tu diagnóstico IZZU"
            loading="eager"
            allow="payment; geolocation"
            class="izbook__iframe"
          ></iframe>
        </div>
      </div>
    </section>

    <section class="izbook__after">
      <div class="izbook__container">
        <div class="izbook__after-card">
          <p class="izbook__after-text">
            <i class="fa-solid fa-arrow-pointer" />
            ¿Ya reservaste? Haz clic aquí para confirmar
          </p>
          <button type="button" class="izbook__after-btn izbook__after-btn--shown" @click="goToBooked">
            <i class="fa-solid fa-circle-check" />
            Ya reservé, continuar
          </button>
        </div>
      </div>
    </section>

    <footer class="izbook__foot">
      <div class="izbook__container">
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

.izbook {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: linear-gradient(180deg, #F5F7FA 0%, #ffffff 100%);
  color: $dark; min-height: 100vh;
}

.izbook__container {
  max-width: 980px; margin: 0 auto; padding: 0 1.25rem;
  @media (min-width: 768px) { padding: 0 2rem; }
}

.izbook__head {
  padding: 2.5rem 0 1.75rem; text-align: center;
}

.izbook__badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: $primary; color: $accent;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.78rem; letter-spacing: 0.06em;
  padding: 0.45rem 0.95rem; border-radius: 999px;
  text-transform: uppercase;
  margin-bottom: 1rem;
  i { color: $accent; }
}

.izbook__head h1 {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.85rem, 5vw, 2.65rem);
  line-height: 1.12; margin: 0 0 0.6rem;
  span { color: $accent; }
}

.izbook__head p {
  color: #4b5563; font-size: 1rem; line-height: 1.55;
  max-width: 620px; margin: 0 auto;
}

.izbook__check {
  list-style: none; padding: 0; margin: 1.25rem auto 0;
  display: flex; flex-direction: column; gap: 0.4rem; align-items: center;
  font-size: 0.9rem; color: #1f2933;
  i { color: #15803d; margin-right: 0.4rem; }

  @media (min-width: 640px) { flex-direction: row; justify-content: center; gap: 1.25rem; flex-wrap: wrap; }
}

.izbook__widget { padding: 1rem 0 2.5rem; }

.izbook__iframe-wrap {
  background: #ffffff;
  border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(13, 17, 23, 0.08);
}

.izbook__iframe {
  width: 100%; min-height: 960px; height: 100vh; max-height: 1160px;
  border: 0; display: block; background: #ffffff;
}

.izbook__after {
  padding: 1rem 0 3.5rem; text-align: center; color: #4b5563;
}
.izbook__after-card {
  max-width: 460px; margin: 0 auto;
  background: #ffffff; border: 2px solid rgba(27, 54, 93, 0.1);
  border-radius: 1.25rem; padding: 2rem 1.5rem;
  box-shadow: 0 16px 40px rgba(13, 17, 23, 0.06);
  display: flex; flex-direction: column; align-items: center; gap: 1.15rem;
}
.izbook__after-text {
  margin: 0; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem; color: #4b5563;
  i { color: $accent; font-size: 1rem; }
}
.izbook__after-btn {
  display: inline-flex; align-items: center; gap: 0.55rem;
  background: $primary; color: #ffffff;
  border: 0; padding: 0.85rem 1.5rem; border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; cursor: pointer;
  letter-spacing: 0.03em;
  box-shadow: 0 12px 28px rgba(27, 54, 93, 0.3);
  transition: transform 140ms ease, background 160ms ease, color 160ms ease, box-shadow 200ms ease;
  i { color: $accent; font-size: 1rem; transition: color 160ms ease; }
  &:hover {
    transform: translateY(-2px);
    background: $accent; color: $dark;
    box-shadow: 0 16px 40px rgba(196, 149, 106, 0.45);
    i { color: $dark; }
  }
}

.izbook__foot {
  padding: 1.75rem 0 2.5rem;
  border-top: 1px solid rgba(0,0,0,0.06);
  .izbook__container {
    display: flex; flex-direction: column; gap: 0.75rem; align-items: center; text-align: center;
    font-size: 0.82rem; color: #6b7280;
    @media (min-width: 640px) { flex-direction: row; justify-content: space-between; }
  }
  nav { display: flex; gap: 1rem; }
  a { color: #4b5563; text-decoration: none; &:hover { color: $accent; text-decoration: underline; } }
}
</style>

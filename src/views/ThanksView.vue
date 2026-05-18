<script setup lang="ts">
import { onMounted, ref } from 'vue'
import IzzuHeader from '@/components/IzzuHeader.vue'

const contactName = ref<string>('')
const isDisq = ref(false)

onMounted(() => {
  try {
    const raw = localStorage.getItem('izzu_contact')
    if (raw) {
      const data = JSON.parse(raw) as { nombre?: string }
      if (data?.nombre) contactName.value = data.nombre.split(' ')[0]
    }
  } catch { /* ignore */ }
  isDisq.value = !!Number(localStorage.getItem('izzu_disq_at') ?? '0')
})
</script>

<template>
  <IzzuHeader variant="light" />
  <main class="izthk">
    <section class="izthk__container">
      <span class="izthk__icon">
        <i class="fa-solid fa-hand-peace" />
      </span>

      <template v-if="isDisq">
        <h1 class="izthk__title">
          Gracias por tu registro<template v-if="contactName">, {{ contactName }}</template>
        </h1>
        <p class="izthk__sub">
          Hemos recibido tu información. Por ahora este diagnóstico está enfocado en casos específicos
          de regularización patrimonial. Te invitamos a seguir a IZZU en Instagram para contenido
          sobre el tema. Cuando tengas una propiedad con el perfil adecuado, vuelve a agendar.
        </p>
        <a
          href="https://www.instagram.com/izzuestudio/"
          target="_blank"
          rel="noopener noreferrer"
          class="izthk__ig"
        >
          <i class="fa-brands fa-instagram" /> Seguir @izzuestudio
        </a>
      </template>

      <template v-else>
        <h1 class="izthk__title">
          ¡Listo<template v-if="contactName">, {{ contactName }}</template>!
        </h1>
        <p class="izthk__sub">
          Recibimos tu reserva. Te enviaremos la confirmación al correo y WhatsApp registrados.
        </p>
        <div class="izthk__card">
          <h2><i class="fa-solid fa-calendar-check" /> Próximos pasos</h2>
          <ul>
            <li><strong>1.</strong> Revisa tu correo y WhatsApp. Te llegará la confirmación con los detalles de la sesión.</li>
            <li><strong>2.</strong> Si tienes escrituras o documentos catastrales, ten a mano una copia digital.</li>
            <li><strong>3.</strong> Llegada la fecha, te llamamos / te conectamos para la sesión de 20 minutos.</li>
          </ul>
        </div>
      </template>

      <nav class="izthk__legal">
        <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
        <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
      </nav>
    </section>
  </main>
</template>

<style lang="scss" scoped>
$primary: #1B365D;
$accent:  #C4956A;
$dark:    #0D1117;

.izthk {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  background: linear-gradient(180deg, #F5F7FA 0%, #ffffff 100%);
  color: $dark; min-height: 100vh; display: grid; place-items: start center;
  padding: 0 1.25rem 4rem;
}

.izthk__container {
  max-width: 640px; width: 100%;
  margin: 3rem auto 0; text-align: center;
  display: flex; flex-direction: column; gap: 1rem; align-items: center;
}

.izthk__icon {
  width: 4.2rem; height: 4.2rem; border-radius: 999px;
  background: $primary; color: $accent;
  display: grid; place-items: center;
  font-size: 1.65rem;
  box-shadow: 0 12px 30px rgba(27, 54, 93, 0.18);
}

.izthk__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.65rem, 4.2vw, 2.4rem);
  line-height: 1.15; margin: 0;
}

.izthk__sub {
  color: #4b5563; font-size: 1rem; line-height: 1.6;
  max-width: 540px; margin: 0;
}

.izthk__card {
  margin-top: 1rem; width: 100%; text-align: left;
  background: #ffffff; border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem; padding: 1.5rem;
  box-shadow: 0 16px 40px rgba(13, 17, 23, 0.06);

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700; font-size: 1.1rem; margin: 0 0 0.85rem; color: $primary;
    display: flex; align-items: center; gap: 0.5rem;
    i { color: $accent; }
  }

  ul {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.65rem;
    color: #4b5563; line-height: 1.55; font-size: 0.95rem;
    strong { color: $primary; margin-right: 0.35rem; }
  }

  p { margin: 0 0 1rem; color: #4b5563; line-height: 1.6; }
}

.izthk__ig {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: $dark; color: $accent;
  padding: 0.8rem 1.25rem; border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; text-decoration: none;
  transition: background 160ms ease, color 160ms ease;
  &:hover { background: $accent; color: $dark; }
}

.izthk__legal {
  display: flex; gap: 1.25rem; margin-top: 1rem; font-size: 0.85rem;
  a { color: #4b5563; text-decoration: none; &:hover { color: $accent; text-decoration: underline; } }
}
</style>

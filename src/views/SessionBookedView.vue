<script setup lang="ts">
/**
 * SessionBookedView.vue — /agendada
 *
 * Confirmación tras dejar contacto y calificar para diagnóstico.
 * Mensaje principal: sesión agendada — te contactaremos pronto.
 */
import { computed, onMounted, ref } from 'vue'
import IzzuHeader from '@/components/IzzuHeader.vue'

const contactName = ref<string>('')
const contactEmail = ref<string>('')

onMounted(() => {
  try {
    const raw = localStorage.getItem('izzu_contact')
    if (!raw) return
    const data = JSON.parse(raw) as { nombre?: string; email?: string }
    if (data?.nombre) contactName.value = data.nombre.split(' ')[0]
    if (data?.email) contactEmail.value = data.email
  } catch {
    /* ignore corrupt storage */
  }
})

const greeting = computed(() =>
  contactName.value
    ? `Listo, ${contactName.value}. Tu sesión está agendada.`
    : 'Listo. Tu sesión está agendada.',
)
</script>

<template>
  <IzzuHeader variant="light" />
  <main class="sbook">
    <section class="sbook__hero">
      <div class="sbook__container">
        <span class="sbook__badge">
          <i class="fa-solid fa-check" aria-hidden="true" />
          Sesión de diagnóstico agendada
        </span>

        <h1 class="sbook__title">{{ greeting }}</h1>
        <p class="sbook__subtitle">
          Hemos recibido tu información y agendado tu
          <strong>diagnóstico técnico-legal gratuito con IZZU Estudio de Arquitectura</strong>.
          No tienes que hacer nada más por ahora —
          <strong>mantén tu celular cerca</strong>.
        </p>
      </div>
    </section>

    <section class="sbook__alert">
      <div class="sbook__container sbook__alert__inner">
        <span class="sbook__alert__icon" aria-hidden="true">
          <i class="fa-solid fa-mobile-screen-button" />
        </span>
        <div>
          <h2>Te contactaremos por WhatsApp.</h2>
          <p>
            En las próximas horas recibirás un mensaje al
            <strong v-if="contactEmail">{{ contactEmail }}</strong>
            <strong v-else>tu correo registrado</strong>
            y al WhatsApp que nos proporcionaste para coordinar tu sesión de diagnóstico de 20 minutos.
          </p>
        </div>
      </div>
    </section>

    <section class="sbook__steps">
      <div class="sbook__container">
        <h2 class="sbook__steps-title">Lo que sigue</h2>

        <ol class="sbook__steps-list">
          <li class="sbook__step">
            <span class="sbook__step-num">1</span>
            <div>
              <h3>Revisa tu email y WhatsApp</h3>
              <p>
                Te llegará un mensaje de confirmación con los detalles de tu diagnóstico y los
                documentos que puedes ir preparando.
              </p>
            </div>
          </li>
          <li class="sbook__step">
            <span class="sbook__step-num">2</span>
            <div>
              <h3>Prepara los documentos de tu propiedad</h3>
              <p>
                Si tienes escrituras, planos o documentos catastrales a la mano, genial. Si no,
                igual podemos orientarte — el diagnóstico es flexible.
              </p>
            </div>
          </li>
          <li class="sbook__step">
            <span class="sbook__step-num">3</span>
            <div>
              <h3>Te contactamos para agendar la llamada</h3>
              <p>
                Nuestro equipo se pondrá en contacto contigo para coordinar el día y la hora de tu
                sesión de diagnóstico de 20 minutos.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="sbook__cta">
      <div class="sbook__container">
        <h2>Mientras tanto, síguenos en Instagram</h2>
        <p>
          Compartimos contenido sobre regularización, propiedad horizontal y blindaje patrimonial.
        </p>
        <div class="sbook__links">
          <a
            href="https://www.instagram.com/izzuestudio/"
            target="_blank"
            rel="noopener noreferrer"
            class="sbook__link"
          >
            <i class="fa-brands fa-instagram" aria-hidden="true" />
            @izzuestudio
          </a>
        </div>
      </div>
    </section>

    <footer class="sbook__footer">
      <div class="sbook__container">
        <p>© IZZU Estudio de Arquitectura · Diagnóstico Técnico-Legal</p>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>
  </main>
</template>

<style lang="scss" scoped>
.sbook {
  min-height: 100vh;
  background: linear-gradient(180deg, #F5F7FA 0%, #ffffff 100%);
  color: #0d1117;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.sbook__container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }
}

.sbook__hero {
  padding: 4rem 0 2.5rem;
  text-align: center;
}

.sbook__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #1B365D;
  color: #C4956A;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  margin-bottom: 1.5rem;
}

.sbook__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.85rem, 5vw, 2.75rem);
  line-height: 1.1;
  margin: 0 0 1rem;
}

.sbook__subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.55;
  color: #41484f;
  max-width: 640px;
  margin: 0 auto;

  strong {
    color: #0d1117;
    font-weight: 700;
  }
}

.sbook__alert {
  padding: 0 0 2rem;
}

.sbook__alert__inner {
  background: #0D1117;
  color: #ffffff;
  border-radius: 1.25rem;
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  border: 2px solid rgba(196, 149, 106, 0.25);

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    margin: 0 0 0.45rem;
  }

  p {
    margin: 0;
    color: #d1d5db;
    line-height: 1.55;
    font-size: 0.95rem;

    strong {
      color: #C4956A;
      font-weight: 700;
      word-break: break-word;
    }
  }
}

.sbook__alert__icon {
  flex-shrink: 0;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
  background: #C4956A;
  color: #0D1117;
  display: grid;
  place-items: center;
  font-size: 1.05rem;
}

.sbook__steps {
  padding: 3rem 0;
}

.sbook__steps-title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  margin: 0 0 2rem;
  text-align: center;
}

.sbook__steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.sbook__step {
  display: flex;
  gap: 1rem;
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1rem;
  padding: 1.25rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    margin: 0 0 0.35rem;
    color: #0d1117;
  }

  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.sbook__step-num {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: #1B365D;
  color: #C4956A;
  display: grid;
  place-items: center;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
}

.sbook__cta {
  padding: 3rem 0;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.35rem, 3vw, 1.75rem);
    margin: 0 0 0.75rem;
  }

  p {
    color: #4b5563;
    margin: 0 0 1.5rem;
  }
}

.sbook__links {
  display: flex;
  justify-content: center;
}

.sbook__link {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  color: #0d1117;
  text-decoration: none;
  background: #ffffff;
  border: 1.5px solid #0d1117;
  padding: 0.7rem 1.25rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: #0d1117;
    color: #C4956A;
  }
}

.sbook__footer {
  padding: 2.5rem 0 3rem;
  border-top: 1px solid #e5e9ec;
  margin-top: 2rem;

  .sbook__container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    text-align: center;
    color: #6b7280;
    font-size: 0.85rem;

    @media (min-width: 640px) {
      flex-direction: row;
      justify-content: space-between;
      text-align: left;
    }
  }

  nav {
    display: flex;
    gap: 1.25rem;
    justify-content: center;
  }

  a {
    color: #4b5563;
    text-decoration: none;

    &:hover {
      color: #A0784F;
      text-decoration: underline;
    }
  }
}
</style>

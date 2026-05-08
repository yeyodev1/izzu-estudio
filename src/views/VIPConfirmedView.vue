<script setup lang="ts">
/**
 * VIPConfirmedView.vue — /registrada
 *
 * Confirmación tras calificar para la lista VIP de la preventa.
 * Muestra el primer nombre del lead (lpb_contact) y los próximos pasos.
 */
import { computed, onMounted, ref } from 'vue'

const CDN = 'https://res.cloudinary.com/dkosgkjpq/image/upload'
const LUISA_PORTRAIT = `${CDN}/w_480,h_600,c_fill,g_face,q_auto,f_auto/luisa-pita/luisa-11.jpg`

const contactName = ref<string>('')

onMounted(() => {
  try {
    const raw = localStorage.getItem('lpb_contact')
    if (!raw) return
    const data = JSON.parse(raw) as { nombre?: string }
    if (data?.nombre) contactName.value = data.nombre.split(' ')[0]
  } catch {
    /* ignore corrupt storage */
  }
})

const greeting = computed(() =>
  contactName.value ? `Bienvenida a la lista VIP, ${contactName.value}.` : 'Bienvenida a la lista VIP.',
)
</script>

<template>
  <main class="vip">
    <section class="vip__hero">
      <div class="vip__container">
        <span class="vip__badge">
          <i class="fa-solid fa-check" aria-hidden="true" />
          Tu cupo VIP está reservado
        </span>

        <h1 class="vip__title">
          {{ greeting }}
        </h1>
        <p class="vip__subtitle">
          Eres parte del grupo cerrado que recibirá la preventa de la
          <strong>comunidad anual con Luisa Pita Bejarano</strong> antes que el resto del mundo.
        </p>

        <figure class="vip__portrait">
          <img
            :src="LUISA_PORTRAIT"
            alt="Luisa Pita Bejarano, coach de transformación"
            loading="eager"
            width="240"
            height="300"
          />
        </figure>
      </div>
    </section>

    <section class="vip__steps">
      <div class="vip__container">
        <h2 class="vip__steps-title">Lo que sigue</h2>

        <ol class="vip__steps-list">
          <li class="vip__step">
            <span class="vip__step-num">1</span>
            <div>
              <h3>Revisa tu email y WhatsApp en las próximas horas</h3>
              <p>
                Te llegará un mensaje de confirmación con la información oficial de la comunidad y tu lugar en la lista VIP.
              </p>
            </div>
          </li>
          <li class="vip__step">
            <span class="vip__step-num">2</span>
            <div>
              <h3>Recibirás aviso 24h antes de que abra la preventa</h3>
              <p>
                Solo las registradas saben antes que nadie. Tendrás tiempo de tener el capital tres cifras listo y reservar tu cupo sin estrés.
              </p>
            </div>
          </li>
          <li class="vip__step">
            <span class="vip__step-num">3</span>
            <div>
              <h3>Tu código de descuento exclusivo llega al email registrado</h3>
              <p>
                Es único, intransferible y solo válido durante la ventana de preventa. Es nuestra forma de premiar tu decisión de entrar primero.
              </p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <section class="vip__cta">
      <div class="vip__container">
        <h2>Mientras tanto, no te despegues de Luisa</h2>
        <p>Sigue su trabajo y su comunidad en redes para llegar más fuerte el día que abra la preventa.</p>
        <div class="vip__links">
          <a
            href="https://www.instagram.com/luisapitabejarano/"
            target="_blank"
            rel="noopener noreferrer"
            class="vip__link"
          >
            <i class="fa-brands fa-instagram" aria-hidden="true" />
            @luisapitabejarano
          </a>
        </div>
      </div>
    </section>

    <footer class="vip__footer">
      <div class="vip__container">
        <p>© Luisa Pita Bejarano · Comunidad anual de transformación</p>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>
  </main>
</template>

<style lang="scss" scoped>
.vip {
  min-height: 100vh;
  background: linear-gradient(180deg, #f5fffa 0%, #ffffff 100%);
  color: #0d1117;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
}

.vip__container {
  width: 100%;
  max-width: 880px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }
}

.vip__hero {
  padding: 4rem 0 2.5rem;
  text-align: center;
}

.vip__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #16c784;
  color: #0d1117;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  padding: 0.55rem 1rem;
  border-radius: 999px;
  margin-bottom: 1.5rem;
}

.vip__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.85rem, 5vw, 2.75rem);
  line-height: 1.1;
  margin: 0 0 1rem;
}

.vip__subtitle {
  font-size: clamp(1rem, 2vw, 1.15rem);
  line-height: 1.55;
  color: #41484f;
  max-width: 640px;
  margin: 0 auto 2rem;

  strong {
    color: #0d1117;
    font-weight: 700;
  }
}

.vip__portrait {
  margin: 0 auto;
  width: clamp(180px, 30vw, 240px);
  aspect-ratio: 4 / 5;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(13, 17, 23, 0.18);
  border: 4px solid #ffffff;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
  }
}

.vip__steps {
  padding: 3rem 0;
}

.vip__steps-title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.5rem, 3.5vw, 2rem);
  margin: 0 0 2rem;
  text-align: center;
}

.vip__steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.vip__step {
  display: flex;
  gap: 1rem;
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1rem;
  padding: 1.25rem 1.25rem;

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

.vip__step-num {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 999px;
  background: #16c784;
  color: #0d1117;
  display: grid;
  place-items: center;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.05rem;
}

.vip__cta {
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

.vip__links {
  display: flex;
  justify-content: center;
}

.vip__link {
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
    color: #16c784;
  }
}

.vip__footer {
  padding: 2.5rem 0 3rem;
  border-top: 1px solid #e5e9ec;
  margin-top: 2rem;

  .vip__container {
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
      color: #0a9e68;
      text-decoration: underline;
    }
  }
}
</style>

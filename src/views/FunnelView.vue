<script setup lang="ts">
/**
 * FunnelView.vue — /
 *
 * Landing principal de la preventa de la comunidad anual de Luisa Pita Bejarano.
 * Audiencia: mujeres ocupadas / dueñas de negocio decididas a invertir un año
 * entero en su transformación. Capital tres cifras como filtro implícito.
 */
import { onMounted, ref } from 'vue'
import RegistrationModal from '@/components/RegistrationModal.vue'
import QualifyModal from '@/components/QualifyModal.vue'
import UrgencyBar from '@/components/UrgencyBar.vue'
import { captureFbParams } from '@/utils/fbclid'
import { trackPageView, trackViewContent } from '@/utils/tracking'

const CDN = 'https://res.cloudinary.com/dkosgkjpq/image/upload'
const LUISA_HERO = `${CDN}/w_960,h_1080,c_fill,g_face,q_auto,f_auto/luisa-pita/luisa-2.jpg`
const LUISA_PORTRAIT = `${CDN}/w_560,h_700,c_fill,g_face,q_auto,f_auto/luisa-pita/luisa-11.jpg`

interface Lead {
  nombre: string
  apellido: string
  email: string
  phone: string
  country: string
  eventId: string
}

const registerOpen = ref(false)
const qualifyOpen = ref(false)
const lead = ref<Lead | null>(null)

const openRegister = () => {
  registerOpen.value = true
  trackViewContent({
    custom: {
      content_name: 'Comunidad Anual Luisa Pita - CTA Preventa',
      content_category: 'community-presale-cta',
    },
  })
}

const onSubmitted = (payload: Lead) => {
  lead.value = payload
  qualifyOpen.value = true
}

onMounted(() => {
  captureFbParams()
  trackPageView()
})

const includes = [
  {
    icon: 'fa-dumbbell',
    title: 'Rutinas semanales para mujeres ocupadas',
    body: 'Entrenamientos diseñados por Luisa para hacer en casa o en gimnasio, sin perder horas. Para tu agenda real, no para una imaginaria.',
  },
  {
    icon: 'fa-people-group',
    title: 'Comunidad cerrada un año entero',
    body: 'Un grupo privado de mujeres serias que avanzan contigo. Sin curiosas, sin ruido — solo decididas.',
  },
  {
    icon: 'fa-utensils',
    title: 'Plan nutricional flexible',
    body: 'Hábitos sostenibles, no dietas restrictivas. Adaptado para que viajes, salgas a comer y sigas avanzando.',
  },
  {
    icon: 'fa-comments',
    title: 'Sesiones grupales con Luisa',
    body: 'Espacios en vivo durante el año para resolver tus dudas, ajustar tu plan y mantenerte en ruta.',
  },
  {
    icon: 'fa-bullseye',
    title: 'Retos mensuales con resultados medibles',
    body: 'Pequeñas metas que se acumulan a lo largo de 12 meses. Un cuerpo distinto al final del año, no en 8 semanas.',
  },
  {
    icon: 'fa-phone',
    title: 'Acompañamiento cercano',
    body: 'Luisa y su equipo cerca de ti todo el año. No estás sola — estás dentro de una estructura que te empuja.',
  },
]

const forWho = [
  'Mujeres ocupadas que dejan su salud para "después" y nunca llega ese después.',
  'Dueñas de negocio que cuidan a todos menos a sí mismas y ya están listas para cambiarlo.',
  'Mujeres que pueden disponer de capital tres cifras y entienden que invertir en su cuerpo es invertir en su vida.',
  'Mujeres que quieren un compromiso de un año entero, no parches de 8 semanas.',
]

const notForWho = [
  'Curiosas que solo buscan información gratis.',
  'Quien aún no puede invertir capital tres cifras hoy.',
  'Quien no está lista para comprometerse 12 meses con un proceso real.',
]

const faq = [
  {
    q: '¿Cuánto cuesta entrar?',
    a: 'El precio se anuncia el día que abre la preventa. Por ahora solo confirmamos que es capital tres cifras (USD) y cubre la comunidad un año entero. Las registradas reciben un descuento exclusivo que el público general no ve.',
  },
  {
    q: '¿Cuándo abre la preventa?',
    a: 'No tenemos fecha pública aún. Las registradas reciben aviso 24 horas antes de que abra. Si no estás en la lista VIP, te enteras al mismo tiempo que el resto.',
  },
  {
    q: '¿Por qué un año entero y no un programa corto?',
    a: 'Porque transformar un cuerpo y un estilo de vida toma tiempo. Programas cortos dan resultados que se evaporan. Esta comunidad está hecha para lograr cambios que se sostengan en tu vida real.',
  },
  {
    q: '¿Y si me registro pero no califico?',
    a: 'No pasa nada. Solo significa que esta cohorte no es para ti hoy. Podrás aplicar a una próxima edición cuando estés lista.',
  },
  {
    q: '¿Tengo que vivir en Ecuador?',
    a: 'No. La comunidad funciona online. Mujeres en Ecuador, Latinoamérica, USA y Europa pueden participar.',
  },
]
</script>

<template>
  <UrgencyBar @cta="openRegister" />
  <main class="lpb">
    <!-- ── HERO ────────────────────────────────────────────────── -->
    <section class="lpb-hero">
      <div class="lpb-hero__container">
        <div class="lpb-hero__content">
          <span class="lpb-hero__eyebrow">
            <i class="fa-solid fa-lock" aria-hidden="true" />
            Preventa cerrada · Cupos limitados
          </span>
          <h1 class="lpb-hero__title">
            La comunidad fitness anual de
            <span class="lpb-hero__title-accent">Luisa Pita</span>
            está por abrir.
          </h1>
          <p class="lpb-hero__subtitle">
            Hecha para mujeres ocupadas y dueñas de negocio decididas a transformar su cuerpo y su vida en
            <strong>un año entero con Luisa.</strong>
          </p>

          <ul class="lpb-hero__bullets">
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Acceso primero — antes que el público</li>
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Código de descuento exclusivo</li>
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Solo si tienes capital tres cifras y compromiso anual</li>
          </ul>

          <button class="lpb-hero__cta" type="button" @click="openRegister">
            Quiero mi cupo VIP
            <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
          <p class="lpb-hero__legal">No es para todas. Si calificas, recibes el aviso primero.</p>
        </div>

        <figure class="lpb-hero__visual">
          <img
            :src="LUISA_HERO"
            alt="Luisa Pita Bejarano — coach de transformación corporal"
            loading="eager"
            width="480"
            height="600"
          />
        </figure>
      </div>
    </section>

    <!-- ── PROMESA ─────────────────────────────────────────────── -->
    <section class="lpb-promise">
      <div class="lpb-container">
        <h2>Un año contigo, un año cerca de Luisa.</h2>
        <p>
          Esta no es una dieta de 30 días, ni un reto de 8 semanas. Es la decisión de
          dedicarte un año entero — con un equipo que te empuja, una comunidad que te sostiene y una metodología
          probada por miles de mujeres en Ecuador y Latinoamérica.
        </p>
      </div>
    </section>

    <!-- ── INCLUYE ─────────────────────────────────────────────── -->
    <section class="lpb-includes">
      <div class="lpb-container">
        <h2>Qué incluye el año dentro de la comunidad</h2>
        <p class="lpb-includes__lead">
          Un sistema completo, no piezas sueltas. El detalle exacto de cada componente se confirma el día de la preventa.
        </p>
        <div class="lpb-includes__grid">
          <article v-for="item in includes" :key="item.title" class="lpb-card">
            <span class="lpb-card__icon">
              <i :class="['fa-solid', item.icon]" aria-hidden="true" />
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ── PARA QUIÉN ES / NO ES ───────────────────────────────── -->
    <section class="lpb-fitwho">
      <div class="lpb-container lpb-fitwho__grid">
        <div class="lpb-fitwho__col lpb-fitwho__col--for">
          <h3>
            <i class="fa-solid fa-circle-check" aria-hidden="true" />
            Esta comunidad es para ti si…
          </h3>
          <ul>
            <li v-for="line in forWho" :key="line">{{ line }}</li>
          </ul>
        </div>
        <div class="lpb-fitwho__col lpb-fitwho__col--not">
          <h3>
            <i class="fa-solid fa-circle-xmark" aria-hidden="true" />
            No es para ti si…
          </h3>
          <ul>
            <li v-for="line in notForWho" :key="line">{{ line }}</li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ── PREVENTA: CÓMO FUNCIONA ─────────────────────────────── -->
    <section class="lpb-presale">
      <div class="lpb-container">
        <span class="lpb-presale__eyebrow">Cómo funciona la preventa</span>
        <h2>Tu nombre primero. Tu descuento exclusivo. Tu cupo asegurado.</h2>
        <ol class="lpb-presale__steps">
          <li>
            <span>1</span>
            <p><strong>Te registras hoy.</strong> Confirmas que tienes capital tres cifras y que estás lista para el año entero.</p>
          </li>
          <li>
            <span>2</span>
            <p><strong>Recibes aviso 24h antes</strong> de que abra la preventa. El resto del mundo se entera ese mismo día.</p>
          </li>
          <li>
            <span>3</span>
            <p><strong>Te llega tu código de descuento único.</strong> Solo válido durante la ventana de preventa, solo para ti.</p>
          </li>
          <li>
            <span>4</span>
            <p><strong>Reservas tu cupo</strong> en la comunidad anual y empiezas a transformar tu vida con Luisa.</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── AUTORIDAD ───────────────────────────────────────────── -->
    <section class="lpb-author">
      <div class="lpb-container lpb-author__grid">
        <figure>
          <img
            :src="LUISA_PORTRAIT"
            alt="Luisa Pita Bejarano"
            loading="lazy"
            width="280"
            height="350"
          />
        </figure>
        <div>
          <span class="lpb-author__eyebrow">Quién está detrás</span>
          <h2>Luisa Pita Bejarano</h2>
          <p>
            Coach de transformación corporal especializada en mujeres adultas con vidas ocupadas. Ha guiado a más de 200 mujeres
            en Ecuador y Latinoamérica en procesos de cambio sostenidos — sin dietas restrictivas, sin rutinas imposibles, sin efecto rebote.
          </p>
          <p>
            Esta comunidad es la evolución natural de su trabajo: dejar de empujar a sus alumnas en bloques cortos
            para acompañarlas un año completo, con la profundidad que ese tiempo permite.
          </p>
          <a
            href="https://www.instagram.com/luisapitabejarano/"
            target="_blank"
            rel="noopener noreferrer"
            class="lpb-author__link"
          >
            <i class="fa-brands fa-instagram" aria-hidden="true" />
            @luisapitabejarano
          </a>
        </div>
      </div>
    </section>

    <!-- ── FAQ ─────────────────────────────────────────────────── -->
    <section class="lpb-faq">
      <div class="lpb-container">
        <h2>Lo que las registradas suelen preguntar</h2>
        <div class="lpb-faq__list">
          <details v-for="item in faq" :key="item.q" class="lpb-faq__item">
            <summary>
              <span>{{ item.q }}</span>
              <i class="fa-solid fa-chevron-down" aria-hidden="true" />
            </summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ── CTA FINAL ───────────────────────────────────────────── -->
    <section class="lpb-final">
      <div class="lpb-container">
        <h2>Solo decisión. Una pregunta:</h2>
        <p>¿Estás lista para regalarte un año contigo, contra todo el ruido que ya conoces?</p>
        <button class="lpb-hero__cta" type="button" @click="openRegister">
          Reservar mi cupo VIP
          <i class="fa-solid fa-arrow-right" aria-hidden="true" />
        </button>
        <p class="lpb-final__note">
          Capital tres cifras · Compromiso de un año entero · Solo registradas reciben código de descuento exclusivo
        </p>
      </div>
    </section>

    <footer class="lpb-foot">
      <div class="lpb-container">
        <p>© Luisa Pita Bejarano</p>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>

    <RegistrationModal
      :open="registerOpen"
      @close="registerOpen = false"
      @submitted="onSubmitted"
    />
    <QualifyModal
      :open="qualifyOpen"
      :lead="lead"
      @close="qualifyOpen = false"
    />
  </main>
</template>

<style lang="scss" scoped>
.lpb {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: #0d1117;
  background: #ffffff;
  padding-top: 96px;

  @media (min-width: 768px) {
    padding-top: 60px;
  }
}

.lpb-container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: 768px) {
    padding: 0 2rem;
  }
}

// ── HERO ────────────────────────────────────────────────────────
.lpb-hero {
  background: radial-gradient(circle at 20% 0%, #f0fff8 0%, #ffffff 55%, #ffffff 100%);
  padding: 3rem 0 4rem;

  @media (min-width: 960px) {
    padding: 4.5rem 0 5rem;
  }
}

.lpb-hero__container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: grid;
  gap: 2.5rem;
  align-items: center;

  @media (min-width: 960px) {
    grid-template-columns: 1.15fr 1fr;
    gap: 3.5rem;
    padding: 0 2rem;
  }
}

.lpb-hero__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.lpb-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #0d1117;
  color: #16c784;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  text-transform: uppercase;
  width: max-content;
}

.lpb-hero__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(2rem, 6vw, 3.4rem);
  line-height: 1.05;
  margin: 0;
}

.lpb-hero__title-accent {
  color: #16c784;
}

.lpb-hero__subtitle {
  font-size: clamp(1rem, 2.2vw, 1.2rem);
  line-height: 1.55;
  color: #41484f;
  margin: 0;

  strong {
    color: #0d1117;
    font-weight: 700;
  }
}

.lpb-hero__bullets {
  list-style: none;
  padding: 0;
  margin: 0.5rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
    color: #1f2933;
  }

  i {
    color: #16c784;
  }
}

.lpb-hero__cta {
  margin-top: 1.25rem;
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.65rem;
  background: #16c784;
  color: #0d1117;
  border: 0;
  border-radius: 999px;
  padding: 1.05rem 1.85rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 1.05rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 14px 30px rgba(22, 199, 132, 0.35);
  transition: transform 140ms ease, box-shadow 200ms ease, background 160ms ease, color 160ms ease;

  &:hover {
    background: #0a9e68;
    color: #ffffff;
    transform: translateY(-2px);
    box-shadow: 0 18px 38px rgba(10, 158, 104, 0.4);
  }
}

.lpb-hero__legal {
  font-size: 0.82rem;
  color: #6b7280;
  margin: 0.4rem 0 0;
}

.lpb-hero__visual {
  margin: 0;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(13, 17, 23, 0.18);
  aspect-ratio: 4 / 5;
  max-width: 480px;
  justify-self: center;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// ── PROMESA ─────────────────────────────────────────────────────
.lpb-promise {
  background: #0d1117;
  color: #ffffff;
  padding: 3rem 0;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.5rem, 3.5vw, 2.1rem);
    margin: 0 0 1rem;
  }

  p {
    color: #d1d5db;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.6;
  }
}

// ── INCLUYE ─────────────────────────────────────────────────────
.lpb-includes {
  padding: 4rem 0;
  background: #f5fffa;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.8vw, 2.3rem);
    margin: 0 0 0.5rem;
    text-align: center;
  }
}

.lpb-includes__lead {
  text-align: center;
  color: #4b5563;
  max-width: 640px;
  margin: 0 auto 2.5rem;
}

.lpb-includes__grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (min-width: 960px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.lpb-card {
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    margin: 0;
  }

  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.5;
  }
}

.lpb-card__icon {
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 0.85rem;
  background: #16c784;
  color: #0d1117;
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  margin-bottom: 0.25rem;
}

// ── FOR / NOT FOR ───────────────────────────────────────────────
.lpb-fitwho {
  padding: 4rem 0;
}

.lpb-fitwho__grid {
  display: grid;
  gap: 1.5rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.lpb-fitwho__col {
  border-radius: 1rem;
  padding: 1.75rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
  }

  ul {
    margin: 0;
    padding-left: 1.1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    color: #1f2933;
    line-height: 1.5;
  }
}

.lpb-fitwho__col--for {
  background: #f0fff8;
  border: 1.5px solid #16c784;

  h3 {
    color: #0a9e68;
  }
}

.lpb-fitwho__col--not {
  background: #fafafa;
  border: 1.5px solid #e5e9ec;

  h3 {
    color: #6b7280;
  }
}

// ── PRESALE ─────────────────────────────────────────────────────
.lpb-presale {
  background: #0d1117;
  color: #ffffff;
  padding: 4rem 0;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.8vw, 2.2rem);
    margin: 0.5rem 0 2rem;
    max-width: 760px;
  }
}

.lpb-presale__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  color: #16c784;
}

.lpb-presale__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  li {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 1rem;
    padding: 1.25rem;
  }

  span {
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 999px;
    background: #16c784;
    color: #0d1117;
    display: grid;
    place-items: center;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 800;
    flex-shrink: 0;
  }

  p {
    margin: 0;
    color: #d1d5db;
    line-height: 1.55;
    font-size: 0.95rem;

    strong {
      color: #ffffff;
      font-weight: 700;
    }
  }
}

// ── AUTHOR ──────────────────────────────────────────────────────
.lpb-author {
  padding: 4rem 0;
  background: #f5fffa;
}

.lpb-author__grid {
  display: grid;
  gap: 2rem;
  align-items: center;

  @media (min-width: 768px) {
    grid-template-columns: 0.7fr 1fr;
  }

  figure {
    margin: 0;
    border-radius: 1.25rem;
    overflow: hidden;
    box-shadow: 0 18px 40px rgba(13, 17, 23, 0.18);
    aspect-ratio: 4 / 5;
    max-width: 320px;
    justify-self: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.8rem, 4vw, 2.4rem);
    margin: 0.4rem 0 1rem;
  }

  p {
    color: #4b5563;
    line-height: 1.6;
    margin: 0 0 1rem;
  }
}

.lpb-author__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  color: #0a9e68;
}

.lpb-author__link {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #0d1117;
  text-decoration: none;
  background: #ffffff;
  border: 1.5px solid #0d1117;
  padding: 0.65rem 1.15rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  transition: background 160ms ease, color 160ms ease;

  &:hover {
    background: #0d1117;
    color: #16c784;
  }
}

// ── FAQ ─────────────────────────────────────────────────────────
.lpb-faq {
  padding: 4rem 0;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.8vw, 2.1rem);
    text-align: center;
    margin: 0 0 2rem;
  }
}

.lpb-faq__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 820px;
  margin: 0 auto;
}

.lpb-faq__item {
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1rem;
  padding: 0.5rem 1.25rem;
  transition: border-color 160ms ease;

  &[open] {
    border-color: #16c784;
    background: #f5fffa;
  }

  summary {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.85rem 0;
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1rem;
    list-style: none;

    &::-webkit-details-marker {
      display: none;
    }

    i {
      color: #0a9e68;
      transition: transform 200ms ease;
    }
  }

  &[open] summary i {
    transform: rotate(180deg);
  }

  p {
    color: #4b5563;
    margin: 0 0 0.85rem;
    line-height: 1.55;
    font-size: 0.95rem;
  }
}

// ── FINAL ───────────────────────────────────────────────────────
.lpb-final {
  background: linear-gradient(180deg, #16c784 0%, #0a9e68 100%);
  color: #0d1117;
  padding: 4rem 0;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.7rem, 3.8vw, 2.3rem);
    margin: 0 0 0.75rem;
  }

  p {
    font-size: 1.05rem;
    margin: 0 0 1.75rem;
  }

  .lpb-hero__cta {
    background: #0d1117;
    color: #16c784;
    box-shadow: 0 14px 30px rgba(13, 17, 23, 0.4);

    &:hover {
      background: #ffffff;
      color: #0d1117;
    }
  }
}

.lpb-final__note {
  margin-top: 1rem;
  font-size: 0.85rem;
  opacity: 0.85;
}

// ── FOOTER ──────────────────────────────────────────────────────
.lpb-foot {
  padding: 2.5rem 0 3rem;
  background: #0d1117;
  color: #d1d5db;

  .lpb-container {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    align-items: center;
    text-align: center;
    font-size: 0.85rem;

    @media (min-width: 640px) {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  nav {
    display: flex;
    gap: 1.25rem;
  }

  a {
    color: #16c784;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>

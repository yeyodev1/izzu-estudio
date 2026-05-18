<script setup lang="ts">
/**
 * FunnelView.vue — /
 *
 * Landing principal de IZZU Estudio de Arquitectura.
 * Captura leads calificados para sesiones de diagnóstico técnico-legal.
 */
import { onMounted, ref } from 'vue'
import RegistrationModal from '@/components/RegistrationModal.vue'
import QualifyModal from '@/components/QualifyModal.vue'
import UrgencyBar from '@/components/UrgencyBar.vue'
import IzzuHeader from '@/components/IzzuHeader.vue'
import { captureFbParams } from '@/utils/fbclid'
import { trackPageView, trackViewContent } from '@/utils/tracking'

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
      content_name: 'IZZU Estudio - CTA Diagnóstico',
      content_category: 'diagnostico-cta',
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

const pillars = [
  {
    icon: 'fa-file-shield',
    title: 'Regularización y Blindaje Patrimonial',
    body: 'Levantamiento técnico preciso para actualizar lo construido al catastro municipal. Blindamos jurídicamente tu propiedad para que puedas vender, hipotecar o heredar sin trabas.',
  },
  {
    icon: 'fa-cubes',
    title: 'División y Propiedad Horizontal',
    body: 'Optimizamos tu terreno para obtener la mayor cantidad de lotes posibles cumpliendo la ley. Cada departamento, oficina o local con existencia jurídica propia.',
  },
  {
    icon: 'fa-draw-polygon',
    title: 'Urbanismo Estratégico',
    body: 'Aprobación de proyectos urbanísticos completos: calles, áreas verdes y equipamiento. Entrega-recepción definitiva de tu urbanización.',
  },
]

const forWho = [
  'Eres dueño de una propiedad ampliada o construida sin permisos municipales.',
  'Inversionista con terreno o macrolote que necesita dividir en solares más pequeños.',
  'Parte de una herencia familiar que requiere división legal del terreno.',
  'Promotor inmobiliario que busca la entrega-recepción de una urbanización.',
]

const notForWho = [
  'Solo estás explorando sin una propiedad específica.',
  'No tienes un inmueble con necesidad de regularización o división.',
  'Buscas solo consultas generales de construcción sin componente legal.',
]

const faq = [
  {
    q: '¿La sesión de diagnóstico tiene algún costo?',
    a: 'No, es completamente gratuita. En 20 minutos analizamos tus escrituras, el estado catastral actual y los cuellos de botella que impiden tu venta o construcción. Sin compromiso.',
  },
  {
    q: '¿Qué necesito llevar al diagnóstico?',
    a: 'Idealmente tus escrituras de propiedad y cualquier documento catastral que tengas. Si no los tienes a mano, igual podemos orientarte; el diagnóstico es flexible.',
  },
  {
    q: '¿Cuánto tiempo toma el proceso de regularización?',
    a: 'Depende de la complejidad de tu caso. En la sesión de diagnóstico te daremos una estimación clara. Casos como propiedad horizontal pueden resolverse en menos de 90 días.',
  },
  {
    q: '¿Trabajan solo en Ecuador?',
    a: 'Actualmente enfocados en Ecuador, pero podemos evaluar casos en otros países de Latinoamérica. Consulta en tu diagnóstico.',
  },
  {
    q: '¿Y si no califico para el diagnóstico?',
    a: 'No pasa nada. Te invitamos a seguir nuestro trabajo en Instagram y podrás agendar cuando tu situación cambie o cuando tengas una propiedad específica.',
  },
]
</script>

<template>
  <UrgencyBar @cta="openRegister" />
  <IzzuHeader variant="dark" cta-label="Diagnóstico gratuito" @cta="openRegister" />

  <main class="izzu">

    <!-- ── HERO (mockup match) ─────────────────────────────────── -->
    <section class="izzu-hero">
      <div class="izzu-hero__grid">

        <!-- LEFT: stylized architectural illustration -->
        <figure class="izzu-hero__illustration" aria-hidden="true">
          <svg viewBox="0 0 600 700" preserveAspectRatio="xMidYMid slice" class="izzu-hero__svg">
            <defs>
              <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#f6d7a6" />
                <stop offset="55%" stop-color="#e8b97a" />
                <stop offset="100%" stop-color="#a86b3a" />
              </linearGradient>
              <linearGradient id="b1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#3d2817" />
                <stop offset="100%" stop-color="#241409" />
              </linearGradient>
              <linearGradient id="b2" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#634532" />
                <stop offset="100%" stop-color="#3a2519" />
              </linearGradient>
              <linearGradient id="b3" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#8a6240" />
                <stop offset="100%" stop-color="#523822" />
              </linearGradient>
              <linearGradient id="window" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stop-color="#ffe4a3" stop-opacity="0.95" />
                <stop offset="100%" stop-color="#f0a850" stop-opacity="0.6" />
              </linearGradient>
            </defs>

            <!-- sky -->
            <rect width="600" height="700" fill="url(#sky)" />

            <!-- distant haze -->
            <ellipse cx="300" cy="380" rx="500" ry="120" fill="#f6d7a6" opacity="0.45" />

            <!-- back row buildings -->
            <rect x="20" y="180" width="80" height="280" fill="url(#b3)" />
            <rect x="105" y="220" width="60" height="240" fill="url(#b3)" opacity="0.85" />
            <rect x="180" y="160" width="90" height="300" fill="url(#b2)" />
            <rect x="290" y="200" width="70" height="260" fill="url(#b3)" />
            <rect x="380" y="170" width="80" height="290" fill="url(#b2)" />
            <rect x="475" y="210" width="100" height="250" fill="url(#b3)" opacity="0.9" />

            <!-- back row windows (warm glow grid) -->
            <g fill="url(#window)" opacity="0.8">
              <rect x="30" y="200" width="10" height="14" />
              <rect x="50" y="200" width="10" height="14" />
              <rect x="70" y="200" width="10" height="14" />
              <rect x="30" y="230" width="10" height="14" />
              <rect x="50" y="230" width="10" height="14" />
              <rect x="70" y="230" width="10" height="14" />
              <rect x="30" y="260" width="10" height="14" />
              <rect x="50" y="260" width="10" height="14" />
              <rect x="70" y="260" width="10" height="14" />
              <rect x="30" y="290" width="10" height="14" />
              <rect x="50" y="290" width="10" height="14" />
              <rect x="70" y="290" width="10" height="14" />

              <rect x="195" y="180" width="12" height="16" />
              <rect x="215" y="180" width="12" height="16" />
              <rect x="235" y="180" width="12" height="16" />
              <rect x="195" y="210" width="12" height="16" />
              <rect x="215" y="210" width="12" height="16" />
              <rect x="235" y="210" width="12" height="16" />
              <rect x="195" y="240" width="12" height="16" />
              <rect x="215" y="240" width="12" height="16" />
              <rect x="235" y="240" width="12" height="16" />
              <rect x="195" y="270" width="12" height="16" />
              <rect x="215" y="270" width="12" height="16" />
              <rect x="235" y="270" width="12" height="16" />

              <rect x="395" y="190" width="12" height="16" />
              <rect x="415" y="190" width="12" height="16" />
              <rect x="435" y="190" width="12" height="16" />
              <rect x="395" y="220" width="12" height="16" />
              <rect x="415" y="220" width="12" height="16" />
              <rect x="435" y="220" width="12" height="16" />
              <rect x="395" y="250" width="12" height="16" />
              <rect x="415" y="250" width="12" height="16" />
              <rect x="435" y="250" width="12" height="16" />
              <rect x="395" y="280" width="12" height="16" />
              <rect x="415" y="280" width="12" height="16" />
              <rect x="435" y="280" width="12" height="16" />
            </g>

            <!-- front large block -->
            <rect x="60" y="320" width="240" height="380" fill="url(#b1)" />
            <!-- step roof -->
            <polygon points="60,320 60,300 200,300 200,310 300,310 300,320" fill="#1a0c05" />

            <!-- front large windows grid -->
            <g fill="url(#window)">
              <rect x="80" y="340" width="22" height="28" />
              <rect x="115" y="340" width="22" height="28" />
              <rect x="150" y="340" width="22" height="28" />
              <rect x="185" y="340" width="22" height="28" />
              <rect x="220" y="340" width="22" height="28" />
              <rect x="255" y="340" width="22" height="28" />

              <rect x="80" y="385" width="22" height="28" />
              <rect x="115" y="385" width="22" height="28" />
              <rect x="150" y="385" width="22" height="28" />
              <rect x="185" y="385" width="22" height="28" />
              <rect x="220" y="385" width="22" height="28" opacity="0.55" />
              <rect x="255" y="385" width="22" height="28" />

              <rect x="80" y="430" width="22" height="28" />
              <rect x="115" y="430" width="22" height="28" opacity="0.45" />
              <rect x="150" y="430" width="22" height="28" />
              <rect x="185" y="430" width="22" height="28" />
              <rect x="220" y="430" width="22" height="28" />
              <rect x="255" y="430" width="22" height="28" />

              <rect x="80" y="475" width="22" height="28" />
              <rect x="115" y="475" width="22" height="28" />
              <rect x="150" y="475" width="22" height="28" />
              <rect x="185" y="475" width="22" height="28" opacity="0.6" />
              <rect x="220" y="475" width="22" height="28" />
              <rect x="255" y="475" width="22" height="28" />

              <rect x="80" y="520" width="22" height="28" />
              <rect x="115" y="520" width="22" height="28" />
              <rect x="150" y="520" width="22" height="28" />
              <rect x="185" y="520" width="22" height="28" />
              <rect x="220" y="520" width="22" height="28" />
              <rect x="255" y="520" width="22" height="28" />

              <rect x="80" y="565" width="22" height="28" />
              <rect x="115" y="565" width="22" height="28" />
              <rect x="150" y="565" width="22" height="28" opacity="0.5" />
              <rect x="185" y="565" width="22" height="28" />
              <rect x="220" y="565" width="22" height="28" />
              <rect x="255" y="565" width="22" height="28" />

              <rect x="80" y="610" width="22" height="28" />
              <rect x="115" y="610" width="22" height="28" />
              <rect x="150" y="610" width="22" height="28" />
              <rect x="185" y="610" width="22" height="28" />
              <rect x="220" y="610" width="22" height="28" />
              <rect x="255" y="610" width="22" height="28" />
            </g>

            <!-- secondary front block -->
            <rect x="310" y="380" width="190" height="320" fill="url(#b2)" />
            <polygon points="310,380 310,370 500,370 500,380" fill="#28170c" />

            <g fill="url(#window)">
              <rect x="325" y="400" width="18" height="22" />
              <rect x="355" y="400" width="18" height="22" />
              <rect x="385" y="400" width="18" height="22" />
              <rect x="415" y="400" width="18" height="22" />
              <rect x="445" y="400" width="18" height="22" />
              <rect x="475" y="400" width="18" height="22" />

              <rect x="325" y="435" width="18" height="22" />
              <rect x="355" y="435" width="18" height="22" />
              <rect x="385" y="435" width="18" height="22" opacity="0.45" />
              <rect x="415" y="435" width="18" height="22" />
              <rect x="445" y="435" width="18" height="22" />
              <rect x="475" y="435" width="18" height="22" />

              <rect x="325" y="470" width="18" height="22" />
              <rect x="355" y="470" width="18" height="22" />
              <rect x="385" y="470" width="18" height="22" />
              <rect x="415" y="470" width="18" height="22" />
              <rect x="445" y="470" width="18" height="22" opacity="0.55" />
              <rect x="475" y="470" width="18" height="22" />

              <rect x="325" y="505" width="18" height="22" />
              <rect x="355" y="505" width="18" height="22" />
              <rect x="385" y="505" width="18" height="22" />
              <rect x="415" y="505" width="18" height="22" />
              <rect x="445" y="505" width="18" height="22" />
              <rect x="475" y="505" width="18" height="22" />

              <rect x="325" y="540" width="18" height="22" />
              <rect x="355" y="540" width="18" height="22" />
              <rect x="385" y="540" width="18" height="22" />
              <rect x="415" y="540" width="18" height="22" />
              <rect x="445" y="540" width="18" height="22" />
              <rect x="475" y="540" width="18" height="22" />

              <rect x="325" y="575" width="18" height="22" />
              <rect x="355" y="575" width="18" height="22" />
              <rect x="385" y="575" width="18" height="22" />
              <rect x="415" y="575" width="18" height="22" />
              <rect x="445" y="575" width="18" height="22" />
              <rect x="475" y="575" width="18" height="22" />

              <rect x="325" y="610" width="18" height="22" />
              <rect x="355" y="610" width="18" height="22" />
              <rect x="385" y="610" width="18" height="22" />
              <rect x="415" y="610" width="18" height="22" />
              <rect x="445" y="610" width="18" height="22" />
              <rect x="475" y="610" width="18" height="22" />
            </g>

            <!-- foliage / trees -->
            <g>
              <circle cx="40" cy="660" r="34" fill="#3a5a2a" />
              <circle cx="80" cy="655" r="28" fill="#4a6e34" />
              <rect x="38" y="655" width="6" height="40" fill="#2a1a0d" />
            </g>
            <g>
              <circle cx="540" cy="660" r="30" fill="#3a5a2a" />
              <circle cx="575" cy="668" r="25" fill="#4a6e34" />
              <rect x="538" y="660" width="6" height="35" fill="#2a1a0d" />
            </g>

            <!-- ground -->
            <rect x="0" y="690" width="600" height="10" fill="#1a0c05" />
          </svg>
          <div class="izzu-hero__illustration-vignette" />
        </figure>

        <!-- RIGHT: dark content + video PIP -->
        <div class="izzu-hero__panel">

          <button
            type="button"
            class="izzu-hero__pip"
            @click="openRegister"
            aria-label="Agendar mi diagnóstico gratuito"
          >
            <img
              src="/izzu-thumbnail.png"
              alt="Diagnóstico técnico-legal IZZU Estudio"
              class="izzu-hero__pip-thumb"
              loading="eager"
            />
            <span class="izzu-hero__pip-overlay" aria-hidden="true">
              <span class="izzu-hero__pip-badge">
                <i class="fa-solid fa-hand-pointer" />
                <strong>Haz click aquí</strong>
                <em>Agenda tu diagnóstico</em>
              </span>
            </span>
            <span class="izzu-hero__pip-tag" aria-hidden="true">
              <i class="fa-solid fa-circle" />
              GRATIS
            </span>
          </button>

          <span class="izzu-hero__eyebrow">
            <i class="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            Alerta patrimonial 2026
          </span>

          <h1 class="izzu-hero__title">
            Tu propiedad podría estar perdiendo hasta un
            <span class="izzu-hero__title-accent">30%</span>
            de su valor <span class="izzu-hero__title-soft">por un error de registro</span>
          </h1>

          <p class="izzu-hero__subtitle">
            Muchos propietarios descubren demasiado tarde que no pueden vender, hipotecar ni heredar
            porque su construcción <strong>no «existe» legalmente</strong>. En
            <strong>IZZU Estudio de Arquitectura</strong> diseñamos soluciones que se reflejan en
            escrituras y en el catastro municipal.
          </p>

          <ul class="izzu-hero__bullets">
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Diagnóstico técnico-legal sin costo</li>
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Análisis de escrituras + estado catastral</li>
            <li><i class="fa-solid fa-circle-check" aria-hidden="true" /> Hoja de ruta clara para regularizar o dividir</li>
          </ul>

          <div class="izzu-hero__actions">
            <button class="izzu-hero__cta" type="button" @click="openRegister">
              <i class="fa-solid fa-calendar-check" aria-hidden="true" />
              Quiero mi diagnóstico gratuito
              <i class="fa-solid fa-arrow-right izzu-hero__cta-arrow" aria-hidden="true" />
            </button>
          </div>

          <p class="izzu-hero__legal">
            <i class="fa-solid fa-shield-halved" aria-hidden="true" />
            Sin compromiso · Sesión de 20 minutos · 100% gratuita
          </p>

          <div class="izzu-hero__trust">
            <div class="izzu-hero__trust-item">
              <strong>+150</strong>
              <span>Propiedades regularizadas</span>
            </div>
            <div class="izzu-hero__trust-item">
              <strong>&lt;90 días</strong>
              <span>Propiedad horizontal</span>
            </div>
            <div class="izzu-hero__trust-item">
              <strong>100%</strong>
              <span>Hecho por arquitectos</span>
            </div>
          </div>

        </div>
      </div>
    </section>

    <!-- ── PROMESA ─────────────────────────────────────────────── -->
    <section class="izzu-promise">
      <div class="izzu-container">
        <span class="izzu-promise__eyebrow">Nuestra metodología</span>
        <h2>Blindamos tu patrimonio con estrategia técnica y legal</h2>
        <p>
          En IZZU no solo dibujamos planos. Diseñamos soluciones que se ven reflejadas en las
          escrituras y en el catastro municipal. Hemos trabajado con inversionistas que tenían
          edificios enteros detenidos porque no podían individualizar las unidades.
        </p>
      </div>
    </section>

    <!-- ── PILARES ─────────────────────────────────────────────── -->
    <section class="izzu-pillars">
      <div class="izzu-container">
        <span class="izzu-section-eyebrow">¿Cómo te ayudamos?</span>
        <h2>Tres pilares para blindar tu activo</h2>
        <p class="izzu-pillars__lead">
          Cubrimos toda la cadena de regularización patrimonial — desde el levantamiento técnico
          hasta la entrega-recepción municipal.
        </p>
        <div class="izzu-pillars__grid">
          <article v-for="item in pillars" :key="item.title" class="izzu-card">
            <span class="izzu-card__icon">
              <i :class="['fa-solid', item.icon]" aria-hidden="true" />
            </span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ── CASOS ───────────────────────────────────────────────── -->
    <section class="izzu-cases">
      <div class="izzu-container">
        <span class="izzu-section-eyebrow">Casos reales</span>
        <h2>De activo detenido a escritura individual</h2>

        <div class="izzu-cases__grid">
          <article class="izzu-case">
            <div class="izzu-case__num">01</div>
            <h3>Doña Elena — Propiedad Horizontal</h3>
            <p>
              Edificio de 4 departamentos. El banco negó el crédito a los compradores porque
              legalmente era una sola casa. Levantamiento, áreas comunes y privativas, cuadro de
              alícuotas y declaratoria. Hoy cada departamento tiene su propia escritura.
            </p>
            <span class="izzu-case__tag">
              <i class="fa-solid fa-check" /> Resuelto · &lt;90 días
            </span>
          </article>

          <article class="izzu-case">
            <div class="izzu-case__num">02</div>
            <h3>Inversiones G&amp;S — Edificio comercial</h3>
            <p>
              Capital muerto: edificio sin declaratoria al Régimen de Propiedad Horizontal, cero
              ventas. Levantamiento, cuadro de alícuotas y aprobación municipal en tiempo récord.
              Pasaron a cerrar ventas individuales por oficina.
            </p>
            <span class="izzu-case__tag">
              <i class="fa-solid fa-check" /> Resuelto · ROI inmediato
            </span>
          </article>
        </div>
      </div>
    </section>

    <!-- ── FOR / NOT FOR ───────────────────────────────────────── -->
    <section class="izzu-fitwho">
      <div class="izzu-container">
        <span class="izzu-section-eyebrow">¿Es para ti?</span>
        <h2 class="izzu-fitwho__title">Diagnóstico solo para casos calificados</h2>
        <div class="izzu-fitwho__grid">
          <div class="izzu-fitwho__col izzu-fitwho__col--for">
            <h3>
              <i class="fa-solid fa-circle-check" aria-hidden="true" />
              Este diagnóstico es para ti si…
            </h3>
            <ul>
              <li v-for="line in forWho" :key="line">
                <i class="fa-solid fa-check" aria-hidden="true" />
                <span>{{ line }}</span>
              </li>
            </ul>
          </div>
          <div class="izzu-fitwho__col izzu-fitwho__col--not">
            <h3>
              <i class="fa-solid fa-circle-xmark" aria-hidden="true" />
              No es para ti si…
            </h3>
            <ul>
              <li v-for="line in notForWho" :key="line">
                <i class="fa-solid fa-xmark" aria-hidden="true" />
                <span>{{ line }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ── STEPS ───────────────────────────────────────────────── -->
    <section class="izzu-steps">
      <div class="izzu-container">
        <span class="izzu-steps__eyebrow">El proceso</span>
        <h2>Así funciona tu diagnóstico gratuito</h2>
        <ol class="izzu-steps__list">
          <li>
            <span>1</span>
            <p><strong>Agendas tu sesión.</strong> Te registras y en minutos recibes la confirmación.</p>
          </li>
          <li>
            <span>2</span>
            <p><strong>Nos contactamos contigo.</strong> Coordinamos la llamada o videollamada de 20 minutos.</p>
          </li>
          <li>
            <span>3</span>
            <p><strong>Analizamos tu caso.</strong> Revisamos escrituras, estado catastral y cuellos de botella.</p>
          </li>
          <li>
            <span>4</span>
            <p><strong>Recibes tu estrategia.</strong> Te entregamos la hoja de ruta para regularizar o dividir.</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── ABOUT ───────────────────────────────────────────────── -->
    <section class="izzu-about">
      <div class="izzu-container izzu-about__grid">
        <div class="izzu-about__visual">
          <img src="/izzu-logo.jpeg" alt="IZZU Estudio de Arquitectura" />
        </div>
        <div>
          <span class="izzu-about__eyebrow">Quiénes somos</span>
          <h2>IZZU Estudio de Arquitectura</h2>
          <p>
            Estudio ecuatoriano especializado en regularización de edificaciones, propiedad
            horizontal, división de solares y urbanismo estratégico. Trabajamos con propietarios,
            inversionistas, herederos y desarrolladores para blindar legalmente su patrimonio.
          </p>
          <p>
            Combinamos el rigor técnico de la arquitectura con la precisión legal que exige el
            catastro municipal. No solo hacemos planos — hacemos que tu propiedad exista
            legalmente.
          </p>
          <a
            href="https://www.instagram.com/izzuestudio/"
            target="_blank"
            rel="noopener noreferrer"
            class="izzu-about__link"
          >
            <i class="fa-brands fa-instagram" aria-hidden="true" />
            @izzuestudio
          </a>
        </div>
      </div>
    </section>

    <!-- ── FAQ ─────────────────────────────────────────────────── -->
    <section class="izzu-faq">
      <div class="izzu-container">
        <span class="izzu-section-eyebrow">Resolvemos tus dudas</span>
        <h2>Preguntas frecuentes</h2>
        <div class="izzu-faq__list">
          <details v-for="item in faq" :key="item.q" class="izzu-faq__item">
            <summary>
              <span>{{ item.q }}</span>
              <i class="fa-solid fa-chevron-down" aria-hidden="true" />
            </summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ── FINAL CTA ───────────────────────────────────────────── -->
    <section class="izzu-final">
      <div class="izzu-container">
        <span class="izzu-final__badge">
          <i class="fa-solid fa-bolt" aria-hidden="true" />
          Cupos limitados esta semana
        </span>
        <h2>Tu patrimonio no puede esperar</h2>
        <p>
          Agenda tu diagnóstico gratuito de 20 minutos y descubre cómo blindar tu propiedad.
        </p>
        <div class="izzu-final__actions">
          <button class="izzu-hero__cta" type="button" @click="openRegister">
            <i class="fa-solid fa-calendar-check" aria-hidden="true" />
            Agendar mi diagnóstico
            <i class="fa-solid fa-arrow-right" aria-hidden="true" />
          </button>
        </div>
        <p class="izzu-final__note">
          Sin compromiso · Sesión de 20 minutos · 100% gratuito
        </p>
      </div>
    </section>

    <footer class="izzu-foot">
      <div class="izzu-container">
        <div class="izzu-foot__brand">
          <img src="/izzu-logo.jpeg" alt="IZZU" />
          <span>© IZZU Estudio de Arquitectura</span>
        </div>
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
$primary: #1B365D;
$accent:  #C4956A;
$accent-d: #A0784F;
$dark:    #0D1117;
$light:   #F5F7FA;

.izzu {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: $dark;
  background: #ffffff;
}

.izzu-container {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media (min-width: 768px) { padding: 0 2rem; }
}

.izzu-section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.74rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: $accent;

  &::before {
    content: '';
    display: inline-block;
    width: 22px;
    height: 2px;
    background: $accent;
  }
}

// ════════════════════════════════════════════════════════════════
// HERO
// ════════════════════════════════════════════════════════════════
.izzu-hero {
  background: linear-gradient(180deg, #0a0d12 0%, #16202d 100%);
  color: #ffffff;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.izzu-hero__grid {
  display: grid;
  grid-template-columns: 1fr;
  min-height: 70vh;

  @media (min-width: 960px) {
    grid-template-columns: 1.05fr 1fr;
    min-height: 78vh;
  }
}

.izzu-hero__illustration {
  position: relative;
  margin: 0;
  min-height: 280px;
  background: #3a2519;

  @media (min-width: 960px) { min-height: 100%; }
}

.izzu-hero__svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.izzu-hero__illustration-vignette {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 80% 50%, transparent 0%, rgba(13, 17, 23, 0.55) 70%, rgba(13, 17, 23, 0.85) 100%),
    linear-gradient(180deg, transparent 60%, rgba(13, 17, 23, 0.4) 100%);
  pointer-events: none;

  @media (min-width: 960px) {
    background:
      linear-gradient(90deg, transparent 50%, rgba(13, 17, 23, 0.65) 100%),
      linear-gradient(180deg, transparent 70%, rgba(13, 17, 23, 0.5) 100%);
  }
}

.izzu-hero__panel {
  position: relative;
  padding: 3rem 1.5rem 3.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  max-width: 620px;
  justify-content: center;

  @media (min-width: 768px) { padding: 3.5rem 2.5rem 4rem; }
  @media (min-width: 960px) { padding: 4rem 3rem 4.5rem 3rem; }
}

// Hero image PIP — fixed floating callout that follows scroll, opens register modal
.izzu-hero__pip {
  position: relative;
  width: 100%;
  max-width: 280px;
  aspect-ratio: 16 / 9;
  border-radius: 1rem;
  overflow: hidden;
  border: 3px solid $accent;
  cursor: pointer;
  padding: 0;
  background: #0d1117;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), 0 0 0 6px rgba(196, 149, 106, 0.18);
  transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
  margin: 0 auto 0.75rem;
  animation: izzu-pip-pulse 1.8s ease-in-out infinite;
  display: block;

  @media (min-width: 768px) {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    top: auto;
    width: 300px;
    margin: 0;
    z-index: 7800;
  }

  &:hover {
    transform: translateY(-4px) scale(1.04);
    border-color: #fbbf24;
    box-shadow: 0 26px 60px rgba(251, 191, 36, 0.55), 0 0 0 8px rgba(251, 191, 36, 0.22);
    animation-play-state: paused;
  }
}

.izzu-hero__pip-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: brightness(0.6) saturate(1.1);
  transition: filter 220ms ease;

  .izzu-hero__pip:hover & { filter: brightness(0.5); }
}

.izzu-hero__pip-overlay {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  background: radial-gradient(circle at center, rgba(13, 17, 23, 0.25) 0%, rgba(13, 17, 23, 0.7) 100%);
  pointer-events: none;
  padding: 0.5rem;
}

.izzu-hero__pip-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  background: linear-gradient(135deg, #fbbf24 0%, $accent 100%);
  color: $dark;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  padding: 0.85rem 1.15rem;
  border-radius: 0.9rem;
  box-shadow:
    0 12px 30px rgba(251, 191, 36, 0.55),
    0 0 0 3px rgba(255, 255, 255, 0.85),
    0 0 0 5px rgba(251, 191, 36, 0.4);
  text-align: center;
  animation: izzu-pip-bounce 1.6s ease-in-out infinite;
  max-width: 92%;

  i {
    font-size: 1.4rem;
    color: $dark;
    animation: izzu-pip-tap 1s ease-in-out infinite;
  }

  strong {
    font-size: 0.95rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    line-height: 1;
    margin-top: 0.15rem;
  }

  em {
    font-style: normal;
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    opacity: 0.78;
    line-height: 1;
  }
}

.izzu-hero__pip-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #ef4444;
  color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 0.65rem;
  letter-spacing: 0.1em;
  padding: 0.28rem 0.55rem;
  border-radius: 999px;
  text-transform: uppercase;
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.5);
  pointer-events: none;

  i {
    font-size: 0.42rem;
    animation: izzu-pip-blink 1s ease-in-out infinite;
  }
}

@keyframes izzu-pip-pulse {
  0%, 100% { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), 0 0 0 6px rgba(196, 149, 106, 0.18), 0 0 0 6px rgba(196, 149, 106, 0.18); }
  50%      { box-shadow: 0 18px 50px rgba(0, 0, 0, 0.6), 0 0 0 6px rgba(196, 149, 106, 0.18), 0 0 0 18px rgba(196, 149, 106, 0); }
}
@keyframes izzu-pip-bounce {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-4px) scale(1.03); }
}
@keyframes izzu-pip-tap {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  50% { transform: translate(2px, 2px) rotate(-8deg); }
}
@keyframes izzu-pip-blink {
  0%, 60% { opacity: 1; }
  61%, 100% { opacity: 0.35; }
}

@media (prefers-reduced-motion: reduce) {
  .izzu-hero__pip, .izzu-hero__pip-badge, .izzu-hero__pip-badge i, .izzu-hero__pip-tag i {
    animation: none;
  }
}

.izzu-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(196, 149, 106, 0.14);
  color: $accent;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.74rem;
  letter-spacing: 0.1em;
  padding: 0.45rem 0.9rem;
  border: 1px solid rgba(196, 149, 106, 0.3);
  border-radius: 999px;
  text-transform: uppercase;
  width: max-content;
  margin-top: 0;

  i { font-size: 0.78rem; }
}

.izzu-hero__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.85rem, 5.4vw, 3.1rem);
  line-height: 1.08;
  letter-spacing: -0.01em;
  margin: 0;
  color: #ffffff;
}

.izzu-hero__title-accent {
  color: $accent;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.06em;
    height: 0.12em;
    background: rgba(196, 149, 106, 0.35);
    border-radius: 999px;
  }
}

.izzu-hero__title-soft {
  color: #d8c5a8;
  font-weight: 700;
}

.izzu-hero__subtitle {
  font-size: clamp(0.95rem, 1.8vw, 1.05rem);
  line-height: 1.6;
  color: #c8d2dd;
  margin: 0;
  max-width: 540px;

  strong { color: #ffffff; font-weight: 700; }
}

.izzu-hero__bullets {
  list-style: none;
  padding: 0;
  margin: 0.25rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.92rem;
    color: #e2e8f0;
  }

  i { color: $accent; font-size: 0.95rem; }
}

.izzu-hero__actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-top: 0.65rem;

  @media (min-width: 540px) { flex-direction: row; flex-wrap: wrap; }
}

.izzu-hero__cta {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  background: $accent;
  color: $dark;
  border: 0;
  border-radius: 0.95rem;
  padding: 1.05rem 1.55rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1rem;
  letter-spacing: 0.02em;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(196, 149, 106, 0.4);
  transition: transform 140ms ease, background 160ms ease, color 160ms ease, box-shadow 200ms ease;
  position: relative;

  &:hover {
    background: #ffffff;
    color: $primary;
    transform: translateY(-2px);
    box-shadow: 0 18px 40px rgba(255, 255, 255, 0.25);
  }

  i { font-size: 0.78rem; }

  .izzu-hero__cta-arrow { transition: transform 200ms ease; }
  &:hover .izzu-hero__cta-arrow { transform: translateX(4px); }
}

.izzu-hero__cta--ghost {
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  box-shadow: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: $accent;
    color: $accent;
    box-shadow: none;
  }
}

.izzu-hero__cta--ghost-dark {
  background: transparent;
  color: #ffffff;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  box-shadow: none;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: $accent;
    color: $accent;
    box-shadow: none;
  }
}

.izzu-hero__legal {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0.4rem 0 0;

  i { color: $accent; }
}

.izzu-hero__trust {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.izzu-hero__trust-item {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  strong {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.05rem, 2.4vw, 1.4rem);
    color: $accent;
  }

  span {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.3;
  }
}

// ════════════════════════════════════════════════════════════════
// PROMISE
// ════════════════════════════════════════════════════════════════
.izzu-promise {
  background: $dark;
  color: #ffffff;
  padding: 3.5rem 0;
  text-align: center;
  border-top: 1px solid rgba(196, 149, 106, 0.15);

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.55rem, 3.5vw, 2.2rem);
    margin: 0.65rem 0 1rem;
    line-height: 1.18;
  }

  p {
    color: #c8d2dd;
    max-width: 720px;
    margin: 0 auto;
    line-height: 1.65;
  }
}

.izzu-promise__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.74rem;
  color: $accent;
}

// ════════════════════════════════════════════════════════════════
// PILLARS
// ════════════════════════════════════════════════════════════════
.izzu-pillars {
  padding: 4.5rem 0;
  background: $light;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.65rem, 3.8vw, 2.4rem);
    margin: 0.6rem 0 0.5rem;
    color: $primary;
  }
}

.izzu-pillars__lead {
  color: #4b5563;
  max-width: 640px;
  margin: 0 auto 2.5rem;
  line-height: 1.6;
}

.izzu-pillars__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
  text-align: left;

  @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
}

.izzu-card {
  background: #ffffff;
  border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 24px 50px rgba(27, 54, 93, 0.12);
    border-color: rgba(196, 149, 106, 0.3);
  }

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.1rem;
    margin: 0;
    color: $primary;
  }

  p {
    margin: 0;
    color: #4b5563;
    font-size: 0.95rem;
    line-height: 1.55;
  }
}

.izzu-card__icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.85rem;
  background: linear-gradient(135deg, $primary 0%, #2a4a7a 100%);
  color: $accent;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  margin-bottom: 0.4rem;
  box-shadow: 0 8px 20px rgba(27, 54, 93, 0.25);
}

// ════════════════════════════════════════════════════════════════
// CASES
// ════════════════════════════════════════════════════════════════
.izzu-cases {
  padding: 4.5rem 0;
  background: #ffffff;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.8vw, 2.2rem);
    margin: 0.6rem 0 2.25rem;
    color: $primary;
  }
}

.izzu-cases__grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: 1fr;
  text-align: left;

  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}

.izzu-case {
  background: linear-gradient(180deg, #ffffff 0%, $light 100%);
  border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem;
  padding: 1.75rem 1.5rem;
  position: relative;
  transition: transform 200ms ease, box-shadow 200ms ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 24px 50px rgba(27, 54, 93, 0.12);
  }

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    margin: 0.75rem 0 0.65rem;
    color: $primary;
  }

  p {
    margin: 0 0 1rem;
    color: #4b5563;
    line-height: 1.6;
    font-size: 0.95rem;
  }
}

.izzu-case__num {
  display: inline-block;
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: 1.6rem;
  color: $accent;
  letter-spacing: 0.05em;
}

.izzu-case__tag {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(34, 197, 94, 0.12);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.25);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.72rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;

  i { font-size: 0.62rem; }
}

// ════════════════════════════════════════════════════════════════
// FOR / NOT FOR
// ════════════════════════════════════════════════════════════════
.izzu-fitwho {
  padding: 4.5rem 0;
  background: $light;
  text-align: center;
}

.izzu-fitwho__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800;
  font-size: clamp(1.6rem, 3.6vw, 2.2rem);
  margin: 0.6rem 0 2rem;
  color: $primary;
}

.izzu-fitwho__grid {
  display: grid;
  gap: 1.25rem;
  text-align: left;

  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
}

.izzu-fitwho__col {
  border-radius: 1.25rem;
  padding: 2rem 1.75rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1.15rem;
    margin: 0 0 1.5rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 0.65rem;

    > i:first-child {
      font-size: 1.35rem;
      width: auto;
      height: auto;
      background: transparent !important;
      flex-shrink: 0;
    }
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.95rem;
    color: #1f2933;
    line-height: 1.55;

    li {
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
      font-size: 0.95rem;

      > i {
        flex-shrink: 0;
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 999px;
        display: inline-grid;
        place-items: center;
        font-size: 0.7rem;
        margin-top: 0.15rem;
        line-height: 1;
      }

      span { flex: 1; line-height: 1.55; }
    }
  }
}

.izzu-fitwho__col--for {
  background: #ffffff;
  border: 2px solid $primary;
  box-shadow: 0 12px 30px rgba(27, 54, 93, 0.08);

  h3 {
    color: $primary;
    > i:first-child { color: $primary; }
  }
  ul li > i { background: $primary; color: $accent; }
}

.izzu-fitwho__col--not {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);

  h3 {
    color: #6b7280;
    > i:first-child { color: #9ca3af; }
  }
  ul li > i { background: #e5e9ec; color: #6b7280; }
  ul li span { color: #6b7280; }
}

// ════════════════════════════════════════════════════════════════
// STEPS
// ════════════════════════════════════════════════════════════════
.izzu-steps {
  background: $dark;
  color: #ffffff;
  padding: 4.5rem 0;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.8vw, 2.2rem);
    margin: 0.6rem 0 2.25rem;
    max-width: 720px;
    margin-inline: auto;
    line-height: 1.18;
  }
}

.izzu-steps__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.74rem;
  color: $accent;
}

.izzu-steps__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 1rem;
  text-align: left;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.25rem;
  }

  li {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(196, 149, 106, 0.15);
    border-radius: 1rem;
    padding: 1.35rem;
    transition: border-color 200ms ease, background 200ms ease;

    &:hover {
      border-color: rgba(196, 149, 106, 0.4);
      background: rgba(196, 149, 106, 0.06);
    }
  }

  span {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 999px;
    background: $accent;
    color: $dark;
    display: grid;
    place-items: center;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 800;
    flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(196, 149, 106, 0.12);
  }

  p {
    margin: 0;
    color: #c8d2dd;
    line-height: 1.55;
    font-size: 0.95rem;

    strong { color: #ffffff; font-weight: 700; }
  }
}

// ════════════════════════════════════════════════════════════════
// ABOUT
// ════════════════════════════════════════════════════════════════
.izzu-about {
  padding: 4.5rem 0;
  background: $light;
}

.izzu-about__grid {
  display: grid;
  gap: 2rem;
  align-items: center;

  @media (min-width: 768px) { grid-template-columns: 0.6fr 1fr; }

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.7rem, 4vw, 2.3rem);
    margin: 0.4rem 0 1rem;
    color: $primary;
  }

  p {
    color: #4b5563;
    line-height: 1.65;
    margin: 0 0 1rem;
  }
}

.izzu-about__eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.74rem;
  color: $accent-d;
}

.izzu-about__visual {
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 24px 50px rgba(13, 17, 23, 0.18);
  aspect-ratio: 1 / 1;
  max-width: 320px;
  justify-self: center;
  background: #ffffff;
  display: grid;
  place-items: center;
  padding: 1.5rem;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
  }
}

.izzu-about__link {
  margin-top: 0.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: $dark;
  text-decoration: none;
  background: #ffffff;
  border: 1.5px solid $dark;
  padding: 0.7rem 1.25rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  transition: background 160ms ease, color 160ms ease, transform 140ms ease;

  &:hover {
    background: $dark;
    color: $accent;
    transform: translateY(-1px);
  }
}

// ════════════════════════════════════════════════════════════════
// FAQ
// ════════════════════════════════════════════════════════════════
.izzu-faq {
  padding: 4.5rem 0;
  background: #ffffff;
  text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.6rem, 3.6vw, 2.1rem);
    margin: 0.6rem 0 2.25rem;
    color: $primary;
  }
}

.izzu-faq__list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 820px;
  margin: 0 auto;
  text-align: left;
}

.izzu-faq__item {
  background: #ffffff;
  border: 1.5px solid #e5e9ec;
  border-radius: 1rem;
  padding: 0.4rem 1.25rem;
  transition: border-color 160ms ease, box-shadow 200ms ease;

  &[open] {
    border-color: $accent;
    background: $light;
    box-shadow: 0 10px 30px rgba(27, 54, 93, 0.07);
  }

  summary {
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    padding: 0.95rem 0;
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700;
    font-size: 1rem;
    list-style: none;
    color: $primary;

    &::-webkit-details-marker { display: none; }

    i {
      color: $accent-d;
      transition: transform 200ms ease;
    }
  }

  &[open] summary i { transform: rotate(180deg); }

  p {
    color: #4b5563;
    margin: 0 0 0.95rem;
    line-height: 1.6;
    font-size: 0.95rem;
  }
}

// ════════════════════════════════════════════════════════════════
// FINAL
// ════════════════════════════════════════════════════════════════
.izzu-final {
  background: linear-gradient(135deg, $primary 0%, $dark 100%);
  color: #ffffff;
  padding: 5rem 0;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(196, 149, 106, 0.18), transparent 50%);
    pointer-events: none;
  }

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800;
    font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin: 1rem 0 0.85rem;
    line-height: 1.15;
    position: relative;
  }

  p {
    font-size: 1.05rem;
    margin: 0 0 2rem;
    color: #c8d2dd;
    position: relative;
  }
}

.izzu-final__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(251, 191, 36, 0.14);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 0.45rem 1rem;
  border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  position: relative;
}

.izzu-final__actions {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  position: relative;

  @media (min-width: 540px) { flex-direction: row; }
}

.izzu-final__note {
  margin-top: 1.25rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.65) !important;
  position: relative;
}

// ════════════════════════════════════════════════════════════════
// FOOTER
// ════════════════════════════════════════════════════════════════
.izzu-foot {
  padding: 2.25rem 0 2.75rem;
  background: $dark;
  color: #c8d2dd;
  border-top: 1px solid rgba(196, 149, 106, 0.15);

  .izzu-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
    text-align: center;
    font-size: 0.85rem;

    @media (min-width: 640px) {
      flex-direction: row;
      justify-content: space-between;
    }
  }

  nav { display: flex; gap: 1.25rem; }

  a {
    color: $accent;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}

.izzu-foot__brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;

  img {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    object-fit: cover;
    background: #ffffff;
  }
}
</style>

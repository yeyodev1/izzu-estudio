<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { parsePhoneNumberFromString, getCountries, getCountryCallingCode, AsYouType } from 'libphonenumber-js'
import IzzuHeader from '@/components/IzzuHeader.vue'
import UrgencyBar from '@/components/UrgencyBar.vue'
import RegistrationModal from '@/components/RegistrationModal.vue'
import { captureFbParams, getStoredFbParams } from '@/utils/fbclid'
import { trackPageView, trackLead } from '@/utils/tracking'

const router = useRouter()

const modalOpen = ref(false)

// ── Country picker setup ────────────────────────────────────────
interface Country { code: string; name: string; dial: string; flag: string }
const flagEmoji = (code: string) =>
  [...code.toUpperCase()].map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0))).join('')

const PRIORITY = ['EC', 'CO', 'PE', 'MX', 'AR', 'CL', 'VE', 'BO', 'PY', 'UY', 'GT', 'HN', 'SV', 'CR', 'PA', 'DO', 'CU', 'US', 'ES']
const nameMap: Record<string, string> = {
  EC: 'Ecuador', CO: 'Colombia', PE: 'Perú', MX: 'México', AR: 'Argentina', CL: 'Chile',
  VE: 'Venezuela', BO: 'Bolivia', PY: 'Paraguay', UY: 'Uruguay', GT: 'Guatemala',
  HN: 'Honduras', SV: 'El Salvador', CR: 'Costa Rica', PA: 'Panamá', DO: 'Rep. Dominicana',
  CU: 'Cuba', US: 'Estados Unidos', ES: 'España', BR: 'Brasil',
}
const allCountries: Country[] = getCountries().map(code => ({
  code, name: nameMap[code] ?? code, dial: '+' + getCountryCallingCode(code), flag: flagEmoji(code),
}))
const priorityList = PRIORITY.map(code => allCountries.find(c => c.code === code)).filter(Boolean) as Country[]
const otherList = allCountries.filter(c => !PRIORITY.includes(c.code)).sort((a, b) => a.name.localeCompare(b.name))
const countries: Country[] = [...priorityList, { code: '---', name: '─────────', dial: '', flag: '' }, ...otherList]

const selectedCountry = ref<Country>(priorityList[0])
const dropdownOpen = ref(false)
const countrySearch = ref('')
const submitting = ref(false)

const form = ref({ nombre: '', apellido: '', email: '', phone: '' })
const errors = ref<Record<string, string>>({})
const touched = ref<Record<string, boolean>>({})

const formattedPhone = computed(() =>
  form.value.phone ? new AsYouType(selectedCountry.value.code as any).input(form.value.phone) : '',
)
const phoneValid = computed(() => {
  const full = selectedCountry.value.dial + form.value.phone.replace(/\s/g, '')
  return parsePhoneNumberFromString(full, selectedCountry.value.code as any)?.isValid() ?? false
})
const parsedPhoneE164 = computed(() => {
  const full = selectedCountry.value.dial + form.value.phone.replace(/\s/g, '')
  return parsePhoneNumberFromString(full, selectedCountry.value.code as any)?.format('E.164') ?? ''
})
const validators: Record<string, (v: string) => string | null> = {
  nombre: v => v.trim().length < 2 ? 'Ingresa tu nombre' : null,
  apellido: v => v.trim().length < 2 ? 'Ingresa tu apellido' : null,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : 'Email inválido',
  phone: () => phoneValid.value ? null : 'Número inválido para el país seleccionado',
}
const validate = (): boolean => {
  const e: Record<string, string> = {}
  for (const [field, fn] of Object.entries(validators)) {
    const msg = fn(form.value[field as keyof typeof form.value])
    if (msg) e[field] = msg
  }
  errors.value = e
  return Object.keys(e).length === 0
}
const onBlur = (field: string) => {
  touched.value[field] = true
  const msg = validators[field]?.(form.value[field as keyof typeof form.value])
  if (msg) errors.value[field] = msg
  else delete errors.value[field]
}
const filteredCountries = computed(() => {
  const q = countrySearch.value.toLowerCase()
  if (!q) return countries
  return countries.filter(c =>
    c.code !== '---' && (c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q))
  )
})
const selectCountry = (c: Country) => {
  if (c.code === '---') return
  selectedCountry.value = c
  dropdownOpen.value = false
  countrySearch.value = ''
  form.value.phone = ''
}
const handleClickOutside = (e: MouseEvent) => {
  const el = document.querySelector('.izform__phone-wrap')
  if (el && !el.contains(e.target as Node)) dropdownOpen.value = false
}

// ── Submit ──────────────────────────────────────────────────────
const handleSubmit = async () => {
  touched.value = { nombre: true, apellido: true, email: true, phone: true }
  if (!validate()) return
  submitting.value = true

  const leadEventId = `lead_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const nombreFull = `${form.value.nombre.trim()} ${form.value.apellido.trim()}`
  const emailLower = form.value.email.trim().toLowerCase()
  const telefonoE164 = parsedPhoneE164.value
  const paisNombre = selectedCountry.value.name
  const paisCode = selectedCountry.value.code
  const paisFlag = selectedCountry.value.flag

  const tags = [
    'paso-1-contacto', 'izzu-estudio-web', 'diagnostico-arquitectonico',
    'lead-sin-calificar', `pais-${paisCode.toLowerCase()}`, 'fuente-web-funnel',
  ]
  const nota = [
    '🏗️ *Nuevo lead IZZU Estudio de Arquitectura*', '',
    '📍 *Paso 1 / 3* — Contacto inicial capturado',
    '⏳ *Estado:* Pendiente de calificación', '',
    `👤 *Nombre:* ${nombreFull}`,
    `✉️ *Email:* ${emailLower}`,
    `📱 *WhatsApp:* ${telefonoE164}`,
    `${paisFlag} *País:* ${paisNombre} (${paisCode})`, '',
    `🆔 *Event ID:* ${leadEventId}`,
    `🕒 *Timestamp:* ${new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' })}`,
    '', '🎯 *Próximo paso:* Ver video VSL (2 min mínimo) → Calificación → Diagnóstico.',
    '', '💼 *Interés:* Regularización / División / Propiedad Horizontal / Urbanismo',
  ].join('\n')

  const payload = {
    nombre: form.value.nombre.trim(), apellido: form.value.apellido.trim(),
    nombreCompleto: nombreFull, email: emailLower,
    telefono: telefonoE164, telefonoDisplay: selectedCountry.value.dial + ' ' + formattedPhone.value,
    pais: paisNombre, paisCode, paisFlag,
    timestamp: new Date().toISOString(),
    event_id: leadEventId, step: 1, stepName: 'contacto',
    estado: 'lead-sin-calificar',
    nota, notas: nota, note: nota,
    tags, etiquetas: tags.join(', '),
    source: 'izzu-estudio-web',
    landingUrl: window.location.href, referrer: document.referrer, userAgent: navigator.userAgent,
    ...getStoredFbParams(),
  }

  await fetch(import.meta.env.VITE_WEBHOOK_REGISTRO, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }).catch(() => {})

  ;(window as any).fbq?.('track', 'Lead', { content_name: 'diagnostico-izzu' }, { eventID: leadEventId })

  localStorage.setItem('izzu_contact', JSON.stringify({
    nombre: form.value.nombre.trim(), apellido: form.value.apellido.trim(),
    email: emailLower, phone: telefonoE164, country: paisCode,
    eventId: leadEventId, timestamp: Date.now(),
  }))

  trackLead({
    eventId: leadEventId,
    user: {
      email: emailLower, phone: telefonoE164,
      firstName: form.value.nombre.trim(), lastName: form.value.apellido.trim(),
      country: paisCode, externalId: emailLower,
    },
    custom: { content_name: 'IZZU Estudio - Diagnóstico Arquitectónico', content_category: 'diagnostico-arquitectonico' },
  })

  submitting.value = false
  router.push({ name: 'video' })
}

const openModal = () => { modalOpen.value = true }

onMounted(() => {
  captureFbParams()
  trackPageView()
  document.addEventListener('mousedown', handleClickOutside)
})
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))

// ── Static content ──────────────────────────────────────────────
const pillars = [
  {
    icon: 'fa-file-shield',
    title: 'Regularización y Blindaje Patrimonial',
    body: 'Levantamiento técnico preciso para actualizar lo construido al catastro municipal. Blindamos jurídicamente tu propiedad para vender, hipotecar o heredar sin trabas.',
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
  'Inversionista con terreno o macrolote que necesita dividir en solares.',
  'Parte de una herencia familiar que requiere división legal del terreno.',
  'Promotor inmobiliario buscando entrega-recepción de una urbanización.',
]
const notForWho = [
  'Solo estás explorando sin una propiedad específica.',
  'No tienes un inmueble con necesidad de regularización o división.',
  'Buscas consultas generales de construcción sin componente legal.',
]

const faq = [
  {
    q: '¿La sesión de diagnóstico tiene algún costo?',
    a: 'No, es completamente gratuita. En 20 minutos analizamos escrituras, estado catastral y cuellos de botella que impiden venta o construcción. Sin compromiso.',
  },
  {
    q: '¿Qué necesito llevar al diagnóstico?',
    a: 'Idealmente tus escrituras y cualquier documento catastral. Si no los tienes a mano, igual podemos orientarte; el diagnóstico es flexible.',
  },
  {
    q: '¿Cuánto tarda el proceso de regularización?',
    a: 'Depende de la complejidad. En la sesión te daremos una estimación clara. Casos como Propiedad Horizontal pueden resolverse en menos de 90 días.',
  },
  {
    q: '¿Trabajan solo en Ecuador?',
    a: 'Enfocados en Ecuador, pero podemos evaluar casos en Latinoamérica. Consulta en tu diagnóstico.',
  },
  {
    q: '¿Y si no califico para el diagnóstico?',
    a: 'No pasa nada. Te invitamos a seguir nuestro trabajo en Instagram y agendar cuando tu situación o propiedad encajen.',
  },
]
</script>

<template>
  <UrgencyBar @cta="openModal" />
  <IzzuHeader variant="light" cta-label="Diagnóstico gratuito" @cta="openModal" />

  <main class="izlp">

    <!-- ── HERO ────────────────────────────────────────────────── -->
    <section class="izlp-hero">
      <div class="izlp-hero__grid">

        <div class="izlp-hero__copy">
          <span class="izlp-hero__eyebrow">
            <i class="fa-solid fa-triangle-exclamation" />
            Alerta patrimonial 2026
          </span>

          <h1 class="izlp-hero__title">
            Tu propiedad podría estar perdiendo hasta un
            <span class="izlp-hero__accent">30%</span>
            de su valor <span class="izlp-hero__soft">por un error de registro</span>
          </h1>

          <p class="izlp-hero__sub">
            Muchos propietarios descubren tarde que no pueden vender, hipotecar ni heredar porque su
            construcción <strong>no «existe» legalmente</strong>. En
            <strong>IZZU Estudio de Arquitectura</strong> diseñamos soluciones que se reflejan en
            escrituras y catastro.
          </p>

          <ul class="izlp-hero__bullets">
            <li><i class="fa-solid fa-circle-check" /> Diagnóstico técnico-legal sin costo</li>
            <li><i class="fa-solid fa-circle-check" /> Análisis de escrituras + catastro municipal</li>
            <li><i class="fa-solid fa-circle-check" /> Hoja de ruta personalizada para tu activo</li>
          </ul>

          <div class="izlp-hero__cta-row">
            <button type="button" class="izlp-btn izlp-btn--primary" @click="openModal">
              <i class="fa-solid fa-calendar-check" />
              Agendar mi diagnóstico
              <i class="fa-solid fa-arrow-right izlp-btn__arrow" />
            </button>
            <span class="izlp-hero__legal">
              <i class="fa-solid fa-shield-halved" />
              Sin compromiso · 20 minutos · 100% gratuito
            </span>
          </div>

          <div class="izlp-hero__trust">
            <div><strong>+150</strong><span>Propiedades regularizadas</span></div>
            <div><strong>&lt;90 días</strong><span>Propiedad Horizontal</span></div>
            <div><strong>100%</strong><span>Hecho por arquitectos</span></div>
          </div>
        </div>

        <!-- Clickeable thumbnail video — opens registration modal -->
        <figure class="izlp-hero__player" role="button" tabindex="0" @click="modalOpen = true" @keydown.enter="modalOpen = true" @keydown.space.prevent="modalOpen = true" aria-label="Haz clic para ver el video y comenzar tu diagnóstico">
          <img src="/izzu-thumbnail.png" alt="IZZU Estudio de Arquitectura — Diagnóstico gratuito" class="izlp-hero__player-img" />
          <div class="izlp-hero__player-overlay">
            <span class="izlp-hero__player-play"><i class="fa-solid fa-circle-play" /></span>
            <span class="izlp-hero__player-label">Ver video ahora</span>
          </div>
          <span class="izlp-hero__player-duration">
            <i class="fa-solid fa-clock" />
            2 min
          </span>
          <figcaption class="izlp-hero__caption">
            <span class="izlp-hero__cap-eyebrow">
              <i class="fa-solid fa-location-dot" />
              Quito · Guayaquil · Cuenca
            </span>
            <strong>Diagnóstico técnico-legal gratuito</strong>
            <em>Blinda tu patrimonio · 20 minutos · Sin compromiso</em>
          </figcaption>
        </figure>

      </div>
    </section>

    <!-- ── FORM (inline, primary CTA) ─────────────────────────── -->
    <section id="izzu-form" class="izlp-form">
      <div class="izlp-form__inner">
        <div class="izlp-form__copy">
          <span class="izlp-form__step">Paso 1 de 3 · Contacto inicial</span>
          <h2>Empieza tu <span>diagnóstico gratuito</span></h2>
          <p>
            Déjanos tus datos. En el siguiente paso verás un video clave y completarás 3 preguntas
            de calificación.
          </p>

          <ul class="izlp-form__perks">
            <li><i class="fa-solid fa-shield-halved" /> Tus datos están seguros</li>
            <li><i class="fa-solid fa-stopwatch" /> Toma menos de 60 segundos</li>
            <li><i class="fa-solid fa-handshake-angle" /> Sin compromiso, 100% gratuito</li>
          </ul>
        </div>

        <aside class="izform">
          <form class="izform__form" @submit.prevent="handleSubmit" novalidate>
            <div class="izform__row">
              <div class="izform__field" :class="{ 'has-error': touched.nombre && errors.nombre }">
                <label for="r-nombre">Nombre</label>
                <input id="r-nombre" v-model="form.nombre" type="text" placeholder="Juan" autocomplete="given-name" @blur="onBlur('nombre')" />
                <span v-if="touched.nombre && errors.nombre" class="izform__error">{{ errors.nombre }}</span>
              </div>
              <div class="izform__field" :class="{ 'has-error': touched.apellido && errors.apellido }">
                <label for="r-apellido">Apellido</label>
                <input id="r-apellido" v-model="form.apellido" type="text" placeholder="Pérez" autocomplete="family-name" @blur="onBlur('apellido')" />
                <span v-if="touched.apellido && errors.apellido" class="izform__error">{{ errors.apellido }}</span>
              </div>
            </div>

            <div class="izform__field" :class="{ 'has-error': touched.email && errors.email }">
              <label for="r-email">Correo electrónico</label>
              <input id="r-email" v-model="form.email" type="email" placeholder="juan@empresa.com" autocomplete="email" @blur="onBlur('email')" />
              <span v-if="touched.email && errors.email" class="izform__error">{{ errors.email }}</span>
            </div>

            <div class="izform__field" :class="{ 'has-error': touched.phone && errors.phone }">
              <label>Teléfono (WhatsApp)</label>
              <div class="izform__phone-wrap">
                <button type="button" class="izform__country-trigger" :aria-expanded="dropdownOpen" @click="dropdownOpen = !dropdownOpen">
                  <span class="izform__flag">{{ selectedCountry.flag }}</span>
                  <span class="izform__dial">{{ selectedCountry.dial }}</span>
                  <i class="fa-solid fa-chevron-down" :class="{ open: dropdownOpen }" />
                </button>

                <Transition name="izform-dd">
                  <div v-if="dropdownOpen" class="izform__country-dd">
                    <input type="text" class="izform__country-search" v-model="countrySearch" placeholder="Buscar país..." />
                    <ul>
                      <li v-for="c in filteredCountries" :key="c.code"
                          :class="['izform__country-item', { separator: c.code === '---', active: c.code === selectedCountry.code }]"
                          @click="selectCountry(c)">
                        <template v-if="c.code !== '---'">
                          <span class="izform__flag">{{ c.flag }}</span>
                          <span class="izform__country-name">{{ c.name }}</span>
                          <span class="izform__country-dial">{{ c.dial }}</span>
                        </template>
                        <hr v-else />
                      </li>
                    </ul>
                  </div>
                </Transition>

                <input class="izform__phone-input" type="tel" :value="form.phone" placeholder="98 493 4039"
                       autocomplete="tel-national" inputmode="tel"
                       @input="(e) => form.phone = (e.target as HTMLInputElement).value.replace(/[^\d\s\-\(\)]/g, '')"
                       @blur="onBlur('phone')" />
                <span class="izform__phone-status" :class="{ valid: phoneValid }" aria-hidden="true">
                  <i v-if="phoneValid" class="fa-solid fa-check" />
                </span>
              </div>
              <span v-if="touched.phone && errors.phone" class="izform__error">{{ errors.phone }}</span>
            </div>

            <button class="izform__submit" type="submit" :disabled="submitting">
              <i v-if="submitting" class="fa-solid fa-spinner izform__spin" />
              <i v-else class="fa-solid fa-arrow-right" />
              {{ submitting ? 'Enviando…' : 'CONTINUAR AL VIDEO' }}
            </button>

            <p class="izform__legal">
              <i class="fa-solid fa-lock" />
              100% gratuito · Sin compromiso · Datos seguros
            </p>
          </form>
        </aside>
      </div>
    </section>

    <!-- ── PROMESA ─────────────────────────────────────────────── -->
    <section class="izlp-promise">
      <div class="izlp-container">
        <span class="izlp-promise__eyebrow">Nuestra metodología</span>
        <h2>Blindamos tu patrimonio con estrategia técnica y legal</h2>
        <p>
          En IZZU no solo dibujamos planos. Diseñamos soluciones que se reflejan en las escrituras y
          en el catastro municipal. Hemos trabajado con inversionistas que tenían edificios enteros
          detenidos porque no podían individualizar las unidades.
        </p>
      </div>
    </section>

    <!-- ── PILARES ─────────────────────────────────────────────── -->
    <section class="izlp-pillars">
      <div class="izlp-container">
        <span class="izlp-eyebrow">¿Cómo te ayudamos?</span>
        <h2>Tres pilares para blindar tu activo</h2>
        <p class="izlp-pillars__lead">
          Cubrimos toda la cadena de regularización patrimonial — desde el levantamiento técnico
          hasta la entrega-recepción municipal.
        </p>
        <div class="izlp-pillars__grid">
          <article v-for="item in pillars" :key="item.title" class="izlp-card">
            <span class="izlp-card__icon"><i :class="['fa-solid', item.icon]" /></span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <!-- ── CASOS ───────────────────────────────────────────────── -->
    <section class="izlp-cases">
      <div class="izlp-container">
        <span class="izlp-eyebrow">Casos reales</span>
        <h2>De activo detenido a escritura individual</h2>

        <div class="izlp-cases__grid">
          <article class="izlp-case">
            <div class="izlp-case__num">01</div>
            <h3>Doña Elena — Propiedad Horizontal</h3>
            <p>
              Edificio de 4 departamentos. El banco negaba el crédito a los compradores porque
              legalmente era una sola casa. Levantamiento, áreas comunes y privativas, cuadro de
              alícuotas y declaratoria. Hoy cada departamento tiene su propia escritura.
            </p>
            <span class="izlp-case__tag"><i class="fa-solid fa-check" /> Resuelto · &lt;90 días</span>
          </article>

          <article class="izlp-case">
            <div class="izlp-case__num">02</div>
            <h3>Inversiones G&amp;S — Edificio comercial</h3>
            <p>
              Capital muerto: sin declaratoria al Régimen de Propiedad Horizontal, cero ventas.
              Levantamiento, cuadro de alícuotas y aprobación municipal en tiempo récord. Pasaron a
              cerrar ventas individuales por oficina.
            </p>
            <span class="izlp-case__tag"><i class="fa-solid fa-check" /> Resuelto · ROI inmediato</span>
          </article>
        </div>
      </div>
    </section>

    <!-- ── FOR / NOT FOR ───────────────────────────────────────── -->
    <section class="izlp-fitwho">
      <div class="izlp-container">
        <span class="izlp-eyebrow">¿Es para ti?</span>
        <h2>Diagnóstico solo para casos calificados</h2>
        <div class="izlp-fitwho__grid">
          <div class="izlp-fitwho__col izlp-fitwho__col--for">
            <h3>
              <i class="fa-solid fa-circle-check" />
              Este diagnóstico es para ti si…
            </h3>
            <ul>
              <li v-for="line in forWho" :key="line"><i class="fa-solid fa-check" /><span>{{ line }}</span></li>
            </ul>
          </div>
          <div class="izlp-fitwho__col izlp-fitwho__col--not">
            <h3>
              <i class="fa-solid fa-circle-xmark" />
              No es para ti si…
            </h3>
            <ul>
              <li v-for="line in notForWho" :key="line"><i class="fa-solid fa-xmark" /><span>{{ line }}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ── PROCESO ─────────────────────────────────────────────── -->
    <section class="izlp-steps">
      <div class="izlp-container">
        <span class="izlp-steps__eyebrow">El proceso</span>
        <h2>Así funciona tu diagnóstico gratuito</h2>
        <ol class="izlp-steps__list">
          <li><span>1</span><p><strong>Regístrate.</strong> Déjanos tus datos en menos de 60 segundos.</p></li>
          <li><span>2</span><p><strong>Mira el video.</strong> Te explicamos la metodología IZZU (2 min).</p></li>
          <li><span>3</span><p><strong>Califica.</strong> Respondes 3 preguntas sobre tu propiedad.</p></li>
          <li><span>4</span><p><strong>Agenda.</strong> Reserva tu sesión de 20 minutos en el calendario.</p></li>
        </ol>
      </div>
    </section>

    <!-- ── VER VIDEO ────────────────────────────────────────────── -->
    <section class="izlp-video">
      <div class="izlp-container">
        <span class="izlp-eyebrow">Mira el video</span>
        <h2>Ve el video ahora y descubre cómo blindar tu patrimonio</h2>
        <p class="izlp-video__lead">En menos de 2 minutos te explicamos la metodología IZZU para regularizar, dividir o blindar tu propiedad.</p>
        <figure class="izlp-video__player" role="button" tabindex="0" @click="modalOpen = true" @keydown.enter="modalOpen = true" @keydown.space.prevent="modalOpen = true" aria-label="Haz clic para ver el video y comenzar tu diagnóstico">
          <img src="/izzu-thumbnail.png" alt="Video IZZU Estudio — Diagnóstico gratuito" class="izlp-video__thumb" />
          <div class="izlp-video__overlay">
            <span class="izlp-video__play"><i class="fa-solid fa-circle-play" /></span>
            <span class="izlp-video__label">Ver video ahora</span>
          </div>
          <span class="izlp-video__duration">
            <i class="fa-solid fa-clock" />
            2 min
          </span>
        </figure>
      </div>
    </section>

    <!-- ── ABOUT ───────────────────────────────────────────────── -->
    <section class="izlp-about">
      <div class="izlp-container izlp-about__grid">
        <div class="izlp-about__visual">
          <img src="/izzu-logo.jpeg" alt="IZZU Estudio de Arquitectura" />
        </div>
        <div>
          <span class="izlp-eyebrow">Quiénes somos</span>
          <h2>IZZU Estudio de Arquitectura</h2>
          <p>
            Estudio ecuatoriano especializado en regularización de edificaciones, propiedad
            horizontal, división de solares y urbanismo estratégico. Trabajamos con propietarios,
            inversionistas, herederos y desarrolladores para blindar legalmente su patrimonio.
          </p>
          <p>
            Combinamos el rigor técnico de la arquitectura con la precisión legal que exige el
            catastro municipal. No solo hacemos planos — hacemos que tu propiedad exista legalmente.
          </p>
          <a href="https://www.instagram.com/izzuestudio/" target="_blank" rel="noopener noreferrer" class="izlp-about__link">
            <i class="fa-brands fa-instagram" />
            @izzuestudio
          </a>
        </div>
      </div>
    </section>

    <!-- ── FAQ ─────────────────────────────────────────────────── -->
    <section class="izlp-faq">
      <div class="izlp-container">
        <span class="izlp-eyebrow">Resolvemos tus dudas</span>
        <h2>Preguntas frecuentes</h2>
        <div class="izlp-faq__list">
          <details v-for="item in faq" :key="item.q" class="izlp-faq__item">
            <summary><span>{{ item.q }}</span><i class="fa-solid fa-chevron-down" /></summary>
            <p>{{ item.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- ── FINAL ───────────────────────────────────────────────── -->
    <section class="izlp-final">
      <div class="izlp-container">
        <span class="izlp-final__badge"><i class="fa-solid fa-bolt" /> Cupos limitados esta semana</span>
        <h2>Tu patrimonio no puede esperar</h2>
        <p>Agenda tu diagnóstico gratuito de 20 minutos y descubre cómo blindar tu propiedad.</p>
        <button type="button" class="izlp-btn izlp-btn--primary" @click="openModal">
          <i class="fa-solid fa-calendar-check" />
          Agendar mi diagnóstico
          <i class="fa-solid fa-arrow-right" />
        </button>
        <p class="izlp-final__note">Sin compromiso · 20 minutos · 100% gratuito</p>
      </div>
    </section>

    <footer class="izlp-foot">
      <div class="izlp-container izlp-foot__inner">
        <div class="izlp-foot__brand">
          <img src="/izzu-logo.jpeg" alt="IZZU" />
          <span>© IZZU Estudio de Arquitectura</span>
        </div>
        <nav>
          <RouterLink to="/politicas-privacidad">Privacidad</RouterLink>
          <RouterLink to="/aviso-legal">Aviso legal</RouterLink>
        </nav>
      </div>
    </footer>

  </main>

  <RegistrationModal :open="modalOpen" @close="modalOpen = false" />
</template>

<style lang="scss" scoped>
$primary: #1B365D;
$accent:  #C4956A;
$accent-d:#A0784F;
$dark:    #0D1117;
$light:   #F5F7FA;
$ink:     #1f2937;
$muted:   #6b7280;

.izlp {
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  color: $ink;
  background: #ffffff;
}

.izlp-container {
  width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 1.5rem;
  @media (min-width: 768px) { padding: 0 2rem; }
}

.izlp-eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.74rem; letter-spacing: 0.14em;
  text-transform: uppercase; color: $accent;

  &::before {
    content: ''; display: inline-block; width: 24px; height: 2px;
    background: $accent;
  }
}

// ═════════════════════════════════════════════════════════════════
// BUTTONS
// ═════════════════════════════════════════════════════════════════
.izlp-btn {
  display: inline-flex; align-items: center; gap: 0.6rem;
  padding: 1rem 1.5rem; border-radius: 999px; border: 0;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; letter-spacing: 0.04em;
  text-transform: uppercase; cursor: pointer;
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease, color 160ms ease;

  i { font-size: 0.82rem; }
  .izlp-btn__arrow { transition: transform 200ms ease; }
  &:hover .izlp-btn__arrow { transform: translateX(4px); }
}
.izlp-btn--primary {
  background: $primary; color: #ffffff;
  box-shadow: 0 14px 32px rgba(27, 54, 93, 0.3);
  &:hover { background: $accent; color: $dark; transform: translateY(-2px); box-shadow: 0 18px 40px rgba(196, 149, 106, 0.45); }
}

// ═════════════════════════════════════════════════════════════════
// HERO (LIGHT)
// ═════════════════════════════════════════════════════════════════
.izlp-hero {
  background: linear-gradient(180deg, #ffffff 0%, $light 100%);
  padding: 2.5rem 0 3.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute; right: -100px; top: -100px;
    width: 480px; height: 480px;
    background: radial-gradient(circle, rgba(196, 149, 106, 0.15), transparent 70%);
    pointer-events: none;
  }

  @media (min-width: 960px) { padding: 4rem 0 5rem; }
}

.izlp-hero__grid {
  max-width: 1200px; margin: 0 auto;
  padding: 0 1.5rem;
  display: grid; gap: 2.5rem; align-items: center;
  position: relative;

  @media (min-width: 960px) { grid-template-columns: 1.1fr 1fr; gap: 3.5rem; padding: 0 2rem; }
}

.izlp-hero__copy { display: flex; flex-direction: column; gap: 1.15rem; }

.izlp-hero__eyebrow {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(196, 149, 106, 0.14); color: $accent-d;
  border: 1px solid rgba(196, 149, 106, 0.3);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.74rem; letter-spacing: 0.1em;
  padding: 0.45rem 0.9rem; border-radius: 999px;
  text-transform: uppercase; width: max-content;
  i { font-size: 0.78rem; }
}

.izlp-hero__title {
  font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: clamp(1.95rem, 5.5vw, 3.2rem);
  line-height: 1.08; letter-spacing: -0.01em; margin: 0;
  color: $dark;
}
.izlp-hero__accent {
  color: $accent-d;
  position: relative; display: inline-block;
  &::after {
    content: ''; position: absolute; left: 0; right: 0; bottom: 0.06em;
    height: 0.16em; background: rgba(196, 149, 106, 0.3); border-radius: 999px;
  }
}
.izlp-hero__soft { color: #6b7280; font-weight: 700; }

.izlp-hero__sub {
  font-size: 1.02rem; line-height: 1.6; color: $muted; margin: 0;
  strong { color: $dark; font-weight: 700; }
}

.izlp-hero__bullets {
  list-style: none; padding: 0; margin: 0.25rem 0 0;
  display: flex; flex-direction: column; gap: 0.5rem;
  li { display: flex; align-items: center; gap: 0.6rem; font-size: 0.95rem; color: $ink; }
  i { color: #15803d; }
}

.izlp-hero__cta-row {
  display: flex; flex-direction: column; gap: 0.75rem; align-items: flex-start;
  margin-top: 0.5rem;

  @media (min-width: 540px) { flex-direction: row; align-items: center; gap: 1rem; flex-wrap: wrap; }
}

.izlp-hero__legal {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.82rem; color: $muted;
  i { color: $accent; }
}

.izlp-hero__trust {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;
  margin-top: 1rem; padding-top: 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  > div { display: flex; flex-direction: column; gap: 0.15rem; }
  strong { font-family: 'Outfit', system-ui, sans-serif; font-weight: 800; font-size: clamp(1.1rem, 2.4vw, 1.45rem); color: $primary; }
  span { font-size: 0.74rem; color: $muted; line-height: 1.3; }
}

.izlp-hero__player {
  margin: 0; position: relative;
  border-radius: 1.25rem; overflow: hidden;
  cursor: pointer; aspect-ratio: 16 / 9; max-width: 540px;
  justify-self: center; width: 100%;
  box-shadow: 0 30px 70px rgba(13, 17, 23, 0.2);
  border: 2px solid rgba(196, 149, 106, 0.3);
  transition: transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease;

  &:hover {
    transform: scale(1.015);
    box-shadow: 0 40px 90px rgba(13, 17, 23, 0.3);
    border-color: $accent;
  }
}
.izlp-hero__player-img {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.izlp-hero__player-overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem;
  background: rgba(13, 17, 23, 0.4);
  transition: background 280ms ease;
  .izlp-hero__player:hover & { background: rgba(13, 17, 23, 0.25); }
}
.izlp-hero__player-play {
  width: 5rem; height: 5rem; border-radius: 50%;
  background: rgba(196, 149, 106, 0.9);
  color: #0D1117;
  display: grid; place-items: center;
  font-size: 2.2rem;
  box-shadow: 0 8px 30px rgba(196, 149, 106, 0.5);
  transition: transform 280ms ease, background 280ms ease;
  .izlp-hero__player:hover & {
    transform: scale(1.1);
    background: $accent;
  }
}
.izlp-hero__player-label {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 1.1rem; color: #ffffff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  letter-spacing: 0.04em;
}
.izlp-hero__player-duration {
  position: absolute; top: 1rem; right: 1rem;
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(13, 17, 23, 0.75);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.78rem;
  padding: 0.4rem 0.8rem; border-radius: 999px;
  border: 1px solid rgba(196, 149, 106, 0.3);
  i { color: $accent; font-size: 0.7rem; }
}
.izlp-hero__caption {
  position: absolute; left: 1rem; right: 1rem; bottom: 1rem;
  background: rgba(13, 17, 23, 0.85);
  backdrop-filter: blur(8px);
  color: #ffffff;
  padding: 0.85rem 1rem; border-radius: 0.85rem;
  display: flex; flex-direction: column; gap: 0.2rem;
  border: 1px solid rgba(196, 149, 106, 0.25);

  strong { font-family: 'Outfit', system-ui, sans-serif; font-weight: 700; font-size: 0.92rem; }
  em { font-style: normal; font-size: 0.74rem; color: rgba(255,255,255,0.7); }
}
.izlp-hero__cap-eyebrow {
  display: inline-flex; align-items: center; gap: 0.35rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.62rem; letter-spacing: 0.1em;
  color: $accent; text-transform: uppercase;
  i { font-size: 0.65rem; }
}

// ═════════════════════════════════════════════════════════════════
// FORM SECTION (inline primary CTA)
// ═════════════════════════════════════════════════════════════════
.izlp-form {
  background: linear-gradient(180deg, $light 0%, #ffffff 100%);
  padding: 3.5rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);

  @media (min-width: 960px) { padding: 4.5rem 0; }
}
.izlp-form__inner {
  max-width: 1180px; margin: 0 auto; padding: 0 1.5rem;
  display: grid; gap: 2rem; align-items: center;

  @media (min-width: 960px) { grid-template-columns: 0.9fr 1.1fr; gap: 3rem; padding: 0 2rem; }
}
.izlp-form__copy {
  display: flex; flex-direction: column; gap: 1rem;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.65rem, 4vw, 2.3rem);
    margin: 0; color: $primary; line-height: 1.15;
    span { color: $accent-d; }
  }
  p { margin: 0; color: $muted; line-height: 1.6; font-size: 1rem; }
}
.izlp-form__step {
  display: inline-flex; align-items: center;
  background: rgba(27, 54, 93, 0.08); color: $primary;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.72rem; letter-spacing: 0.08em;
  padding: 0.35rem 0.85rem; border-radius: 999px;
  text-transform: uppercase; width: max-content;
}
.izlp-form__perks {
  list-style: none; padding: 0; margin: 0.5rem 0 0;
  display: flex; flex-direction: column; gap: 0.55rem;
  li { display: flex; align-items: center; gap: 0.6rem; color: $ink; font-size: 0.92rem; }
  i { color: $accent; width: 1.1rem; }
}

// ── Card form ─────────────────────────────────────────────────
.izform {
  background: #ffffff; color: $dark;
  border: 1px solid rgba(27, 54, 93, 0.1);
  border-radius: 1.5rem; padding: 1.75rem 1.5rem;
  box-shadow: 0 30px 70px rgba(13, 17, 23, 0.12);

  @media (min-width: 540px) { padding: 2.25rem 2rem; }
}
.izform__form { display: flex; flex-direction: column; gap: 0.95rem; }
.izform__row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; @media (max-width: 400px) { grid-template-columns: 1fr; } }

.izform__field {
  display: flex; flex-direction: column; gap: 0.35rem;
  label {
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.74rem; font-weight: 700; color: #4a5f7a;
    letter-spacing: 0.04em; text-transform: uppercase;
  }
  input {
    width: 100%; box-sizing: border-box;
    background: #f9fbff; border: 1.5px solid rgba(27, 54, 93, 0.12);
    border-radius: 0.65rem; padding: 0.8rem 0.95rem;
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    font-size: 0.95rem; color: $dark; outline: none;
    transition: border-color 160ms ease, background 160ms ease, box-shadow 200ms ease;
    &::placeholder { color: #b8cae0; }
    &:focus {
      border-color: $accent;
      background: rgba(196, 149, 106, 0.04);
      box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.12);
    }
  }
  &.has-error input { border-color: rgba(239, 68, 68, 0.55); }
}
.izform__error { font-size: 0.74rem; color: #ef4444; font-weight: 600; }

.izform__phone-wrap {
  position: relative; display: flex; align-items: center;
  background: #f9fbff; border: 1.5px solid rgba(27, 54, 93, 0.12);
  border-radius: 0.65rem;
  transition: border-color 160ms ease, box-shadow 200ms ease;
  &:focus-within { border-color: $accent; box-shadow: 0 0 0 3px rgba(196, 149, 106, 0.12); }
  .has-error & { border-color: rgba(239, 68, 68, 0.55); }
}
.izform__country-trigger {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.8rem 0.55rem 0.8rem 0.95rem;
  background: none; border: none; border-right: 1px solid rgba(27, 54, 93, 0.12);
  cursor: pointer; flex-shrink: 0;
  i { font-size: 0.7rem; color: rgba(27, 54, 93, 0.5); transition: transform 200ms ease; &.open { transform: rotate(180deg); } }
}
.izform__flag { font-size: 1.1rem; line-height: 1; }
.izform__dial { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 0.82rem; font-weight: 600; color: #4a5f7a; }
.izform__country-dd {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 200;
  width: 280px; max-height: 240px; overflow: hidden;
  background: #ffffff; border: 1px solid rgba(0,0,0,0.1);
  border-radius: 0.85rem; box-shadow: 0 16px 48px rgba(0,0,0,0.15);
  display: flex; flex-direction: column;
}
.izform__country-search {
  width: 100%; box-sizing: border-box; padding: 0.7rem 0.95rem;
  background: rgba(0,0,0,0.02); border: none; border-bottom: 1px solid rgba(0,0,0,0.05);
  color: $dark; font-size: 0.85rem; outline: none;
  &::placeholder { color: #b8cae0; }
}
.izform__country-dd ul { list-style: none; padding: 0.25rem; margin: 0; overflow-y: auto; max-height: 190px; }
.izform__country-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.55rem 0.6rem; border-radius: 0.5rem; cursor: pointer;
  &:hover:not(.separator) { background: rgba(196, 149, 106, 0.08); }
  &.active { background: rgba(196, 149, 106, 0.14); }
  &.separator { padding: 0.25rem 0.6rem; cursor: default; hr { width: 100%; border: 0; border-top: 1px solid rgba(0,0,0,0.05); } }
}
.izform__country-name { font-size: 0.85rem; color: #3a4f6a; flex: 1; }
.izform__country-dial { font-family: 'Space Grotesk', system-ui, sans-serif; font-size: 0.75rem; color: #a0b0c5; }
.izform__phone-input {
  flex: 1; min-width: 0;
  background: transparent !important; border: none !important; outline: none !important;
  padding: 0.8rem 2.4rem 0.8rem 0.85rem !important;
  font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  font-size: 0.95rem; color: $dark;
  &::placeholder { color: #b8cae0; }
}
.izform__phone-status {
  position: absolute; right: 0.7rem; top: 50%; transform: translateY(-50%);
  width: 1.3rem; height: 1.3rem; border-radius: 50%; display: grid; place-items: center;
  &.valid { background: rgba(34, 197, 94, 0.15); color: #15803d; font-size: 0.7rem; }
}

.izform__submit {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.6rem;
  margin-top: 0.5rem; padding: 1.1rem 1.4rem;
  background: $primary; color: #ffffff;
  border: 0; border-radius: 0.85rem;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 800; font-size: 0.95rem; letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 14px 32px rgba(27, 54, 93, 0.3);
  transition: transform 140ms ease, background 160ms ease, box-shadow 200ms ease, color 160ms ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background: $accent; color: $dark;
    box-shadow: 0 18px 40px rgba(196, 149, 106, 0.45);
  }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}
.izform__spin { animation: izform-spin 0.8s linear infinite; }
@keyframes izform-spin { to { transform: rotate(360deg); } }

.izform__legal {
  display: flex; align-items: center; justify-content: center; gap: 0.45rem;
  font-size: 0.72rem; color: $muted; margin: 0.5rem 0 0;
  i { color: $accent; }
}

.izform-dd-enter-active { transition: opacity 0.18s ease, transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
.izform-dd-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.izform-dd-enter-from, .izform-dd-leave-to { opacity: 0; transform: translateY(-6px) scale(0.98); }

// ═════════════════════════════════════════════════════════════════
// PROMISE (dark inverse)
// ═════════════════════════════════════════════════════════════════
.izlp-promise {
  background: $dark; color: #ffffff;
  padding: 3.5rem 0; text-align: center;
  border-top: 1px solid rgba(196, 149, 106, 0.15);

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.55rem, 3.5vw, 2.2rem);
    margin: 0.65rem 0 1rem; line-height: 1.18;
  }
  p { color: #c8d2dd; max-width: 720px; margin: 0 auto; line-height: 1.65; }
}
.izlp-promise__eyebrow {
  text-transform: uppercase; letter-spacing: 0.14em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.74rem; color: $accent;
}

// ═════════════════════════════════════════════════════════════════
// PILLARS
// ═════════════════════════════════════════════════════════════════
.izlp-pillars {
  padding: 4.5rem 0; background: $light; text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.65rem, 3.8vw, 2.4rem);
    margin: 0.65rem 0 0.5rem; color: $primary;
  }
}
.izlp-pillars__lead { color: $muted; max-width: 640px; margin: 0 auto 2.5rem; line-height: 1.6; }
.izlp-pillars__grid {
  display: grid; gap: 1.25rem; grid-template-columns: 1fr; text-align: left;
  @media (min-width: 768px) { grid-template-columns: repeat(3, 1fr); }
}
.izlp-card {
  background: #ffffff; border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem; padding: 1.75rem 1.5rem;
  display: flex; flex-direction: column; gap: 0.65rem;
  transition: transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease;

  &:hover { transform: translateY(-4px); box-shadow: 0 24px 50px rgba(27, 54, 93, 0.12); border-color: rgba(196, 149, 106, 0.3); }

  h3 { font-family: 'Outfit', system-ui, sans-serif; font-weight: 700; font-size: 1.1rem; margin: 0; color: $primary; }
  p { margin: 0; color: $muted; font-size: 0.95rem; line-height: 1.55; }
}
.izlp-card__icon {
  width: 3rem; height: 3rem; border-radius: 0.85rem;
  background: linear-gradient(135deg, $primary 0%, #2a4a7a 100%);
  color: $accent; display: grid; place-items: center; font-size: 1.2rem;
  margin-bottom: 0.4rem; box-shadow: 0 8px 20px rgba(27, 54, 93, 0.25);
}

// ═════════════════════════════════════════════════════════════════
// CASES
// ═════════════════════════════════════════════════════════════════
.izlp-cases {
  padding: 4.5rem 0; background: #ffffff; text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.6rem, 3.8vw, 2.2rem);
    margin: 0.6rem 0 2.25rem; color: $primary;
  }
}
.izlp-cases__grid {
  display: grid; gap: 1.25rem; grid-template-columns: 1fr; text-align: left;
  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); }
}
.izlp-case {
  background: linear-gradient(180deg, #ffffff 0%, $light 100%);
  border: 1px solid rgba(27, 54, 93, 0.08);
  border-radius: 1.25rem; padding: 1.75rem 1.5rem;
  transition: transform 200ms ease, box-shadow 200ms ease;
  &:hover { transform: translateY(-3px); box-shadow: 0 24px 50px rgba(27, 54, 93, 0.12); }

  h3 { font-family: 'Outfit', system-ui, sans-serif; font-weight: 700; font-size: 1.15rem; margin: 0.75rem 0 0.65rem; color: $primary; }
  p { margin: 0 0 1rem; color: $muted; line-height: 1.6; font-size: 0.95rem; }
}
.izlp-case__num {
  display: inline-block; font-family: 'Outfit', system-ui, sans-serif;
  font-weight: 800; font-size: 1.6rem; color: $accent-d; letter-spacing: 0.05em;
}
.izlp-case__tag {
  display: inline-flex; align-items: center; gap: 0.4rem;
  background: rgba(34, 197, 94, 0.12); color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.25);
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.72rem; letter-spacing: 0.04em; text-transform: uppercase;
  padding: 0.35rem 0.75rem; border-radius: 999px;
  i { font-size: 0.62rem; }
}

// ═════════════════════════════════════════════════════════════════
// FITWHO
// ═════════════════════════════════════════════════════════════════
.izlp-fitwho {
  padding: 4.5rem 0; background: $light;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.6rem, 3.6vw, 2.2rem);
    margin: 0.6rem 0 2rem; color: $primary; text-align: center;
  }
}
.izlp-fitwho__grid {
  display: grid; gap: 1.25rem;
  @media (min-width: 768px) { grid-template-columns: 1fr 1fr; }
}
.izlp-fitwho__col {
  border-radius: 1.25rem; padding: 2rem 1.75rem;

  h3 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700; font-size: 1.15rem;
    margin: 0 0 1.5rem; padding-bottom: 1rem;
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex; align-items: center; gap: 0.65rem;
    > i:first-child { font-size: 1.4rem; flex-shrink: 0; }
  }
  ul {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 0.95rem;
    color: $ink; line-height: 1.55;

    li {
      display: flex; gap: 0.85rem; align-items: flex-start; font-size: 0.95rem;
      > i { flex-shrink: 0; width: 1.5rem; height: 1.5rem; border-radius: 999px; display: inline-grid; place-items: center; font-size: 0.7rem; margin-top: 0.15rem; }
      span { flex: 1; }
    }
  }
}
.izlp-fitwho__col--for {
  background: #ffffff; border: 2px solid $primary;
  box-shadow: 0 12px 30px rgba(27, 54, 93, 0.08);
  h3 { color: $primary; > i:first-child { color: $primary; } }
  ul li > i { background: $primary; color: $accent; }
}
.izlp-fitwho__col--not {
  background: #ffffff; border: 1px solid rgba(0,0,0,0.06);
  h3 { color: $muted; > i:first-child { color: #9ca3af; } }
  ul li > i { background: #e5e9ec; color: $muted; }
  ul li span { color: $muted; }
}

// ═════════════════════════════════════════════════════════════════
// STEPS (dark inverse)
// ═════════════════════════════════════════════════════════════════
.izlp-steps {
  background: $dark; color: #ffffff; padding: 4.5rem 0; text-align: center;

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.6rem, 3.8vw, 2.2rem);
    margin: 0.6rem 0 2.25rem; max-width: 720px; margin-inline: auto; line-height: 1.18;
  }
}
.izlp-steps__eyebrow {
  text-transform: uppercase; letter-spacing: 0.14em;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.74rem; color: $accent;
}
.izlp-steps__list {
  list-style: none; padding: 0; margin: 0;
  display: grid; gap: 1rem; text-align: left;

  @media (min-width: 768px) { grid-template-columns: repeat(2, 1fr); gap: 1.25rem; }

  li {
    display: flex; gap: 1rem; align-items: flex-start;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(196, 149, 106, 0.15);
    border-radius: 1rem; padding: 1.35rem;
    transition: border-color 200ms ease, background 200ms ease;

    &:hover { border-color: rgba(196, 149, 106, 0.4); background: rgba(196, 149, 106, 0.06); }
  }
  span {
    width: 2.5rem; height: 2.5rem; border-radius: 999px;
    background: $accent; color: $dark;
    display: grid; place-items: center;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 800; flex-shrink: 0;
    box-shadow: 0 0 0 4px rgba(196, 149, 106, 0.12);
  }
  p {
    margin: 0; color: #c8d2dd; line-height: 1.55; font-size: 0.95rem;
    strong { color: #ffffff; font-weight: 700; }
  }
}

// ═════════════════════════════════════════════════════════════════
// VER VIDEO
// ═════════════════════════════════════════════════════════════════
.izlp-video {
  padding: 4.5rem 0; background: $light; text-align: center;
  border-top: 1px solid rgba(0,0,0,0.04);
  border-bottom: 1px solid rgba(0,0,0,0.04);

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.5rem, 3.5vw, 2.2rem);
    margin: 0.6rem 0 0.5rem; color: $primary; line-height: 1.18;
  }
}
.izlp-video__lead {
  max-width: 620px; margin: 0 auto 2rem; color: $muted;
  font-size: 1rem; line-height: 1.6;
}
.izlp-video__player {
  position: relative; margin: 0 auto; max-width: 720px;
  border-radius: 1.25rem; overflow: hidden;
  cursor: pointer; aspect-ratio: 16 / 9;
  box-shadow: 0 30px 70px rgba(13, 17, 23, 0.2);
  border: 2px solid rgba(196, 149, 106, 0.3);
  transition: transform 280ms ease, box-shadow 280ms ease, border-color 280ms ease;

  &:hover {
    transform: scale(1.015);
    box-shadow: 0 40px 90px rgba(13, 17, 23, 0.3);
    border-color: $accent;
  }
}
.izlp-video__thumb {
  position: absolute; inset: 0; width: 100%; height: 100%;
  object-fit: cover; display: block;
}
.izlp-video__overlay {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.75rem;
  background: rgba(13, 17, 23, 0.4);
  transition: background 280ms ease;
  .izlp-video__player:hover & { background: rgba(13, 17, 23, 0.25); }
}
.izlp-video__play {
  width: 5rem; height: 5rem; border-radius: 50%;
  background: rgba(196, 149, 106, 0.9);
  color: #0D1117;
  display: grid; place-items: center;
  font-size: 2.2rem;
  box-shadow: 0 8px 30px rgba(196, 149, 106, 0.5);
  transition: transform 280ms ease, background 280ms ease;
  .izlp-video__player:hover & {
    transform: scale(1.1);
    background: $accent;
  }
}
.izlp-video__label {
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 1.1rem; color: #ffffff;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  letter-spacing: 0.04em;
}
.izlp-video__duration {
  position: absolute; top: 1rem; right: 1rem;
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: rgba(13, 17, 23, 0.75);
  backdrop-filter: blur(6px);
  color: #ffffff;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.78rem;
  padding: 0.4rem 0.8rem; border-radius: 999px;
  border: 1px solid rgba(196, 149, 106, 0.3);
  i { color: $accent; font-size: 0.7rem; }
}

// ═════════════════════════════════════════════════════════════════
// ABOUT
// ═════════════════════════════════════════════════════════════════
.izlp-about { padding: 4.5rem 0; background: $light; }
.izlp-about__grid {
  display: grid; gap: 2rem; align-items: center;
  @media (min-width: 768px) { grid-template-columns: 0.6fr 1fr; }

  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.7rem, 4vw, 2.3rem);
    margin: 0.4rem 0 1rem; color: $primary;
  }
  p { color: $muted; line-height: 1.65; margin: 0 0 1rem; }
}
.izlp-about__visual {
  border-radius: 1.5rem; overflow: hidden;
  box-shadow: 0 24px 50px rgba(13, 17, 23, 0.18);
  aspect-ratio: 1 / 1; max-width: 320px; justify-self: center;
  background: #ffffff; display: grid; place-items: center; padding: 1.5rem;
  img { width: 100%; height: 100%; object-fit: contain; display: block; }
}
.izlp-about__link {
  margin-top: 0.5rem; display: inline-flex; align-items: center; gap: 0.5rem;
  color: $dark; text-decoration: none; background: #ffffff;
  border: 1.5px solid $dark; padding: 0.7rem 1.25rem; border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif; font-weight: 700;
  transition: background 160ms ease, color 160ms ease, transform 140ms ease;
  &:hover { background: $dark; color: $accent; transform: translateY(-1px); }
}

// ═════════════════════════════════════════════════════════════════
// FAQ
// ═════════════════════════════════════════════════════════════════
.izlp-faq {
  padding: 4.5rem 0; background: #ffffff;
  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.6rem, 3.6vw, 2.1rem);
    margin: 0.6rem 0 2.25rem; color: $primary; text-align: center;
  }
}
.izlp-faq__list {
  display: flex; flex-direction: column; gap: 0.6rem;
  max-width: 820px; margin: 0 auto;
}
.izlp-faq__item {
  background: #ffffff; border: 1.5px solid #e5e9ec;
  border-radius: 1rem; padding: 0.4rem 1.25rem;
  transition: border-color 160ms ease, box-shadow 200ms ease;

  &[open] { border-color: $accent; background: $light; box-shadow: 0 10px 30px rgba(27, 54, 93, 0.07); }

  summary {
    cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 1rem;
    padding: 0.95rem 0;
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 700; font-size: 1rem; list-style: none; color: $primary;
    &::-webkit-details-marker { display: none; }
    i { color: $accent-d; transition: transform 200ms ease; }
  }
  &[open] summary i { transform: rotate(180deg); }

  p { color: $muted; margin: 0 0 0.95rem; line-height: 1.6; font-size: 0.95rem; }
}

// ═════════════════════════════════════════════════════════════════
// FINAL
// ═════════════════════════════════════════════════════════════════
.izlp-final {
  background: linear-gradient(135deg, $primary 0%, $dark 100%);
  color: #ffffff; padding: 5rem 0; text-align: center;
  position: relative; overflow: hidden;

  &::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 20% 30%, rgba(196, 149, 106, 0.18), transparent 50%);
    pointer-events: none;
  }
  h2 {
    font-family: 'Outfit', system-ui, sans-serif;
    font-weight: 800; font-size: clamp(1.75rem, 4vw, 2.5rem);
    margin: 1rem 0 0.85rem; line-height: 1.15; position: relative;
  }
  p { font-size: 1.05rem; margin: 0 0 2rem; color: #c8d2dd; position: relative; }
  .izlp-btn { position: relative; }
}
.izlp-final__badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(251, 191, 36, 0.14); color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.4);
  padding: 0.45rem 1rem; border-radius: 999px;
  font-family: 'Space Grotesk', system-ui, sans-serif;
  font-weight: 700; font-size: 0.78rem; letter-spacing: 0.06em; text-transform: uppercase;
  position: relative;
}
.izlp-final__note { margin-top: 1.25rem; font-size: 0.85rem; color: rgba(255, 255, 255, 0.65) !important; position: relative; }

// ═════════════════════════════════════════════════════════════════
// FOOTER
// ═════════════════════════════════════════════════════════════════
.izlp-foot {
  padding: 2.25rem 0 2.75rem;
  background: $dark; color: #c8d2dd;
  border-top: 1px solid rgba(196, 149, 106, 0.15);
}
.izlp-foot__inner {
  display: flex; flex-direction: column; gap: 1rem;
  align-items: center; text-align: center; font-size: 0.85rem;
  @media (min-width: 640px) { flex-direction: row; justify-content: space-between; }
  nav { display: flex; gap: 1.25rem; }
  a { color: $accent; text-decoration: none; &:hover { text-decoration: underline; } }
}
.izlp-foot__brand {
  display: flex; align-items: center; gap: 0.65rem;
  img { width: 32px; height: 32px; border-radius: 6px; object-fit: cover; background: #ffffff; }
}
</style>

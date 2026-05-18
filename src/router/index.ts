import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'

import RegistrationView from '@/views/RegistrationView.vue'
import VideoView from '@/views/VideoView.vue'
import BookingView from '@/views/BookingView.vue'
import ThanksView from '@/views/ThanksView.vue'
import NoSpaceView from '@/views/NoSpaceView.vue'
import PrivacyPolicyView from '@/views/PrivacyPolicyView.vue'
import LegalNoticeView from '@/views/LegalNoticeView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    description?: string
    canonical?: string
    ogTitle?: string
    ogDescription?: string
    ogUrl?: string
  }
}

const SITE = 'https://izzuestudio.com'
const BRAND_TITLE = 'IZZU Estudio de Arquitectura — Diagnóstico Técnico-Legal Gratuito'
const BRAND_DESC =
  'Sesión de diagnóstico técnico-legal sin costo para regularizar tu propiedad, dividir terrenos o blindar tu patrimonio. IZZU Estudio de Arquitectura.'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0, behavior: 'instant' }),
  routes: [
    {
      path: '/',
      name: 'registration',
      component: RegistrationView,
      meta: {
        title: BRAND_TITLE,
        description: BRAND_DESC,
        canonical: `${SITE}/`,
        ogTitle: BRAND_TITLE,
        ogDescription: BRAND_DESC,
        ogUrl: `${SITE}/`,
      } satisfies RouteMeta,
    },
    {
      path: '/video',
      name: 'video',
      component: VideoView,
      meta: {
        title: 'Video diagnóstico | IZZU Estudio',
        description: 'Mira el video diagnóstico de IZZU Estudio y completa tu calificación.',
        canonical: `${SITE}/video`,
        ogUrl: `${SITE}/video`,
      } satisfies RouteMeta,
    },
    {
      path: '/agendar',
      name: 'booking',
      component: BookingView,
      meta: {
        title: 'Agenda tu diagnóstico | IZZU Estudio',
        description: 'Reserva el día y hora de tu sesión de diagnóstico técnico-legal con IZZU.',
        canonical: `${SITE}/agendar`,
        ogUrl: `${SITE}/agendar`,
      } satisfies RouteMeta,
    },
    {
      path: '/gracias',
      name: 'thanks',
      component: ThanksView,
      meta: {
        title: 'Gracias | IZZU Estudio',
        description: 'Gracias por tu interés en IZZU Estudio de Arquitectura.',
        canonical: `${SITE}/gracias`,
        ogUrl: `${SITE}/gracias`,
      } satisfies RouteMeta,
    },
    {
      path: '/sin-cupo',
      name: 'no-space',
      component: NoSpaceView,
      meta: {
        title: 'Este diagnóstico no es para ti hoy | IZZU Estudio',
        description: 'Diagnóstico para casos específicos de regularización.',
        canonical: `${SITE}/sin-cupo`,
        ogUrl: `${SITE}/sin-cupo`,
      } satisfies RouteMeta,
    },
    {
      path: '/politicas-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: {
        title: 'Políticas de Privacidad | IZZU Estudio',
        description: 'Tratamiento de datos personales.',
        canonical: `${SITE}/politicas-privacidad`,
        ogUrl: `${SITE}/politicas-privacidad`,
      } satisfies RouteMeta,
    },
    {
      path: '/aviso-legal',
      name: 'legal-notice',
      component: LegalNoticeView,
      meta: {
        title: 'Aviso Legal | IZZU Estudio',
        description: 'Términos de uso del sitio.',
        canonical: `${SITE}/aviso-legal`,
        ogUrl: `${SITE}/aviso-legal`,
      } satisfies RouteMeta,
    },
    // Compatibilidad con rutas viejas
    { path: '/ver-video', redirect: '/video' },
    { path: '/agendada', redirect: '/gracias' },
    { path: '/cita-confirmada', redirect: '/gracias' },
    { path: '/sin-espacio', redirect: '/sin-cupo' },
    { path: '/registro-vsl-tr', redirect: '/' },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ── SEO dinámico ──────────────────────────────────────────────────────
const setMeta = (name: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
  el.content = content
}
const setOgMeta = (property: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
  el.content = content
}
const setCanonical = (href: string) => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) { el = document.createElement('link'); el.rel = 'canonical'; document.head.appendChild(el) }
  el.href = href
}

router.afterEach((to) => {
  const meta = to.meta
  document.title = meta.title ?? BRAND_TITLE
  setMeta('description', meta.description ?? BRAND_DESC)
  setOgMeta('og:title', meta.ogTitle ?? meta.title ?? BRAND_TITLE)
  setOgMeta('og:description', meta.ogDescription ?? meta.description ?? BRAND_DESC)
  setOgMeta('og:url', meta.ogUrl ?? SITE)
  setCanonical(meta.canonical ?? SITE)
})

// ── Guards ────────────────────────────────────────────────────────────
const COOLDOWN_MS = 24 * 60 * 60 * 1000

const isLocalhost = () => {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.endsWith('.local')
}

const REQUIRES_CONTACT = new Set(['video', 'booking', 'thanks'])
const REQUIRES_QUALIFIED = new Set(['booking'])

router.beforeEach((to, _from, next) => {
  if (isLocalhost()) return next()

  const hasContact = !!localStorage.getItem('izzu_contact')
  const isQualified = localStorage.getItem('izzu_qualified') === '1'
  const disqAt = Number(localStorage.getItem('izzu_disq_at') ?? '0')
  const isDisqualified = !!disqAt && Date.now() - disqAt < COOLDOWN_MS
  const routeName = to.name as string | undefined

  if (!routeName) return next({ name: 'registration' })

  if (REQUIRES_CONTACT.has(routeName) && !hasContact) {
    return next({ name: 'registration' })
  }

  if (REQUIRES_QUALIFIED.has(routeName) && !isQualified) {
    return next({ name: hasContact ? 'video' : 'registration' })
  }

  if (isDisqualified && routeName === 'registration') {
    return next({ name: 'no-space' })
  }

  if (isQualified && (routeName === 'registration' || routeName === 'video')) {
    return next({ name: 'booking' })
  }

  next()
})

export default router

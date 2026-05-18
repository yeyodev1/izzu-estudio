import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'

import FunnelView from '@/views/FunnelView.vue'
import SessionBookedView from '@/views/SessionBookedView.vue'
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
  'Sesión de diagnóstico técnico-legal sin costo para regularizar tu propiedad, dividir terrenos o blindar tu patrimonio. IZZU Estudio de Arquitectura, especialistas en regularización de edificaciones y propiedad horizontal.'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0, behavior: 'instant' }),
  routes: [
    {
      path: '/',
      name: 'funnel',
      component: FunnelView,
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
      path: '/agendada',
      name: 'session-booked',
      component: SessionBookedView,
      meta: {
        title: 'Sesión agendada | IZZU Estudio de Arquitectura',
        description:
          'Confirmación oficial: tu sesión de diagnóstico técnico-legal con IZZU Estudio de Arquitectura ha sido agendada. Te contactaremos pronto.',
        canonical: `${SITE}/agendada`,
        ogTitle: 'Sesión de diagnóstico agendada — IZZU Estudio',
        ogDescription:
          'Recibirás la confirmación y los pasos a seguir para tu diagnóstico de regularización patrimonial.',
        ogUrl: `${SITE}/agendada`,
      } satisfies RouteMeta,
    },
    {
      path: '/sin-cupo',
      name: 'no-space',
      component: NoSpaceView,
      meta: {
        title: 'Este diagnóstico no es para ti hoy — IZZU Estudio',
        description:
          'Las sesiones de diagnóstico de IZZU Estudio están diseñadas para propietarios e inversionistas con necesidades específicas de regularización. Síguenos en Instagram mientras tanto.',
        canonical: `${SITE}/sin-cupo`,
        ogTitle: 'Este diagnóstico no es para ti hoy — IZZU Estudio',
        ogDescription:
          'Propietarios, inversionistas y desarrolladores con necesidades de regularización patrimonial. Síguenos en Instagram.',
        ogUrl: `${SITE}/sin-cupo`,
      } satisfies RouteMeta,
    },
    {
      path: '/politicas-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: {
        title: 'Políticas de Privacidad | IZZU Estudio de Arquitectura',
        description:
          'Cómo IZZU Estudio de Arquitectura trata los datos personales recogidos en las sesiones de diagnóstico.',
        canonical: `${SITE}/politicas-privacidad`,
        ogTitle: 'Políticas de Privacidad | IZZU Estudio',
        ogDescription: 'Tratamiento y protección de datos personales en izzuestudio.com.',
        ogUrl: `${SITE}/politicas-privacidad`,
      } satisfies RouteMeta,
    },
    {
      path: '/aviso-legal',
      name: 'legal-notice',
      component: LegalNoticeView,
      meta: {
        title: 'Aviso Legal | IZZU Estudio de Arquitectura',
        description:
          'Términos de uso del sitio izzuestudio.com y de las sesiones de diagnóstico técnico-legal.',
        canonical: `${SITE}/aviso-legal`,
        ogTitle: 'Aviso Legal | IZZU Estudio',
        ogDescription: 'Términos de uso del sitio y de las sesiones de diagnóstico.',
        ogUrl: `${SITE}/aviso-legal`,
      } satisfies RouteMeta,
    },
    // Compatibilidad con rutas viejas — redirigen a home o nuevas rutas
    { path: '/ver-video', redirect: '/' },
    { path: '/agendar', redirect: '/' },
    { path: '/cita-confirmada', redirect: '/agendada' },
    { path: '/sin-espacio', redirect: '/sin-cupo' },
    { path: '/registro-vsl-tr', redirect: '/' },
    // 404 → home
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

// ── SEO dinámico por ruta ──────────────────────────────────────────────────────
const setMeta = (name: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.name = name
    document.head.appendChild(el)
  }
  el.content = content
}

const setOgMeta = (property: string, content: string) => {
  let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.content = content
}

const setCanonical = (href: string) => {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.rel = 'canonical'
    document.head.appendChild(el)
  }
  el.href = href
}

router.afterEach((to) => {
  const meta = to.meta
  document.title = meta.title ?? BRAND_TITLE
  setMeta('description', meta.description ?? BRAND_DESC)
  setOgMeta('og:title', meta.ogTitle ?? meta.title ?? BRAND_TITLE)
  setOgMeta('og:description', meta.ogDescription ?? meta.description ?? BRAND_DESC)
  setOgMeta('og:url', meta.ogUrl ?? SITE)
  setOgMeta('twitter:title', meta.ogTitle ?? meta.title ?? BRAND_TITLE)
  setOgMeta('twitter:description', meta.ogDescription ?? meta.description ?? BRAND_DESC)
  setCanonical(meta.canonical ?? SITE)
})

// ── Router Guards ──────────────────────────────────────────────────────────────
const COOLDOWN_MS = 24 * 60 * 60 * 1000

const isLocalhost = () => {
  if (typeof window === 'undefined') return false
  const h = window.location.hostname
  return h === 'localhost' || h === '127.0.0.1' || h.startsWith('192.168.') || h.endsWith('.local')
}

const PROTECTED_ROUTES = new Set(['session-booked', 'no-space'])
const PUBLIC_ROUTES = new Set(['funnel', 'privacy-policy', 'legal-notice'])

router.beforeEach((to, _from, next) => {
  if (isLocalhost()) return next()

  const hasContact = !!localStorage.getItem('izzu_contact')
  const disqAt = Number(localStorage.getItem('izzu_disq_at') ?? '0')
  const isDisqualified = disqAt && Date.now() - disqAt < COOLDOWN_MS
  const routeName = to.name as string | undefined

  if (routeName && PROTECTED_ROUTES.has(routeName) && !hasContact) {
    return next({ name: 'funnel' })
  }

  if (routeName && !PROTECTED_ROUTES.has(routeName) && !PUBLIC_ROUTES.has(routeName)) {
    return next({ name: 'funnel' })
  }

  if (isDisqualified && routeName === 'funnel') {
    return next({ name: 'no-space' })
  }

  if (hasContact && !isDisqualified && routeName === 'funnel') {
    return next({ name: 'session-booked' })
  }

  next()
})

export default router

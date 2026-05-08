import { createRouter, createWebHistory, type RouteMeta } from 'vue-router'

import FunnelView from '@/views/FunnelView.vue'
import VIPConfirmedView from '@/views/VIPConfirmedView.vue'
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

const SITE = 'https://luisapitabejarano.com'

const BRAND_TITLE = 'Comunidad Anual Luisa Pita — Preventa VIP cerrada'
const BRAND_DESC =
  'Sé de las primeras en entrar a la comunidad anual de Luisa Pita Bejarano. Lista VIP en preventa para mujeres ocupadas y dueñas de negocio decididas a transformar su cuerpo y su vida en un año.'

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
      path: '/registrada',
      name: 'vip-confirmed',
      component: VIPConfirmedView,
      meta: {
        title: 'Estás dentro | Comunidad Luisa Pita Bejarano',
        description:
          'Confirmación oficial: tu cupo VIP en la preventa de la comunidad anual de Luisa Pita Bejarano está reservado.',
        canonical: `${SITE}/registrada`,
        ogTitle: 'Estás dentro de la lista VIP de Luisa Pita Bejarano',
        ogDescription:
          'Recibirás aviso 24h antes de que abra la preventa y el código de descuento exclusivo en tu email.',
        ogUrl: `${SITE}/registrada`,
      } satisfies RouteMeta,
    },
    {
      path: '/sin-cupo',
      name: 'no-space',
      component: NoSpaceView,
      meta: {
        title: 'Esta comunidad no es para ti — Luisa Pita Bejarano',
        description:
          'La comunidad anual de Luisa Pita Bejarano es para mujeres decididas a invertir un año entero en su transformación. Sigue su trabajo en Instagram mientras tanto.',
        canonical: `${SITE}/sin-cupo`,
        ogTitle: 'Esta comunidad no es para ti — Luisa Pita Bejarano',
        ogDescription:
          'Mujeres decididas a comprometerse con el año completo. Sigue a Luisa en Instagram para mantenerte cerca.',
        ogUrl: `${SITE}/sin-cupo`,
      } satisfies RouteMeta,
    },
    {
      path: '/politicas-privacidad',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
      meta: {
        title: 'Políticas de Privacidad | Luisa Pita Bejarano',
        description:
          'Cómo Luisa Pita Bejarano trata los datos personales recogidos en la preventa de la comunidad anual.',
        canonical: `${SITE}/politicas-privacidad`,
        ogTitle: 'Políticas de Privacidad | Luisa Pita Bejarano',
        ogDescription: 'Tratamiento y protección de datos personales en luisapitabejarano.com.',
        ogUrl: `${SITE}/politicas-privacidad`,
      } satisfies RouteMeta,
    },
    {
      path: '/aviso-legal',
      name: 'legal-notice',
      component: LegalNoticeView,
      meta: {
        title: 'Aviso Legal | Luisa Pita Bejarano',
        description:
          'Términos de uso del sitio luisapitabejarano.com y de la preventa de la comunidad anual.',
        canonical: `${SITE}/aviso-legal`,
        ogTitle: 'Aviso Legal | Luisa Pita Bejarano',
        ogDescription: 'Términos de uso del sitio y de la preventa.',
        ogUrl: `${SITE}/aviso-legal`,
      } satisfies RouteMeta,
    },
    // Compatibilidad con rutas viejas — redirigen a home
    { path: '/ver-video', redirect: '/' },
    { path: '/agendar', redirect: '/' },
    { path: '/cita-confirmada', redirect: '/registrada' },
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

// Páginas que requieren haber dejado contacto antes (lpb_contact en localStorage).
// Las páginas legales siempre son públicas. La home (`funnel`) es el único punto de entrada.
const PROTECTED_ROUTES = new Set(['vip-confirmed', 'no-space'])
const PUBLIC_ROUTES = new Set(['funnel', 'privacy-policy', 'legal-notice'])

router.beforeEach((to, _from, next) => {
  if (isLocalhost()) return next()

  const hasContact = !!localStorage.getItem('lpb_contact')
  const disqAt = Number(localStorage.getItem('lpb_disq_at') ?? '0')
  const isDisqualified = disqAt && Date.now() - disqAt < COOLDOWN_MS
  const routeName = to.name as string | undefined

  // Páginas protegidas: solo accesibles si ya dejó contacto.
  if (routeName && PROTECTED_ROUTES.has(routeName) && !hasContact) {
    return next({ name: 'funnel' })
  }

  // Cualquier ruta no listada explícitamente: cierra todo y manda al funnel.
  if (routeName && !PROTECTED_ROUTES.has(routeName) && !PUBLIC_ROUTES.has(routeName)) {
    return next({ name: 'funnel' })
  }

  // Si fue descalificado en cooldown y reintenta entrar al funnel, lo mandamos al rechazo.
  if (isDisqualified && routeName === 'funnel') {
    return next({ name: 'no-space' })
  }

  next()
})

export default router

/**
 * Tracking dual: Meta Pixel cliente + Conversions API server-side.
 * Mismo event_id en ambos lados → Meta deduplica automáticamente.
 *
 * Flujo:
 *   1. fbq('track', name, custom_data, { eventID })  → cliente
 *   2. POST /api/capi { event_name, event_id, user_data, ... } → Worker → Meta CAPI
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void
  }
}

type EventName = 'PageView' | 'Lead' | 'CompleteRegistration' | 'ViewContent' | 'Contact'

interface UserDataInput {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  country?: string
  city?: string
  externalId?: string
}

interface CustomData {
  content_name?: string
  content_category?: string
  currency?: string
  value?: number
  [key: string]: unknown
}

interface TrackOptions {
  user?: UserDataInput
  custom?: CustomData
  eventId?: string
}

const readCookie = (name: string): string | undefined => {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : undefined
}

const newEventId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

const sendCapi = async (
  name: EventName,
  eventId: string,
  user: UserDataInput | undefined,
  custom: CustomData | undefined,
): Promise<void> => {
  const body = {
    event_name: name,
    event_id: eventId,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: typeof window !== 'undefined' ? window.location.href : undefined,
    user_data: {
      email: user?.email,
      phone: user?.phone,
      first_name: user?.firstName,
      last_name: user?.lastName,
      country: user?.country,
      city: user?.city,
      external_id: user?.externalId,
      fbp: readCookie('_fbp'),
      fbc: readCookie('_fbc'),
    },
    custom_data: custom,
  }

  try {
    await fetch('/api/capi', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    })
  } catch {
    /* CAPI failures must not break UX */
  }
}

const trackEvent = (name: EventName, opts: TrackOptions = {}): string => {
  const eventId = opts.eventId ?? newEventId()

  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', name, opts.custom ?? {}, { eventID: eventId })
  }

  void sendCapi(name, eventId, opts.user, opts.custom)

  return eventId
}

export const trackPageView = (opts: TrackOptions = {}) => trackEvent('PageView', opts)

export const trackLead = (opts: TrackOptions = {}) => trackEvent('Lead', opts)

export const trackCompleteRegistration = (opts: TrackOptions = {}) =>
  trackEvent('CompleteRegistration', opts)

export const trackViewContent = (opts: TrackOptions = {}) => trackEvent('ViewContent', opts)

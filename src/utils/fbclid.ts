const STORAGE_KEY = 'izzu_fb'

export interface FbParams {
  fbclid: string
  fbc: string
  fbp: string
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
  utm_id: string
}

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : ''
}

function buildFbc(fbclid: string): string {
  return `fb.1.${Date.now()}.${fbclid}`
}

export function captureFbParams(): void {
  const params = new URLSearchParams(window.location.search)
  const fbclid = params.get('fbclid') ?? ''

  const existing = getStoredFbParams()

  if (!fbclid && existing.fbclid) return

  const data: FbParams = {
    fbclid,
    fbc: fbclid ? buildFbc(fbclid) : getCookie('_fbc'),
    fbp: getCookie('_fbp'),
    utm_source:   params.get('utm_source')   ?? '',
    utm_medium:   params.get('utm_medium')   ?? '',
    utm_campaign: params.get('utm_campaign') ?? '',
    utm_content:  params.get('utm_content')  ?? '',
    utm_term:     params.get('utm_term')     ?? '',
    utm_id:       params.get('utm_id')       ?? '',
  }

  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getStoredFbParams(): FbParams {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as FbParams
  } catch { /* ignorar */ }
  return {
    fbclid: '', fbc: '', fbp: '',
    utm_source: '', utm_medium: '', utm_campaign: '',
    utm_content: '', utm_term: '', utm_id: '',
  }
}

import type { CapiClientPayload, CapiUserData, Env } from './types'

const META_GRAPH_VERSION = 'v21.0'

const sha256 = async (raw: string): Promise<string> => {
  const data = new TextEncoder().encode(raw)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

const normEmail = (email: string) => email.trim().toLowerCase()

const normPhone = (phone: string) => phone.replace(/[^\d]/g, '')

const normName = (name: string) => name.trim().toLowerCase()

const normCountry = (country: string) => country.trim().toLowerCase().slice(0, 2)

const buildUserData = async (
  user: CapiUserData,
  ip: string | null,
  ua: string | null,
): Promise<Record<string, unknown>> => {
  const out: Record<string, unknown> = {}

  if (user.email) out.em = [await sha256(normEmail(user.email))]
  if (user.phone) out.ph = [await sha256(normPhone(user.phone))]
  if (user.first_name) out.fn = [await sha256(normName(user.first_name))]
  if (user.last_name) out.ln = [await sha256(normName(user.last_name))]
  if (user.country) out.country = [await sha256(normCountry(user.country))]
  if (user.city) out.ct = [await sha256(normName(user.city))]
  if (user.external_id) out.external_id = [await sha256(user.external_id.trim())]
  if (user.fbp) out.fbp = user.fbp
  if (user.fbc) out.fbc = user.fbc
  if (ip) out.client_ip_address = ip
  if (ua) out.client_user_agent = ua

  return out
}

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  })

export const handleCapiRequest = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  if (request.method !== 'POST') {
    return jsonResponse(405, { ok: false, error: 'method_not_allowed' })
  }

  if (!env.META_PIXEL_ID || !env.META_ACCESS_TOKEN) {
    return jsonResponse(200, { ok: false, error: 'capi_not_configured' })
  }

  let payload: CapiClientPayload
  try {
    payload = (await request.json()) as CapiClientPayload
  } catch {
    return jsonResponse(400, { ok: false, error: 'invalid_json' })
  }

  if (!payload.event_name || !payload.event_id) {
    return jsonResponse(400, { ok: false, error: 'missing_required_fields' })
  }

  const ip = request.headers.get('CF-Connecting-IP')
  const ua = request.headers.get('User-Agent')

  const userData = await buildUserData(payload.user_data ?? {}, ip, ua)

  const event = {
    event_name: payload.event_name,
    event_id: payload.event_id,
    event_time: payload.event_time ?? Math.floor(Date.now() / 1000),
    event_source_url: payload.event_source_url,
    action_source: 'website',
    user_data: userData,
    custom_data: payload.custom_data ?? {},
  }

  const body: Record<string, unknown> = { data: [event] }
  if (env.META_TEST_EVENT_CODE) {
    body.test_event_code = env.META_TEST_EVENT_CODE
  }

  const url = `https://graph.facebook.com/${META_GRAPH_VERSION}/${env.META_PIXEL_ID}/events?access_token=${encodeURIComponent(env.META_ACCESS_TOKEN)}`

  try {
    const metaRes = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    })
    const metaJson = await metaRes.json().catch(() => ({}))
    return jsonResponse(200, {
      ok: metaRes.ok,
      status: metaRes.status,
      meta: metaJson,
    })
  } catch (err) {
    return jsonResponse(200, {
      ok: false,
      error: 'meta_fetch_failed',
      detail: String(err),
    })
  }
}

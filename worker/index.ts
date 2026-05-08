import { handleCapiRequest } from './capi'
import type { Env } from './types'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/api/capi') {
      return handleCapiRequest(request, env)
    }

    if (url.pathname === '/api/health') {
      return new Response(
        JSON.stringify({
          ok: true,
          capi_configured: Boolean(env.META_PIXEL_ID && env.META_ACCESS_TOKEN),
        }),
        { headers: { 'content-type': 'application/json' } },
      )
    }

    return env.ASSETS.fetch(request)
  },
} satisfies ExportedHandler<Env>

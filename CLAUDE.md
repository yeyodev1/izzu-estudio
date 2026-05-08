# Luisa Pita Bejarano — Comunidad Anual (Preventa VIP)

## Proyecto

Landing oficial de la **preventa cerrada de la comunidad anual** de Luisa Pita Bejarano (luisapitabejarano.com).

- **Modelo de negocio**: comunidad fitness anual con Luisa. Año entero, no programas cortos.
- **Audiencia**: mujeres ocupadas / dueñas de negocio, decididas a invertir en sí mismas.
- **Filtro de calificación**: capital tres cifras (USD) disponible **+** compromiso de un año entero.
- **Estado del precio**: TBD. Solo se captan leads VIP. Quien califica recibe aviso 24h antes de la apertura y un código de descuento exclusivo.
- **Objetivo medible**: maximizar leads calificados con tracking dual (Meta Pixel cliente + Conversions API server-side).

## Stack

- **Vue 3** + Vite 7 + TypeScript
- **SCSS** scoped por componente; paleta verde/negro/blanco hardcoded en views nuevas
- **vue-router** (rutas del funnel + legales)
- **Pinia** (store opcional `useContactStore`)
- **pnpm** como package manager
- **FontAwesome 6** (CDN en `index.html`) — usar `<i class="fa-solid fa-...">`, NO emojis
- **Cloudflare Workers** para servir SPA + endpoint `/api/capi`

## Flujo del Funnel

```
/                         FunnelView — landing comunidad preventa
  ↓ click "Quiero mi cupo VIP" (cualquier CTA)
[RegistrationModal]       nombre, apellido, email, teléfono, país
  ↓ submit → trackLead() (Pixel + CAPI mismo event_id) + webhook GHL registro
[QualifyModal]            2 preguntas:
                          1. ¿Capital tres cifras disponible?
                          2. ¿Lista para 1 año entero?
  ↓ ambas "sí"
/registrada               VIPConfirmedView — saludo personalizado + próximos pasos
                          dispara trackCompleteRegistration()
  ↓ alguna "no"
/sin-cupo                 NoSpaceView — rechazo empático + IG @luisapitabejarano
                          + cooldown 24h via lpb_disq_at
```

## Vistas activas y rutas

| Ruta | View | Notas |
|---|---|---|
| `/` | `FunnelView.vue` | Página principal — captura comunidad preventa |
| `/registrada` | `VIPConfirmedView.vue` | Confirmación VIP |
| `/sin-cupo` | `NoSpaceView.vue` | Rechazo + IG |
| `/politicas-privacidad` | `PrivacyPolicyView.vue` | Marca placeholders `[PENDIENTE: ...]` para datos legales reales |
| `/aviso-legal` | `LegalNoticeView.vue` | Idem |
| `/ver-video`, `/agendar`, `/cita-confirmada`, `/sin-espacio`, `/registro-vsl-tr` | redirect | Compatibilidad con rutas viejas |

## LocalStorage — claves en uso

| Clave | Contenido | Quién lo escribe |
|---|---|---|
| `lpb_contact` | `{ nombre, apellido, email, phone, country, timestamp }` | RegistrationModal |
| `lpb_disq_at` | timestamp ms | QualifyModal al desclasificar |

## Tracking — Meta Pixel + Conversions API

- Pixel cliente inicializado en `index.html` con ID `1637338760901793`.
- Util cliente: `src/utils/tracking.ts` exporta `trackPageView`, `trackLead`, `trackCompleteRegistration`, `trackViewContent`. Cada llamada genera un `event_id` (UUID) y dispara en paralelo:
  - `fbq('track', name, custom, { eventID })` cliente
  - `fetch('/api/capi', { event_name, event_id, user_data, custom_data, ... })` server-side
- Worker en `worker/index.ts` rutea `/api/capi` → `worker/capi.ts` que:
  - Hashea `email`, `phone`, nombres, país, `external_id` con SHA-256 (Web Crypto).
  - Inyecta `client_ip_address` (CF-Connecting-IP) y `client_user_agent`.
  - Llama `https://graph.facebook.com/v21.0/{PIXEL_ID}/events?access_token=...`.
- Config Worker en `wrangler.toml` con `main = "worker/index.ts"` + `[assets] binding = "ASSETS" run_worker_first = ["/api/*"]`.
- Mismo `event_id` en pixel y CAPI ⇒ Meta deduplica automáticamente.

### Secrets del Worker (NO commitear)

```bash
wrangler secret put META_PIXEL_ID         # 1637338760901793
wrangler secret put META_ACCESS_TOKEN     # rotar antes de producción
wrangler secret put META_TEST_EVENT_CODE  # solo para QA — borrar después
```

Para `wrangler dev` local: crear `.dev.vars` (gitignored):

```
META_PIXEL_ID=...
META_ACCESS_TOKEN=...
META_TEST_EVENT_CODE=...
```

## Webhooks GHL (LeadConnectorHQ)

- `VITE_WEBHOOK_REGISTRO` — disparado por RegistrationModal al submit.
- `VITE_WEBHOOK_CALIFICACION` — disparado por QualifyModal al responder ambas preguntas.

## Estructura clave

```
src/
  views/
    FunnelView.vue           ← / — landing comunidad preventa
    VIPConfirmedView.vue     ← /registrada — confirmación VIP
    NoSpaceView.vue          ← /sin-cupo — rechazo
    PrivacyPolicyView.vue    ← /politicas-privacidad
    LegalNoticeView.vue      ← /aviso-legal
  components/
    RegistrationModal.vue    ← captura (nombre, apellido, email, teléfono, país) + emit('submitted')
    QualifyModal.vue         ← 2 preguntas filtro VIP → /registrada o /sin-cupo
    SocialProofToast.vue     ← toast cíclico solo en /
    booked/                  ← orfanos del pivote previo (no usados)
  utils/
    tracking.ts              ← Pixel + CAPI util
    fbclid.ts                ← captureFbParams(), getStoredFbParams()
    ghl.ts                   ← trackStage, generateEventId
  stores/
    contact.ts               ← Pinia store opcional
worker/
  index.ts                   ← Cloudflare Worker entry — rutea /api/capi
  capi.ts                    ← Conversions API handler con SHA-256
  types.ts                   ← Env, CapiClientPayload, etc.
public/
  llms.txt, robots.txt, sitemap.xml — todo apunta a luisapitabejarano.com
wrangler.toml                ← Worker + assets binding
.env                         ← solo VITE_WEBHOOK_*  (no commitear)
.env.example                 ← documenta variables públicas
.dev.vars                    ← Worker secrets locales (gitignored)
```

## Colores de marca

```scss
// Hardcoded inline en componentes nuevos. La paleta canónica:
$LPB-GREEN:    #16C784  // CTAs y acentos
$LPB-GREEN-D:  #0A9E68  // Hover
$LPB-BLACK:    #0D1117  // Texto / bloques oscuros
$LPB-LIGHT:    #F0FFF8  // Fondos suaves
$LPB-SURFACE:  #F5FFFA  // Cards
```

## Fuentes (cargadas desde Google Fonts en `index.html`)

- Headings: **Outfit** (700, 800)
- Body: **Plus Jakarta Sans** (400, 500, 600, 700)
- Accent / CTAs: **Space Grotesk** (500, 600, 700)
- Auxiliar: **Manrope**

## Comandos

```bash
pnpm dev                    # Vite dev (frontend solo)
pnpm build                  # type-check + build a dist/
pnpm type-check             # vue-tsc --build
wrangler dev                # Worker local + sirve dist/ + endpoint /api/capi
wrangler secret put VAR     # subir secret a Cloudflare
wrangler deploy             # deploy a Workers
```

## No hacer

- No agregar Header/Footer global; el funnel monta su propio footer en cada view.
- No usar emojis en UI — siempre íconos FontAwesome (`<i class="fa-solid fa-...">`).
- No exponer `META_ACCESS_TOKEN` en cliente ni en `.env` versionado.
- No crear nuevas rutas sin actualizar `sitemap.xml` y este documento.
- No reusar la storage key `os_*` ni `os_disq_at` (legado de Ocean Safety eliminado).
- No mostrar precios públicos: TBD. Solo "capital tres cifras" como filtro.

## Pendientes externos (requieren input del titular)

1. **Datos legales reales** de Luisa Pita Bejarano — nombre legal, RUC/cédula, dirección, email oficial. Hoy aparecen como `[PENDIENTE: ...]` en `PrivacyPolicyView` y `LegalNoticeView`.
2. **Rotar token de Meta Conversions API** desde Meta Business → System Users (el token se compartió en chat plano; el secret del Worker debe ser uno nuevo).
3. **Deliverables exactos del año** dentro de la comunidad — los bullets de `FunnelView` son honestos pero genéricos.
4. **Captions de Instagram** representativos si se quiere afinar la voz del copy a Luisa real.

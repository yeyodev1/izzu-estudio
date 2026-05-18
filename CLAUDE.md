# IZZU Estudio de Arquitectura — Regularización y Blindaje Patrimonial

## Proyecto

Landing oficial de **sesiones de diagnóstico técnico-legal gratuito** de IZZU Estudio de Arquitectura (izzuestudio.com).

- **Modelo de negocio**: estudio de arquitectura especializado en regularización de edificaciones, propiedad horizontal, división de solares y urbanismo estratégico.
- **Audiencia**: propietarios, inversionistas, herederos y desarrolladores que necesitan regularizar, dividir o blindar legalmente sus inmuebles.
- **Filtro de calificación**: tipo de situación inmobiliaria + tipo de inmueble + rango de valor estimado.
- **Estado del precio**: TBD. Solo se captan leads calificados para sesión de diagnóstico gratuito.
- **Objetivo medible**: maximizar leads calificados con tracking dual (Meta Pixel cliente + Conversions API server-side).

## Stack

- **Vue 3** + Vite 7 + TypeScript
- **SCSS** scoped por componente; paleta azul marino/dorado/blanco hardcoded en views nuevas
- **vue-router** (rutas del funnel + legales)
- **Pinia** (store opcional `useContactStore`)
- **pnpm** como package manager
- **FontAwesome 6** (CDN en `index.html`) — usar `<i class="fa-solid fa-...">`, NO emojis
- **Cloudflare Workers** para servir SPA + endpoint `/api/capi`

## Flujo del Funnel

```
/                         FunnelView — landing IZZU
  ↓ click "Quiero mi diagnóstico gratuito" (cualquier CTA)
[RegistrationModal]       nombre, apellido, email, teléfono, país
  ↓ submit → trackLead() (Pixel + CAPI mismo event_id) + webhook GHL registro
[QualifyModal]            3 preguntas:
                          1. ¿Cuál es tu situación actual?
                          2. ¿Qué tipo de inmueble tienes?
                          3. ¿En qué rango estimas el valor?
  ↓ match
/agendada                 SessionBookedView — confirmación + próximos pasos
                          dispara trackCompleteRegistration()
  ↓ no match
/sin-cupo                 NoSpaceView — rechazo empático + IG @izzuestudio
                          + cooldown 24h via izzu_disq_at
```

## Vistas activas y rutas

| Ruta | View | Notas |
|---|---|---|
| `/` | `FunnelView.vue` | Página principal — captura diagnóstico |
| `/agendada` | `SessionBookedView.vue` | Confirmación de sesión |
| `/sin-cupo` | `NoSpaceView.vue` | Rechazo + IG |
| `/politicas-privacidad` | `PrivacyPolicyView.vue` | Marca placeholders `[PENDIENTE: ...]` para datos legales reales |
| `/aviso-legal` | `LegalNoticeView.vue` | Idem |
| `/ver-video`, `/agendar`, `/cita-confirmada`, `/sin-espacio`, `/registro-vsl-tr` | redirect | Compatibilidad con rutas viejas |

## LocalStorage — claves en uso

| Clave | Contenido | Quién lo escribe |
|---|---|---|
| `izzu_contact` | `{ nombre, apellido, email, phone, country, timestamp }` | RegistrationModal |
| `izzu_disq_at` | timestamp ms | QualifyModal al desclasificar |

## Tracking — Meta Pixel + Conversions API

- Pixel cliente inicializado en `index.html` con ID `META_PIXEL_ID` (reemplazar).
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
wrangler secret put META_PIXEL_ID         # Reemplazar con el nuevo
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
- `VITE_WEBHOOK_CALIFICACION` — disparado por QualifyModal al responder.

## Estructura clave

```
src/
  views/
    FunnelView.vue           ← / — landing IZZU
    SessionBookedView.vue    ← /agendada — confirmación
    NoSpaceView.vue          ← /sin-cupo — rechazo
    PrivacyPolicyView.vue    ← /politicas-privacidad
    LegalNoticeView.vue      ← /aviso-legal
  components/
    RegistrationModal.vue    ← captura (nombre, apellido, email, teléfono, país) + emit('submitted')
    QualifyModal.vue         ← 3 preguntas filtro → /agendada o /sin-cupo
    SocialProofToast.vue     ← toast cíclico solo en /
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
  llms.txt, robots.txt, sitemap.xml — todo apunta a izzuestudio.com
wrangler.toml                ← Worker + assets binding
.env                         ← solo VITE_WEBHOOK_*  (no commitear)
.env.example                 ← documenta variables públicas
.dev.vars                    ← Worker secrets locales (gitignored)
```

## Colores de marca

```scss
// Hardcoded inline en componentes nuevos. La paleta canónica:
$IZZU-PRIMARY:  #1B365D  // Azul marino — confianza, estabilidad, arquitectura
$IZZU-ACCENT:   #C4956A  // Dorado/piedra cálido — premium, terroso
$IZZU-ACCENT-D: #A0784F  // Dorado oscuro — hover
$IZZU-DARK:     #0D1117  // Texto / bloques oscuros
$IZZU-LIGHT:    #F5F7FA  // Fondos suaves gris-azul
$IZZU-SURFACE:  #FFFFFF  // Cards blancas
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
- No reusar la storage key `os_*` ni `lpb_*` (legado eliminado).

## Pendientes externos (requieren input del titular)

1. **Datos legales reales** de IZZU Estudio de Arquitectura — nombre legal, RUC/cédula, dirección, email oficial. Hoy aparecen como `[PENDIENTE: ...]` en `PrivacyPolicyView` y `LegalNoticeView`.
2. **Rotar token de Meta Conversions API** desde Meta Business → System Users.
3. **Pixel ID de Meta** real para IZZU (reemplazar `META_PIXEL_ID`).
4. **Logo de IZZU** para reemplazar placeholder en FunnelView.

# context-mode — MANDATORY routing rules

You have context-mode MCP tools available. These rules are NOT optional — they protect your context window from flooding. A single unrouted command can dump 56 KB into context and waste the entire session.

## BLOCKED commands — do NOT attempt these

### curl / wget — BLOCKED
Any Bash command containing `curl` or `wget` is intercepted and replaced with an error message. Do NOT retry.
Instead use:
- `ctx_fetch_and_index(url, source)` to fetch and index web pages
- `ctx_execute(language: "javascript", code: "const r = await fetch(...)")` to run HTTP calls in sandbox

### Inline HTTP — BLOCKED
Any Bash command containing `fetch('http`, `requests.get(`, `requests.post(`, `http.get(`, or `http.request(` is intercepted and replaced with an error message. Do NOT retry with Bash.
Instead use:
- `ctx_execute(language, code)` to run HTTP calls in sandbox — only stdout enters context

### WebFetch — BLOCKED
WebFetch calls are denied entirely. The URL is extracted and you are told to use `ctx_fetch_and_index` instead.
Instead use:
- `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` to query the indexed content

## REDIRECTED tools — use sandbox equivalents

### Bash (>20 lines output)
Bash is ONLY for: `git`, `mkdir`, `rm`, `mv`, `cd`, `ls`, `npm install`, `pip install`, and other short-output commands.
For everything else, use:
- `ctx_batch_execute(commands, queries)` — run multiple commands + search in ONE call
- `ctx_execute(language: "shell", code: "...")` — run in sandbox, only stdout enters context

### Read (for analysis)
If you are reading a file to **Edit** it → Read is correct (Edit needs content in context).
If you are reading to **analyze, explore, or summarize** → use `ctx_execute_file(path, language, code)` instead. Only your printed summary enters context. The raw file content stays in the sandbox.

### Grep (large results)
Grep results can flood context. Use `ctx_execute(language: "shell", code: "grep ...")` to run searches in sandbox. Only your printed summary enters context.

## Tool selection hierarchy

1. **GATHER**: `ctx_batch_execute(commands, queries)` — Primary tool. Runs all commands, auto-indexes output, returns search results. ONE call replaces 30+ individual calls.
2. **FOLLOW-UP**: `ctx_search(queries: ["q1", "q2", ...])` — Query indexed content. Pass ALL questions as array in ONE call.
3. **PROCESSING**: `ctx_execute(language, code)` | `ctx_execute_file(path, language, code)` — Sandbox execution. Only stdout enters context.
4. **WEB**: `ctx_fetch_and_index(url, source)` then `ctx_search(queries)` — Fetch, chunk, index, query. Raw HTML never enters context.
5. **INDEX**: `ctx_index(content, source)` — Store content in FTS5 knowledge base for later search.

## Subagent routing

When spawning subagents (Agent/Task tool), the routing block is automatically injected into their prompt. Bash-type subagents are upgraded to general-purpose so they have access to MCP tools. You do NOT need to manually instruct subagents about context-mode.

## Output constraints

- Keep responses under 500 words.
- Write artifacts (code, configs, PRDs) to FILES — never return them as inline text. Return only: file path + 1-line description.
- When indexing content, use descriptive source labels so others can `ctx_search(source: "label")` later.

## ctx commands

| Command | Action |
|---------|--------|
| `ctx stats` | Call the `ctx_stats` MCP tool and display the full output verbatim |
| `ctx doctor` | Call the `ctx_doctor` MCP tool, run the returned shell command, display as checklist |
| `ctx upgrade` | Call the `ctx_upgrade` MCP tool, run the returned shell command, display as checklist |

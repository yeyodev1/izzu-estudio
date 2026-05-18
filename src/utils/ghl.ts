export function generateEventId(prefix = 'evt'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export async function trackStage(etapa: string, data: Record<string, string> & { event_id?: string }) {
  try {
    const event_id = data.event_id ?? generateEventId('view')
    const webhookUrl = import.meta.env.VITE_WEBHOOK_REGISTRO
    if (!webhookUrl) return
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ etapa, event_id, ...data }),
    })
  } catch {
    // silencioso — nunca bloquear la UX por un fallo de tracking
  }
}

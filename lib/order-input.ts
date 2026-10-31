import { MOODS, OCCASIONS, isTierId, type TierId } from './catalog'

export type OrderInput = {
  tier: TierId
  occasion: string
  mood: string
  customerName: string
  customerEmail: string
  recipientName: string
  story: string
  consent: true
}

export type ValidationResult = { ok: true; value: OrderInput } | { ok: false; error: string }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max + 1) : ''
}

// Validates everything the browser sends. The browser is never trusted for
// price, tier or consent; those are re-checked here on the server.
export function validateOrder(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') return { ok: false, error: 'Invalid request.' }
  const b = body as Record<string, unknown>

  if (!isTierId(b.tier)) return { ok: false, error: 'Please choose a timeline.' }
  if (!(OCCASIONS as readonly string[]).includes(String(b.occasion))) return { ok: false, error: 'Please choose an occasion.' }
  if (!(MOODS as readonly string[]).includes(String(b.mood))) return { ok: false, error: 'Please choose a mood.' }

  const customerName = text(b.customerName, 80)
  if (customerName.length < 2 || customerName.length > 80) return { ok: false, error: 'Please enter your name.' }

  const customerEmail = text(b.customerEmail, 254).toLowerCase()
  if (!EMAIL.test(customerEmail)) return { ok: false, error: 'Please enter a valid email address.' }

  const recipientName = text(b.recipientName, 80)
  if (recipientName.length < 1 || recipientName.length > 80) return { ok: false, error: 'Who is the song for?' }

  const story = text(b.story, 2000)
  if (story.length < 20) return { ok: false, error: 'Please share a few more details in your story (at least 20 characters).' }
  if (story.length > 2000) return { ok: false, error: 'Your story is too long (2,000 characters maximum).' }

  if (b.consent !== true) return { ok: false, error: 'Please confirm permission to share the details in your story.' }

  return {
    ok: true,
    value: {
      tier: b.tier,
      occasion: String(b.occasion),
      mood: String(b.mood),
      customerName,
      customerEmail,
      recipientName,
      story,
      consent: true,
    },
  }
}

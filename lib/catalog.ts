// Single source of truth for what we sell. Prices are in cents (USD).
// Confirm prices and turnaround before going live; the server reads these,
// never the browser, so a client cannot change what it pays.

export const TIERS = {
  classic: {
    id: 'classic',
    name: 'Classic',
    amountCents: 7900,
    turnaround: '72 hours',
    summary: 'Original song, lyrics written by hand, reviewed before delivery.',
    includes: ['Original song in your chosen style', 'Hand-reviewed before delivery', 'One round of revisions'],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    amountCents: 14900,
    turnaround: '24 hours',
    summary: 'Faster delivery with a lyric video you can share.',
    includes: ['Everything in Classic', '24-hour turnaround', 'Lyric video'],
  },
  rush: {
    id: 'rush',
    name: 'Rush',
    amountCents: 24900,
    turnaround: 'Same day',
    summary: 'Priority queue. Order before 2 pm Central for same-day delivery.',
    includes: ['Everything in Premium', 'Priority queue', 'Same-day delivery when ordered before 2 pm Central'],
  },
} as const

export type TierId = keyof typeof TIERS
export type Tier = (typeof TIERS)[TierId]

export const OCCASIONS = [
  'Birthday',
  'Wedding & anniversary',
  'Memorial',
  'Proposal',
  'New baby',
  'Business & brand',
] as const

export const MOODS = ['Joyful', 'Romantic', 'Nostalgic', 'Playful', 'Uplifting'] as const

export const CONSENT_VERSION = '2026-10-31'
export const CONSENT_TEXT =
  'I confirm I have permission to share the names and personal details in my story. I understand the song is AI-assisted, may resemble existing works, and is licensed for personal and business use for this occasion.'

export function isTierId(value: unknown): value is TierId {
  return typeof value === 'string' && value in TIERS
}

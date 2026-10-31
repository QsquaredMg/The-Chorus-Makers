'use client'

import { useState } from 'react'
import { ArrowRight, CheckCircle2, Clock3, Headphones, Mic2, Music2 } from 'lucide-react'
import { CONSENT_TEXT, MOODS, OCCASIONS, TIERS, type TierId } from '@/lib/catalog'

const money = (cents: number) => `$${(cents / 100).toFixed(0)}`

export default function Home() {
  const [tier, setTier] = useState<TierId>('classic')
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0])
  const [mood, setMood] = useState<string>(MOODS[0])
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const form = new FormData(event.currentTarget)
    setSubmitting(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier,
          occasion,
          mood,
          customerName: form.get('customerName'),
          customerEmail: form.get('customerEmail'),
          recipientName: form.get('recipientName'),
          story: form.get('story'),
          consent,
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Something went wrong. Please try again.')
      window.location.assign(data.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="The Chorus Makers home">
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background"><Music2 size={18} /></span>
          <span className="font-display text-lg tracking-tight">The Chorus Makers</span>
        </a>
        <a href="#order" className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background">Order a song</a>
      </header>

      <section id="top" className="mx-auto grid max-w-7xl gap-14 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-10 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" /> Made for the moments that matter
          </div>
          <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl lg:text-[6.6rem]">Give them a song they&apos;ll never forget.</h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">Tell us your story. Our team turns it into an original song made just for them, and a person reviews every song before it reaches you.</p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Clock3 size={16} /> Classic in 72 hours, Premium in 24</span>
            <span className="flex items-center gap-2"><Headphones size={16} /> Every song reviewed by hand</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-10">
          <div className="absolute -right-12 -top-12 size-44 rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -left-12 size-52 rounded-full border border-white/10" />
          <Mic2 className="relative mb-20 text-accent" size={28} />
          <p className="relative max-w-sm font-display text-3xl leading-tight tracking-tight sm:text-4xl">Choose your timeline.</p>
          <ul className="relative mt-8 space-y-3 text-sm text-paper/80">
            {Object.values(TIERS).map((t) => <li key={t.id}>{t.name} · {money(t.amountCents)} · {t.turnaround}</li>)}
          </ul>
          <div className="relative mt-14 flex items-end gap-1 opacity-70" aria-hidden="true">
            {[12, 28, 20, 44, 30, 56, 38, 22, 48, 18, 34, 26, 62, 42, 20, 36, 52, 30, 18, 44].map((height, index) => <span key={index} className="w-1 rounded-full bg-accent" style={{ height }} />)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-card/60 px-6 py-14 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="eyebrow">The process</p><h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">From your story to their soundtrack.</h2></div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[['01', 'Share the details', 'A few thoughtful prompts help us understand the people, memories, and feeling behind your song.'], ['02', 'We make the magic', 'Our team drafts the lyrics, creates the song in your chosen style, and reviews the final track by hand before it is delivered.'], ['03', 'Press play', 'You receive a private, studio-quality track ready to share, surprise, and keep forever.']].map(([number, title, text]) => <div key={number} className="border-t border-border pt-4"><span className="text-xs text-accent">{number}</span><h3 className="mt-7 font-display text-2xl tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section id="order" className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-24">
        <div>
          <p className="eyebrow">Start your order</p>
          <h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Let&apos;s make something personal.</h2>
          <p className="mt-5 max-w-sm leading-7 text-muted-foreground">No musical expertise needed. Just bring the story and we&apos;ll bring the melody.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-7 rounded-[1.5rem] border border-border bg-card p-6 sm:p-8">
          <fieldset>
            <legend className="text-sm font-medium">Choose your timeline</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {Object.values(TIERS).map((t) => (
                <label key={t.id} className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-colors ${tier === t.id ? 'border-foreground bg-foreground text-background' : 'border-border hover:border-foreground'}`}>
                  <input type="radio" name="tier" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} className="sr-only" />
                  <span className="flex items-baseline justify-between"><span className="font-display text-lg">{t.name}</span><span className="text-sm">{money(t.amountCents)}</span></span>
                  <span className={`text-xs ${tier === t.id ? 'text-background/80' : 'text-muted-foreground'}`}>{t.turnaround}</span>
                </label>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">{TIERS[tier].includes.join(' · ')}</p>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">Your name<input required name="customerName" autoComplete="name" className="field" placeholder="Alex Morgan" /></label>
            <label className="flex flex-col gap-2 text-sm font-medium">Email address<input required type="email" name="customerEmail" autoComplete="email" className="field" placeholder="alex@example.com" /></label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium">Who is the song for?<input required name="recipientName" className="field" placeholder="Mom, Jordan, Acme Co." /></label>
            <label className="flex flex-col gap-2 text-sm font-medium">What&apos;s the occasion?<select value={occasion} onChange={(event) => setOccasion(event.target.value)} className="field">{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select></label>
          </div>

          <fieldset>
            <legend className="text-sm font-medium">What should it feel like?</legend>
            <div className="mt-3 flex flex-wrap gap-2">{MOODS.map((item) => <button type="button" key={item} onClick={() => setMood(item)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${mood === item ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}>{item}</button>)}</div>
          </fieldset>

          <label className="flex flex-col gap-2 text-sm font-medium">Tell us the story <span className="font-normal text-muted-foreground">What should we know about them, and what would make this unforgettable?</span>
            <textarea required name="story" minLength={20} maxLength={2000} className="field min-h-28 resize-y" placeholder="The little details, inside jokes, favorite memories..." />
          </label>

          <label className="flex items-start gap-3 text-xs leading-5 text-muted-foreground">
            <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1" />
            <span>{CONSENT_TEXT}</span>
          </label>

          {error && <p role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}

          <button type="submit" disabled={submitting || !consent} className="group flex h-12 items-center justify-center gap-3 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
            {submitting ? 'Opening secure checkout…' : <>Continue to payment · {money(TIERS[tier].amountCents)} <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></>}
          </button>
          <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground"><CheckCircle2 size={14} /> Secure payment by Stripe. Your card details never touch our site.</p>
        </form>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-border px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 The Chorus Makers</span><span>Custom music for special occasions.</span></footer>
    </main>
  )
}

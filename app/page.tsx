'use client'

import { useEffect, useState } from 'react'
import { ArrowRight, Baby, Briefcase, Cake, CheckCircle2, Clock3, Flower2, Gem, Headphones, Heart, Mic2, Music2, Megaphone, ShieldCheck, Star, Trophy, Users, Zap } from 'lucide-react'
import { CONSENT_TEXT, MOODS, OCCASIONS, SOCIAL, TIERS, type TierId } from '@/lib/catalog'

const money = (cents: number) => `$${(cents / 100).toFixed(0)}`

type Review = { display_name: string; occasion: string; rating: number; body: string; created_at: string }
type Sample = { id: string; title: string; occasion: string; style: string; description: string; src: string }

function Stars({ count, size = 16 }: { count: number; size?: number }) {
  return (
    <span className="flex gap-0.5 text-accent" aria-label={`${count} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= count ? 'currentColor' : 'none'} />
      ))}
    </span>
  )
}

function ReviewForm({ onSubmitted }: { onSubmitted: () => void }) {
  const [rating, setRating] = useState(0)
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')
  const [message, setMessage] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setStatus('sending')
    setMessage(null)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: form.get('displayName'),
          occasion: form.get('occasion'),
          rating,
          body: form.get('body'),
          consent,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setStatus('done')
      event.currentTarget.reset()
      setRating(0)
      setConsent(false)
      onSubmitted()
    } catch (err) {
      setStatus('error')
      setMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  if (status === 'done') {
    return <p className="rounded-2xl border border-accent/30 bg-accent/10 p-6 text-sm leading-7 text-paper">Thank you. Your review was received and will appear here once we have approved it.</p>
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-5 rounded-[1.5rem] border border-white/12 bg-[#14072a]/70 p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold">Your name<input required name="displayName" maxLength={60} className="field" placeholder="How should we show your name?" /></label>
        <label className="flex flex-col gap-2 text-sm font-semibold">What was the song for?<select name="occasion" className="field" defaultValue={OCCASIONS[0]}>{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select></label>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Your rating</legend>
        <div className="mt-3 flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button type="button" key={n} onClick={() => setRating(n)} aria-label={`${n} star${n > 1 ? 's' : ''}`} className={`transition-transform hover:scale-110 ${n <= rating ? 'text-accent' : 'text-paper/25'}`}>
              <Star size={28} fill={n <= rating ? 'currentColor' : 'none'} />
            </button>
          ))}
        </div>
      </fieldset>
      <label className="flex flex-col gap-2 text-sm font-semibold">Your review<textarea required name="body" minLength={20} maxLength={1000} className="field min-h-28 resize-y" placeholder="What did the song mean to you or the people you gave it to?" /></label>
      <label className="flex items-start gap-3 text-xs leading-5 text-paper/65">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#d4a73a]" />
        <span>I agree that my name, occasion, rating and review may be shown on The Chorus Makers website after we review them.</span>
      </label>
      {message && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{message}</p>}
      <button type="submit" disabled={status === 'sending' || rating === 0 || !consent} className="flex h-12 items-center justify-center rounded-full bg-accent px-6 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
        {status === 'sending' ? 'Sending…' : 'Submit review'}
      </button>
    </form>
  )
}

const athleteCards = [
  { icon: Zap, title: 'Walk-up songs', text: 'A 30 to 60 second intro built for the moment they step up to the plate, the mat, or the line.' },
  { icon: Megaphone, title: 'Hype tracks', text: 'High-energy songs for warmups, pregame playlists, and the locker room before kickoff.' },
  { icon: Music2, title: 'Highlight reel scores', text: 'A custom soundtrack for the season recap, senior night, or the awards video.' },
]

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.6V4.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1v2.5H7.6V14h2.7v8h3.2z" />
    </svg>
  )
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

function TikTokIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 5.8c-.9-.6-1.5-1.5-1.7-2.5h-3v12.6a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.3a5.6 5.6 0 1 0 4.8 5.6V9.3a7.2 7.2 0 0 0 4.2 1.3V7.6c-1.2 0-2.4-.4-3.3-1.8z" />
    </svg>
  )
}

const socialLinks = [
  { label: 'Instagram', href: SOCIAL.instagram, Icon: InstagramIcon },
  { label: 'Facebook', href: SOCIAL.facebook, Icon: FacebookIcon },
  { label: 'TikTok', href: SOCIAL.tiktok, Icon: TikTokIcon },
].filter((link) => link.href)

const occasionCards = [
  { icon: Heart, title: 'Weddings & anniversaries', text: 'First dance songs, vow songs, and anniversary gifts with the couple’s own story in every line.' },
  { icon: Cake, title: 'Birthdays', text: 'A personal song with the inside jokes, nicknames, and memories only they will recognize.' },
  { icon: Flower2, title: 'Memorials', text: 'A gentle song that honors a life, built from the details you choose to share.' },
  { icon: Gem, title: 'Proposals', text: 'The moment you ask, set to music. Surprise them with something no one else can give.' },
  { icon: Baby, title: 'New babies', text: 'A lullaby-style song that welcomes a little one, with names and wishes for their future.' },
  { icon: Trophy, title: 'Teams & sports', text: 'An anthem for your squad, with team names, a rally cry, and the season you remember.' },
  { icon: Briefcase, title: 'Business & brand', text: 'Original music for a company milestone, a jingle, or a team thank-you.' },
  { icon: Users, title: 'Just because', text: 'No occasion needed. Tell us about someone you love and we will write them a song.' },
]

const steps = [
  { n: '01', title: 'Tell us the story', text: 'Answer a few guided prompts about the people, the memories, and the feeling you want the song to carry.' },
  { n: '02', title: 'We write and produce it', text: 'Our team drafts the lyrics, builds the arrangement in your chosen style, and records the song.' },
  { n: '03', title: 'Hand-reviewed, then delivered', text: 'A person listens to every track before it reaches you. You receive a private file you can share or keep.' },
]

const faqs = [
  { q: 'How long does it take?', a: 'Classic is delivered within 72 hours, Premium within 24 hours, and Rush the same day when ordered before 2 pm Central.' },
  { q: 'Do I need to know music or have lyrics?', a: 'No. Share the story in your own words. Our team writes the lyrics and makes the song.' },
  { q: 'Is the song made by a person?', a: 'The songs are AI-assisted and written and reviewed by our team. Every track is listened to by a person before delivery.' },
  { q: 'Can I ask for changes?', a: 'Classic includes one round of revisions. Premium and Rush include the same revision round as Classic.' },
  { q: 'What can I do with the song?', a: 'Each song is licensed for personal and business use for the occasion you order it for, as described in the consent you accept at checkout.' },
  { q: 'Is my payment secure?', a: 'Yes. Payment is handled by Stripe. Your card details never touch our site.' },
]

export default function Home() {
  const [tier, setTier] = useState<TierId>('classic')
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0])
  const [mood, setMood] = useState<string>(MOODS[0])
  const [consent, setConsent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [samples, setSamples] = useState<Sample[]>([])

  useEffect(() => {
    fetch('/api/samples')
      .then((response) => response.json())
      .then((data) => setSamples(Array.isArray(data.samples) ? data.samples : []))
      .catch(() => setSamples([]))
  }, [])

  function loadReviews() {
    fetch('/api/reviews')
      .then((response) => response.json())
      .then((data) => setReviews(Array.isArray(data.reviews) ? data.reviews : []))
      .catch(() => setReviews([]))
  }

  useEffect(() => {
    loadReviews()
  }, [])

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
    <main className="min-h-screen overflow-x-hidden text-paper">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#14072a]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-10">
          <a href="#top" className="flex items-center rounded-2xl bg-[#f6f1e4] px-3 py-1.5 shadow-lg shadow-black/30 ring-1 ring-accent/40" aria-label="The Chorus Makers home">
            <img src="/brand/logo.png" alt="The Chorus Makers" className="h-12 w-auto" />
          </a>
          <nav className="hidden items-center gap-7 text-sm text-paper/75 md:flex">
            <a href="#occasions" className="transition-colors hover:text-accent">Occasions</a>
            <a href="#how-it-works" className="transition-colors hover:text-accent">How it works</a>
            <a href="#pricing" className="transition-colors hover:text-accent">Pricing</a>
            <a href="#faq" className="transition-colors hover:text-accent">FAQ</a>
          </nav>
          <a href="#order" className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.03]">
            Order a song
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative isolate">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-28 lg:pt-16">
          <div className="reveal order-2 lg:order-1">
            <div className="mb-8 inline-flex rounded-3xl bg-[#f6f1e4] p-5 shadow-2xl shadow-black/40 ring-1 ring-accent/50">
              <img src="/brand/logo.png" alt="The Chorus Makers logo: a gold and purple crown with a microphone, in a laurel wreath" className="h-40 w-auto sm:h-48" />
            </div>
            <p className="eyebrow">Custom music for special occasions</p>
            <h1 className="font-display mt-5 text-[4.25rem] leading-[0.9] sm:text-[6.5rem] lg:text-[7.5rem]">
              <span className="gold-text block">Crafted</span>
              <span className="block">for the sound</span>
              <span className="block">of life</span>
            </h1>
            <p className="mt-7 max-w-lg text-base leading-8 text-paper/80 sm:text-lg">
              Tell us your story. Our team turns it into an original song made just for the people you love, and a person reviews every track before it reaches you.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#order" className="group inline-flex h-13 items-center justify-center gap-3 rounded-full bg-accent px-7 py-4 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.02]">
                Start your song <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
              </a>
              <a href="#pricing" className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-4 text-sm font-semibold text-paper transition-colors hover:border-accent hover:text-accent">
                See pricing from {money(TIERS.classic.amountCents)}
              </a>
            </div>
            <ul className="mt-10 grid gap-3 text-sm text-paper/75 sm:grid-cols-3">
              <li className="flex items-center gap-2"><Clock3 size={16} className="text-accent" /> Delivered in 24 to 72 hours</li>
              <li className="flex items-center gap-2"><Headphones size={16} className="text-accent" /> Reviewed by hand</li>
              <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-accent" /> Secure checkout</li>
            </ul>
          </div>

          <div className="reveal relative order-1 lg:order-2" style={{ animationDelay: '120ms' }}>
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-violet/30 via-transparent to-accent/20 blur-2xl" aria-hidden="true" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-accent/25 shadow-[0_40px_120px_-30px_rgba(139,63,224,0.6)]">
              <img src="/brand/hero-couple.jpg" alt="A couple laughing during their first dance under string lights" className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#14072a] via-[#14072a]/10 to-transparent" aria-hidden="true" />
              <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/15 bg-[#14072a]/70 p-4 backdrop-blur-md">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Made for</p>
                <p className="mt-1 font-display text-2xl tracking-wide">Weddings · Birthdays · Teams · Memorials</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions */}
      <section id="occasions" className="border-y border-white/5 bg-[#1d0c3a]/50 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="eyebrow">Occasions</p>
            <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">One song for every reason to celebrate</h2>
          </div>
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {occasionCards.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group bg-[#14072a] p-7 transition-colors hover:bg-[#21104a]">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/25 transition-transform group-hover:-translate-y-0.5">
                  <Icon size={22} />
                </span>
                <h3 className="mt-6 text-lg font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-paper/65">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Song examples */}
      {samples.length > 0 && (
        <section id="samples" className="border-y border-white/5 bg-[#1d0c3a]/50 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-7xl">
            <p className="eyebrow">Listen</p>
            <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">Songs we have made</h2>
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {samples.map((sample) => (
                <figure key={sample.id} className="flex flex-col gap-5 rounded-[1.5rem] border border-white/12 bg-[#14072a]/70 p-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{sample.occasion} · {sample.style}</p>
                    <figcaption className="font-display mt-2 text-3xl tracking-wide">{sample.title}</figcaption>
                  </div>
                  <audio controls preload="none" src={sample.src} className="w-full" aria-label={`Listen to ${sample.title}`} />
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Team feature */}
      <section className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-accent/25">
            <img src="/brand/team-anthem.jpg" alt="A team celebrating together after a win" className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#14072a]/80 via-transparent to-transparent" aria-hidden="true" />
          </div>
          <div>
            <p className="eyebrow">For teams, clubs and crews</p>
            <h2 className="font-display mt-4 text-6xl leading-[0.9] sm:text-8xl">
              <span className="gold-text block">Your team.</span>
              <span className="block">Your anthem.</span>
            </h2>
            <p className="mt-7 max-w-lg text-base leading-8 text-paper/75">
              Give your squad a song that sounds like the season. Share the team name, the players, the rivalries, and the moments that matter, and we will build an anthem your team can chant together.
            </p>
            <a href="#order" className="group mt-9 inline-flex items-center gap-3 rounded-full border border-accent px-7 py-4 text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-[#14072a]">
              Build our anthem <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
            </a>
          </div>
        </div>
      </section>

      {/* Walk-up and athlete hype */}
      <section id="athletes" className="px-4 pb-20 sm:px-6 lg:px-10 lg:pb-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-accent/25 bg-gradient-to-br from-[#2e1456] via-[#1d0c3a] to-[#14072a] p-8 sm:p-14">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-end lg:gap-16">
            <div>
              <p className="eyebrow">Walk-up songs and athlete hype</p>
              <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">
                <span className="gold-text block">Their entrance.</span>
                <span className="block">Their song.</span>
              </h2>
              <p className="mt-6 max-w-lg text-base leading-8 text-paper/75">
                Every athlete deserves a walk-up that makes the crowd stand up. We write original songs for players, coaches and teams, with their name, number, and the story behind them.
              </p>
              <a href="#order" onClick={() => setOccasion('Teams & sports')} className="group mt-9 inline-flex items-center gap-3 rounded-full bg-accent px-7 py-4 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.02]">
                Order an athlete song <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} />
              </a>
            </div>
            <div className="grid gap-4">
              {athleteCards.map(({ icon: Icon, title, text }) => (
                <div key={title} className="flex gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-colors hover:border-accent/50">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/12 text-accent ring-1 ring-accent/25">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold tracking-tight">{title}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-paper/65">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y border-white/5 bg-[#1d0c3a]/50 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow">The process</p>
          <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">From your story to their soundtrack</h2>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="relative border-t border-accent/40 pt-7">
                <span className="font-display gold-text text-6xl leading-none">{step.n}</span>
                <h3 className="mt-6 text-xl font-bold tracking-tight">{step.title}</h3>
                <p className="mt-3 text-sm leading-7 text-paper/65">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Pricing</p>
              <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">Choose your timeline</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-paper/65">One price per song, paid securely at checkout. Pick the timeline that fits your occasion.</p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {Object.values(TIERS).map((t) => {
              const featured = t.id === 'premium'
              return (
                <div
                  key={t.id}
                  className={`relative flex flex-col rounded-[1.75rem] border p-8 ${
                    featured ? 'border-accent bg-gradient-to-b from-[#2e1456] to-[#1d0c3a] shadow-[0_30px_80px_-30px_rgba(212,167,58,0.45)]' : 'border-white/12 bg-[#1d0c3a]/60'
                  }`}
                >
                  <p className="font-display text-3xl tracking-wide">{t.name}</p>
                  <div className="mt-5 flex items-baseline gap-2">
                    <span className="font-display gold-text text-7xl leading-none">{money(t.amountCents)}</span>
                  </div>
                  <p className="mt-3 text-sm font-semibold text-accent">{t.turnaround} turnaround</p>
                  <p className="mt-5 text-sm leading-7 text-paper/70">{t.summary}</p>
                  <ul className="mt-7 flex-1 space-y-3 text-sm text-paper/85">
                    {t.includes.map((item) => (
                      <li key={item} className="flex gap-3"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-accent" /> {item}</li>
                    ))}
                  </ul>
                  <a
                    href="#order"
                    onClick={() => setTier(t.id)}
                    className={`mt-9 inline-flex items-center justify-center rounded-full px-6 py-3.5 text-sm font-bold transition-transform hover:scale-[1.02] ${
                      featured ? 'bg-accent text-[#14072a]' : 'border border-white/25 text-paper hover:border-accent hover:text-accent'
                    }`}
                  >
                    Choose {t.name}
                  </a>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Order form */}
      <section id="order" className="border-t border-white/5 bg-[#1d0c3a]/50 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Start your order</p>
            <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">Let’s make something personal</h2>
            <p className="mt-6 max-w-sm leading-7 text-paper/70">No musical experience needed. Just bring the story, and we will bring the melody.</p>
            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-paper/70">
              <p className="font-semibold text-paper">Pay securely, then we get started.</p>
              <p className="mt-2">You will be taken to Stripe to pay. Your receipt comes from Stripe by email, and your song brief goes straight to our team.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7 rounded-[1.75rem] border border-white/12 bg-[#14072a]/70 p-6 shadow-2xl sm:p-9">
            <fieldset>
              <legend className="text-sm font-semibold">1. Choose your timeline</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {Object.values(TIERS).map((t) => (
                  <label key={t.id} className={`flex cursor-pointer flex-col gap-1 rounded-2xl border p-4 transition-colors ${tier === t.id ? 'border-accent bg-accent text-[#14072a]' : 'border-white/15 hover:border-accent/70'}`}>
                    <input type="radio" name="tier" value={t.id} checked={tier === t.id} onChange={() => setTier(t.id)} className="sr-only" />
                    <span className="flex items-baseline justify-between"><span className="font-display text-xl tracking-wide">{t.name}</span><span className="text-sm font-bold">{money(t.amountCents)}</span></span>
                    <span className={`text-xs ${tier === t.id ? 'text-[#14072a]/80' : 'text-paper/60'}`}>{t.turnaround}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold">Your name<input required name="customerName" autoComplete="name" className="field" placeholder="Alex Morgan" /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold">Email address<input required type="email" name="customerEmail" autoComplete="email" className="field" placeholder="alex@example.com" /></label>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-semibold">Who is the song for?<input required name="recipientName" className="field" placeholder="Mom, Jordan, Acme Co." /></label>
              <label className="flex flex-col gap-2 text-sm font-semibold">Occasion<select value={occasion} onChange={(event) => setOccasion(event.target.value)} className="field">{OCCASIONS.map((o) => <option key={o}>{o}</option>)}</select></label>
            </div>

            <fieldset>
              <legend className="text-sm font-semibold">What should it feel like?</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {MOODS.map((item) => (
                  <button type="button" key={item} onClick={() => setMood(item)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${mood === item ? 'border-accent bg-accent font-semibold text-[#14072a]' : 'border-white/15 text-paper/70 hover:border-accent/70 hover:text-paper'}`}>{item}</button>
                ))}
              </div>
            </fieldset>

            <label className="flex flex-col gap-2 text-sm font-semibold">
              Tell us the story
              <span className="font-normal text-paper/55">Who are they, what do you remember, and what would make this unforgettable?</span>
              <textarea required name="story" minLength={20} maxLength={2000} className="field min-h-32 resize-y" placeholder="The little details, inside jokes, favorite memories..." />
            </label>

            <label className="flex items-start gap-3 text-xs leading-5 text-paper/65">
              <input required type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 accent-[#d4a73a]" />
              <span>{CONSENT_TEXT}</span>
            </label>

            {error && <p role="alert" className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>}

            <button type="submit" disabled={submitting || !consent} className="group flex h-14 items-center justify-center gap-3 rounded-full bg-accent px-6 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50">
              {submitting ? 'Opening secure checkout…' : <>Continue to payment · {money(TIERS[tier].amountCents)} <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></>}
            </button>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-paper/55"><ShieldCheck size={14} /> Secure payment by Stripe. Your card details never touch our site.</p>
          </form>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews" className="border-t border-white/5 bg-[#1d0c3a]/50 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="eyebrow">Reviews</p>
              <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">What people say after they press play</h2>
            </div>
            <p className="max-w-sm text-sm leading-7 text-paper/65">Shared by customers after their song was delivered. Reviews appear here once we have checked them.</p>
          </div>

          {reviews.length > 0 ? (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {reviews.map((review) => (
                <figure key={`${review.display_name}-${review.created_at}`} className="flex flex-col gap-5 rounded-[1.5rem] border border-white/12 bg-[#14072a]/70 p-7">
                  <Stars count={review.rating} />
                  <blockquote className="flex-1 text-sm leading-7 text-paper/85">“{review.body}”</blockquote>
                  <figcaption className="text-xs text-paper/55">
                    <span className="font-semibold text-paper">{review.display_name}</span> · {review.occasion}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="mt-14 rounded-[1.5rem] border border-dashed border-white/15 p-8 text-sm leading-7 text-paper/65">No reviews yet. Be the first to share how your song made them feel.</p>
          )}

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <h3 className="font-display text-4xl tracking-wide">Leave a review</h3>
              <p className="mt-4 text-sm leading-7 text-paper/65">Already have a song from us? Tell others what it meant to you.</p>
            </div>
            <ReviewForm onSubmitted={loadReviews} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="eyebrow">Questions</p>
            <h2 className="font-display mt-4 text-5xl leading-[0.95] sm:text-7xl">Good to know</h2>
          </div>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {faqs.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-base font-semibold">
                  {item.q}
                  <span className="text-accent transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-paper/70">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Closing band */}
      <section className="px-4 pb-20 sm:px-6 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-accent/25 bg-gradient-to-br from-[#3a1870] via-[#2a1152] to-[#14072a] px-8 py-16 text-center sm:px-16 sm:py-24">
          <div className="absolute -left-24 -top-24 size-80 rounded-full bg-violet/25 blur-3xl" aria-hidden="true" />
          <div className="absolute -bottom-24 -right-24 size-80 rounded-full bg-accent/15 blur-3xl" aria-hidden="true" />
          <Mic2 className="relative mx-auto text-accent" size={30} />
          <h2 className="font-display relative mt-6 text-6xl leading-[0.9] sm:text-8xl">Give them a song they will never forget</h2>
          <a href="#order" className="relative mt-10 inline-flex items-center gap-3 rounded-full bg-accent px-8 py-4 text-sm font-bold text-[#14072a] transition-transform hover:scale-[1.03]">
            Start your song <ArrowRight size={17} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-12 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex self-start rounded-2xl bg-[#f6f1e4] p-3 ring-1 ring-accent/40">
            <img src="/brand/logo.png" alt="The Chorus Makers" className="h-20 w-auto" />
          </div>
          <div className="flex flex-col gap-4 text-sm text-paper/60 sm:items-end">
            {socialLinks.length > 0 && (
              <ul className="flex items-center gap-3" aria-label="Follow The Chorus Makers">
                {socialLinks.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`The Chorus Makers on ${label}`} className="flex size-11 items-center justify-center rounded-full border border-white/15 text-paper transition-colors hover:border-accent hover:text-accent">
                      <Icon size={18} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <span>@thechorusmakers · © 2026 The Chorus Makers. Custom music for special occasions.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

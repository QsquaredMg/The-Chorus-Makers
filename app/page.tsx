'use client'

import { useState } from 'react'
import { ArrowRight, Check, CheckCircle2, Clock3, Headphones, Mic2, Music2, Sparkles } from 'lucide-react'

const songTypes = ['Wedding song', 'Birthday anthem', 'Corporate jingle', 'Memorial tribute', 'Just because']
const moods = ['Joyful', 'Romantic', 'Nostalgic', 'Playful', 'Uplifting']

export default function Home() {
  const [submitted, setSubmitted] = useState(false)
  const [songType, setSongType] = useState('Wedding song')
  const [mood, setMood] = useState('Joyful')

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#top" className="flex items-center gap-3" aria-label="The Chorus Makers home">
          <span className="flex size-9 items-center justify-center rounded-full bg-foreground text-background"><Music2 size={18} /></span>
          <span className="font-display text-lg tracking-tight">The Chorus Makers</span>
        </a>
        <a href="#how-it-works" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">How it works</a>
      </header>

      <section id="top" className="mx-auto grid max-w-7xl gap-14 px-6 pb-16 pt-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:px-10 lg:pb-24 lg:pt-20">
        <div className="max-w-2xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <span className="size-1.5 rounded-full bg-accent" /> Made for the moments that matter
          </div>
          <h1 className="font-display text-5xl leading-[0.98] tracking-[-0.055em] text-foreground sm:text-7xl lg:text-[6.6rem]">Give them a song they&apos;ll never forget.</h1>
          <p className="mt-8 max-w-lg text-lg leading-8 text-muted-foreground">Tell us your story. Our singers and songwriters will turn it into an original chorus made just for you.</p>
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><Clock3 size={16} /> Delivered in 7–10 days</span>
            <span className="flex items-center gap-2"><Headphones size={16} /> Studio-quality audio</span>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-10">
          <div className="absolute -right-12 -top-12 size-44 rounded-full border border-white/10" />
          <div className="absolute -bottom-16 -left-12 size-52 rounded-full border border-white/10" />
          <Mic2 className="relative mb-20 text-accent" size={28} />
          <p className="relative max-w-sm font-display text-3xl leading-tight tracking-tight sm:text-4xl">“The song was the first thing that made everyone in the room cry.”</p>
          <p className="relative mt-8 text-sm text-paper/55">— Jamie, custom song client</p>
          <div className="relative mt-14 flex items-end gap-1 opacity-70" aria-hidden="true">
            {[12, 28, 20, 44, 30, 56, 38, 22, 48, 18, 34, 26, 62, 42, 20, 36, 52, 30, 18, 44].map((height, index) => <span key={index} className="w-1 rounded-full bg-accent" style={{ height }} />)}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-border bg-card/60 px-6 py-14 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div><p className="eyebrow">The process</p><h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">From your story to their soundtrack.</h2></div>
          <div className="grid gap-8 sm:grid-cols-3">
            {[['01', 'Share the details', 'A few thoughtful prompts help us understand the people, memories, and feeling behind your song.'], ['02', 'We make the magic', 'Our creative team writes, records, and polishes a one-of-a-kind song in your chosen style.'], ['03', 'Press play', 'You receive a private, studio-quality track ready to share, surprise, and keep forever.']].map(([number, title, text]) => <div key={number} className="border-t border-border pt-4"><span className="text-xs text-accent">{number}</span><h3 className="mt-7 font-display text-2xl tracking-tight">{title}</h3><p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p></div>)}
          </div>
        </div>
      </section>

      <section id="order" className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-[0.72fr_1.28fr] lg:px-10 lg:py-24">
        <div><p className="eyebrow">Start your order</p><h2 className="mt-4 font-display text-4xl tracking-tight sm:text-5xl">Let&apos;s make something personal.</h2><p className="mt-5 max-w-sm leading-7 text-muted-foreground">No musical expertise needed. Just bring the story — we&apos;ll bring the melody.</p><div className="mt-10 flex items-center gap-3 text-sm"><span className="flex size-8 items-center justify-center rounded-full bg-accent/15 text-accent"><Sparkles size={15} /></span> Free creative consultation included</div></div>
        <div className="rounded-[1.5rem] border border-border bg-card p-6 sm:p-8">
          {submitted ? <div className="flex min-h-[430px] flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent"><Check size={26} /></span><h3 className="mt-6 font-display text-3xl tracking-tight">Your story is in good hands.</h3><p className="mt-3 max-w-sm leading-7 text-muted-foreground">Thanks for sharing. We&apos;ll be in touch within one business day to talk through your song.</p><button onClick={() => setSubmitted(false)} className="mt-8 text-sm font-medium underline underline-offset-4">Submit another story</button></div> : <form onSubmit={handleSubmit} className="flex flex-col gap-7"><div className="flex items-center justify-between border-b border-border pb-5"><div><p className="text-sm font-semibold">Your song brief</p><p className="mt-1 text-xs text-muted-foreground">About 3 minutes to complete</p></div><span className="text-xs text-muted-foreground">Step 1 of 1</span></div><div className="grid gap-5 sm:grid-cols-2"><label className="flex flex-col gap-2 text-sm font-medium">Your name<input required name="name" className="field" placeholder="Alex Morgan" /></label><label className="flex flex-col gap-2 text-sm font-medium">Email address<input required type="email" name="email" className="field" placeholder="alex@example.com" /></label></div><label className="flex flex-col gap-2 text-sm font-medium">What&apos;s the occasion?<select value={songType} onChange={(event) => setSongType(event.target.value)} className="field">{songTypes.map((type) => <option key={type}>{type}</option>)}</select></label><fieldset><legend className="text-sm font-medium">What should it feel like?</legend><div className="mt-3 flex flex-wrap gap-2">{moods.map((item) => <button type="button" key={item} onClick={() => setMood(item)} className={`rounded-full border px-4 py-2 text-sm transition-colors ${mood === item ? 'border-foreground bg-foreground text-background' : 'border-border text-muted-foreground hover:border-foreground hover:text-foreground'}`}>{item}</button>)}</div></fieldset><label className="flex flex-col gap-2 text-sm font-medium">Tell us the story <span className="font-normal text-muted-foreground">What should we know about them, and what would make this unforgettable?</span><textarea required name="story" className="field min-h-28 resize-y" placeholder="The little details, inside jokes, favorite memories..." /></label><button type="submit" className="group flex h-12 items-center justify-center gap-3 rounded-full bg-foreground px-5 text-sm font-medium text-background transition-transform hover:scale-[1.01]">Send my story <ArrowRight className="transition-transform group-hover:translate-x-1" size={17} /></button><p className="text-center text-xs text-muted-foreground">We&apos;ll reply within one business day. No commitment required.</p></form>}
        </div>
      </section>

      <footer className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-border px-6 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-10"><span>© 2026 The Chorus Makers</span><span className="flex items-center gap-2"><CheckCircle2 size={14} /> Crafted with care, sung with feeling.</span></footer>
    </main>
  )
}

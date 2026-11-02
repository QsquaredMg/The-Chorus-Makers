'use client'

import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { OCCASIONS } from '@/lib/catalog'

type Api = (path: string, init?: RequestInit) => Promise<any>

const MAX_AUDIO_BYTES = 15 * 1024 * 1024
const field = 'rounded-xl border border-white/15 bg-[#14072a] px-3 py-2.5 text-sm'
const when = (value: string | null) => (value ? new Date(value).toLocaleString('en-US', { timeZone: 'America/Chicago' }) : '—')

type Sample = { id: string; title: string; occasion: string; style: string; description: string; storage_path: string; published: boolean; created_at: string }

export function SamplesAdmin({ api, supabase }: { api: Api; supabase: SupabaseClient }) {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0])
  const [style, setStyle] = useState('')
  const [description, setDescription] = useState('')
  const [permission, setPermission] = useState(false)

  const publicUrl = (path: string) => supabase.storage.from('song-samples').getPublicUrl(path).data.publicUrl

  async function load() {
    setLoading(true)
    try {
      const data = await api('/api/admin/samples')
      setSamples(data.samples)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load samples.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!file) return setMessage('Choose an audio file.')
    if (file.size > MAX_AUDIO_BYTES) return setMessage('That file is over 15 MB. Export a smaller MP3.')
    if (!permission) return setMessage('Confirm you have the customer’s permission to publish this recording.')
    setBusy(true)
    setMessage('Uploading…')
    try {
      const signed = await api('/api/admin/samples', { method: 'POST', body: JSON.stringify({ action: 'upload-url', fileName: file.name }) })
      const { error: uploadError } = await supabase.storage.from('song-samples').uploadToSignedUrl(signed.path, signed.token, file, { contentType: file.type || 'audio/mpeg' })
      if (uploadError) throw uploadError
      await api('/api/admin/samples', {
        method: 'POST',
        body: JSON.stringify({ action: 'create', title, occasion, style, description, storagePath: signed.path, permissionConfirmed: permission }),
      })
      setFile(null)
      setTitle('')
      setStyle('')
      setDescription('')
      setPermission(false)
      setMessage('Uploaded. It is saved as a draft until you publish it.')
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setBusy(false)
    }
  }

  async function togglePublish(sample: Sample) {
    try {
      const data = await api(`/api/admin/samples/${sample.id}`, { method: 'PATCH', body: JSON.stringify({ published: !sample.published }) })
      setSamples((list) => list.map((s) => (s.id === sample.id ? data.sample : s)))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update.')
    }
  }

  async function remove(sample: Sample) {
    if (!window.confirm(`Delete “${sample.title}”? The audio file will be removed too.`)) return
    try {
      await api(`/api/admin/samples/${sample.id}`, { method: 'DELETE' })
      setSamples((list) => list.filter((s) => s.id !== sample.id))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not delete.')
    }
  }

  return (
    <div className="grid gap-6 px-5 pb-10 lg:grid-cols-[380px_1fr]">
      <form onSubmit={upload} className="flex h-fit flex-col gap-4 rounded-2xl border border-white/10 bg-[#1d0c3a] p-6">
        <p className="text-sm font-bold">Add a song sample</p>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Audio file (MP3, M4A, WAV, AAC or OGG, up to 15 MB)
          <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Title
          <input required maxLength={80} value={title} onChange={(e) => setTitle(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Occasion
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={field}>
            {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Style (optional)
          <input maxLength={60} value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Acoustic pop, gospel, hip-hop…" className={field} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Short description (optional)
          <textarea maxLength={300} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={field} />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-1.5" />
          <span>I have the customer’s permission to publish this recording and its details.</span>
        </label>
        <button type="submit" disabled={busy} className="rounded-full bg-[#d4a73a] px-5 py-3 text-sm font-bold text-[#14072a] disabled:opacity-50">Upload sample</button>
        {message && <p className="text-sm text-paper/80">{message}</p>}
      </form>

      <div className="space-y-3">
        {loading && <p className="text-sm text-paper/55">Loading…</p>}
        {!loading && samples.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-paper/60">No samples yet.</p>}
        {samples.map((sample) => (
          <div key={sample.id} className="rounded-2xl border border-white/10 bg-[#1d0c3a] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{sample.title}</p>
                <p className="text-xs text-paper/55">{sample.occasion}{sample.style ? ` · ${sample.style}` : ''} · added {when(sample.created_at)}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs ${sample.published ? 'bg-[#d4a73a] text-[#14072a]' : 'bg-white/10'}`}>{sample.published ? 'Published' : 'Draft'}</span>
            </div>
            <audio controls preload="none" src={publicUrl(sample.storage_path)} className="mt-4 w-full" />
            {sample.description && <p className="mt-3 text-sm text-paper/70">{sample.description}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={() => togglePublish(sample)} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-[#d4a73a]">{sample.published ? 'Unpublish' : 'Publish'}</button>
              <button onClick={() => remove(sample)} className="rounded-full border border-white/20 px-4 py-2 text-sm text-red-300 hover:border-red-300">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

type Review = { id: string; display_name: string; occasion: string; rating: number; body: string; status: string; created_at: string; permission_confirmed: boolean }
const REVIEW_FILTERS = ['pending', 'approved', 'rejected', 'all'] as const

export function ReviewsAdmin({ api }: { api: Api }) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [filter, setFilter] = useState<(typeof REVIEW_FILTERS)[number]>('pending')
  const [message, setMessage] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState<string>(OCCASIONS[0])
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [permission, setPermission] = useState(false)

  async function load() {
    try {
      const data = await api('/api/admin/reviews')
      setReviews(data.reviews)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load reviews.')
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function setStatus(review: Review, status: string) {
    try {
      const data = await api(`/api/admin/reviews/${review.id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      setReviews((list) => list.map((r) => (r.id === review.id ? data.review : r)))
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not update.')
    }
  }

  async function addTestimonial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      await api('/api/admin/reviews', {
        method: 'POST',
        body: JSON.stringify({ displayName: name, occasion, rating, body: text, permissionConfirmed: permission }),
      })
      setName('')
      setText('')
      setPermission(false)
      setRating(5)
      setMessage('Testimonial added and published on the site.')
      load()
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not add testimonial.')
    }
  }

  const visible = filter === 'all' ? reviews : reviews.filter((r) => r.status === filter)

  return (
    <div className="grid gap-6 px-5 pb-10 lg:grid-cols-[380px_1fr]">
      <form onSubmit={addTestimonial} className="flex h-fit flex-col gap-4 rounded-2xl border border-white/10 bg-[#1d0c3a] p-6">
        <p className="text-sm font-bold">Add a testimonial</p>
        <p className="text-xs leading-5 text-paper/55">For reviews a customer sent you directly. It goes live straight away, so confirm they agreed to it.</p>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Name to show
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder="First name and last initial" className={field} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Occasion
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)} className={field}>
            {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Rating
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className={field}>
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} star{n === 1 ? '' : 's'}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Testimonial (20 to 1,000 characters)
          <textarea required minLength={20} maxLength={1000} rows={5} value={text} onChange={(e) => setText(e.target.value)} className={field} />
        </label>
        <label className="flex items-start gap-3 text-sm leading-6">
          <input type="checkbox" checked={permission} onChange={(e) => setPermission(e.target.checked)} className="mt-1.5" />
          <span>The customer gave permission to publish these words and their name.</span>
        </label>
        <button type="submit" className="rounded-full bg-[#d4a73a] px-5 py-3 text-sm font-bold text-[#14072a]">Add and publish</button>
        {message && <p className="text-sm text-paper/80">{message}</p>}
      </form>

      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-2">
          {REVIEW_FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 text-sm capitalize ${filter === f ? 'bg-[#d4a73a] font-bold text-[#14072a]' : 'border border-white/20'}`}>
              {f}{f !== 'all' ? ` (${reviews.filter((r) => r.status === f).length})` : ''}
            </button>
          ))}
        </div>
        {visible.length === 0 && <p className="rounded-2xl border border-dashed border-white/15 p-6 text-sm text-paper/60">Nothing here.</p>}
        {visible.map((review) => (
          <div key={review.id} className="rounded-2xl border border-white/10 bg-[#1d0c3a] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold">{review.display_name} <span className="text-sm font-normal text-paper/55">· {review.occasion} · {'★'.repeat(review.rating)}</span></p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs capitalize">{review.status}</span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-paper/85">{review.body}</p>
            <p className="mt-2 text-xs text-paper/50">Submitted {when(review.created_at)}{review.permission_confirmed ? ' · permission confirmed' : ''}</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {review.status !== 'approved' && <button onClick={() => setStatus(review, 'approved')} className="rounded-full bg-[#d4a73a] px-4 py-2 text-sm font-bold text-[#14072a]">Approve</button>}
              {review.status !== 'rejected' && <button onClick={() => setStatus(review, 'rejected')} className="rounded-full border border-white/20 px-4 py-2 text-sm hover:border-red-300">Reject</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

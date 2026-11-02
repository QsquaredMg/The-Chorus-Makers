'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClient, type Session } from '@supabase/supabase-js'
import { ReviewsAdmin, SamplesAdmin } from './panels'

const STATUSES = [
  'pending_payment', 'paid', 'queued', 'drafting', 'generating', 'ready_for_review',
  'approved', 'delivered', 'revision_requested', 'revising', 'complete', 'failed', 'refunded', 'abandoned',
] as const

type Order = {
  id: string
  created_at: string
  status: string
  tier: string
  amount_cents: number
  amount_paid_cents: number | null
  occasion: string
  mood: string
  customer_name: string
  customer_email: string
  recipient_name: string
  story: string
  consent_version: string
  consent_text: string
  consent_at: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  paid_at: string | null
  admin_notes: string | null
  delivery_url: string | null
  delivered_at: string | null
  client_notified_at: string | null
}

const money = (cents: number | null | undefined) => (cents == null ? '—' : `$${(cents / 100).toFixed(2)}`)
const when = (value: string | null) => (value ? new Date(value).toLocaleString('en-US', { timeZone: 'America/Chicago' }) : '—')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL ?? '', process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '', {
  auth: { persistSession: true, autoRefreshToken: true },
})

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)
  const [email, setEmail] = useState('')
  const [linkSent, setLinkSent] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const [tab, setTab] = useState<'orders' | 'reviews' | 'samples'>('orders')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setChecked(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => listener.subscription.unsubscribe()
  }, [])

  async function api(path: string, init?: RequestInit) {
    const token = session?.access_token
    const response = await fetch(path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token ?? ''}`, ...(init?.headers ?? {}) },
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Request failed.')
    return data
  }

  async function loadOrders() {
    if (!session) return
    setLoading(true)
    setMessage(null)
    try {
      const data = await api('/api/admin/orders')
      setOrders(data.orders)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not load orders.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.access_token])

  async function sendLink(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError(null)
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    })
    if (error) setAuthError(error.message)
    else setLinkSent(true)
  }

  const selected = useMemo(() => orders.find((o) => o.id === selectedId) ?? null, [orders, selectedId])
  const visible = useMemo(() => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)), [orders, filter])

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.paid_at)
    return {
      revenue: paid.reduce((sum, o) => sum + (o.amount_paid_cents ?? 0), 0),
      paidCount: paid.length,
      inProgress: orders.filter((o) => ['paid', 'queued', 'drafting', 'generating', 'ready_for_review', 'approved', 'revising', 'revision_requested'].includes(o.status)).length,
      delivered: orders.filter((o) => o.status === 'delivered' || o.status === 'complete').length,
    }
  }, [orders])

  if (!checked) return <main className="min-h-screen bg-[#14072a] p-8 text-paper">Loading…</main>

  if (!session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#14072a] p-6 text-paper">
        <div className="w-full max-w-md rounded-[1.5rem] border border-white/12 bg-[#1d0c3a] p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4a73a]">Admin</p>
          <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
          {linkSent ? (
            <p className="mt-6 text-sm leading-7 text-paper/75">We sent a sign-in link to {email}. Open it on this device to continue.</p>
          ) : (
            <form onSubmit={sendLink} className="mt-6 flex flex-col gap-4">
              <label className="flex flex-col gap-2 text-sm font-semibold">
                Admin email
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-normal" />
              </label>
              <button type="submit" className="rounded-full bg-[#d4a73a] px-6 py-3 text-sm font-bold text-[#14072a]">Email me a sign-in link</button>
              {authError && <p className="text-sm text-red-300">{authError}</p>}
            </form>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#14072a] text-paper">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#d4a73a]">The Chorus Makers</p>
          <h1 className="text-xl font-bold">Admin</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-paper/60">{session.user.email}</span>
          {tab === 'orders' && <button onClick={loadOrders} className="rounded-full border border-white/20 px-4 py-2 hover:border-[#d4a73a]">Refresh</button>}
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-white/20 px-4 py-2 hover:border-[#d4a73a]">Sign out</button>
        </div>
      </header>

      <nav className="flex gap-2 px-5 pt-5">
        {([['orders', 'Orders'], ['reviews', 'Testimonials'], ['samples', 'Song samples']] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} className={`rounded-full px-5 py-2 text-sm ${tab === key ? 'bg-[#d4a73a] font-bold text-[#14072a]' : 'border border-white/20 hover:border-[#d4a73a]'}`}>{label}</button>
        ))}
      </nav>

      {tab === 'reviews' && <div className="pt-5"><ReviewsAdmin api={api} /></div>}
      {tab === 'samples' && <div className="pt-5"><SamplesAdmin api={api} supabase={supabase} /></div>}

      {tab === 'orders' && (<>
      <section className="grid grid-cols-2 gap-3 px-5 py-5 lg:grid-cols-4">
        {[
          ['Revenue', money(stats.revenue)],
          ['Paid orders', String(stats.paidCount)],
          ['In progress', String(stats.inProgress)],
          ['Delivered', String(stats.delivered)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-[#1d0c3a] p-5">
            <p className="text-xs uppercase tracking-[0.15em] text-paper/55">{label}</p>
            <p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <div className="flex flex-col gap-5 px-5 pb-10 lg:flex-row">
        <div className="min-w-0 flex-1">
          <div className="mb-3 flex items-center gap-3">
            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-xl border border-white/15 bg-[#1d0c3a] px-3 py-2 text-sm">
              <option value="all">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
            </select>
            {loading && <span className="text-sm text-paper/55">Loading…</span>}
          </div>
          {message && <p className="mb-3 text-sm text-red-300">{message}</p>}
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1d0c3a] text-xs uppercase tracking-[0.12em] text-paper/55">
                <tr>
                  <th className="px-4 py-3">Ordered</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">For</th>
                  <th className="px-4 py-3">Occasion</th>
                  <th className="px-4 py-3">Tier</th>
                  <th className="px-4 py-3">Paid</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((o) => (
                  <tr key={o.id} onClick={() => setSelectedId(o.id)} className={`cursor-pointer border-t border-white/5 hover:bg-white/[0.04] ${selectedId === o.id ? 'bg-white/[0.06]' : ''}`}>
                    <td className="px-4 py-3 whitespace-nowrap">{when(o.created_at)}</td>
                    <td className="px-4 py-3">{o.customer_name}<div className="text-xs text-paper/50">{o.customer_email}</div></td>
                    <td className="px-4 py-3">{o.recipient_name}</td>
                    <td className="px-4 py-3">{o.occasion}</td>
                    <td className="px-4 py-3 capitalize">{o.tier}</td>
                    <td className="px-4 py-3">{money(o.amount_paid_cents)}</td>
                    <td className="px-4 py-3"><span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">{o.status.replaceAll('_', ' ')}</span></td>
                  </tr>
                ))}
                {!loading && visible.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-paper/55">No orders here yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {selected && <OrderPanel key={selected.id} order={selected} api={api} onChange={(updated) => setOrders((list) => list.map((o) => (o.id === updated.id ? updated : o)))} onClose={() => setSelectedId(null)} />}
      </div>
      </>)}
    </main>
  )
}

function OrderPanel({ order, api, onChange, onClose }: { order: Order; api: (path: string, init?: RequestInit) => Promise<any>; onChange: (o: Order) => void; onClose: () => void }) {
  const [status, setStatus] = useState(order.status)
  const [notes, setNotes] = useState(order.admin_notes ?? '')
  const [deliveryUrl, setDeliveryUrl] = useState(order.delivery_url ?? '')
  const [clientNote, setClientNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const dueBy = (() => {
    if (!order.paid_at) return '—'
    const hours: Record<string, number> = { classic: 72, premium: 24 }
    const h = hours[order.tier]
    if (!h) return 'Same day (ordered before 2 pm Central)'
    return when(new Date(new Date(order.paid_at).getTime() + h * 3600 * 1000).toISOString())
  })()

  const briefText = [
    `Occasion: ${order.occasion}`,
    `Mood: ${order.mood}`,
    `Song is for: ${order.recipient_name}`,
    `Tier: ${order.tier}`,
    `Due by: ${dueBy}`,
    '',
    'Story:',
    order.story,
  ].join('\n')

  async function copyBrief() {
    try {
      await navigator.clipboard.writeText(briefText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setNote('Could not copy. Select the story text and copy it manually.')
    }
  }

  async function save(extra: Record<string, unknown> = {}) {
    setBusy(true)
    setNote(null)
    try {
      const data = await api(`/api/admin/orders/${order.id}`, { method: 'PATCH', body: JSON.stringify({ status, adminNotes: notes, deliveryUrl, ...extra }) })
      onChange(data.order)
      setNote('Saved.')
    } catch (err) {
      setNote(err instanceof Error ? err.message : 'Could not save.')
    } finally {
      setBusy(false)
    }
  }

  function sendToClient() {
    if (!window.confirm(`Email ${order.customer_email} the delivery link now?`)) return
    save({ action: 'send_to_client', message: clientNote })
  }

  return (
    <aside className="w-full shrink-0 space-y-6 rounded-2xl border border-white/10 bg-[#1d0c3a] p-6 lg:w-[480px]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-paper/55">Order</p>
          <h2 className="text-lg font-bold">{order.recipient_name} · {order.occasion}</h2>
        </div>
        <button onClick={onClose} className="text-sm text-paper/60 hover:text-paper">Close</button>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <dt className="text-paper/55">Customer</dt><dd>{order.customer_name}</dd>
        <dt className="text-paper/55">Email</dt><dd className="break-all">{order.customer_email}</dd>
        <dt className="text-paper/55">Tier</dt><dd className="capitalize">{order.tier} · {money(order.amount_paid_cents ?? order.amount_cents)}</dd>
        <dt className="text-paper/55">Mood</dt><dd>{order.mood}</dd>
        <dt className="text-paper/55">Ordered</dt><dd>{when(order.created_at)}</dd>
        <dt className="text-paper/55">Paid</dt><dd>{when(order.paid_at)}</dd>
        <dt className="text-paper/55">Delivered</dt><dd>{when(order.delivered_at)}</dd>
        <dt className="text-paper/55">Client emailed</dt><dd>{when(order.client_notified_at)}</dd>
        <dt className="text-paper/55">Consent</dt><dd>Accepted {when(order.consent_at)} (version {order.consent_version})</dd>
        <dt className="text-paper/55">Stripe session</dt><dd className="break-all font-mono text-xs">{order.stripe_session_id ?? '—'}</dd>
      </dl>

      <div className="rounded-xl border border-[#d4a73a]/30 bg-black/20 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.15em] text-[#d4a73a]">Song brief</p>
          <button onClick={copyBrief} className="text-xs font-bold text-paper/80 hover:text-paper">{copied ? 'Copied' : 'Copy brief'}</button>
        </div>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
          <dt className="text-paper/55">Occasion</dt><dd>{order.occasion}</dd>
          <dt className="text-paper/55">Mood</dt><dd>{order.mood}</dd>
          <dt className="text-paper/55">Song is for</dt><dd>{order.recipient_name}</dd>
          <dt className="text-paper/55">Due by</dt><dd>{dueBy}</dd>
        </dl>
        <p className="mt-3 whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-sm leading-6">{order.story}</p>
      </div>

      <div className="space-y-3">
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-xl border border-white/15 bg-[#14072a] px-3 py-2.5 text-sm font-normal">
            {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Internal notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="rounded-xl border border-white/15 bg-[#14072a] px-3 py-2.5 text-sm font-normal" />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Delivery link (https)
          <input value={deliveryUrl} onChange={(e) => setDeliveryUrl(e.target.value)} placeholder="https://…" className="rounded-xl border border-white/15 bg-[#14072a] px-3 py-2.5 text-sm font-normal" />
        </label>
        <button disabled={busy} onClick={() => save()} className="w-full rounded-full border border-white/25 px-5 py-2.5 text-sm font-bold hover:border-[#d4a73a] disabled:opacity-50">Save changes</button>
      </div>

      <div className="space-y-3 border-t border-white/10 pt-6">
        <p className="text-sm font-semibold">Send to client</p>
        <textarea value={clientNote} onChange={(e) => setClientNote(e.target.value)} rows={3} placeholder="Optional message to include in the email" className="w-full rounded-xl border border-white/15 bg-[#14072a] px-3 py-2.5 text-sm" />
        <button disabled={busy || !deliveryUrl.trim()} onClick={sendToClient} className="w-full rounded-full bg-[#d4a73a] px-5 py-3 text-sm font-bold text-[#14072a] disabled:opacity-50">Email the song to {order.customer_name || 'the client'}</button>
        <p className="text-xs text-paper/50">Saves the link, emails it to the customer, and marks the order delivered.</p>
      </div>

      {note && <p className="text-sm text-paper/80">{note}</p>}
    </aside>
  )
}

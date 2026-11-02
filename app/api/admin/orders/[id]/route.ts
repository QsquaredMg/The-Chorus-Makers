import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { sendEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

const STATUSES = [
  'pending_payment', 'paid', 'queued', 'drafting', 'generating', 'ready_for_review',
  'approved', 'delivered', 'revision_requested', 'revising', 'complete', 'failed', 'refunded', 'abandoned',
]

function isHttpsUrl(value: string) {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

// action "save": update status, notes, or delivery link.
// action "send_to_client": email the delivery link to the customer, then mark delivered.
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = (await request.json()) as Record<string, unknown>
    const db = supabaseAdmin()

    const { data: order, error: readError } = await db.from('orders').select('*').eq('id', id).single()
    if (readError || !order) return NextResponse.json({ error: 'Order not found.' }, { status: 404 })

    const updates: Record<string, unknown> = {}
    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Unknown status.' }, { status: 400 })
      updates.status = body.status
    }
    if (typeof body.adminNotes === 'string') updates.admin_notes = body.adminNotes.slice(0, 5000)
    if (typeof body.deliveryUrl === 'string') {
      const url = body.deliveryUrl.trim()
      if (url && !isHttpsUrl(url)) return NextResponse.json({ error: 'The delivery link must start with https://' }, { status: 400 })
      updates.delivery_url = url || null
    }

    if (body.action === 'send_to_client') {
      const link = (typeof body.deliveryUrl === 'string' ? body.deliveryUrl : order.delivery_url || '').trim()
      if (!isHttpsUrl(link)) return NextResponse.json({ error: 'Add a delivery link (https://) before sending.' }, { status: 400 })

      const greeting = order.customer_name ? `Hi ${order.customer_name},` : 'Hi,'
      const note = typeof body.message === 'string' && body.message.trim() ? `\n\n${body.message.trim()}` : ''
      const text = `${greeting}\n\nYour custom song for ${order.recipient_name} is ready.\n\nListen and download here:\n${link}${note}\n\nThank you for trusting The Chorus Makers with this moment.\n\n— The Chorus Makers`
      const sent = await sendEmail(order.customer_email, 'Your custom song is ready', text)
      if (!sent.ok) return NextResponse.json({ error: sent.error }, { status: 502 })

      updates.status = 'delivered'
      updates.delivery_url = link
      updates.delivered_at = new Date().toISOString()
      updates.client_notified_at = new Date().toISOString()
    }

    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })

    const { data: updated, error: updateError } = await db.from('orders').update(updates).eq('id', id).select('*').single()
    if (updateError) throw updateError
    return NextResponse.json({ order: updated })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { stripe, supabaseAdmin } from '@/lib/server'
import { pushNotify } from '@/lib/notify'

export const runtime = 'nodejs'

// Stripe calls this endpoint. The order is marked paid only here, after the
// signature is verified. The browser redirect is never trusted for payment.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')
  if (!secret || !signature) return NextResponse.json({ error: 'Not configured' }, { status: 400 })

  const payload = await request.text()
  let event: Stripe.Event
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const db = supabaseAdmin()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id
    if (!orderId) return NextResponse.json({ received: true })

    // Only move orders forward from pending_payment, so retries are safe.
    if (session.payment_status === 'paid') {
      const { data: paidRows } = await db
        .from('orders')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          stripe_session_id: session.id,
          stripe_payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          amount_paid_cents: session.amount_total ?? null,
        })
        .eq('id', orderId)
        .eq('status', 'pending_payment')
        .select('id, tier, occasion, recipient_name, customer_name, amount_paid_cents')

      // Notify once per order. Stripe retries are ignored because the row is no longer pending.
      if (paidRows && paidRows.length > 0) {
        const order = paidRows[0]
        const amount = order.amount_paid_cents ? `$${(order.amount_paid_cents / 100).toFixed(0)}` : ''
        await pushNotify(
          `New song order: ${order.tier} ${amount}`.trim(),
          `${order.occasion} for ${order.recipient_name}, ordered by ${order.customer_name}. Open the admin site to review.`,
          'musical_note,moneybag',
        )
      }
    }
  }

  if (event.type === 'checkout.session.expired') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id
    if (orderId) {
      await db.from('orders').update({ status: 'abandoned' }).eq('id', orderId).eq('status', 'pending_payment')
    }
  }

  return NextResponse.json({ received: true })
}

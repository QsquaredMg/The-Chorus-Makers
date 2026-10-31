import { NextResponse } from 'next/server'
import { CONSENT_TEXT, CONSENT_VERSION, TIERS } from '@/lib/catalog'
import { validateOrder } from '@/lib/order-input'
import { stripe, siteUrl, supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const parsed = validateOrder(body)
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })
  const order = parsed.value
  const tier = TIERS[order.tier]

  try {
    const db = supabaseAdmin()

    // 1. Save the order before taking payment, so every paid order has a record.
    const { data: row, error: insertError } = await db
      .from('orders')
      .insert({
        status: 'pending_payment',
        tier: tier.id,
        amount_cents: tier.amountCents,
        occasion: order.occasion,
        mood: order.mood,
        customer_name: order.customerName,
        customer_email: order.customerEmail,
        recipient_name: order.recipientName,
        story: order.story,
        consent_version: CONSENT_VERSION,
        consent_text: CONSENT_TEXT,
        consent_at: new Date().toISOString(),
      })
      .select('id')
      .single()
    if (insertError || !row) throw insertError ?? new Error('Order insert failed')

    // 2. Create a Stripe Checkout session. The price comes from the server catalog.
    const origin = siteUrl(request)
    const session = await stripe().checkout.sessions.create({
      mode: 'payment',
      customer_email: order.customerEmail,
      client_reference_id: row.id,
      metadata: { order_id: row.id, tier: tier.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'usd',
            unit_amount: tier.amountCents,
            product_data: {
              name: `Custom song · ${tier.name}`,
              description: `${tier.turnaround} turnaround. ${tier.summary}`,
            },
          },
        },
      ],
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled#order`,
    })

    // 3. Link the order to its Stripe session.
    await db.from('orders').update({ stripe_session_id: session.id }).eq('id', row.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('checkout failed', error)
    return NextResponse.json(
      { error: 'We could not start checkout. Please try again in a moment.' },
      { status: 500 },
    )
  }
}

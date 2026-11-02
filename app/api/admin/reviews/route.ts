import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { OCCASIONS } from '@/lib/catalog'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { data, error } = await supabaseAdmin()
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ reviews: data ?? [] })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

// Adds a testimonial the admin collected directly (email, text, in person).
// It goes live straight away, so the customer's permission must be confirmed.
export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const displayName = String(body.displayName ?? '').trim()
    const occasion = String(body.occasion ?? '')
    const rating = Number(body.rating)
    const text = String(body.body ?? '').trim()
    if (displayName.length < 2 || displayName.length > 60) return NextResponse.json({ error: 'Add the name to show (2 to 60 characters).' }, { status: 400 })
    if (!(OCCASIONS as readonly string[]).includes(occasion)) return NextResponse.json({ error: 'Choose an occasion.' }, { status: 400 })
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Rating must be 1 to 5.' }, { status: 400 })
    if (text.length < 20 || text.length > 1000) return NextResponse.json({ error: 'The testimonial must be 20 to 1,000 characters.' }, { status: 400 })
    if (body.permissionConfirmed !== true) return NextResponse.json({ error: 'Confirm the customer gave permission to publish this.' }, { status: 400 })

    const { data, error } = await supabaseAdmin()
      .from('reviews')
      .insert({
        display_name: displayName,
        occasion,
        rating,
        body: text,
        status: 'approved',
        approved_at: new Date().toISOString(),
        permission_confirmed: true,
      })
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ review: data })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

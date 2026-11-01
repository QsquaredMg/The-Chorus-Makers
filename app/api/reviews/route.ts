import { NextResponse } from 'next/server'
import { OCCASIONS } from '@/lib/catalog'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

// Public list: approved reviews only, newest first.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin()
      .from('reviews')
      .select('display_name, occasion, rating, body, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return NextResponse.json({ reviews: data ?? [] })
  } catch (error) {
    console.error('reviews list failed', error)
    return NextResponse.json({ reviews: [] })
  }
}

// Submissions are stored as pending and only appear after approval.
export async function POST(request: Request) {
  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : ''
  const occasion = typeof body.occasion === 'string' ? body.occasion : ''
  const reviewBody = typeof body.body === 'string' ? body.body.trim() : ''
  const rating = Number(body.rating)

  if (displayName.length < 2 || displayName.length > 60) return NextResponse.json({ error: 'Please enter a name (2 to 60 characters).' }, { status: 400 })
  if (!(OCCASIONS as readonly string[]).includes(occasion)) return NextResponse.json({ error: 'Please choose an occasion.' }, { status: 400 })
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return NextResponse.json({ error: 'Please choose a star rating.' }, { status: 400 })
  if (reviewBody.length < 20 || reviewBody.length > 1000) return NextResponse.json({ error: 'Please write a review between 20 and 1,000 characters.' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ error: 'Please confirm we can show your review.' }, { status: 400 })

  try {
    const { error } = await supabaseAdmin().from('reviews').insert({
      display_name: displayName,
      occasion,
      rating,
      body: reviewBody,
      status: 'pending',
    })
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('review insert failed', error)
    return NextResponse.json({ error: 'We could not save your review. Please try again.' }, { status: 500 })
  }
}

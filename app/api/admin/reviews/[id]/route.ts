import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

const STATUSES = ['pending', 'approved', 'rejected'] as const

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const status = String(body.status ?? '')
    if (!(STATUSES as readonly string[]).includes(status)) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })

    const { data, error } = await supabaseAdmin()
      .from('reviews')
      .update({ status, approved_at: status === 'approved' ? new Date().toISOString() : null })
      .eq('id', id)
      .select('*')
      .single()
    if (error) throw error
    return NextResponse.json({ review: data })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

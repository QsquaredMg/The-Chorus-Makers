import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { data, error } = await supabaseAdmin()
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500)
    if (error) throw error
    return NextResponse.json({ orders: data ?? [] })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

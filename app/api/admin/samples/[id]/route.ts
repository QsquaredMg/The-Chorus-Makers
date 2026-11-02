import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>
    const update: Record<string, unknown> = {}
    if (typeof body.published === 'boolean') update.published = body.published
    if (typeof body.position === 'number' && Number.isInteger(body.position)) update.position = body.position
    if (Object.keys(update).length === 0) return NextResponse.json({ error: 'Nothing to update.' }, { status: 400 })

    const { data, error } = await supabaseAdmin().from('song_samples').update(update).eq('id', id).select('*').single()
    if (error) throw error
    return NextResponse.json({ sample: data })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await requireAdmin(request)
    const { id } = await params
    const db = supabaseAdmin()
    const { data: row, error: readError } = await db.from('song_samples').select('storage_path').eq('id', id).single()
    if (readError) throw readError
    await db.storage.from('song-samples').remove([row.storage_path])
    const { error } = await db.from('song_samples').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

// Public list: published song samples only, in the admin's chosen order.
export async function GET() {
  try {
    const db = supabaseAdmin()
    const { data, error } = await db
      .from('song_samples')
      .select('id, title, occasion, style, description, storage_path')
      .eq('published', true)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    const samples = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      occasion: row.occasion,
      style: row.style,
      description: row.description,
      src: db.storage.from('song-samples').getPublicUrl(row.storage_path).data.publicUrl,
    }))
    return NextResponse.json({ samples })
  } catch (error) {
    console.error('samples list failed', error)
    return NextResponse.json({ samples: [] })
  }
}

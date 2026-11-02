import { NextResponse } from 'next/server'
import { adminErrorResponse, requireAdmin } from '@/lib/admin'
import { OCCASIONS } from '@/lib/catalog'
import { supabaseAdmin } from '@/lib/server'

export const runtime = 'nodejs'

const AUDIO_EXTENSIONS = ['mp3', 'm4a', 'wav', 'aac', 'ogg']

export async function GET(request: Request) {
  try {
    await requireAdmin(request)
    const { data, error } = await supabaseAdmin()
      .from('song_samples')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false })
    if (error) throw error
    return NextResponse.json({ samples: data ?? [] })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

// Two steps. 'upload-url' returns a one-time URL so the browser uploads the
// audio straight to storage (large files bypass the server). 'create' saves the
// sample details once the file is in place.
export async function POST(request: Request) {
  try {
    await requireAdmin(request)
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    const db = supabaseAdmin()

    if (body?.action === 'upload-url') {
      const fileName = String(body.fileName ?? '')
      const ext = (fileName.split('.').pop() || '').toLowerCase()
      if (!AUDIO_EXTENSIONS.includes(ext)) {
        return NextResponse.json({ error: 'Upload an MP3, M4A, WAV, AAC or OGG file.' }, { status: 400 })
      }
      const path = `${Date.now()}-${crypto.randomUUID()}.${ext}`
      const { data, error } = await db.storage.from('song-samples').createSignedUploadUrl(path)
      if (error) throw error
      return NextResponse.json({ path: data.path, token: data.token })
    }

    if (body?.action === 'create') {
      const title = String(body.title ?? '').trim()
      const occasion = String(body.occasion ?? '')
      const style = String(body.style ?? '').trim()
      const description = String(body.description ?? '').trim()
      const storagePath = String(body.storagePath ?? '')
      if (title.length < 1 || title.length > 80) return NextResponse.json({ error: 'Add a title (up to 80 characters).' }, { status: 400 })
      if (!(OCCASIONS as readonly string[]).includes(occasion)) return NextResponse.json({ error: 'Choose an occasion.' }, { status: 400 })
      if (style.length > 60 || description.length > 300) return NextResponse.json({ error: 'Style or description is too long.' }, { status: 400 })
      if (!/^\d+-[0-9a-f-]+\.[a-z0-9]+$/.test(storagePath)) return NextResponse.json({ error: 'Upload the audio file first.' }, { status: 400 })
      if (body.permissionConfirmed !== true) return NextResponse.json({ error: 'Confirm you have the customer’s permission to publish this recording.' }, { status: 400 })

      const { data, error } = await db
        .from('song_samples')
        .insert({ title, occasion, style, description, storage_path: storagePath, permission_confirmed: true })
        .select('*')
        .single()
      if (error) throw error
      return NextResponse.json({ sample: data })
    }

    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (error) {
    return adminErrorResponse(error)
  }
}

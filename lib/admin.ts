import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin access. A visitor is an admin only if they sign in with Supabase Auth
// (email link) and their email is listed in the ADMIN_EMAILS environment variable.

export class AdminError extends Error {
  constructor(public status: number, message: string) {
    super(message)
  }
}

export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAdmin(request: Request): Promise<{ email: string }> {
  const header = request.headers.get('authorization') || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''
  if (!token) throw new AdminError(401, 'Sign in required.')

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new AdminError(500, 'Sign-in is not configured.')

  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user?.email) throw new AdminError(401, 'Sign in required.')

  const email = data.user.email.toLowerCase()
  if (!adminEmails().includes(email)) throw new AdminError(403, 'This account is not an admin.')
  return { email }
}

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminError) return NextResponse.json({ error: error.message }, { status: error.status })
  console.error('admin request failed', error)
  return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
}

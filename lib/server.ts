import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Server-only clients. Secret keys are read from environment variables set in
// Vercel. They are never exposed to the browser.

let stripeClient: Stripe | null = null
export function stripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

// Uses the service role key, which bypasses row level security. Only server
// code uses this client. The orders table has RLS enabled with no public policies.
export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase environment variables are not set')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function siteUrl(request: Request): string {
  return process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin
}

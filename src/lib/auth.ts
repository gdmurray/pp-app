import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/** Redirect to /login when used from a Server Component or layout. */
export async function requireUser(): Promise<void> {
  const supabase = await createClient()
  // Match proxy.ts — validate the session JWT locally instead of a round-trip
  // to Supabase Auth on every page render (can hang or timeout on serverless).
  const { data } = await supabase.auth.getClaims()
  if (!data?.claims?.sub) redirect('/login')
}

/** Return whether the request has a valid session — for API routes (respond with 401 yourself). */
export async function isApiAuthenticated(): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  return Boolean(data?.claims?.sub)
}

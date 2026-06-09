'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { authErrorLoginPath, getAuthHashError, parseAuthHash } from '@/lib/auth-hash'

/**
 * Finishes OAuth (PKCE ?code= or legacy #access_token hash).
 * Must be a client page — hash fragments are never sent to the server.
 * Avoid useSearchParams here so production doesn't stick on a Suspense fallback.
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    let cancelled = false

    async function finish() {
      const hashParams = parseAuthHash()
      if (hashParams && getAuthHashError(hashParams)) {
        const supabase = createClient()
        await supabase.auth.signOut()
        if (!cancelled) {
          window.location.replace(authErrorLoginPath(hashParams))
        }
        return
      }

      const supabase = createClient()
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled && !error) {
          window.location.replace('/')
          return
        }
      }

      const { data: { session }, error } = await supabase.auth.getSession()
      if (!cancelled && session && !error) {
        window.location.replace('/')
        return
      }

      if (!cancelled) {
        window.location.replace('/login?error=auth')
      }
    }

    finish()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}

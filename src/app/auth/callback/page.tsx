'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Finishes OAuth (PKCE ?code= or legacy #access_token hash).
 * Must be a client page — hash fragments are never sent to the server.
 */
function AuthCallbackHandler() {
  const searchParams = useSearchParams()

  useEffect(() => {
    let cancelled = false

    async function finish() {
      const supabase = createClient()
      const code = searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!cancelled && !error) {
          window.location.replace('/')
          return
        }
      }

      // Implicit / hash flow — browser client parses #access_token from the URL
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
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <p className="text-sm text-muted-foreground">Signing you in…</p>
    </div>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-accent">
          <p className="text-sm text-muted-foreground">Signing you in…</p>
        </div>
      }
    >
      <AuthCallbackHandler />
    </Suspense>
  )
}

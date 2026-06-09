'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { authErrorLoginPath, getAuthHashError, parseAuthHash } from '@/lib/auth-hash'

/**
 * Supabase puts OAuth / magic-link errors in the URL hash (e.g. /#error=access_denied).
 * The server never sees them, so a stale session can still render the dashboard.
 * This runs on every page and redirects to /login with the error when present.
 */
export function AuthHashHandler() {
  useEffect(() => {
    const params = parseAuthHash()
    if (!params || !getAuthHashError(params)) return

    let cancelled = false

    async function handle() {
      const supabase = createClient()
      await supabase.auth.signOut()
      if (!cancelled) {
        window.location.replace(authErrorLoginPath(params!))
      }
    }

    handle()
    return () => {
      cancelled = true
    }
  }, [])

  return null
}

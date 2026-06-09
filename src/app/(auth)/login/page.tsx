'use client'

import { Suspense, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { authErrorMessage, getAuthHashError, parseAuthHash } from '@/lib/auth-hash'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const message = authErrorMessage(
      searchParams.get('error'),
      searchParams.get('error_code'),
      searchParams.get('error_description'),
    )
    if (searchParams.get('error')) {
      setError(message)
    }
  }, [searchParams])

  // OAuth can land here with #access_token if Supabase redirect URL is misconfigured.
  // Finish the session in the browser, then hard-navigate so cookies reach the server.
  useEffect(() => {
    let cancelled = false

    async function handleOAuthReturn() {
      const hashParams = parseAuthHash()
      if (!hashParams) return

      const hashError = getAuthHashError(hashParams)
      if (hashError) {
        setError(
          authErrorMessage(
            hashError.error,
            hashError.errorCode,
            hashError.errorDescription,
          ),
        )
        window.history.replaceState(null, '', '/login')
        return
      }

      const hasHashToken = hashParams.has('access_token')
      if (!hasHashToken) return

      setLoading(true)
      setError('')

      const supabase = createClient()
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (cancelled) return

      if (session && !sessionError) {
        window.history.replaceState(null, '', '/login')
        window.location.replace('/')
        return
      }

      setError('Sign-in failed. Please try again.')
      setLoading(false)
    }

    handleOAuthReturn()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        return
      }
      window.location.replace('/')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleSignIn() {
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (oauthError) {
      setError(oauthError.message)
      setLoading(false)
    }
    // Browser navigates away on success; no need to clear loading.
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-accent">
      <div className="w-full max-w-[380px]">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-white font-black text-xl mb-4">
            PP
          </div>
          <h1 className="text-2xl font-bold text-foreground">Practice Porter</h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-[0_4px_16px_rgba(30,95,142,0.12)] p-8">
          <h2 className="text-lg font-semibold text-foreground mb-6">Sign in to your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-secondary-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@practiceporter.com"
                className="h-11 border-border focus:border-primary focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium text-secondary-foreground">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 border-border focus:border-primary focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-primary hover:bg-pp-blue-dark text-white font-semibold"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-muted-foreground">
              or
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={handleGoogleSignIn}
            className="w-full h-11 font-semibold"
          >
            Continue with Google
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-6">
            No self-service signup. Contact your administrator to get access.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-accent">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

function getRedirectBase(request: Request, origin: string): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto')

  if (process.env.NODE_ENV === 'development') {
    return origin
  }

  if (forwardedHost) {
    const protocol = forwardedProto ?? 'https'
    return `${protocol}://${forwardedHost}`
  }

  return origin
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    next = '/'
  }

  const redirectBase = getRedirectBase(request, origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${redirectBase}${next}`)
    }
  }

  return NextResponse.redirect(`${redirectBase}/login`)
}

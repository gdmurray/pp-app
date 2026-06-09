/** Auth errors from Supabase arrive in the URL hash (never sent to the server). */
export function parseAuthHash(): URLSearchParams | null {
  if (typeof window === 'undefined') return null
  const hash = window.location.hash.replace(/^#/, '')
  if (!hash) return null
  return new URLSearchParams(hash)
}

export function getAuthHashError(params: URLSearchParams): {
  error: string
  errorCode: string | null
  errorDescription: string | null
} | null {
  const error = params.get('error')
  if (!error) return null
  return {
    error,
    errorCode: params.get('error_code'),
    errorDescription: params.get('error_description'),
  }
}

export function authErrorLoginPath(params: URLSearchParams): string {
  const loginUrl = new URL('/login', window.location.origin)
  const authError = getAuthHashError(params)
  if (!authError) return '/login'

  loginUrl.searchParams.set('error', authError.error)
  if (authError.errorCode) {
    loginUrl.searchParams.set('error_code', authError.errorCode)
  }
  if (authError.errorDescription) {
    loginUrl.searchParams.set('error_description', authError.errorDescription)
  }
  return `${loginUrl.pathname}${loginUrl.search}`
}

export function authErrorMessage(
  error: string | null,
  errorCode: string | null,
  errorDescription: string | null,
): string {
  if (errorDescription) return errorDescription
  if (errorCode === 'otp_expired') {
    return 'This sign-in link has expired. Request a new one and try again.'
  }
  if (error === 'access_denied') {
    return 'Sign-in was cancelled or denied. Please try again.'
  }
  if (error === 'auth') return 'Sign-in failed. Please try again.'
  return 'Sign-in failed. Please try again.'
}

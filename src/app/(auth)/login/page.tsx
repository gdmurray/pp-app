import { LoginForm } from './login-form'
import { authErrorMessage } from '@/lib/auth-hash'

export const dynamic = 'force-dynamic'

type LoginSearchParams = {
  error?: string
  error_code?: string
  error_description?: string
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>
}) {
  const params = await searchParams
  const initialError = params.error
    ? authErrorMessage(
        params.error,
        params.error_code ?? null,
        params.error_description ?? null,
      )
    : undefined

  return <LoginForm initialError={initialError} />
}

export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/shell/app-shell'
import { ReactQueryProvider } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import { requireUser } from '@/lib/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return (
    <ReactQueryProvider>
      <AppShell>
        {children}
      </AppShell>
      <Toaster richColors position="top-right" />
    </ReactQueryProvider>
  )
}

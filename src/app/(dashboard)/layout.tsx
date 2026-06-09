export const dynamic = 'force-dynamic'

import { AppShell } from '@/components/shell/app-shell'
import { ReactQueryProvider } from '@/lib/query-client'
import { Toaster } from '@/components/ui/sonner'
import { requireUser } from '@/lib/auth'
import { db } from '@/db'
import { offices } from '@/db/schema'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  const allOffices = await db.select().from(offices)

  return (
    <ReactQueryProvider>
      <AppShell offices={allOffices}>
        {children}
      </AppShell>
      <Toaster richColors position="top-right" />
    </ReactQueryProvider>
  )
}

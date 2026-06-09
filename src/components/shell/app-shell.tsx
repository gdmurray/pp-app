'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { AppSidebar } from './app-sidebar'
import { AppHeader } from './app-header'
import { MissedCallModal } from '@/components/modals/missed-call-modal'
import type { Office } from '@/lib/patient-utils'

interface AppShellProps {
  children: React.ReactNode
  offices: Office[]
}

export function AppShell({ children, offices }: AppShellProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [missedCallOpen, setMissedCallOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-accent">
      <AppSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
        onMissedCall={() => setMissedCallOpen(true)}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <AppHeader pathname={pathname} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      <MissedCallModal
        open={missedCallOpen}
        onClose={() => setMissedCallOpen(false)}
        offices={offices}
      />
    </div>
  )
}

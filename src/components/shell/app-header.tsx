'use client'

import { useEffect, useState } from 'react'
import { OfficePill } from './office-pill'

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/':               { title: 'Home',                   sub: 'Overview of your practice activity' },
  '/onboarding':     { title: 'New Patient Onboarding', sub: 'Complete all required fields to record a new patient' },
  '/patients':       { title: 'New Patient List',       sub: 'All recorded patient intakes' },
  '/calendar':       { title: 'Calendar',               sub: 'New patient calls and appointments by date' },
  '/billing':        { title: 'Billing',                sub: 'Receivables, office billings, and ROI across all offices' },
  '/reconciliation': { title: 'Reconciliation',         sub: 'Month-end billing reconciliation across all offices' },
  '/offices':        { title: 'Offices',                sub: 'Contracted office profiles and details' },
  '/insights':       { title: 'Patient Insights',       sub: 'Analytics and performance metrics across your offices' },
}

interface AppHeaderProps {
  pathname: string
  title?: string
  sub?: string
  officeKey?: string
  officeName?: string
}

export function AppHeader({ pathname, title, sub, officeKey, officeName }: AppHeaderProps) {
  const [time, setTime] = useState('')

  useEffect(() => {
    function fmt() {
      return new Date().toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', weekday: 'short',
        month: 'short', day: 'numeric',
      })
    }
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 30_000)
    return () => clearInterval(id)
  }, [])

  const resolved = PAGE_TITLES[pathname] ?? { title: 'Practice Porter', sub: '' }
  const displayTitle = title ?? resolved.title
  const displaySub = sub ?? resolved.sub

  return (
    <header className="bg-white border-b border-border px-7 flex items-center justify-between h-14 flex-shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-4">
        <div>
          <div className="text-base font-bold text-foreground leading-tight">{displayTitle}</div>
          {displaySub && (
            <div className="text-[11.5px] text-muted-foreground mt-0.5">{displaySub}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {officeKey && officeName && (
          <OfficePill officeKey={officeKey} officeName={officeName} />
        )}
        {time && (
          <span className="text-xs text-muted-foreground font-medium">{time}</span>
        )}
      </div>
    </header>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList,
  Home,
  Users,
  CalendarDays,
  DollarSign,
  ReceiptText,
  Building2,
  BarChart3,
  PhoneMissed,
  ChevronLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  {
    id: 'onboarding',
    label: 'Onboarding Form',
    href: '/onboarding',
    icon: ClipboardList,
    isPrimary: true,
  },
] as const

const MAIN_NAV = [
  { id: 'home',           label: 'Home',             href: '/',               icon: Home },
  { id: 'patients',       label: 'New Patient List', href: '/patients',       icon: Users },
  { id: 'calendar',       label: 'Calendar',         href: '/calendar',       icon: CalendarDays },
  { id: 'billing',        label: 'Billing',          href: '/billing',        icon: DollarSign },
  { id: 'reconciliation', label: 'Reconciliation',   href: '/reconciliation', icon: ReceiptText },
  { id: 'offices',        label: 'Offices',          href: '/offices',        icon: Building2 },
] as const

interface AppSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onMissedCall: () => void
}

export function AppSidebar({ collapsed, onToggle, onMissedCall }: AppSidebarProps) {
  const pathname = usePathname()
  const { data: patientCount } = useQuery<number>({
    queryKey: ['patientCount'],
    queryFn: () => fetch('/api/patient-count').then((r) => r.json()),
    staleTime: 30_000,
  })

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-pp-blue-deeper transition-[width] duration-200 ease-out overflow-hidden flex-shrink-0 shadow-[2px_0_12px_rgba(0,0,0,0.15)] z-50',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/8 flex-shrink-0 overflow-hidden whitespace-nowrap">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-black text-sm text-white flex-shrink-0">
          PP
        </div>
        {!collapsed && (
          <div>
            <div className="text-sm font-extrabold text-white leading-tight tracking-tight">
              Practice Porter
            </div>
            <div className="text-[10.5px] text-white/45 mt-0.5">Admin Dashboard</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-hidden">
        {/* Onboarding — primary CTA */}
        <Link
          href="/onboarding"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap overflow-hidden',
            'bg-white/10 text-white border border-white/18 hover:bg-white/18',
            isActive('/onboarding') && 'bg-white/22 border-white/35',
            collapsed && 'justify-center px-2.5',
          )}
          title={collapsed ? 'Onboarding Form' : undefined}
        >
          <ClipboardList size={17} className="flex-shrink-0 opacity-90" />
          {!collapsed && (
            <>
              <span className="flex-1">Onboarding Form</span>
              <span className="text-lg font-light opacity-85">+</span>
            </>
          )}
        </Link>

        <div className="my-1.5 h-px bg-white/12" />

        {/* Main nav */}
        {MAIN_NAV.map(({ id, label, href, icon: Icon }) => (
          <Link
            key={id}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all whitespace-nowrap overflow-hidden text-white/60 hover:bg-white/8 hover:text-white',
              isActive(href) && 'bg-white/14 text-white',
              collapsed && 'justify-center px-2.5',
            )}
            title={collapsed ? label : undefined}
          >
            <Icon size={17} className="flex-shrink-0 opacity-70" />
            {!collapsed && (
              <span className="flex-1">{label}</span>
            )}
            {!collapsed && id === 'patients' && patientCount !== undefined && (
              <span className="ml-auto bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {patientCount}
              </span>
            )}
          </Link>
        ))}

        <div className="my-1.5 h-px bg-white/12" />

        {/* Insights */}
        <Link
          href="/insights"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-semibold transition-all whitespace-nowrap overflow-hidden text-white/60 hover:bg-white/8 hover:text-white',
            isActive('/insights') && 'bg-white/14 text-white',
            collapsed && 'justify-center px-2.5',
          )}
          title={collapsed ? 'Patient Insights' : undefined}
        >
          <BarChart3 size={17} className="flex-shrink-0 opacity-70" />
          {!collapsed && <span>Patient Insights</span>}
        </Link>
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 flex flex-col gap-1 border-t border-white/8 pt-2 flex-shrink-0">
        {/* Missed call button */}
        <button
          onClick={onMissedCall}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white/70 hover:bg-white/8 hover:text-white transition-all whitespace-nowrap overflow-hidden w-full',
            collapsed && 'justify-center px-2.5',
          )}
          title={collapsed ? 'Log Missed Call' : undefined}
        >
          <PhoneMissed size={16} className="flex-shrink-0 opacity-80" />
          {!collapsed && <span>Log Missed Call</span>}
        </button>

        {/* Collapse toggle */}
        <button
          onClick={onToggle}
          className={cn(
            'flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-semibold text-white/45 hover:bg-white/8 hover:text-white/80 transition-all whitespace-nowrap overflow-hidden w-full',
            collapsed && 'justify-center px-2.5',
          )}
          title={collapsed ? 'Expand sidebar' : undefined}
        >
          <ChevronLeft
            size={15}
            className={cn('flex-shrink-0 transition-transform duration-200', collapsed && 'rotate-180')}
          />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}

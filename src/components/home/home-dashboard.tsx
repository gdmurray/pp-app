'use client'

import Link from 'next/link'
import { Users, CalendarDays, DollarSign, TrendingUp, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-tokens'
import { OFFICE_COLORS } from '@/lib/offices'
import { patientIsBooked, patientApptDate, patientFullName, getOfficeColor } from '@/lib/patient-utils'
import { getBillingMonths, toMonthKey, calcPPFee, calcFirstApptBilling, monthCompletionPercent } from '@/lib/billing/billing-logic'
import type { Patient, Office, BillingRec } from '@/lib/patient-utils'
import type { calls as CallsTable } from '@/db/schema'

interface HomeDashboardProps {
  allPatients: Patient[]
  allOffices: Office[]
  allCalls: (typeof CallsTable.$inferSelect)[]
  allBilling: BillingRec[]
}

export function HomeDashboard({ allPatients, allOffices, allCalls, allBilling }: HomeDashboardProps) {
  const officeMap = new Map(allOffices.map((o) => [o.id, o]))

  // Patient stats
  const booked = allPatients.filter(patientIsBooked)
  const notBooked = allPatients.filter((p) => !patientIsBooked(p))
  const leads = notBooked.filter((p) => {
    const f = (p.booking as { reasonNotBooked?: string })?.reasonNotBooked
    return !f || f !== 'No Lead'
  })

  // This week appointments
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)

  const thisWeekAppts = booked.filter((p) => {
    const d = patientApptDate(p)
    if (!d) return false
    const dt = new Date(d + 'T00:00:00')
    return dt >= weekStart && dt < weekEnd
  })

  // Per-office breakdown
  const officeStats = allOffices.map((o) => {
    const oPatients = allPatients.filter((p) => p.officeId === o.id)
    const oBooked = oPatients.filter(patientIsBooked).length
    const currentMonthBilling = allBilling.filter(
      (b) => b.officeId === o.id && b.reconciliationMonth === toMonthKey(getBillingMonths()[0]),
    )
    const ppFee = calcPPFee(currentMonthBilling.map((b) => b.fields as Record<string, string>))
    return { office: o, total: oPatients.length, booked: oBooked, ppFee }
  })

  // Billing totals
  const currentMonth = getBillingMonths()[0]
  const currentMonthRecs = allBilling.filter(
    (b) => b.reconciliationMonth === toMonthKey(currentMonth),
  )
  const totalPPFee = calcPPFee(currentMonthRecs.map((b) => b.fields as Record<string, string>))
  const totalFirstAppt = calcFirstApptBilling(currentMonthRecs.map((b) => b.fields as Record<string, string>))
  const completionPct = monthCompletionPercent(currentMonthRecs.map((b) => b.fields as Record<string, string>))

  // Upcoming appointments (next 14 days)
  const upcoming = booked
    .filter((p) => {
      const d = patientApptDate(p)
      if (!d) return false
      const dt = new Date(d + 'T00:00:00')
      const future = new Date()
      future.setDate(future.getDate() + 14)
      return dt >= now && dt <= future
    })
    .sort((a, b) => patientApptDate(a).localeCompare(patientApptDate(b)))
    .slice(0, 5)

  return (
    <div className="p-7 space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Patients"
          value={allPatients.length}
          sub={`${booked.length} booked`}
          icon={<Users size={20} />}
          color={colors.primary}
        />
        <StatCard
          label="Appointments This Week"
          value={thisWeekAppts.length}
          sub={`${allPatients.length - booked.length} follow-ups needed`}
          icon={<CalendarDays size={20} />}
          color={colors.office.mountain}
        />
        <StatCard
          label="PP Fees This Month"
          value={`$${totalPPFee.toLocaleString()}`}
          sub={`${currentMonthRecs.filter((b) => (b.fields as { attendedAppt?: string })?.attendedAppt === 'yes').length} attended`}
          icon={<DollarSign size={20} />}
          color={colors.office.sunset}
        />
        <StatCard
          label="Office Billing This Month"
          value={`$${totalFirstAppt.toLocaleString()}`}
          sub={`${completionPct}% reconciled`}
          icon={<TrendingUp size={20} />}
          color={colors.office.crown}
        />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Patient summary */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="section-card-header px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">New Patient List</h3>
            <Link href="/patients" className="text-xs text-white/70 hover:text-white transition-colors">
              View all →
            </Link>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="Total" value={allPatients.length} />
              <MiniStat label="Booked" value={booked.length} color={colors.success} />
              <MiniStat label="Leads" value={leads.length} color={colors.warning} />
            </div>
            <div className="h-px bg-accent" />
            {/* Per-office breakdown */}
            {officeStats.map(({ office, total, booked: oBooked }) => (
              <div key={office.id} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: OFFICE_COLORS[office.key as keyof typeof OFFICE_COLORS] }}
                />
                <span className="text-xs font-medium text-secondary-foreground flex-1">{office.name}</span>
                <span className="text-xs text-muted-foreground">{oBooked}/{total}</span>
              </div>
            ))}
            {leads.slice(0, 4).length > 0 && (
              <>
                <div className="h-px bg-accent" />
                <div className="space-y-1">
                  <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">Open Leads</p>
                  {leads.slice(0, 4).map((p) => {
                    const office = officeMap.get(p.officeId)
                    return (
                      <div key={p.id} className="flex items-center gap-2 py-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getOfficeColor(office?.key ?? '') }}
                        />
                        <span className="text-xs text-foreground font-medium truncate flex-1">
                          {patientFullName(p)}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground">
                          {new Date(p.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Calendar summary */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="section-card-header px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Calendar</h3>
            <Link href="/calendar" className="text-xs text-white/70 hover:text-white transition-colors">
              View →
            </Link>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="This Week" value={thisWeekAppts.length} />
              <MiniStat label="Upcoming 14d" value={upcoming.length} />
            </div>
            <div className="h-px bg-accent" />
            <p className="text-[10.5px] uppercase tracking-wider text-muted-foreground font-semibold">Next Appointments</p>
            {upcoming.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {upcoming.map((p) => {
                  const office = officeMap.get(p.officeId)
                  const apptDate = patientApptDate(p)
                  const dt = apptDate ? new Date(apptDate + 'T00:00:00') : null
                  return (
                    <div key={p.id} className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0 text-[9px] font-bold leading-tight"
                        style={{ backgroundColor: getOfficeColor(office?.key ?? '') }}
                      >
                        {dt ? (
                          <>
                            <span>{dt.toLocaleDateString('en-US', { month: 'short' })}</span>
                            <span>{dt.getDate()}</span>
                          </>
                        ) : '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{patientFullName(p)}</p>
                        <p className="text-[10.5px] text-muted-foreground">
                          {(p.booking as { apptTime?: string })?.apptTime ?? ''}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Billing summary */}
        <div className="col-span-1 bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          <div className="section-card-header px-5 py-3.5 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Billing</h3>
            <Link href="/billing" className="text-xs text-white/70 hover:text-white transition-colors">
              View →
            </Link>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="PP Fees" value={`$${totalPPFee.toLocaleString()}`} color={colors.primary} />
              <MiniStat label="Office Billed" value={`$${totalFirstAppt.toLocaleString()}`} />
            </div>
            <div className="h-px bg-accent" />
            {/* Per-office reconciliation status */}
            {officeStats.map(({ office, ppFee }) => (
              <div key={office.id} className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: OFFICE_COLORS[office.key as keyof typeof OFFICE_COLORS] }}
                />
                <span className="text-xs font-medium text-secondary-foreground flex-1">{office.name}</span>
                <span className="text-xs font-bold text-foreground">${ppFee.toLocaleString()}</span>
              </div>
            ))}
            <div className="h-px bg-accent" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Month reconciled</span>
              <span className={cn('text-xs font-bold', completionPct === 100 ? 'text-pp-success' : 'text-pp-orange')}>
                {completionPct}%
              </span>
            </div>
            <Link
              href="/reconciliation"
              className="block text-center text-xs font-semibold text-primary hover:underline py-1"
            >
              View Reconciliation →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label, value, sub, icon, color,
}: {
  label: string; value: string | number; sub: string; icon: React.ReactNode; color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border p-5">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
          style={{ backgroundColor: color }}
        >
          {icon}
        </div>
      </div>
      <div className="text-2xl font-extrabold text-foreground leading-tight">{value}</div>
      <div className="text-[10.5px] text-muted-foreground mt-0.5">{sub}</div>
      <div className="text-xs font-semibold text-secondary-foreground mt-1.5">{label}</div>
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="text-center p-2 bg-muted rounded-lg">
      <div className="text-lg font-extrabold" style={{ color: color ?? colors.foreground }}>{value}</div>
      <div className="text-[10px] text-muted-foreground font-medium">{label}</div>
    </div>
  )
}

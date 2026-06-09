'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'
import { Clock, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-tokens'
import { resolveOfficeColor } from '@/lib/offices'
import {
  getBillingMonths, toMonthKey, monthLabel, parseMonth,
  calcPPFee, calcFirstApptBilling, monthCompletionPercent,
  BILL_START,
} from '@/lib/billing/billing-logic'
import {
  patientFullName, patientApptDate, patientIsBooked,
  type Patient, type Office, type BillingRec,
} from '@/lib/patient-utils'
import type { calls as CallsTable } from '@/db/schema'

interface ReconciliationHomeProps {
  allPatients: Patient[]
  allBilling: BillingRec[]
  allOffices: Office[]
  allCalls: (typeof CallsTable.$inferSelect)[]
}

export function ReconciliationHome({ allPatients, allBilling, allOffices }: ReconciliationHomeProps) {
  const months = useMemo(() => getBillingMonths(), [])
  const currentMonth = months[0]
  const currentMonthKey = toMonthKey(currentMonth)

  // Days until end of month
  const now = new Date()
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  const daysLeft = Math.max(0, Math.ceil((endOfMonth.getTime() - now.getTime()) / 86400000))

  const officeMap = useMemo(() => new Map(allOffices.map((o) => [o.id, o])), [allOffices])

  // 2nd appointment queue: patients who have attended 1st appt and need 2nd billing
  const secondApptQueue = useMemo(() => {
    return allBilling.filter((b) => {
      const f = b.fields as { attendedAppt?: string; secondApptBilling?: string; removedFromSecond?: boolean }
      return f.attendedAppt === 'yes' && !f.secondApptBilling && !f.removedFromSecond
    })
  }, [allBilling])

  return (
    <div className="p-7 space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="text-3xl font-extrabold text-primary">{daysLeft}</div>
          <div className="text-sm font-semibold text-secondary-foreground mt-1">Days Until Month End</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} reconciliation
          </div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="text-3xl font-extrabold text-pp-orange">{secondApptQueue.length}</div>
          <div className="text-sm font-semibold text-secondary-foreground mt-1">2nd Appt Billing Pending</div>
          <div className="text-xs text-muted-foreground mt-0.5">Across all offices</div>
        </div>
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <div className="text-3xl font-extrabold text-pp-success">
            ${calcPPFee(
              allBilling
                .filter((b) => b.reconciliationMonth === currentMonthKey)
                .map((b) => b.fields as Record<string, string>),
            ).toLocaleString()}
          </div>
          <div className="text-sm font-semibold text-secondary-foreground mt-1">PP Fees This Month</div>
          <div className="text-xs text-muted-foreground mt-0.5">$150 × attended appointments</div>
        </div>
      </div>

      {/* Per-office cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-foreground">Office Reconciliation Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {allOffices.map((office) => {
            const color = resolveOfficeColor(office)
            const officePatients = allPatients.filter(
              (p) => p.officeId === office.id && patientIsBooked(p),
            )
            const officeBilling = allBilling.filter(
              (b) => b.officeId === office.id && b.reconciliationMonth === currentMonthKey,
            )
            const totalPatientsThisMonth = officePatients.filter((p) => {
              const d = patientApptDate(p)
              if (!d) return false
              const dt = new Date(d + 'T00:00:00')
              return dt.getFullYear() === currentMonth.getFullYear() &&
                     dt.getMonth() === currentMonth.getMonth()
            }).length
            const pct = monthCompletionPercent(officeBilling.map((b) => b.fields as Record<string, string>))
            const ppFee = calcPPFee(officeBilling.map((b) => b.fields as Record<string, string>))
            const officeBilling1st = calcFirstApptBilling(officeBilling.map((b) => b.fields as Record<string, string>))

            // Month history (last 4 months)
            const historyMonths = months.slice(0, 4)

            return (
              <div
                key={office.id}
                className="bg-white rounded-xl border border-border shadow-sm overflow-hidden"
              >
                <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{office.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {totalPatientsThisMonth} patient{totalPatientsThisMonth !== 1 ? 's' : ''} this month
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs font-bold px-2 py-1 rounded-full',
                        pct === 100 ? 'bg-pp-success-light text-pp-success' : 'bg-pp-orange-light text-pp-orange',
                      )}
                    >
                      {pct}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="h-2 rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: pct === 100 ? colors.success : color }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm font-extrabold text-foreground">${ppFee.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">PP Fees</div>
                    </div>
                    <div className="text-center p-2 bg-muted rounded-lg">
                      <div className="text-sm font-extrabold text-foreground">${officeBilling1st.toLocaleString()}</div>
                      <div className="text-[10px] text-muted-foreground">Office Billed</div>
                    </div>
                  </div>

                  {/* Mini month calendar */}
                  <div className="flex gap-1">
                    {historyMonths.reverse().map((m) => {
                      const mKey = toMonthKey(m)
                      const mBilling = allBilling.filter(
                        (b) => b.officeId === office.id && b.reconciliationMonth === mKey,
                      )
                      const mPct = monthCompletionPercent(mBilling.map((b) => b.fields as Record<string, string>))
                      const isBeforeBillStart = m < BILL_START

                      return (
                        <div
                          key={mKey}
                          className={cn(
                            'flex-1 py-1 rounded text-[9px] font-bold text-center text-white',
                            isBeforeBillStart ? 'bg-border text-muted-foreground' :
                            mPct === 100 ? 'bg-pp-success' :
                            mBilling.length === 0 ? 'bg-border text-muted-foreground' : 'bg-pp-orange',
                          )}
                          title={monthLabel(m)}
                        >
                          {m.toLocaleDateString('en-US', { month: 'short' })}
                        </div>
                      )
                    })}
                  </div>

                  {/* Links */}
                  <div className="flex items-center justify-between pt-1 border-t border-muted">
                    <Link
                      href={`/reconciliation/${office.id}`}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                    >
                      Detail <ChevronRight size={11} />
                    </Link>
                    <Link
                      href={`/reconciliation/${office.id}/year`}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Full Year →
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 2nd appointment accordion */}
      {secondApptQueue.length > 0 && (
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="section-card-header px-5 py-3.5 flex items-center gap-2">
            <span className="text-sm font-bold text-white">2nd Appointment Billing</span>
            <span className="ml-auto bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {secondApptQueue.length} pending
            </span>
          </div>
          <div className="p-5">
            <p className="text-sm text-muted-foreground mb-4">
              These patients attended their first appointment and need second-visit billing recorded.
            </p>
            <div className="space-y-2">
              {secondApptQueue.slice(0, 5).map((b) => {
                const p = allPatients.find((pt) => pt.id === b.patientId)
                const office = officeMap.get(b.officeId)
                if (!p) return null
                return (
                  <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: office ? resolveOfficeColor(office) : undefined }}
                    />
                    <span className="text-sm font-semibold text-foreground flex-1">{patientFullName(p)}</span>
                    <span className="text-xs text-muted-foreground">{office?.name}</span>
                    <Link
                      href={`/reconciliation/${office?.key}`}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Record →
                    </Link>
                  </div>
                )
              })}
              {secondApptQueue.length > 5 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  + {secondApptQueue.length - 5} more across all offices
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-tokens'
import { OFFICE_COLORS } from '@/lib/offices'
import {
  getBillingMonths, toMonthKey, monthLabel, calcPPFee,
  calcFirstApptBilling, monthCompletionPercent, BILL_START,
} from '@/lib/billing/billing-logic'
import { patientApptDate, type Patient, type Office, type BillingRec } from '@/lib/patient-utils'

interface ReconciliationFullYearProps {
  office: Office
  allPatients: Patient[]
  allBilling: BillingRec[]
}

export function ReconciliationFullYear({ office, allPatients, allBilling }: ReconciliationFullYearProps) {
  const months = useMemo(() => getBillingMonths(), [])
  const color = OFFICE_COLORS[office.key as keyof typeof OFFICE_COLORS]

  const monthRows = useMemo(() => {
    return months.map((m) => {
      const mKey = toMonthKey(m)
      const isBeforeBillStart = m < BILL_START

      const monthPatients = allPatients.filter((p) => {
        const d = patientApptDate(p)
        if (!d) return false
        const dt = new Date(d + 'T00:00:00')
        return dt.getFullYear() === m.getFullYear() && dt.getMonth() === m.getMonth()
      })

      const monthBilling = allBilling.filter((b) => b.reconciliationMonth === mKey)
      const fields = monthBilling.map((b) => b.fields as Record<string, string>)
      const ppFee = calcPPFee(fields)
      const firstAppt = calcFirstApptBilling(fields)
      const pct = monthCompletionPercent(fields)
      const attended = fields.filter((f) => (f.attendedAppt ?? f.attended) === 'yes').length
      const noShow = fields.filter((f) => (f.attendedAppt ?? f.attended) === 'no').length
      const pending = fields.filter((f) => (f.attendedAppt ?? f.attended) === 'pending').length

      return {
        month: m,
        mKey,
        isBeforeBillStart,
        totalPatients: monthPatients.length,
        attended,
        noShow,
        pending,
        ppFee,
        firstAppt,
        pct,
      }
    })
  }, [months, allPatients, allBilling])

  const totals = useMemo(() => ({
    patients: monthRows.reduce((s, r) => s + r.totalPatients, 0),
    attended: monthRows.reduce((s, r) => s + r.attended, 0),
    ppFee: monthRows.reduce((s, r) => s + r.ppFee, 0),
    firstAppt: monthRows.reduce((s, r) => s + r.firstAppt, 0),
  }), [monthRows])

  return (
    <div className="p-7 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/reconciliation" className="text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> Reconciliation
        </Link>
        <span className="text-border">/</span>
        <Link href={`/reconciliation/${office.key}`} className="text-sm text-primary hover:underline flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          {office.name}
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm font-bold text-foreground">Full Year</span>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Patients', value: totals.patients },
          { label: 'Total Attended', value: totals.attended },
          { label: 'Total PP Fees', value: `$${totals.ppFee.toLocaleString()}` },
          { label: 'Total Office Billed', value: `$${totals.firstAppt.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-border shadow-sm p-4 text-center">
            <div className="text-2xl font-extrabold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground mt-0.5 font-semibold">{label}</div>
          </div>
        ))}
      </div>

      {/* Full year table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="section-card-header px-5 py-3.5">
          <span className="text-sm font-bold text-white">{office.name} — Full Year Reconciliation</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                {['Month', 'Patients', 'Attended', 'No-Show', 'Pending', 'PP Fees', 'Office Billed', 'Progress'].map((h) => (
                  <th key={h} className="text-left text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {monthRows.map((r) => (
                <tr
                  key={r.mKey}
                  className={cn(
                    'border-b border-muted',
                    r.isBeforeBillStart ? 'opacity-40' : 'hover:bg-pp-hover-subtle',
                  )}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/reconciliation/${office.key}?month=${r.mKey}`}
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      {monthLabel(r.month)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-secondary-foreground">{r.totalPatients || '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-pp-success">{r.attended}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-destructive">{r.noShow}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-semibold text-pp-orange">{r.pending}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">
                    {r.ppFee > 0 ? `$${r.ppFee.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-sm text-foreground">
                    {r.firstAppt > 0 ? `$${r.firstAppt.toLocaleString()}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-accent rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${r.pct}%`,
                            backgroundColor: r.pct === 100 ? colors.success : color,
                          }}
                        />
                      </div>
                      <span className={cn('text-xs font-bold w-8 text-right', r.pct === 100 ? 'text-pp-success' : 'text-pp-orange')}>
                        {r.pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted font-bold">
                <td className="px-4 py-3 text-sm font-bold text-foreground">TOTAL</td>
                <td className="px-4 py-3 text-sm text-foreground">{totals.patients}</td>
                <td className="px-4 py-3 text-sm text-pp-success">{totals.attended}</td>
                <td className="px-4 py-3" />
                <td className="px-4 py-3" />
                <td className="px-4 py-3 text-sm font-bold text-primary">${totals.ppFee.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">${totals.firstAppt.toLocaleString()}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}

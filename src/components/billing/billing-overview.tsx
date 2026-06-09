'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { colors, chartTheme } from '@/lib/design-tokens'
import { resolveOfficeColor } from '@/lib/offices'
import {
  getBillingMonths, toMonthKey, calcPPFee, calcFirstApptBilling,
  calcSecondApptBilling, monthLabel,
} from '@/lib/billing/billing-logic'
import { type Patient, type Office, type BillingRec } from '@/lib/patient-utils'
import type { BillingFields } from '@/db/schema'

type Period = 'thisMonth' | '3m' | '6m' | 'ytd' | 'all'

interface BillingOverviewProps {
  allPatients: Patient[]
  allBilling: BillingRec[]
  allOffices: Office[]
}

export function BillingOverview({ allPatients, allBilling, allOffices }: BillingOverviewProps) {
  const [period, setPeriod] = useState<Period>('6m')
  const [officeFilter, setOfficeFilter] = useState('')

  const allMonths = useMemo(() => getBillingMonths(), [])

  const filteredMonths = useMemo(() => {
    const now = new Date()
    return allMonths.filter((m) => {
      if (period === 'thisMonth') {
        return m.getFullYear() === now.getFullYear() && m.getMonth() === now.getMonth()
      }
      if (period === '3m') {
        const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 3)
        return m >= cutoff
      }
      if (period === '6m') {
        const cutoff = new Date(now); cutoff.setMonth(cutoff.getMonth() - 6)
        return m >= cutoff
      }
      if (period === 'ytd') {
        return m.getFullYear() === now.getFullYear()
      }
      return true
    })
  }, [allMonths, period])

  const filteredBilling = useMemo(() => {
    const monthKeys = new Set(filteredMonths.map(toMonthKey))
    return allBilling.filter((b) => {
      if (!monthKeys.has(b.reconciliationMonth)) return false
      if (officeFilter) {
        const office = allOffices.find((o) => o.id === b.officeId)
        if (office?.key !== officeFilter) return false
      }
      return true
    })
  }, [allBilling, filteredMonths, officeFilter, allOffices])

  const fields = filteredBilling.map((b) => b.fields as BillingFields)
  const totalPPFee = calcPPFee(fields)
  const totalFirstAppt = calcFirstApptBilling(fields)
  const totalSecondAppt = calcSecondApptBilling(fields)
  const totalAttended = fields.filter((f) => (f.attendedAppt ?? f.attended) === 'yes').length
  const totalNoShow = fields.filter((f) => (f.attendedAppt ?? f.attended) === 'no').length

  // Monthly chart data
  const chartData = useMemo(() => {
    return [...filteredMonths].reverse().map((m) => {
      const mKey = toMonthKey(m)
      const mBilling = filteredBilling.filter((b) => b.reconciliationMonth === mKey)
      const mFields = mBilling.map((b) => b.fields as BillingFields)
      const label = m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const result: Record<string, string | number> = { month: label }
      if (officeFilter) {
        result['ppFee'] = calcPPFee(mFields)
        result['officeBilled'] = calcFirstApptBilling(mFields)
      } else {
        for (const office of allOffices) {
          const oFields = mBilling
            .filter((b) => b.officeId === office.id)
            .map((b) => b.fields as BillingFields)
          result[`${office.key}_pp`] = calcPPFee(oFields)
          result[`${office.key}_office`] = calcFirstApptBilling(oFields)
        }
      }
      return result
    })
  }, [filteredMonths, filteredBilling, officeFilter, allOffices])

  const PERIODS: Array<{ key: Period; label: string }> = [
    { key: 'thisMonth', label: 'This Month' },
    { key: '3m', label: '3M' },
    { key: '6m', label: '6M' },
    { key: 'ytd', label: 'YTD' },
    { key: 'all', label: 'All Time' },
  ]

  return (
    <div className="p-7 space-y-6">
      {/* Period + office filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex border border-border rounded-lg overflow-hidden bg-white">
          {PERIODS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setPeriod(key)}
              className={cn(
                'px-3 py-1.5 text-xs font-semibold transition-colors',
                period === key ? 'bg-primary text-white' : 'text-secondary-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1 border border-border rounded-lg overflow-hidden bg-white">
          <button
            onClick={() => setOfficeFilter('')}
            className={cn('px-3 py-1.5 text-xs font-semibold', !officeFilter ? 'bg-primary text-white' : 'text-secondary-foreground hover:bg-muted')}
          >
            All Offices
          </button>
          {allOffices.map((o) => (
            <button
              key={o.key}
              onClick={() => setOfficeFilter(o.key)}
              className={cn('px-3 py-1.5 text-xs font-semibold transition-colors', officeFilter === o.key ? 'text-white' : 'text-secondary-foreground hover:bg-muted')}
              style={officeFilter === o.key ? { backgroundColor: resolveOfficeColor(o) } : {}}
            >
              {o.abbr}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-5 gap-3">
        {[
          { label: 'PP Fees Earned', value: `$${totalPPFee.toLocaleString()}`, color: colors.primary },
          { label: 'Office Billed', value: `$${totalFirstAppt.toLocaleString()}`, color: colors.office.mountain },
          { label: '2nd Appt Billed', value: `$${totalSecondAppt.toLocaleString()}`, color: colors.office.crown },
          { label: 'Patients Attended', value: totalAttended, color: colors.success },
          { label: 'No-Shows', value: totalNoShow, color: colors.destructive },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border shadow-sm p-4 text-center">
            <div className="text-xl font-extrabold" style={{ color }}>{value}</div>
            <div className="text-[10.5px] text-muted-foreground font-semibold mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">PP Receivables by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: chartTheme.tick }} />
              <YAxis tick={{ fontSize: 10, fill: chartTheme.tick }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              {officeFilter ? (
                <Bar dataKey="ppFee" name="PP Fee" fill={chartTheme.primary} radius={[3, 3, 0, 0]} />
              ) : (
                allOffices.map((o) => (
                  <Bar
                    key={o.key}
                    dataKey={`${o.key}_pp`}
                    name={`${o.name} PP`}
                    stackId="pp"
                    fill={resolveOfficeColor(o)}
                    radius={[3, 3, 0, 0]}
                  />
                ))
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Office Billing by Month</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: chartTheme.tick }} />
              <YAxis tick={{ fontSize: 10, fill: chartTheme.tick }} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
              {officeFilter ? (
                <Bar dataKey="officeBilled" name="Office Billed" fill={chartTheme.officeMountain} radius={[3, 3, 0, 0]} />
              ) : (
                allOffices.map((o) => (
                  <Bar
                    key={o.key}
                    dataKey={`${o.key}_office`}
                    name={`${o.name}`}
                    stackId="office"
                    fill={resolveOfficeColor(o)}
                    radius={[3, 3, 0, 0]}
                  />
                ))
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Per-office breakdown grid */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="section-card-header px-5 py-3.5">
          <span className="text-sm font-bold text-white">Per-Office Breakdown</span>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted">
              {['Office', 'PP Fees', 'Office Billed', '2nd Appt', 'Attended', 'No-Show', 'Pending'].map((h) => (
                <th key={h} className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 py-2.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allOffices.map((office) => {
              const oBilling = filteredBilling.filter((b) => b.officeId === office.id)
              const oFields = oBilling.map((b) => b.fields as BillingFields)
              const ppFee = calcPPFee(oFields)
              const firstAppt = calcFirstApptBilling(oFields)
              const secondAppt = calcSecondApptBilling(oFields)
              const attended = oFields.filter((f) => (f.attendedAppt ?? f.attended) === 'yes').length
              const noShow = oFields.filter((f) => (f.attendedAppt ?? f.attended) === 'no').length
              const pending = oFields.filter((f) => (f.attendedAppt ?? f.attended) === 'pending').length
              const color = resolveOfficeColor(office)

              return (
                <tr key={office.id} className="border-b border-muted hover:bg-pp-hover-subtle">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-sm font-semibold text-foreground">{office.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-primary">${ppFee.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">${firstAppt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-foreground">${secondAppt.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-pp-success">{attended}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-destructive">{noShow}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-pp-orange">{pending}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

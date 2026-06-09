'use client'

import { useState, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { cn } from '@/lib/utils'
import { colors, chartTheme, officeFallbackColor } from '@/lib/design-tokens'
import { resolveOfficeColor } from '@/lib/offices'
import {
  patientIsBooked, patientIsNew, patientApptDate,
  type Patient, type Office,
} from '@/lib/patient-utils'
import type { calls as CallsTable } from '@/db/schema'

type Period = '30d' | '90d' | 'ytd' | 'custom'

interface InsightsDashboardProps {
  allPatients: Patient[]
  allCalls: (typeof CallsTable.$inferSelect)[]
  allOffices: Office[]
}

export function InsightsDashboard({ allPatients, allCalls, allOffices }: InsightsDashboardProps) {
  const [period, setPeriod] = useState<Period>('90d')
  const [officeFilter, setOfficeFilter] = useState('')

  const cutoff = useMemo(() => {
    const now = new Date()
    if (period === '30d') { const d = new Date(now); d.setDate(d.getDate() - 30); return d }
    if (period === '90d') { const d = new Date(now); d.setDate(d.getDate() - 90); return d }
    if (period === 'ytd') { return new Date(now.getFullYear(), 0, 1) }
    return new Date(0)
  }, [period])

  const filteredPatients = useMemo(() => {
    return allPatients.filter((p) => {
      if (new Date(p.recordedAt) < cutoff) return false
      if (officeFilter) {
        const o = allOffices.find((o) => o.id === p.officeId)
        if (o?.key !== officeFilter) return false
      }
      return true
    })
  }, [allPatients, cutoff, officeFilter, allOffices])

  const filteredCalls = useMemo(() => {
    return allCalls.filter((c) => {
      if (new Date(c.recordedAt) < cutoff) return false
      if (officeFilter) {
        const o = allOffices.find((o) => o.id === c.officeId)
        if (o?.key !== officeFilter) return false
      }
      return true
    })
  }, [allCalls, cutoff, officeFilter, allOffices])

  const totalCalls = filteredPatients.length + filteredCalls.length
  const booked = filteredPatients.filter(patientIsBooked)
  const bookingRate = totalCalls > 0 ? Math.round((booked.length / filteredPatients.length) * 100) : 0
  const newPatients = filteredPatients.filter(patientIsNew)
  const missedCalls = filteredCalls.filter((c) => c.type === 'missed')

  // Referral source breakdown
  const referralData = useMemo(() => {
    const counts: Record<string, number> = {}
    filteredPatients.filter(patientIsNew).forEach((p) => {
      const src = (p.patient as { referralSource?: string })?.referralSource ?? 'Unknown'
      counts[src] = (counts[src] ?? 0) + 1
    })
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([name, value]) => ({ name, value }))
  }, [filteredPatients])

  // Weekly call volume (last 8 weeks)
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { week: string; patients: number; calls: number }> = {}
    const getWeekKey = (d: Date) => {
      const monday = new Date(d)
      monday.setDate(d.getDate() - ((d.getDay() + 6) % 7))
      return monday.toISOString().slice(0, 10)
    }
    filteredPatients.forEach((p) => {
      const k = getWeekKey(new Date(p.recordedAt))
      if (!weeks[k]) weeks[k] = { week: k, patients: 0, calls: 0 }
      weeks[k].patients++
    })
    filteredCalls.forEach((c) => {
      const k = getWeekKey(new Date(c.recordedAt))
      if (!weeks[k]) weeks[k] = { week: k, patients: 0, calls: 0 }
      weeks[k].calls++
    })
    return Object.values(weeks)
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8)
      .map((w) => ({
        ...w,
        week: new Date(w.week + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
  }, [filteredPatients, filteredCalls])

  // Office breakdown
  const officeBreakdown = useMemo(() => {
    return allOffices.map((o) => {
      const oPatients = filteredPatients.filter((p) => p.officeId === o.id)
      const oBooked = oPatients.filter(patientIsBooked)
      const rate = oPatients.length > 0 ? Math.round((oBooked.length / oPatients.length) * 100) : 0
      return { name: o.name, key: o.key, color: resolveOfficeColor(o), value: oPatients.length, rate }
    })
  }, [filteredPatients, allOffices])

  // Insurance breakdown
  const insuranceData = useMemo(() => {
    const counts = { provided: 0, none: 0, bring: 0 }
    filteredPatients.forEach((p) => {
      const s = (p.financial as { insuranceStatus?: string })?.insuranceStatus
      if (s === 'provided') counts.provided++
      else if (s === 'none') counts.none++
      else if (s === 'bring') counts.bring++
    })
    return [
      { name: 'Has Insurance', value: counts.provided, color: colors.primary },
      { name: 'No Insurance', value: counts.none, color: colors.destructive },
      { name: 'Bringing Card', value: counts.bring, color: colors.warning },
    ].filter((d) => d.value > 0)
  }, [filteredPatients])

  const PERIODS = [
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'ytd', label: 'Year to Date' },
  ] as const

  return (
    <div className="p-7 space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3">
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
            All
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

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Leads', value: filteredPatients.length, color: colors.primary },
          { label: 'Booking Rate', value: `${bookingRate}%`, color: colors.success },
          { label: 'New Patients', value: newPatients.length, color: colors.office.crown },
          { label: 'Missed Calls', value: missedCalls.length, color: colors.destructive },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-border shadow-sm p-5 text-center">
            <div className="text-3xl font-extrabold" style={{ color }}>{value}</div>
            <div className="text-xs font-semibold text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-2 gap-5">
        {/* Weekly volume */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Weekly Call Volume</h3>
          {weeklyData.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-8">Not enough data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: chartTheme.tick }} />
                <YAxis tick={{ fontSize: 10, fill: chartTheme.tick }} />
                <Tooltip />
                <Bar dataKey="patients" name="New Patients" fill={chartTheme.primary} radius={[3, 3, 0, 0]} />
                <Bar dataKey="calls" name="Missed/No-Lead" fill={chartTheme.destructive} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Referral sources */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Referral Sources</h3>
          {referralData.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-8">No referral data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={referralData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: chartTheme.tick }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: chartTheme.tick }} width={80} />
                <Tooltip />
                <Bar dataKey="value" name="Patients" fill={chartTheme.primary} radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Office breakdown */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Patients by Office</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={officeBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.grid} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartTheme.tick }} />
              <YAxis tick={{ fontSize: 10, fill: chartTheme.tick }} />
              <Tooltip />
              <Bar dataKey="value" name="Patients" radius={[3, 3, 0, 0]}>
                {officeBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insurance breakdown */}
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <h3 className="text-sm font-bold text-foreground mb-4">Insurance Status</h3>
          {insuranceData.length === 0 ? (
            <p className="text-xs text-muted-foreground italic text-center py-8">No insurance data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={insuranceData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }) => `${name} ${Math.round((percent ?? 0) * 100)}%`}
                  labelLine={false}
                >
                  {insuranceData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Office booking rates */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="section-card-header px-5 py-3.5">
          <span className="text-sm font-bold text-white">Booking Rate by Office</span>
        </div>
        <div className="p-5 space-y-4">
          {officeBreakdown.map(({ name, key, color, value, rate }) => (
            <div key={key} className="flex items-center gap-4">
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm font-semibold text-foreground w-36">{name}</span>
              <div className="flex-1 h-3 bg-accent rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${rate}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
              <span className="text-sm font-bold text-foreground w-12 text-right">{rate}%</span>
              <span className="text-xs text-muted-foreground w-16 text-right">{value} patients</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

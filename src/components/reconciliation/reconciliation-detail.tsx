'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import {
  createColumnHelper, getCoreRowModel, useReactTable, flexRender,
} from '@tanstack/react-table'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { colors } from '@/lib/design-tokens'
import { resolveOfficeColor } from '@/lib/offices'
import {
  getBillingMonths, toMonthKey, monthLabel, parseMonth,
  calcPPFee, calcFirstApptBilling, calcSecondApptBilling,
  monthCompletionPercent, billIsCardComplete, PP_FEE_PER_APPT,
} from '@/lib/billing/billing-logic'
import {
  patientFullName, patientApptDate, patientApptTime,
  type Patient, type Office, type BillingRec,
} from '@/lib/patient-utils'
import type { BillingFields } from '@/db/schema'
import { upsertBillingRecord } from '@/server/actions/billing'
import { toast } from 'sonner'
import type { calls as CallsTable } from '@/db/schema'

interface ReconciliationDetailProps {
  office: Office
  allPatients: Patient[]
  allBilling: BillingRec[]
  allCalls: (typeof CallsTable.$inferSelect)[]
}

const CONTACT_TYPES = [
  'Answered Live', 'Voicemail Returned', 'Voicemail Not Returned',
  'Missed - No Voicemail', 'Other',
]

const columnHelper = createColumnHelper<{ patient: Patient; billing: BillingRec | null }>()

export function ReconciliationDetail({ office, allPatients, allBilling, allCalls }: ReconciliationDetailProps) {
  const months = useMemo(() => getBillingMonths(), [])
  const [monthIdx, setMonthIdx] = useState(0)
  const selectedMonth = months[monthIdx]
  const selectedMonthKey = toMonthKey(selectedMonth)
  const color = resolveOfficeColor(office)

  // Build reconciliation data for selected month
  const monthData = useMemo(() => {
    // Patients whose appointment date falls in the selected month
    const monthPatients = allPatients.filter((p) => {
      const d = patientApptDate(p)
      if (!d) return false
      const dt = new Date(d + 'T00:00:00')
      return (
        dt.getFullYear() === selectedMonth.getFullYear() &&
        dt.getMonth() === selectedMonth.getMonth()
      )
    })

    // Also include any manually-added billing records not in base patient list
    const billingForMonth = allBilling.filter(
      (b) => b.officeId === office.id && b.reconciliationMonth === selectedMonthKey,
    )
    const billingPatientIds = new Set(billingForMonth.map((b) => b.patientId))
    const extraPatients = allPatients.filter(
      (p) => billingPatientIds.has(p.id) && !monthPatients.find((mp) => mp.id === p.id),
    )

    return [...monthPatients, ...extraPatients].map((p) => ({
      patient: p,
      billing: billingForMonth.find((b) => b.patientId === p.id) ?? null,
    }))
  }, [allPatients, allBilling, office.id, selectedMonthKey, selectedMonth])

  const billingFields = monthData.map((r) => (r.billing?.fields as BillingFields) ?? {})
  const ppFee = calcPPFee(billingFields)
  const firstApptTotal = calcFirstApptBilling(billingFields)
  const secondApptTotal = calcSecondApptBilling(billingFields)
  const completionPct = monthCompletionPercent(billingFields)
  const attendedCount = billingFields.filter((f) => (f.attendedAppt ?? f.attended) === 'yes').length

  // Update a single field in a billing record
  const updateField = useCallback(
    async (patientId: string, patch: Partial<BillingFields>) => {
      const existing = monthData.find((r) => r.patient.id === patientId)
      const currentFields = (existing?.billing?.fields as BillingFields) ?? {}
      const newFields = { ...currentFields, ...patch }
      try {
        await upsertBillingRecord({
          patientId,
          officeKey: office.key,
          reconciliationMonth: selectedMonthKey,
          fields: newFields,
        })
      } catch {
        toast.error('Failed to save reconciliation record.')
      }
    },
    [monthData, office.key, selectedMonthKey],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor((r) => patientFullName(r.patient), {
        id: 'patient',
        header: 'Patient',
        cell: ({ row }) => (
          <div className="min-w-36">
            <div className="text-xs font-bold text-foreground">{patientFullName(row.original.patient)}</div>
            <div className="text-[10.5px] text-muted-foreground">
              {patientApptDate(row.original.patient)} {patientApptTime(row.original.patient)}
            </div>
          </div>
        ),
      }),
      columnHelper.display({
        id: 'attended',
        header: 'Attended',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const val = f.attendedAppt ?? f.attended
          const id = row.original.patient.id
          return (
            <div className="flex gap-1">
              {(['yes', 'no', 'pending'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => updateField(id, { attendedAppt: v })}
                  className={cn(
                    'px-2 py-0.5 rounded text-[10px] font-bold border capitalize transition-colors',
                    val === v
                      ? v === 'yes' ? 'bg-pp-success border-pp-success text-white'
                        : v === 'no' ? 'bg-destructive border-destructive text-white'
                        : 'bg-pp-orange border-pp-orange text-white'
                      : 'border-border text-muted-foreground hover:border-primary',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'firstApptBilling',
        header: '1st Appt $',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const id = row.original.patient.id
          return (
            <input
              type="text"
              defaultValue={f.firstApptBilling ?? f.amountBilled ?? ''}
              onBlur={(e) => updateField(id, { firstApptBilling: e.target.value })}
              placeholder="$0"
              className="w-20 h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none"
            />
          )
        },
      }),
      columnHelper.display({
        id: 'secondAppt',
        header: '2nd Appt',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const id = row.original.patient.id
          return (
            <div className="space-y-1">
              <input
                type="date"
                defaultValue={f.secondApptDate ?? ''}
                onBlur={(e) => updateField(id, { secondApptDate: e.target.value })}
                className="w-32 h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none"
              />
              <input
                type="text"
                defaultValue={f.secondApptBilling ?? ''}
                onBlur={(e) => updateField(id, { secondApptBilling: e.target.value })}
                placeholder="$0"
                className="w-20 h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none"
              />
            </div>
          )
        },
      }),
      columnHelper.display({
        id: 'newApptDate',
        header: 'Rescheduled To',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const id = row.original.patient.id
          const attended = f.attendedAppt ?? f.attended
          if (attended !== 'pending') return <span className="text-xs text-muted-foreground">—</span>
          return (
            <input
              type="date"
              defaultValue={f.newApptDate ?? ''}
              onBlur={(e) => updateField(id, { newApptDate: e.target.value })}
              className="w-32 h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none"
            />
          )
        },
      }),
      columnHelper.display({
        id: 'contactType',
        header: 'Contact Type',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const id = row.original.patient.id
          return (
            <select
              defaultValue={f.contactType ?? ''}
              onBlur={(e) => updateField(id, { contactType: e.target.value })}
              className="h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none bg-white"
            >
              <option value="">Select…</option>
              {CONTACT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )
        },
      }),
      columnHelper.display({
        id: 'notes',
        header: 'Notes',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const id = row.original.patient.id
          return (
            <input
              type="text"
              defaultValue={f.notes ?? ''}
              onBlur={(e) => updateField(id, { notes: e.target.value })}
              placeholder="Note..."
              className="w-40 h-7 px-2 text-xs border border-border rounded focus:border-primary outline-none"
            />
          )
        },
      }),
      columnHelper.display({
        id: 'status',
        header: 'Complete',
        cell: ({ row }) => {
          const f = (row.original.billing?.fields as BillingFields) ?? {}
          const done = billIsCardComplete(f)
          return (
            <span
              className={cn(
                'text-xs font-bold px-2 py-0.5 rounded-full',
                done ? 'bg-pp-success-light text-pp-success' : 'bg-pp-orange-light text-pp-orange',
              )}
            >
              {done ? '✓' : '○'}
            </span>
          )
        },
      }),
    ],
    [updateField],
  )

  const table = useReactTable({
    data: monthData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-7 space-y-6">
      {/* Breadcrumb + month nav */}
      <div className="flex items-center gap-3">
        <Link href="/reconciliation" className="text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> Reconciliation
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          {office.name}
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => setMonthIdx((i) => Math.min(i + 1, months.length - 1))} className="p-1.5 rounded hover:bg-accent">
            <ChevronLeft size={14} className="text-secondary-foreground" />
          </button>
          <span className="text-sm font-bold text-foreground min-w-32 text-center">
            {monthLabel(selectedMonth)}
          </span>
          <button onClick={() => setMonthIdx((i) => Math.max(i - 1, 0))} disabled={monthIdx === 0} className="p-1.5 rounded hover:bg-accent disabled:opacity-40">
            <ChevronRight size={14} className="text-secondary-foreground" />
          </button>
          <Link href={`/reconciliation/${office.key}/year`} className="ml-2 text-xs font-semibold text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-accent">
            Full Year
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { label: 'Patients', value: monthData.length },
          { label: 'Attended', value: attendedCount },
          { label: 'PP Fees', value: `$${ppFee.toLocaleString()}` },
          { label: '1st Appt', value: `$${firstApptTotal.toLocaleString()}` },
          { label: '2nd Appt', value: `$${secondApptTotal.toLocaleString()}` },
          { label: 'Complete', value: `${completionPct}%` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-border shadow-sm p-3 text-center">
            <div className="text-lg font-extrabold text-foreground">{value}</div>
            <div className="text-[10px] text-muted-foreground font-semibold mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-secondary-foreground">Reconciliation Progress</span>
          <span className={cn('text-sm font-bold', completionPct === 100 ? 'text-pp-success' : 'text-pp-orange')}>
            {completionPct}%
          </span>
        </div>
        <div className="h-3 bg-accent rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${completionPct}%`,
              backgroundColor: completionPct === 100 ? colors.success : color,
            }}
          />
        </div>
      </div>

      {/* Reconciliation grid */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="section-card-header px-5 py-3.5 flex items-center gap-2">
          <span className="text-sm font-bold text-white">{office.name} — {monthLabel(selectedMonth)}</span>
          <span className="ml-auto text-xs text-white/70">{monthData.length} patients</span>
        </div>
        {monthData.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">
            <p>No patients with appointments in {monthLabel(selectedMonth)}.</p>
            <p className="text-xs mt-1">Patients appear here when their appointment date falls in this month.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-border bg-muted">
                    {hg.headers.map((h) => (
                      <th key={h.id} className="text-left text-[10.5px] font-bold text-muted-foreground uppercase tracking-wider px-3 py-2.5 whitespace-nowrap">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-muted hover:bg-pp-hover-subtle">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

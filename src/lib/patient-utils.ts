import type { patients, offices, billingReconciliation } from '@/db/schema'
import { OFFICE_COLORS } from '@/lib/offices'
import { officeFallbackColor } from '@/lib/design-tokens'

export type Patient = typeof patients.$inferSelect
export type Office = typeof offices.$inferSelect
export type BillingRec = typeof billingReconciliation.$inferSelect

export function patientFullName(p: Patient): string {
  const { firstName, lastName } = (p.patient as { firstName?: string; lastName?: string }) ?? {}
  return [firstName, lastName].filter(Boolean).join(' ') || 'Unknown Patient'
}

export function patientPhone(p: Patient): string {
  return (p.patient as { phone?: string })?.phone ?? ''
}

export function patientEmail(p: Patient): string {
  return (p.patient as { email?: string })?.email ?? ''
}

export function patientIsBooked(p: Patient): boolean {
  return (p.booking as { booked?: string })?.booked === 'yes'
}

export function patientApptDate(p: Patient): string {
  return (p.booking as { apptDate?: string })?.apptDate ?? ''
}

export function patientApptTime(p: Patient): string {
  return (p.booking as { apptTime?: string })?.apptTime ?? ''
}

export function patientIsNew(p: Patient): boolean {
  return (p.patient as { newPatient?: string })?.newPatient === 'Yes'
}

export function getOfficeColor(officeKey: string): string {
  return OFFICE_COLORS[officeKey as keyof typeof OFFICE_COLORS] ?? officeFallbackColor
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dt: Date | string): string {
  const d = typeof dt === 'string' ? new Date(dt) : dt
  return d.toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

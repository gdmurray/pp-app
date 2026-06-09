/**
 * Pure billing business logic ported from HTML reconciliation JS.
 * Keep these functions pure/tested — no React, no DB calls.
 */

import type { BillingFields } from '@/db/schema'

// PP billing started May 2026
export const BILL_START = new Date('2026-05-01')
export const PP_FEE_PER_APPT = 150

/**
 * Get the first day of month N months ago (0 = current month).
 */
export function monthStart(offset = 0): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  d.setMonth(d.getMonth() - offset)
  return d
}

/**
 * Format a Date as 'YYYY-MM-DD' (ISO date, first of month).
 */
export function toMonthKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Human-readable month label, e.g. "June 2026".
 */
export function monthLabel(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Parse a reconciliation_month date string to a Date.
 */
export function parseMonth(monthStr: string): Date {
  return new Date(monthStr + 'T00:00:00')
}

/**
 * Determines whether a reconciliation card is "complete" per HTML billIsCardComplete().
 * - no/pending → complete immediately (no billing needed)
 * - pending → needs newApptDate
 * - yes → needs firstApptBilling
 */
export function billIsCardComplete(fields: BillingFields): boolean {
  const attended = fields.attendedAppt ?? fields.attended
  if (!attended) return false
  if (attended === 'no') return true
  if (attended === 'pending') return !!(fields.newApptDate && fields.newApptDate !== '')
  if (attended === 'yes') return !!(fields.firstApptBilling && parseFloat(fields.firstApptBilling) > 0)
  return false
}

/**
 * Calculate PP fee for a month based on attended records.
 * $150 × (number of attended = 'yes' records).
 */
export function calcPPFee(billingFields: BillingFields[]): number {
  return billingFields.filter(
    (f) => (f.attendedAppt ?? f.attended) === 'yes',
  ).length * PP_FEE_PER_APPT
}

/**
 * Calculate total 1st-appt billing for a month.
 */
export function calcFirstApptBilling(billingFields: BillingFields[]): number {
  return billingFields.reduce((sum, f) => {
    const amt = parseFloat(f.firstApptBilling ?? f.amountBilled ?? '0')
    return sum + (isNaN(amt) ? 0 : amt)
  }, 0)
}

/**
 * Calculate total 2nd-appt billing for a month.
 */
export function calcSecondApptBilling(billingFields: BillingFields[]): number {
  return billingFields.reduce((sum, f) => {
    const amt = parseFloat(f.secondApptBilling ?? '0')
    return sum + (isNaN(amt) ? 0 : amt)
  }, 0)
}

/**
 * Month completion percentage: how many cards are complete vs total.
 */
export function monthCompletionPercent(billingFields: BillingFields[]): number {
  if (billingFields.length === 0) return 100
  const done = billingFields.filter(billIsCardComplete).length
  return Math.round((done / billingFields.length) * 100)
}

/**
 * Get list of all months since BILL_START up to current month, descending.
 */
export function getBillingMonths(): Date[] {
  const months: Date[] = []
  const now = monthStart()
  const cursor = new Date(BILL_START)
  cursor.setDate(1)
  while (cursor <= now) {
    months.unshift(new Date(cursor))
    cursor.setMonth(cursor.getMonth() + 1)
  }
  return months
}

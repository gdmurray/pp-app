import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db } from '@/db'
import { patients, offices, billingReconciliation } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { isApiAuthenticated } from '@/lib/auth'
import { patientFullName, patientApptDate } from '@/lib/patient-utils'
import { monthLabel, parseMonth } from '@/lib/billing/billing-logic'
import type { BillingFields } from '@/db/schema'

export async function GET(req: NextRequest) {
  if (!(await isApiAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const officeId = searchParams.get('office')
  const month = searchParams.get('month') // e.g. '2026-06-01'

  const allOffices = await db.select().from(offices)
  const targetOffice = officeId ? allOffices.find((o) => o.id === officeId) : null

  const billingQuery = db.select().from(billingReconciliation)
  const allBilling = await billingQuery

  const allPatients = await db.select().from(patients).orderBy(desc(patients.recordedAt))
  const patientMap = new Map(allPatients.map((p) => [p.id, p]))
  const officeMap = new Map(allOffices.map((o) => [o.id, o]))

  const filteredBilling = allBilling.filter((b) => {
    if (targetOffice && b.officeId !== targetOffice.id) return false
    if (month && b.reconciliationMonth !== month) return false
    return true
  })

  const rows = filteredBilling.map((b) => {
    const p = patientMap.get(b.patientId)
    const office = officeMap.get(b.officeId)
    const f = b.fields as BillingFields
    return {
      'Office': office?.name ?? '',
      'Month': monthLabel(parseMonth(b.reconciliationMonth)),
      'Patient': p ? patientFullName(p) : b.patientId,
      'Appt Date': p ? patientApptDate(p) : '',
      'Attended': f.attendedAppt ?? f.attended ?? '',
      '1st Appt Billing': f.firstApptBilling ?? f.amountBilled ?? '',
      '2nd Appt Date': f.secondApptDate ?? '',
      '2nd Appt Billing': f.secondApptBilling ?? '',
      '90-Day Billing': f.ninetyDayBilling ?? '',
      'Contact Type': f.contactType ?? '',
      'Rescheduled To': f.newApptDate ?? '',
      'Notes': f.notes ?? '',
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Reconciliation')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  const filename = [
    'reconciliation',
    officeId,
    month,
    new Date().toISOString().slice(0, 10),
  ].filter(Boolean).join('-') + '.xlsx'

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}

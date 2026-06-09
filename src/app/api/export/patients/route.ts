import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import { db } from '@/db'
import { patients, offices } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'
import { isApiAuthenticated } from '@/lib/auth'
import {
  patientFullName, patientPhone, patientEmail,
  patientIsBooked, patientApptDate, patientApptTime, patientIsNew,
} from '@/lib/patient-utils'

export async function GET(req: NextRequest) {
  if (!(await isApiAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const allPatients = await db.select().from(patients).orderBy(desc(patients.recordedAt))
  const allOffices = await db.select().from(offices)
  const officeMap = new Map(allOffices.map((o) => [o.id, o]))

  const rows = allPatients.map((p) => {
    const office = officeMap.get(p.officeId)
    const booking = p.booking as { procedures?: string[]; priceQuoted?: string; reasonNotBooked?: string }
    return {
      'Patient Name': patientFullName(p),
      'Office': office?.name ?? '',
      'Phone': patientPhone(p),
      'Email': patientEmail(p),
      'New Patient': patientIsNew(p) ? 'Yes' : 'No',
      'Status': patientIsBooked(p) ? 'Booked' : 'Not Booked',
      'Appt Date': patientApptDate(p),
      'Appt Time': patientApptTime(p),
      'Procedures': booking?.procedures?.join(', ') ?? '',
      'Price Quoted': booking?.priceQuoted ?? '',
      'Reason Not Booked': booking?.reasonNotBooked ?? '',
      'Recorded At': new Date(p.recordedAt).toLocaleString(),
    }
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Patients')

  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="patients-${new Date().toISOString().slice(0, 10)}.xlsx"`,
    },
  })
}

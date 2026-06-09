'use server'

import { db } from '@/db'
import { patients, offices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type {
  PatientInfo, DiscoveryInfo, BookingInfo, FinancialInfo,
  MedicalInfo, ConclusionInfo, CallNotes, InquiryEntry,
} from '@/db/schema'
import { revalidatePath } from 'next/cache'

export type PatientFormData = {
  officeKey: string
  patient: PatientInfo
  discovery: DiscoveryInfo
  booking: BookingInfo
  financial: FinancialInfo
  medical: MedicalInfo
  conclusion: ConclusionInfo
  callNotes: CallNotes
  inquiries: InquiryEntry[]
}

export async function savePatient(data: PatientFormData, existingId?: string) {
  const [office] = await db.select({ id: offices.id }).from(offices).where(eq(offices.key, data.officeKey)).limit(1)
  if (!office) throw new Error(`Office not found: ${data.officeKey}`)

  if (existingId) {
    await db
      .update(patients)
      .set({
        officeId: office.id,
        patient: data.patient,
        discovery: data.discovery,
        booking: data.booking,
        financial: data.financial,
        medical: data.medical,
        conclusion: data.conclusion,
        callNotes: data.callNotes,
        inquiries: data.inquiries,
        updatedAt: new Date(),
      })
      .where(eq(patients.id, existingId))
  } else {
    await db.insert(patients).values({
      officeId: office.id,
      patient: data.patient,
      discovery: data.discovery,
      booking: data.booking,
      financial: data.financial,
      medical: data.medical,
      conclusion: data.conclusion,
      callNotes: data.callNotes,
      inquiries: data.inquiries,
    })
  }

  revalidatePath('/patients')
  revalidatePath('/')
}

export async function deletePatient(id: string) {
  await db.delete(patients).where(eq(patients.id, id))
  revalidatePath('/patients')
  revalidatePath('/')
}

export async function getPatientById(id: string) {
  const [p] = await db.select().from(patients).where(eq(patients.id, id)).limit(1)
  return p ?? null
}

'use server'

import { db } from '@/db'
import { billingReconciliation, offices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { BillingFields } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function upsertBillingRecord({
  patientId,
  officeId,
  reconciliationMonth,
  fields,
}: {
  patientId: string
  officeId: string
  reconciliationMonth: string
  fields: BillingFields
}) {
  const [office] = await db
    .select({ id: offices.id })
    .from(offices)
    .where(eq(offices.id, officeId))
    .limit(1)
  if (!office) throw new Error(`Office not found: ${officeId}`)

  await db
    .insert(billingReconciliation)
    .values({
      patientId,
      officeId: office.id,
      reconciliationMonth,
      fields,
    })
    .onConflictDoUpdate({
      target: [
        billingReconciliation.patientId,
        billingReconciliation.officeId,
        billingReconciliation.reconciliationMonth,
      ],
      set: { fields, updatedAt: new Date() },
    })

  revalidatePath('/reconciliation')
  revalidatePath('/billing')
  revalidatePath('/')
}

export async function deleteBillingRecord(id: string) {
  await db.delete(billingReconciliation).where(eq(billingReconciliation.id, id))
  revalidatePath('/reconciliation')
}

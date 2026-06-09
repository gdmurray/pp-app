'use server'

import { db } from '@/db'
import { billingReconciliation, patients, offices } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import type { BillingFields } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function upsertBillingRecord({
  patientId,
  officeKey,
  reconciliationMonth,
  fields,
}: {
  patientId: string
  officeKey: string
  reconciliationMonth: string
  fields: BillingFields
}) {
  const [office] = await db
    .select({ id: offices.id })
    .from(offices)
    .where(eq(offices.key, officeKey))
    .limit(1)
  if (!office) throw new Error(`Office not found: ${officeKey}`)

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

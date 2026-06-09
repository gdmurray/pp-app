export const dynamic = 'force-dynamic'
import { ReconciliationFullYear } from '@/components/reconciliation/reconciliation-full-year'
import { db } from '@/db'
import { patients, billingReconciliation, offices } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'

async function getData(officeKey: string) {
  const [office] = await db.select().from(offices).where(eq(offices.key, officeKey))
  if (!office) notFound()

  const [allPatients, allBilling] = await Promise.all([
    db.select().from(patients).where(eq(patients.officeId, office.id)).orderBy(desc(patients.recordedAt)),
    db.select().from(billingReconciliation).where(eq(billingReconciliation.officeId, office.id)),
  ])
  return { office, allPatients, allBilling }
}

export default async function ReconciliationYearPage({
  params,
}: {
  params: Promise<{ officeKey: string }>
}) {
  const { officeKey } = await params
  const data = await getData(officeKey)
  return <ReconciliationFullYear {...data} />
}

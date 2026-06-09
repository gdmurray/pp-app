export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ReconciliationDetail } from '@/components/reconciliation/reconciliation-detail'
import { db } from '@/db'
import { patients, billingReconciliation, offices, calls } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

async function ReconciliationDetailContent({ officeId }: { officeId: string }) {
  const [office] = await db.select().from(offices).where(eq(offices.id, officeId))
  if (!office) notFound()

  const [allPatients, allBilling, allCalls] = await Promise.all([
    db.select().from(patients).where(eq(patients.officeId, office.id)).orderBy(desc(patients.recordedAt)),
    db.select().from(billingReconciliation).where(eq(billingReconciliation.officeId, office.id)),
    db.select().from(calls).where(eq(calls.officeId, office.id)),
  ])
  return <ReconciliationDetail office={office} allPatients={allPatients} allBilling={allBilling} allCalls={allCalls} />
}

export default async function ReconciliationDetailPage({
  params,
}: {
  params: Promise<{ officeId: string }>
}) {
  const { officeId } = await params
  return (
    <Suspense fallback={<div className="p-7"><Skeleton className="h-[600px] rounded-xl" /></div>}>
      <ReconciliationDetailContent officeId={officeId} />
    </Suspense>
  )
}

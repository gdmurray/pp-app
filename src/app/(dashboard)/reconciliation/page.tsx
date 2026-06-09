export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { ReconciliationHome } from '@/components/reconciliation/reconciliation-home'
import { db } from '@/db'
import { patients, billingReconciliation, offices, calls } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function ReconciliationContent() {
  const [allPatients, allBilling, allOffices, allCalls] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(billingReconciliation),
    db.select().from(offices),
    db.select().from(calls),
  ])
  return <ReconciliationHome allPatients={allPatients} allBilling={allBilling} allOffices={allOffices} allCalls={allCalls} />
}

export default function ReconciliationPage() {
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>}>
      <ReconciliationContent />
    </Suspense>
  )
}

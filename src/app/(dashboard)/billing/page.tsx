export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { BillingOverview } from '@/components/billing/billing-overview'
import { db } from '@/db'
import { patients, billingReconciliation, offices } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function BillingContent() {
  const [allPatients, allBilling, allOffices] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(billingReconciliation),
    db.select().from(offices),
  ])
  return <BillingOverview allPatients={allPatients} allBilling={allBilling} allOffices={allOffices} />
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>}>
      <BillingContent />
    </Suspense>
  )
}

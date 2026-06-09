export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { HomeDashboard } from '@/components/home/home-dashboard'
import { db } from '@/db'
import { patients, calls, billingReconciliation, offices } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function HomeContent() {
  const [allPatients, allOffices, allCalls, allBilling] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(offices),
    db.select().from(calls).orderBy(desc(calls.recordedAt)),
    db.select().from(billingReconciliation),
  ])
  return <HomeDashboard allPatients={allPatients} allOffices={allOffices} allCalls={allCalls} allBilling={allBilling} />
}

function HomeSkeleton() {
  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  )
}

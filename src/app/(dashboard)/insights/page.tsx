export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { InsightsDashboard } from '@/components/insights/insights-dashboard'
import { db } from '@/db'
import { patients, calls, offices } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function InsightsContent() {
  const [allPatients, allCalls, allOffices] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(calls).orderBy(desc(calls.recordedAt)),
    db.select().from(offices),
  ])
  return <InsightsDashboard allPatients={allPatients} allCalls={allCalls} allOffices={allOffices} />
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-20 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>}>
      <InsightsContent />
    </Suspense>
  )
}

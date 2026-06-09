export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { db } from '@/db'
import { patients, calls, offices } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function CalendarContent() {
  const [allPatients, allCalls, allOffices] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(calls).orderBy(desc(calls.recordedAt)),
    db.select().from(offices),
  ])
  return <CalendarView allPatients={allPatients} allCalls={allCalls} allOffices={allOffices} />
}

export default function CalendarPage() {
  return (
    <Suspense fallback={<div className="p-7"><Skeleton className="h-[600px] rounded-xl" /></div>}>
      <CalendarContent />
    </Suspense>
  )
}

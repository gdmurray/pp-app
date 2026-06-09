export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { PatientsView } from '@/components/patients/patients-view'
import { db } from '@/db'
import { patients, offices, billingReconciliation } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { Skeleton } from '@/components/ui/skeleton'

async function PatientsContent() {
  const [allPatients, allOffices, allBilling] = await Promise.all([
    db.select().from(patients).orderBy(desc(patients.recordedAt)),
    db.select().from(offices),
    db.select().from(billingReconciliation),
  ])
  return <PatientsView allPatients={allPatients} allOffices={allOffices} allBilling={allBilling} />
}

export default function PatientsPage() {
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-12 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>}>
      <PatientsContent />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { OfficeProfile } from '@/components/offices/office-profile'
import { db } from '@/db'
import { offices, patients, calls } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Skeleton } from '@/components/ui/skeleton'

async function OfficeProfileContent({ officeKey }: { officeKey: string }) {
  const [office] = await db.select().from(offices).where(eq(offices.key, officeKey))
  if (!office) notFound()

  const [officePatients, officeCalls] = await Promise.all([
    db.select().from(patients).where(eq(patients.officeId, office.id)).orderBy(desc(patients.recordedAt)),
    db.select().from(calls).where(eq(calls.officeId, office.id)).orderBy(desc(calls.recordedAt)),
  ])
  return <OfficeProfile office={office} officePatients={officePatients} officeCalls={officeCalls} />
}

export default async function OfficeProfilePage({
  params,
}: {
  params: Promise<{ officeKey: string }>
}) {
  const { officeKey } = await params
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-24 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>}>
      <OfficeProfileContent officeKey={officeKey} />
    </Suspense>
  )
}

export const dynamic = 'force-dynamic'

import { Suspense } from 'react'
import { OnboardingView } from '@/components/onboarding/onboarding-view'
import { db } from '@/db'
import { offices } from '@/db/schema'
import { Skeleton } from '@/components/ui/skeleton'

async function OnboardingContent({ editPatientId }: { editPatientId?: string }) {
  const allOffices = await db.select().from(offices)
  return <OnboardingView offices={allOffices} editPatientId={editPatientId} />
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ edit?: string }>
}) {
  const params = await searchParams
  return (
    <Suspense fallback={<div className="p-7 space-y-4"><Skeleton className="h-16 rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div>}>
      <OnboardingContent editPatientId={params.edit} />
    </Suspense>
  )
}

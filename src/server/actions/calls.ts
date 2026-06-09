'use server'

import { db } from '@/db'
import { calls, offices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { CallPayload } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function logCall({
  type,
  officeKey,
  payload,
}: {
  type: 'missed' | 'no_lead'
  officeKey: string
  payload: CallPayload
}) {
  const [office] = await db
    .select({ id: offices.id })
    .from(offices)
    .where(eq(offices.key, officeKey))
    .limit(1)

  if (!office) throw new Error(`Office not found: ${officeKey}`)

  await db.insert(calls).values({
    officeId: office.id,
    type,
    payload,
  })

  revalidatePath('/insights')
  revalidatePath('/calendar')
}

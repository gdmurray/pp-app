'use server'

import { db } from '@/db'
import { offices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { OfficeProfile } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export async function updateOfficeProfile(officeKey: string, profile: OfficeProfile) {
  await db
    .update(offices)
    .set({ profile, updatedAt: new Date() })
    .where(eq(offices.key, officeKey))
  revalidatePath(`/offices/${officeKey}`)
  revalidatePath('/offices')
}

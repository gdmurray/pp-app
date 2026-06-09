'use server'

import { db } from '@/db'
import { offices } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { OfficeProfile } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import {
  colorFromName,
  generateOfficeAbbr,
  isValidOfficeHexColor,
  slugifyOfficeKey,
} from '@/lib/offices'

export async function updateOffice(
  officeKey: string,
  data: {
    profile?: OfficeProfile
    color?: string | null
    name?: string
  },
) {
  const updates: {
    profile?: OfficeProfile
    color?: string
    name?: string
    updatedAt: Date
  } = { updatedAt: new Date() }

  if (data.profile !== undefined) updates.profile = data.profile
  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.color !== undefined) {
    const trimmed = data.color?.trim() ?? ''
    if (trimmed && !isValidOfficeHexColor(trimmed)) {
      throw new Error('Invalid office color. Use a 6-digit hex value like #3A86C8.')
    }
    updates.color = trimmed
  }

  await db.update(offices).set(updates).where(eq(offices.key, officeKey))

  revalidatePath(`/offices/${officeKey}`)
  revalidatePath('/offices')
}

/** @deprecated Use updateOffice — kept for existing call sites during migration */
export async function updateOfficeProfile(officeKey: string, profile: OfficeProfile) {
  await updateOffice(officeKey, { profile })
}

export async function createOffice(data: { name: string; color?: string | null }) {
  const name = data.name.trim()
  if (!name) throw new Error('Office name is required.')

  const baseKey = slugifyOfficeKey(name)
  if (!baseKey) throw new Error('Could not generate an office key from that name.')

  let key = baseKey
  let suffix = 2
  while (true) {
    const existing = await db
      .select({ id: offices.id })
      .from(offices)
      .where(eq(offices.key, key))
      .limit(1)
    if (existing.length === 0) break
    key = `${baseKey}-${suffix}`
    suffix++
  }

  const trimmedColor = data.color?.trim() ?? ''
  if (trimmedColor && !isValidOfficeHexColor(trimmedColor)) {
    throw new Error('Invalid office color. Use a 6-digit hex value like #3A86C8.')
  }

  const [office] = await db
    .insert(offices)
    .values({
      key,
      name,
      abbr: generateOfficeAbbr(name),
      color: trimmedColor,
      profile: {},
    })
    .returning()

  revalidatePath('/offices')
  return office
}

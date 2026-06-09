import { colors } from '@/lib/design-tokens'

export const OFFICE_COLORS = colors.office

export const OFFICE_KEYS = ['sunset', 'mountain', 'crown'] as const
export type OfficeKey = typeof OFFICE_KEYS[number]

export const OFFICE_NAMES: Record<OfficeKey, string> = {
  sunset: 'Sunset Dental',
  mountain: 'Mountain Dental',
  crown: 'Crown Dental',
}

export const OFFICE_ABBRS: Record<OfficeKey, string> = {
  sunset: 'SD',
  mountain: 'MD',
  crown: 'CD',
}

export const OFFICES = OFFICE_KEYS.map((key) => ({
  key,
  name: OFFICE_NAMES[key],
  abbr: OFFICE_ABBRS[key],
  color: OFFICE_COLORS[key],
}))

export function officeKeyFromName(name: string): OfficeKey | null {
  const entry = Object.entries(OFFICE_NAMES).find(([, n]) => n === name)
  return entry ? (entry[0] as OfficeKey) : null
}

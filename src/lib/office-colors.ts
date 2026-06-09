import { colors, officeFallbackColor } from '@/lib/design-tokens'

const HEX_COLOR_RE = /^#[0-9A-Fa-f]{6}$/

export function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function colorFromName(name: string): string {
  const normalized = name.trim().toLowerCase()
  if (!normalized) return officeFallbackColor
  const palette = colors.officePalette
  return palette[hashString(normalized) % palette.length]
}

export type OfficeColorSource = {
  name: string
  color?: string | null
}

/** Custom hex on the office row wins; otherwise derive from the practice name. */
export function resolveOfficeColor(office: OfficeColorSource): string {
  const custom = office.color?.trim()
  if (custom && HEX_COLOR_RE.test(custom)) return custom
  return colorFromName(office.name)
}

export function isValidOfficeHexColor(value: string): boolean {
  return HEX_COLOR_RE.test(value.trim())
}

export function slugifyOfficeKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function generateOfficeAbbr(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '??'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return words
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

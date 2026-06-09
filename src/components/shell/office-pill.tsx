'use client'

import { OFFICE_COLORS } from '@/lib/offices'
import { officeFallbackColor } from '@/lib/design-tokens'

interface OfficePillProps {
  officeName: string
  officeKey: string
}

export function OfficePill({ officeName, officeKey }: OfficePillProps) {
  const color = OFFICE_COLORS[officeKey as keyof typeof OFFICE_COLORS] ?? officeFallbackColor

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-white text-sm font-semibold text-foreground">
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />
      {officeName}
    </div>
  )
}

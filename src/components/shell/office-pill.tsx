'use client'

import { resolveOfficeColor } from '@/lib/offices'

interface OfficePillProps {
  officeName: string
  officeColor?: string | null
}

export function OfficePill({ officeName, officeColor }: OfficePillProps) {
  const color = resolveOfficeColor({ name: officeName, color: officeColor })

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

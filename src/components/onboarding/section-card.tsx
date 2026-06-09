'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  number: number
  title: string
  locked: boolean
  officeColor?: string
  children: React.ReactNode
}

export function SectionCard({ number, title, locked, officeColor, children }: SectionCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-border overflow-hidden transition-opacity',
        locked && 'opacity-50 pointer-events-none',
      )}
    >
      <button
        type="button"
        className="w-full text-left section-card-header px-5 py-3.5 flex items-center gap-3 focus:outline-none"
        style={officeColor ? { backgroundColor: officeColor } : {}}
        onClick={() => setExpanded((e) => !e)}
        disabled={locked}
      >
        <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-black text-white shrink-0">
          {number}
        </span>
        <span className="text-sm font-bold text-white flex-1">{title}</span>
        {expanded ? (
          <ChevronUp size={15} className="text-white/60" />
        ) : (
          <ChevronDown size={15} className="text-white/60" />
        )}
      </button>
      {expanded && <div className="p-5">{children}</div>}
    </div>
  )
}

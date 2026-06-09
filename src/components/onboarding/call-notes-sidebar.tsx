'use client'

import { useState } from 'react'
import { ChevronRight, StickyNote } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useTypedAppFormContext, FORM_OPTIONS } from './form-hook'
import type { CallNotes } from '@/db/schema'

const NOTE_SECTIONS: Array<{ key: keyof CallNotes; label: string }> = [
  { key: 'patientInfo', label: 'Patient Information' },
  { key: 'discovery',   label: 'Discovery' },
  { key: 'booking',     label: 'Booking' },
  { key: 'financial',   label: 'Financial' },
  { key: 'medical',     label: 'Medical' },
  { key: 'inquiry',     label: 'Inquiry' },
  { key: 'conclusion',  label: 'Conclusion' },
]

export function CallNotesSidebar() {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div
      className={cn(
        'shrink-0 bg-white border-l border-border flex flex-col transition-[width] duration-200',
        collapsed ? 'w-9' : 'w-64',
      )}
    >
      <button
        type="button"
        className="flex items-center gap-2 px-3 py-3 border-b border-border hover:bg-muted transition-colors w-full"
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? 'Show call notes' : 'Collapse call notes'}
      >
        <StickyNote size={15} className="text-muted-foreground shrink-0" />
        {!collapsed && (
          <span className="text-xs font-semibold text-secondary-foreground flex-1">Call Notes</span>
        )}
        <ChevronRight
          size={13}
          className={cn(
            'text-muted-foreground transition-transform duration-200 ml-auto',
            !collapsed && 'rotate-180',
          )}
        />
      </button>

      {!collapsed && (
        <form.Subscribe selector={(s) => s.values.callNotes ?? {}}>
          {(notes) => (
            <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
              {NOTE_SECTIONS.map(({ key, label }) => (
                <div key={key}>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1 px-0.5">
                    {label}
                  </p>
                  <Textarea
                    rows={2}
                    value={notes[key] ?? ''}
                    placeholder={`Notes for ${label.toLowerCase()}…`}
                    className="text-xs resize-none border-border focus:border-primary placeholder:text-pp-placeholder"
                    onChange={(e) =>
                      form.setFieldValue(`callNotes.${key}`, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </form.Subscribe>
      )}
    </div>
  )
}

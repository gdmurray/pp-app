'use client'

import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

interface YnToggleProps {
  value: string | undefined | null
  onChange: (v: 'yes' | 'no') => void
  disabled?: boolean
  yesLabel?: string
  noLabel?: string
}

export function YnToggle({ value, onChange, disabled, yesLabel = 'Yes', noLabel = 'No' }: YnToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border overflow-hidden', disabled && 'opacity-50 pointer-events-none')}>
      <Toggle
        type="button"
        pressed={value === 'yes'}
        onPressedChange={(p) => { if (p) onChange('yes') }}
        disabled={disabled}
        className={cn(
          'rounded-none border-r border-border px-4 py-1.5 text-sm font-semibold transition-colors',
          value === 'yes'
            ? 'bg-pp-success text-white hover:bg-pp-success data-[state=on]:bg-pp-success data-[state=on]:text-white'
            : 'bg-white text-secondary-foreground hover:bg-muted data-[state=off]:bg-white',
        )}
      >
        {yesLabel}
      </Toggle>
      <Toggle
        type="button"
        pressed={value === 'no'}
        onPressedChange={(p) => { if (p) onChange('no') }}
        disabled={disabled}
        className={cn(
          'rounded-none px-4 py-1.5 text-sm font-semibold transition-colors',
          value === 'no'
            ? 'bg-destructive text-white hover:bg-destructive data-[state=on]:bg-destructive data-[state=on]:text-white'
            : 'bg-white text-secondary-foreground hover:bg-muted data-[state=off]:bg-white',
        )}
      >
        {noLabel}
      </Toggle>
    </div>
  )
}

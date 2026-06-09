'use client'

import { useStore } from '@tanstack/react-form'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { PatientFormData } from '@/server/actions/patients'
import type { Office } from '@/lib/patient-utils'
import type { ConclusionInfo } from '@/db/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

const CHECKLIST: Array<{ key: keyof ConclusionInfo; label: string }> = [
  { key: 'locationConfirmed',  label: 'Confirmed location and directions' },
  { key: 'cancellationPolicy', label: 'Reiterated cancellation policy (48 hours)' },
  { key: 'reiteratedTime',     label: 'Reiterated appointment time' },
  { key: 'reiteratedDate',     label: 'Reiterated appointment date' },
  { key: 'discussedParking',   label: 'Discussed parking instructions' },
  { key: 'allQuestions',       label: 'Addressed all patient questions' },
  { key: 'officeTour',         label: 'Offered office tour at appointment' },
  { key: 'emailedForms',       label: 'Emailed new patient forms' },
]

export function ConclusionSection({ form, selectedOffice }: { form: AnyForm; selectedOffice?: Office }) {
  const conclusion = (useStore(form.store, (s: any) => s.values.conclusion) as ConclusionInfo) ?? {}

  function toggle(key: keyof ConclusionInfo) {
    form.setFieldValue(`conclusion.${key}`, !conclusion[key])
  }

  const completedCount = CHECKLIST.filter(({ key }) => conclusion[key]).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Complete all items before ending the call.</p>
        <span className={`text-sm font-bold ${completedCount === CHECKLIST.length ? 'text-pp-success' : 'text-pp-orange'}`}>
          {completedCount}/{CHECKLIST.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {CHECKLIST.map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors group"
          >
            <Checkbox
              checked={!!conclusion[key]}
              onCheckedChange={() => toggle(key)}
              className="data-[state=checked]:bg-pp-success data-[state=checked]:border-pp-success"
            />
            <span className={`text-sm font-medium flex-1 ${conclusion[key] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {label}
            </span>
            {conclusion[key] && (
              <span className="text-pp-success text-xs font-bold">✓</span>
            )}
          </label>
        ))}
      </div>

      {/* Office-specific cancellation policy display */}
      {selectedOffice && (
        <div className="bg-accent rounded-lg p-3 border border-pp-blue-mid">
          <p className="text-[10.5px] font-bold text-pp-blue-dark uppercase tracking-wider mb-1.5">
            {selectedOffice.name} Cancellation Policy
          </p>
          <p className="text-xs text-secondary-foreground leading-relaxed">
            {(selectedOffice.profile as { cancellationPolicy?: string })?.cancellationPolicy ??
              'Contact the office for cancellation policy details.'}
          </p>
        </div>
      )}
    </div>
  )
}

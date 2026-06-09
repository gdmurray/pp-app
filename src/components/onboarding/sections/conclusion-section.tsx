'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'
import type { Office } from '@/lib/patient-utils'
import type { ConclusionInfo } from '@/db/schema'

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

export function ConclusionSection({ selectedOffice }: { selectedOffice?: Office }) {
  const form = useTypedAppFormContext(FORM_OPTIONS)

  return (
    <div className="space-y-4">
      <form.Subscribe selector={(s) => s.values.conclusion ?? {}}>
        {(conclusion) => {
          const completedCount = CHECKLIST.filter(({ key }) => conclusion[key]).length
          return (
            <>
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
                    className="flex items-center gap-3 p-3 rounded-lg border border-border cursor-pointer hover:bg-accent transition-colors"
                  >
                    <Checkbox
                      checked={!!conclusion[key]}
                      onCheckedChange={() =>
                        form.setFieldValue(`conclusion.${key}`, !conclusion[key])
                      }
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
            </>
          )
        }}
      </form.Subscribe>

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

'use client'

import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'
import type { Office } from '@/lib/patient-utils'
import type { InquiryEntry } from '@/db/schema'

const DEFAULT_TREATMENTS = [
  'New Patient Exam + X-rays', 'Cleaning / Hygiene', 'Fillings', 'Veneers',
  'Whitening (In-Office)', 'Whitening (Take-Home)', 'Implants', 'Root Canal',
  'Night Guard', 'Invisalign / Braces',
]

export function InquiriesSection({ selectedOffice }: { selectedOffice?: Office }) {
  const form = useTypedAppFormContext(FORM_OPTIONS)

  const profile = (selectedOffice?.profile as Record<string, unknown>) ?? {}
  const treatments = (profile.treatments as Record<string, { offered: boolean; fee: string; notes: string }>) ?? {}
  const offeredNames = Object.entries(treatments).filter(([, v]) => v.offered).map(([k]) => k)
  const treatmentNames = offeredNames.length > 0 ? offeredNames : DEFAULT_TREATMENTS

  return (
    <form.Subscribe selector={(s) => s.values.inquiries ?? []}>
      {(inquiries) => {
        function getEntry(name: string): InquiryEntry | undefined {
          return inquiries.find((i) => i.treatmentName === name)
        }

        function patchEntry(name: string, patch: Partial<InquiryEntry>) {
          const existing = getEntry(name)
          form.setFieldValue(
            'inquiries',
            existing
              ? inquiries.map((i) => (i.treatmentName === name ? { ...i, ...patch } : i))
              : [...inquiries, { treatmentName: name, ...patch }],
          )
        }

        function getFeeHint(name: string): string {
          return Object.entries(treatments).find(([k]) => k === name)?.[1]?.fee ?? ''
        }

        return (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Note any treatments the patient asked about and their interest level.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-48">Treatment</th>
                    <th className="text-center py-2 px-2 font-semibold text-muted-foreground w-28">Interested?</th>
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground w-28">Fee</th>
                    <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {treatmentNames.map((name) => {
                    const entry = getEntry(name)
                    const feeHint = getFeeHint(name)
                    return (
                      <tr key={name} className="border-b border-muted hover:bg-pp-hover-subtle">
                        <td className="py-2 px-2 font-medium text-secondary-foreground capitalize">
                          {name.replace(/([A-Z])/g, ' $1').trim()}
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="inline-flex gap-1">
                            {(['yes', 'no'] as const).map((v) => (
                              <button
                                key={v}
                                type="button"
                                onClick={() => patchEntry(name, { offered: v })}
                                className={cn(
                                  'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors capitalize',
                                  entry?.offered === v
                                    ? v === 'yes'
                                      ? 'bg-pp-success border-pp-success text-white'
                                      : 'bg-destructive border-destructive text-white'
                                    : 'border-border text-muted-foreground hover:border-primary',
                                )}
                              >
                                {v}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            value={entry?.fee ?? feeHint}
                            onChange={(e) => patchEntry(name, { fee: e.target.value })}
                            placeholder={feeHint || 'Fee'}
                            className="h-7 text-xs border-border"
                          />
                        </td>
                        <td className="py-2 px-2">
                          <Input
                            value={entry?.note ?? ''}
                            onChange={(e) => patchEntry(name, { note: e.target.value })}
                            placeholder="Note..."
                            className="h-7 text-xs border-border"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      }}
    </form.Subscribe>
  )
}

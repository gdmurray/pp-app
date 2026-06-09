'use client'

import { useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PatientFormData } from '@/server/actions/patients'
import type { Office } from '@/lib/patient-utils'
import type { InquiryEntry } from '@/db/schema'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

// Default treatments to show when no office profile exists
const DEFAULT_TREATMENTS = [
  'New Patient Exam + X-rays', 'Cleaning / Hygiene', 'Fillings', 'Veneers',
  'Whitening (In-Office)', 'Whitening (Take-Home)', 'Implants', 'Root Canal',
  'Night Guard', 'Invisalign / Braces',
]

export function InquiriesSection({ form, selectedOffice }: { form: AnyForm; selectedOffice?: Office }) {
  const inquiries = (useStore(form.store, (s: any) => s.values.inquiries) as InquiryEntry[]) ?? []

  // Get treatment names from office profile or fallback
  const profile = (selectedOffice?.profile as Record<string, unknown>) ?? {}
  const treatments = (profile.treatments as Record<string, { offered: boolean; fee: string; notes: string }>) ?? {}
  const offeredTreatments = Object.entries(treatments)
    .filter(([, v]) => v.offered)
    .map(([k]) => k)

  const treatmentNames = offeredTreatments.length > 0 ? offeredTreatments : DEFAULT_TREATMENTS

  function getInquiry(name: string): InquiryEntry | undefined {
    return inquiries.find((i) => i.treatmentName === name)
  }

  function setInquiry(name: string, patch: Partial<InquiryEntry>) {
    const existing = getInquiry(name)
    if (existing) {
      form.setFieldValue(
        'inquiries',
        inquiries.map((i) => (i.treatmentName === name ? { ...i, ...patch } : i)),
      )
    } else {
      form.setFieldValue('inquiries', [...inquiries, { treatmentName: name, ...patch }])
    }
  }

  // Get fee hint from office profile
  function getFeeHint(name: string): string {
    const match = Object.entries(treatments).find(([k]) => k === name)
    return match?.[1]?.fee ?? ''
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
              const inq = getInquiry(name)
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
                          onClick={() => setInquiry(name, { offered: v })}
                          className={cn(
                            'px-2 py-0.5 rounded text-[10px] font-bold border transition-colors capitalize',
                            inq?.offered === v
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
                      value={inq?.fee ?? feeHint}
                      onChange={(e) => setInquiry(name, { fee: e.target.value })}
                      placeholder={feeHint || 'Fee'}
                      className="h-7 text-xs border-border"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      value={inq?.note ?? ''}
                      onChange={(e) => setInquiry(name, { note: e.target.value })}
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
}

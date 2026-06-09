'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { YnToggle } from '../yn-toggle'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'

const MEDICAL_FIELDS = [
  { key: 'medications',       label: 'Taking any medications?',   detail: 'medicationsList',  detailLabel: 'List medications' },
  { key: 'surgery',           label: 'Had any surgeries?',         detail: 'surgeryDetails',   detailLabel: 'Describe surgeries' },
  { key: 'highBloodPressure', label: 'High blood pressure?',       detail: null,               detailLabel: '' },
  { key: 'diabetes',          label: 'Diabetes?',                  detail: null,               detailLabel: '' },
  { key: 'heartCondition',    label: 'Heart condition?',           detail: 'heartDetails',     detailLabel: 'Describe condition' },
  { key: 'allergies',         label: 'Known allergies?',           detail: 'allergiesList',    detailLabel: 'List allergies (inc. latex, penicillin)' },
] as const

export function MedicalSection() {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-secondary-foreground hover:bg-muted transition-colors"
        onClick={() => setOpen((o) => !o)}
      >
        <span>Medical History (optional)</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      {open && (
        <form.Subscribe selector={(s) => s.values.medical}>
          {(medical) => (
            <div className="p-4 border-t border-border space-y-4">
              {MEDICAL_FIELDS.map(({ key, label, detail, detailLabel }) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-secondary-foreground">{label}</Label>
                    <YnToggle
                      value={medical[key] ?? null}
                      onChange={(v) => form.setFieldValue(`medical.${key}`, v as 'yes' | 'no')}
                    />
                  </div>
                  {detail && medical[key] === 'yes' && (
                    <Textarea
                      rows={2}
                      placeholder={detailLabel}
                      value={medical[detail] ?? ''}
                      onChange={(e) => form.setFieldValue(`medical.${detail}`, e.target.value)}
                      className="resize-none text-sm"
                    />
                  )}
                </div>
              ))}

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-secondary-foreground">Anything else to note?</Label>
                <Textarea
                  rows={2}
                  placeholder="Any other medical notes..."
                  value={medical.anythingElse ?? ''}
                  onChange={(e) => form.setFieldValue('medical.anythingElse', e.target.value)}
                  className="resize-none text-sm"
                />
              </div>
            </div>
          )}
        </form.Subscribe>
      )}
    </div>
  )
}

'use client'

import { useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { YnToggle } from '../yn-toggle'
import type { PatientFormData } from '@/server/actions/patients'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

const REFERRAL_SOURCES = [
  'Google', 'Facebook', 'Instagram', 'Word of Mouth', 'Family/Friend',
  'Insurance Network', 'Walk-In', 'Returning Patient', 'Other',
]

export function PatientInfoSection({ form }: { form: AnyForm }) {
  const vals = (useStore(form.store, (s: any) => s.values.patient) as Record<string, string | undefined>) ?? {}

  function set(key: string, val: string) {
    form.setFieldValue(`patient.${key}`, val)
  }

  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>First Name
          </Label>
          <Input value={vals.firstName ?? ''} onChange={(e) => set('firstName', e.target.value)} placeholder="First name" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="field-label">Middle Name</Label>
          <Input value={vals.middleName ?? ''} onChange={(e) => set('middleName', e.target.value)} placeholder="Middle name" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>Last Name
          </Label>
          <Input value={vals.lastName ?? ''} onChange={(e) => set('lastName', e.target.value)} placeholder="Last name" className="h-10" />
        </div>
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>Phone
          </Label>
          <Input value={vals.phone ?? ''} onChange={(e) => set('phone', e.target.value)} placeholder="(___) ___-____" type="tel" className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="field-label">Email</Label>
          <Input value={vals.email ?? ''} onChange={(e) => set('email', e.target.value)} placeholder="patient@email.com" type="email" className="h-10" />
        </div>
      </div>

      {/* Gender + New Patient row */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="field-label">Gender</Label>
          <div className="flex gap-2">
            {['Male', 'Female', 'Other'].map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => set('gender', g)}
                className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                  vals.gender === g
                    ? 'bg-primary border-primary text-white'
                    : 'border-border text-secondary-foreground hover:border-primary'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>New Patient?
          </Label>
          <YnToggle
            value={vals.newPatient === 'Yes' ? 'yes' : vals.newPatient === 'No' ? 'no' : null}
            onChange={(v) => set('newPatient', v === 'yes' ? 'Yes' : 'No')}
          />
        </div>
      </div>

      {/* Referral — only shown when new patient = yes */}
      {vals.newPatient === 'Yes' && (
        <div className="space-y-1.5">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>How did they hear about us?
          </Label>
          <div className="flex flex-wrap gap-2">
            {REFERRAL_SOURCES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => set('referralSource', s)}
                className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                  vals.referralSource === s
                    ? 'bg-primary border-primary text-white'
                    : 'border-border text-secondary-foreground hover:border-primary'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

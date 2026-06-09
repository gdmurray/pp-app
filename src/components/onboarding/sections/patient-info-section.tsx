'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { YnToggle } from '../yn-toggle'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'

const REFERRAL_SOURCES = [
  'Google', 'Facebook', 'Instagram', 'Word of Mouth', 'Family/Friend',
  'Insurance Network', 'Walk-In', 'Returning Patient', 'Other',
]

export function PatientInfoSection() {
  const form = useTypedAppFormContext(FORM_OPTIONS)

  return (
    <div className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-3 gap-3">
        <form.Field name="patient.firstName">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>First Name
              </Label>
              <Input
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="First name"
                className={`h-10 ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-xs">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="patient.middleName">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">Middle Name</Label>
              <Input
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="Middle name"
                className="h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="patient.lastName">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Last Name
              </Label>
              <Input
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Last name"
                className={`h-10 ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-xs">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      {/* Contact row */}
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="patient.phone">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Phone
              </Label>
              <Input
                type="tel"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="(___) ___-____"
                className={`h-10 ${field.state.meta.errors.length > 0 ? 'border-destructive' : ''}`}
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-xs">{String(field.state.meta.errors[0])}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="patient.email">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">Email</Label>
              <Input
                type="email"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="patient@email.com"
                className="h-10"
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Gender + New Patient */}
      <div className="grid grid-cols-2 gap-5">
        <form.Field name="patient.gender">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">Gender</Label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => field.handleChange(g)}
                    className={`flex-1 py-1.5 rounded-lg border text-sm font-semibold transition-colors ${
                      field.state.value === g
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-secondary-foreground hover:border-primary'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form.Field>

        <form.Field name="patient.newPatient">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>New Patient?
              </Label>
              <YnToggle
                value={field.state.value === 'Yes' ? 'yes' : field.state.value === 'No' ? 'no' : null}
                onChange={(v) => field.handleChange(v === 'yes' ? 'Yes' : 'No')}
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Referral — shown when new patient = Yes */}
      <form.Subscribe selector={(s) => s.values.patient?.newPatient}>
        {(newPatient) =>
          newPatient === 'Yes' ? (
            <form.Field name="patient.referralSource">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="field-label">
                    <span className="text-pp-orange mr-1">●</span>How did they hear about us?
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {REFERRAL_SOURCES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => field.handleChange(s)}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                          field.state.value === s
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
            </form.Field>
          ) : null
        }
      </form.Subscribe>
    </div>
  )
}

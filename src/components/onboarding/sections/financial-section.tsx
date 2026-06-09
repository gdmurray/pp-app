'use client'

import type { DeepKeysOfType } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'
import type { OnboardingFormValues } from '../form-hook'

const INSURANCE_STATUS_OPTIONS = [
  { key: 'provided' as const, label: 'Has Insurance Info', sub: 'Patient has card / details available' },
  { key: 'none' as const, label: 'No Insurance', sub: 'Self-pay patient' },
  { key: 'bring' as const, label: 'Will Bring Card', sub: 'Has insurance, bringing info to appointment' },
]

const INSURANCE_TYPE_OPTIONS = [
  { key: 'own' as const, label: 'Own Insurance', sub: 'Patient is the primary holder' },
  { key: 'medicaid' as const, label: 'Medicaid / Medicare', sub: 'Government coverage' },
  { key: 'other' as const, label: 'Other / Spouse / Parent', sub: 'Not primary policyholder' },
]

export function FinancialSection() {
  const form = useTypedAppFormContext(FORM_OPTIONS)

  return (
    <div className="space-y-5">
      {/* Insurance status */}
      <form.Field name="financial.insuranceStatus">
        {(field) => (
          <div className="space-y-2">
            <Label className="field-label">
              <span className="text-pp-orange mr-1">●</span>Insurance Status
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {INSURANCE_STATUS_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => field.handleChange(o.key)}
                  className={cn(
                    'flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-all',
                    field.state.value === o.key ? 'border-primary bg-accent' : 'border-border hover:border-primary',
                  )}
                >
                  <span className={cn('text-sm font-semibold', field.state.value === o.key ? 'text-pp-blue-dark' : 'text-foreground')}>
                    {o.label}
                  </span>
                  <span className="text-[10.5px] text-muted-foreground">{o.sub}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      {/* Insurance type — only when status = provided */}
      <form.Subscribe selector={(s) => s.values.financial?.insuranceStatus}>
        {(status) =>
          status === 'provided' ? (
            <form.Field name="financial.insuranceType">
              {(field) => (
                <div className="space-y-2">
                  <Label className="field-label">
                    <span className="text-pp-orange mr-1">●</span>Insurance Type
                  </Label>
                  <div className="grid grid-cols-3 gap-2">
                    {INSURANCE_TYPE_OPTIONS.map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => field.handleChange(o.key)}
                        className={cn(
                          'flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-all',
                          field.state.value === o.key ? 'border-primary bg-accent' : 'border-border hover:border-primary',
                        )}
                      >
                        <span className={cn('text-sm font-semibold', field.state.value === o.key ? 'text-pp-blue-dark' : 'text-foreground')}>
                          {o.label}
                        </span>
                        <span className="text-[10.5px] text-muted-foreground">{o.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>
          ) : null
        }
      </form.Subscribe>

      {/* Sub-forms */}
      <form.Subscribe
        selector={(s) => ({
          status: s.values.financial?.insuranceStatus,
          insType: s.values.financial?.insuranceType,
        })}
      >
        {({ status, insType }) => (
          <>
            {status === 'provided' && insType === 'own' && <OwnInsuranceFields />}
            {status === 'provided' && insType === 'medicaid' && <MedicaidFields />}
            {status === 'provided' && insType === 'other' && <OtherInsuranceFields />}
            {status === 'none' && <BasicInfoFields prefix="noInsurance" />}
            {status === 'bring' && <BasicInfoFields prefix="bring" />}
          </>
        )}
      </form.Subscribe>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

// FF: a labelled text input bound to a specific field path
function FF({ name, label, required }: {
  name: DeepKeysOfType<OnboardingFormValues, string | undefined>
  label: string
  required?: boolean
}) {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  return (
    <form.Field name={name}>
      {(field) => (
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold text-secondary-foreground">
            {required && <span className="text-pp-orange mr-1">●</span>}{label}
          </Label>
          <Input
            value={(field.state.value as string) ?? ''}
            onChange={(e) => field.handleChange(e.target.value as never)}
            className="h-9"
          />
        </div>
      )}
    </form.Field>
  )
}

function OwnInsuranceFields() {
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Primary Holder Info</p>
      <Row>
        <FF name="financial.own.company" label="Insurance Company" required />
        <FF name="financial.own.policy" label="Policy Number" required />
      </Row>
      <Row>
        <FF name="financial.own.group" label="Group Number" />
        <FF name="financial.own.employer" label="Employer" />
      </Row>
      <Row>
        <FF name="financial.own.dob" label="Date of Birth" required />
        <FF name="financial.own.ssn" label="SSN (Last 4)" />
      </Row>
      <FF name="financial.own.address" label="Address" />
      <div className="grid grid-cols-3 gap-3">
        <FF name="financial.own.city" label="City" />
        <FF name="financial.own.state" label="State" />
        <FF name="financial.own.postal" label="Postal" />
      </div>
    </div>
  )
}

function MedicaidFields() {
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Medicaid Info</p>
      <Row>
        <FF name="financial.medicaid.stateId" label="State ID" required />
        <FF name="financial.medicaid.dob" label="Date of Birth" required />
      </Row>
      <FF name="financial.medicaid.address" label="Address" />
    </div>
  )
}

function OtherInsuranceFields() {
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Policyholder Info</p>
      <Row>
        <FF name="financial.other.holderName" label="Holder's Name" required />
        <FF name="financial.other.relationship" label="Relationship" required />
      </Row>
      <Row>
        <FF name="financial.other.holderDob" label="Holder's DOB" />
        <FF name="financial.other.patientDob" label="Patient's DOB" />
      </Row>
      <FF name="financial.other.holderAddress" label="Holder's Address" />
    </div>
  )
}

// Shared for "no insurance" and "bring card" — same fields, different prefix
function BasicInfoFields({ prefix }: { prefix: 'noInsurance' | 'bring' }) {
  const dobName = `financial.${prefix}.dob` as DeepKeysOfType<OnboardingFormValues, string | undefined>
  const addrName = `financial.${prefix}.address` as DeepKeysOfType<OnboardingFormValues, string | undefined>
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Patient Info</p>
      <Row>
        <FF name={dobName} label="Date of Birth" required />
        <FF name={addrName} label="Address" />
      </Row>
    </div>
  )
}

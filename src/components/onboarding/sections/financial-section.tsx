'use client'

import { useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { PatientFormData } from '@/server/actions/patients'
import type { Office } from '@/lib/patient-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

const INSURANCE_STATUS_OPTIONS = [
  { key: 'provided', label: 'Has Insurance Info', sub: 'Patient has card / details available' },
  { key: 'none', label: 'No Insurance', sub: 'Self-pay patient' },
  { key: 'bring', label: 'Will Bring Card', sub: 'Has insurance, bringing info to appointment' },
] as const

const INSURANCE_TYPE_OPTIONS = [
  { key: 'own', label: 'Own Insurance', sub: 'Patient is the primary holder' },
  { key: 'medicaid', label: 'Medicaid / Medicare', sub: 'Government coverage' },
  { key: 'other', label: 'Other / Spouse / Parent', sub: 'Not primary policyholder' },
] as const

export function FinancialSection({ form, selectedOffice }: { form: AnyForm; selectedOffice?: Office }) {
  const financial = (useStore(form.store, (s: any) => s.values.financial) as Record<string, unknown>) ?? {}

  function set(key: string, val: unknown) {
    form.setFieldValue(`financial.${key}`, val)
  }

  function setNested(topKey: string, subKey: string, val: string) {
    form.setFieldValue(`financial.${topKey}.${subKey}`, val)
  }

  const status = financial.insuranceStatus as string | undefined
  const insType = financial.insuranceType as string | undefined

  return (
    <div className="space-y-5">
      {/* Insurance status */}
      <div className="space-y-2">
        <Label className="field-label">
          <span className="text-pp-orange mr-1">●</span>Insurance Status
        </Label>
        <div className="grid grid-cols-3 gap-2">
          {INSURANCE_STATUS_OPTIONS.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => set('insuranceStatus', o.key)}
              className={cn(
                'flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-all',
                status === o.key
                  ? 'border-primary bg-accent'
                  : 'border-border hover:border-primary',
              )}
            >
              <span className={cn('text-sm font-semibold', status === o.key ? 'text-pp-blue-dark' : 'text-foreground')}>
                {o.label}
              </span>
              <span className="text-[10.5px] text-muted-foreground">{o.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Insurance type — only when provided */}
      {status === 'provided' && (
        <div className="space-y-2">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>Insurance Type
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {INSURANCE_TYPE_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => set('insuranceType', o.key)}
                className={cn(
                  'flex flex-col gap-0.5 p-3 rounded-xl border-2 text-left transition-all',
                  insType === o.key
                    ? 'border-primary bg-accent'
                    : 'border-border hover:border-primary',
                )}
              >
                <span className={cn('text-sm font-semibold', insType === o.key ? 'text-pp-blue-dark' : 'text-foreground')}>
                  {o.label}
                </span>
                <span className="text-[10.5px] text-muted-foreground">{o.sub}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Own insurance fields */}
      {status === 'provided' && insType === 'own' && (
        <OwnInsuranceFields financial={financial} setNested={setNested} />
      )}

      {/* Medicaid fields */}
      {status === 'provided' && insType === 'medicaid' && (
        <MedicaidFields financial={financial} setNested={setNested} />
      )}

      {/* Other/Spouse/Parent fields */}
      {status === 'provided' && insType === 'other' && (
        <OtherInsuranceFields financial={financial} setNested={setNested} />
      )}

      {/* No insurance — collect basic info */}
      {(status === 'none') && (
        <NoInsuranceFields financial={financial} setNested={setNested} topKey="noInsurance" />
      )}

      {/* Bring card — minimal */}
      {status === 'bring' && (
        <NoInsuranceFields financial={financial} setNested={setNested} topKey="bring" />
      )}
    </div>
  )
}

function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>
}

function FF({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-secondary-foreground">
        {required && <span className="text-pp-orange mr-1">●</span>}{label}
      </Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9" />
    </div>
  )
}

function OwnInsuranceFields({ financial, setNested }: { financial: Record<string, unknown>; setNested: (t: string, k: string, v: string) => void }) {
  const own = (financial.own as Record<string, string>) ?? {}
  const s = (k: string, v: string) => setNested('own', k, v)
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Primary Holder Info</p>
      <FieldRow>
        <FF label="Insurance Company" value={own.company ?? ''} onChange={(v) => s('company', v)} required />
        <FF label="Policy Number" value={own.policy ?? ''} onChange={(v) => s('policy', v)} required />
      </FieldRow>
      <FieldRow>
        <FF label="Group Number" value={own.group ?? ''} onChange={(v) => s('group', v)} />
        <FF label="Employer" value={own.employer ?? ''} onChange={(v) => s('employer', v)} />
      </FieldRow>
      <FieldRow>
        <FF label="Date of Birth" value={own.dob ?? ''} onChange={(v) => s('dob', v)} required />
        <FF label="SSN (Last 4)" value={own.ssn ?? ''} onChange={(v) => s('ssn', v)} />
      </FieldRow>
      <FF label="Address" value={own.address ?? ''} onChange={(v) => s('address', v)} />
      <div className="grid grid-cols-3 gap-3">
        <FF label="City" value={own.city ?? ''} onChange={(v) => s('city', v)} />
        <FF label="State" value={own.state ?? ''} onChange={(v) => s('state', v)} />
        <FF label="Postal" value={own.postal ?? ''} onChange={(v) => s('postal', v)} />
      </div>
    </div>
  )
}

function MedicaidFields({ financial, setNested }: { financial: Record<string, unknown>; setNested: (t: string, k: string, v: string) => void }) {
  const m = (financial.medicaid as Record<string, string>) ?? {}
  const s = (k: string, v: string) => setNested('medicaid', k, v)
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Medicaid Info</p>
      <FieldRow>
        <FF label="State ID" value={m.stateId ?? ''} onChange={(v) => s('stateId', v)} required />
        <FF label="Date of Birth" value={m.dob ?? ''} onChange={(v) => s('dob', v)} required />
      </FieldRow>
      <FF label="Address" value={m.address ?? ''} onChange={(v) => s('address', v)} />
    </div>
  )
}

function OtherInsuranceFields({ financial, setNested }: { financial: Record<string, unknown>; setNested: (t: string, k: string, v: string) => void }) {
  const o = (financial.other as Record<string, string>) ?? {}
  const s = (k: string, v: string) => setNested('other', k, v)
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Policyholder Info</p>
      <FieldRow>
        <FF label="Holder's Name" value={o.holderName ?? ''} onChange={(v) => s('holderName', v)} required />
        <FF label="Relationship" value={o.relationship ?? ''} onChange={(v) => s('relationship', v)} required />
      </FieldRow>
      <FieldRow>
        <FF label="Holder's DOB" value={o.holderDob ?? ''} onChange={(v) => s('holderDob', v)} />
        <FF label="Patient's DOB" value={o.patientDob ?? ''} onChange={(v) => s('patientDob', v)} />
      </FieldRow>
      <FF label="Holder's Address" value={o.holderAddress ?? ''} onChange={(v) => s('holderAddress', v)} />
    </div>
  )
}

function NoInsuranceFields({ financial, setNested, topKey }: { financial: Record<string, unknown>; setNested: (t: string, k: string, v: string) => void; topKey: string }) {
  const n = (financial[topKey] as Record<string, string>) ?? {}
  const s = (k: string, v: string) => setNested(topKey, k, v)
  return (
    <div className="space-y-3 p-4 bg-muted rounded-xl">
      <p className="text-xs font-bold text-secondary-foreground uppercase tracking-wider">Patient Info</p>
      <FieldRow>
        <FF label="Date of Birth" value={n.dob ?? ''} onChange={(v) => s('dob', v)} required />
        <FF label="Address" value={n.address ?? ''} onChange={(v) => s('address', v)} />
      </FieldRow>
    </div>
  )
}

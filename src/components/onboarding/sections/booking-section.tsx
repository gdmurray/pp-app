'use client'

import { useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { YnToggle } from '../yn-toggle'
import type { PatientFormData } from '@/server/actions/patients'
import type { Office } from '@/lib/patient-utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

const PROCEDURES = [
  { label: 'New Patient Exam + X-rays + Cleaning', units: { asst: 0, hygiene: 6, dr: 0 } },
  { label: 'Emergency / Specific Exam', units: { asst: 0, hygiene: 0, dr: 3 } },
  { label: 'Consultation', units: { asst: 0, hygiene: 0, dr: 4 } },
  { label: 'Other (specify)', units: { asst: 0, hygiene: 0, dr: 0 }, custom: true },
]

const REASONS_NOT_BOOKED = [
  'Needs to check schedule', 'Price concern — will call back', 'Calling for a friend',
  'Just gathering info', 'Will call back', 'No Lead', 'Other',
]

export function BookingSection({ form, selectedOffice }: { form: AnyForm; selectedOffice?: Office }) {
  const booking = (useStore(form.store, (s: any) => s.values.booking) as Record<string, unknown>) ?? {}

  function set(key: string, val: unknown) {
    form.setFieldValue(`booking.${key}`, val)
  }

  const booked = booking.booked as string | undefined

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label className="field-label">
          <span className="text-pp-orange mr-1">●</span>Was appointment booked?
        </Label>
        <YnToggle
          value={booked ?? null}
          onChange={(v) => set('booked', v)}
        />
      </div>

      {booked === 'yes' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Appointment Date
              </Label>
              <Input
                type="date"
                value={(booking.apptDate as string) ?? ''}
                onChange={(e) => set('apptDate', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Appointment Time
              </Label>
              <Input
                type="time"
                value={(booking.apptTime as string) ?? ''}
                onChange={(e) => set('apptTime', e.target.value)}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="field-label">Procedures</Label>
            <div className="space-y-2">
              {PROCEDURES.map((proc) => {
                const selected = Array.isArray(booking.procedures)
                  ? (booking.procedures as string[]).includes(proc.label)
                  : false
                return (
                  <label
                    key={proc.label}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selected
                        ? 'border-primary bg-accent'
                        : 'border-border hover:border-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={selected}
                      onChange={(e) => {
                        const procs = (booking.procedures as string[]) ?? []
                        set(
                          'procedures',
                          e.target.checked
                            ? [...procs, proc.label]
                            : procs.filter((p) => p !== proc.label),
                        )
                      }}
                    />
                    <span className="text-sm font-medium text-foreground flex-1">{proc.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {proc.units.hygiene + proc.units.dr} units
                    </span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="field-label">Price Quoted</Label>
            <Input
              value={(booking.priceQuoted as string) ?? ''}
              onChange={(e) => set('priceQuoted', e.target.value)}
              placeholder="$0 with insurance"
              className="h-10"
            />
          </div>
        </>
      )}

      {booked === 'no' && (
        <>
          <div className="space-y-2">
            <Label className="field-label">
              <span className="text-pp-orange mr-1">●</span>Reason not booked
            </Label>
            <div className="flex flex-wrap gap-2">
              {REASONS_NOT_BOOKED.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => set('reasonNotBooked', r)}
                  className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                    booking.reasonNotBooked === r
                      ? 'bg-primary border-primary text-white'
                      : 'border-border text-secondary-foreground hover:border-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="field-label">Follow-up Date</Label>
              <Input
                type="date"
                value={(booking.followUpDate as string) ?? ''}
                onChange={(e) => set('followUpDate', e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="field-label">Follow-up Time</Label>
              <Input
                type="time"
                value={(booking.followUpTime as string) ?? ''}
                onChange={(e) => set('followUpTime', e.target.value)}
                className="h-10"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

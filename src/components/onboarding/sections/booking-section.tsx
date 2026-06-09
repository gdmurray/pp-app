'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { YnToggle } from '../yn-toggle'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'
import type { Office } from '@/lib/patient-utils'

const PROCEDURES = [
  { label: 'New Patient Exam + X-rays + Cleaning', units: { hygiene: 6, dr: 0 } },
  { label: 'Emergency / Specific Exam', units: { hygiene: 0, dr: 3 } },
  { label: 'Consultation', units: { hygiene: 0, dr: 4 } },
  { label: 'Other (specify)', units: { hygiene: 0, dr: 0 } },
]

const REASONS_NOT_BOOKED = [
  'Needs to check schedule', 'Price concern — will call back', 'Calling for a friend',
  'Just gathering info', 'Will call back', 'No Lead', 'Other',
]

export function BookingSection({ selectedOffice: _selectedOffice }: { selectedOffice?: Office }) {
  const form = useTypedAppFormContext(FORM_OPTIONS)

  return (
    <div className="space-y-5">
      <form.Field name="booking.booked">
        {(field) => (
          <div className="space-y-1.5">
            <Label className="field-label">
              <span className="text-pp-orange mr-1">●</span>Was appointment booked?
            </Label>
            <YnToggle
              value={field.state.value ?? null}
              onChange={(v) => field.handleChange(v as 'yes' | 'no')}
            />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.values.booking?.booked}>
        {(booked) =>
          booked === 'yes' ? <BookedFields /> : booked === 'no' ? <NotBookedFields /> : null
        }
      </form.Subscribe>
    </div>
  )
}

function BookedFields() {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <form.Field name="booking.apptDate">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Appointment Date
              </Label>
              <Input
                type="date"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="booking.apptTime">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Appointment Time
              </Label>
              <Input
                type="time"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10"
              />
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe selector={(s) => s.values.booking?.procedures ?? []}>
        {(procedures) => (
          <div className="space-y-2">
            <Label className="field-label">Procedures</Label>
            <div className="space-y-2">
              {PROCEDURES.map((proc) => {
                const selected = procedures.includes(proc.label)
                return (
                  <label
                    key={proc.label}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selected ? 'border-primary bg-accent' : 'border-border hover:border-primary'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-primary"
                      checked={selected}
                      onChange={(e) =>
                        form.setFieldValue(
                          'booking.procedures',
                          e.target.checked
                            ? [...procedures, proc.label]
                            : procedures.filter((p) => p !== proc.label),
                        )
                      }
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
        )}
      </form.Subscribe>

      <form.Field name="booking.priceQuoted">
        {(field) => (
          <div className="space-y-1.5">
            <Label className="field-label">Price Quoted</Label>
            <Input
              value={field.state.value ?? ''}
              onChange={(e) => field.handleChange(e.target.value)}
              placeholder="$0 with insurance"
              className="h-10"
            />
          </div>
        )}
      </form.Field>
    </>
  )
}

function NotBookedFields() {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  return (
    <>
      <form.Field name="booking.reasonNotBooked">
        {(field) => (
          <div className="space-y-2">
            <Label className="field-label">
              <span className="text-pp-orange mr-1">●</span>Reason not booked
            </Label>
            <div className="flex flex-wrap gap-2">
              {REASONS_NOT_BOOKED.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => field.handleChange(r)}
                  className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                    field.state.value === r
                      ? 'bg-primary border-primary text-white'
                      : 'border-border text-secondary-foreground hover:border-primary'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-3">
        <form.Field name="booking.followUpDate">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">Follow-up Date</Label>
              <Input
                type="date"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10"
              />
            </div>
          )}
        </form.Field>

        <form.Field name="booking.followUpTime">
          {(field) => (
            <div className="space-y-1.5">
              <Label className="field-label">Follow-up Time</Label>
              <Input
                type="time"
                value={field.state.value ?? ''}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-10"
              />
            </div>
          )}
        </form.Field>
      </div>
    </>
  )
}

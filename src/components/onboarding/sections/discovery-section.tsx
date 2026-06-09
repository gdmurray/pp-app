'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { YnToggle } from '../yn-toggle'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useTypedAppFormContext, FORM_OPTIONS } from '../form-hook'

const CLEANING_OPTIONS = ['Within 6 months', '6–12 months', '1–2 years', '2+ years', 'Never']

export function DiscoverySection() {
  const form = useTypedAppFormContext(FORM_OPTIONS)
  const [historyOpen, setHistoryOpen] = useState(false)

  return (
    <div className="space-y-5">
      {/* Pain & Sensitivity */}
      <div className="grid grid-cols-2 gap-5">
        {/* Pain toggle drives conditional painLevel input */}
        <form.Field name="discovery.pain">
          {(field) => (
            <div className="space-y-2">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Experiencing pain?
              </Label>
              <YnToggle
                value={field.state.value ? 'yes' : 'no'}
                onChange={(v) => field.handleChange(v === 'yes')}
              />
              {field.state.value && (
                <form.Field name="discovery.painLevel">
                  {(plField) => (
                    <div className="mt-2 space-y-1.5">
                      <Label className="field-label text-xs">Pain level (0–10)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        value={plField.state.value ?? ''}
                        onChange={(e) => plField.handleChange(e.target.value)}
                        placeholder="5"
                        className="h-9 w-24"
                      />
                    </div>
                  )}
                </form.Field>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="discovery.sensitivity">
          {(field) => (
            <div className="space-y-2">
              <Label className="field-label">
                <span className="text-pp-orange mr-1">●</span>Sensitivity to hot/cold?
              </Label>
              <YnToggle
                value={field.state.value ? 'yes' : 'no'}
                onChange={(v) => field.handleChange(v === 'yes')}
              />
            </div>
          )}
        </form.Field>
      </div>

      {/* Dental history accordion */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-muted transition-colors"
          onClick={() => setHistoryOpen((o) => !o)}
        >
          Dental History (optional)
          {historyOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        {historyOpen && (
          <div className="p-4 space-y-4 border-t border-border">
            {/* Last cleaning */}
            <form.Field name="discovery.lastCleaning">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="field-label text-xs">Last cleaning</Label>
                  <div className="flex flex-wrap gap-2">
                    {CLEANING_OPTIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => field.handleChange(o)}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                          field.state.value === o
                            ? 'bg-primary border-primary text-white'
                            : 'border-border text-secondary-foreground hover:border-primary'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            {/* Last exam */}
            <form.Field name="discovery.lastExam">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="field-label text-xs">Last exam</Label>
                  <div className="flex flex-wrap gap-2">
                    {CLEANING_OPTIONS.map((o) => (
                      <button
                        key={o}
                        type="button"
                        onClick={() => field.handleChange(o)}
                        className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                          field.state.value === o
                            ? 'bg-primary border-primary text-white'
                            : 'border-border text-secondary-foreground hover:border-primary'
                        }`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form.Field>

            {/* Previous dentist */}
            <div className="grid grid-cols-2 gap-3">
              <form.Field name="discovery.prevDentistName">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="field-label text-xs">Previous dentist name</Label>
                    <Input
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Dr. Smith"
                      className="h-9"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="discovery.prevDentistPhone">
                {(field) => (
                  <div className="space-y-1.5">
                    <Label className="field-label text-xs">Previous dentist phone</Label>
                    <Input
                      value={field.state.value ?? ''}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="(___) ___-____"
                      className="h-9"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            {/* X-ray transfer */}
            <form.Field name="discovery.xrayTransfer">
              {(field) => (
                <div className="space-y-1.5">
                  <Label className="field-label text-xs">X-ray transfer requested?</Label>
                  <YnToggle
                    value={(field.state.value as string | undefined) ?? null}
                    onChange={(v) => field.handleChange(v)}
                  />
                </div>
              )}
            </form.Field>
          </div>
        )}
      </div>
    </div>
  )
}

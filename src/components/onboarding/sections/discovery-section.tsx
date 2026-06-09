'use client'

import { useState } from 'react'
import { useStore } from '@tanstack/react-form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { YnToggle } from '../yn-toggle'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { PatientFormData } from '@/server/actions/patients'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyForm = any

const CLEANING_OPTIONS = ['Within 6 months', '6–12 months', '1–2 years', '2+ years', 'Never']

export function DiscoverySection({ form }: { form: AnyForm }) {
  const [historyOpen, setHistoryOpen] = useState(false)
  const disc = (useStore(form.store, (s: any) => s.values.discovery) as Record<string, unknown>) ?? {}

  function set(key: string, val: unknown) {
    form.setFieldValue(`discovery.${key}`, val)
  }

  return (
    <div className="space-y-5">
      {/* Pain & Sensitivity */}
      <div className="grid grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>Experiencing pain?
          </Label>
          <YnToggle
            value={disc.pain ? 'yes' : 'no'}
            onChange={(v) => set('pain', v === 'yes')}
          />
          {!!disc.pain && (
            <div className="mt-2 space-y-1.5">
              <Label className="field-label text-xs">Pain level (0–10)</Label>
              <Input
                type="number"
                min="0"
                max="10"
                value={(disc.painLevel as string) ?? ''}
                onChange={(e) => set('painLevel', e.target.value)}
                placeholder="5"
                className="h-9 w-24"
              />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label className="field-label">
            <span className="text-pp-orange mr-1">●</span>Sensitivity to hot/cold?
          </Label>
          <YnToggle
            value={disc.sensitivity ? 'yes' : 'no'}
            onChange={(v) => set('sensitivity', v === 'yes')}
          />
        </div>
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
            <div className="space-y-1.5">
              <Label className="field-label text-xs">Last cleaning</Label>
              <div className="flex flex-wrap gap-2">
                {CLEANING_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => set('lastCleaning', o)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                      disc.lastCleaning === o
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-secondary-foreground hover:border-primary'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="field-label text-xs">Last exam</Label>
              <div className="flex flex-wrap gap-2">
                {CLEANING_OPTIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => set('lastExam', o)}
                    className={`px-3 py-1 rounded-full border text-xs font-semibold transition-colors ${
                      disc.lastExam === o
                        ? 'bg-primary border-primary text-white'
                        : 'border-border text-secondary-foreground hover:border-primary'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="field-label text-xs">Previous dentist name</Label>
                <Input
                  value={(disc.prevDentistName as string) ?? ''}
                  onChange={(e) => set('prevDentistName', e.target.value)}
                  placeholder="Dr. Smith"
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="field-label text-xs">Previous dentist phone</Label>
                <Input
                  value={(disc.prevDentistPhone as string) ?? ''}
                  onChange={(e) => set('prevDentistPhone', e.target.value)}
                  placeholder="(___) ___-____"
                  className="h-9"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="field-label text-xs">X-ray transfer requested?</Label>
              <YnToggle
                value={(disc.xrayTransfer as string) ?? null}
                onChange={(v) => set('xrayTransfer', v)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

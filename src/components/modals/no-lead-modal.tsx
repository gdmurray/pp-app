'use client'

import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { resolveOfficeColor } from '@/lib/offices'
import { cn } from '@/lib/utils'
import type { Office } from '@/lib/patient-utils'

interface NoLeadModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, officeId?: string) => void
  offices: Office[]
  defaultOfficeId?: string
}

const REASONS = [
  'Existing patient', 'Wrong number', 'Soliciting', 'Out of service area',
  'Language barrier', 'Hangs up immediately', 'Other',
]

export function NoLeadModal({ open, onClose, onSubmit, offices, defaultOfficeId }: NoLeadModalProps) {
  const [reason, setReason] = useState('')
  const [customReason, setCustomReason] = useState('')
  const [officeId, setOfficeId] = useState(defaultOfficeId ?? '')

  function handleSubmit() {
    const finalReason = reason === 'Other' ? customReason : reason
    onSubmit(finalReason, officeId || undefined)
    setReason('')
    setCustomReason('')
    setOfficeId(defaultOfficeId ?? '')
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>📵 Log No-Lead Call</DialogTitle>
          <DialogDescription>
            Record a call that was answered but was not a new patient lead.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {!defaultOfficeId && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-secondary-foreground">Office</Label>
              <div className="grid grid-cols-3 gap-2">
                {offices.map((o) => {
                  const color = resolveOfficeColor(o)
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => setOfficeId(o.id)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-sm font-semibold transition-all',
                        officeId === o.id
                          ? 'border-current text-white'
                          : 'border-border text-secondary-foreground hover:border-primary',
                      )}
                      style={officeId === o.id ? { backgroundColor: color, borderColor: color } : {}}
                    >
                      <span className="text-xs font-black px-2 py-1 rounded text-white" style={{ backgroundColor: color }}>{o.abbr}</span>
                      <span className={officeId === o.id ? 'text-white' : ''}>{o.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-secondary-foreground">
              <span className="text-pp-orange mr-1">●</span>Reason
            </Label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setReason(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-full border text-sm font-semibold transition-colors',
                    reason === r
                      ? 'bg-pp-orange border-pp-orange text-white'
                      : 'border-border text-secondary-foreground hover:border-pp-orange',
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
            {reason === 'Other' && (
              <Textarea
                rows={2}
                placeholder="Describe the reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="resize-none"
              />
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              disabled={!reason || (reason === 'Other' && !customReason)}
              onClick={handleSubmit}
              className="bg-pp-orange hover:bg-pp-orange-hover text-white"
            >
              Log No-Lead Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

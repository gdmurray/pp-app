'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { OFFICES } from '@/lib/offices'
import { cn } from '@/lib/utils'
import { logCall } from '@/server/actions/calls'
import { toast } from 'sonner'

interface MissedCallModalProps {
  open: boolean
  onClose: () => void
}

export function MissedCallModal({ open, onClose }: MissedCallModalProps) {
  const [officeKey, setOfficeKey] = useState('')
  const [voicemail, setVoicemail] = useState<'yes' | 'no' | null>(null)
  const [callbackTime, setCallbackTime] = useState('')
  const [notes, setNotes] = useState('')
  const [callerFirst, setCallerFirst] = useState('')
  const [callerLast, setCallerLast] = useState('')
  const [callerPhone, setCallerPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function reset() {
    setOfficeKey('')
    setVoicemail(null)
    setCallbackTime('')
    setNotes('')
    setCallerFirst('')
    setCallerLast('')
    setCallerPhone('')
    setError('')
  }

  async function handleSubmit() {
    if (!officeKey) { setError('Please select an office.'); return }
    if (!voicemail) { setError('Please indicate if a voicemail was left.'); return }
    setLoading(true)
    setError('')
    try {
      await logCall({
        type: 'missed',
        officeKey,
        payload: { voicemail, callbackTime, notes, callerFirst, callerLast, callerPhone },
      })
      toast.success('Missed call logged.')
      reset()
      onClose()
    } catch (e) {
      setError('Failed to log call. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose() } }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>📵</span> Log Missed Call
          </DialogTitle>
          <DialogDescription>Record a call that wasn&apos;t answered</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Office */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-secondary-foreground">
              <span className="text-pp-orange mr-1">●</span> Which office?
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {OFFICES.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setOfficeKey(o.key)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-lg border-2 text-sm font-semibold transition-all',
                    officeKey === o.key
                      ? 'border-current text-white'
                      : 'border-border text-secondary-foreground hover:border-primary',
                  )}
                  style={officeKey === o.key ? { backgroundColor: o.color, borderColor: o.color } : {}}
                >
                  <span
                    className="text-xs font-black px-2 py-1 rounded-md text-white"
                    style={{ backgroundColor: o.color }}
                  >
                    {o.abbr}
                  </span>
                  <span className={officeKey === o.key ? 'text-white' : ''}>{o.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Voicemail */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-secondary-foreground">
              <span className="text-pp-orange mr-1">●</span> Voicemail left?
            </Label>
            <div className="flex gap-2">
              {(['yes', 'no'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVoicemail(v)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all capitalize',
                    voicemail === v
                      ? v === 'yes' ? 'border-pp-success bg-pp-success-light text-pp-success' : 'border-destructive bg-red-50 text-destructive'
                      : 'border-border text-secondary-foreground hover:border-primary',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Callback time */}
          <div className="space-y-1.5">
            <Label htmlFor="callback" className="text-sm font-medium text-secondary-foreground">
              Requested callback time
            </Label>
            <Input
              id="callback"
              value={callbackTime}
              onChange={(e) => setCallbackTime(e.target.value)}
              placeholder="e.g. Tomorrow morning"
              className="h-10"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="mc-notes" className="text-sm font-medium text-secondary-foreground">
              Notes
            </Label>
            <Textarea
              id="mc-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional context..."
              rows={3}
            />
          </div>

          {/* Caller info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-secondary-foreground">
              Caller info (optional)
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="First name"
                value={callerFirst}
                onChange={(e) => setCallerFirst(e.target.value)}
                className="h-10"
              />
              <Input
                placeholder="Last name"
                value={callerLast}
                onChange={(e) => setCallerLast(e.target.value)}
                className="h-10"
              />
            </div>
            <Input
              placeholder="Phone number"
              value={callerPhone}
              onChange={(e) => setCallerPhone(e.target.value)}
              className="h-10"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-2 justify-end pt-1">
            <Button variant="outline" onClick={() => { reset(); onClose() }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-primary hover:bg-pp-blue-dark text-white"
            >
              {loading ? 'Logging…' : 'Log Missed Call'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

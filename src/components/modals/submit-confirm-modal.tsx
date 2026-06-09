'use client'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { colors } from '@/lib/design-tokens'

interface SubmitConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
  patientName?: string
  officeName?: string
  officeColor?: string
}

export function SubmitConfirmModal({
  open, onConfirm, onCancel, loading, patientName, officeName, officeColor,
}: SubmitConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-pp-success" size={20} />
            Confirm Patient Submission
          </DialogTitle>
          <DialogDescription>
            You&apos;re about to save this patient record. Please confirm the details below.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-2 space-y-3">
          <div className="bg-muted rounded-lg px-4 py-3 space-y-1.5">
            {patientName && (
              <div className="flex gap-2">
                <span className="text-xs text-muted-foreground w-20">Patient:</span>
                <span className="text-sm font-semibold text-foreground">{patientName}</span>
              </div>
            )}
            {officeName && (
              <div className="flex gap-2 items-center">
                <span className="text-xs text-muted-foreground w-20">Office:</span>
                <span
                  className="text-sm font-bold px-2 py-0.5 rounded text-white"
                  style={{ backgroundColor: officeColor ?? colors.primary }}
                >
                  {officeName}
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button
              onClick={onConfirm}
              disabled={loading}
              className="bg-pp-success hover:bg-pp-success-hover text-white"
            >
              {loading ? 'Saving…' : '✓ Submit Patient'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

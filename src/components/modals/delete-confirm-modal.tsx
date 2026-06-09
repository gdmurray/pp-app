'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConfirmModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  message?: string
}

export function DeleteConfirmModal({ open, onConfirm, onCancel, message }: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            ⚠️ Confirm Delete
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-secondary-foreground mt-2">
          {message ?? 'Are you sure you want to delete this record? This cannot be undone.'}
        </p>
        <div className="flex gap-2 justify-end mt-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm} className="bg-destructive hover:bg-red-700 text-white">
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

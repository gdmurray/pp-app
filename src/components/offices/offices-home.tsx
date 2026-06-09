'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { resolveOfficeColor } from '@/lib/offices'
import { createOffice } from '@/server/actions/offices'
import { patientIsBooked, type Patient, type Office } from '@/lib/patient-utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import type { calls as CallsTable } from '@/db/schema'

interface OfficesHomeProps {
  allOffices: Office[]
  allPatients: Patient[]
  allCalls: (typeof CallsTable.$inferSelect)[]
}

const DAY_LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function OfficesHome({ allOffices, allPatients, allCalls }: OfficesHomeProps) {
  const router = useRouter()
  const [addOpen, setAddOpen] = useState(false)
  const [officeName, setOfficeName] = useState('')
  const [officeColor, setOfficeColor] = useState('')
  const [creating, setCreating] = useState(false)

  async function handleCreateOffice() {
    if (!officeName.trim()) {
      toast.error('Enter a practice name.')
      return
    }
    setCreating(true)
    try {
      const office = await createOffice({
        name: officeName.trim(),
        color: officeColor.trim() || null,
      })
      toast.success(`${office.name} added.`)
      setAddOpen(false)
      setOfficeName('')
      setOfficeColor('')
      router.push(`/offices/${office.id}`)
    } catch {
      toast.error('Failed to create office.')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {allOffices.map((office) => {
          const color = resolveOfficeColor(office)
          const oPatients = allPatients.filter((p) => p.officeId === office.id)
          const oBooked = oPatients.filter(patientIsBooked).length
          const oCalls = allCalls.filter((c) => c.officeId === office.id)
          const profile = office.profile as Record<string, unknown>

          // Hours strip — find today's hours
          const today = DAY_LABELS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]
          const hours = (profile.hours as Record<string, Record<string, string>> | undefined)?.[today]
          const hoursStr = hours
            ? `${hours.clinicalOpen ?? 'Closed'} – ${hours.clinicalClose ?? ''}`
            : 'See full profile'

          // Insurance
          const insurance = profile.insurance as { billDirectly?: boolean; medicaidMedicare?: boolean; notes?: string } | undefined

          return (
            <div key={office.id} className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="h-1.5 w-full" style={{ backgroundColor: color }} />
              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs font-black px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: color }}
                      >
                        {office.abbr}
                      </span>
                      <h3 className="font-bold text-foreground text-sm">{office.name}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dr. {(profile.principlePreferredName as string) ?? (profile.principleLastName as string) ?? ''}
                    </p>
                  </div>
                  <Link
                    href={`/offices/${office.id}`}
                    className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                  >
                    Profile <ChevronRight size={11} />
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-sm font-extrabold text-foreground">{oPatients.length}</div>
                    <div className="text-[10px] text-muted-foreground">Patients</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-sm font-extrabold text-pp-success">{oBooked}</div>
                    <div className="text-[10px] text-muted-foreground">Booked</div>
                  </div>
                  <div className="text-center p-2 bg-muted rounded-lg">
                    <div className="text-sm font-extrabold text-pp-orange">{oCalls.length}</div>
                    <div className="text-[10px] text-muted-foreground">Calls</div>
                  </div>
                </div>

                {/* Key info */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-muted-foreground font-semibold">Software</span>
                    <span className="text-foreground font-medium">{(profile.dentalSoftware as string) ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-muted-foreground font-semibold">Today</span>
                    <span className="text-foreground font-medium">{hoursStr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-muted-foreground font-semibold">Insurance</span>
                    <span className="text-foreground font-medium">
                      {insurance?.billDirectly ? 'Bills directly' : 'No direct billing'}
                      {insurance?.medicaidMedicare ? ' • Medicaid OK' : ''}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-16 text-muted-foreground font-semibold">Phone</span>
                    <span className="text-foreground font-medium">{(profile.practicePhone as string) ?? '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="w-full text-center p-5 text-sm text-muted-foreground border border-dashed border-border rounded-xl hover:border-primary hover:text-primary transition-colors"
      >
        + Add Office
      </button>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Office</DialogTitle>
            <DialogDescription>
              A brand color is assigned automatically from the practice name. You can override it later on the office profile.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="new-office-name">Practice name</Label>
              <Input
                id="new-office-name"
                value={officeName}
                onChange={(e) => setOfficeName(e.target.value)}
                placeholder="e.g. Riverside Dental"
                className="h-10"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-office-color">Brand color (optional)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="new-office-color"
                  type="color"
                  value={officeColor || '#3A86C8'}
                  onChange={(e) => setOfficeColor(e.target.value)}
                  className="h-10 w-14 p-1 cursor-pointer"
                />
                <Input
                  value={officeColor}
                  onChange={(e) => setOfficeColor(e.target.value)}
                  placeholder="Leave blank for automatic"
                  className="h-10 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateOffice}
                disabled={creating}
                className="bg-primary hover:bg-pp-blue-dark text-white"
              >
                {creating ? 'Creating…' : 'Create Office'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

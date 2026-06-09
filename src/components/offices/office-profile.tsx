'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Pencil, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { colorFromName, resolveOfficeColor } from '@/lib/offices'
import { updateOffice } from '@/server/actions/offices'
import { toast } from 'sonner'
import type { Office, Patient } from '@/lib/patient-utils'
import type { OfficeProfile as OP, calls as CallsTable } from '@/db/schema'

interface OfficeProfileProps {
  office: Office
  officePatients: Patient[]
  officeCalls: (typeof CallsTable.$inferSelect)[]
}

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
const DAY_LABELS: Record<string, string> = {
  mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday',
  fri: 'Friday', sat: 'Saturday', sun: 'Sunday',
}

export function OfficeProfile({ office, officePatients, officeCalls }: OfficeProfileProps) {
  const [editMode, setEditMode] = useState(false)
  const [profile, setProfile] = useState((office.profile as OP & Record<string, unknown>) ?? {})
  const [customColor, setCustomColor] = useState(office.color?.trim() ?? '')
  const [saving, setSaving] = useState(false)
  const displayColor = resolveOfficeColor({ name: office.name, color: customColor || null })
  const autoColor = colorFromName(office.name)

  function setField(key: string, val: unknown) {
    setProfile((p) => ({ ...p, [key]: val }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateOffice(office.key, { profile: profile as OP, color: customColor || null })
      toast.success('Office profile saved.')
      setEditMode(false)
    } catch {
      toast.error('Failed to save office profile.')
    } finally {
      setSaving(false)
    }
  }

  const hours = (profile.hours as Record<string, Record<string, string>>) ?? {}
  const team = (profile.team as Array<{ position: string; name: string; notes: string }>) ?? []

  return (
    <div className="p-7 space-y-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link href="/offices" className="text-sm text-primary hover:underline flex items-center gap-1">
          <ChevronLeft size={14} /> Offices
        </Link>
        <span className="text-border">/</span>
        <span className="text-sm font-bold text-foreground flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: displayColor }} />
          {office.name}
        </span>
        <div className="ml-auto flex gap-2">
          {editMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditMode(false)
                  setProfile((office.profile as OP & Record<string, unknown>) ?? {})
                  setCustomColor(office.color?.trim() ?? '')
                }}
              >
                <X size={13} className="mr-1" /> Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
                className="bg-pp-success hover:bg-pp-success-hover text-white"
              >
                <Check size={13} className="mr-1" /> {saving ? 'Saving…' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditMode(true)} className="bg-primary hover:bg-pp-blue-dark text-white">
              <Pencil size={13} className="mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* Main info card */}
        <div className="col-span-2 space-y-5">
          {/* Identity */}
          <ProfileSection title="Identity & Contact" editMode={editMode}>
            <div className="mb-4 pb-4 border-b border-border">
              <Label className="text-xs font-semibold text-muted-foreground">Brand Color</Label>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-lg border border-border flex-shrink-0"
                  style={{ backgroundColor: displayColor }}
                />
                {editMode ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Input
                      type="color"
                      value={customColor || autoColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="h-9 w-14 p-1 cursor-pointer"
                    />
                    <Input
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder={`Auto: ${autoColor}`}
                      className="h-9 w-36 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCustomColor('')}
                    >
                      Use automatic
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-foreground">
                    {customColor ? (
                      <span className="font-mono">{customColor}</span>
                    ) : (
                      <>Automatic from name <span className="font-mono text-muted-foreground">({autoColor})</span></>
                    )}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <PF label="Practice Phone" value={profile.practicePhone as string ?? ''} editMode={editMode} onChange={(v) => setField('practicePhone', v)} />
              <PF label="Website" value={profile.website as string ?? ''} editMode={editMode} onChange={(v) => setField('website', v)} />
              <PF label="Practice Email" value={profile.practiceEmail as string ?? ''} editMode={editMode} onChange={(v) => setField('practiceEmail', v)} />
              <PF label="Insurance Email" value={profile.insuranceEmail as string ?? ''} editMode={editMode} onChange={(v) => setField('insuranceEmail', v)} />
              <PF label="Address" value={profile.address as string ?? ''} editMode={editMode} onChange={(v) => setField('address', v)} />
              <PF label="City" value={profile.city as string ?? ''} editMode={editMode} onChange={(v) => setField('city', v)} />
              <PF label="Dental Software" value={profile.dentalSoftware as string ?? ''} editMode={editMode} onChange={(v) => setField('dentalSoftware', v)} />
              <PF label="Contract Start" value={profile.contractStart as string ?? ''} editMode={editMode} onChange={(v) => setField('contractStart', v)} />
            </div>
          </ProfileSection>

          {/* Protocols */}
          <ProfileSection title="Protocols" editMode={editMode}>
            <div className="space-y-3">
              <PTA label="Office Greeting" value={profile.officeGreeting as string ?? ''} editMode={editMode} onChange={(v) => setField('officeGreeting', v)} />
              <PTA label="Emergency Protocol" value={profile.emergencyProtocol as string ?? ''} editMode={editMode} onChange={(v) => setField('emergencyProtocol', v)} />
              <PTA label="Cancellation Policy" value={profile.cancellationPolicy as string ?? ''} editMode={editMode} onChange={(v) => setField('cancellationPolicy', v)} />
              <PTA label="Important Notes" value={profile.importantNotes as string ?? ''} editMode={editMode} onChange={(v) => setField('importantNotes', v)} />
            </div>
          </ProfileSection>

          {/* Hours */}
          <ProfileSection title="Office Hours" editMode={editMode}>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-bold text-muted-foreground">Day</th>
                  <th className="text-left py-2 px-2 text-xs font-bold text-muted-foreground">Clinical Open</th>
                  <th className="text-left py-2 px-2 text-xs font-bold text-muted-foreground">Clinical Close</th>
                  <th className="text-left py-2 px-2 text-xs font-bold text-muted-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => {
                  const h = hours[day] ?? {}
                  return (
                    <tr key={day} className="border-b border-muted">
                      <td className="py-2 px-2 font-semibold text-secondary-foreground">{DAY_LABELS[day]}</td>
                      <td className="py-2 px-2 text-foreground">
                        {editMode ? (
                          <Input value={h.clinicalOpen ?? ''} className="h-7 text-xs" onChange={(e) => setField('hours', { ...hours, [day]: { ...h, clinicalOpen: e.target.value } })} />
                        ) : h.clinicalOpen || '—'}
                      </td>
                      <td className="py-2 px-2 text-foreground">
                        {editMode ? (
                          <Input value={h.clinicalClose ?? ''} className="h-7 text-xs" onChange={(e) => setField('hours', { ...hours, [day]: { ...h, clinicalClose: e.target.value } })} />
                        ) : h.clinicalClose || '—'}
                      </td>
                      <td className="py-2 px-2 text-muted-foreground text-xs">{h.notes ?? ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </ProfileSection>
        </div>

        {/* Side panels */}
        <div className="space-y-5">
          {/* Quick stats */}
          <div className="bg-white rounded-xl border border-border shadow-sm p-4 space-y-3">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Practice Stats</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-extrabold text-foreground">{officePatients.length}</div>
                <div className="text-[10px] text-muted-foreground">Total Patients</div>
              </div>
              <div className="text-center p-2 bg-muted rounded-lg">
                <div className="text-lg font-extrabold text-pp-orange">{officeCalls.length}</div>
                <div className="text-[10px] text-muted-foreground">Total Calls</div>
              </div>
            </div>
          </div>

          {/* Team */}
          <ProfileSection title="Team" editMode={false}>
            <div className="space-y-3">
              {team.length === 0 && <p className="text-xs text-muted-foreground italic">No team members listed.</p>}
              {team.map((m, i) => (
                <div key={i} className="border border-border rounded-lg p-3">
                  <p className="text-xs font-bold text-foreground">{m.name}</p>
                  <p className="text-[10.5px] text-muted-foreground mb-1">{m.position}</p>
                  {m.notes && <p className="text-xs text-secondary-foreground leading-relaxed">{m.notes}</p>}
                </div>
              ))}
            </div>
          </ProfileSection>

          {/* Insurance */}
          <ProfileSection title="Insurance" editMode={editMode}>
            {(() => {
              const ins = (profile.insurance as Record<string, unknown>) ?? {}
              return (
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Bills directly</span>
                    <span className={cn('text-xs font-bold', ins.billDirectly ? 'text-pp-success' : 'text-destructive')}>
                      {ins.billDirectly ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs">Medicaid/Medicare</span>
                    <span className={cn('text-xs font-bold', ins.medicaidMedicare ? 'text-pp-success' : 'text-destructive')}>
                      {ins.medicaidMedicare ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {!!ins.notes && <p className="text-xs text-secondary-foreground mt-2">{String(ins.notes)}</p>}
                </div>
              )
            })()}
          </ProfileSection>
        </div>
      </div>
    </div>
  )
}

function ProfileSection({ title, editMode, children }: { title: string; editMode: boolean; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
      <div className={cn('px-5 py-3.5 flex items-center gap-2 border-b border-border', editMode && 'bg-pp-orange-edit')}>
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
        {editMode && <span className="text-xs text-pp-orange ml-auto font-semibold">Editing</span>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function PF({ label, value, editMode, onChange }: { label: string; value: string; editMode: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {editMode ? (
        <Input value={value} onChange={(e) => onChange(e.target.value)} className="h-9 text-sm" />
      ) : (
        <p className="text-sm text-foreground">{value || '—'}</p>
      )}
    </div>
  )
}

function PTA({ label, value, editMode, onChange }: { label: string; value: string; editMode: boolean; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-semibold text-muted-foreground">{label}</Label>
      {editMode ? (
        <Textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className="resize-none text-sm" />
      ) : (
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{value || '—'}</p>
      )}
    </div>
  )
}

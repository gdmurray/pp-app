'use client'

import Link from 'next/link'
import { Building2, ChevronRight, Users, Phone } from 'lucide-react'
import { OFFICE_COLORS } from '@/lib/offices'
import { patientIsBooked, type Patient, type Office } from '@/lib/patient-utils'
import type { calls as CallsTable } from '@/db/schema'

interface OfficesHomeProps {
  allOffices: Office[]
  allPatients: Patient[]
  allCalls: (typeof CallsTable.$inferSelect)[]
}

const DAY_LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

export function OfficesHome({ allOffices, allPatients, allCalls }: OfficesHomeProps) {
  return (
    <div className="p-7 space-y-6">
      <div className="grid grid-cols-3 gap-5">
        {allOffices.map((office) => {
          const color = OFFICE_COLORS[office.key as keyof typeof OFFICE_COLORS]
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
                    href={`/offices/${office.key}`}
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

      <div className="text-center p-5 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
        + Add Office — coming soon
      </div>
    </div>
  )
}

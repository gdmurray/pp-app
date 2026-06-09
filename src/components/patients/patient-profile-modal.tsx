'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  patientFullName, patientPhone, patientEmail, patientIsBooked,
  patientApptDate, patientApptTime, patientIsNew, formatDate, getOfficeColor,
  type Patient, type Office,
} from '@/lib/patient-utils'
import type { DiscoveryInfo, FinancialInfo, MedicalInfo, ConclusionInfo } from '@/db/schema'

interface PatientProfileModalProps {
  patient: Patient
  office?: Office
  open: boolean
  onClose: () => void
  onEdit: () => void
}

export function PatientProfileModal({ patient, office, open, onClose, onEdit }: PatientProfileModalProps) {
  const color = getOfficeColor(office?.key ?? '')
  const booked = patientIsBooked(patient)
  const disc = patient.discovery as DiscoveryInfo
  const fin = patient.financial as FinancialInfo
  const med = patient.medical as MedicalInfo
  const conc = patient.conclusion as ConclusionInfo
  const booking = patient.booking as { procedures?: string[]; priceQuoted?: string }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Color bar */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: color }} />

        <DialogHeader className="mt-2">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                {patientFullName(patient)}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {office?.name ?? '—'} • {patientIsNew(patient) ? 'New Patient' : 'Returning Patient'}
              </p>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                booked ? 'bg-pp-success-light text-pp-success' : 'bg-pp-orange-light text-pp-orange'
              }`}
            >
              {booked ? '✓ Booked' : 'Not Booked'}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Contact */}
          <Section title="Contact">
            <Row label="Phone" value={patientPhone(patient) || '—'} />
            <Row label="Email" value={patientEmail(patient) || '—'} />
            <Row label="Recorded" value={new Date(patient.recordedAt).toLocaleString()} />
          </Section>

          {/* Booking */}
          {booked && (
            <Section title="Appointment">
              <Row label="Date" value={formatDate(patientApptDate(patient))} />
              <Row label="Time" value={patientApptTime(patient) || '—'} />
              {booking?.procedures?.length ? (
                <Row label="Procedures" value={booking.procedures.join(', ')} />
              ) : null}
              {booking?.priceQuoted && <Row label="Price Quoted" value={booking.priceQuoted} />}
            </Section>
          )}

          {/* Discovery */}
          <Section title="Discovery">
            <Row label="Pain" value={disc?.pain ? `Yes (level ${disc.painLevel || '?'})` : 'No'} />
            <Row label="Sensitivity" value={disc?.sensitivity ? 'Yes' : 'No'} />
            {disc?.lastCleaning && <Row label="Last Cleaning" value={disc.lastCleaning} />}
          </Section>

          {/* Financial */}
          <Section title="Financial">
            <Row
              label="Insurance"
              value={
                fin?.insuranceStatus === 'provided'
                  ? `${fin.insuranceType === 'own' ? 'Own' : fin.insuranceType === 'medicaid' ? 'Medicaid' : 'Other/Spouse'} insurance`
                  : fin?.insuranceStatus === 'none'
                  ? 'No insurance (self-pay)'
                  : fin?.insuranceStatus === 'bring'
                  ? 'Will bring card'
                  : '—'
              }
            />
          </Section>

          {/* Conclusion checklist */}
          {conc && (
            <Section title="Conclusion Checklist">
              {Object.entries(conc).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={v ? 'text-pp-success' : 'text-muted-foreground'}>{v ? '✓' : '○'}</span>
                  <span className="text-sm text-secondary-foreground capitalize">
                    {k.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </Section>
          )}
        </div>

        <div className="flex gap-2 justify-end mt-4 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onEdit} className="bg-primary hover:bg-pp-blue-dark text-white">
            Edit Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{title}</h4>
      <div className="bg-muted rounded-lg p-3 space-y-1.5">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-xs font-semibold text-muted-foreground w-28 flex-shrink-0">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}

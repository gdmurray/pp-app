'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, ChevronRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resolveOfficeColor } from '@/lib/offices'
import { savePatient, getPatientById } from '@/server/actions/patients'
import { logCall } from '@/server/actions/calls'
import type { Office } from '@/lib/patient-utils'
import { useAppForm, DEFAULT_VALUES, FORM_OPTIONS } from './form-hook'
import { SectionCard } from './section-card'
import { PatientInfoSection } from './sections/patient-info-section'
import { DiscoverySection } from './sections/discovery-section'
import { BookingSection } from './sections/booking-section'
import { FinancialSection } from './sections/financial-section'
import { MedicalSection } from './sections/medical-section'
import { InquiriesSection } from './sections/inquiries-section'
import { ConclusionSection } from './sections/conclusion-section'
import { CallNotesSidebar } from './call-notes-sidebar'
import { SubmitConfirmModal } from '@/components/modals/submit-confirm-modal'
import { NoLeadModal } from '@/components/modals/no-lead-modal'
import { Button } from '@/components/ui/button'

interface OnboardingViewProps {
  offices: Office[]
  editPatientId?: string
}

export function OnboardingView({ offices, editPatientId }: OnboardingViewProps) {
  const router = useRouter()
  const [selectedOfficeKey, setSelectedOfficeKey] = useState('')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [noLeadOpen, setNoLeadOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // FORM_OPTIONS is a module-level constant — same reference every render.
  // onSubmit is added here (not in FORM_OPTIONS) so it can close over setSubmitOpen.
  // Validation via the Zod schema in FORM_OPTIONS runs first; modal only opens if valid.
  const form = useAppForm({
    ...FORM_OPTIONS,
    onSubmit: () => { setSubmitOpen(true) },
  })

  useEffect(() => {
    if (!editPatientId) return
    getPatientById(editPatientId).then((p) => {
      if (!p) return
      setEditMode(true)
      const office = offices.find((o) => o.id === p.officeId)
      if (office) setSelectedOfficeKey(office.key)
      form.reset({
        patient: p.patient ?? {},
        discovery: p.discovery ?? {},
        booking: p.booking ?? {},
        financial: p.financial ?? {},
        medical: p.medical ?? {},
        conclusion: p.conclusion ?? {},
        callNotes: p.callNotes ?? {},
        inquiries: p.inquiries ?? [],
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPatientId])

  async function handleSave() {
    const values = form.state.values
    if (!selectedOfficeKey) { toast.error('Please select an office first.'); return }
    setSaving(true)
    try {
      await savePatient({ officeKey: selectedOfficeKey, ...values }, editPatientId)
      toast.success(editMode ? 'Patient record updated.' : 'Patient saved successfully.')
      setSubmitOpen(false)
      form.reset(DEFAULT_VALUES)
      setSelectedOfficeKey('')
      setEditMode(false)
      router.push('/patients')
    } catch {
      toast.error('Failed to save patient. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleNoLead(reason: string, officeKeyOverride?: string) {
    const oKey = officeKeyOverride ?? selectedOfficeKey
    if (!oKey) { toast.error('Please select an office first.'); return }
    try {
      await logCall({ type: 'no_lead', officeKey: oKey, payload: { notes: reason } })
      toast.success('No-lead call logged.')
      setNoLeadOpen(false)
      form.reset(DEFAULT_VALUES)
      setSelectedOfficeKey('')
    } catch {
      toast.error('Failed to log no-lead call.')
    }
  }

  function handleClear() {
    form.reset(DEFAULT_VALUES)
    setSelectedOfficeKey('')
    setEditMode(false)
  }

  const selectedOffice = offices.find((o) => o.key === selectedOfficeKey)
  const officeColor = selectedOffice ? resolveOfficeColor(selectedOffice) : undefined
  const locked = !selectedOfficeKey

  return (
    <form.AppForm>
      <div className="flex h-full">
        {/* Main scrollable form area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-7 space-y-5">

            {/* Edit mode banner */}
            {editMode && (
              <div className="flex items-center gap-3 bg-pp-orange-edit border border-pp-orange/40 rounded-xl px-4 py-3">
                <span className="text-pp-orange font-bold text-sm">✏️ Edit Mode</span>
                <span className="text-sm text-secondary-foreground">
                  Editing existing patient record. Submit to save changes.
                </span>
                <button
                  className="ml-auto text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => router.push('/patients')}
                >
                  Cancel →
                </button>
              </div>
            )}

            {/* Office gate */}
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="section-card-header px-5 py-3.5 flex items-center gap-2">
                <Building2 size={15} className="text-white opacity-80" />
                <h2 className="text-sm font-bold text-white">Select Office</h2>
                <span className="ml-auto text-xs text-pp-orange font-semibold opacity-90">Required</span>
              </div>
              <div className="p-5 grid grid-cols-3 gap-3">
                {offices.map((o) => {
                  const color = resolveOfficeColor(o)
                  const selected = selectedOfficeKey === o.key
                  return (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setSelectedOfficeKey(o.key)}
                      className={cn(
                        'relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all font-semibold',
                        selected
                          ? 'border-current text-white'
                          : 'border-border text-secondary-foreground hover:border-primary hover:bg-accent',
                      )}
                      style={selected ? { backgroundColor: color, borderColor: color } : {}}
                    >
                      <span
                        className="text-sm font-black px-3 py-1.5 rounded-lg text-white"
                        style={{ backgroundColor: color }}
                      >
                        {o.abbr}
                      </span>
                      <span className={cn('text-sm', selected && 'text-white')}>{o.name}</span>
                      {selected && (
                        <span className="absolute top-2 right-2 w-4 h-4 bg-white/30 rounded-full flex items-center justify-center text-white text-xs">✓</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Section 1 — Patient Info */}
            <SectionCard number={1} title="Patient Information" locked={locked} officeColor={officeColor}>
              <PatientInfoSection />
            </SectionCard>

            {/* Section 2 — Discovery */}
            <SectionCard number={2} title="Discovery" locked={locked} officeColor={officeColor}>
              <DiscoverySection />
            </SectionCard>

            {/* Section 3 — Booking */}
            <SectionCard number={3} title="Book Appointment" locked={locked} officeColor={officeColor}>
              <BookingSection selectedOffice={selectedOffice} />
            </SectionCard>

            {/* Section 4 — Financial */}
            <SectionCard number={4} title="Financial" locked={locked} officeColor={officeColor}>
              <FinancialSection />
            </SectionCard>

            {/* Section 5 — Medical History */}
            <SectionCard number={5} title="Medical History" locked={locked} officeColor={officeColor}>
              <MedicalSection />
            </SectionCard>

            {/* Section 6 — Inquiries */}
            <SectionCard number={6} title="Inquiries" locked={locked} officeColor={officeColor}>
              <InquiriesSection selectedOffice={selectedOffice} />
            </SectionCard>

            {/* Section 7 — Conclusion */}
            <SectionCard number={7} title="Conclusion" locked={locked} officeColor={officeColor}>
              <ConclusionSection selectedOffice={selectedOffice} />
            </SectionCard>

            {/* Action bar */}
            <div className="flex items-center justify-between bg-white rounded-xl border border-border shadow-sm px-5 py-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClear}
                  className="text-muted-foreground border-border"
                >
                  Clear Form
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNoLeadOpen(true)}
                  className="text-pp-orange border-pp-orange/40 hover:bg-pp-orange-light"
                >
                  <Phone size={14} className="mr-1" />
                  No Lead
                </Button>
              </div>
              <Button
                size="sm"
                disabled={locked}
                onClick={() => {
                  if (!selectedOfficeKey) { toast.error('Please select an office first.'); return }
                  form.handleSubmit()
                }}
                className="bg-primary hover:bg-pp-blue-dark text-white font-semibold px-6"
                style={officeColor ? { backgroundColor: officeColor } : {}}
              >
                {editMode ? 'Save Changes' : 'Submit Patient'}
                <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>

        {/* Call notes sidebar */}
        <CallNotesSidebar />
      </div>

      {/* Modals — inside AppForm so they can access context if needed */}
      <form.Subscribe selector={(s) => ({
        firstName: s.values.patient?.firstName,
        lastName: s.values.patient?.lastName,
      })}>
        {({ firstName, lastName }) => (
          <SubmitConfirmModal
            open={submitOpen}
            onConfirm={handleSave}
            onCancel={() => setSubmitOpen(false)}
            loading={saving}
            patientName={[firstName, lastName].filter(Boolean).join(' ')}
            officeName={selectedOffice?.name}
            officeColor={officeColor}
          />
        )}
      </form.Subscribe>

      <NoLeadModal
        open={noLeadOpen}
        onClose={() => setNoLeadOpen(false)}
        onSubmit={handleNoLead}
        offices={offices}
        defaultOfficeKey={selectedOfficeKey}
      />
    </form.AppForm>
  )
}

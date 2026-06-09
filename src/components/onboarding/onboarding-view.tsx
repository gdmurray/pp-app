'use client'

import { useState, useEffect } from 'react'
import { useForm, formOptions } from '@tanstack/react-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Building2, ChevronRight, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { OFFICE_COLORS } from '@/lib/offices'
import { savePatient, getPatientById } from '@/server/actions/patients'
import { logCall } from '@/server/actions/calls'
import type { Office } from '@/lib/patient-utils'
import type { PatientFormData } from '@/server/actions/patients'
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

const DEFAULT_VALUES: Omit<PatientFormData, 'officeKey'> = {
  patient: { firstName:'', middleName:'', lastName:'', phone:'', email:'', gender:'', newPatient:undefined, referralSource:'' },
  discovery: { pain:false, sensitivity:false, painLevel:'', lastCleaning:'', lastExam:'', lastXrays:'', prevDentistName:'', prevDentistPhone:'', xrayTransfer:'' },
  booking: { booked:undefined, apptDate:'', apptTime:'', procedures:[], priceQuoted:'', reasonNotBooked:'', followUpDate:'', followUpTime:'' },
  financial: { insuranceStatus:undefined, insuranceType:'', own:{}, medicaid:{}, other:{}, noInsurance:{}, bring:{} },
  medical: { medications:'no', medicationsList:'', surgery:'no', surgeryDetails:'', highBloodPressure:'no', diabetes:'no', heartCondition:'no', heartDetails:'', allergies:'no', allergiesList:'', anythingElse:'' },
  conclusion: { locationConfirmed:false, cancellationPolicy:false, reiteratedTime:false, reiteratedDate:false, discussedParking:false, allQuestions:false, officeTour:false, emailedForms:false },
  callNotes: { patientInfo:'', discovery:'', booking:'', financial:'', medical:'', inquiry:'', conclusion:'' },
  inquiries: [],
}

// Defined outside the component so the reference is stable across renders —
// prevents useForm from seeing new options on every render and potentially resetting
const FORM_OPTIONS = formOptions({ defaultValues: DEFAULT_VALUES })

export function OnboardingView({ offices, editPatientId }: OnboardingViewProps) {
  const router = useRouter()
  const [selectedOfficeKey, setSelectedOfficeKey] = useState('')
  const [submitOpen, setSubmitOpen] = useState(false)
  const [noLeadOpen, setNoLeadOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)

  // Cast to any: the child section components are all typed as AnyForm and the
  // SectionCard interface uses a looser type. The runtime form is fully typed.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm(FORM_OPTIONS) as any

  // Load patient for edit mode
  useEffect(() => {
    if (!editPatientId) return
    getPatientById(editPatientId).then((p) => {
      if (!p) return
      setEditMode(true)
      // We need to find the officeKey from the offices list
      const office = offices.find((o) => o.id === p.officeId)
      if (office) setSelectedOfficeKey(office.key)
      form.reset({
        patient: p.patient as PatientFormData['patient'],
        discovery: p.discovery as PatientFormData['discovery'],
        booking: p.booking as PatientFormData['booking'],
        financial: p.financial as PatientFormData['financial'],
        medical: p.medical as PatientFormData['medical'],
        conclusion: p.conclusion as PatientFormData['conclusion'],
        callNotes: p.callNotes as PatientFormData['callNotes'],
        inquiries: (p.inquiries as PatientFormData['inquiries']) ?? [],
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editPatientId])

  async function handleSubmit() {
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
  const officeColor = selectedOffice ? OFFICE_COLORS[selectedOffice.key as keyof typeof OFFICE_COLORS] : undefined
  const locked = !selectedOfficeKey

  return (
    <div className="flex h-full">
      {/* Main form */}
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
                const color = OFFICE_COLORS[o.key as keyof typeof OFFICE_COLORS]
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
          <SectionCard
            number={1}
            title="Patient Information"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['patient']}
          >
            <PatientInfoSection form={form} />
          </SectionCard>

          {/* Section 2 — Discovery */}
          <SectionCard
            number={2}
            title="Discovery"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['discovery']}
          >
            <DiscoverySection form={form} />
          </SectionCard>

          {/* Section 3 — Booking */}
          <SectionCard
            number={3}
            title="Book Appointment"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['booking']}
          >
            <BookingSection form={form} selectedOffice={selectedOffice} />
          </SectionCard>

          {/* Section 4 — Financial */}
          <SectionCard
            number={4}
            title="Financial"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['financial']}
          >
            <FinancialSection form={form} selectedOffice={selectedOffice} />
          </SectionCard>

          {/* Section 5 — Medical History */}
          <SectionCard
            number={5}
            title="Medical History"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['medical']}
          >
            <MedicalSection form={form} />
          </SectionCard>

          {/* Section 6 — Inquiries */}
          <SectionCard
            number={6}
            title="Inquiries"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['inquiries']}
          >
            <InquiriesSection form={form} selectedOffice={selectedOffice} />
          </SectionCard>

          {/* Section 7 — Conclusion */}
          <SectionCard
            number={7}
            title="Conclusion"
            locked={locked}
            officeColor={officeColor}
            form={form}
            fieldKeys={['conclusion']}
          >
            <ConclusionSection form={form} selectedOffice={selectedOffice} />
          </SectionCard>

          {/* Action buttons */}
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
              onClick={() => setSubmitOpen(true)}
              className="bg-primary hover:bg-pp-blue-dark text-white font-semibold px-6"
              style={officeColor ? { backgroundColor: officeColor } : {}}
            >
              {editMode ? 'Save Changes' : 'Submit Patient'}
              <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Call Notes Sidebar */}
      <CallNotesSidebar form={form} />

      {/* Modals */}
      <SubmitConfirmModal
        open={submitOpen}
        onConfirm={handleSubmit}
        onCancel={() => setSubmitOpen(false)}
        loading={saving}
        patientName={[
          (form.state.values.patient as { firstName?: string })?.firstName,
          (form.state.values.patient as { lastName?: string })?.lastName,
        ].filter(Boolean).join(' ')}
        officeName={selectedOffice?.name}
        officeColor={officeColor}
      />
      <NoLeadModal
        open={noLeadOpen}
        onClose={() => setNoLeadOpen(false)}
        onSubmit={handleNoLead}
        offices={offices}
        defaultOfficeKey={selectedOfficeKey}
      />
    </div>
  )
}

'use client'
import { z } from 'zod'
import { createFormHook, createFormHookContexts, formOptions } from '@tanstack/react-form'
import type {
  PatientInfo, DiscoveryInfo, BookingInfo, FinancialInfo,
  MedicalInfo, ConclusionInfo, CallNotes, InquiryEntry,
} from '@/db/schema'

// ─── Form value type ──────────────────────────────────────────────────────────

export interface OnboardingFormValues {
  patient: PatientInfo
  discovery: DiscoveryInfo
  booking: BookingInfo
  financial: FinancialInfo
  medical: MedicalInfo
  conclusion: ConclusionInfo
  callNotes: CallNotes
  inquiries: InquiryEntry[]
}

// ─── Zod validation schema ────────────────────────────────────────────────────
// All fields use .optional() to match the TypeScript interface (everything is
// optional in PatientInfo etc). Required-on-submit fields use .superRefine().

const requiredString = (message: string) =>
  z.string().optional().superRefine((val, ctx) => {
    if (!val || val.trim().length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message })
    }
  })

export const formSchema = z.object({
  patient: z.object({
    firstName: requiredString('First name is required'),
    lastName: requiredString('Last name is required'),
    phone: requiredString('Phone number is required'),
    middleName: z.string().optional(),
    email: z.string().optional(),
    gender: z.string().optional(),
    newPatient: z.enum(['Yes', 'No']).optional(),
    referralSource: z.string().optional(),
  }),
  discovery: z.object({
    pain: z.boolean().optional(),
    sensitivity: z.boolean().optional(),
    painLevel: z.string().optional(),
    lastCleaning: z.string().optional(),
    lastExam: z.string().optional(),
    lastXrays: z.string().optional(),
    prevDentistName: z.string().optional(),
    prevDentistPhone: z.string().optional(),
    xrayTransfer: z.string().optional(),
  }),
  booking: z.object({
    booked: z.enum(['yes', 'no']).optional(),
    apptDate: z.string().optional(),
    apptTime: z.string().optional(),
    procedures: z.array(z.string()).optional(),
    priceQuoted: z.string().optional(),
    reasonNotBooked: z.string().optional(),
    followUpDate: z.string().optional(),
    followUpTime: z.string().optional(),
  }),
  financial: z.object({
    insuranceStatus: z.enum(['provided', 'none', 'bring']).optional(),
    insuranceType: z.enum(['own', 'medicaid', 'other', '']).optional(),
    own: z.object({
      ssn: z.string().optional(), company: z.string().optional(),
      policy: z.string().optional(), group: z.string().optional(),
      employer: z.string().optional(), dob: z.string().optional(),
      address: z.string().optional(), city: z.string().optional(),
      postal: z.string().optional(), state: z.string().optional(),
    }).optional(),
    medicaid: z.object({
      stateId: z.string().optional(), employer: z.string().optional(),
      dob: z.string().optional(), address: z.string().optional(),
      city: z.string().optional(), postal: z.string().optional(), state: z.string().optional(),
    }).optional(),
    other: z.object({
      holderName: z.string().optional(), relationship: z.string().optional(),
      holderDob: z.string().optional(), holderAddress: z.string().optional(),
      holderCity: z.string().optional(), holderPostal: z.string().optional(),
      holderState: z.string().optional(), patientDob: z.string().optional(),
      patientAddress: z.string().optional(), patientCity: z.string().optional(),
      patientPostal: z.string().optional(), patientState: z.string().optional(),
    }).optional(),
    noInsurance: z.object({
      dob: z.string().optional(), address: z.string().optional(),
      city: z.string().optional(), postal: z.string().optional(), state: z.string().optional(),
    }).optional(),
    bring: z.object({
      dob: z.string().optional(), address: z.string().optional(),
      city: z.string().optional(), postal: z.string().optional(), state: z.string().optional(),
    }).optional(),
  }),
  medical: z.object({
    medications: z.enum(['yes', 'no']).optional(),
    medicationsList: z.string().optional(),
    surgery: z.enum(['yes', 'no']).optional(),
    surgeryDetails: z.string().optional(),
    highBloodPressure: z.enum(['yes', 'no']).optional(),
    diabetes: z.enum(['yes', 'no']).optional(),
    heartCondition: z.enum(['yes', 'no']).optional(),
    heartDetails: z.string().optional(),
    allergies: z.enum(['yes', 'no']).optional(),
    allergiesList: z.string().optional(),
    anythingElse: z.string().optional(),
  }),
  conclusion: z.object({
    locationConfirmed: z.boolean().optional(),
    cancellationPolicy: z.boolean().optional(),
    reiteratedTime: z.boolean().optional(),
    reiteratedDate: z.boolean().optional(),
    discussedParking: z.boolean().optional(),
    allQuestions: z.boolean().optional(),
    officeTour: z.boolean().optional(),
    emailedForms: z.boolean().optional(),
  }),
  callNotes: z.object({
    patientInfo: z.string().optional(),
    discovery: z.string().optional(),
    booking: z.string().optional(),
    financial: z.string().optional(),
    medical: z.string().optional(),
    inquiry: z.string().optional(),
    conclusion: z.string().optional(),
  }),
  inquiries: z.array(z.object({
    treatmentName: z.string(),
    offered: z.enum(['yes', 'no']).optional(),
    fee: z.string().optional(),
    note: z.string().optional(),
  })),
})

// ─── Default values ───────────────────────────────────────────────────────────

export const DEFAULT_VALUES: OnboardingFormValues = {
  patient: {
    firstName: '', middleName: '', lastName: '', phone: '',
    email: '', gender: '', newPatient: undefined, referralSource: '',
  },
  discovery: {
    pain: false, sensitivity: false, painLevel: '', lastCleaning: '',
    lastExam: '', lastXrays: '', prevDentistName: '', prevDentistPhone: '', xrayTransfer: '',
  },
  booking: {
    booked: undefined, apptDate: '', apptTime: '', procedures: [],
    priceQuoted: '', reasonNotBooked: '', followUpDate: '', followUpTime: '',
  },
  financial: {
    insuranceStatus: undefined, insuranceType: '',
    own: {}, medicaid: {}, other: {}, noInsurance: {}, bring: {},
  },
  medical: {
    medications: 'no', medicationsList: '', surgery: 'no', surgeryDetails: '',
    highBloodPressure: 'no', diabetes: 'no', heartCondition: 'no', heartDetails: '',
    allergies: 'no', allergiesList: '', anythingElse: '',
  },
  conclusion: {
    locationConfirmed: false, cancellationPolicy: false, reiteratedTime: false,
    reiteratedDate: false, discussedParking: false, allQuestions: false,
    officeTour: false, emailedForms: false,
  },
  callNotes: {
    patientInfo: '', discovery: '', booking: '', financial: '',
    medical: '', inquiry: '', conclusion: '',
  },
  inquiries: [],
}

// ─── Form options ─────────────────────────────────────────────────────────────
// No explicit generic — TanStack Form docs say "Generics are grim".
// TypeScript infers TFormData = OnboardingFormValues from defaultValues.

export const FORM_OPTIONS = formOptions({
  defaultValues: DEFAULT_VALUES,
  validators: {
    onSubmit: formSchema,
  },
})

// ─── Context + typed hook ─────────────────────────────────────────────────────

export const {
  fieldContext,
  formContext,
  useFormContext,
} = createFormHookContexts()

export const { useAppForm, useTypedAppFormContext } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {},
  formComponents: {},
})

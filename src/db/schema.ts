import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  date,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Offices ──────────────────────────────────────────────────────────────────

export const offices = pgTable(
  "offices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(), // 'sunset' | 'mountain' | 'crown'
    name: text("name").notNull(),
    // Empty string = auto color from practice name (see resolveOfficeColor)
    color: text("color").notNull().default(""),
    abbr: text("abbr").notNull(),
    // Full rich profile stored as JSONB (team, treatments, hours, payment, etc.)
    profile: jsonb("profile").$type<OfficeProfile>().notNull().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("offices_key_idx").on(t.key)],
);

// ─── Patients ─────────────────────────────────────────────────────────────────

export const patients = pgTable(
  "patients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    officeId: uuid("office_id")
      .notNull()
      .references(() => offices.id, { onDelete: "restrict" }),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    // Form sections stored as JSONB — mirrors collectFormData() exactly
    patient: jsonb("patient").$type<PatientInfo>().notNull().default({}),
    discovery: jsonb("discovery").$type<DiscoveryInfo>().notNull().default({}),
    booking: jsonb("booking").$type<BookingInfo>().notNull().default({}),
    financial: jsonb("financial").$type<FinancialInfo>().notNull().default({}),
    medical: jsonb("medical").$type<MedicalInfo>().notNull().default({}),
    conclusion: jsonb("conclusion")
      .$type<ConclusionInfo>()
      .notNull()
      .default({}),
    // Notes sidebar (7 sections — not persisted in HTML, fixed here)
    callNotes: jsonb("call_notes").$type<CallNotes>().notNull().default({}),
    // Inquiry table per-patient interest (not persisted in HTML, fixed here)
    inquiries: jsonb("inquiries").$type<InquiryEntry[]>().notNull().default([]),
  },
  (t) => [
    index("patients_office_id_idx").on(t.officeId),
    index("patients_recorded_at_idx").on(t.recordedAt),
  ],
);

// ─── Calls ────────────────────────────────────────────────────────────────────

export const calls = pgTable(
  "calls",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    officeId: uuid("office_id")
      .notNull()
      .references(() => offices.id, { onDelete: "restrict" }),
    type: text("type").$type<"missed" | "no_lead">().notNull(),
    recordedAt: timestamp("recorded_at").notNull().defaultNow(),
    payload: jsonb("payload").$type<CallPayload>().notNull().default({}),
  },
  (t) => [
    index("calls_office_id_idx").on(t.officeId),
    index("calls_recorded_at_idx").on(t.recordedAt),
    index("calls_type_idx").on(t.type),
  ],
);

// ─── Billing Reconciliation ────────────────────────────────────────────────────

export const billingReconciliation = pgTable(
  "billing_reconciliation",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patients.id, { onDelete: "cascade" }),
    officeId: uuid("office_id")
      .notNull()
      .references(() => offices.id, { onDelete: "restrict" }),
    // First day of the reconciliation month, e.g. '2026-06-01'
    reconciliationMonth: date("reconciliation_month").notNull(),
    // All billing fields stored as JSONB (attended, billing amounts, notes, etc.)
    fields: jsonb("fields").$type<BillingFields>().notNull().default({}),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    unique("billing_reconciliation_unique").on(
      t.patientId,
      t.officeId,
      t.reconciliationMonth,
    ),
    index("billing_rec_office_month_idx").on(t.officeId, t.reconciliationMonth),
    index("billing_rec_patient_idx").on(t.patientId),
  ],
);

// ─── Relations ────────────────────────────────────────────────────────────────

export const officesRelations = relations(offices, ({ many }) => ({
  patients: many(patients),
  calls: many(calls),
  billingReconciliation: many(billingReconciliation),
}));

export const patientsRelations = relations(patients, ({ one, many }) => ({
  office: one(offices, {
    fields: [patients.officeId],
    references: [offices.id],
  }),
  billingReconciliation: many(billingReconciliation),
}));

export const callsRelations = relations(calls, ({ one }) => ({
  office: one(offices, { fields: [calls.officeId], references: [offices.id] }),
}));

export const billingReconciliationRelations = relations(
  billingReconciliation,
  ({ one }) => ({
    patient: one(patients, {
      fields: [billingReconciliation.patientId],
      references: [patients.id],
    }),
    office: one(offices, {
      fields: [billingReconciliation.officeId],
      references: [offices.id],
    }),
  }),
);

// ─── TypeScript interfaces for JSONB columns ──────────────────────────────────

export interface OfficeProfile {
  principleLastName?: string;
  principleFirstName?: string;
  principlePreferredName?: string;
  address?: string;
  city?: string;
  province?: string;
  postal?: string;
  practicePhone?: string;
  ownerCell?: string;
  omCell?: string;
  website?: string;
  practiceEmail?: string;
  insuranceEmail?: string;
  locationDescription?: string;
  officeGreeting?: string;
  emergencyProtocol?: string;
  cancellationPolicy?: string;
  appointmentUnit?: string;
  appointmentNotes?: Record<string, string>;
  importantNotes?: string;
  dentalSoftware?: string;
  dentalSoftwareNotes?: string;
  contractStart?: string;
  monthlyFee?: string;
  promote?: Record<string, boolean | string>;
  payment?: Record<string, boolean>;
  insurance?: {
    billDirectly?: boolean;
    medicaidMedicare?: boolean;
    notes?: string;
    copaymentRequired?: boolean;
    contactBeforeAppt?: boolean;
  };
  team?: Array<{ position: string; name: string; notes: string }>;
  hours?: Record<
    string,
    {
      adminOpen?: string;
      adminLunch?: string;
      adminClose?: string;
      clinicalOpen?: string;
      clinicalLunch?: string;
      clinicalClose?: string;
      notes?: string;
    }
  >;
  treatments?: Record<string, { offered: boolean; fee: string; notes: string }>;
}

export interface PatientInfo {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  gender?: string;
  newPatient?: "Yes" | "No";
  referralSource?: string;
}

export interface DiscoveryInfo {
  pain?: boolean;
  sensitivity?: boolean;
  painLevel?: string;
  lastCleaning?: string;
  lastExam?: string;
  lastXrays?: string;
  prevDentistName?: string;
  prevDentistPhone?: string;
  xrayTransfer?: string;
}

export interface BookingInfo {
  booked?: "yes" | "no";
  apptDate?: string;
  apptTime?: string;
  procedures?: string[];
  priceQuoted?: string;
  reasonNotBooked?: string;
  followUpDate?: string;
  followUpTime?: string;
}

export interface FinancialInfo {
  insuranceStatus?: "provided" | "none" | "bring";
  insuranceType?: "own" | "medicaid" | "other" | "";
  own?: {
    ssn?: string;
    company?: string;
    policy?: string;
    group?: string;
    employer?: string;
    dob?: string;
    address?: string;
    city?: string;
    postal?: string;
    state?: string;
  };
  medicaid?: {
    stateId?: string;
    employer?: string;
    dob?: string;
    address?: string;
    city?: string;
    postal?: string;
    state?: string;
  };
  other?: {
    holderName?: string;
    relationship?: string;
    holderDob?: string;
    holderAddress?: string;
    holderCity?: string;
    holderPostal?: string;
    holderState?: string;
    patientDob?: string;
    patientAddress?: string;
    patientCity?: string;
    patientPostal?: string;
    patientState?: string;
  };
  noInsurance?: {
    dob?: string;
    address?: string;
    city?: string;
    postal?: string;
    state?: string;
  };
  bring?: {
    dob?: string;
    address?: string;
    city?: string;
    postal?: string;
    state?: string;
  };
}

export interface MedicalInfo {
  medications?: "yes" | "no";
  medicationsList?: string;
  surgery?: "yes" | "no";
  surgeryDetails?: string;
  highBloodPressure?: "yes" | "no";
  diabetes?: "yes" | "no";
  heartCondition?: "yes" | "no";
  heartDetails?: string;
  allergies?: "yes" | "no";
  allergiesList?: string;
  anythingElse?: string;
}

export interface ConclusionInfo {
  locationConfirmed?: boolean;
  cancellationPolicy?: boolean;
  reiteratedTime?: boolean;
  reiteratedDate?: boolean;
  discussedParking?: boolean;
  allQuestions?: boolean;
  officeTour?: boolean;
  emailedForms?: boolean;
}

export interface CallNotes {
  patientInfo?: string;
  discovery?: string;
  booking?: string;
  financial?: string;
  medical?: string;
  inquiry?: string;
  conclusion?: string;
}

export interface InquiryEntry {
  treatmentName: string;
  offered?: "yes" | "no";
  fee?: string;
  note?: string;
}

export interface CallPayload {
  voicemail?: "yes" | "no";
  callbackTime?: string;
  notes?: string;
  callerFirst?: string;
  callerLast?: string;
  callerPhone?: string;
}

export interface BillingFields {
  attendedAppt?: "yes" | "no" | "pending";
  firstApptBilling?: string;
  secondApptDate?: string;
  secondApptBilling?: string;
  ninetyDayBilling?: string;
  contactType?: string;
  newApptDate?: string;
  notes?: string;
  removedFromSecond?: boolean;
  scheduledAnother?: "yes" | "no";
  // Legacy alias from older HTML versions
  attended?: "yes" | "no" | "pending";
  amountBilled?: string;
}

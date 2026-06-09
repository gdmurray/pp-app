/**
 * Seed script — run with: pnpm drizzle-kit push && npx tsx src/db/seed.ts
 *
 * Seeds the three office profiles from the HTML prototype's getOfficeSeed() function
 * and generates ~10 demo patients for Sunset Dental.
 */
import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'
import type {
  OfficeProfile, PatientInfo, DiscoveryInfo, BookingInfo,
  FinancialInfo, MedicalInfo, ConclusionInfo, CallNotes
} from './schema'

const client = postgres(process.env.DATABASE_URL!, { prepare: false, max: 1 })
const db = drizzle(client, { schema })

// ─── Treatments builder ───────────────────────────────────────────────────────

const TREATMENT_KEYS = [
  'bondedInlays','braces','bridges','cerec','cosmeticMakeovers','dentures',
  'diagnodent','digitalXrays','endodontics','fillings','implants','smiledirect',
  'laserGums','laserHard','nightGuard','oralSurgery','panCeph','pedo',
  'periodontist','theaterGlasses','sedationIV','rootCanal','sedationNitrous',
  'sedationOral','sleepApnea','snoreGuards','sportsGuard','tmj','tonsilStones',
  'veneers','whiteningInOffice','whiteningTakeHome',
]

function buildTreatments(overrides: Record<string, { offered: boolean; fee: string; notes: string }>) {
  const result: Record<string, { offered: boolean; fee: string; notes: string }> = {}
  for (const key of TREATMENT_KEYS) {
    result[key] = overrides[key] ?? { offered: false, fee: '', notes: '' }
  }
  return result
}

// ─── Office profiles (verbatim from HTML getOfficeSeed()) ─────────────────────

const OFFICE_SEEDS: Array<{
  key: string; name: string; color: string; abbr: string; profile: OfficeProfile
}> = [
  {
    key: 'sunset', name: 'Sunset Dental', color: '', abbr: 'SD',
    profile: {
      principleLastName: 'Martinez', principleFirstName: 'Sarah', principlePreferredName: 'Dr. Sarah',
      address: '4520 E. Colfax Ave, Suite 300', city: 'Denver', province: 'CO', postal: '80220',
      practicePhone: '(720) 555-0198', ownerCell: '(720) 555-2341', omCell: '(720) 555-4567',
      website: 'www.sunsetdental.com', practiceEmail: 'info@sunsetdental.com',
      insuranceEmail: 'insurance@sunsetdental.com',
      locationDescription: 'Corner of Colfax Ave and Dahlia St, ground floor',
      promote: { onePatient:true, onTime:true, careCallsAfterTx:true, discountPlan:true, theaterGlasses:true, freeSecondOpinion:true, freeCosmeticConsult:true, freeParking:true, sameDayEmergency:true, friendlyEnvironment:true, languages:'Spanish' },
      team: [
        { position:'Principal Dentist', name:'Dr. Sarah Martinez', notes:'Cosmetic and restorative specialist with 14 years experience. Warm chairside manner, thorough with new patient exams.' },
        { position:'Office Manager', name:'Jennifer Walsh', notes:'Handles all admin operations. Patient-focused, excellent with insurance coordination and scheduling.' },
        { position:'Insurance Coordinator', name:'David Kim', notes:'25 years insurance experience. Detail-oriented, will help patients maximize their benefits.' },
        { position:'Dental Assistant', name:'Alex Torres', notes:'Gentle and efficient. Great with anxious patients and children.' },
      ],
      officeGreeting: 'Thank you for calling Sunset Dental. This is ___ speaking. How may I assist you?',
      emergencyProtocol: 'We can accommodate emergency exams same day during normal business hours. Book the patient next to an existing gap in the schedule. Advise the patient there may be a short wait but we will see them today.',
      cancellationPolicy: 'We require 48 business hours notice for cancellations. Patients who cancel with less notice will be rescheduled 2–3 weeks out, even if openings exist. After two cancellations, prime appointment slots (9am and 4–6pm) are no longer offered. After a third cancellation, the patient is moved to same-day scheduling only.',
      payment: { cash:false, cheque:false, electronicTransfer:true, discover:true, mastercard:true, visa:true, inOfficeFinancing:false, fsaHsa:true, carecredit:true },
      insurance: { billDirectly:true, medicaidMedicare:false, notes:'In-network PPO plans only. No HMO or Medicaid.', copaymentRequired:true, contactBeforeAppt:false },
      appointmentUnit: '10 min',
      appointmentNotes: { arriveBefore:'5 min early', txCoordBefore:'Follow scheduling handbook', newPatientExamXrays:'6 units', emergencyExamXrays:'3 units', xraysAdditional:'2 units', initialCleaning:'6 units', txCoordAfter:'1 unit', implantConsult:'4 units' },
      treatments: buildTreatments({ bondedInlays:{offered:true,fee:'$1,200',notes:''}, bridges:{offered:true,fee:'$2,500',notes:''}, cosmeticMakeovers:{offered:true,fee:'$8,000+',notes:''}, dentures:{offered:true,fee:'$2,000',notes:''}, digitalXrays:{offered:true,fee:'$150',notes:''}, endodontics:{offered:true,fee:'$1,100',notes:''}, fillings:{offered:true,fee:'$250',notes:''}, implants:{offered:true,fee:'$4,000',notes:''}, smiledirect:{offered:true,fee:'$1,950',notes:''}, nightGuard:{offered:true,fee:'$500',notes:''}, oralSurgery:{offered:true,fee:'$400',notes:''}, panCeph:{offered:true,fee:'$200',notes:''}, pedo:{offered:true,fee:'$150+',notes:''}, theaterGlasses:{offered:true,fee:'Complimentary',notes:'Drug-free anxiety management.'}, rootCanal:{offered:true,fee:'$1,100',notes:''}, sedationOral:{offered:true,fee:'$200',notes:'Oral sedatives only. Patient must have a driver.'}, sleepApnea:{offered:true,fee:'$2,500',notes:''}, snoreGuards:{offered:true,fee:'$1,000',notes:''}, sportsGuard:{offered:true,fee:'$450',notes:''}, tmj:{offered:true,fee:'$800',notes:''}, veneers:{offered:true,fee:'$1,000',notes:''}, whiteningInOffice:{offered:true,fee:'$600',notes:''}, whiteningTakeHome:{offered:true,fee:'$300',notes:''} }),
      hours: { mon:{adminOpen:'8:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'5:00 PM'}, tue:{adminOpen:'8:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'5:00 PM'}, wed:{adminOpen:'8:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'5:00 PM'}, thu:{adminOpen:'8:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'5:00 PM'}, fri:{adminOpen:'8:00 AM',adminClose:'2:00 PM',clinicalOpen:'Closed',clinicalClose:''}, sat:{adminOpen:'Closed',clinicalOpen:'Closed'}, sun:{adminOpen:'Closed',clinicalOpen:'Closed'} },
      dentalSoftware: 'Dentrix', dentalSoftwareNotes: 'Cloud version. Login credentials in shared admin doc.',
      importantNotes: 'Order of booking: (1) Hygiene NP Exam/X-rays/Cleaning — 6 units. After booking: email office and insurance email with patient name, insurance info, appointment date and time. Email new patient forms to patient immediately and remind to complete at least 48 hours before appointment.',
      contractStart: '2024-03-01', monthlyFee: '$850',
    },
  },
  {
    key: 'mountain', name: 'Mountain Dental', color: '', abbr: 'MD',
    profile: {
      principleLastName: 'Chen', principleFirstName: 'James', principlePreferredName: 'Dr. James',
      address: '2150 Canyon Blvd, Suite 100', city: 'Boulder', province: 'CO', postal: '80302',
      practicePhone: '(303) 555-0147', ownerCell: '(303) 555-8821', omCell: '(303) 555-6690',
      website: 'www.mountaindentalco.com', practiceEmail: 'info@mountaindental.com',
      insuranceEmail: 'billing@mountaindental.com',
      locationDescription: 'Canyon Blvd between 20th and 22nd St, second building on the right',
      promote: { onePatient:true, onTime:true, careCallsAfterTx:true, discountPlan:false, theaterGlasses:false, freeSecondOpinion:true, freeCosmeticConsult:false, freeParking:true, sameDayEmergency:true, friendlyEnvironment:true, languages:'Spanish, Mandarin' },
      team: [
        { position:'Principal Dentist', name:'Dr. James Chen', notes:'General and family dentistry focus. 18 years experience. Known for gentle technique with anxious patients and children.' },
        { position:'Office Manager', name:'Rachel Torres', notes:'Operations and patient relations. Detail-oriented, handles complex insurance cases.' },
        { position:'Dental Hygienist', name:'Monica Ellis', notes:'12 years experience. Specializes in periodontal care and patient education.' },
        { position:'Dental Assistant', name:'Kevin Park', notes:'Efficient and patient. Great with pediatric patients.' },
      ],
      officeGreeting: 'Thank you for calling Mountain Dental. This is ___ speaking. How may I help you today?',
      emergencyProtocol: 'Emergency exams can be fit in same day by booking adjacent to an existing appointment slot. Advise the patient there may be a brief wait. Prioritize pain and swelling cases.',
      cancellationPolicy: '48-hour cancellation notice required. Short-notice cancellations are rescheduled 2 weeks out. Repeat offenders (3+) moved to same-day scheduling only and no longer offered peak-hour slots.',
      payment: { cash:true, cheque:true, electronicTransfer:true, discover:true, mastercard:true, visa:true, inOfficeFinancing:true, fsaHsa:true, carecredit:true },
      insurance: { billDirectly:true, medicaidMedicare:true, notes:'Accepts most PPO plans and Colorado Medicaid. Contact office to verify specific plans.', copaymentRequired:true, contactBeforeAppt:true },
      appointmentUnit: '10 min',
      appointmentNotes: { arriveBefore:'5 min early', txCoordBefore:'Follow scheduling handbook', newPatientExamXrays:'6 units', emergencyExamXrays:'3 units', xraysAdditional:'2 units', initialCleaning:'5 units', txCoordAfter:'1 unit', implantConsult:'4 units' },
      treatments: buildTreatments({ bondedInlays:{offered:true,fee:'$1,100',notes:''}, bridges:{offered:true,fee:'$2,200',notes:''}, cerec:{offered:true,fee:'$1,400',notes:'Same-day crowns available'}, cosmeticMakeovers:{offered:true,fee:'$7,500+',notes:''}, dentures:{offered:true,fee:'$1,800',notes:''}, diagnodent:{offered:true,fee:'$75',notes:''}, digitalXrays:{offered:true,fee:'$125',notes:''}, endodontics:{offered:true,fee:'$1,050',notes:''}, fillings:{offered:true,fee:'$220',notes:''}, implants:{offered:true,fee:'$3,800',notes:''}, laserGums:{offered:true,fee:'$600',notes:'Soft tissue laser for gum recontouring'}, nightGuard:{offered:true,fee:'$480',notes:''}, oralSurgery:{offered:true,fee:'$380',notes:''}, panCeph:{offered:true,fee:'$180',notes:''}, pedo:{offered:true,fee:'$130+',notes:'Family-friendly, gentle with children'}, rootCanal:{offered:true,fee:'$1,050',notes:''}, sedationNitrous:{offered:true,fee:'$150',notes:'Nitrous oxide available for anxious patients'}, sedationOral:{offered:true,fee:'$180',notes:'Oral anxiolytics available with driver required'}, snoreGuards:{offered:true,fee:'$950',notes:''}, sportsGuard:{offered:true,fee:'$420',notes:''}, tmj:{offered:true,fee:'$750',notes:''}, veneers:{offered:true,fee:'$900',notes:''}, whiteningInOffice:{offered:true,fee:'$550',notes:''}, whiteningTakeHome:{offered:true,fee:'$280',notes:''} }),
      hours: { mon:{adminOpen:'7:30 AM',adminClose:'5:00 PM',clinicalOpen:'8:00 AM',clinicalLunch:'12:00 PM',clinicalClose:'4:30 PM'}, tue:{adminOpen:'7:30 AM',adminClose:'5:00 PM',clinicalOpen:'8:00 AM',clinicalLunch:'12:00 PM',clinicalClose:'4:30 PM'}, wed:{adminOpen:'7:30 AM',adminClose:'5:00 PM',clinicalOpen:'8:00 AM',clinicalLunch:'12:00 PM',clinicalClose:'4:30 PM'}, thu:{adminOpen:'7:30 AM',adminClose:'5:00 PM',clinicalOpen:'8:00 AM',clinicalLunch:'12:00 PM',clinicalClose:'4:30 PM'}, fri:{adminOpen:'7:30 AM',adminClose:'2:00 PM',clinicalOpen:'8:00 AM',clinicalClose:'1:00 PM'}, sat:{adminOpen:'Closed',clinicalOpen:'Closed'}, sun:{adminOpen:'Closed',clinicalOpen:'Closed'} },
      dentalSoftware: 'Eaglesoft', dentalSoftwareNotes: 'Version 21. Separate login from other offices.',
      importantNotes: 'Order of booking: NP Exam + X-rays + Cleaning same appointment where possible — 6 units. After booking: email both office and billing email with patient info and insurance details. Remind patient to complete new patient forms 48 hours before appointment.',
      contractStart: '2024-07-15', monthlyFee: '$850',
    },
  },
  {
    key: 'crown', name: 'Crown Dental', color: '', abbr: 'CD',
    profile: {
      principleLastName: 'Thornton', principleFirstName: 'Emily', principlePreferredName: 'Dr. Emily',
      address: '1840 N. Nevada Ave, Suite 210', city: 'Colorado Springs', province: 'CO', postal: '80907',
      practicePhone: '(719) 555-0233', ownerCell: '(719) 555-1142', omCell: '(719) 555-3378',
      website: 'www.crowndentistry.com', practiceEmail: 'info@crowndentistry.com',
      insuranceEmail: 'insurance@crowndentistry.com',
      locationDescription: 'N. Nevada Ave near Garden of the Gods Rd intersection. Second floor of the Northgate Medical Plaza.',
      promote: { onePatient:true, onTime:true, careCallsAfterTx:true, discountPlan:true, theaterGlasses:true, freeSecondOpinion:true, freeCosmeticConsult:true, freeParking:true, sameDayEmergency:false, friendlyEnvironment:true, languages:'Spanish, French' },
      team: [
        { position:'Principal Dentist', name:'Dr. Emily Thornton', notes:'Cosmetic and implant specialist. 20+ years experience, fellowship-trained in full mouth reconstruction. Calm and precise approach.' },
        { position:'Office Manager', name:'Sandra Blake', notes:'Boutique practice operations. Impeccable attention to patient experience and scheduling flow.' },
        { position:'Insurance Coordinator', name:'Marcus Webb', notes:'Insurance and financial planning specialist. Helps patients understand financing options including CareCredit and in-house plans.' },
        { position:'Dental Hygienist', name:'Laura Nguyen', notes:'Periodontal specialist. 15 years experience. Thorough and educational approach with patients.' },
        { position:'Dental Assistant', name:'Tyler Ross', notes:'Cosmetic and implant trained. Excellent with anxious patients during longer procedures.' },
      ],
      officeGreeting: 'Thank you for calling Crown Dental. This is ___ speaking. How may I assist you today?',
      emergencyProtocol: 'Crown Dental does not guarantee same-day emergency appointments but will make every effort to accommodate urgent cases within 24 hours. For severe pain or trauma, advise the patient to come in and we will assess as soon as possible.',
      cancellationPolicy: 'Strict 48-hour cancellation policy. Given the high-value nature of appointments (implants, cosmetics), late cancellations may incur a $75 fee at the dentist\'s discretion. Repeat cancellers are removed from the schedule entirely.',
      payment: { cash:false, cheque:false, electronicTransfer:true, discover:true, mastercard:true, visa:true, inOfficeFinancing:true, fsaHsa:true, carecredit:true },
      insurance: { billDirectly:true, medicaidMedicare:false, notes:'PPO plans only. Cosmetic procedures are not covered by insurance. In-house financing available for major cases.', copaymentRequired:true, contactBeforeAppt:true },
      appointmentUnit: '10 min',
      appointmentNotes: { arriveBefore:'10 min early for new patients', txCoordBefore:'Mandatory for all new patients', newPatientExamXrays:'6 units', emergencyExamXrays:'3 units', xraysAdditional:'2 units', initialCleaning:'6 units', txCoordAfter:'2 units for treatment planning', implantConsult:'6 units — detailed treatment plan presentation' },
      treatments: buildTreatments({ bondedInlays:{offered:true,fee:'$1,500',notes:''}, bridges:{offered:true,fee:'$3,000',notes:''}, cerec:{offered:true,fee:'$1,600',notes:'Same-day restorations available'}, cosmeticMakeovers:{offered:true,fee:'$10,000+',notes:'Full smile design consultations available'}, dentures:{offered:true,fee:'$2,400',notes:'Implant-supported dentures available'}, diagnodent:{offered:true,fee:'$85',notes:''}, digitalXrays:{offered:true,fee:'$175',notes:'3D cone beam CT also available'}, endodontics:{offered:true,fee:'$1,300',notes:''}, fillings:{offered:true,fee:'$300',notes:'Tooth-coloured composites only'}, implants:{offered:true,fee:'$5,000',notes:'All-on-4 and single implants. Fellowship-trained implant surgeon.'}, laserGums:{offered:true,fee:'$750',notes:'Laser gum recontouring for cosmetic cases'}, laserHard:{offered:true,fee:'$850',notes:''}, nightGuard:{offered:true,fee:'$600',notes:''}, oralSurgery:{offered:true,fee:'$500',notes:''}, panCeph:{offered:true,fee:'$220',notes:''}, periodontist:{offered:true,fee:'$1,200',notes:'In-house periodontist available Thursdays'}, theaterGlasses:{offered:true,fee:'Complimentary',notes:'Available for all appointments over 30 minutes'}, sedationIV:{offered:true,fee:'$800',notes:'IV sedation available for complex cases. Anesthesiologist on staff.'}, rootCanal:{offered:true,fee:'$1,300',notes:''}, sedationNitrous:{offered:true,fee:'$200',notes:''}, sedationOral:{offered:true,fee:'$250',notes:'Oral sedation with driver required'}, sleepApnea:{offered:true,fee:'$3,000',notes:'Oral appliance therapy. Works with sleep physicians.'}, snoreGuards:{offered:true,fee:'$1,200',notes:''}, sportsGuard:{offered:true,fee:'$550',notes:'Custom-fitted for all sports'}, tmj:{offered:true,fee:'$1,000',notes:'TMJ splint therapy and botox available'}, veneers:{offered:true,fee:'$1,400',notes:'Porcelain and composite veneers. Digital smile design included.'}, whiteningInOffice:{offered:true,fee:'$800',notes:'Zoom whitening'}, whiteningTakeHome:{offered:true,fee:'$400',notes:'Custom trays with professional-grade gel'} }),
      hours: { mon:{adminOpen:'9:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalLunch:'1:00 PM',clinicalClose:'5:30 PM'}, tue:{adminOpen:'9:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalLunch:'1:00 PM',clinicalClose:'5:30 PM'}, wed:{adminOpen:'9:00 AM',adminClose:'6:00 PM',clinicalOpen:'9:00 AM',clinicalLunch:'1:00 PM',clinicalClose:'5:30 PM'}, thu:{adminOpen:'9:00 AM',adminClose:'7:00 PM',clinicalOpen:'9:00 AM',clinicalLunch:'1:00 PM',clinicalClose:'6:00 PM',notes:'Late evening for working patients'}, fri:{adminOpen:'9:00 AM',adminClose:'4:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'3:00 PM'}, sat:{adminOpen:'9:00 AM',adminClose:'1:00 PM',clinicalOpen:'9:00 AM',clinicalClose:'12:00 PM',notes:'Morning only'}, sun:{adminOpen:'Closed',clinicalOpen:'Closed'} },
      dentalSoftware: 'Open Dental', dentalSoftwareNotes: 'Separate login per location. Contact Sandra for credentials.',
      importantNotes: 'Order of booking: NP Exam + X-rays + Treatment Coordinator appointment — 8 units minimum. After booking: email office AND insurance email immediately. Attach patient insurance details. New patient paperwork must be completed 48 hours before appointment. For implant or full-mouth cases, schedule a dedicated treatment planning session.',
      contractStart: '2025-01-01', monthlyFee: '$900',
    },
  },
]

// ─── Patient helpers ──────────────────────────────────────────────────────────

function daysAgo(days: number, h: number, m: number): Date {
  const dt = new Date()
  dt.setDate(dt.getDate() - days)
  dt.setHours(h, m, 0, 0)
  return dt
}

function daysFromNow(days: number): string {
  const dt = new Date()
  dt.setDate(dt.getDate() + days)
  return dt.toISOString().slice(0, 10)
}

const defaultDiscovery: DiscoveryInfo = { pain: false, sensitivity: false, painLevel: '', lastCleaning: '', lastExam: '', lastXrays: '', prevDentistName: '', prevDentistPhone: '', xrayTransfer: '' }
const defaultMedical: MedicalInfo = { medications: 'no', medicationsList: '', surgery: 'no', surgeryDetails: '', highBloodPressure: 'no', diabetes: 'no', heartCondition: 'no', heartDetails: '', allergies: 'no', allergiesList: '', anythingElse: '' }
const defaultConclusion: ConclusionInfo = { locationConfirmed: true, cancellationPolicy: true, reiteratedTime: true, reiteratedDate: true, discussedParking: true, allQuestions: true, officeTour: false, emailedForms: true }
const emptyCallNotes: CallNotes = { patientInfo: '', discovery: '', booking: '', financial: '', medical: '', inquiry: '', conclusion: '' }

function ownIns(company: string, policy: string, group: string, dob: string): FinancialInfo {
  return {
    insuranceStatus: 'provided', insuranceType: 'own',
    own: { ssn: '***-**-4521', company, policy, group, employer: 'Larimer County', dob, address: '2240 Sunridge Dr', city: 'Fort Collins', postal: '80524', state: 'CO' },
    medicaid: {}, other: {}, noInsurance: {}, bring: {}
  }
}
function noIns(dob: string): FinancialInfo {
  return { insuranceStatus: 'none', insuranceType: '', own: {}, medicaid: {}, other: {}, noInsurance: { dob, address: '318 Maple Ave', city: 'Fort Collins', postal: '80521', state: 'CO' }, bring: {} }
}
function bringIns(dob: string): FinancialInfo {
  return { insuranceStatus: 'bring', insuranceType: '', own: {}, medicaid: {}, other: {}, noInsurance: {}, bring: { dob, address: '', city: '', postal: '', state: '' } }
}
function bookedBooking(apptDate: string, apptTime: string, procs: string[], price: string): BookingInfo {
  return { booked: 'yes', apptDate, apptTime, procedures: procs, priceQuoted: price, reasonNotBooked: '', followUpDate: '', followUpTime: '' }
}
function notBooked(reason: string): BookingInfo {
  return { booked: 'no', apptDate: '', apptTime: '', procedures: [], priceQuoted: '', reasonNotBooked: reason, followUpDate: daysFromNow(3), followUpTime: '10:00 AM' }
}

async function main() {
  console.log('🌱 Seeding database...')

  // Insert offices (upsert by key)
  console.log('  → Offices...')
  const insertedOffices: Record<string, string> = {}
  for (const o of OFFICE_SEEDS) {
    const [row] = await db
      .insert(schema.offices)
      .values({ key: o.key, name: o.name, color: o.color, abbr: o.abbr, profile: o.profile })
      .onConflictDoUpdate({
        target: schema.offices.key,
        set: { name: o.name, color: '', abbr: o.abbr, profile: o.profile, updatedAt: new Date() },
      })
      .returning({ id: schema.offices.id })
    insertedOffices[o.key] = row.id
  }

  const sunsetId = insertedOffices['sunset']
  const now = new Date()

  // Check if patients already seeded
  const existing = await db.select({ id: schema.patients.id }).from(schema.patients).limit(1)
  if (existing.length > 0) {
    console.log('  → Patients already seeded — skipping')
    console.log('✅ Seed complete')
    await client.end()
    return
  }

  // Seed patients for Sunset Dental (~10 demo records)
  console.log('  → Patients (Sunset Dental)...')

  const DEMO_PATIENTS: Array<{
    recordedAt: Date
    patient: PatientInfo
    booking: BookingInfo
    financial: FinancialInfo
    discovery?: DiscoveryInfo
    medical?: MedicalInfo
  }> = [
    {
      recordedAt: daysAgo(2, 9, 14),
      patient: { firstName:'Sarah', middleName:'', lastName:'Williams', phone:'(720) 555-0291', email:'sarah.williams@email.com', gender:'Female', newPatient:'Yes', referralSource:'Google' },
      booking: bookedBooking(daysFromNow(8), '10:00 AM', ['New Patient Exam + Cleaning'], '$0 with insurance'),
      financial: ownIns('Blue Cross Blue Shield','BCB-7734921','GRP-4410','1985-03-12'),
    },
    {
      recordedAt: daysAgo(2, 10, 47),
      patient: { firstName:'Michael', middleName:'R.', lastName:'Torres', phone:'(720) 555-0183', email:'mtorres@email.com', gender:'Male', newPatient:'Yes', referralSource:'Word of Mouth' },
      booking: bookedBooking(daysFromNow(11), '2:30 PM', ['New Patient Exam + Cleaning', 'Consultation'], '$150 est.'),
      financial: ownIns('Delta Dental','DD-5519043','GRP-2208','1979-07-22'),
    },
    {
      recordedAt: daysAgo(2, 13, 5),
      patient: { firstName:'Emily', middleName:'', lastName:'Chen', phone:'(720) 555-0472', email:'emchen@gmail.com', gender:'Female', newPatient:'Yes', referralSource:'Google' },
      booking: bookedBooking(daysFromNow(6), '9:00 AM', ['Emergency / Specific Exam'], '$250 est.'),
      financial: noIns('1992-11-30'),
      discovery: { ...defaultDiscovery, pain: true, sensitivity: true, painLevel: '7' },
    },
    {
      recordedAt: daysAgo(1, 8, 33),
      patient: { firstName:'James', middleName:'', lastName:'Kowalski', phone:'(720) 555-0634', email:'j.kowalski@work.com', gender:'Male', newPatient:'No', referralSource:'' },
      booking: notBooked('Needs to check schedule'),
      financial: bringIns('1968-05-04'),
    },
    {
      recordedAt: daysAgo(1, 11, 22),
      patient: { firstName:'Maria', middleName:'L.', lastName:'Gonzalez', phone:'(720) 555-0815', email:'mariag@email.com', gender:'Female', newPatient:'Yes', referralSource:'Facebook' },
      booking: bookedBooking(daysFromNow(14), '11:00 AM', ['New Patient Exam + Cleaning'], '$0 with insurance'),
      financial: ownIns('Cigna','CG-8812234','GRP-7701','1990-02-18'),
    },
    {
      recordedAt: daysAgo(1, 14, 10),
      patient: { firstName:'David', middleName:'', lastName:'Park', phone:'(720) 555-0267', email:'dpark@gmail.com', gender:'Male', newPatient:'Yes', referralSource:'Insurance Network' },
      booking: bookedBooking(daysFromNow(9), '3:00 PM', ['New Patient Exam + Cleaning'], '$0 with insurance'),
      financial: ownIns('Aetna','AET-3345612','GRP-9902','1986-09-14'),
      discovery: { ...defaultDiscovery, sensitivity: true, painLevel: '3' },
    },
    {
      recordedAt: daysAgo(1, 15, 48),
      patient: { firstName:'Amanda', middleName:'', lastName:'Thompson', phone:'(720) 555-0923', email:'athompson@yahoo.com', gender:'Female', newPatient:'Yes', referralSource:'Google' },
      booking: notBooked('Price concern — will call back'),
      financial: noIns('1975-12-01'),
    },
    {
      recordedAt: daysAgo(0, 8, 55),
      patient: { firstName:'Robert', middleName:'J.', lastName:'Martinez', phone:'(720) 555-0348', email:'rmartinez@email.com', gender:'Male', newPatient:'Yes', referralSource:'Word of Mouth' },
      booking: bookedBooking(daysFromNow(5), '10:30 AM', ['Consultation'], '$0'),
      financial: ownIns('United Healthcare','UHC-7123489','GRP-3344','1983-04-27'),
      medical: { ...defaultMedical, highBloodPressure: 'yes', medications: 'yes', medicationsList: 'Lisinopril 10mg' },
    },
    {
      recordedAt: daysAgo(0, 10, 30),
      patient: { firstName:'Jennifer', middleName:'', lastName:'Lee', phone:'(720) 555-0571', email:'jlee@gmail.com', gender:'Female', newPatient:'No', referralSource:'' },
      booking: bookedBooking(daysFromNow(12), '1:00 PM', ['New Patient Exam + Cleaning'], '$0 with insurance'),
      financial: ownIns('Blue Cross Blue Shield','BCB-4491203','GRP-5511','1994-08-15'),
    },
    {
      recordedAt: daysAgo(0, 13, 15),
      patient: { firstName:'Carlos', middleName:'', lastName:'Rivera', phone:'(720) 555-0729', email:'crivera@email.com', gender:'Male', newPatient:'Yes', referralSource:'Other' },
      booking: notBooked('Called for a friend — will confirm'),
      financial: bringIns('1988-06-20'),
    },
  ]

  for (const p of DEMO_PATIENTS) {
    await db.insert(schema.patients).values({
      officeId: sunsetId,
      recordedAt: p.recordedAt,
      patient: p.patient,
      discovery: p.discovery ?? defaultDiscovery,
      booking: p.booking,
      financial: p.financial,
      medical: p.medical ?? defaultMedical,
      conclusion: defaultConclusion,
      callNotes: emptyCallNotes,
      inquiries: [],
    })
  }

  console.log(`  → Inserted ${DEMO_PATIENTS.length} demo patients`)
  console.log('✅ Seed complete')
  await client.end()
}

main().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})

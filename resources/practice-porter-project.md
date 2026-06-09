# Practice Porter — Project Brief for Claude Code

## Overview

Practice Porter is a single-file web admin dashboard for dental offices. It helps a call-handling team record new patient intakes, track appointments, monitor performance, and run month-end billing reconciliation. The product is white-label software sold to dental offices — each instance serves one admin managing one or more dental offices.

**Current state:** Everything lives in one self-contained HTML file (`patient-intake-dashboard.html`). No build tools, no backend, no dependencies except Chart.js (CDN). All data persists in `localStorage`.

---

## File Structure

```
patient-intake-dashboard.html   ← entire app: HTML + CSS + JS in one file
practice-porter-project.md      ← this document
```

**External dependency:** Chart.js 4.4.1 via CDN

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
```

---

## App Shell Layout

```
.app-shell (flex row, 100vh)
├── .sidebar (224px, collapsible to 64px)
│   ├── Brand / logo
│   ├── Nav items (one per tab)
│   ├── "Log Missed Call" button (sidebar footer)
│   └── Collapse toggle
└── .app-main (flex column, fills remaining width)
    ├── .app-header (56px, sticky — page title + office pill + clock)
    └── .view (one active at a time, flex column, fills remaining height)
```

Views are toggled by `switchView(viewName)`. Each `.view` div has `display:none` by default; the active one has `display:flex; flex-direction:column`. View IDs:

- `view-onboarding`
- `view-patients`
- `view-calendar`
- `view-insights`
- `view-billing`

---

## Design System

### CSS Custom Properties (`:root`)

```css
--blue-light: #ebf4fb --blue-mid: #c7e0f4 --blue-main: #3a86c8
  --blue-dark: #1e5f8e --blue-deeper: #154567 --grey-light: #f4f6f8
  --grey-border: #dde3ea --grey-divider: #e8ecf0 --grey-text: #6b7a8d
  --white: #ffffff --text-dark: #1a2533 --text-mid: #3d4f63 --success: #2e9e6b
  --error: #d94f4f --orange: #e8650a --orange-light: #fff3eb --shadow: 0 1px 4px
  rgba(30, 95, 142, 0.08) --shadow-md: 0 4px 16px rgba(30, 95, 142, 0.12)
  --radius: 8px --radius-sm: 5px;
```

### Office Color Identities

| Office          | Key        | Color      | Hex       |
| --------------- | ---------- | ---------- | --------- |
| Sunset Dental   | `sunset`   | Orange-red | `#E05A30` |
| Mountain Dental | `mountain` | Green      | `#2D7A50` |
| Crown Dental    | `crown`    | Purple     | `#5A4BD1` |

### Typography

System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

### Common Component Classes

- `.section-card` — white card with blue gradient header
- `.field-input` — standard form input (42px height)
- `.yn-btn` — Yes/No toggle button pair
- `.radio-option` — full-width selectable option card
- `.accordion-trigger` / `.accordion-body` — expandable section
- `.conditional-box` — hidden box that reveals on condition
- `.btn-primary` / `.btn-secondary` — form action buttons

---

## localStorage Schema

All data is stored in `localStorage`. Keys:

| Key           | Type           | Description                            |
| ------------- | -------------- | -------------------------------------- |
| `pp_patients` | `Patient[]`    | All patient intake records             |
| `pp_calls`    | `Call[]`       | All call log entries (missed, no-lead) |
| `pp_billing`  | `BillingStore` | Month-end reconciliation data          |
| `pp_seeded`   | `'true'`       | Flag — prevents re-seeding on reload   |

### Patient Record Schema

```js
{
  timestamp: string,          // ISO date string — when call was recorded
  office: string,             // "Sunset Dental" | "Mountain Dental" | "Crown Dental"
  patient: {
    firstName: string,
    middleName: string,
    lastName: string,
    phone: string,
    email: string,
    gender: string,
    newPatient: "Yes" | "No",
    referralSource: string    // "Google" | "Facebook" | "Insurance Network" | "Word of Mouth" | "Other"
  },
  booking: {
    booked: "yes" | "no",
    apptDate: string,         // "YYYY-MM-DD"
    apptTime: string,         // "10:00 AM" etc.
    procedures: string[],     // e.g. ["New Patient Exam + Cleaning"]
    priceQuoted: string,
    reasonNotBooked: string,
    followUpDate: string,
    followUpTime: string
  },
  financial: {
    insuranceStatus: "provided" | "none" | "bring",
    insuranceType: "own" | "medicaid" | "other" | "",
    own: { ssn, insCompany, policyNum, groupNum, employer, dob, address, city, postal, state },
    medicaid: { stateId, employer, dob, address, city, postal, state },
    other: { holderName, relationship, holderDob, holderAddress, holderCity, holderPostal, holderState, patientDob, patientAddress, patientCity, patientPostal, patientState },
    noInsurance: { dob, address, city, postal, state },
    bring: { dob, address, city, postal, state }
  },
  discovery: {
    pain: boolean,
    sensitivity: boolean,
    painLevel: string,
    lastCleaning: string,
    lastExam: string,
    lastXrays: string,
    prevDentistName: string,
    prevDentistPhone: string,
    xrayTransfer: string
  },
  medical: {
    medications: "yes" | "no",
    medicationsList: string,
    surgery: "yes" | "no",
    surgeryDetails: string,
    highBloodPressure: "yes" | "no",
    diabetes: "yes" | "no",
    heartCondition: "yes" | "no",
    heartDetails: string,
    allergies: "yes" | "no",
    allergiesList: string,
    anythingElse: string
  },
  conclusion: {
    locationConfirmed: boolean,
    cancellationPolicy: boolean,
    reiteratedTime: boolean,
    reiteratedDate: boolean,
    discussedParking: boolean,
    allQuestions: boolean,
    officeTour: boolean,
    emailedForms: boolean
  },
  updatedAt: string           // ISO — only present if record was edited
}
```

### Call Log Record Schema

```js
{
  timestamp: string,          // ISO date string
  type: "missed" | "no_lead",
  office: string,
  // For missed calls only:
  voicemail: "yes" | "no",
  callbackTime: string,
  notes: string,
  callerFirst: string,
  callerLast: string,
  callerPhone: string
}
```

### Billing Store Schema

```js
// Key format: "{officeKey}-{YYYY-MM}"  e.g. "sunset-2026-06"
// Value: object keyed by patient's timestamp (unique ID)
{
  "sunset-2026-06": {
    "2026-06-03T09:14:00.000Z": {
      attended: "yes" | "no" | null,
      rescheduled: "yes" | "no" | null,   // only relevant when attended = "no"
      amountBilled: string,               // dollar amount as string e.g. "320"
      scheduledAnother: "yes" | "no" | null,
      notes: string
    }
  }
}
```

---

## Tab 1: Onboarding Form (`view-onboarding`)

The primary data-entry screen. Used by the call-handling admin while on the phone with a new patient.

### Layout

```
Office Gate (select office — unlocks form below)
Form Layout (grid: main form column + notes sidebar column)
```

### Office Gate

- Three office cards (Sunset Dental, Mountain Dental, Crown Dental)
- Selecting one sets `selectedOffice` (name) and `selectedOfficeKey` (key) global state
- Unlocks the form by removing `.form-locked` class from `#formLayout`
- Updates the header office pill

### Form Sections (7 total)

Each section is a `.section-card` with a blue gradient header. Completing required fields shows a green checkmark badge in the header.

**Section 1 — Patient Information**

- First, middle, last name
- Phone, email
- Gender (optional)
- New Patient? (required — drives referral source requirement)
- Referral Source (required when New Patient = Yes)

**Section 2 — Discovery Questions**

- Pain? (Y/N) — required
- Sensitivity? (Y/N) — required
- Pain Level 1–10 slider+number (shown when pain or sensitivity = Yes)
- Check-Up & Cleaning History accordion (optional): last cleaning, last exam, last X-rays, previous dentist, X-ray transfer permission

**Section 3 — Book Appointment / Complimentary Consult**

- Appointment Booked? (Yes / No) — required
- If Yes: appointment date + time (required), price quoted, procedures table
- If No: reason not booked (required), follow-up date + time

**Procedures Table** (shown when appointment is booked)

- Standard procedures: New Patient Exam, Emergency/Specific Exam, New Patient Exam + Cleaning, Consultation, Other
- Selecting procedures tallies assistant/hygienist/doctor time at bottom
- At least one procedure required

**Section 4 — Financial**

- Insurance Status: Insurance Provided / No Insurance / Patient to Provide at Appt. (required)
- If Insurance Provided: sub-type (Own Insurance / Medicaid / Policy Under Other Person) — each with own fields
- All paths collect patient DOB + address

**Section 5 — Medical History (optional accordion)**

- Medications (Y/N + list)
- Surgery in last 6 months (Y/N + details)
- High blood pressure (Y/N)
- Diabetes (Y/N)
- Heart condition (Y/N + details)
- Allergies (Y/N + list)
- Anything else

**Section 6 — Inquiries Table (optional)**

- Tracks which services/treatments were offered and whether the patient was interested
- Per-row: offered (Y/N), fee, note drawer

**Section 7 — Conclusion Checklist**

- 8 checkboxes: location confirmed, cancellation policy, reiterated time, reiterated date, discussed parking, all questions answered, office tour, emailed forms

### Notes Sidebar

- Two textarea sections: call notes (top) and general notes (bottom)
- Tab key creates bullet points in notes

### Form Actions

- **Submit Record** button — opens confirmation modal → saves to `pp_patients` localStorage
- **No Lead Call** button — opens modal → logs call as `no_lead` type, does not save patient
- Success screen after submit with "Record New Patient" CTA

### Edit Mode

- Patient records can be opened for editing from the New Patient List
- An "Editing" banner appears at top with patient name + cancel button
- Submit overwrites the existing record at its index

---

## Tab 2: New Patient List (`view-patients`)

Displays all saved patient records as cards.

### Toolbar

- Sort: By Submitted / By Appointment / Alphabetical
- Filter by office (All / Sunset / Mountain / Crown)
- Patient count display

### Patient Cards

Each card shows:

- Patient name (clickable → opens profile modal)
- Office badge
- Stats row: call date, referral source, appointment date/time, insurance status, booking status, procedures
- Action buttons: Edit (loads into onboarding form), Delete

### Profile Modal

- Full read-only view of all patient data
- "Edit Patient" button to switch to edit mode

### Delete

- Confirmation modal with patient name
- Permanently removes from `pp_patients`

---

## Tab 3: Calendar (`view-calendar`)

Visual calendar showing calls and appointments.

### Modes

- **Calls mode** — shows entries by call date (timestamp)
- **Appointments mode** — shows entries by appointment date

### Views

- **Month** — full month grid, up to 3 entries per day with "+N more"
- **Week** — 7-column week grid
- **Day** — single day list view

### Filters

- Office (All / Sunset / Mountain / Crown)
- Completed Forms (Y/N toggle)
- Appointment Booked (Y/N toggle)
- Patient Type (New / Returning)

### Navigation

- ‹ › arrows + Today button
- Month/Week/Day view toggle

---

## Tab 4: Patient Insights (`view-insights`)

Analytics dashboard aggregating patient and call data.

### Office Selector

- All offices / Sunset / Mountain / Crown

### Time Period

- Last 30 days / Last 90 days / This Year / Custom month picker

### KPI Strip (4 cards)

- Total New Patients
- Appointment Conversion Rate
- Missed Calls
- Open Opportunities (patients who didn't book)

### Charts (Chart.js)

- **Conversion Funnel** — bar chart: calls → booked → completed forms
- **New Patients Over Time** — line chart
- **Referral Sources** — doughnut chart
- **Insurance Provided vs. Not** — doughnut chart
- **Insurance Type Breakdown** — doughnut chart (shown when office selected)
- **Open Opportunities list** — patients who didn't book, with reason
- **Call Heatmap** — hour × day grid showing call volume

### Locked Cards

Some analytics cards show a "locked" placeholder state indicating data not yet available (e.g. heatmap when no call log entries exist).

---

## Tab 5: Billing (`view-billing`)

Month-end billing reconciliation. Used on the last 3 days of each month per office.

### Business Logic

- **Billing starts:** May 2026 (`BILL_START = { y: 2026, m: 4 }`)
- **Fee:** $150 USD flat per appointment kept (attended = Yes)
- **Patient appears in month N reconciliation** if their appointment date falls in month N. A patient who calls in June and books for July appears in July's reconciliation, not June's.
- **Card is complete** when: attended is set, rescheduled is set (if attended = No), amountBilled has a value, and scheduledAnother is set.

### Office Selector

- Three office buttons (Sunset / Mountain / Crown) — no "All Offices" option
- Reconciliation is always per-office

### Month Navigation

- ‹ label ▼ › navigation bar
- ‹ / › navigate one month at a time
- › is disabled and greyed out when on the current month (cannot reconcile future)
- Clicking the month label opens the **month picker popup**

### Month Picker Popup

- Grid of all months from May 2026 to current month
- **Green** — month is fully reconciled (all patient cards complete) for selected office
- **Red** — past month has patients but reconciliation is incomplete
- **White/neutral** — current month or months with no patients
- **Grey/disabled** — before May 2026 or future months
- Clicking a month navigates to it and closes the picker

### Summary Panel (always visible)

Left side — 6 stat cards:

- Total Calls (recorded that month for the office)
- Missed Calls (from call log for that office + month)
- Appts Booked (calls recorded that month where booking = Yes)
- In Reconciliation (patients with appointment date in that month)
- Appts Kept (attended = Yes from billing data)
- No-Shows (attended = No from billing data)

Right side — Financials panel:

- **Total Billed by Office** — sum of all `amountBilled` entries entered by admin
- **Practice Porter Receivable** — `apptKept × $150`
- **Office ROI** — `totalBilled / receivable` expressed as a multiplier (e.g. `12x`)

### Progress Bar

- Shows `completedCards / totalPatients` as percentage
- Turns into a green "✓ Office Complete" badge at 100%

### Patient Reconciliation Cards

Listed in chronological order by appointment date. Each card shows:

- Patient name (Last, First)
- Appointment date + time + procedure

**Four data fields per card:**

1. **Attended Appointment?** (Y/N buttons)
   - If No → sub-field appears: **Rescheduled for later?** (Y/N)

2. **Amount Billed at 1st Appt** — dollar input with `$` prefix

3. **Scheduled Another Appointment?** (Y/N buttons)

4. **Notes** — label only; notes entered via drawer below

**Notes drawer** — click "Add Note / Edit Note" button to expand a textarea below the card. Saves automatically with debounce.

**Completion state** — when all required fields filled, card background turns light green (`#F0FBF5`) with a green border and a "✓ Done" pill in the header.

### Key Functions

```js
billSelectOffice(key, name); // activates office, shows body
billNavigateMonth(dir); // -1 / +1, clamped to BILL_START → now
billTogglePicker(); // open/close month picker popup
billRenderPicker(); // populate picker grid with status colors
billPickMonth(y, m); // jump to specific month
renderBilling(); // full re-render of summary + patient list
billSetField(idx, field, value); // save Y/N field for patient card
billSetAmountDebounced(idx, value); // debounced save for dollar amount input
billSetNoteDebounced(idx, value); // debounced save for notes textarea
billToggleNote(idx); // expand/collapse notes drawer
billIsCardComplete(bd); // returns true when all required fields filled
billPatientKey(p); // returns patient's timestamp as unique key
billUpdateFinancials(); // update financials panel without full re-render
billUpdateProgress(); // update progress bar without full re-render
billUpdateCardState(idx); // update single card's green/white state
```

---

## Modals

### Submit Confirmation Modal (`#submitModal`)

Standard confirmation before saving a patient record.

### Success Screen (`#successScreen`)

Full-screen overlay shown after successful patient save. "Record New Patient" resets the form.

### No Lead Call Modal (`#noLeadModal`)

Logs a call as no-lead without saving a patient record.

### Missed Call Modal (`#missedCallModal`)

Logs a missed call entry. Fields:

- Office (required)
- Voicemail left? (Y/N)
- Requested callback time
- Notes
- Caller info: first name, last name, phone (optional)

### Patient Profile Modal (`#profileModal`)

Full read-only patient profile. Has "Edit Patient" button that loads the record into the onboarding form.

### Delete Confirm Modal (`#deleteModal`)

Confirms deletion of a patient record.

---

## Global State Variables

```js
// Onboarding
let selectedOffice = null; // "Sunset Dental" etc.
let selectedOfficeKey = null; // "sunset" | "mountain" | "crown"
let editingPatientIdx = null; // index in pp_patients when editing

// Calendar
let calMode = "calls"; // "calls" | "appts"
let calView = "month"; // "month" | "week" | "day"
let calDate = new Date();
let calFilters = { office, completedForms, apptBooked, patientType };

// Insights
let insOffice = "all";
let insPeriod = "30d"; // "30d" | "90d" | "ytd" | "month"
let insMonthOffset = 0;

// Billing
const BILL_START = { y: 2026, m: 4 }; // May 2026
let billOfficeKey = null;
let billOfficeName = null;
let billMonth = new Date();
window._billReconPatients = []; // cached array for current render cycle
```

---

## Key Helper Functions

```js
switchView(view); // switches active tab, updates header
selectOffice(key, name); // onboarding form office selection
updatePatientBadge(); // updates New Patient List count badge
renderPatientList(); // renders patient cards in list view
seedPatients(); // seeds demo data (runs once per browser)
officeClass(name); // returns "sunset" | "mountain" | "crown"
fmtDateLong(str); // "YYYY-MM-DD" → "Wednesday, June 10, 2026"
fmtDateShort(str); // "YYYY-MM-DD" → "Jun 10, 2026"
dateKey(str); // normalizes date string to "YYYY-MM-DD"
getCalls(); // read pp_calls from localStorage
saveCalls(calls); // write pp_calls to localStorage
getBillingData(); // read pp_billing from localStorage
saveBillingData(d); // write pp_billing to localStorage
```

---

## Seed Data

`seedPatients()` runs once on first load (gated by `pp_seeded` localStorage flag). It generates ~10 demo patients for Sunset Dental spanning the last 2–3 days, with appointment dates 5–14 days in the future from seed time. Covers a mix of:

- New and returning patients
- Booked and not-booked
- All insurance types
- Various referral sources
- With and without medical history

To re-seed: `localStorage.removeItem('pp_seeded'); location.reload()`

---

## What's Not Yet Built (Known Gaps)

- No real backend — all data is browser-local only
- No authentication / user accounts
- No multi-user / multi-device sync
- No email sending (forms referenced in conclusion checklist)
- Patient Insights is read-only analytics — no editable targets or benchmarks
- Heatmap is locked/placeholder (requires more call log data)
- No export functionality (PDF invoice, CSV export for billing, etc.)
- No notification system for follow-up calls
- Mountain Dental and Crown Dental have no seeded data
- No billing invoice generation — receivable is calculated but not outputted as a document

---

## Notes for Loic

- The entire app is one HTML file. No bundler, no framework, no build step. Open in browser and it works.
- Chart.js is the only CDN dependency. All other JS is vanilla.
- `localStorage` is the sole data store. All reads/writes go through the helper functions (`getCalls`, `saveCalls`, `getBillingData`, `saveBillingData`, and inline `localStorage.getItem/setItem` for patients).
- When porting to a real stack: replace localStorage read/write helpers with API calls. The data schemas above map directly to what backend models should look like.
- CSS uses custom properties throughout. No Tailwind, no CSS modules — everything is in the single `<style>` block.
- The app assumes a desktop viewport (1024px+). No mobile breakpoints.
- All views are rendered by JS into their respective `.view` divs. The pattern is: `switchView(name)` → calls `render[ViewName]()` → JS writes innerHTML.

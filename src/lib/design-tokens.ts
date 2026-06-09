/**
 * Practice Porter design token hex values.
 * Source of truth for JS/chart usage — CSS tokens live in src/app/globals.css @theme.
 * In components, prefer Tailwind classes (see AGENTS.md) over importing from here.
 */
export const colors = {
  /** shadcn primary — brand blue, CTAs, links, active states */
  primary: '#3A86C8',
  /** Primary hover / selected emphasis text */
  primaryDark: '#1E5F8E',
  /** Sidebar, deep brand navy */
  primaryDeeper: '#154567',
  /** Page background tint, selected card fills */
  accent: '#EBF4FB',
  /** Info box borders, scrollbar thumb */
  accentMid: '#C7E0F4',

  /** Body text, headings */
  foreground: '#1A2533',
  /** Secondary body text, form labels */
  secondaryForeground: '#3D4F63',
  /** Muted labels, hints, table headers */
  mutedForeground: '#6B7A8D',
  /** Input placeholder text */
  placeholder: '#C7D0D9',

  /** Default borders, dividers */
  border: '#DDE3EA',
  /** Subtle surface fills, stat boxes */
  muted: '#F4F6F8',
  /** Table row hover */
  hoverSubtle: '#FAFCFE',
  /** Card / panel surface */
  card: '#FFFFFF',

  /** Success states, confirmations, completion */
  success: '#2E9E6B',
  /** Success badge / highlight background */
  successLight: '#E4F4ED',
  /** Success button hover */
  successHover: '#238056',
  /** Errors, destructive actions */
  destructive: '#D94F4F',

  /** Required field markers, warnings, edit mode */
  warning: '#E8650A',
  /** Warning / orange button hover */
  warningHover: '#C4540A',
  /** Warning-tinted backgrounds */
  warningLight: '#FFF3EB',
  /** Edit-mode banner background */
  warningEdit: '#FFF8ED',

  /** Per-office brand colors */
  office: {
    sunset: '#E05A30',
    mountain: '#2D7A50',
    crown: '#5A4BD1',
  },
} as const

export type DesignColor = (typeof colors)[keyof typeof colors]

/** Recharts / inline-style defaults — use Tailwind classes in JSX when possible */
export const chartTheme = {
  grid: colors.muted,
  tick: colors.mutedForeground,
  primary: colors.primary,
  success: colors.success,
  destructive: colors.destructive,
  warning: colors.warning,
  officeMountain: colors.office.mountain,
  officeCrown: colors.office.crown,
} as const

/** Fallback when office key is unknown */
export const officeFallbackColor = colors.mutedForeground

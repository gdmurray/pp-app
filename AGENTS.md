<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Node version

This repo pins Node in `.nvmrc`. Before running any `npm`, `npx`, or other Node commands in the shell, run:

```bash
nvm use
```

If the version is not installed, run `nvm install` first, then `nvm use`.

## Agent skills setup

Agent skills are installed locally and are not committed to source control (`.agents/` is gitignored). After cloning the repo, install the project skills:

```bash
npx skills add supabase/agent-skills
```

When prompted:

1. **Select skills** — enable both `supabase-postgres-best-practices` and `supabase`
2. **Installation scope** — choose **Project** (installs to `.agents/skills/` in this repo)
3. Confirm the installation

This gives agents Supabase and Postgres best-practice guidance when working on database, auth, and Supabase-related tasks.

Optional: install the global [find-skills](https://github.com/vercel-labs/skills) skill to help discover other skills:

```bash
npx skills add vercel-labs/skills
```

Select `find-skills` when prompted. That installs to `~/.agents/skills/` (user-level, not in this repo).

## Design tokens & colors

**Never use arbitrary hex in Tailwind classes** (e.g. `text-[#3A86C8]`). ESLint rule `pp-design-tokens/no-arbitrary-color` warns on these. Change brand colors in one place: `src/app/globals.css` (`@theme` + `:root` CSS variables).

### Where tokens live

| Layer | File | Purpose |
|-------|------|---------|
| CSS source of truth | `src/app/globals.css` | `@theme inline` registers Tailwind color utilities; `:root` maps PP palette → shadcn semantic vars |
| JS/charts/inline styles | `src/lib/design-tokens.ts` | Hex values for Recharts, `style={{}}`, and fallbacks — keep in sync with `globals.css` |
| Office colors | `src/lib/offices.ts` | `OFFICE_COLORS` re-exports `colors.office` from design-tokens |

### Prefer shadcn semantic tokens (UI)

Use these for most component styling — they inherit from the PP palette automatically:

| Token | Role |
|-------|------|
| `primary` / `primary-foreground` | Brand blue, CTAs, links, active tabs |
| `foreground` | Headings, primary body text |
| `secondary-foreground` | Form labels, secondary text |
| `muted` / `muted-foreground` | Subtle backgrounds, hints, table headers |
| `border` | Dividers, input borders |
| `accent` | Selected/highlight fills (light blue tint) |
| `destructive` | Errors, negative states |
| `card` | White panel surfaces (`bg-card`) |

### PP-specific tokens (when semantic tokens aren't enough)

Registered in `@theme` as `--color-pp-*`:

| Class prefix | Role |
|--------------|------|
| `pp-blue-dark` | Primary hover, selected emphasis text |
| `pp-blue-deeper` | Sidebar background |
| `pp-blue-mid` | Info box borders |
| `pp-success` / `pp-success-light` / `pp-success-hover` | Success states, badges, button hover |
| `pp-orange` / `pp-orange-light` / `pp-orange-edit` / `pp-orange-hover` | Required markers, warnings, edit mode |
| `pp-placeholder` | Input placeholder text |
| `pp-hover-subtle` | Table row hover |
| `office-sunset` / `office-mountain` / `office-crown` | Per-office brand accents |

Examples: `text-pp-orange` (required ●), `bg-pp-success-light text-pp-success` (booked badge), `hover:bg-pp-blue-dark` (primary button hover).

### Inline / chart colors

When Tailwind classes aren't possible (Recharts `fill`, dynamic `style`), import from `@/lib/design-tokens`:

```ts
import { colors, chartTheme } from '@/lib/design-tokens'
// chartTheme.grid, chartTheme.tick, colors.primary, colors.success, …
```

For office-colored dots/bars, use `getOfficeColor()` from `@/lib/patient-utils` or `OFFICE_COLORS` from `@/lib/offices`.

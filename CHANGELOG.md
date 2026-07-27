# Changelog

All notable changes to the Genesyx web dashboard.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/).

---

## [Unreleased]

### Planned
- Filter pH read paths by `measurement_type` before urine tracking ships
- Rename pH bands "Optimal" → "Healthy" to match the external spec
- Reorder the tracker hub to pH-first
- Clear the React Query cache on sign-out
- Resolve the hydration mismatch warning on `/auth`
- Glasses/ml toggle for hydration; `custom_name` for supplements
- Complete partner linking flow and unhide the UI

---

## [1.6.0] — 2026-07-27 — Vaginal pH + SEO

### Added
- `measurement_type` column on `ph_readings` (`NOT NULL DEFAULT 'vaginal'`, CHECK `vaginal|urine`)
- Type-scoped range constraint: vaginal 3.5–7.0, urine 4.5–9.0
- `MEASUREMENT_TYPE_VAGINAL` constant in `src/lib/ph/scale.ts`; stamped on every insert
- `public/robots.txt`, `public/llms.txt`, generated `/sitemap.xml`
- JSON-LD structured data (Organization, FAQPage, Service) across public routes
- Per-route canonical tags and unique metadata

### Changed
- Migrated the whole app from the urine pH model (4.5–9.0) to vaginal pH (3.5–7.0)
- Centralised the scale in `src/lib/ph/scale.ts`; hooks, server functions, cards, dialogs
  and Insights charts all read from it
- "Retest" (> 6.0) restyled neutral grey — sampling interference, not a health alarm
- Heading hierarchy corrected on `/trust`; `<main>` landmark and `fetchpriority` on `/`

### Removed
- Two legacy urine rows from `ph_readings`

### Fixed
- Missing `aria-label` / `alt` on icon-only buttons and logos

---

## [1.5.0] — 2026-07-22 — Learn imagery, security, theming

### Added
- 10 Learn hero images with `getHeroImageUrl` helper, gradient fallbacks and lazy loading
- `private` schema housing `get_partner_id(uuid)`

### Changed
- `EXECUTE` on security-definer functions revoked from `PUBLIC` / `anon`; granted only to
  `authenticated` and `service_role`
- `profiles` RLS policies rewritten against `private.get_partner_id`

### Fixed
- Infinite recursion in the `profiles` RLS policy
- Dark mode activating on its own — theme now light unless the user opts in
- Missing profile-creation trigger on signup
- CSP blocking Recharts images; Google Fonts 404s

---

## [1.4.0] — 2026-07 — Android v1.2 parity

### Added
- Learn section: 10 articles, search, category filters, medical disclaimers
- `/app/history` unified log history
- `HydrationRingCard` and `PhNudgeCard` on the overview
- Tracker hub at `/app/track` with six trackers
- `hydration_goal_ml` on `profiles` with a daily goal editor (clamp 1000–5000, default 2400)
- `reminder_preferences` table and settings UI
- Tracking engine (`src/lib/tracking/engine.ts`) with 16 passing fixture vectors

### Fixed
- `ON DELETE CASCADE` added to `daily_logs` and `cycle_settings` so account deletion
  fully removes user data
- Missing `QueryClientProvider` at the root

---

## [1.3.0] — Desktop conversion

### Changed
- Full move from a mobile app shell to a desktop-first dashboard:
  left sidebar, top header, main content area
- Page structure standardised: KPI row → charts → detail tables
- Brand applied: Zenith Grey `#F2F2F2` background, Electric Lavender `#4D4DAA` accent,
  official SVG logo in the sidebar
- Landing page, quiz and `AppShell` rebuilt for desktop; phone frame removed globally
- Insights rebuilt with Recharts (pH trend, hydration trend, symptom heatmap) plus
  interactive tooltips and legends

### Added
- `/approach` and `/trust` marketing routes
- Guest preview state on Insights with a sign-in CTA

### Fixed
- Signed-out users redirected to `/auth` instead of a guest dashboard

---

## [1.2.0] — MVP hardening

### Added
- Real `/privacy` and `/terms` pages
- Server-side password re-authentication (`src/lib/account.functions.ts`)

### Changed
- `avatars` storage bucket restricted to owner and linked partner
- Mock data and dead navigation removed from Home and Insights

### Fixed
- Signup handling for already-registered emails

---

## [1.0.0] — Initial build

Onboarding quiz, cycle tracking, daily logging, pH tracking, insights, profile,
Supabase auth and RLS baseline.

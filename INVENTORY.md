# Genesyx Web Dashboard — App Inventory

Desktop-first web dashboard for the Genesyx fertility/cycle platform.
Last updated: 2026-07-27

---

## 1. Stack

| Layer | Technology |
| --- | --- |
| Framework | TanStack Start v1 (React 19, file-based routing) |
| Build | Vite 7, Cloudflare Workers target |
| Styling | Tailwind CSS v4 (`src/styles.css`, semantic tokens) |
| UI kit | shadcn/ui + Radix primitives, lucide-react icons |
| Charts | Recharts |
| Data | TanStack Query v5 + `createServerFn` server functions |
| Backend | Lovable Cloud (Supabase) — project ref `gaxlpbmkghghrudbqxfp` |
| Auth | Supabase email/password + OAuth, bearer token attached via `src/start.ts` |
| Forms | react-hook-form + Zod |

Single backend. The `epltxklawpcxxbaleswg` reference from earlier briefs is **not** used by this app.

---

## 2. Database schema (`public`)

All tables are RLS-enabled and owner-scoped by `user_id` / `id = auth.uid()`, with partner reads
resolved through the `private.get_partner_id(uuid)` security-definer function.

### `profiles`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK, = `auth.users.id` |
| display_name | text | |
| avatar_url | text | points at owner-scoped `avatars` bucket |
| partner_id | uuid | nullable link to partner profile |
| theme | text | `light` default, user-explicit only |
| hydration_goal_ml | integer | clamped 1000–5000, default 2400 |
| created_at / updated_at | timestamptz | |

Created automatically by the `handle_new_user` trigger on signup.

### `ph_readings`
| Column | Type | Notes |
| --- | --- | --- |
| id | uuid | PK |
| user_id | uuid | FK → auth.users, ON DELETE CASCADE |
| ph_value | numeric | one decimal place |
| measurement_type | text | NOT NULL DEFAULT `'vaginal'`, CHECK in (`vaginal`,`urine`) |
| recorded_at | timestamptz | |
| notes | text | |

Range constraint `ph_readings_value_range` is type-scoped:
`vaginal → 3.5–7.0`, `urine → 4.5–9.0`, anything else rejected.

### `daily_logs`
`id, user_id, date, mood, energy, symptoms[], sleep_minutes, water_ml, supplements[], notes`
— one row per user per day (unique), the backing store for Log, History and Insights.

### `cycle_settings`
`id, user_id, cycle_length, period_length, last_period_date` — inputs to the cycle engine.

### `reminder_preferences`
`user_id (PK), daily_log_enabled, weekly_digest_enabled, quiet_start, quiet_end, timezone, consented_at`.

### `partner_invites`
`id, inviter_id, invitee_email, code, status, expires_at, accepted_by, accepted_at`.

### Storage
- `avatars` — private bucket, read restricted to owner and linked partner.

---

## 3. Server functions

| File | Responsibilities |
| --- | --- |
| `src/lib/ph.functions.ts` | list / create / update / delete pH readings; stamps `measurement_type: 'vaginal'` |
| `src/lib/daily-log.functions.ts` | upsert + read daily logs |
| `src/lib/cycle.functions.ts` | read/write cycle settings |
| `src/lib/hydration.functions.ts` | hydration goal read/write with server-side clamp |
| `src/lib/reminders.functions.ts` | reminder preferences |
| `src/lib/partner.functions.ts` | partner invites and linking |
| `src/lib/account.functions.ts` | server-side password re-auth, theme default, account deletion |

All authenticated functions run under `requireSupabaseAuth`; RLS applies as the calling user.

---

## 4. Routes

### Public / marketing
| Route | Purpose |
| --- | --- |
| `/` | Landing hero, desktop top-nav |
| `/approach` | Methodology page |
| `/trust` | Safety, data and evidence page |
| `/support` | Help and contact |
| `/privacy`, `/terms`, `/health-disclaimer` | Legal surfaces (real content) |
| `/auth`, `/reset-password` | Sign in / sign up / recovery |
| `/invite/$code` | Partner invite acceptance |
| `/sitemap.xml` | Generated sitemap |

### Dashboard (`/app`, auth-guarded via `beforeLoad`, `noindex`)
| Route | Purpose |
| --- | --- |
| `/app` | Overview: KPI row, hydration ring, pH nudge, first-run card |
| `/app/track` | Tracker hub (6 trackers) |
| `/app/track/ph` | Vaginal pH tracker |
| `/app/track/hydration` | Hydration + daily goal editor |
| `/app/track/cycle` | Cycle settings and phase view |
| `/app/track/sleep` | Sleep duration logging |
| `/app/track/symptoms` | Symptom picker |
| `/app/track/nutrition` | Supplements / nutrition log |
| `/app/log` | Combined daily log form |
| `/app/history` | Unified log history |
| `/app/insights` | Charts: pH trend, hydration trend, symptom heatmap |
| `/app/learn`, `/app/learn/$slug`, `/app/learn/search` | 10-article Learn library with hero images |
| `/app/profile`, `/app/profile/reminders` | Account settings, reminders |

---

## 5. Domain logic

### Vaginal pH scale — `src/lib/ph/scale.ts` (single source of truth)
| Band | Range |
| --- | --- |
| Optimal | 3.5 – 4.5 |
| Elevated | 4.6 – 5.5 |
| High | 5.6 – 6.0 |
| Retest | > 6.0 |

`PH_MIN = 3.5`, `PH_MAX = 7.0`, `MEASUREMENT_TYPE_VAGINAL = 'vaginal'`.
Enforced in three places: Zod validators, DB CHECK constraint, UI slider bounds.

### Tracking engine — `src/lib/tracking/engine.ts`
Streaks, averages and completeness scoring. Covered by 16 fixture vectors in
`src/lib/tracking/tracking_test_vectors.json` (`engine.test.ts`) — all passing.

### Cycle engine — `src/lib/cycleEngine.ts`
Derives phase, fertile window and ovulation day from `cycle_settings`.

### Learn — `src/lib/learn/index.ts`
Loads `articles.json`, resolves hero images from `src/assets/learn/*`, applies category
gradient fallbacks and medical disclaimers.

---

## 6. Status

**Working end to end**
- Signup → profile creation trigger → dashboard
- Daily log create / edit / persist / history
- Vaginal pH logging with correct scale, bands and `measurement_type` stamping
- Hydration goal editing with clamp at client, server and DB
- Cycle settings and phase derivation
- Learn library with images, search and disclaimers
- Insights charts with tooltips and legends
- Reminder preferences
- Account deletion with `ON DELETE CASCADE` across all user tables
- SEO: robots, sitemap, llms.txt, per-route metadata, JSON-LD, landmarks

**Known gaps**
- pH read paths do not filter `measurement_type`; required before urine tracking ships
- Band labels use "Optimal" where the external spec says "Healthy"
- Partner linking UI is hidden pending a full flow
- Sign-out does not clear the React Query cache
- Hydration mismatch warning on `/auth`
- Tracker hub order is not pH-first
- Hydration is ml-only (no glasses toggle); supplements lack a `custom_name` field
- Email delivery depends on custom sender domain DNS verification

---

## 7. Test account

`test@genesyx.app` / `GenesyxTest2026!`

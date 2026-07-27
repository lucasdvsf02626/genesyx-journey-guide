## Phase 0 report — read-only, nothing changed

Four of the premises in your brief do not hold for **this** project. Read this before authorising a branch.

### 1. Wrong backend

Your brief names project `epltxklawpcxxbaleswg`. This Lovable project is wired to a **different** backend. Everything below describes the database this dashboard actually reads from. If `epltxklawpcxxbaleswg` is the Android/iOS backend, it is a **separate database** and nothing I do here touches it.

### 2. There is no `measurement_type` column, and no migration ever added one

```
NO measurement_type ANYWHERE   (searched supabase/migrations/ and src/)
```

Actual table shape:

```text
ph_readings
  id           uuid            pk
  user_id      uuid            not null  -> auth.users ON DELETE CASCADE
  ph_value     numeric(3,1)    not null      <-- column is ph_value, not "value"
  recorded_at  timestamptz     not null
  notes        text
  created_at   timestamptz     not null
  updated_at   timestamptz     not null
```

So the queries in your brief (`measurement_type`, `value`) cannot run as written. There is no mis-stamping risk, because there is no stamp — and no pre/post-migration timestamp to split on. Branch B's backfill has nothing to backfill.

### 3. Current constraint

```sql
ph_readings_ph_value_check  CHECK (ph_value >= 4.5 AND ph_value <= 9.0)
```

Urine scale, confirmed.

### 4. Data census

| metric | value |
|---|---|
| rows | **2** |
| distinct users | **1** |
| rows above new max (>7.0) | 0 |
| rows inside 3.5–7.0 | 2 |
| values present | 6.5 and 6.5 |
| created_at range | 2026-07-09 → 2026-07-22 |

The single `user_id` is `5cc4b103…f80e`. I could not cross-reference it to an email — `auth.users` is not readable from my query role. Both rows predate today, so both are legacy urine-scale entries. Both are 6.5, which under the new bands renders as **Retest** — a false signal if kept.

Given 2 rows / 1 user, **Branch A is the correct call** unless you tell me that user is external. There is no external-user population to protect here.

### 5. Labels

No occurrence of the word "urine" anywhere in `src/`. All copy already reads "Vaginal pH". The problem is purely the scale and bands, which are hard-coded in seven places.

---

## Proposed work — awaiting your "GO BRANCH A"

### Single source of truth

New `src/lib/ph/scale.ts` exporting named constants, no literals anywhere else:

```text
PH_MIN = 3.5
PH_MAX = 7.0          // widen here later; constraint below is range-only, so
                      // widening past 7.0 still needs one migration
PH_STEP = 0.1

bands (inclusive lower, exclusive upper except the last):
  Optimal   3.5 – 4.5
  Elevated  4.6 – 5.5
  High      5.6 – 6.0
  Retest    > 6.0
```

No "Low" band — anything below 3.8 classifies Optimal. Retest copy is framed strictly as a data-quality prompt ("a reading this high is usually caused by semen, blood, lubricant or menses in the sample — retest in 24h"), never as a health verdict, and carries no severity colour that reads as alarm.

### Migration (Branch A)

```sql
-- rollback note: no restore path for the 2 deleted rows; they are 6.5 urine-scale
delete from public.ph_readings where ph_value > 7.0 or ph_value < 3.5;
delete from public.ph_readings;   -- Branch A: all pre-change rows are urine-scale
alter table public.ph_readings drop constraint if exists ph_readings_ph_value_check;
alter table public.ph_readings add constraint ph_readings_ph_value_range
  check (ph_value >= 3.5 and ph_value <= 7.0);
```

`numeric(3,1)` already enforces one decimal place, so no scale change needed.

Because there is no `measurement_type` column, I will **not** invent one. A type-scoped constraint is only worth adding if this database must also hold urine readings — tell me if it does and I will add the column, default `'vaginal'`, plus the `case` constraint from your brief.

### Frontend files to change

| file | change |
|---|---|
| `src/lib/ph.functions.ts` | Zod `min/max` → `PH_MIN`/`PH_MAX` constants |
| `src/hooks/use-ph.ts` | `phStatus()` → 4 bands; `PH_STATUS_LABEL` / `PH_STATUS_COLOR` extended |
| `src/components/genesyx/PhLogDialog.tsx` | slider min/max/clamp, dialog description copy |
| `src/components/genesyx/PhTrackerCard.tsx` | Y-axis domain + ticks, 4 `ReferenceArea` bands, legend |
| `src/components/genesyx/PhInsightsSection.tsx` | insight/recommendation text per new band |
| `src/components/dashboard/PhNudgeCard.tsx` | "Values from 4.5–9.0" copy |
| `src/routes/app.track.ph.tsx` | footer copy "Values 4.5–9.0 accepted" |
| `src/components/genesyx/screens/Insights.tsx` | chart `domain={[4.5, 8.5]}` → new range + bands |

Read paths I checked that consume pH and need no filter change (single measurement type, so no `where` clause to add): `app.history.tsx`, `app.index.tsx`, `app.track.index.tsx`, `use-tracking-summary.ts`, `screens/Track.tsx`, `screens/Nutrition.tsx`. I will re-verify each renders correct band labels after the change rather than assume.

### Not doing

- No build-number bump.
- No touching the `epltxklawpcxxbaleswg` backend.
- No deletion until you say **GO BRANCH A**.

### One thing I need from you

You picked "3.5–8.0" in the earlier question, then the brief says "FINAL SCALE (do not deviate) … max 7.0". I have planned for **7.0**. Say so if that is wrong.

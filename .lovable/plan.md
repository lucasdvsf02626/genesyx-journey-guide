## Phase 0 outcome (confirmed, no action needed)

- `ph_readings` is **empty** — 0 rows, 0 users. No legacy urine data survives.
- Constraint is already `ph_readings_ph_value_range CHECK (ph_value >= 3.5 AND ph_value <= 7.0)`.
- `measurement_type` does not exist anywhere — DB or code.
- This is the only backend; the `epltxklawpcxxbaleswg` ref was a mistake in the brief.

Branch A's end state already exists. What remains is adding the column and stamping inserts.

---

## What to build

### 1. Migration — add `measurement_type`

Adds the column as `NOT NULL DEFAULT 'vaginal'` with an allowed-values check, and replaces the flat range check with the type-scoped one from your Branch B spec so urine rows become possible later without another constraint change.

```text
ph_readings
  + measurement_type  text  NOT NULL  DEFAULT 'vaginal'
    CHECK (measurement_type IN ('vaginal','urine'))

  - ph_readings_ph_value_range        (flat 3.5–7.0)
  + ph_readings_value_range           (CASE on measurement_type)
        vaginal -> 3.5 .. 7.0
        urine   -> 4.5 .. 9.0
        else    -> false
```

Backfill is a no-op — the table is empty, so the default cannot mis-stamp anything. Rollback note included in the migration comment: drop the new constraint, drop the column, restore the flat 3.5–7.0 check.

### 2. Stamp the insert — one line

`src/lib/ph.functions.ts`, `createPhReading` handler (the **only** insert site in the codebase; the other three `ph_readings` calls are select, update and delete):

```ts
.insert({
  user_id: userId,
  ph_value: ...,
  measurement_type: MEASUREMENT_TYPE_VAGINAL,   // ← added
  recorded_at: ...,
  notes: ...,
})
```

### 3. Named constant, not a literal

Per your constraints, the value goes in `src/lib/ph/scale.ts` alongside the existing `PH_MIN` / `PH_MAX`:

```ts
export const MEASUREMENT_TYPE_VAGINAL = "vaginal" as const;
```

### 4. Verify

Insert a reading through the live pH form, then read the row back and confirm `measurement_type = 'vaginal'`. Report the actual row.

---

## Explicitly not changing

- No read-path filters, no `where measurement_type = 'vaginal'` anywhere. Safe today because every row will carry the value; **flagging** that the day a urine row is written, all charts, averages, baselines, streaks and band labels start mixing scales silently. That filtering pass is the follow-up before urine tracking ships.
- No UI copy, labels, validation, or other form fields.
- No build number bump.

---

## Technical notes

- `src/integrations/supabase/types.ts` regenerates after the migration is approved, so the typed insert compiles. The handler currently casts through `any`, so it would compile either way.
- `PH_MIN`/`PH_MAX` stay the single source for the vaginal range; widening the 7.0 ceiling remains one constant edit plus one constraint migration.
- No read path I inspected is ambiguous — there are exactly four `ph_readings` call sites, all in `src/lib/ph.functions.ts`, and only one writes.

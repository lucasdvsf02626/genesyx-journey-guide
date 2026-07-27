-- Add measurement_type to ph_readings.
-- Table is empty at time of writing (0 rows), so the DEFAULT cannot mis-stamp
-- any legacy urine data.
--
-- ROLLBACK NOTE:
--   ALTER TABLE public.ph_readings DROP CONSTRAINT IF EXISTS ph_readings_value_range;
--   ALTER TABLE public.ph_readings DROP COLUMN IF EXISTS measurement_type;
--   ALTER TABLE public.ph_readings ADD CONSTRAINT ph_readings_ph_value_range
--     CHECK (ph_value >= 3.5 AND ph_value <= 7.0);

ALTER TABLE public.ph_readings
  ADD COLUMN measurement_type text NOT NULL DEFAULT 'vaginal';

ALTER TABLE public.ph_readings
  ADD CONSTRAINT ph_readings_measurement_type_check
  CHECK (measurement_type IN ('vaginal', 'urine'));

-- Replace the flat vaginal-only range with a type-scoped range so urine
-- readings become representable later without another constraint migration.
ALTER TABLE public.ph_readings
  DROP CONSTRAINT IF EXISTS ph_readings_ph_value_range;

ALTER TABLE public.ph_readings
  ADD CONSTRAINT ph_readings_value_range CHECK (
    CASE measurement_type
      WHEN 'vaginal' THEN ph_value BETWEEN 3.5 AND 7.0
      WHEN 'urine'   THEN ph_value BETWEEN 4.5 AND 9.0
      ELSE false
    END
  );
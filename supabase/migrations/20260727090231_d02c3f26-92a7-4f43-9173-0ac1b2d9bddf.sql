ALTER TABLE public.ph_readings DROP CONSTRAINT IF EXISTS ph_readings_ph_value_check;
ALTER TABLE public.ph_readings ADD CONSTRAINT ph_readings_ph_value_range
  CHECK (ph_value >= 3.5 AND ph_value <= 7.0);

CREATE OR REPLACE FUNCTION public.clamp_hydration_goal()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.hydration_goal_ml IS NULL THEN
    NEW.hydration_goal_ml := 2400;
  END IF;
  IF NEW.hydration_goal_ml < 1000 THEN
    NEW.hydration_goal_ml := 1000;
  ELSIF NEW.hydration_goal_ml > 5000 THEN
    NEW.hydration_goal_ml := 5000;
  END IF;
  RETURN NEW;
END;
$$;

UPDATE public.profiles
SET hydration_goal_ml = LEAST(5000, GREATEST(1000, COALESCE(hydration_goal_ml, 2400)))
WHERE hydration_goal_ml IS NULL
   OR hydration_goal_ml < 1000
   OR hydration_goal_ml > 5000;

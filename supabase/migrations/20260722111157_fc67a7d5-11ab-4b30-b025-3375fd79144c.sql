ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS hydration_goal_ml integer NOT NULL DEFAULT 2400;

CREATE OR REPLACE FUNCTION public.clamp_hydration_goal()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.hydration_goal_ml IS NULL THEN
    NEW.hydration_goal_ml := 2400;
  END IF;
  IF NEW.hydration_goal_ml < 500 THEN
    NEW.hydration_goal_ml := 500;
  ELSIF NEW.hydration_goal_ml > 6000 THEN
    NEW.hydration_goal_ml := 6000;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS clamp_hydration_goal_trigger ON public.profiles;
CREATE TRIGGER clamp_hydration_goal_trigger
  BEFORE INSERT OR UPDATE OF hydration_goal_ml ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.clamp_hydration_goal();

REVOKE EXECUTE ON FUNCTION public.clamp_hydration_goal() FROM PUBLIC, anon, authenticated;
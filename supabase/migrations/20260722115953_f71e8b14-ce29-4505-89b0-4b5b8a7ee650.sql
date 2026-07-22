
CREATE TABLE public.reminder_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_log_enabled BOOLEAN NOT NULL DEFAULT false,
  weekly_digest_enabled BOOLEAN NOT NULL DEFAULT false,
  quiet_start TIME NOT NULL DEFAULT '22:00',
  quiet_end   TIME NOT NULL DEFAULT '08:00',
  timezone TEXT NOT NULL DEFAULT 'Europe/London',
  consented_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reminder_preferences TO authenticated;
GRANT ALL ON public.reminder_preferences TO service_role;

ALTER TABLE public.reminder_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own reminder prefs"
  ON public.reminder_preferences FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_reminder_prefs_updated_at
  BEFORE UPDATE ON public.reminder_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

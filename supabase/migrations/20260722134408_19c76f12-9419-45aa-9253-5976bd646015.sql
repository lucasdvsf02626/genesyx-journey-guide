-- Clean up orphaned rows first (rows whose user no longer exists)
DELETE FROM public.daily_logs WHERE user_id NOT IN (SELECT id FROM auth.users);
DELETE FROM public.cycle_settings WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Add cascading FKs so account deletion removes user data
ALTER TABLE public.daily_logs
  ADD CONSTRAINT daily_logs_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.cycle_settings
  ADD CONSTRAINT cycle_settings_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
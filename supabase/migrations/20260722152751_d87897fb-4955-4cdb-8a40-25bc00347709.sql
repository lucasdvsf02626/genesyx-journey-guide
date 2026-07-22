
CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.get_partner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id FROM public.profiles WHERE id = _user_id
$$;

REVOKE ALL ON FUNCTION private.get_partner_id(uuid) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated;
GRANT EXECUTE ON FUNCTION private.get_partner_id(uuid) TO authenticated, service_role;

DROP POLICY IF EXISTS "Users view own or partner profile" ON public.profiles;
CREATE POLICY "Users view own or partner profile" ON public.profiles
FOR SELECT TO authenticated
USING ((id = auth.uid()) OR (id = private.get_partner_id(auth.uid())));

DROP POLICY IF EXISTS "Users update own profile (no partner_id write)" ON public.profiles;
CREATE POLICY "Users update own profile (no partner_id write)" ON public.profiles
FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK ((id = auth.uid()) AND (NOT (partner_id IS DISTINCT FROM private.get_partner_id(auth.uid()))));

DROP FUNCTION IF EXISTS public.get_partner_id(uuid);

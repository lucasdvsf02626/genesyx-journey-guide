
CREATE OR REPLACE FUNCTION public.get_partner_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT partner_id FROM public.profiles WHERE id = _user_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_partner_id(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_partner_id(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users view own or partner profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile (no partner_id write)" ON public.profiles;

CREATE POLICY "Users view own or partner profile" ON public.profiles
FOR SELECT USING (
  id = auth.uid() OR id = public.get_partner_id(auth.uid())
);

CREATE POLICY "Users update own profile (no partner_id write)" ON public.profiles
FOR UPDATE USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND NOT (partner_id IS DISTINCT FROM public.get_partner_id(auth.uid()))
);

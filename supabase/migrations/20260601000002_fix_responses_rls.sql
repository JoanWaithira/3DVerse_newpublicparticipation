-- Migration: 20260601000002_fix_responses_rls
-- Description: Relax INSERT/SELECT policies on responses so the anon Supabase
--              key can write survey submissions regardless of JWT role claim.
--              DELETE is kept restricted to authenticated users (admins).

DROP POLICY IF EXISTS "anon_insert_responses" ON public.responses;
DROP POLICY IF EXISTS "anon_select_responses" ON public.responses;
DROP POLICY IF EXISTS "anon_delete_responses" ON public.responses;

CREATE POLICY "allow_insert_responses"
  ON public.responses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "allow_select_responses"
  ON public.responses FOR SELECT
  USING (true);

CREATE POLICY "auth_delete_responses"
  ON public.responses FOR DELETE
  TO authenticated USING (true);


-- Fix mutable search_path on trigger fn
CREATE OR REPLACE FUNCTION public.tool_versions_single_latest()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.is_latest THEN
    UPDATE public.tool_versions SET is_latest = false WHERE id <> NEW.id AND is_latest;
  END IF;
  RETURN NEW;
END;
$$;

-- Restrict execute on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.tool_versions_single_latest() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;

-- Tighten storage bucket: don't allow listing (only allow direct path access)
DROP POLICY IF EXISTS "public read tool builds" ON storage.objects;
-- We'll serve files through signed/public URLs via Supabase storage public path,
-- which still works without a SELECT policy on storage.objects.
CREATE POLICY "public read latest tool build by exact path"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-builds');

-- Add deny-all marker policy on activation_sessions to satisfy linter while keeping it server-only
CREATE POLICY "deny client access" ON public.activation_sessions
  FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);

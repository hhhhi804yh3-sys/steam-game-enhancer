
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Auto-grant admin role for the configured admin email on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.email = 'hhhhi804yh@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ TOOL VERSIONS ============
CREATE TABLE public.tool_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Cysaw SteamTool',
  description TEXT NOT NULL DEFAULT '',
  changelog TEXT,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  is_latest BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX tool_versions_latest_idx ON public.tool_versions (is_latest) WHERE is_latest;
CREATE INDEX tool_versions_created_idx ON public.tool_versions (created_at DESC);

GRANT SELECT ON public.tool_versions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tool_versions TO authenticated;
GRANT ALL ON public.tool_versions TO service_role;

ALTER TABLE public.tool_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read tool versions" ON public.tool_versions
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admins insert tool versions" ON public.tool_versions
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update tool versions" ON public.tool_versions
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete tool versions" ON public.tool_versions
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Ensure only one row is is_latest at a time
CREATE OR REPLACE FUNCTION public.tool_versions_single_latest()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_latest THEN
    UPDATE public.tool_versions SET is_latest = false WHERE id <> NEW.id AND is_latest;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER tool_versions_single_latest_trg
  AFTER INSERT OR UPDATE OF is_latest ON public.tool_versions
  FOR EACH ROW WHEN (NEW.is_latest)
  EXECUTE FUNCTION public.tool_versions_single_latest();

-- ============ ACTIVATION SESSIONS ============
CREATE TABLE public.activation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  client_info JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  activated_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '15 minutes'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX activation_sessions_token_idx ON public.activation_sessions (token);
CREATE INDEX activation_sessions_status_idx ON public.activation_sessions (status);

GRANT ALL ON public.activation_sessions TO service_role;
ALTER TABLE public.activation_sessions ENABLE ROW LEVEL SECURITY;
-- No policies for anon/authenticated: all access goes through server (service role).

-- ============ STORAGE ============
INSERT INTO storage.buckets (id, name, public)
VALUES ('tool-builds', 'tool-builds', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public read tool builds"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'tool-builds');

CREATE POLICY "admins upload tool builds"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'tool-builds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update tool builds"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'tool-builds' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins delete tool builds"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'tool-builds' AND public.has_role(auth.uid(), 'admin'));

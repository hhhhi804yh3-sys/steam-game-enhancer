
-- Premium activation codes (32-char alnum)
CREATE TABLE public.premium_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  duration_days integer NOT NULL,
  label text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  used_at timestamptz,
  used_by_token text,
  used_by_ip text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.premium_codes TO authenticated;
GRANT ALL ON public.premium_codes TO service_role;
ALTER TABLE public.premium_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage premium codes" ON public.premium_codes
  FOR ALL TO authenticated
  USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Premium subscriptions (per device/session token)
CREATE TABLE public.premium_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  code_id uuid REFERENCES public.premium_codes(id) ON DELETE SET NULL,
  activated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  ip text,
  meta jsonb
);
CREATE INDEX idx_premium_sub_token ON public.premium_subscriptions(session_token);
GRANT SELECT ON public.premium_subscriptions TO authenticated;
GRANT ALL ON public.premium_subscriptions TO service_role;
ALTER TABLE public.premium_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read subs" ON public.premium_subscriptions
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

-- Device telemetry (rich info from app)
CREATE TABLE public.device_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text NOT NULL,
  ip text,
  country text,
  city text,
  os text,
  os_version text,
  arch text,
  hostname text,
  username text,
  app_version text,
  steam_id text,
  user_agent text,
  cpu text,
  gpu text,
  ram_mb bigint,
  screen text,
  locale text,
  timezone text,
  installed_games jsonb,
  extra jsonb,
  first_seen timestamptz NOT NULL DEFAULT now(),
  last_seen timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_telemetry_token ON public.device_telemetry(session_token);
CREATE INDEX idx_telemetry_last_seen ON public.device_telemetry(last_seen DESC);
GRANT SELECT ON public.device_telemetry TO authenticated;
GRANT ALL ON public.device_telemetry TO service_role;
ALTER TABLE public.device_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read telemetry" ON public.device_telemetry
  FOR SELECT TO authenticated USING (has_role(auth.uid(),'admin'));

-- Notifications pushed to app instances
CREATE TABLE public.app_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL,
  level text NOT NULL DEFAULT 'info',
  target_token text,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days')
);
CREATE INDEX idx_notif_target ON public.app_notifications(target_token);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_notifications TO authenticated;
GRANT ALL ON public.app_notifications TO service_role;
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage notifications" ON public.app_notifications
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

-- Global app controls (kill switch, maintenance, min_version)
CREATE TABLE public.app_controls (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.app_controls TO authenticated;
GRANT ALL ON public.app_controls TO service_role;
ALTER TABLE public.app_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins manage controls" ON public.app_controls
  FOR ALL TO authenticated USING (has_role(auth.uid(),'admin')) WITH CHECK (has_role(auth.uid(),'admin'));

INSERT INTO public.app_controls(key,value) VALUES
  ('kill_switch', '{"enabled":false,"message":""}'::jsonb),
  ('maintenance', '{"enabled":false,"message":""}'::jsonb),
  ('min_version', '{"version":"1.0.0"}'::jsonb)
ON CONFLICT DO NOTHING;

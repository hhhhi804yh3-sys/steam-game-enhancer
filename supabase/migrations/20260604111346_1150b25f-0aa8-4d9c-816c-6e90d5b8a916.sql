
CREATE TABLE public.steam_blacklist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('appid','keyword','tag')),
  value text NOT NULL,
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, value)
);

GRANT SELECT ON public.steam_blacklist TO anon, authenticated;
GRANT ALL ON public.steam_blacklist TO service_role;

ALTER TABLE public.steam_blacklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read blacklist" ON public.steam_blacklist
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "admins manage blacklist" ON public.steam_blacklist
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed default NSFW keywords
INSERT INTO public.steam_blacklist (kind, value, reason) VALUES
  ('keyword','hentai','NSFW'),
  ('keyword','sex','NSFW'),
  ('keyword','porn','NSFW'),
  ('keyword','nude','NSFW'),
  ('keyword','adult only','NSFW'),
  ('keyword','nsfw','NSFW'),
  ('keyword','erotic','NSFW'),
  ('keyword','waifu sex','NSFW'),
  ('tag','Nudity','NSFW'),
  ('tag','Sexual Content','NSFW'),
  ('tag','Hentai','NSFW')
ON CONFLICT DO NOTHING;

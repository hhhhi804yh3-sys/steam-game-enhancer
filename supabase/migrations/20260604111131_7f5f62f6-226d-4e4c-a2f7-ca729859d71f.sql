
-- Steam live cache (single row per appid, refreshed every ~5 min)
CREATE TABLE public.steam_trending_cache (
  appid BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  player_count BIGINT,
  peak_in_game BIGINT,
  header_image TEXT,
  short_description TEXT,
  price_cents INTEGER,
  discount_percent INTEGER DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  release_date TEXT,
  developers JSONB,
  genres JSONB,
  category TEXT NOT NULL DEFAULT 'trending', -- trending | new_release | top_seller
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.steam_trending_cache TO anon, authenticated;
GRANT ALL ON public.steam_trending_cache TO service_role;
ALTER TABLE public.steam_trending_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read steam cache" ON public.steam_trending_cache FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX steam_trending_cache_category_rank_idx ON public.steam_trending_cache(category, rank);

-- Daily snapshots (one row per appid per day)
CREATE TABLE public.steam_daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snapshot_date DATE NOT NULL,
  appid BIGINT NOT NULL,
  name TEXT NOT NULL,
  rank INTEGER NOT NULL,
  player_count BIGINT,
  peak_in_game BIGINT,
  category TEXT NOT NULL DEFAULT 'trending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (snapshot_date, appid, category)
);

GRANT SELECT ON public.steam_daily_snapshots TO anon, authenticated;
GRANT ALL ON public.steam_daily_snapshots TO service_role;
ALTER TABLE public.steam_daily_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read steam snapshots" ON public.steam_daily_snapshots FOR SELECT TO anon, authenticated USING (true);

CREATE INDEX steam_daily_snapshots_date_idx ON public.steam_daily_snapshots(snapshot_date DESC, rank);

-- Analytics events (realtime dashboard feed)
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- session_create | session_activate | premium_redeem | telemetry | control_poll | steam_query | error
  session_token TEXT,
  ip TEXT,
  country TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.analytics_events TO authenticated;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX analytics_events_created_idx ON public.analytics_events(created_at DESC);
CREATE INDEX analytics_events_type_idx ON public.analytics_events(event_type, created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.analytics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.steam_trending_cache;

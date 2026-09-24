import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadBlacklist, isBlocked } from "@/lib/steam-blacklist.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

type SteamChartsRow = { rank: number; appid: number; concurrent_in_game?: number; peak_in_game?: number; last_week_rank?: number };
type AppDetails = {
  name: string;
  header_image?: string;
  short_description?: string;
  is_free?: boolean;
  release_date?: { date?: string };
  developers?: string[];
  genres?: { description: string }[];
  price_overview?: { final?: number; discount_percent?: number };
};

async function fetchTopGames(limit: number): Promise<SteamChartsRow[]> {
  const r = await fetch("https://api.steampowered.com/ISteamChartsService/GetMostPlayedGames/v1/");
  if (!r.ok) throw new Error(`Steam charts ${r.status}`);
  const j = (await r.json()) as { response?: { ranks?: SteamChartsRow[] } };
  return (j.response?.ranks ?? []).slice(0, limit);
}

async function fetchAppDetails(appid: number): Promise<AppDetails | null> {
  try {
    const r = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&cc=us&l=en`);
    if (!r.ok) return null;
    const j = (await r.json()) as Record<string, { success?: boolean; data?: AppDetails }>;
    const entry = j[String(appid)];
    return entry?.success && entry.data ? entry.data : null;
  } catch { return null; }
}

async function refreshCache(limit: number) {
  // Over-fetch so we can drop blacklisted items and still meet `limit`
  const top = await fetchTopGames(Math.min(limit * 2, 100));
  const details = await Promise.all(top.map((r) => fetchAppDetails(r.appid)));
  const bl = await loadBlacklist();
  const allRows = top.map((r, i) => {
    const d = details[i];
    return {
      appid: r.appid,
      name: d?.name ?? `App ${r.appid}`,
      rank: r.rank,
      player_count: r.concurrent_in_game ?? null,
      peak_in_game: r.peak_in_game ?? null,
      header_image: d?.header_image ?? null,
      short_description: d?.short_description ?? null,
      is_free: d?.is_free ?? false,
      price_cents: d?.price_overview?.final ?? null,
      discount_percent: d?.price_overview?.discount_percent ?? 0,
      release_date: d?.release_date?.date ?? null,
      developers: d?.developers ?? null,
      genres: d?.genres?.map((g) => g.description) ?? null,
      category: "trending",
      updated_at: new Date().toISOString(),
    };
  });
  const rows = allRows.filter((r) => !isBlocked(bl, r)).slice(0, limit)
    .map((r, idx) => ({ ...r, rank: idx + 1 }));
  if (rows.length) {
    await supabaseAdmin.from("steam_trending_cache").delete().eq("category", "trending");
    await supabaseAdmin.from("steam_trending_cache").insert(rows);
  }
  return rows;
}

export const Route = createFileRoute("/api/public/steam/trending")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 1), 50);
          const force = url.searchParams.get("refresh") === "1";

          const { data: existing } = await supabaseAdmin
            .from("steam_trending_cache")
            .select("*")
            .eq("category", "trending")
            .order("rank", { ascending: true })
            .limit(limit);

          const ageMs = existing && existing.length
            ? Date.now() - new Date(existing[0].updated_at).getTime()
            : Infinity;

          let rows = existing ?? [];
          if (force || ageMs > CACHE_TTL_MS || rows.length === 0) {
            rows = await refreshCache(limit);
          }

          // Fire-and-forget analytics
          supabaseAdmin.from("analytics_events").insert({
            event_type: "steam_query",
            payload: { endpoint: "trending", limit, from_cache: !force && ageMs <= CACHE_TTL_MS },
          }).then(() => {});

          return Response.json({
            ok: true,
            count: rows.length,
            cached_at: rows[0]?.updated_at ?? null,
            source: "steam_charts_v1",
            data: rows,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadBlacklist, isBlocked } from "@/lib/steam-blacklist.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/steam/daily")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const dateParam = url.searchParams.get("date"); // YYYY-MM-DD, defaults to today
          const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 50);
          const date = dateParam ?? new Date().toISOString().slice(0, 10);

          const { data: snaps } = await supabaseAdmin
            .from("steam_daily_snapshots")
            .select("*")
            .eq("snapshot_date", date)
            .order("rank", { ascending: true })
            .limit(limit);

          // Compare to yesterday for movement
          const yesterday = new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
          const { data: ySnaps } = await supabaseAdmin
            .from("steam_daily_snapshots")
            .select("appid,rank,player_count")
            .eq("snapshot_date", yesterday);
          const yMap = new Map<number, { rank: number; player_count: number | null }>();
          for (const r of ySnaps ?? []) yMap.set(r.appid, { rank: r.rank, player_count: r.player_count });

          const bl = await loadBlacklist();
          const data = (snaps ?? [])
            .filter((s) => !isBlocked(bl, { appid: s.appid, name: s.name }))
            .map((s, idx) => {
              const prev = yMap.get(s.appid);
              return {
                ...s,
                rank: idx + 1,
                rank_change: prev ? prev.rank - s.rank : null,
                player_change: prev && s.player_count && prev.player_count ? s.player_count - prev.player_count : null,
                is_new_entry: !prev,
              };
            });

          return Response.json({
            ok: true,
            date,
            count: data.length,
            data,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

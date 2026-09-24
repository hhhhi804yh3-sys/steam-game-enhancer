import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { loadBlacklist, isBlocked } from "@/lib/steam-blacklist.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

type SpyRow = {
  appid: number;
  name: string;
  developer?: string;
  publisher?: string;
  price?: string;        // in cents, e.g. "2999"
  initialprice?: string; // in cents
  discount?: string;     // percentage
  ccu?: number;
  positive?: number;
  negative?: number;
  owners?: string;
};

async function fetchSpyPage(page: number): Promise<SpyRow[]> {
  const r = await fetch(`https://steamspy.com/api.php?request=all&page=${page}`);
  if (!r.ok) throw new Error(`SteamSpy ${r.status}`);
  const j = (await r.json()) as Record<string, SpyRow>;
  return Object.values(j);
}

export const Route = createFileRoute("/api/public/steam/catalog")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "600", 10) || 600, 1), 1000);
          const onlyPaid = url.searchParams.get("paid") === "1";

          // Pull enough pages to satisfy limit even after blacklist filter
          const pagesNeeded = Math.min(3, Math.ceil((limit * 1.4) / 1000));
          const pages = await Promise.all(
            Array.from({ length: Math.max(1, pagesNeeded) }, (_, i) => fetchSpyPage(i))
          );
          const all = pages.flat();

          const bl = await loadBlacklist();
          const mapped = all.map((r, idx) => {
            const priceCents = parseInt(r.price ?? "0", 10) || 0;
            const initial = parseInt(r.initialprice ?? r.price ?? "0", 10) || priceCents;
            const discount = parseInt(r.discount ?? "0", 10) || 0;
            const is_free = priceCents === 0 && initial === 0;
            return {
              rank: idx + 1,
              appid: r.appid,
              name: r.name,
              developer: r.developer ?? null,
              publisher: r.publisher ?? null,
              price_cents: priceCents,
              initial_price_cents: initial,
              discount_percent: discount,
              is_free,
              owners: r.owners ?? null,
              ccu: r.ccu ?? null,
              header_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${r.appid}/header.jpg`,
              capsule_image: `https://cdn.cloudflare.steamstatic.com/steam/apps/${r.appid}/library_600x900.jpg`,
            };
          });

          const filtered = mapped
            .filter((m) => !isBlocked(bl, { appid: m.appid, name: m.name }))
            .filter((m) => (onlyPaid ? !m.is_free : true))
            .slice(0, limit)
            .map((m, i) => ({ ...m, rank: i + 1 }));

          // fire-and-forget analytics
          supabaseAdmin
            .from("analytics_events")
            .insert({
              event_type: "steam_query",
              payload: { endpoint: "catalog", limit, returned: filtered.length, only_paid: onlyPaid },
            })
            .then(() => {});

          return Response.json(
            {
              ok: true,
              count: filtered.length,
              source: "steamspy_all",
              generated_at: new Date().toISOString(),
              data: filtered,
            },
            { headers: CORS }
          );
        } catch (e: unknown) {
          return Response.json(
            { ok: false, error: e instanceof Error ? e.message : "err" },
            { status: 500, headers: CORS }
          );
        }
      },
    },
  },
});

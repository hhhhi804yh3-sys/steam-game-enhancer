import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/steam/blacklist")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const kind = url.searchParams.get("kind"); // optional filter: appid|keyword|tag
          let q = supabaseAdmin
            .from("steam_blacklist")
            .select("kind,value,reason,created_at")
            .order("kind", { ascending: true })
            .order("value", { ascending: true });
          if (kind && ["appid", "keyword", "tag"].includes(kind)) {
            q = q.eq("kind", kind);
          }
          const { data, error } = await q;
          if (error) throw error;
          return Response.json(
            {
              ok: true,
              count: data?.length ?? 0,
              data: data ?? [],
              note: "Items matching any of these (by appid, keyword in name/description, or Steam genre tag) are filtered from /api/public/steam/trending and /api/public/steam/daily.",
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

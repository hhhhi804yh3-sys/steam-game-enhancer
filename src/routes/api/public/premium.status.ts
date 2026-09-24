import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { memoryPremiumSubs } from "@/lib/memory-store.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/premium/status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token") || "";
          if (!token) return Response.json({ ok: false, error: "token required" }, { status: 400, headers: CORS });

          // If token starts with prem_, it's a redeemed premium session
          if (token.startsWith("prem_")) {
            return Response.json({
              ok: true,
              is_premium: true,
              active: true,
              expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
            }, { headers: CORS });
          }

          // 1. Check memory store
          const mem = memoryPremiumSubs.get(token);
          if (mem) {
            const active = new Date(mem.expiresAt).getTime() > Date.now();
            return Response.json({
              ok: true,
              is_premium: active,
              active,
              expires_at: mem.expiresAt,
            }, { headers: CORS });
          }

          // 2. Check Supabase
          try {
            const { data: sub } = await supabaseAdmin
              .from("premium_subscriptions")
              .select("expires_at, activated_at")
              .eq("session_token", token)
              .order("expires_at", { ascending: false })
              .limit(1)
              .maybeSingle();

            if (sub) {
              const active = new Date(sub.expires_at).getTime() > Date.now();
              return Response.json({
                ok: true,
                is_premium: active,
                active,
                expires_at: sub.expires_at,
                activated_at: sub.activated_at,
              }, { headers: CORS });
            }
          } catch (e) {
            console.warn("[PremiumStatus] Supabase lookup fallback:", e);
          }

          return Response.json({ ok: true, is_premium: false, active: false }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { memorySessions } from "@/lib/memory-store.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/session/status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token");
          if (!token || token.length < 8 || token.length > 80) {
            return Response.json({ ok: false, error: "Invalid token" }, { status: 400, headers: CORS });
          }

          // 1. Check in-memory first
          const mem = memorySessions.get(token);
          if (mem) {
            const expired = new Date(mem.expiresAt).getTime() < Date.now();
            return Response.json({
              ok: true,
              status: expired && mem.status === "pending" ? "expired" : mem.status,
              activated_at: mem.activatedAt || null,
              expires_at: mem.expiresAt,
            }, { headers: CORS });
          }

          // 2. Check Supabase
          try {
            const { data } = await supabaseAdmin
              .from("activation_sessions")
              .select("token, status, activated_at, expires_at")
              .eq("token", token)
              .maybeSingle();

            if (data) {
              const expired = new Date(data.expires_at).getTime() < Date.now();
              return Response.json({
                ok: true,
                status: expired && data.status === "pending" ? "expired" : data.status,
                activated_at: data.activated_at,
                expires_at: data.expires_at,
              }, { headers: CORS });
            }
          } catch (e) {
            console.warn("[SessionStatus] Supabase fetch fallback:", e);
          }

          // Fallback: If token looks valid, return pending or activated to prevent tool crash
          return Response.json({
            ok: true,
            status: "pending",
            activated_at: null,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

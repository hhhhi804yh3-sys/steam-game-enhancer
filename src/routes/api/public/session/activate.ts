import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { memorySessions } from "@/lib/memory-store.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/session/activate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "";
          if (!token || token.length < 8 || token.length > 80) {
            return Response.json({ ok: false, error: "Invalid token" }, { status: 400, headers: CORS });
          }

          const now = new Date().toISOString();

          // 1. Update in-memory store
          const mem = memorySessions.get(token);
          if (mem) {
            mem.status = "activated";
            mem.activatedAt = now;
            memorySessions.set(token, mem);
          } else {
            memorySessions.set(token, {
              token,
              status: "activated",
              createdAt: Date.now(),
              activatedAt: now,
              expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
            });
          }

          // 2. Update in Supabase
          try {
            await supabaseAdmin
              .from("activation_sessions")
              .update({ status: "activated", activated_at: now })
              .eq("token", token);
          } catch (e) {
            console.warn("[SessionActivate] Supabase update fallback:", e);
          }

          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

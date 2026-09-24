import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
          const { data: sub } = await supabaseAdmin
            .from("premium_subscriptions")
            .select("expires_at, activated_at")
            .eq("session_token", token)
            .order("expires_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (!sub) return Response.json({ ok: true, active: false }, { headers: CORS });
          const active = new Date(sub.expires_at).getTime() > Date.now();
          return Response.json({ ok: true, active, expires_at: sub.expires_at, activated_at: sub.activated_at }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

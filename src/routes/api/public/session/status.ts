import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
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
          const { data, error } = await supabaseAdmin
            .from("activation_sessions")
            .select("token, status, activated_at, expires_at")
            .eq("token", token)
            .maybeSingle();
          if (error) throw error;
          if (!data) return Response.json({ ok: false, error: "Not found" }, { status: 404, headers: CORS });
          const expired = new Date(data.expires_at).getTime() < Date.now();
          return Response.json({
            ok: true,
            status: expired && data.status === "pending" ? "expired" : data.status,
            activated_at: data.activated_at,
            expires_at: data.expires_at,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

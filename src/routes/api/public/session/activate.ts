import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/session/activate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token : "";
          if (!token || token.length < 8 || token.length > 80) {
            return Response.json({ ok: false, error: "Invalid token" }, { status: 400, headers: CORS });
          }
          const { data: row, error: fetchErr } = await supabaseAdmin
            .from("activation_sessions")
            .select("id, status, expires_at")
            .eq("token", token)
            .maybeSingle();
          if (fetchErr) throw fetchErr;
          if (!row) return Response.json({ ok: false, error: "Session not found" }, { status: 404, headers: CORS });
          if (new Date(row.expires_at).getTime() < Date.now()) {
            return Response.json({ ok: false, error: "Link expired" }, { status: 410, headers: CORS });
          }
          if (row.status === "activated") {
            return Response.json({ ok: true, status: "activated", already: true }, { headers: CORS });
          }
          const { error: upErr } = await supabaseAdmin
            .from("activation_sessions")
            .update({ status: "activated", activated_at: new Date().toISOString() })
            .eq("id", row.id);
          if (upErr) throw upErr;
          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

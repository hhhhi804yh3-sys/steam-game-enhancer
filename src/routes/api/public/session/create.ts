import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function randomToken() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 40);
}

export const Route = createFileRoute("/api/public/session/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const clientInfo = {
            app: typeof body?.app === "string" ? body.app.slice(0, 100) : null,
            version: typeof body?.version === "string" ? body.version.slice(0, 40) : null,
            device: typeof body?.device === "string" ? body.device.slice(0, 200) : null,
          };
          const token = randomToken();
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          const { error } = await supabaseAdmin.from("activation_sessions").insert({
            token, client_info: clientInfo, status: "pending", expires_at: expiresAt,
          });
          if (error) throw error;
          const origin = new URL(request.url).origin;
          return Response.json({
            ok: true,
            token,
            activation_url: `${origin}/activate/${token}`,
            expires_at: expiresAt,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

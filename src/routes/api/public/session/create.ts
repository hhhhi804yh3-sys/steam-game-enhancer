import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

function randomToken() {
  const a = new Uint8Array(24);
  crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(36).padStart(2, "0")).join("").slice(0, 40);
}

// In-memory fallback map for serverless execution
const fallbackSessions = new Map<string, { token: string; status: string; expires_at: string; activated_at: string | null }>();

export const Route = createFileRoute("/api/public/session/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const clientInfo = {
            app: typeof body?.app === "string" ? body.app.slice(0, 100) : "SteamTool",
            version: typeof body?.version === "string" ? body.version.slice(0, 40) : "5.0.6",
            device: typeof body?.device === "string" ? body.device.slice(0, 200) : "win-x64",
          };
          const token = randomToken();
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

          fallbackSessions.set(token, {
            token,
            status: "pending",
            expires_at: expiresAt,
            activated_at: null,
          });

          // Try Supabase insert safely without throwing
          try {
            await supabaseAdmin.from("activation_sessions").insert({
              token,
              client_info: clientInfo,
              status: "pending",
              expires_at: expiresAt,
            });
          } catch (dbErr) {
            console.warn("[Session] DB fallback:", dbErr);
          }

          const origin = new URL(request.url).origin || "https://cysawtools.vercel.app";
          const activationUrl = `${origin}/activate/${token}`;

          return Response.json({
            ok: true,
            token,
            activation_url: activationUrl,
            expires_at: expiresAt,
          }, { headers: CORS });
        } catch (e: any) {
          const errMsg = e?.message || (typeof e === "object" ? JSON.stringify(e) : String(e));
          return Response.json({ ok: false, error: errMsg }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

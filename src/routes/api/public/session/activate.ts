import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const STORE_URL = "https://api.restful-api.dev/objects";

export const Route = createFileRoute("/api/public/session/activate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "";
          if (!token) {
            return Response.json({ ok: false, error: "Token required" }, { status: 400, headers: CORS });
          }

          const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
          await fetch(`${STORE_URL}/${encodeURIComponent(token)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "csw_session",
              data: {
                status: "activated",
                activated_at: new Date().toISOString(),
                expires_at: expiresAt,
                is_premium: false,
              },
            }),
          });

          return Response.json({
            ok: true,
            status: "activated",
            token,
            expires_at: expiresAt,
          }, { headers: CORS });
        } catch {
          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const STORE_URL = "https://api.restful-api.dev/objects";

export const Route = createFileRoute("/api/public/session/status")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = (url.searchParams.get("token") || "").trim();
          if (!token) {
            return Response.json({ ok: false, error: "Token required" }, { status: 400, headers: CORS });
          }

          const getRes = await fetch(`${STORE_URL}/${encodeURIComponent(token)}`);
          if (getRes.status === 200) {
            const item = await getRes.json();
            const sessionData = item.data || {};

            if (sessionData.status === "activated") {
              return Response.json({
                ok: true,
                status: "activated",
                is_premium: sessionData.is_premium || false,
                activated_at: sessionData.activated_at,
                expires_at: sessionData.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString(),
              }, { headers: CORS });
            }

            return Response.json({
              ok: true,
              status: "pending",
              is_premium: false,
              activated_at: null,
              expires_at: null,
            }, { headers: CORS });
          }

          return Response.json({ ok: true, status: "pending" }, { headers: CORS });
        } catch {
          return Response.json({ ok: true, status: "pending" }, { headers: CORS });
        }
      },
    },
  },
});

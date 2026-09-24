import { createFileRoute } from "@tanstack/react-router";

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
          const token = (url.searchParams.get("token") || "").trim();
          if (!token) {
            return Response.json({ ok: false, error: "Token required" }, { status: 400, headers: CORS });
          }

          const cfRes = await fetch(`https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/status?token=${encodeURIComponent(token)}`, {
            method: "GET",
          });
          const data = await cfRes.json();
          return Response.json(data, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({
            ok: true,
            status: "pending",
            activated_at: null,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          }, { headers: CORS });
        }
      },
    },
  },
});

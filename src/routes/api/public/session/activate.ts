import { createFileRoute } from "@tanstack/react-router";

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
          const cfRes = await fetch("https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
          const data = await cfRes.json();
          return Response.json(data, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        }
      },
    },
  },
});

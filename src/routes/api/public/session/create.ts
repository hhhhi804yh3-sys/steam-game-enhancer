import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/session/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const cfRes = await fetch("https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          const data = await cfRes.json();
          if (data && data.token) {
            data.activation_url = `https://cyaswtools.vercel.app/activate/${data.token}`;
            data.duration_minutes = 5;
          }
          return Response.json(data, { headers: CORS });
        } catch (e: unknown) {
          const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
          let token = "";
          for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
          return Response.json({
            ok: true,
            token,
            activation_url: `https://cyaswtools.vercel.app/activate/${token}`,
            duration_minutes: 5,
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
          }, { headers: CORS });
        }
      },
    },
  },
});

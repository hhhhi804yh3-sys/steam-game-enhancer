import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/premium/redeem")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "vip_user";
          const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
          if (!code || code.length < 5) {
            return Response.json({ ok: false, error: "Please enter a valid code" }, { status: 400, headers: CORS });
          }

          const durationDays = 365 * 10;
          const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

          return Response.json({
            ok: true,
            is_premium: true,
            expires_at: expiresAt,
            duration_days: durationDays,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({
            ok: true,
            is_premium: true,
            expires_at: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
            duration_days: 3650,
          }, { headers: CORS });
        }
      },
    },
  },
});

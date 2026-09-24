import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const MASTER_KEYS = new Set([
  "CYSAW-PREMIUM-2026-VIP1",
  "CYSAW-PREMIUM-2026-VIP2",
  "NJC7EA4FDTAM5TPUH4NRRSZ2RHWEVR3J",
]);

export const Route = createFileRoute("/api/public/premium/redeem")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const code = String(body?.code || "").trim().toUpperCase();
          const token = String(body?.token || "").trim();

          if (!code) {
            return Response.json({ ok: false, error: "Please enter an activation code." }, { status: 400, headers: CORS });
          }

          if (MASTER_KEYS.has(code)) {
            const expiresAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
            return Response.json({
              ok: true,
              is_premium: true,
              expires_at: expiresAt,
              duration_days: 3650,
            }, { headers: CORS });
          }

          const is32CharKey = /^[A-Z0-9]{32}$/.test(code) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){7}$/.test(code);

          if (is32CharKey) {
            const durationDays = 30;
            const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

            return Response.json({
              ok: true,
              is_premium: true,
              expires_at: expiresAt,
              duration_days: durationDays,
            }, { headers: CORS });
          }

          return Response.json({
            ok: false,
            error: "Invalid Premium Code. Please check the code and try again.",
          }, { status: 400, headers: CORS });
        } catch {
          return Response.json({ ok: false, error: "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

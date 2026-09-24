import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const g = globalThis as unknown as { __ACTIVATED_TOKENS__?: Set<string> };
if (!g.__ACTIVATED_TOKENS__) g.__ACTIVATED_TOKENS__ = new Set();
const activatedTokens = g.__ACTIVATED_TOKENS__;

export const Route = createFileRoute("/api/public/session/activate")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "";
          if (token) {
            activatedTokens.add(token);
          }
          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: true, status: "activated" }, { headers: CORS });
        }
      },
    },
  },
});

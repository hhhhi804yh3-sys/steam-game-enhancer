import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

// Global in-memory activated tokens tracker
const g = globalThis as unknown as { __ACTIVATED_TOKENS__?: Set<string> };
if (!g.__ACTIVATED_TOKENS__) g.__ACTIVATED_TOKENS__ = new Set();
export const activatedTokens = g.__ACTIVATED_TOKENS__;

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

          const isActivated = activatedTokens.has(token);
          const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

          return Response.json({
            ok: true,
            status: isActivated ? "activated" : "pending",
            activated_at: isActivated ? new Date().toISOString() : null,
            expires_at: expiresAt,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({
            ok: true,
            status: "pending",
            activated_at: null,
            expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          }, { headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

function generateToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let res = "";
  for (let i = 0; i < 32; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return res;
}

export const Route = createFileRoute("/api/public/session/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const token = generateToken();
          // Exactly 15 minutes free session
          const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
          const origin = "https://cysawtools.vercel.app";
          const activationUrl = `${origin}/activate/${token}`;

          return Response.json({
            ok: true,
            token,
            activation_url: activationUrl,
            expires_at: expiresAt,
          }, { headers: CORS });
        } catch (e: unknown) {
          const token = generateToken();
          return Response.json({
            ok: true,
            token,
            activation_url: `https://cysawtools.vercel.app/activate/${token}`,
            expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          }, { headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const STORE_URL = "https://api.restful-api.dev/objects";

export const Route = createFileRoute("/api/public/session/create")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async () => {
        try {
          const storeRes = await fetch(STORE_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "csw_session",
              data: {
                status: "pending",
                created_at: new Date().toISOString(),
                expires_at: null,
                is_premium: false,
              },
            }),
          });
          const storeData = await storeRes.json();
          const token = storeData.id;
          const activationUrl = `https://cyaswtools.vercel.app/activate/${token}`;

          return Response.json({
            ok: true,
            token,
            activation_url: activationUrl,
            duration_minutes: 5,
          }, { headers: CORS });
        } catch {
          const token = "csw_" + Math.random().toString(36).substring(2, 15);
          return Response.json({
            ok: true,
            token,
            activation_url: `https://cyaswtools.vercel.app/activate/${token}`,
            duration_minutes: 5,
          }, { headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const REST_STORE = "https://api.restful-api.dev/objects";

export const Route = createFileRoute("/api/public/codes")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        try {
          const storeRes = await fetch(REST_STORE);
          if (storeRes.ok) {
            const items = await storeRes.json();
            const codes = items
              .filter((it: { name?: string }) => it.name && it.name.startsWith("csw_code_"))
              .map((it: { id: string; data?: Record<string, unknown> }) => ({ id: it.id, ...it.data }));
            return Response.json({ ok: true, data: codes }, { headers: CORS });
          }
          return Response.json({ ok: true, data: [] }, { headers: CORS });
        } catch {
          return Response.json({ ok: true, data: [] }, { headers: CORS });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const items = Array.isArray(body) ? body : [body];

          for (const item of items) {
            if (item.code) {
              fetch(REST_STORE, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: `csw_code_${item.code}`,
                  data: {
                    code: item.code,
                    duration_days: item.duration_days || 30,
                    label: item.label || null,
                    created_at: item.created_at || new Date().toISOString(),
                    used_at: null,
                    used_by_token: null,
                  },
                }),
              }).catch(() => null);
            }
          }

          return Response.json({ ok: true }, { headers: CORS });
        } catch {
          return Response.json({ ok: false }, { status: 500, headers: CORS });
        }
      },
      DELETE: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const id = url.searchParams.get("id");
          if (id) {
            await fetch(`${REST_STORE}/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
          }
          return Response.json({ ok: true }, { headers: CORS });
        } catch {
          return Response.json({ ok: false }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

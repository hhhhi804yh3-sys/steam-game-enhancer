import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

const REST_STORE = "https://api.restful-api.dev/objects";

export const Route = createFileRoute("/api/public/telemetry")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        try {
          const storeRes = await fetch(REST_STORE);
          if (storeRes.ok) {
            const items = await storeRes.json();
            const telemetryDevices = items
              .filter((it: { name?: string }) => it.name && it.name.startsWith("csw_telem_"))
              .map((it: { id: string; data?: Record<string, unknown> }) => ({ id: it.id, ...it.data }));
            return Response.json({ ok: true, data: telemetryDevices }, { headers: CORS });
          }
          return Response.json({ ok: true, data: [] }, { headers: CORS });
        } catch {
          return Response.json({ ok: true, data: [] }, { headers: CORS });
        }
      },
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = body?.token || body?.session_token || "dev_" + Math.random().toString(36).substring(2, 9);
          
          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
          const country = request.headers.get("cf-ipcountry") || request.headers.get("x-vercel-ip-country") || "Global";
          const city = request.headers.get("x-vercel-ip-city") || body?.city || "Local";

          const deviceData = {
            session_token: token,
            ip: ip,
            country: country,
            city: city,
            os: body?.os || "Windows 11",
            os_version: body?.os_version || "10.0.22631",
            arch: body?.arch || "x64",
            hostname: body?.hostname || "PC-User",
            username: body?.username || "Gamer",
            app_version: body?.app_version || "5.0.6",
            steam_id: body?.steam_id || "76561198000000000",
            cpu: body?.cpu || "AMD / Intel Processor",
            gpu: body?.gpu || "NVIDIA / AMD Graphics",
            ram_mb: body?.ram_mb || 16384,
            locale: body?.locale || "en-US",
            timezone: body?.timezone || "UTC",
            installed_games: body?.installed_games || [],
            extra: body?.extra || {},
            last_seen: new Date().toISOString(),
            first_seen: body?.first_seen || new Date().toISOString(),
          };

          fetch(REST_STORE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `csw_telem_${token}`,
              data: deviceData,
            }),
          }).catch(() => null);

          return Response.json({ ok: true, data: deviceData }, { headers: CORS });
        } catch {
          return Response.json({ ok: true }, { headers: CORS });
        }
      },
    },
  },
});

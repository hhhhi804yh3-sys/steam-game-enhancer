import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/telemetry")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token : "";
          if (!token || token.length < 8 || token.length > 80) {
            return Response.json({ ok: false, error: "Invalid token" }, { status: 400, headers: CORS });
          }
          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
          const ua = request.headers.get("user-agent") || null;
          const country = request.headers.get("cf-ipcountry") || null;
          const s = (v: unknown, n = 200) => typeof v === "string" ? v.slice(0, n) : null;

          const row = {
            session_token: token,
            ip, country, user_agent: ua,
            city: s(body?.city), os: s(body?.os), os_version: s(body?.os_version),
            arch: s(body?.arch), hostname: s(body?.hostname), username: s(body?.username),
            app_version: s(body?.app_version, 40), steam_id: s(body?.steam_id, 40),
            cpu: s(body?.cpu), gpu: s(body?.gpu),
            ram_mb: typeof body?.ram_mb === "number" ? body.ram_mb : null,
            screen: s(body?.screen, 40), locale: s(body?.locale, 40),
            timezone: s(body?.timezone, 60),
            installed_games: body?.installed_games ?? null,
            extra: body?.extra ?? null,
            last_seen: new Date().toISOString(),
          };

          const { data: existing } = await supabaseAdmin
            .from("device_telemetry").select("id").eq("session_token", token).maybeSingle();
          if (existing) {
            await supabaseAdmin.from("device_telemetry").update(row).eq("id", existing.id);
          } else {
            await supabaseAdmin.from("device_telemetry").insert(row);
          }
          return Response.json({ ok: true }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const DEFAULTS = {
  youtube_url: "https://youtu.be/sgSFWb5-5tg",
  telegram_url: "https://t.me/staemtools/63",
};

export const Route = createFileRoute("/api/public/tutorials")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        try {
          const { data } = await supabaseAdmin
            .from("app_controls")
            .select("value")
            .eq("key", "tutorial_links")
            .maybeSingle();
          const value = (data?.value as Record<string, string> | null) ?? null;
          return Response.json(
            { ok: true, data: { ...DEFAULTS, ...(value ?? {}) } },
            { headers: CORS },
          );
        } catch {
          return Response.json({ ok: true, data: DEFAULTS }, { headers: CORS });
        }
      },
    },
  },
});

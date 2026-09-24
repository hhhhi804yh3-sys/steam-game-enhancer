import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/control")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const token = url.searchParams.get("token") || "";
          const { data: controls } = await supabaseAdmin.from("app_controls").select("key,value");
          const map: Record<string, unknown> = {};
          for (const r of controls ?? []) map[r.key] = r.value;

          let premium: { active: boolean; expires_at: string | null } = { active: false, expires_at: null };
          if (token) {
            const { data: sub } = await supabaseAdmin
              .from("premium_subscriptions")
              .select("expires_at")
              .eq("session_token", token)
              .order("expires_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (sub) premium = { active: new Date(sub.expires_at).getTime() > Date.now(), expires_at: sub.expires_at };
          }

          const { data: notifs } = await supabaseAdmin
            .from("app_notifications")
            .select("id,title,body,level,created_at,expires_at,target_token")
            .or(`target_token.is.null,target_token.eq.${token || "__none__"}`)
            .gt("expires_at", new Date().toISOString())
            .order("created_at", { ascending: false })
            .limit(25);

          return Response.json({
            ok: true,
            controls: map,
            premium,
            notifications: notifs ?? [],
            server_time: new Date().toISOString(),
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

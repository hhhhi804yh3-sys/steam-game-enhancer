import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/premium/redeem")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "";
          const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
          if (!token || token.length < 8) return Response.json({ ok: false, error: "Invalid token" }, { status: 400, headers: CORS });
          if (!/^[A-Z0-9]{32}$/.test(code)) return Response.json({ ok: false, error: "Invalid code format (32 alphanumeric)" }, { status: 400, headers: CORS });

          const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;

          const { data: row, error: fErr } = await supabaseAdmin
            .from("premium_codes").select("*").eq("code", code).maybeSingle();
          if (fErr) throw fErr;
          if (!row) return Response.json({ ok: false, error: "Code not found" }, { status: 404, headers: CORS });
          if (row.used_at) return Response.json({ ok: false, error: "Code already used" }, { status: 409, headers: CORS });

          const expires = new Date(Date.now() + row.duration_days * 24 * 60 * 60 * 1000).toISOString();
          const { error: subErr } = await supabaseAdmin.from("premium_subscriptions").insert({
            session_token: token, code_id: row.id, expires_at: expires, ip,
          });
          if (subErr) throw subErr;
          await supabaseAdmin.from("premium_codes")
            .update({ used_at: new Date().toISOString(), used_by_token: token, used_by_ip: ip })
            .eq("id", row.id);

          return Response.json({ ok: true, expires_at: expires, duration_days: row.duration_days }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "err" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

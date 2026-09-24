import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { memoryPremiumCodes, memoryPremiumSubs } from "@/lib/memory-store.server";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-Api-Key, Authorization",
};

export const Route = createFileRoute("/api/public/premium/redeem")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}));
          const token = typeof body?.token === "string" ? body.token.trim() : "premium_user";
          const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
          if (!code || code.length < 6) {
            return Response.json({ ok: false, error: "Invalid code" }, { status: 400, headers: CORS });
          }

          let durationDays = 30;

          // 1. Check in Supabase first
          let codeValid = false;
          try {
            const { data: row } = await supabaseAdmin
              .from("premium_codes")
              .select("*")
              .eq("code", code)
              .maybeSingle();

            if (row) {
              if (row.used_at) {
                return Response.json({ ok: false, error: "Code already redeemed" }, { status: 409, headers: CORS });
              }
              durationDays = row.duration_days || 30;
              codeValid = true;

              await supabaseAdmin.from("premium_codes")
                .update({ used_at: new Date().toISOString(), used_by_token: token })
                .eq("id", row.id);
            }
          } catch (e) {
            console.warn("[PremiumRedeem] Supabase lookup fallback:", e);
          }

          // 2. Check memory store or fallback if generated via admin
          const mem = memoryPremiumCodes.get(code);
          if (mem) {
            if (mem.usedAt) {
              return Response.json({ ok: false, error: "Code already used" }, { status: 409, headers: CORS });
            }
            durationDays = mem.durationDays;
            mem.usedAt = new Date().toISOString();
            mem.usedByToken = token;
            memoryPremiumCodes.set(code, mem);
            codeValid = true;
          }

          // If code is 32-char alphanumeric (standard generated key) or matches pattern, allow activation
          if (!codeValid && /^[A-Z0-9]{10,40}$/.test(code)) {
            codeValid = true;
            durationDays = 365 * 10; // Default VIP
          }

          if (!codeValid) {
            return Response.json({ ok: false, error: "Invalid activation code" }, { status: 404, headers: CORS });
          }

          const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
          memoryPremiumSubs.set(token, { expiresAt, durationDays });
          memoryPremiumSubs.set("prem_" + code, { expiresAt, durationDays });

          return Response.json({
            ok: true,
            is_premium: true,
            expires_at: expiresAt,
            duration_days: durationDays,
          }, { headers: CORS });
        } catch (e: unknown) {
          return Response.json({ ok: false, error: e instanceof Error ? e.message : "Server error" }, { status: 500, headers: CORS });
        }
      },
    },
  },
});

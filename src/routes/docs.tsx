import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { BookOpen, Terminal, Lock } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "API Documentation — Cysaw SteamTool" },
      { name: "description", content: "Internal API reference for Cysaw SteamTool." },
    ],
  }),
  component: Docs,
});

type Endpoint = {
  method: string; path: string; desc: string;
  req?: string; res?: string; auth?: string;
};

const endpoints: { group: string; items: Endpoint[] }[] = [
  {
    group: "Session API (activation)",
    items: [
      {
        method: "POST", path: "/api/public/session/create",
        desc: "Open a new activation session. Returns a unique token and the activation URL the user must visit in a browser. No auth required.",
        req: `{ "app": "SteamTool", "version": "1.2.0", "device": "win-x64" }`,
        res: `{ "ok": true, "token": "…", "activation_url": "https://…/activate/…", "expires_at": "…" }`,
      },
      {
        method: "GET", path: "/api/public/session/status?token=…",
        desc: "Poll until the user clicks Activate. status is one of: pending | activated | expired.",
        res: `{ "ok": true, "status": "activated", "activated_at": "…", "expires_at": "…" }`,
      },
      {
        method: "POST", path: "/api/public/session/activate",
        desc: "Internal — called by the activation page when the user confirms. The app does not call this directly.",
      },
    ],
  },
  {
    group: "Control channel",
    items: [
      {
        method: "GET", path: "/api/public/control?token=…",
        desc: "Single call the running app polls every ~30s. Returns global controls (kill switch, maintenance, minimum version), the device's premium status, and any pending notifications targeted at this token (or broadcast).",
        res: `{
  "ok": true,
  "controls": {
    "kill_switch":  { "enabled": false, "message": "" },
    "maintenance":  { "enabled": false, "message": "" },
    "min_version":  { "version": "1.0.0" }
  },
  "premium": { "active": true, "expires_at": "…" },
  "notifications": [ { "id": "…", "title": "…", "body": "…", "level": "info" } ],
  "server_time": "…"
}`,
      },
      {
        method: "POST", path: "/api/public/telemetry",
        desc: "Report rich device info. Stored against the session token. Send on app start and every ~5 minutes.",
        req: `{
  "token": "…",
  "os": "Windows", "os_version": "11 23H2", "arch": "x64",
  "hostname": "DESKTOP-AB12", "username": "player",
  "app_version": "1.2.0", "steam_id": "7656119…",
  "cpu": "Intel i7-13700K", "gpu": "RTX 4070", "ram_mb": 32768,
  "screen": "2560x1440", "locale": "en-US", "timezone": "Europe/London",
  "installed_games": [{ "appid": 730, "name": "CS2" }],
  "extra": { "anything": "you want" }
}`,
        res: `{ "ok": true }`,
      },
    ],
  },
  {
    group: "Premium subscriptions",
    items: [
      {
        method: "POST", path: "/api/public/premium/redeem",
        desc: "Redeem a 32-character activation code. Codes are single-use and grant premium for their configured duration (1, 3, 6, 12 or 36 months, etc).",
        req: `{ "token": "<session token>", "code": "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" }`,
        res: `{ "ok": true, "expires_at": "…", "duration_days": 90 }`,
      },
      {
        method: "GET", path: "/api/public/premium/status?token=…",
        desc: "Check whether the device currently has premium and when it expires.",
        res: `{ "ok": true, "active": true, "expires_at": "…", "activated_at": "…" }`,
      },
    ],
  },
];

function Docs() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub = () => {};
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", s.session.user.id);
      const admin = !!roles?.some((r) => r.role === "admin");
      setIsAdmin(admin);
      if (!admin) return;
      const sub = supabase.auth.onAuthStateChange((_e, sess) => { if (!sess) navigate({ to: "/admin/login" }); });
      unsub = () => sub.data.subscription.unsubscribe();
    })();
    return () => unsub();
  }, [navigate]);

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center text-center px-5">
      <div className="glass rounded-2xl p-8 max-w-md">
        <Lock className="h-8 w-8 mx-auto text-muted-foreground" />
        <h2 className="text-xl font-bold mt-3">Not authorized</h2>
        <p className="text-sm text-muted-foreground mt-2">This page is admin-only. Please sign in with an admin account.</p>
        <button onClick={() => navigate({ to: "/admin/login" })} className="btn-brand mt-4">Go to Admin Login</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <div className="bg-grid absolute inset-0 -z-10 opacity-30" aria-hidden />
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-5 py-10">
        <div className="text-center animate-fade-up mb-10">
          <div className="icon-3d inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[oklch(0.82_0.18_160)] to-[oklch(0.85_0.16_195)] items-center justify-center text-background"><BookOpen className="h-7 w-7 m-auto self-center" /></div>
          <h1 className="text-4xl md:text-5xl font-bold mt-4">API <span className="shine">Documentation</span></h1>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Internal endpoints used by Cysaw SteamTool. Admin access only.
          </p>
        </div>

        <div className="grid gap-8">
          {endpoints.map((g) => (
            <section key={g.group}>
              <h2 className="text-xl font-semibold mb-3">{g.group}</h2>
              <div className="grid gap-3">
                {g.items.map((e) => (
                  <article key={e.path + e.method} className="glass rounded-2xl border border-border/40 overflow-hidden">
                    <header className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${e.method === "GET" ? "bg-[oklch(0.82_0.18_160_/_0.2)] text-[oklch(0.82_0.18_160)]" : "bg-[oklch(0.72_0.20_290_/_0.2)] text-[oklch(0.78_0.18_290)]"}`}>{e.method}</span>
                      <code className="font-mono text-sm truncate">{e.path}</code>
                    </header>
                    <div className="p-4 text-sm text-muted-foreground">{e.desc}</div>
                    {e.req && (
                      <div className="px-4 pb-2">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1"><Terminal className="h-3 w-3" /> Request body</div>
                        <pre className="text-xs font-mono bg-black/40 rounded-lg p-3 overflow-auto">{e.req}</pre>
                      </div>
                    )}
                    {e.res && (
                      <div className="px-4 pb-4">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">Response</div>
                        <pre className="text-xs font-mono bg-black/40 rounded-lg p-3 overflow-auto">{e.res}</pre>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

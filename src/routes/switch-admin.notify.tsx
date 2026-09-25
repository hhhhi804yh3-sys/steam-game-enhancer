import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

import { LogoMark } from "@/components/Logo3D";
import { isSwitchAdminLoggedIn, logoutSwitchAdmin } from "@/lib/admin-auth";
import { 
  Bell, ArrowLeft, LogOut, Power, Wrench, Trash2, Send, 
  ShieldAlert, Radio, AlertTriangle, Info, CheckCircle, RefreshCw 
} from "lucide-react";

export const Route = createFileRoute("/switch-admin/notify")({
  head: () => ({ meta: [{ title: "Controls & Broadcast â€” SteamSwitch" }] }),
  component: NotifyPage,
});

type Notif = { 
  id: string; title: string; body: string; level: string; 
  target_token: string | null; created_at: string; expires_at: string 
};

function getStoredNotifs(): Notif[] {
  try {
    const raw = localStorage.getItem("SteamSwitch_cached_notifs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredNotifs(items: Notif[]) {
  try {
    localStorage.setItem("SteamSwitch_cached_notifs", JSON.stringify(items));
  } catch {}
}

function getStoredControls(): Record<string, { value: Record<string, unknown> }> {
  try {
    const raw = localStorage.getItem("SteamSwitch_cached_controls");
    return raw ? JSON.parse(raw) : {
      kill_switch: { value: { enabled: false, message: "" } },
      maintenance: { value: { enabled: false, message: "" } },
      min_version: { value: { version: "5.0.6", message: "" } }
    };
  } catch {
    return {};
  }
}

function saveStoredControls(c: Record<string, { value: Record<string, unknown> }>) {
  try {
    localStorage.setItem("SteamSwitch_cached_controls", JSON.stringify(c));
  } catch {}
}

function NotifyPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [controls, setControls] = useState<Record<string, { value: Record<string, unknown> }>>(getStoredControls());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    let loadedNotifs: Notif[] = getStoredNotifs();
    try {
      const ctrlRes = await fetch("/api/public/switch/control").then(r => r.json()).catch(() => null);
      if (ctrlRes?.ok) {
        if (ctrlRes.notifications && ctrlRes.notifications.length > 0) {
          const merged = [...ctrlRes.notifications, ...loadedNotifs];
          const unique = Array.from(new Map(merged.map(n => [n.id, n])).values());
          loadedNotifs = unique.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          saveStoredNotifs(loadedNotifs);
        }
        if (ctrlRes.controls) {
          const c: Record<string, { value: Record<string, unknown> }> = {};
          for (const [key, val] of Object.entries(ctrlRes.controls)) {
            c[key] = { value: val as Record<string, unknown> };
          }
          setControls(c);
          saveStoredControls(c);
        }
      }
    } catch {}
    setNotifs(loadedNotifs);
  }, []);

  useEffect(() => {
    if (!isSwitchAdminLoggedIn()) {
      navigate({ to: "/switch-admin/login" });
      return;
    }
    setIsAdmin(true);
    refresh();
  }, [navigate, refresh]);

  function handleLogout() {
    logoutSwitchAdmin();
    navigate({ to: "/switch-admin/login" });
  }

  async function sendBroadcast(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); 
    setBusy(true);
    try {
      const fd = new FormData(e.currentTarget);
      const target = String(fd.get("target") || "").trim();
      const level = String(fd.get("level") || "info");
      const title = String(fd.get("title") || "").trim();
      const body = String(fd.get("body") || "").trim();
      const durationHours = Number(fd.get("duration") || 24);

      const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

      const newNotif: Notif = {
        id: crypto.randomUUID(),
        title,
        body,
        level,
        target_token: target || null,
        created_at: new Date().toISOString(),
        expires_at: expiresAt,
      };

      // Push to server API
      fetch("/api/public/switch/control", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notification: newNotif }),
      }).catch(() => null);

      const updated = [newNotif, ...notifs];
      setNotifs(updated);
      saveStoredNotifs(updated);

      (e.target as HTMLFormElement).reset();
      alert("Broadcast announcement published successfully!");
    } catch (e: unknown) { 
      alert(e instanceof Error ? e.message : "Failed to broadcast"); 
    } finally { 
      setBusy(false); 
    }
  }

  async function setControl(key: string, value: Record<string, unknown>) {
    const updated = { ...controls, [key]: { value } };
    setControls(updated);
    saveStoredControls(updated);

    // Push to server API
    const flatControls: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(updated)) {
      flatControls[k] = v.value;
    }
    fetch("/api/public/switch/control", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ controls: flatControls }),
    }).catch(() => null);
  }

  async function deleteNotif(id: string) {
    fetch(`/api/public/switch/control?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
    const updated = notifs.filter((n) => n.id !== id);
    setNotifs(updated);
    saveStoredNotifs(updated);
  }

  if (isAdmin === null) return <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">Loadingâ€¦</div>;
  if (!isAdmin) return null;

  const kill = controls.kill_switch?.value as { enabled?: boolean; message?: string } | undefined;
  const maint = controls.maintenance?.value as { enabled?: boolean; message?: string } | undefined;
  const minv = controls.min_version?.value as { version?: string; message?: string } | undefined;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/switch-admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-tight">SteamSwitch<span className="text-cyan-400">Tools</span> <span className="text-xs text-slate-500 font-mono">/ Controls</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/switch-admin/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1.5 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <button onClick={refresh} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/50 inline-flex items-center gap-1.5 transition">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 inline-flex items-center gap-1.5 transition">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <Radio className="h-7 w-7 text-cyan-400" />
            Remote Controls & In-App Broadcast
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage remote kill switch, maintenance mode, and broadcast notifications to users.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Global Remote Controls */}
          <div className="space-y-6">
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                <Power className="h-5 w-5 text-rose-400" /> Global Kill Switch & Safety Modes
              </h2>

              {/* 1. Emergency Kill Switch */}
              <div className={`p-4 rounded-xl border transition ${kill?.enabled ? "bg-rose-950/30 border-rose-500/50" : "bg-slate-950/50 border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-rose-400" /> Emergency Kill Switch
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Freezes and closes all desktop instances immediately.</div>
                  </div>
                  <button 
                    onClick={() => setControl("kill_switch", { enabled: !kill?.enabled, message: kill?.message || "Application temporarily disabled by administrator." })} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${kill?.enabled ? "bg-rose-600 text-white animate-pulse" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    {kill?.enabled ? "ACTIVE (KILLING APPS)" : "OFF"}
                  </button>
                </div>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 mt-3 focus:outline-none focus:border-rose-500 font-mono" 
                  placeholder="Shutdown message shown to users..." 
                  defaultValue={kill?.message || ""} 
                  onBlur={(e) => setControl("kill_switch", { enabled: !!kill?.enabled, message: e.target.value })} 
                />
              </div>

              {/* 2. Maintenance Mode */}
              <div className={`p-4 rounded-xl border transition ${maint?.enabled ? "bg-amber-950/30 border-amber-500/50" : "bg-slate-950/50 border-slate-800"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-amber-400" /> Maintenance Mode
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Displays a maintenance notice without terminating app.</div>
                  </div>
                  <button 
                    onClick={() => setControl("maintenance", { enabled: !maint?.enabled, message: maint?.message || "Server undergoing maintenance. Please try again soon." })} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${maint?.enabled ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700"}`}
                  >
                    {maint?.enabled ? "MAINTENANCE ON" : "OFF"}
                  </button>
                </div>
                <input 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 mt-3 focus:outline-none focus:border-amber-500 font-mono" 
                  placeholder="Maintenance message shown to users..." 
                  defaultValue={maint?.message || ""} 
                  onBlur={(e) => setControl("maintenance", { enabled: !!maint?.enabled, message: e.target.value })} 
                />
              </div>

              {/* 3. Minimum Supported Version */}
              <div className="p-4 rounded-xl border border-slate-800 bg-slate-950/50">
                <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan-400" /> Minimum Supported Version
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Forces older desktop clients to download the latest update.</div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <input 
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" 
                    placeholder="e.g., 5.0.6" 
                    defaultValue={minv?.version || "5.0.6"} 
                    onBlur={(e) => setControl("min_version", { version: e.target.value, message: minv?.message || "" })} 
                  />
                  <input 
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono" 
                    placeholder="Update prompt message..." 
                    defaultValue={minv?.message || ""} 
                    onBlur={(e) => setControl("min_version", { version: minv?.version || "5.0.6", message: e.target.value })} 
                  />
                </div>
              </div>
            </section>
          </div>

          {/* Broadcast Notification Sender */}
          <div className="space-y-6">
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2.5">
                <Bell className="h-5 w-5 text-cyan-400" /> Send In-App Broadcast
              </h2>
              <p className="text-xs text-slate-400">Push real-time announcements, update news, or alerts to active desktop users.</p>

              <form onSubmit={sendBroadcast} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Notification Title</label>
                  <input 
                    required 
                    name="title" 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" 
                    placeholder="e.g., New Steam Fix Available!" 
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 block mb-1 font-medium">Message Body</label>
                  <textarea 
                    required 
                    name="body" 
                    rows={3} 
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500" 
                    placeholder="Enter the full announcement text..." 
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Alert Level</label>
                    <select 
                      name="level" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="info">â„¹ï¸ Info (Blue)</option>
                      <option value="warning">âš ï¸ Warning (Amber)</option>
                      <option value="danger">ðŸš¨ Critical (Red)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Active Duration</label>
                    <select 
                      name="duration" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="6">6 Hours</option>
                      <option value="24">24 Hours</option>
                      <option value="72">3 Days</option>
                      <option value="168">7 Days</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-slate-300 block mb-1 font-medium">Target Token (Optional)</label>
                    <input 
                      name="target" 
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-mono" 
                      placeholder="Leave empty for ALL" 
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={busy} 
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                  >
                    <Send className="h-4 w-4" /> {busy ? "Broadcasting..." : "Publish Broadcast"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>

        {/* Active Notifications List */}
        <div className="mt-8">
          <h2 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-400" /> Active Announcements & History ({notifs.length})
          </h2>

          <div className="space-y-3">
            {notifs.length === 0 && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 text-center text-slate-500 text-sm">
                No notifications broadcasted yet.
              </div>
            )}

            {notifs.map((n) => (
              <div key={n.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {n.level === "danger" ? <AlertTriangle className="h-4 w-4 text-rose-400" /> : n.level === "warning" ? <AlertTriangle className="h-4 w-4 text-amber-400" /> : <Info className="h-4 w-4 text-cyan-400" />}
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      <span>{n.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase font-mono">{n.level}</span>
                      {n.target_token && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 font-mono">Target: {n.target_token.slice(0, 12)}...</span>}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{n.body}</p>
                    <div className="text-[10px] text-slate-500 mt-2 font-mono">
                      Sent: {new Date(n.created_at).toLocaleString()} â€¢ Expires: {new Date(n.expires_at).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => deleteNotif(n.id)} 
                  className="p-2 rounded-lg bg-slate-800/60 hover:bg-rose-950 hover:text-rose-400 text-slate-500 transition"
                  title="Delete announcement"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}



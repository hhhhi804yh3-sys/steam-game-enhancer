import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/Logo3D";
import { isMasterAdminLoggedIn, logoutAdmin } from "@/lib/admin-auth";
import { 
  Activity, ArrowLeft, LogOut, RefreshCw, Globe, Monitor, Cpu, 
  Gamepad2, Bell, ShieldAlert, CheckCircle2, Clock, Search, Send
} from "lucide-react";

export const Route = createFileRoute("/admin/telemetry")({
  head: () => ({ meta: [{ title: "Live Telemetry & Users — CyaswTools" }] }),
  component: TelemetryPage,
});

type Row = {
  id: string; session_token: string; ip: string | null; country: string | null; city: string | null;
  os: string | null; os_version: string | null; arch: string | null; hostname: string | null;
  username: string | null; app_version: string | null; steam_id: string | null; cpu: string | null;
  gpu: string | null; ram_mb: number | null; locale: string | null; timezone: string | null;
  last_seen: string; first_seen: string; 
  installed_games: Array<{ id?: string | number; name?: string; appid?: string | number }> | Record<string, unknown> | null;
  extra: Record<string, unknown> | null;
};

function getStoredTelemetry(): Row[] {
  try {
    const raw = localStorage.getItem("cyasw_cached_telemetry");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredTelemetry(rows: Row[]) {
  try {
    localStorage.setItem("cyasw_cached_telemetry", JSON.stringify(rows));
  } catch {}
}

function TelemetryPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filterOnline, setFilterOnline] = useState<"all" | "online" | "offline">("all");
  const [targetMsgModal, setTargetMsgModal] = useState<string | null>(null);
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgSending, setMsgSending] = useState(false);

  const refresh = useCallback(async () => {
    let loaded: Row[] = [];
    try {
      const { data, error } = await supabase
        .from("device_telemetry")
        .select("*")
        .order("last_seen", { ascending: false })
        .limit(300);

      if (!error && data && data.length > 0) {
        loaded = data as Row[];
        saveStoredTelemetry(loaded);
      } else {
        loaded = getStoredTelemetry();
      }
    } catch {
      loaded = getStoredTelemetry();
    }
    setRows(loaded);
  }, []);

  useEffect(() => {
    if (!isMasterAdminLoggedIn()) {
      navigate({ to: "/admin/login" });
      return;
    }
    setIsAdmin(true);
    refresh();
  }, [navigate, refresh]);

  function handleLogout() {
    logoutAdmin();
    navigate({ to: "/admin/login" });
  }

  const now = Date.now();
  const onlineThresholdMs = 15 * 60 * 1000; // 15 mins
  
  const stats = useMemo(() => {
    let onlineCount = 0;
    const countries = new Set<string>();
    let totalGamesCount = 0;

    for (const r of rows) {
      const isOnline = (now - new Date(r.last_seen).getTime()) < onlineThresholdMs;
      if (isOnline) onlineCount++;
      if (r.country) countries.add(r.country);
      if (Array.isArray(r.installed_games)) {
        totalGamesCount += r.installed_games.length;
      }
    }
    return {
      total: rows.length,
      online: onlineCount,
      countriesCount: countries.size,
      totalGames: totalGamesCount
    };
  }, [rows, now]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      const isOnline = (now - new Date(r.last_seen).getTime()) < onlineThresholdMs;
      if (filterOnline === "online" && !isOnline) return false;
      if (filterOnline === "offline" && isOnline) return false;
      if (!q) return true;
      const term = q.toLowerCase();
      return (
        (r.ip && r.ip.toLowerCase().includes(term)) ||
        (r.hostname && r.hostname.toLowerCase().includes(term)) ||
        (r.username && r.username.toLowerCase().includes(term)) ||
        (r.country && r.country.toLowerCase().includes(term)) ||
        (r.os && r.os.toLowerCase().includes(term)) ||
        (r.session_token && r.session_token.toLowerCase().includes(term)) ||
        (r.app_version && r.app_version.toLowerCase().includes(term))
      );
    });
  }, [rows, q, filterOnline, now]);

  async function sendTargetedMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!targetMsgModal || !msgTitle || !msgBody) return;
    setMsgSending(true);
    try {
      await supabase.from("app_notifications").insert({
        title: msgTitle,
        body: msgBody,
        level: "warning",
        target_token: targetMsgModal,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      });
      alert("Notification sent successfully to device!");
      setTargetMsgModal(null);
      setMsgTitle("");
      setMsgBody("");
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to send");
    } finally {
      setMsgSending(false);
    }
  }

  if (isAdmin === null) return <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans">
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-tight">Cyasw<span className="text-cyan-400">Tools</span> <span className="text-xs text-slate-500 font-mono">/ Live</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1.5 transition">
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
            <Activity className="h-7 w-7 text-cyan-400" />
            Live Telemetry & User Devices
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time surveillance, geo-location, hardware specs, and user games.</p>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Monitor className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Registered Devices</div>
              <div className="text-2xl font-bold text-slate-100">{stats.total}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Online (Last 15m)</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.online}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Countries Tracked</div>
              <div className="text-2xl font-bold text-violet-400">{stats.countriesCount}</div>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Total Installed Games</div>
              <div className="text-2xl font-bold text-amber-400">{stats.totalGames}</div>
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              className="w-full bg-slate-950/70 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition" 
              placeholder="Search by IP, OS, hostname, user, token, country…" 
              value={q} 
              onChange={(e) => setQ(e.target.value)} 
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <button 
              onClick={() => setFilterOnline("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterOnline === "all" ? "bg-cyan-500 text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"}`}
            >
              All ({rows.length})
            </button>
            <button 
              onClick={() => setFilterOnline("online")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${filterOnline === "online" ? "bg-emerald-500 text-slate-950" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"}`}
            >
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Online ({stats.online})
            </button>
            <button 
              onClick={() => setFilterOnline("offline")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterOnline === "offline" ? "bg-slate-700 text-slate-200" : "bg-slate-800/60 text-slate-400 hover:bg-slate-800"}`}
            >
              Offline ({rows.length - stats.online})
            </button>
          </div>
        </div>

        {/* Device Rows List */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              No active devices logged yet. Connect your desktop application to view live logs.
            </div>
          )}

          {filtered.map((r) => {
            const isOnline = (now - new Date(r.last_seen).getTime()) < onlineThresholdMs;
            const gamesList = Array.isArray(r.installed_games) ? r.installed_games : [];

            return (
              <div key={r.id} className="bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-2xl transition overflow-hidden">
                <div 
                  onClick={() => setOpen(open === r.id ? null : r.id)}
                  className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`h-3 w-3 rounded-full shrink-0 ${isOnline ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" : "bg-slate-600"}`} />
                    <div className="min-w-0">
                      <div className="font-semibold text-sm text-slate-200 flex items-center gap-2 truncate">
                        <span>{r.username || r.hostname || "Device User"}</span>
                        {r.country && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-mono">
                            🌍 {r.country} {r.city ? `• ${r.city}` : ""}
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          v{r.app_version || "5.0.6"}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                        Token: <span className="text-slate-300">{r.session_token.slice(0, 16)}...</span> • IP: <span className="text-slate-300">{r.ip || "—"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-xs text-slate-400 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="h-4 w-4 text-slate-500" />
                      <span>{r.os || "Windows"} {r.arch || "x64"} {r.ram_mb ? `(${Math.round(r.ram_mb/1024)}GB)` : ""}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Gamepad2 className="h-4 w-4 text-amber-400" />
                      <span>{gamesList.length} Games</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono text-slate-400">
                      <Clock className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(r.last_seen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {open === r.id && (
                  <div className="border-t border-slate-800/80 bg-slate-950/70 p-5 space-y-5 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Monitor className="h-3.5 w-3.5 text-cyan-400" /> System Specs
                        </div>
                        <div><span className="text-slate-500">CPU:</span> {r.cpu || "—"}</div>
                        <div><span className="text-slate-500">GPU:</span> {r.gpu || "—"}</div>
                        <div><span className="text-slate-500">RAM:</span> {r.ram_mb ? `${r.ram_mb} MB` : "—"}</div>
                        <div><span className="text-slate-500">Resolution:</span> {r.screen || "—"}</div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Globe className="h-3.5 w-3.5 text-violet-400" /> Geo & Network
                        </div>
                        <div><span className="text-slate-500">IP Address:</span> {r.ip || "—"}</div>
                        <div><span className="text-slate-500">Country:</span> {r.country || "—"}</div>
                        <div><span className="text-slate-500">City:</span> {r.city || "—"}</div>
                        <div><span className="text-slate-500">Timezone:</span> {r.timezone || "—"} ({r.locale || "—"})</div>
                      </div>

                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 space-y-1.5">
                        <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-emerald-400" /> Timeline & Token
                        </div>
                        <div><span className="text-slate-500">First Seen:</span> {new Date(r.first_seen).toLocaleString()}</div>
                        <div><span className="text-slate-500">Last Ping:</span> {new Date(r.last_seen).toLocaleString()}</div>
                        <div className="truncate"><span className="text-slate-500">Full Token:</span> {r.session_token}</div>
                        <div><span className="text-slate-500">Steam ID:</span> {r.steam_id || "—"}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button 
                        onClick={() => setTargetMsgModal(r.session_token)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-medium inline-flex items-center gap-1.5 transition"
                      >
                        <Bell className="h-3.5 w-3.5" /> Send In-App Message
                      </button>
                      <button 
                        onClick={() => navigator.clipboard.writeText(r.session_token)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                      >
                        Copy Token
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}

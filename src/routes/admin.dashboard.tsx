import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

import { LogoMark } from "@/components/Logo3D";
import { 
  Upload, LogOut, Trash2, Star, StarOff, Link as LinkIcon, KeyRound, 
  Bell, Activity, BookOpen, PlayCircle, ShieldAlert, Monitor, Gamepad2, 
  Layers, Download, RefreshCw 
} from "lucide-react";

import { isMasterAdminLoggedIn, logoutAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Central Hub — CyaswTools" }] }),
  component: Dashboard,
});

type Version = { id: string; version: string; description: string; changelog: string; file_path: string; is_latest: boolean; created_at: string; file_size?: number; };

function Dashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  const [counts, setCounts] = useState({ devices: 0, codes: 0, notifications: 0 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [links, setLinks] = useState({ youtube_url: "", telegram_url: "" });
  const [linksMsg, setLinksMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [codesRes, telemRes] = await Promise.all([
        fetch("/api/public/codes").then(r => r.json()).catch(() => null),
        fetch("/api/public/telemetry").then(r => r.json()).catch(() => null)
      ]);

      const storedCodes = localStorage.getItem("cyasw_cached_codes");
      const storedDevs = localStorage.getItem("cyasw_cached_telemetry");
      const storedNotifs = localStorage.getItem("cyasw_cached_notifs");

      const devCount = telemRes?.data?.length ?? (storedDevs ? JSON.parse(storedDevs).length : 0);
      const codeCount = codesRes?.data?.length ?? (storedCodes ? JSON.parse(storedCodes).length : 0);
      const notifCount = storedNotifs ? JSON.parse(storedNotifs).length : 0;

      setCounts({
        devices: devCount,
        codes: codeCount,
        notifications: notifCount
      });
    } catch {
      const storedCodes = localStorage.getItem("cyasw_cached_codes");
      const storedDevs = localStorage.getItem("cyasw_cached_telemetry");
      setCounts({
        devices: storedDevs ? JSON.parse(storedDevs).length : 0,
        codes: storedCodes ? JSON.parse(storedCodes).length : 0,
        notifications: 0
      });
    }

    const res = await fetch("/api/public/tutorials").then((r) => r.json()).catch(() => null);
    if (res?.ok && res.data) {
      setLinks({ 
        youtube_url: res.data.youtube_url ?? "", 
        telegram_url: res.data.telegram_url ?? "" 
      });
    }
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

  async function uploadVersion(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setBusy(true); setMsg(null);
      try {
        const fd = new FormData(e.currentTarget);
        const version = String(fd.get("version") || "").trim();
        const description = String(fd.get("description") || "").trim();
        const link = String(fd.get("link") || "").trim();
        if (!version || !link) throw new Error("Version and Link are required");
        
        const newV = {
          id: crypto.randomUUID(),
          version, description, changelog: null,
          file_path: link, is_latest: true, created_at: new Date().toISOString()
        };
        
        await fetch('/api/public/versions', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ version: newV })
        });
        
        setMsg(Published v successfully!);
        (e.target as HTMLFormElement).reset();
        fetchVersions();
      } catch (e: unknown) {
        setMsg(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setBusy(false);
      }
    }

  async function setLatest(id: string) {
      const v = versions.find(x => x.id === id);
      if(v) {
        v.is_latest = true;
        await fetch('/api/public/versions', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ version: v }) });
        fetchVersions();
      }
    }

  async function unsetLatest(id: string) {
      const v = versions.find(x => x.id === id);
      if(v) {
        v.is_latest = false;
        await fetch('/api/public/versions', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ version: v }) });
        fetchVersions();
      }
    }

  async function removeVersion(v: Version) {
      if (!confirm(Delete v?)) return;
      await fetch(/api/public/versions?id=, { method: 'DELETE' });
      fetchVersions();
    }

  async function saveLinks(e: React.FormEvent) {
    e.preventDefault();
    setLinksMsg(null);
    try {
      const { error } = await supabase.from("app_tutorials").upsert({
        id: "default",
        youtube_url: links.youtube_url || null,
        telegram_url: links.telegram_url || null,
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      setLinksMsg("Links saved successfully ✓");
      setTimeout(() => setLinksMsg(null), 2500);
    } catch (e: unknown) {
      setLinksMsg(e instanceof Error ? e.message : "Failed to save links");
    }
  }

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return <div className="min-h-screen flex items-center justify-center">Not authorized</div>;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-tight">Cysaw <span className="text-cyan-400">Central Hub</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/70 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1.5 transition">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:bg-rose-900/50 inline-flex items-center gap-1.5 transition">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 space-y-8">
        {/* Navigation Quick Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/admin/telemetry" className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-5 transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition">
                <Activity className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold font-mono text-cyan-400">{counts.devices}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-cyan-400 transition">Live Telemetry & Geo</div>
              <div className="text-xs text-slate-400 mt-0.5">Monitor online devices, country, OS & games</div>
            </div>
          </Link>

          <Link to="/admin/codes" className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-violet-500/50 rounded-2xl p-5 transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
                <KeyRound className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold font-mono text-violet-400">{counts.codes}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-violet-400 transition">Premium Keys Generator</div>
              <div className="text-xs text-slate-400 mt-0.5">Generate, manage, and revoke 32-char keys</div>
            </div>
          </Link>

          <Link to="/admin/notify" className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-amber-500/50 rounded-2xl p-5 transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
                <Bell className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold font-mono text-amber-400">{counts.notifications}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-amber-400 transition">In-App Broadcast & Push</div>
              <div className="text-xs text-slate-400 mt-0.5">Push notifications to all or target users</div>
            </div>
          </Link>

          <Link to="/admin/notify" className="group bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-rose-500/50 rounded-2xl p-5 transition flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-mono">REMOTE</span>
            </div>
            <div>
              <div className="font-bold text-sm text-slate-100 group-hover:text-rose-400 transition">Kill Switch & Safety</div>
              <div className="text-xs text-slate-400 mt-0.5">Freeze app, maintenance, min version control</div>
            </div>
          </Link>
        </div>

        {/* Content Split: Builds / Upload & Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Versions and Builds Management */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                <Layers className="h-5 w-5 text-cyan-400" /> Releases & Application Builds ({versions.length})
              </h2>

              <div className="space-y-3">
                {versions.length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-xs">No build releases uploaded yet.</div>
                )}

                {versions.map((v) => (
                  <div key={v.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 font-mono">v{v.version}</span>
                        {v.is_latest && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{v.description || "No description provided"}</p>
                      <div className="text-[10px] text-slate-500 mt-1 font-mono">
                        {v.file_size ? `${(v.file_size / (1024 * 1024)).toFixed(1)} MB` : "—"} • {new Date(v.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.is_latest ? (
                        <button onClick={() => unsetLatest(v.id)} className="p-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs transition" title="Unset latest">
                          <Star className="h-4 w-4 fill-amber-400" />
                        </button>
                      ) : (
                        <button onClick={() => setLatest(v.id)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-amber-400 text-xs transition" title="Make latest">
                          <StarOff className="h-4 w-4" />
                        </button>
                      )}
                      <button onClick={() => removeVersion(v)} className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 text-xs transition">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Upload New Build & Social Links */}
          <div className="space-y-6">
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                <Upload className="h-5 w-5 text-cyan-400" /> Upload New Build
              </h2>

              {msg && <div className="mb-4 text-xs font-semibold px-3 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">{msg}</div>}

              <form onSubmit={uploadVersion} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Version Number</label>
                  <input required name="version" placeholder="e.g., 5.0.7" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500 font-mono" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Description</label>
                  <input name="description" placeholder="Short description" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">Download Link (e.g. Mediafire/Mega)</label>
                    <input required type="url" name="link" placeholder="https://..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500" />
                </div>
                <button type="submit" disabled={busy} className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition">
                  {busy ? "Uploading Build..." : "Publish Release"}
                </button>
              </form>
            </section>

            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
                <LinkIcon className="h-5 w-5 text-violet-400" /> Community & Tutorials
              </h2>

              {linksMsg && <div className="mb-4 text-xs font-semibold px-3 py-2 rounded-lg bg-violet-950/80 border border-violet-500/40 text-violet-300">{linksMsg}</div>}

              <form onSubmit={saveLinks} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium flex items-center gap-1.5"><PlayCircle className="h-3.5 w-3.5 text-rose-400" /> YouTube Tutorial</label>
                  <input value={links.youtube_url} onChange={(e) => setLinks({ ...links, youtube_url: e.target.value })} placeholder="https://youtube.com/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5 text-sky-400" /> Telegram Channel</label>
                  <input value={links.telegram_url} onChange={(e) => setLinks({ ...links, telegram_url: e.target.value })} placeholder="https://t.me/..." className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-violet-500" />
                </div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition">
                  Save Links
                </button>
              </form>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

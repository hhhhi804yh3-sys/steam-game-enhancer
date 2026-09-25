import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";

import { 
  Upload, LogOut, Trash2, Star, StarOff, Link as LinkIcon, KeyRound, 
  Bell, Activity, BookOpen, PlayCircle, ShieldAlert, Monitor, Gamepad2, 
  Layers, Download, RefreshCw 
} from "lucide-react";

import { isSwitchAdminLoggedIn, logoutSwitchAdmin } from "@/lib/admin-auth";

export const Route = createFileRoute("/switch-admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Central Hub â€” SteamSwitch" }] }),
  component: Dashboard,
});

type Version = { id: string; version: string; description: string; changelog: string; file_path: string; is_latest: boolean; created_at: string; file_size?: number; };

function Dashboard() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [versions, setVersions] = useState<Version[]>([]);
  async function fetchVersions() {
    try {
      const res = await fetch('/api/public/versions').then(r => r.json());
      if (res && res.ok) {
        setVersions(res.versions || []);
        if (res.links) setLinks(res.links);
      }
    } catch {}
  }
  const [counts, setCounts] = useState({ devices: 0, codes: 0, notifications: 0 });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [links, setLinks] = useState({ youtube_url: "", telegram_url: "" });
  const [linksMsg, setLinksMsg] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [codesRes, telemRes] = await Promise.all([
        fetch("/api/public/switch/codes").then(r => r.json()).catch(() => null),
        fetch("/api/public/switch/telemetry").then(r => r.json()).catch(() => null)
      ]);

      const storedCodes = localStorage.getItem("SteamSwitch_cached_codes");
      const storedDevs = localStorage.getItem("SteamSwitch_cached_telemetry");
      const storedNotifs = localStorage.getItem("SteamSwitch_cached_notifs");

      const devCount = telemRes?.data?.length ?? (storedDevs ? JSON.parse(storedDevs).length : 0);
      const codeCount = codesRes?.data?.length ?? (storedCodes ? JSON.parse(storedCodes).length : 0);
      const notifCount = storedNotifs ? JSON.parse(storedNotifs).length : 0;

      setCounts({
        devices: devCount,
        codes: codeCount,
        notifications: notifCount
      });
    } catch {
      const storedCodes = localStorage.getItem("SteamSwitch_cached_codes");
      const storedDevs = localStorage.getItem("SteamSwitch_cached_telemetry");
      setCounts({
        devices: storedDevs ? JSON.parse(storedDevs).length : 0,
        codes: storedCodes ? JSON.parse(storedCodes).length : 0,
        notifications: 0
      });
    }

    const res = await fetch("/api/public/switch/tutorials").then((r) => r.json()).catch(() => null);
    if (res?.ok && res.data) {
      setLinks({ 
        youtube_url: res.data.youtube_url ?? "", 
        telegram_url: res.data.telegram_url ?? "" 
      });
    }
  }, []);

  useEffect(() => {
    if (!isSwitchAdminLoggedIn()) {
      navigate({ to: "/switch-admin/login" });
      return;
    }
    setIsAdmin(true);
    refresh(); fetchVersions();
  }, [navigate, refresh]);

  function handleLogout() {
    logoutSwitchAdmin();
    navigate({ to: "/switch-admin/login" });
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
        
        setMsg("Published successfully!");
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
          if (!confirm(`Delete v${v.version}?`)) return;
    await fetch(`/api/public/switch/versions?id=${v.id}`, { method: 'DELETE' });
    fetchVersions();
  }

    async function saveLinks(e: React.FormEvent) {
    e.preventDefault();
    setLinksMsg(null);
    try {
      await fetch('/api/public/versions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ links })
      });
      setLinksMsg("Links saved successfully!");
      setTimeout(() => setLinksMsg(null), 2500);
    } catch (e: unknown) {
      setLinksMsg(e instanceof Error ? e.message : "Failed to save links");
    }
  }

  if (isAdmin === null) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loadingâ€¦</div>;
  if (!isAdmin) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Not authorized</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/switch-admin/dashboard" className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight text-gray-900">Steam<span className="text-[#e60012]">Switch</span> Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={refresh} className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1.5 transition">
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            <button onClick={handleLogout} className="px-4 py-2 rounded-full text-xs font-bold bg-red-50 hover:bg-red-100 text-[#e60012] inline-flex items-center gap-1.5 transition">
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/switch-admin/telemetry" className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#e60012] rounded-3xl p-5 transition flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
                <Activity className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold font-mono text-gray-900">{counts.devices}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#e60012] transition">Live Telemetry</div>
              <div className="text-xs text-gray-500 mt-1">Monitor online devices & games</div>
            </div>
          </Link>

          <Link to="/switch-admin/codes" className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#e60012] rounded-3xl p-5 transition flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-[#e60012] group-hover:scale-110 transition">
                <KeyRound className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold font-mono text-gray-900">{counts.codes}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#e60012] transition">Keys Generator</div>
              <div className="text-xs text-gray-500 mt-1">Generate 32-char keys</div>
            </div>
          </Link>

          <Link to="/switch-admin/notify" className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#e60012] rounded-3xl p-5 transition flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition">
                <Bell className="h-6 w-6" />
              </div>
              <span className="text-2xl font-bold font-mono text-gray-900">{counts.notifications}</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#e60012] transition">Push Notifications</div>
              <div className="text-xs text-gray-500 mt-1">Push alerts to users</div>
            </div>
          </Link>

          <Link to="/switch-admin/notify" className="group bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#e60012] rounded-3xl p-5 transition flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 group-hover:scale-110 transition">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-mono">REMOTE</span>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-900 group-hover:text-[#e60012] transition">Kill Switch</div>
              <div className="text-xs text-gray-500 mt-1">Freeze app, maintenance</div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Layers className="h-6 w-6 text-[#e60012]" /> Releases & Application Builds ({versions.length})
              </h2>

              <div className="space-y-4">
                {versions.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-2xl border border-gray-100">No build releases uploaded yet.</div>
                )}

                {versions.map((v) => (
                  <div key={v.id} className="bg-white border border-gray-200 hover:border-gray-300 rounded-2xl p-5 flex items-center justify-between gap-4 transition shadow-sm">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-bold text-base text-gray-900 font-mono">v{v.version}</span>
                        {v.is_latest && (
                          <span className="px-3 py-1 rounded-full bg-red-50 text-[#e60012] text-xs font-bold border border-red-100">
                            LATEST
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{v.description || "No description provided"}</p>
                      <div className="text-xs text-gray-400 mt-2 font-mono">
                        {v.file_size ? `${(v.file_size / (1024 * 1024)).toFixed(1)} MB` : "â€”"} â€¢ {new Date(v.created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {v.is_latest ? (
                        <button onClick={() => unsetLatest(v.id)} className="p-2.5 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100 transition" title="Unset latest">
                          <Star className="h-5 w-5 fill-amber-500" />
                        </button>
                      ) : (
                        <button onClick={() => setLatest(v.id)} className="p-2.5 rounded-full bg-gray-50 text-gray-400 hover:text-amber-500 hover:bg-gray-100 transition" title="Make latest">
                          <StarOff className="h-5 w-5" />
                        </button>
                      )}
                      <button onClick={() => removeVersion(v)} className="p-2.5 rounded-full bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-[#e60012] transition">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Upload className="h-6 w-6 text-[#e60012]" /> Upload New Build
              </h2>

              {msg && <div className="mb-4 text-sm font-bold px-4 py-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{msg}</div>}

              <form onSubmit={uploadVersion} className="space-y-4 text-sm">
                <div>
                  <label className="text-gray-900 block mb-1.5 font-bold">Version Number</label>
                  <input required name="version" placeholder="e.g., 5.0.7" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] font-mono transition" />
                </div>
                <div>
                  <label className="text-gray-900 block mb-1.5 font-bold">Description</label>
                  <input name="description" placeholder="Short description" className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition" />
                </div>
                <div>
                  <label className="text-gray-900 block mb-1.5 font-bold">Download Link</label>
                    <input required type="url" name="link" placeholder="https://..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition" />
                </div>
                <button type="submit" disabled={busy} className="w-full py-3.5 rounded-full bg-[#e60012] hover:bg-red-700 text-white font-bold transition mt-2 shadow-md">
                  {busy ? "Uploading Build..." : "Publish Release"}
                </button>
              </form>
            </section>

            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <LinkIcon className="h-6 w-6 text-[#e60012]" /> Community Links
              </h2>

              {linksMsg && <div className="mb-4 text-sm font-bold px-4 py-3 rounded-xl bg-green-50 text-green-700 border border-green-200">{linksMsg}</div>}

              <form onSubmit={saveLinks} className="space-y-4 text-sm">
                <div>
                  <label className="text-gray-900 block mb-1.5 font-bold flex items-center gap-2"><PlayCircle className="h-4 w-4 text-[#e60012]" /> YouTube Tutorial</label>
                  <input value={links.youtube_url} onChange={(e) => setLinks({ ...links, youtube_url: e.target.value })} placeholder="https://youtube.com/..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition" />
                </div>
                <div>
                  <label className="text-gray-900 block mb-1.5 font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-blue-500" /> Telegram Channel</label>
                  <input value={links.telegram_url} onChange={(e) => setLinks({ ...links, telegram_url: e.target.value })} placeholder="https://t.me/..." className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition" />
                </div>
                <button type="submit" className="w-full py-3.5 rounded-full bg-gray-900 hover:bg-black text-white font-bold transition mt-2 shadow-md">
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



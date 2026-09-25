import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { isSwitchAdminLoggedIn, logoutSwitchAdmin } from "@/lib/admin-auth";
import { 
  KeyRound, ArrowLeft, LogOut, Copy, Check, Trash2, RefreshCw, 
  Plus, Search, Sparkles, CheckCircle2, ShieldCheck, Clock
} from "lucide-react";

export const Route = createFileRoute("/switch-admin/codes")({
  head: () => ({ meta: [{ title: "Premium Codes Generator â€” SteamSwitch" }] }),
  component: CodesPage,
});

const PRESETS = [
  { label: "Lifetime Access (50 Years)", days: 365 * 50 },
];

function genCode() {
  const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => A[x % A.length]).join("");
}

type Row = { 
  id: string; 
  code: string; 
  duration_days: number; 
  label: string | null; 
  created_at: string; 
  used_at: string | null; 
  used_by_token: string | null 
};

export function getStoredCodes(): Row[] {
  try {
    const raw = localStorage.getItem("SteamSwitch_cached_codes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCodes(rows: Row[]) {
  try {
    localStorage.setItem("SteamSwitch_cached_codes", JSON.stringify(rows));
  } catch {}
}

function CodesPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(1);
  const [days, setDays] = useState(365 * 50);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const refresh = useCallback(async () => {
    let localRows = getStoredCodes();
    try {
      const res = await fetch("/api/public/switch/codes").then(r => r.json()).catch(() => null);
      if (res && res.ok && Array.isArray(res.data) && res.data.length > 0) {
        const map = new Map<string, Row>();
        localRows.forEach(r => map.set(r.code, r));
        res.data.forEach((r: Row) => map.set(r.code, { ...map.get(r.code), ...r }));
        const merged = Array.from(map.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        saveStoredCodes(merged);
        setRows(merged);
        return;
      }
    } catch {}
    setRows(localRows);
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

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    try {
      const newRows: Row[] = Array.from({ length: Math.max(1, Math.min(100, count)) }, () => ({
        id: crypto.randomUUID(),
        code: genCode(),
        duration_days: Number(days),
        label: label.trim() || null,
        created_at: new Date().toISOString(),
        used_at: null,
        used_by_token: null,
      }));

      fetch("/api/public/switch/codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRows),
      }).catch(() => null);

      const current = getStoredCodes();
      const updated = [...newRows, ...current];
      saveStoredCodes(updated);
      setRows(updated);

      setLabel("");
      setCount(1);
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to generate");
    } finally {
      setBusy(false);
    }
  }

  async function removeCode(id: string) {
    if (!confirm("Are you sure you want to delete this activation code?")) return;
    fetch(`/api/public/switch/codes?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);

    const current = getStoredCodes();
    const updated = current.filter((r) => r.id !== id && r.code !== id);
    saveStoredCodes(updated);
    setRows(updated);
  }

  async function copy(c: string) {
    await navigator.clipboard.writeText(c);
    setCopied(c);
    setTimeout(() => setCopied(null), 1500);
  }

  const filtered = useMemo(() => {
    if (!q) return rows;
    const term = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.code.toLowerCase().includes(term) ||
        (r.label && r.label.toLowerCase().includes(term)) ||
        (r.used_by_token && r.used_by_token.toLowerCase().includes(term))
    );
  }, [rows, q]);

  if (isAdmin === null) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Loadingâ€¦</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40 shadow-sm">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/switch-admin/dashboard" className="flex items-center gap-3">
            <span className="font-bold text-lg tracking-tight text-gray-900">Steam<span className="text-[#e60012]">Switch</span> <span className="text-xs text-gray-500 font-mono">/ Keys</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/switch-admin/dashboard" className="px-4 py-2 rounded-full text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center gap-1.5 transition">
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
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
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3 text-gray-900">
            <KeyRound className="h-7 w-7 text-[#e60012]" />
            Premium Codes & Key Generator
          </h1>
          <p className="text-sm text-gray-500 mt-1">Generate 32-character activation codes for VIP access.</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-[#e60012]" /> Generate New Activation Keys
          </h2>

          <form onSubmit={generate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-700 block mb-1 font-bold">Duration Preset</label>
                <div className="flex gap-2">
                  <select 
                    value={days} 
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] font-medium"
                  >
                    {PRESETS.map((p) => (
                      <option key={p.days} value={p.days}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-700 block mb-1 font-bold">Number of Keys</label>
                <input 
                  type="number" 
                  min={1} 
                  max={100} 
                  value={count} 
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] font-mono" 
                />
              </div>

              <div>
                <label className="text-xs text-gray-700 block mb-1 font-bold">Note / Buyer Label (Optional)</label>
                <input 
                  placeholder="e.g. VIP Customer @TelegramUser" 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={busy} 
                className="px-6 py-3 rounded-full bg-[#e60012] hover:bg-red-700 text-white text-sm font-bold transition flex items-center gap-2 active:scale-95 shadow-md"
              >
                <Plus className="h-4 w-4" /> {busy ? "Generating..." : `Generate ${count} Key(s)`}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-gray-500" /> Active Keys List ({filtered.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="h-4 w-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                placeholder="Search by code or label..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]" 
              />
            </div>
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-sm">
                No keys found. Generate some keys above!
              </div>
            )}

            {filtered.map((r) => {
              const isUsed = !!r.used_at;
              return (
                <div key={r.id} className="bg-white hover:bg-gray-50 border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${isUsed ? "bg-gray-100 text-gray-500" : "bg-red-50 text-[#e60012]"}`}>
                      <KeyRound className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-gray-900 tracking-wider select-all">{r.code}</span>
                        {r.duration_days >= 365 * 10 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-[#e60012] font-bold font-mono">LIFETIME</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-mono">{r.duration_days} Days</span>
                        )}
                        {isUsed ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500 font-bold">REDEEMED</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-bold">ACTIVE</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                        {r.label && <span className="text-gray-900 font-bold">ðŸ·ï¸ {r.label}</span>}
                        <span>Created: {new Date(r.created_at).toLocaleDateString()}</span>
                        {r.used_at && <span>Redeemed: {new Date(r.used_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => copy(r.code)} 
                      className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold flex items-center gap-1.5 transition"
                    >
                      {copied === r.code ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      {copied === r.code ? "Copied!" : "Copy"}
                    </button>
                    <button 
                      onClick={() => removeCode(r.id)} 
                      className="p-2 rounded-full bg-gray-100 hover:bg-red-100 hover:text-[#e60012] text-gray-500 transition"
                      title="Delete Key"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}



import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/Logo3D";
import { isMasterAdminLoggedIn, logoutAdmin } from "@/lib/admin-auth";
import { 
  KeyRound, ArrowLeft, LogOut, Copy, Check, Trash2, RefreshCw, 
  Plus, Search, Sparkles, CheckCircle2, ShieldCheck, Clock
} from "lucide-react";

export const Route = createFileRoute("/admin/codes")({
  head: () => ({ meta: [{ title: "Premium Codes Generator — CyaswTools" }] }),
  component: CodesPage,
});

const PRESETS = [
  { label: "1 Month (30 Days)", days: 30 },
  { label: "3 Months (90 Days)", days: 90 },
  { label: "6 Months (180 Days)", days: 180 },
  { label: "1 Year (365 Days)", days: 365 },
  { label: "Lifetime (50 Years)", days: 365 * 50 },
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
    const raw = localStorage.getItem("cyasw_cached_codes");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCodes(rows: Row[]) {
  try {
    localStorage.setItem("cyasw_cached_codes", JSON.stringify(rows));
  } catch {}
}

function CodesPage() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [count, setCount] = useState(1);
  const [days, setDays] = useState(30);
  const [label, setLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const refresh = useCallback(async () => {
    let loaded: Row[] = [];
    try {
      const { data, error } = await supabase
        .from("premium_codes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);

      if (!error && data && data.length > 0) {
        loaded = data as Row[];
        saveStoredCodes(loaded);
      } else {
        loaded = getStoredCodes();
      }
    } catch {
      loaded = getStoredCodes();
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

      // Try saving to Supabase
      try {
        await supabase.from("premium_codes").insert(
          newRows.map((r) => ({
            code: r.code,
            duration_days: r.duration_days,
            label: r.label,
          }))
        );
      } catch (err) {
        console.warn("[Codes] Saved to local master storage:", err);
      }

      // Update local storage and state immediately
      const updated = [...newRows, ...rows];
      setRows(updated);
      saveStoredCodes(updated);

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
    try {
      await supabase.from("premium_codes").delete().eq("id", id);
    } catch {}

    const updated = rows.filter((r) => r.id !== id);
    setRows(updated);
    saveStoredCodes(updated);
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

  if (isAdmin === null) return <div className="min-h-screen bg-[#07090e] flex items-center justify-center text-slate-400">Loading…</div>;
  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans">
      {/* Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-5 py-3.5 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-bold text-lg tracking-tight">Cyasw<span className="text-cyan-400">Tools</span> <span className="text-xs text-slate-500 font-mono">/ Keys</span></span>
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

      <main className="mx-auto max-w-7xl px-5 py-8 space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
            <KeyRound className="h-7 w-7 text-violet-400" />
            Premium Codes & Key Generator
          </h1>
          <p className="text-sm text-slate-400 mt-1">Generate 32-character activation codes for unlimited or duration-based VIP access.</p>
        </div>

        {/* Generator Form Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-violet-400" /> Generate New Activation Keys
          </h2>

          <form onSubmit={generate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Duration Preset</label>
                <select 
                  value={days} 
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-medium"
                >
                  {PRESETS.map((p) => (
                    <option key={p.days} value={p.days}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Number of Keys</label>
                <input 
                  type="number" 
                  min={1} 
                  max={100} 
                  value={count} 
                  onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500 font-mono" 
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Note / Buyer Label (Optional)</label>
                <input 
                  placeholder="e.g. VIP Customer @TelegramUser" 
                  value={label} 
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-violet-500" 
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                type="submit" 
                disabled={busy} 
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-violet-600/30 active:scale-95"
              >
                <Plus className="h-4 w-4" /> {busy ? "Generating..." : `Generate ${count} Key(s)`}
              </button>
            </div>
          </form>
        </div>

        {/* Existing Keys Table */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-400" /> Active Keys List ({filtered.length})
            </h2>

            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                placeholder="Search by code or label..." 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500" 
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {filtered.length === 0 && (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
                No keys found. Generate some keys above!
              </div>
            )}

            {filtered.map((r) => {
              const isUsed = !!r.used_at;
              return (
                <div key={r.id} className="bg-slate-900/60 hover:bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isUsed ? "bg-slate-800 text-slate-500" : "bg-violet-500/10 text-violet-400"}`}>
                      <KeyRound className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-sm text-slate-100 tracking-wider select-all">{r.code}</span>
                        {r.duration_days >= 365 * 10 ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold font-mono">LIFETIME</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">{r.duration_days} Days</span>
                        )}
                        {isUsed ? (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-500/30 text-rose-300 font-bold">REDEEMED</span>
                        ) : (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-300 font-bold">ACTIVE</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        {r.label && <span className="text-violet-300 font-medium">🏷️ {r.label}</span>}
                        <span>Created: {new Date(r.created_at).toLocaleDateString()}</span>
                        {r.used_at && <span>Redeemed: {new Date(r.used_at).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button 
                      onClick={() => copy(r.code)} 
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      {copied === r.code ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied === r.code ? "Copied!" : "Copy"}
                    </button>
                    <button 
                      onClick={() => removeCode(r.id)} 
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950 hover:text-rose-400 text-slate-500 text-xs transition"
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

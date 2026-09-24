import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo3D } from "@/components/Logo3D";
import { loginAdmin, isMasterAdminLoggedIn } from "@/lib/admin-auth";
import { Lock, Mail, ShieldCheck, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — CyaswTools" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isMasterAdminLoggedIn()) {
      navigate({ to: "/admin/dashboard" });
    }
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); 
    setErr(null);

    try {
      const res = await loginAdmin(email, password);
      if (res.success) {
        navigate({ to: "/admin/dashboard" });
      } else {
        setErr(res.error || "Invalid Credentials");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Login error occurred");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center px-5 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <Link to="/" className="flex flex-col items-center justify-center mb-6 group">
          <Logo3D size={110} />
          <span className="font-bold text-xl tracking-tight mt-3 text-slate-200">
            Cyasw<span className="text-cyan-400">Tools</span> <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono ml-1">MASTER ROOT</span>
          </span>
        </Link>

        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-3xl p-8 shadow-2xl shadow-black/80 space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center justify-center gap-2">
              <ShieldCheck className="h-6 w-6 text-cyan-400" /> Admin Authentication
            </h1>
            <p className="text-xs text-slate-400">
              Enter your master administrative credentials to access the central hub.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> Admin Email
              </label>
              <input 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono" 
                type="text" 
                placeholder="admin@cyaswtools.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-slate-400" /> Master Password
              </label>
              <input 
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition font-mono" 
                type="password" 
                placeholder="••••••••••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {err && (
              <div className="text-xs font-semibold px-3.5 py-2.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-300 animate-shake">
                ⚠️ {err}
              </div>
            )}

            <button 
              type="submit"
              disabled={busy} 
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-[0.98]"
            >
              {busy ? "Verifying Credentials..." : (
                <>Sign in to Dashboard <ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

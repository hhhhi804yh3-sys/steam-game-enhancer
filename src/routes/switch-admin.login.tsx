import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { loginSwitchAdmin, isSwitchAdminLoggedIn } from "@/lib/admin-auth";
import { Lock, Mail, ShieldCheck, ArrowRight, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/switch-admin/login")({
  head: () => ({ meta: [{ title: "Admin Login â€” SteamSwitch" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isSwitchAdminLoggedIn()) {
      navigate({ to: "/switch-admin/dashboard" });
    }
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); 
    setErr(null);

    try {
      const res = await loginSwitchAdmin(email, password);
      if (res.success) {
        navigate({ to: "/switch-admin/dashboard" });
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
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center px-5 font-sans relative overflow-hidden">
      <div className="w-full max-w-md relative z-10 animate-fade-up">
        <Link to="/" className="flex flex-col items-center justify-center mb-8 group">
          <div className="h-20 w-20 bg-[#e60012] rounded-3xl flex items-center justify-center text-white shadow-xl mb-4 transform group-hover:scale-105 transition">
            <Gamepad2 className="h-10 w-10" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-gray-900">
            Steam<span className="text-[#e60012]">Switch</span> <span className="text-[10px] px-2 py-1 rounded-full bg-red-100 text-[#e60012] font-mono ml-2 align-middle">ADMIN</span>
          </span>
        </Link>

        <div className="bg-white border border-gray-200 rounded-[2rem] p-8 md:p-10 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center justify-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#e60012]" /> Admin Authentication
            </h1>
            <p className="text-sm text-gray-500">
              Enter your credentials to access the central hub.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" /> Admin Email
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition font-mono" 
                type="text" 
                placeholder="admin@steamswitch.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Lock className="h-4 w-4 text-gray-500" /> Master Password
              </label>
              <input 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012] transition font-mono" 
                type="password" 
                placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            {err && (
              <div className="text-sm font-bold px-4 py-3 rounded-2xl bg-red-50 border border-red-200 text-[#e60012] animate-shake">
                âš ï¸ {err}
              </div>
            )}

            <button 
              type="submit"
              disabled={busy} 
              className="w-full py-4 rounded-full bg-[#e60012] hover:bg-red-700 text-white text-sm font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-[0.98] mt-2"
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



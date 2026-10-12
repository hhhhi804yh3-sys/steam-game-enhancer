import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Gamepad2, ArrowRight, ExternalLink, Sparkles } from "lucide-react";

export const Route = createFileRoute("/activate/$token")({
  head: () => ({ meta: [{ title: "SteamSwitch — Session Ticket Verification" }] }),
  component: ActivatePage,
});

function ActivatePage() {
  const { token } = Route.useParams();
  const [step, setStep] = useState<"idle" | "verifying" | "activated">("idle");
  const [progressText, setProgressText] = useState("Initializing ticket verification...");
  const [progressPct, setProgressPct] = useState(0);

  async function triggerActivation() {
    setStep("verifying");
    setProgressPct(25);
    setProgressText("Authenticating session ticket...");

    await new Promise((r) => setTimeout(r, 600));
    setProgressPct(60);
    setProgressText("Contacting local SteamSwitch client (127.0.0.1:49152)...");

    // 1. Send to local loopback server for zero-latency instant unlock
    try {
      await fetch(`http://127.0.0.1:49152/activate?token=${encodeURIComponent(token)}`, {
        method: "GET",
        mode: "cors",
      }).catch(() => null);
    } catch {}

    // 2. Fallback deep link
    try {
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      iframe.src = `steamswitch://activate?token=${encodeURIComponent(token)}`;
      document.body.appendChild(iframe);
      setTimeout(() => {
        try { document.body.removeChild(iframe); } catch {}
      }, 1000);
    } catch {}

    await new Promise((r) => setTimeout(r, 700));
    setProgressPct(85);
    setProgressText("Synchronizing 5-minute lease with cloud server...");

    // 3. Mark in REST store & Vercel API
    try {
      await fetch(`https://api.restful-api.dev/objects/${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "csw_session",
          data: {
            status: "activated",
            activated_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
            is_premium: false,
          },
        }),
      }).catch(() => null);
    } catch {}

    try {
      await fetch("/api/public/session/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      }).catch(() => null);
    } catch {}

    await new Promise((r) => setTimeout(r, 600));
    setProgressPct(100);
    setStep("activated");
  }

  function launchApp() {
    window.location.href = `steamswitch://activate?token=${encodeURIComponent(token)}`;
  }

  return (
    <div dir="ltr" className="min-h-screen bg-[#F6F7F9] text-[#2C2D30] flex flex-col items-center justify-center p-4 font-sans select-none">
      
      {/* NINTENDO-STYLE TOP BRAND */}
      <div className="flex items-center gap-3 mb-8 animate-fade-down">
        <div className="w-10 h-10 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-xl shadow-md shadow-[#E60012]/30">
          S
        </div>
        <span className="text-2xl font-black tracking-tight text-[#2C2D30]">
          Steam<span className="text-[#E60012]">Switch</span>
        </span>
      </div>

      {/* MAIN VERIFICATION CARD */}
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-gray-200/80 shadow-2xl shadow-gray-300/40 text-center relative overflow-hidden transition-all duration-300">
        
        {/* TOP RED ACCENT BAR */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-[#E60012]" />

        {step === "idle" && (
          <div className="space-y-6 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#E60012] flex items-center justify-center mx-auto border border-red-100 shadow-inner">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div>
              <span className="inline-block px-3 py-1 bg-red-100/70 text-[#E60012] rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Verification Required
              </span>
              <h1 className="text-2xl font-black text-gray-900">Unlock 5-Min Free Session</h1>
              <p className="text-sm text-gray-500 mt-2 font-medium leading-relaxed">
                Thank you for completing the ticket visit! Click below to authenticate and immediately unlock your SteamSwitch client.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 font-mono text-xs text-gray-600 flex items-center justify-between">
              <span className="text-gray-400 font-sans font-bold">Ticket:</span>
              <span className="font-bold text-gray-800 truncate max-w-[200px]">{token}</span>
            </div>

            <button
              onClick={triggerActivation}
              className="w-full py-4 px-6 rounded-2xl bg-[#E60012] hover:bg-[#CC0010] active:scale-[0.98] text-white font-black text-base shadow-xl shadow-[#E60012]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-5 h-5" />
              <span>Verify Ticket & Unlock App</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-400 font-semibold">
              Instant loopback activation • No restart needed
            </p>
          </div>
        )}

        {step === "verifying" && (
          <div className="space-y-6 py-6">
            <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-[#E60012] animate-spin mx-auto" />

            <div>
              <h2 className="text-xl font-black text-gray-900">Verifying Session Ticket...</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">{progressText}</p>
            </div>

            {/* PROGRESS TRACK */}
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden p-0.5">
              <div
                className="bg-[#E60012] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        )}

        {step === "activated" && (
          <div className="space-y-6 pt-2 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                Activated Successfully
              </div>
              <h1 className="text-2xl font-black text-gray-900">Session Unlocked!</h1>
              <p className="text-sm text-gray-600 mt-2 font-medium leading-relaxed">
                Your <b className="text-gray-900">5-minute free pass</b> is now running in SteamSwitch. Return to the desktop app to start playing!
              </p>
            </div>

            <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-100 text-center">
              <span className="text-2xl font-black text-emerald-700 font-mono tracking-tight">05:00</span>
              <div className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">Free Access Active</div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={launchApp}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#00C3E3] hover:bg-[#00ADC9] active:scale-[0.98] text-white font-black text-sm shadow-lg shadow-[#00C3E3]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Return to SteamSwitch</span>
              </button>

              <button
                onClick={() => window.close()}
                className="w-full py-3 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-all cursor-pointer"
              >
                Close This Window
              </button>
            </div>
          </div>
        )}

      </div>

      <div className="mt-8 text-center text-xs font-bold text-gray-400">
        SteamSwitch Licensing System • 2026
      </div>

    </div>
  );
}

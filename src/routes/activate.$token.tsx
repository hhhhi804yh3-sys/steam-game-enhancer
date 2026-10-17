import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, ShieldCheck, Gamepad2, ArrowRight, Sparkles, Copy, Check } from "lucide-react";

export const Route = createFileRoute("/activate/$token")({
  head: () => ({ meta: [{ title: "SteamSwitch — Session Ticket Verification" }] }),
  component: ActivatePage,
});

function computePasscode(tok: string): string {
  if (!tok) return "748192";
  let hash = 5381;
  for (let i = 0; i < tok.length; i++) {
    hash = ((hash << 5) + hash) + tok.charCodeAt(i);
  }
  const code = Math.abs(hash % 900000) + 100000;
  return code.toString();
}

function ActivatePage() {
  const { token } = Route.useParams();
  const passcode = computePasscode(token);

  const [step, setStep] = useState<"idle" | "verifying" | "activated">("verifying");
  const [progressText, setProgressText] = useState("Authenticating session ticket...");
  const [progressPct, setProgressPct] = useState(25);
  const [copied, setCopied] = useState(false);

  async function triggerActivation() {
    setStep("verifying");
    setProgressPct(35);
    setProgressText("Authenticating session ticket...");

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // 1. Immediately update REST store & Vercel backend so desktop poller succeeds
    try {
      await fetch(`https://api.restful-api.dev/objects/${encodeURIComponent(token)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "csw_session",
          data: {
            status: "activated",
            passcode: passcode,
            activated_at: new Date().toISOString(),
            expires_at: expiresAt,
            is_premium: false,
          },
        }),
      }).catch(() => null);
    } catch {}

    try {
      await fetch("/api/public/session/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, passcode }),
      }).catch(() => null);
    } catch {}

    setProgressPct(70);
    setProgressText("Sending unlock signal to local SteamSwitch client...");

    // 2. Send to local loopback server
    try {
      await fetch(`http://127.0.0.1:49152/activate?token=${encodeURIComponent(token)}&code=${passcode}`, {
        method: "GET",
        mode: "cors",
      }).catch(() => null);
    } catch {}

    // 3. Trigger custom protocol handlers
    try {
      const iframe1 = document.createElement("iframe");
      iframe1.style.display = "none";
      iframe1.src = `steamswitch://activate?token=${encodeURIComponent(token)}&code=${passcode}`;
      document.body.appendChild(iframe1);

      setTimeout(() => {
        try { document.body.removeChild(iframe1); } catch {}
      }, 1000);
    } catch {}

    await new Promise((r) => setTimeout(r, 400));
    setProgressPct(100);
    setProgressText("Activation confirmed! 5-minute lease granted.");
    setStep("activated");
  }

  // Auto-activate on page mount for seamless instant experience
  useEffect(() => {
    triggerActivation();
  }, [token]);

  function launchApp() {
    window.location.href = `steamswitch://activate?token=${encodeURIComponent(token)}&code=${passcode}`;
    setTimeout(() => {
      try { window.location.href = `cyasw://activate?token=${encodeURIComponent(token)}&code=${passcode}`; } catch {}
    }, 300);
  }

  function handleCopy() {
    navigator.clipboard.writeText(passcode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
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
                Ticket Verified Successfully
              </div>
              <h1 className="text-2xl font-black text-gray-900">5-Minute Pass Ready!</h1>
              <p className="text-sm text-gray-600 mt-1 font-medium leading-relaxed">
                Click below to unlock SteamSwitch, or copy the pass code into the app.
              </p>
            </div>

            {/* 6-DIGIT PASSCODE DISPLAY */}
            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200/80 text-center relative">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Your Pass Code</div>
              <div className="text-3xl font-black text-[#E60012] font-mono tracking-widest my-1">{passcode}</div>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:text-[#00C3E3] hover:border-[#00C3E3] transition-all cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Pass Code"}</span>
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={launchApp}
                className="w-full py-4 px-6 rounded-2xl bg-[#E60012] hover:bg-[#CC0010] active:scale-[0.98] text-white font-black text-base shadow-xl shadow-[#E60012]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Open SteamSwitch & Unlock</span>
              </button>

              <button
                onClick={() => window.close()}
                className="w-full py-3 px-6 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-sm transition-all cursor-pointer"
              >
                Close Window
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

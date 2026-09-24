import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Checkmark } from "@/components/Checkmark";
import { Logo3D } from "@/components/Logo3D";

export const Route = createFileRoute("/activate/$token")({
  head: () => ({ meta: [{ title: "Session Activated — Cysaw Tools" }] }),
  component: Activate,
});

function Activate() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    let cancelled = false;

    // Trigger deep link into desktop app immediately
    const deepLink = `cyasw://activate?token=${encodeURIComponent(token)}`;
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.src = deepLink;
    document.body.appendChild(iframe);

    // Also attempt loopback fetch
    (async () => {
      try {
        await fetch(`http://127.0.0.1:49152/activate?token=${encodeURIComponent(token)}`, {
          method: "GET",
          mode: "cors",
        }).catch(() => null);
      } catch {}

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

      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 400));
      setState("ok");
    })();

    return () => {
      cancelled = true;
      try {
        document.body.removeChild(iframe);
      } catch {}
    };
  }, [token]);

  function launchApp() {
    window.location.href = `cyasw://activate?token=${encodeURIComponent(token)}`;
  }

  return (
    <div dir="ltr" className="min-h-screen bg-[#07090e] flex items-center justify-center px-5 font-sans">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo3D size={110} />
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          {state === "loading" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border-3 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <h1 className="text-2xl font-bold mt-6 text-slate-100">Activating your session…</h1>
              <p className="text-slate-400 mt-2 text-sm">Please wait a moment.</p>
            </>
          )}

          {state === "ok" && (
            <>
              <div className="flex justify-center">
                <Checkmark />
              </div>
              <h1 className="text-3xl font-extrabold mt-4 text-slate-100">Session Activated!</h1>
              <div className="inline-block my-3 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                ⏱️ Free Session: 5 Minutes
              </div>
              <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                Your 5-minute free session for <b className="text-cyan-400">Cysaw Tools</b> is now active.<br />
                Return to the application to start using it.
              </p>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button 
                  onClick={launchApp}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
                >
                  🚀 Open Cysaw Tools
                </button>
                <button 
                  onClick={() => window.close()} 
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition cursor-pointer"
                >
                  Close Tab
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

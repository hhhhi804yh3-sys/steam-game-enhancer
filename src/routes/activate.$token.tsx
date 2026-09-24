import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Checkmark } from "@/components/Checkmark";
import { Logo3D } from "@/components/Logo3D";

export const Route = createFileRoute("/activate/$token")({
  head: () => ({ meta: [{ title: "تم التفعيل بنجاح — Cysaw Tools" }] }),
  component: Activate,
});

function Activate() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok">("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // 1. Direct local handshake with desktop app
      try {
        await fetch(`http://127.0.0.1:49152/activate?token=${encodeURIComponent(token)}`, {
          method: "GET",
          mode: "cors",
        }).catch(() => null);
      } catch {}

      // 2. Cloud serverless backup
      try {
        await fetch("/api/public/session/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        }).catch(() => null);
      } catch {}

      if (cancelled) return;
      await new Promise((r) => setTimeout(r, 500));
      setState("ok");
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#07090e] flex items-center justify-center px-5 font-sans">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6">
          <Logo3D size={110} />
        </div>
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 md:p-10 shadow-2xl backdrop-blur-xl">
          {state === "loading" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border-3 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <h1 className="text-2xl font-bold mt-6 text-slate-100">جاري تفعيل جلستك...</h1>
              <p className="text-slate-400 mt-2 text-sm">يرجى الانتظار ثانية واحدة</p>
            </>
          )}

          {state === "ok" && (
            <>
              <div className="flex justify-center">
                <Checkmark />
              </div>
              <h1 className="text-3xl font-extrabold mt-4 text-slate-100">تم التفعيل بنجاح!</h1>
              <div className="inline-block my-3 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
                ⏱️ مدة الجلسة: 15 دقيقة مجانية
              </div>
              <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                تم تفعيل جلستك المجانية في تطبيق <b className="text-cyan-400">Cysaw Tools</b> بنجاح.<br />
                يمكنك الآن العودة إلى التطبيق واستخدامه مباشرة.
              </p>
              <button 
                onClick={() => window.close()} 
                className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/25 transition active:scale-95 cursor-pointer"
              >
                إغلاق هذه الصفحة
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Checkmark } from "@/components/Checkmark";
import { Logo3D } from "@/components/Logo3D";

export const Route = createFileRoute("/activate/$token")({
  head: () => ({ meta: [{ title: "Activating — Cysaw" }] }),
  component: Activate,
});

function Activate() {
  const { token } = Route.useParams();
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/public/session/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const j = await res.json();
        if (cancelled) return;
        if (!res.ok || !j.ok) { setErr(j.error || "Activation failed"); setState("error"); return; }
        setState("ok");
      } catch (e: unknown) {
        if (cancelled) return;
        setErr(e instanceof Error ? e.message : "Network error");
        setState("error");
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  return (
    <div dir="ltr" className="min-h-screen flex items-center justify-center px-5">
      <div className="w-full max-w-lg text-center">
        <div className="flex justify-center mb-6"><Logo3D size={120} /></div>
        <div className="glass rounded-3xl p-10">
          {state === "loading" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <h1 className="text-2xl font-bold mt-5">Activating your session…</h1>
              <p className="text-muted-foreground mt-2 text-sm">Please wait a moment.</p>
            </>
          )}
          {state === "ok" && (
            <>
              <div className="flex justify-center"><Checkmark /></div>
              <h1 className="text-3xl font-bold mt-4 shine">Session activated</h1>
              <p className="text-muted-foreground mt-3 leading-relaxed">
                You can close this page and return to the application.
              </p>
              <button onClick={() => window.close()} className="btn-brand mt-6">Close window</button>
            </>
          )}
          {state === "error" && (
            <>
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/20 text-destructive flex items-center justify-center text-3xl">!</div>
              <h1 className="text-2xl font-bold mt-4">Activation failed</h1>
              <p className="text-muted-foreground mt-2 text-sm">{err}</p>
              <p className="text-xs text-muted-foreground mt-3">The link may have expired or already been used. Generate a new one from your tool.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

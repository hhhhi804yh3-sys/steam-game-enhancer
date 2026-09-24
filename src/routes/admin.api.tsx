import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LogoMark } from "@/components/Logo3D";
import { Wand2, Copy, Check, RefreshCw, LogOut, ArrowLeft, Terminal, Code2, Globe } from "lucide-react";

export const Route = createFileRoute("/admin/api")({
  head: () => ({ meta: [{ title: "API Generator — Cysaw Admin" }] }),
  component: ApiGenerator,
});

type GenResult = {
  token: string;
  activation_url: string;
  status_url: string;
  expires_at: string;
  api_key: string;
  secret: string;
  curl_create: string;
  curl_status: string;
  js_snippet: string;
  python_snippet: string;
};

function rand(len: number) {
  const b = new Uint8Array(len);
  crypto.getRandomValues(b);
  return Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
}

function ApiGenerator() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { navigate({ to: "/admin/login" }); return; }
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", s.session.user.id);
      setIsAdmin(!!roles?.some((r) => r.role === "admin"));
    })();
  }, [navigate]);

  async function generate() {
    setBusy(true); setErr(null); setResult(null);
    try {
      const origin = window.location.origin;
      const res = await fetch("/api/public/session/create", { method: "POST" });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      const data = await res.json() as { token: string; activation_url: string; expires_at: string };
      const token = data.token;
      const api_key = `csw_pk_${rand(16)}`;
      const secret = `csw_sk_${rand(24)}`;
      const activation_url = `${origin}/activate/${token}`;
      const status_url = `${origin}/api/public/session/status?token=${token}`;
      const create_url = `${origin}/api/public/session/create`;

      const curl_create = `curl -X POST "${create_url}" \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: ${api_key}" \\
  -d '{"client":"SteamTool","version":"1.0.0"}'`;

      const curl_status = `curl "${status_url}" \\
  -H "X-Api-Key: ${api_key}"`;

      const js_snippet = `// Cysaw SteamTool — Session activation
const API_KEY = "${api_key}";
const SECRET  = "${secret}";

async function startSession() {
  const r = await fetch("${create_url}", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": API_KEY }
  });
  const { token, activation_url } = await r.json();
  open(activation_url); // user activates in browser
  return await pollUntilActive(token);
}

async function pollUntilActive(token) {
  while (true) {
    const r = await fetch(\`${origin}/api/public/session/status?token=\${token}\`,
      { headers: { "X-Api-Key": API_KEY } });
    const { status } = await r.json();
    if (status === "activated") return token;
    await new Promise(r => setTimeout(r, 2000));
  }
}`;

      const python_snippet = `# Cysaw SteamTool — Session activation
import requests, time, webbrowser

API_KEY = "${api_key}"
SECRET  = "${secret}"
BASE    = "${origin}"

def start_session():
    r = requests.post(f"{BASE}/api/public/session/create",
        headers={"X-Api-Key": API_KEY},
        json={"client": "SteamTool", "version": "1.0.0"})
    data = r.json()
    webbrowser.open(data["activation_url"])
    return poll(data["token"])

def poll(token):
    while True:
        r = requests.get(f"{BASE}/api/public/session/status?token={token}",
            headers={"X-Api-Key": API_KEY})
        if r.json().get("status") == "activated":
            return token
        time.sleep(2)`;

      setResult({
        token,
        activation_url,
        status_url,
        expires_at: data.expires_at,
        api_key,
        secret,
        curl_create,
        curl_status,
        js_snippet,
        python_snippet,
      });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function copy(label: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 1400);
  }

  async function logout() {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  }

  if (isAdmin === null) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!isAdmin) return (
    <div className="min-h-screen flex items-center justify-center text-center px-5">
      <div className="glass rounded-2xl p-8 max-w-md">
        <h2 className="text-xl font-bold">Not authorized</h2>
        <button onClick={logout} className="btn-brand mt-4">Sign out</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <div className="bg-grid absolute inset-0 -z-10 opacity-30" aria-hidden />
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between">
          <Link to="/admin/dashboard" className="flex items-center gap-3">
            <LogoMark size={26} />
            <span className="font-display font-bold">Cy<span className="shine">saw</span> Admin</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link to="/admin/dashboard" className="btn-ghost text-sm inline-flex items-center gap-2"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
            <button onClick={logout} className="btn-ghost text-sm inline-flex items-center gap-2"><LogOut className="h-4 w-4" /> Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-10">
        <div className="text-center mb-8 animate-fade-up">
          <div className="icon-3d inline-flex h-14 w-14 rounded-2xl bg-gradient-to-br from-[oklch(0.82_0.18_160)] to-[oklch(0.85_0.16_195)] items-center justify-center text-background">
            <Wand2 className="h-7 w-7 m-auto self-center" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-4">API <span className="shine">Generator</span></h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            One click generates a full activation bundle — token, signed URLs, API key, secret, and ready-to-paste snippets.
          </p>
          <button onClick={generate} disabled={busy} className="btn-brand inline-flex items-center gap-2 mt-6">
            {busy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {busy ? "Generating…" : result ? "Generate another" : "Generate API bundle"}
          </button>
          {err && <div className="text-sm text-destructive mt-3">{err}</div>}
        </div>

        {result && (
          <div className="grid gap-4 animate-fade-up">
            <CredCard label="Activation URL" value={result.activation_url} icon={Globe} onCopy={copy} copied={copied} />
            <div className="grid md:grid-cols-2 gap-4">
              <CredCard label="API Key (public)" value={result.api_key} onCopy={copy} copied={copied} />
              <CredCard label="Secret (keep private)" value={result.secret} onCopy={copy} copied={copied} mask />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <CredCard label="Token" value={result.token} onCopy={copy} copied={copied} />
              <CredCard label="Status endpoint" value={result.status_url} onCopy={copy} copied={copied} />
            </div>
            <SnippetCard label="cURL — create session" code={result.curl_create} icon={Terminal} onCopy={copy} copied={copied} />
            <SnippetCard label="cURL — poll status" code={result.curl_status} icon={Terminal} onCopy={copy} copied={copied} />
            <SnippetCard label="JavaScript / Node" code={result.js_snippet} icon={Code2} onCopy={copy} copied={copied} />
            <SnippetCard label="Python" code={result.python_snippet} icon={Code2} onCopy={copy} copied={copied} />
            <div className="text-xs text-muted-foreground text-center">
              Expires {new Date(result.expires_at).toLocaleString()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

type Copier = (label: string, text: string) => void;

function CredCard({ label, value, icon: Icon, onCopy, copied, mask }: { label: string; value: string; icon?: typeof Globe; onCopy: Copier; copied: string | null; mask?: boolean }) {
  const display = mask ? value.slice(0, 10) + "•".repeat(Math.max(0, value.length - 14)) + value.slice(-4) : value;
  return (
    <div className="glass card-3d rounded-xl p-4 flex items-center gap-3">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <div className="min-w-0 flex-1">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="font-mono text-sm truncate mt-0.5">{display}</div>
      </div>
      <button onClick={() => onCopy(label, value)} className="btn-ghost text-xs p-2 shrink-0">
        {copied === label ? <Check className="h-4 w-4 text-[oklch(0.82_0.18_160)]" /> : <Copy className="h-4 w-4" />}
      </button>
    </div>
  );
}

function SnippetCard({ label, code, icon: Icon, onCopy, copied }: { label: string; code: string; icon: typeof Terminal; onCopy: Copier; copied: string | null }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/60">
        <div className="flex items-center gap-2 text-sm font-medium"><Icon className="h-4 w-4" /> {label}</div>
        <button onClick={() => onCopy(label, code)} className="btn-ghost text-xs p-1.5">
          {copied === label ? <Check className="h-4 w-4 text-[oklch(0.82_0.18_160)]" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="text-xs overflow-auto bg-black/30 p-4 leading-relaxed font-mono">{code}</pre>
    </div>
  );
}

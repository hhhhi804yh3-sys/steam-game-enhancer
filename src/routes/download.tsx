import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Logo3D } from "@/components/Logo3D";
import { Download, FileDown, Clock, PlayCircle, Send } from "lucide-react";

type Version = {
  id: string;
  version: string;
  title: string;
  description: string;
  changelog: string | null;
  file_path: string;
  file_size: number | null;
  is_latest: boolean;
  created_at: string;
};

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download — Cysaw SteamTool" },
      { name: "description", content: "Download the latest Cysaw SteamTool build. Includes session API activation." },
    ],
  }),
  component: DownloadPage,
});

function publicUrl(path: string) {
  const { data } = supabase.storage.from("tool-builds").getPublicUrl(path);
  return data.publicUrl;
}

function fmtSize(b: number | null) {
  if (!b) return "—";
  const u = ["B", "KB", "MB", "GB"];
  let i = 0; let n = b;
  while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
  return `${n.toFixed(1)} ${u[i]}`;
}

function ytEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{6,})/);
  return `https://www.youtube.com/embed/${m?.[1] ?? "sgSFWb5-5tg"}?rel=0&modestbranding=1`;
}

function DownloadPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState({
    youtube_url: "https://youtu.be/sgSFWb5-5tg",
    telegram_url: "https://t.me/staemtools/63",
  });

  useEffect(() => {
    supabase.from("tool_versions").select("*").order("created_at", { ascending: false })
      .then(({ data }) => { setVersions((data as Version[]) || []); setLoading(false); });
    fetch("/api/public/tutorials")
      .then((r) => r.json())
      .then((j) => { if (j?.ok && j.data) setLinks(j.data); })
      .catch(() => {});
  }, []);


  const latest = versions.find((v) => v.is_latest) || versions[0];

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-5 pt-14 pb-10">
        <div className="grid md:grid-cols-[auto_1fr] gap-10 items-center glass rounded-3xl p-8 md:p-10">
          <Logo3D size={180} />
          <div>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">SteamTool</span>
            <h1 className="text-4xl md:text-5xl font-bold mt-1">Cyasw<span className="shine">Tools</span></h1>
            <p className="text-muted-foreground mt-3 leading-relaxed">
              {latest?.description ||
                "Cysaw SteamTool is a lightweight desktop helper. Launch it, click activate, and the browser handles the rest — your session unlocks automatically through the Cysaw Session API."}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {loading ? (
                <button disabled className="btn-ghost">Loading…</button>
              ) : latest ? (
                <a
                  href={publicUrl(latest.file_path)}
                  className="btn-brand inline-flex items-center gap-2"
                  download
                >
                  <Download className="h-4 w-4" /> Download v{latest.version}
                </a>
              ) : (
                <span className="text-sm text-muted-foreground">No builds yet. Check back soon.</span>
              )}
              {latest && (
                <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Released {new Date(latest.created_at).toLocaleDateString()} · {fmtSize(latest.file_size)}
                </span>
              )}
            </div>
          </div>
        </div>

        {latest?.changelog && (
          <div className="glass rounded-2xl p-6 mt-6">
            <h3 className="font-semibold mb-2">What's new in v{latest.version}</h3>
            <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">{latest.changelog}</pre>
          </div>
        )}

        {versions.length > 1 && (
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-3">Previous versions</h2>
            <div className="grid gap-3">
              {versions.filter((v) => v.id !== latest?.id).map((v) => (
                <div key={v.id} className="glass rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">v{v.version}</div>
                    <div className="text-xs text-muted-foreground">{new Date(v.created_at).toLocaleString()} · {fmtSize(v.file_size)}</div>
                  </div>
                  <a href={publicUrl(v.file_path)} download className="btn-ghost inline-flex items-center gap-2 text-sm">
                    <FileDown className="h-4 w-4" /> Download
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Video tutorial */}
        <section className="mt-12">
          <h2 className="text-2xl font-semibold inline-flex items-center gap-2 mb-4">
            <PlayCircle className="h-6 w-6 text-primary" /> How to use SteamTool
          </h2>
          <p className="text-muted-foreground mb-4 text-sm">
            Watch the full step-by-step video — install, activate, and start using the tool in minutes.
          </p>
          <div className="glass rounded-2xl p-3 overflow-hidden">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-xl"
                src={ytEmbed(links.youtube_url)}
                title="Cysaw SteamTool tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={links.telegram_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2 text-sm"
            >
              <Send className="h-4 w-4" /> Latest tutorial on Telegram
            </a>

          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

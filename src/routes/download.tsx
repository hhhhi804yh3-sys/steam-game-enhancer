import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
      { title: "Download - Cysaw SteamTool" },
      { name: "description", content: "Download the latest Cysaw SteamTool build. Includes session API activation." },
    ],
  }),
  component: DownloadPage,
});

function fmtSize(b: number | null) {
  if (!b) return "";
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
  const [links, setLinks] = useState({ youtube_url: "", telegram_url: "" });
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    fetch("/api/public/versions")
      .then(r => r.json())
      .then(res => {
        if (res && res.ok) {
          setVersions(res.versions || []);
          if (res.links) setLinks(res.links);
        }
        setBusy(false);
      })
      .catch(() => setBusy(false));
  }, []);

  const latest = versions.find((v) => v.is_latest) || versions[0];
  const old = versions.filter((v) => v.id !== latest?.id);

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col">
      <div className="bg-grid absolute inset-0 -z-10 opacity-30" aria-hidden />
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-5xl px-5 w-full pt-16 pb-20">
        <div className="glass rounded-3xl p-6 md:p-10 border border-border/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="grid md:grid-cols-2 gap-10 items-center relative z-10">
            <div className="order-2 md:order-1 space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">SteamTool</p>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                  <span className="shine">CyaswTools</span>
                </h1>
                <p className="text-muted-foreground leading-relaxed">
                  Cysaw SteamTool is a lightweight desktop helper. Launch it, click activate, and the browser handles the rest - your session unlocks automatically through the Cysaw Session API.
                </p>
              </div>

              {busy ? (
                <div className="animate-pulse flex items-center gap-3">
                  <div className="h-12 w-40 bg-white/5 rounded-xl" />
                  <div className="h-4 w-24 bg-white/5 rounded" />
                </div>
              ) : (
                <div className="space-y-4">
                  {latest ? (
                    <a
                      href={latest.file_path}
                      className="btn-brand inline-flex items-center gap-2 px-8 py-4 text-base font-semibold"
                      download
                    >
                      <Download className="h-5 w-5" /> Download v{latest.version}
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/10">No builds yet. Check back soon.</span>
                  )}
                  {latest && (
                    <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 opacity-80">
                      <Clock className="h-3.5 w-3.5" /> Released {new Date(latest.created_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="order-1 md:order-2 flex justify-center">
              <div className="relative animate-float">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150" />
                <Logo3D size={280} />
              </div>
            </div>
          </div>
        </div>

        {links.youtube_url && (
          <div className="mt-16 glass rounded-2xl p-6 md:p-8 animate-fade-up">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <PlayCircle className="text-primary h-5 w-5" /> How to use SteamTool
            </h2>
            <p className="text-muted-foreground mb-6 text-sm">Watch the full step-by-step video - install, activate, and start using the tool in minutes.</p>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-border/50 shadow-lg">
              <iframe
                src={ytEmbed(links.youtube_url)}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {links.telegram_url && (
            <a href={links.telegram_url} target="_blank" rel="noreferrer" className="glass rounded-2xl p-6 flex items-center gap-4 hover:border-primary/50 transition-colors group">
              <div className="h-12 w-12 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[#0088cc] group-hover:scale-110 transition-transform">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-[#0088cc]">Join our Telegram</h3>
                <p className="text-xs text-muted-foreground mt-1">Get instant updates and community support</p>
              </div>
            </a>
          )}
        </div>

        {old.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
              <FileDown className="h-4 w-4" /> Previous Versions
            </h3>
            <div className="glass rounded-xl divide-y divide-border/50 border border-border/40 overflow-hidden">
              {old.map((v) => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div>
                    <div className="font-medium">v{v.version}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(v.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <a href={v.file_path} className="text-primary hover:text-primary/80 transition-colors p-2" title="Download">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
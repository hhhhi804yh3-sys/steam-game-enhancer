import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo3D } from "@/components/Logo3D";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Download, Gamepad2, Library, Zap, Cloud, Sparkles, ExternalLink, Shield, Rocket, Layers, Cpu, Wand2, Globe, BookOpen } from "lucide-react";
import shot1 from "@/assets/steamtool-shot-1.png.asset.json";
import shot2 from "@/assets/steamtool-shot-2.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cysaw SteamTool — Add games to your Steam library easily" },
      { name: "description", content: "Cysaw SteamTool is a lightweight helper for Steam game lovers — add games to your Steam library in seconds." },
      { property: "og:title", content: "Cysaw SteamTool" },
      { property: "og:description", content: "A tool for Steam game lovers — easily add games to your Steam library." },
    ],
  }),
  component: Index,
});

const features = [
  { icon: Gamepad2, title: "Built for gamers", desc: "Designed for Steam lovers — a smooth way to grow your game collection." },
  { icon: Library, title: "Add to Steam library", desc: "Add games to your Steam library quickly without complex setup." },
  { icon: Zap, title: "Lightweight & fast", desc: "Small footprint, instant launch — get to playing, not configuring." },
  { icon: Cloud, title: "Always up to date", desc: "New builds are pushed regularly so you always have the latest version." },
  { icon: Shield, title: "Secure activation", desc: "Token-based sessions keep your activation private and tamper-proof." },
  { icon: Rocket, title: "Instant launch", desc: "Click, activate, play — no loading screens, no friction." },
  { icon: Layers, title: "Clean interface", desc: "A polished, modern look with subtle 3D touches throughout." },
  { icon: Cpu, title: "Low resource use", desc: "Runs quietly in the background without slowing your PC." },
  { icon: Wand2, title: "One-click magic", desc: "Complex tasks simplified into a single, satisfying click." },
];

function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10 opacity-40" aria-hidden />
      <div className="stars absolute inset-0 -z-10" aria-hidden />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5">
        <section className="pt-20 pb-16 text-center relative">
          <div className="flex justify-center mb-10 animate-fade-up">
            <div className="relative">
              <div className="absolute inset-0 rounded-full pulse-ring" aria-hidden />
              <Logo3D size={220} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight animate-fade-up delay-100">
            Welcome to <span className="shine">CyaswTools</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-5 max-w-2xl mx-auto animate-fade-up delay-200">
            A tool for Steam game lovers — easily add games to your Steam library in just a few clicks.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-fade-up delay-300">
            <Link to="/download" className="btn-brand inline-flex items-center gap-2">
              <Download className="h-4 w-4" /> Download SteamTool
            </Link>
            <Link to="/catalog" className="btn-ghost inline-flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Browse Catalog
            </Link>
            <Link to="/docs" className="btn-ghost inline-flex items-center gap-2">
              <Globe className="h-4 w-4" /> Documentation
            </Link>
          </div>
        </section>

        <section id="features" className="grid gap-5 md:grid-cols-3 mt-10" style={{ perspective: 1000 }}>
          {features.map((f, i) => (
            <div
              key={f.title}
              className="glass card-3d rounded-2xl p-6 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.07}s` }}
            >
              <div className="icon-3d h-12 w-12 rounded-xl bg-primary items-center justify-center text-primary-foreground">
                <f.icon className="h-6 w-6 m-auto self-center" />
              </div>

              <h3 className="text-lg font-semibold mt-5">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </section>

        <section id="screenshots" className="mt-20">
          <div className="text-center mb-10 animate-fade-up">
            <h2 className="text-3xl md:text-4xl font-bold">A look inside <span className="shine">SteamTool</span></h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A clean, fast interface for browsing, searching, and adding games to your Steam library.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[shot1, shot2].map((s, i) => (
              <div key={i} className="glass card-3d rounded-2xl overflow-hidden border border-border/40 animate-fade-up" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <img src={s.url} alt={`SteamTool screenshot ${i + 1}`} loading="lazy" className="w-full h-auto block" />
              </div>
            ))}
          </div>
        </section>

        <section className="glass rounded-3xl p-8 md:p-12 mt-16 mb-16 text-center relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl" aria-hidden />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" aria-hidden />
          <Sparkles className="h-10 w-10 mx-auto text-primary icon-3d" />

          <h2 className="text-3xl md:text-4xl font-bold mt-4">Ready to expand your <span className="shine">Steam library</span>?</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            Grab the latest Cysaw SteamTool build and start adding games in seconds.
          </p>
          <Link to="/download" className="btn-brand inline-flex items-center gap-2 mt-6">
            <Download className="h-4 w-4" /> Download now
          </Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

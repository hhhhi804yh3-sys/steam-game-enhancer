import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Download, CheckCircle2, ShieldCheck, Laptop, Sparkles, Youtube, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download SteamSwitch — Official PC Installer" },
      { name: "description", content: "Download the official SteamSwitch installer for Windows 10 & 11." },
    ],
  }),
  component: DownloadPage,
});

export default function DownloadPage() {
  const downloadUrl = "https://github.com/hhhhi804yh3-sys/SteamSwitch/releases/download/v5.1.0/SteamSwitch-Installer.exe";

  return (
    <div className="min-h-screen bg-white text-[#2C2D30] font-sans flex flex-col justify-between">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-5 py-16 w-full text-center">
        
        {/* BRAND BADGE */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 text-[#E60012] text-xs font-black uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4" />
          <span>Latest Release v5.1.0</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
          Download <span className="text-[#E60012]">SteamSwitch</span> for Windows
        </h1>

        <p className="text-base sm:text-lg text-gray-500 font-medium max-w-xl mx-auto mt-4 leading-relaxed">
          The all-in-one console launcher and bypass hub for Steam. Portable standalone installer with automatic desktop shortcut integration.
        </p>

        {/* DOWNLOAD CARD */}
        <div className="mt-10 p-8 sm:p-12 rounded-3xl bg-[#F9FAFB] border border-gray-200/80 shadow-xl max-w-xl mx-auto">
          
          <div className="w-16 h-16 rounded-2xl bg-[#E60012] text-white flex items-center justify-center font-black text-3xl mx-auto mb-6 shadow-lg shadow-red-500/25">
            S
          </div>

          <h2 className="text-xl font-black text-gray-900">SteamSwitch-Installer.exe</h2>
          <p className="text-xs text-gray-400 font-bold mt-1 uppercase tracking-wider">Windows 64-bit • Single File • 120 MB</p>

          <div className="pt-8">
            <a
              href={downloadUrl}
              className="w-full py-4 px-8 rounded-2xl bg-[#E60012] hover:bg-[#CC0010] active:scale-[0.98] text-white font-black text-base shadow-xl shadow-red-500/30 transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Download className="w-5 h-5 stroke-[2.5]" />
              <span>Download Official Installer</span>
            </a>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4 text-xs font-bold text-gray-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free 5-Min Passes
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Lifetime VIP Ready
            </span>
          </div>

        </div>

        {/* QUICK GUIDE */}
        <div className="mt-16 text-left max-w-xl mx-auto space-y-4">
          <h3 className="text-lg font-black text-gray-900 text-center">Quick Installation Steps</h3>
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-3 text-sm text-gray-600 font-medium">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#E60012] text-white text-xs font-black flex items-center justify-center shrink-0">1</span>
              <span>Run <b>SteamSwitch-Installer.exe</b> after downloading.</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#E60012] text-white text-xs font-black flex items-center justify-center shrink-0">2</span>
              <span>Wait for the automatic setup to complete (creates a clean desktop shortcut).</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#E60012] text-white text-xs font-black flex items-center justify-center shrink-0">3</span>
              <span>Launch SteamSwitch and click <b>"Get Free 5-Min Pass"</b> or enter your VIP key!</span>
            </div>
          </div>
        </div>

      </main>

      <SiteFooter />
    </div>
  );
}
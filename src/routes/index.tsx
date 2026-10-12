import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { 
  Download, 
  Gamepad2, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink,
  Laptop,
  Layers,
  ChevronRight,
  Play
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SteamSwitch — The Nintendo-Inspired PC Gaming Hub" },
      { name: "description", content: "Official site for SteamSwitch: Console-style UI, Steam bypass launcher, 5-minute free sessions, and instant setup for PC." },
      { property: "og:title", content: "SteamSwitch Official Edition" },
      { property: "og:description", content: "Bring the Nintendo Switch console experience to your Steam PC library." },
    ],
  }),
  component: Index,
});

export default function Index() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2C2D30] font-sans selection:bg-[#E60012] selection:text-white">
      <SiteHeader />

      <main>
        {/* ============================================================ */}
        {/* HERO SECTION (NINTENDO SWITCH STYLE) */}
        {/* ============================================================ */}
        <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32 bg-gradient-to-b from-[#F9FAFB] to-white border-b border-gray-100">
          
          {/* BACKGROUND JOY-CON COLOR SPLASHES */}
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#00C3E3]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/4 -right-32 w-96 h-96 bg-[#FF3C28]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="mx-auto max-w-6xl px-5 text-center relative z-10">
            
            {/* HERO BADGE */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-red-50 border border-red-100/80 text-[#E60012] text-xs font-black uppercase tracking-wider mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#E60012] animate-ping" />
              <span>SteamSwitch v5.1.0 Official Edition</span>
            </div>

            {/* MAIN HEADLINE */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 leading-[1.08] max-w-4xl mx-auto">
              The Console Experience for <span className="text-[#E60012]">Steam on PC</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Transform your PC into a sleek Nintendo Switch-style gaming hub. Seamlessly launch, manage, and bypass Steam games with instant 5-minute free sessions.
            </p>

            {/* CALL TO ACTION BUTTONS */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <a
                href="https://github.com/hhhhi804yh3-sys/SteamSwitch/releases/download/v5.1.0/SteamSwitch-Installer.exe"
                className="px-8 py-4 rounded-2xl bg-[#E60012] hover:bg-[#CC0010] active:scale-[0.98] text-white font-black text-base shadow-xl shadow-[#E60012]/30 transition-all flex items-center gap-3 cursor-pointer"
              >
                <Download className="w-5 h-5 stroke-[2.5]" />
                <span>Download for Windows</span>
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-xs font-bold">120 MB</span>
              </a>

              <a
                href="#free-pass"
                className="px-6 py-4 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-black text-base transition-all flex items-center gap-2"
              >
                <span>How Free Pass Works</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </a>
            </div>

            {/* METADATA PILLS */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs font-bold text-gray-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Windows 10 & 11 (64-bit)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Single Portable Setup
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free Sessions Included
              </span>
            </div>

            {/* JOY-CON ROTATING VISUAL SHOWCASE */}
            <div className="mt-14 max-w-2xl mx-auto p-4 rounded-3xl bg-white border border-gray-100 shadow-2xl shadow-gray-200/60">
              <div className="bg-[#181A1D] rounded-2xl p-8 sm:p-12 text-white flex flex-col items-center justify-center relative overflow-hidden">
                
                {/* SVG ANIMATION */}
                <div className="w-36 h-36 relative mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-full h-full drop-shadow-lg">
                    <circle cx="100" cy="100" r="54" fill="none" stroke="#2D3035" strokeWidth="4" strokeDasharray="6 6"/>
                    <g>
                      <rect x="83" y="83" width="34" height="34" rx="8" fill="#1E2024" stroke="#2D3035" strokeWidth="2"/>
                      <rect x="88" y="88" width="24" height="24" rx="4" fill="#FFFFFF"/>
                      <path d="M94 92 h3 a3 3 0 0 1 3 3 v10 a3 3 0 0 1 -3 3 h-3 z" fill="#00C3E3"/>
                      <circle cx="96.5" cy="97" r="1.2" fill="#FFFFFF"/>
                      <path d="M106 92 h-3 a3 3 0 0 0 -3 3 v10 a3 3 0 0 0 3 3 h3 z" fill="#FF3C28"/>
                      <circle cx="103.5" cy="101" r="1.2" fill="#FFFFFF"/>
                    </g>
                    <g>
                      <g transform="translate(100, 36)">
                        <path d="M-12,-16 C-24,-16 -30,-6 -30,6 C-30,18 -24,28 -12,28 L-4,28 L-4,-16 Z" fill="#00C3E3" stroke="#1E2024" strokeWidth="2" strokeLinejoin="round"/>
                        <circle cx="-16" cy="-4" r="5" fill="#202225"/>
                        <circle cx="-16" cy="-4" r="2.5" fill="#3A3D44"/>
                        <circle cx="-16" cy="11" r="1.8" fill="#202225"/>
                        <circle cx="-21" cy="15" r="1.8" fill="#202225"/>
                        <circle cx="-11" cy="15" r="1.8" fill="#202225"/>
                        <circle cx="-16" cy="19" r="1.8" fill="#202225"/>
                        <rect x="-10" y="-12" width="4" height="1.8" rx="0.9" fill="#202225"/>
                      </g>
                      <g transform="translate(100, 164)">
                        <path d="M12,16 C24,16 30,6 30,-6 C30,-18 24,-28 12,-28 L4,-28 L4,16 Z" fill="#FF3C28" stroke="#1E2024" strokeWidth="2" strokeLinejoin="round"/>
                        <circle cx="16" cy="-19" r="1.8" fill="#202225"/>
                        <circle cx="11" cy="-15" r="1.8" fill="#202225"/>
                        <circle cx="21" cy="-15" r="1.8" fill="#202225"/>
                        <circle cx="16" cy="-11" r="1.8" fill="#202225"/>
                        <circle cx="16" cy="4" r="5" fill="#202225"/>
                        <circle cx="16" cy="4" r="2.5" fill="#3A3D44"/>
                        <path d="M8,11 h4 m-2,-2 v4" stroke="#202225" strokeWidth="1.8" strokeLinecap="round"/>
                      </g>
                    </g>
                  </svg>
                </div>

                <div className="font-mono text-sm tracking-wider text-gray-300 font-bold">
                  STEAMSWITCH SYSTEM INTERFACE
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Ready to connect on Local Port 49152
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* FREE 5-MINUTE SESSION SHOWCASE */}
        {/* ============================================================ */}
        <section id="free-pass" className="py-20 bg-[#F6F7F9] border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-5">
            
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-xs font-black uppercase tracking-wider">
                ⚡ 100% Free Forever
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3">
                How Free 5-Minute Sessions Work
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mt-2 font-medium">
                No credit card or payment needed. Generate a ticket link, complete verification on our site, and enjoy 5 minutes of unrestricted access instantly!
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-4">
              
              {/* STEP 1 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md shadow-gray-200/40 relative">
                <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-sm mb-4">
                  1
                </div>
                <h3 className="text-base font-black text-gray-900">Launch SteamSwitch</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Open the desktop app on your PC. Click the blue <b className="text-gray-800">"Get Free 5-Min Pass"</b> button.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md shadow-gray-200/40 relative">
                <div className="w-10 h-10 rounded-xl bg-[#00C3E3] text-white flex items-center justify-center font-black text-sm mb-4">
                  2
                </div>
                <h3 className="text-base font-black text-gray-900">Visit Ticket Link</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Your default browser automatically opens the short ticket link. Complete the quick security step.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md shadow-gray-200/40 relative">
                <div className="w-10 h-10 rounded-xl bg-[#E60012] text-white flex items-center justify-center font-black text-sm mb-4">
                  3
                </div>
                <h3 className="text-base font-black text-gray-900">Instant Verification</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  Our web system confirms your ticket and sends an instant unlock signal back to your PC via Port 49152.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md shadow-gray-200/40 relative">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-sm mb-4">
                  4
                </div>
                <h3 className="text-base font-black text-gray-900">Play for 5 Mins!</h3>
                <p className="text-xs text-gray-500 mt-2 font-medium leading-relaxed">
                  The countdown timer appears in the titlebar. When it ends, repeat for free anytime with a new ticket!
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* FEATURES GRID */}
        {/* ============================================================ */}
        <section id="features" className="py-24 bg-white border-b border-gray-100">
          <div className="mx-auto max-w-6xl px-5">
            
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="px-3 py-1 bg-red-100 text-[#E60012] rounded-full text-xs font-black uppercase tracking-wider">
                Built For Steam Gamers
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-gray-900 mt-3">
                Engineered for Speed & Simplicity
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              
              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-[#E60012] flex items-center justify-center mb-5">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Nintendo-Style Console UI</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  Enjoy vibrant Joy-Con red and white aesthetics with soft cards, tactile sounds, and gamepad-friendly navigation.
                </p>
              </div>

              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-[#00C3E3] flex items-center justify-center mb-5">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">One-Click Steam Bypass</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  Add games and bypass title protections effortlessly without editing configuration files or complex registry setups.
                </p>
              </div>

              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                  <Clock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Persistent Live Countdown</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  An embedded clock in the window titlebar keeps you informed of your remaining play time without interruptions.
                </p>
              </div>

              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Dynamic User Profile Fix</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  Installs cleanly across any Windows profile without hardcoded user directories, completely eliminating EPERM errors.
                </p>
              </div>

              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Lifetime VIP Key Option</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  Want unlimited access forever without 5-minute tickets? Activate a lifetime VIP license for 50 years of access.
                </p>
              </div>

              <div className="rounded-3xl p-8 bg-[#F9FAFB] border border-gray-100 hover:border-gray-200 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-5">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-gray-900">Zero System Bloat</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
                  Lightweight memory footprint, fast launch, and zero background CPU usage when playing your games.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ============================================================ */}
        {/* VIP MASTER KEY SPOTLIGHT */}
        {/* ============================================================ */}
        <section id="vip-keys" className="py-20 bg-[#F9FAFB] border-b border-gray-100">
          <div className="mx-auto max-w-4xl px-5">
            <div className="bg-white rounded-3xl p-8 sm:p-12 border border-gray-200 shadow-xl text-center space-y-6">
              
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-[#E60012] flex items-center justify-center mx-auto">
                <KeyRound className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-black uppercase text-red-600 tracking-wider">Universal Master Key</span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
                  Want Lifetime VIP Access?
                </h2>
                <p className="text-sm text-gray-500 font-medium max-w-md mx-auto mt-2">
                  Paste the official Universal Master Key into the activation box for instant, permanent 50-year VIP access.
                </p>
              </div>

              <div className="max-w-md mx-auto bg-gray-50 border border-gray-200 rounded-2xl p-4 font-mono font-bold text-gray-800 text-sm sm:text-base select-all tracking-wider shadow-inner">
                NJC7EA4FDTAM5TPUH4NRRSZ2RHWEVR3J
              </div>

              <p className="text-xs text-gray-400 font-semibold">
                Permanent • No expiry countdown • Unlimited devices
              </p>

            </div>
          </div>
        </section>

        {/* ============================================================ */}
        {/* SYSTEM REQUIREMENTS & FINAL DOWNLOAD CTA */}
        {/* ============================================================ */}
        <section id="system-reqs" className="py-24 bg-white">
          <div className="mx-auto max-w-5xl px-5 text-center">
            
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-10">
              System Specifications
            </h2>

            <div className="max-w-2xl mx-auto bg-[#F9FAFB] rounded-3xl p-6 border border-gray-100 text-left font-medium text-sm text-gray-600 mb-14">
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200/60">
                <span className="font-bold text-gray-900">Supported OS:</span>
                <span>Windows 10, Windows 11 (64-bit)</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200/60">
                <span className="font-bold text-gray-900">RAM:</span>
                <span>2 GB minimum (4 GB recommended)</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2 border-b border-gray-200/60">
                <span className="font-bold text-gray-900">Storage:</span>
                <span>~350 MB disk space</span>
              </div>
              <div className="grid grid-cols-2 gap-4 py-2">
                <span className="font-bold text-gray-900">Architecture:</span>
                <span>x64 Native (Electron)</span>
              </div>
            </div>

            {/* BIG DOWNLOAD BANNER */}
            <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-br from-[#E60012] to-[#B3000E] text-white shadow-2xl shadow-red-500/25 relative overflow-hidden">
              <div className="relative z-10 max-w-xl mx-auto space-y-4">
                <h3 className="text-3xl sm:text-4xl font-black tracking-tight">
                  Ready to experience SteamSwitch?
                </h3>
                <p className="text-white/80 text-sm sm:text-base font-medium">
                  Download the official setup and elevate your PC gaming library today.
                </p>
                <div className="pt-4">
                  <a
                    href="https://github.com/hhhhi804yh3-sys/SteamSwitch/releases/download/v5.1.0/SteamSwitch-Installer.exe"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#E60012] font-black text-base shadow-xl hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5 stroke-[2.5]" />
                    <span>Download Installer Now</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

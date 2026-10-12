import { Link } from "@tanstack/react-router";
import { Download, Gamepad2, Sparkles, ExternalLink } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        
        {/* NINTENDO JOY-CON LOGO */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-[#E60012] text-white flex items-center justify-center font-black text-base shadow-md shadow-[#E60012]/30 group-hover:scale-105 transition-transform">
            S
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">
            Steam<span className="text-[#E60012]">Switch</span>
          </span>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-600">
          <a href="#features" className="hover:text-[#E60012] transition-colors">Features</a>
          <a href="#free-pass" className="hover:text-[#00C3E3] transition-colors flex items-center gap-1">
            <span>Free 5-Min Pass</span>
            <span className="px-1.5 py-0.5 rounded-full bg-cyan-100 text-cyan-800 text-[10px] font-black uppercase">Free</span>
          </a>
          <a href="#vip-keys" className="hover:text-[#E60012] transition-colors">VIP Keys</a>
          <a href="#system-reqs" className="hover:text-[#E60012] transition-colors">Specs</a>
          <a 
            href="https://github.com/hhhhi804yh3-sys/SteamSwitch" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-gray-900 transition-colors flex items-center gap-1 text-xs text-gray-400 font-semibold"
          >
            GitHub <ExternalLink className="w-3 h-3" />
          </a>
        </nav>

        {/* CTA DOWNLOAD BUTTON */}
        <div className="flex items-center gap-2">
          <a 
            href="https://github.com/hhhhi804yh3-sys/SteamSwitch/releases/download/v5.1.0/SteamSwitch-Installer.exe"
            className="px-4 py-2 rounded-xl bg-[#E60012] hover:bg-[#CC0010] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-[#E60012]/30 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download App</span>
          </a>
        </div>

      </div>
    </header>
  );
}

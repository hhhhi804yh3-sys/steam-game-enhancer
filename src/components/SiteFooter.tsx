import { Link } from "@tanstack/react-router";
import { Youtube, ExternalLink, ShieldCheck } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-gray-200 bg-white text-gray-600">
      <div className="mx-auto max-w-6xl px-5 py-12 grid gap-8 md:grid-cols-4">
        
        {/* BRAND COLUMN */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#E60012] text-white flex items-center justify-center font-black text-sm shadow-sm">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-gray-900">
              Steam<span className="text-[#E60012]">Switch</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
            The ultimate Nintendo Switch-inspired gaming console UI and bypass utility for Steam on PC. Fast, lightweight, and session-secured.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              All Systems Operational
            </span>
          </div>
        </div>

        {/* QUICK NAVIGATION */}
        <div>
          <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-3">Resources</h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-500">
            <li>
              <a href="https://github.com/hhhhi804yh3-sys/SteamSwitch/releases/download/v5.1.0/SteamSwitch-Installer.exe" className="hover:text-[#E60012] transition-colors">
                Download Installer
              </a>
            </li>
            <li>
              <a href="#free-pass" className="hover:text-[#00C3E3] transition-colors">
                Free 5-Min Pass
              </a>
            </li>
            <li>
              <a href="#vip-keys" className="hover:text-[#E60012] transition-colors">
                VIP Master Key
              </a>
            </li>
            <li>
              <a href="https://github.com/hhhhi804yh3-sys/SteamSwitch" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors inline-flex items-center gap-1">
                GitHub Repository <ExternalLink className="w-3 h-3" />
              </a>
            </li>
          </ul>
        </div>

        {/* COMMUNITY & SUPPORT */}
        <div>
          <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-3">Community</h4>
          <ul className="space-y-2 text-xs font-semibold text-gray-500">
            <li>
              <a href="https://t.me/staemtools" target="_blank" rel="noopener noreferrer" className="hover:text-[#00C3E3] transition-colors">
                Telegram Channel
              </a>
            </li>
            <li>
              <a href="https://youtu.be/sgSFWb5-5tg" target="_blank" rel="noopener noreferrer" className="hover:text-[#E60012] transition-colors inline-flex items-center gap-1.5">
                <Youtube className="w-3.5 h-3.5 text-red-600" /> YouTube Tutorial
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-100 py-6 text-center text-xs text-gray-400 font-medium">
        © {new Date().getFullYear()} SteamSwitch Official Edition. Crafted with ❤️ for Gamers.
      </div>
    </footer>
  );
}

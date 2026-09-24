import { LogoMark } from "./Logo3D";
import { Link } from "@tanstack/react-router";
import { Youtube } from "lucide-react";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/60">
      <div className="mx-auto max-w-6xl px-5 py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <LogoMark size={28} />
            <span className="font-display text-lg font-bold">Cy<span className="shine">saw</span></span>
          </div>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs">
            SteamTool — secure, session-based activation and one-click downloads.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/download" className="hover:text-foreground">Cysaw SteamTool</Link></li>
            <li><Link to="/catalog" className="hover:text-foreground">Games Catalog</Link></li>
            <li><Link to="/docs" className="hover:text-foreground">API Docs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold mb-3">My Channel</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://t.me/staemtools" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground">
                <TelegramIcon className="h-4 w-4" /> t.me/staemtools
              </a>
            </li>
            <li>
              <a href="https://youtu.be/sgSFWb5-5tg?si=jo1RapcyZ9LwDvU5" target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 hover:text-foreground">
                <Youtube className="h-4 w-4" /> YouTube
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Cysaw. All rights reserved.
      </div>
    </footer>
  );
}

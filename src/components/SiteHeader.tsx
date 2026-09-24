import { Link } from "@tanstack/react-router";
import { LogoMark } from "./Logo3D";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto max-w-6xl px-5 py-4 flex items-center justify-between glass rounded-2xl mt-4">
        <Link to="/" className="flex items-center gap-3">
          <LogoMark size={28} />
          <span className="font-display text-xl font-bold">
            Cyasw<span className="shine">Tools</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 text-sm">
          <Link to="/" className="px-3 py-2 rounded-lg hover:bg-white/5">Home</Link>
          <Link to="/catalog" className="px-3 py-2 rounded-lg hover:bg-white/5">Catalog</Link>
          <Link to="/download" className="px-3 py-2 rounded-lg hover:bg-white/5">Download</Link>
          <Link to="/docs" className="px-3 py-2 rounded-lg hover:bg-white/5">Docs</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/download" className="btn-brand text-sm">Get SteamTool</Link>
        </div>
      </div>
    </header>
  );
}

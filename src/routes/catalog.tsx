import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Search, Loader2, Tag, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/catalog")({
  head: () => ({
    meta: [
      { title: "Catalog — Top AAA & Paid Steam Games | Cysaw" },
      { name: "description", content: "Browse the hottest AAA and paid Steam games — all free inside Cysaw SteamTool." },
      { property: "og:title", content: "Cysaw Catalog — Top Steam Games" },
      { property: "og:description", content: "A clean catalog of the most popular paid Steam games." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Cysaw Catalog — Top Steam Games" },
      { name: "twitter:description", content: "A clean catalog of the most popular paid Steam games." },
    ],
  }),
  component: CatalogPage,
});

type Game = {
  appid: number;
  name: string;
  rank: number;
  header_image: string | null;
  is_free: boolean | null;
  price_cents: number | null;
  initial_price_cents?: number | null;
  discount_percent: number | null;
  developer: string | null;
  publisher?: string | null;
};

function formatPrice(cents: number | null | undefined) {
  if (cents == null || cents <= 0) return null;
  return `$${(cents / 100).toFixed(2)}`;
}

const PAGE_SIZE = 48;

function CatalogPage() {
  const [games, setGames] = useState<Game[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);

  useEffect(() => {
    fetch("/api/public/steam/catalog?limit=600")
      .then((r) => r.json())
      .then((j) => {
        if (!j.ok) throw new Error(j.error || "Failed to load");
        setGames(j.data as Game[]);
      })
      .catch((e: Error) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!games) return [];
    const s = q.trim().toLowerCase();
    return s ? games.filter((g) => g.name.toLowerCase().includes(s)) : games;
  }, [games, q]);

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10 opacity-25" aria-hidden />
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="pt-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-xs uppercase tracking-[0.2em] text-muted-foreground animate-fade-up">
            <Gamepad2 className="h-3 w-3" /> Game Catalog
          </div>
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight animate-fade-up delay-100">
            The <span className="shine">Cysaw</span> Library
          </h1>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto animate-fade-up delay-200">
            The most popular AAA & paid Steam games — free inside the tool.
          </p>

          <div className="mt-8 max-w-md mx-auto relative animate-fade-up delay-300">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="input pl-9"
              placeholder="Search games…"
              value={q}
              onChange={(e) => { setQ(e.target.value); setShown(PAGE_SIZE); }}
            />
          </div>
        </section>

        <section className="mt-12">
          {err && <div className="glass rounded-xl px-5 py-4 text-sm text-destructive text-center">{err}</div>}
          {!games && !err && (
            <div className="flex items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading catalog…
            </div>
          )}

          {games && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.slice(0, shown).map((g) => (
                  <article key={g.appid} className="glass card-3d rounded-2xl overflow-hidden border border-border/50">
                    <div className="aspect-[460/215] bg-secondary/40">
                      {g.header_image ? (
                        <img src={g.header_image} alt={g.name} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold leading-tight line-clamp-1">{g.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{g.developer ?? g.publisher ?? "—"}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3" />
                          {g.is_free || !formatPrice(g.price_cents) ? "Free" : (
                            <span className="line-through opacity-70">{formatPrice(g.price_cents)}</span>
                          )}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-primary text-primary-foreground">
                          FREE in tool
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-10">No games match “{q}”.</div>
              )}

              {shown < filtered.length && (
                <div className="mt-10 text-center">
                  <button onClick={() => setShown((s) => s + PAGE_SIZE)} className="btn-brand">
                    Load more ({filtered.length - shown} left)
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

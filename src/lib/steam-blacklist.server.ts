import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type BlacklistEntry = { kind: "appid" | "keyword" | "tag"; value: string };

export async function loadBlacklist(): Promise<{
  appids: Set<number>;
  keywords: string[];
  tags: Set<string>;
}> {
  const appids = new Set<number>();
  const keywords: string[] = [];
  const tags = new Set<string>();

  try {
    const { data } = await supabaseAdmin.from("steam_blacklist").select("kind,value");
    for (const row of (data ?? []) as BlacklistEntry[]) {
      if (row.kind === "appid") {
        const n = parseInt(row.value, 10);
        if (!isNaN(n)) appids.add(n);
      } else if (row.kind === "keyword") {
        keywords.push(row.value.toLowerCase());
      } else if (row.kind === "tag") {
        tags.add(row.value.toLowerCase());
      }
    }
  } catch (err) {
    console.warn("[SteamBlacklist] Using empty blacklist fallback:", err);
  }

  return { appids, keywords, tags };
}

export function isBlocked(
  bl: { appids: Set<number>; keywords: string[]; tags: Set<string> },
  item: { appid?: number | null; name?: string | null; short_description?: string | null; genres?: string[] | null }
): boolean {
  if (item.appid != null && bl.appids.has(item.appid)) return true;
  const haystack = `${item.name ?? ""} ${item.short_description ?? ""}`.toLowerCase();
  for (const k of bl.keywords) {
    if (k && haystack.includes(k)) return true;
  }
  if (item.genres) {
    for (const g of item.genres) {
      if (bl.tags.has(g.toLowerCase())) return true;
    }
  }
  return false;
}

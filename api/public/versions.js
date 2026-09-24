// In-memory store for versions
const g = globalThis;
if (!g.__CSW_VERSIONS__) {
  g.__CSW_VERSIONS__ = new Map([
    ["5.0.7", {
      id: "v_5_0_7",
      version: "5.0.7",
      description: "Major Update v5.0.7: Added Session Persistence, Fixed Live Telemetry & Games Count, Enhanced Security & Obfuscation.",
      changelog: null,
      file_path: "https://github.com/hhhhi804yh3-sys/cyasw-tools-app/releases/download/v5.0.7/Cyasw-Tools-Pro-Setup.exe",
      is_latest: true,
      created_at: new Date().toISOString(),
      file_size: 132265806
    }]
  ]);
}
if (!g.__CSW_LINKS__) g.__CSW_LINKS__ = { youtube_url: "https://www.youtube.com/watch?v=sgSFWb5-5tg", telegram_url: "https://t.me/cysawtools" };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  
  if (req.method === "OPTIONS") return res.status(204).end();

  // GET: Return all versions
  if (req.method === "GET") {
    const arr = Array.from(g.__CSW_VERSIONS__.values()).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    if (arr.length > 0) {
      arr.forEach(v => v.is_latest = false);
      arr[0].is_latest = true;
    }
    return res.status(200).json({ ok: true, versions: arr, links: g.__CSW_LINKS__ });
  }

  // POST: Add a new version
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      
      if (body.version) {
        // mark others not latest
        for (const [k, v] of g.__CSW_VERSIONS__.entries()) {
          v.is_latest = false;
        }
        g.__CSW_VERSIONS__.set(body.version.version, {
          ...body.version,
          is_latest: true,
          created_at: new Date().toISOString()
        });
      }

      if (body.links) {
        Object.assign(g.__CSW_LINKS__, body.links);
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

// In-memory store for codes (persists within Vercel's cold-start window)
const g = globalThis;
if (!g.__CSW_CODES__) g.__CSW_CODES__ = new Map();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  // GET: Return all codes
  if (req.method === "GET") {
    const arr = Array.from(g.__CSW_CODES__.values());
    return res.status(200).json({ ok: true, data: arr });
  }

  // POST: Add codes (batch)
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const items = Array.isArray(body) ? body : [body];
      for (const item of items) {
        if (item.code) {
          g.__CSW_CODES__.set(item.code, {
            id: item.id || item.code,
            code: item.code,
            duration_days: item.duration_days || 30,
            label: item.label || null,
            created_at: item.created_at || new Date().toISOString(),
            used_at: item.used_at || null,
            used_by_token: item.used_by_token || null
          });
        }
      }
      return res.status(200).json({ ok: true, count: items.length });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // PUT: Mark code as used
  if (req.method === "PUT") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const code = String(body.code || "").trim().toUpperCase();
      if (!code) return res.status(400).json({ ok: false, error: "Missing code" });
      
      const existing = g.__CSW_CODES__.get(code);
      if (existing) {
        existing.used_at = new Date().toISOString();
        existing.used_by_token = body.used_by_token || "user";
        g.__CSW_CODES__.set(code, existing);
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // DELETE: Remove code by id
  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (id) {
      // Try to delete by id or by code
      let deleted = false;
      for (const [key, val] of g.__CSW_CODES__.entries()) {
        if (val.id === id || val.code === id) {
          g.__CSW_CODES__.delete(key);
          deleted = true;
          break;
        }
      }
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

import { getDb, saveDb } from './_db.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  const db = await getDb();
  if (!db.codes) db.codes = [];

  // GET: Return all codes
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, data: db.codes });
  }

  // POST: Add codes (batch)
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const items = Array.isArray(body) ? body : [body];
      for (const item of items) {
        if (item.code) {
          const index = db.codes.findIndex(c => c.code === item.code);
          const newCode = {
            id: item.id || item.code,
            code: item.code,
            duration_days: item.duration_days || 30,
            label: item.label || null,
            created_at: item.created_at || new Date().toISOString(),
            used_at: item.used_at || null,
            used_by_token: item.used_by_token || null
          };
          if (index >= 0) {
            db.codes[index] = newCode;
          } else {
            db.codes.push(newCode);
          }
        }
      }
      await saveDb(db);
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
      
      const existing = db.codes.find(c => c.code === code);
      if (existing) {
        existing.used_at = new Date().toISOString();
        existing.used_by_token = body.used_by_token || "user";
        await saveDb(db);
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
      const initialLength = db.codes.length;
      db.codes = db.codes.filter(c => c.id !== id && c.code !== id);
      if (db.codes.length !== initialLength) {
        await saveDb(db);
      }
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

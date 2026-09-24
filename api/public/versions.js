import { getDb, saveDb } from './_db.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  
  const db = await getDb();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, versions: db.versions || [], links: db.links || {} });
  }

  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      
      if (body.links) {
        db.links = body.links;
        await saveDb(db);
        return res.status(200).json({ ok: true });
      }

      if (body.version) {
        if (!db.versions) db.versions = [];
        if (body.version.is_latest) {
          db.versions.forEach(v => v.is_latest = false);
        }
        
        const existing = db.versions.findIndex(v => v.id === body.version.id);
        if (existing >= 0) {
          db.versions[existing] = { ...db.versions[existing], ...body.version };
        } else {
          db.versions.unshift(body.version);
        }
        await saveDb(db);
        return res.status(200).json({ ok: true });
      }
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (id && db.versions) {
      db.versions = db.versions.filter(v => v.id !== id);
      await saveDb(db);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false });
}
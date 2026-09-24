const REST_STORE = "https://api.restful-api.dev/objects";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 1. GET: Fetch all codes from store
  if (req.method === "GET") {
    try {
      const storeRes = await fetch(REST_STORE);
      if (storeRes.ok) {
        const items = await storeRes.json();
        const codes = items
          .filter(it => it.name && it.name.startsWith("csw_code_"))
          .map(it => ({ id: it.id, ...it.data }));
        return res.status(200).json({ ok: true, data: codes });
      }
      return res.status(200).json({ ok: true, data: [] });
    } catch (e) {
      return res.status(200).json({ ok: true, data: [] });
    }
  }

  // 2. POST: Save new code(s)
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const items = Array.isArray(body) ? body : [body];

      for (const item of items) {
        if (item.code) {
          fetch(REST_STORE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: `csw_code_${item.code}`,
              data: {
                code: item.code,
                duration_days: item.duration_days || 30,
                label: item.label || null,
                created_at: item.created_at || new Date().toISOString(),
                used_at: null,
                used_by_token: null
              }
            })
          }).catch(() => null);
        }
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // 3. DELETE: Remove code by ID
  if (req.method === "DELETE") {
    try {
      const id = req.query?.id;
      if (id) {
        await fetch(`${REST_STORE}/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => null);
      }
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

// In-memory control store
const g = globalThis;
if (!g.__CSW_CONTROLS__) g.__CSW_CONTROLS__ = {
  kill_switch: { enabled: false, message: "" },
  maintenance: { enabled: false, message: "" },
  min_version: { version: "5.0.6", message: "" }
};
if (!g.__CSW_NOTIFICATIONS__) g.__CSW_NOTIFICATIONS__ = [];

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  // GET: Return controls and active notifications for desktop app polling
  if (req.method === "GET") {
    const token = req.query?.token || "";
    const now = Date.now();
    
    // Filter active non-expired notifications
    const activeNotifs = g.__CSW_NOTIFICATIONS__.filter(n => {
      if (new Date(n.expires_at).getTime() < now) return false;
      if (n.target_token && n.target_token !== token) return false;
      return true;
    });

    return res.status(200).json({
      ok: true,
      controls: g.__CSW_CONTROLS__,
      notifications: activeNotifs,
      server_time: new Date().toISOString()
    });
  }

  // POST: Update controls or add notification
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      
      // Update controls
      if (body.controls) {
        Object.assign(g.__CSW_CONTROLS__, body.controls);
      }
      
      // Add notification
      if (body.notification) {
        g.__CSW_NOTIFICATIONS__.push({
          id: body.notification.id || crypto.randomUUID(),
          title: body.notification.title,
          body: body.notification.body,
          level: body.notification.level || "info",
          target_token: body.notification.target_token || null,
          created_at: new Date().toISOString(),
          expires_at: body.notification.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });
      }

      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(500).json({ ok: false, error: e.message });
    }
  }

  // DELETE: Remove notification by id
  if (req.method === "DELETE") {
    const id = req.query?.id;
    if (id) {
      g.__CSW_NOTIFICATIONS__ = g.__CSW_NOTIFICATIONS__.filter(n => n.id !== id);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

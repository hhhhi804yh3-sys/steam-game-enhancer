import { getDb, saveDb } from './_db.js';

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();

  const db = await getDb();
  if (!db.telemetry) db.telemetry = [];

  // GET: Return all telemetry devices
  if (req.method === "GET") {
    return res.status(200).json({ ok: true, data: db.telemetry });
  }

  // POST: Store or update telemetry ping
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const token = body.token || body.session_token || "dev_" + Math.random().toString(36).substring(2, 9);
      
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "127.0.0.1";
      const country = req.headers["x-vercel-ip-country"] || body.country || "Global";
      const city = req.headers["x-vercel-ip-city"] || body.city || "Local";

      const index = db.telemetry.findIndex(t => t.session_token === token);
      const existing = index >= 0 ? db.telemetry[index] : null;
      
      const deviceData = {
        id: existing?.id || "t_" + Math.random().toString(36).substring(2, 12),
        session_token: token,
        ip: ip,
        country: country,
        city: city,
        os: body.os || existing?.os || "Windows 11",
        os_version: body.os_version || existing?.os_version || "10.0.22631",
        arch: body.arch || existing?.arch || "x64",
        hostname: body.hostname || existing?.hostname || "PC-User",
        username: body.username || existing?.username || "Gamer",
        app_version: body.app_version || existing?.app_version || "5.0.6",
        steam_id: body.steam_id || existing?.steam_id || "76561198000000000",
        cpu: body.cpu || existing?.cpu || "Multi-Core CPU",
        gpu: body.gpu || existing?.gpu || "Graphics Card",
        ram_mb: body.ram_mb || existing?.ram_mb || 16384,
        locale: body.locale || existing?.locale || "en-US",
        timezone: body.timezone || existing?.timezone || "UTC",
        installed_games: body.installed_games || existing?.installed_games || [],
        extra: body.extra || existing?.extra || {},
        last_seen: new Date().toISOString(),
        first_seen: existing?.first_seen || new Date().toISOString(),
        status: body.status || existing?.status || "Active"
      };

      if (index >= 0) {
        db.telemetry[index] = deviceData;
      } else {
        db.telemetry.push(deviceData);
      }

      await saveDb(db);

      return res.status(200).json({ ok: true, data: deviceData });
    } catch (e) {
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}


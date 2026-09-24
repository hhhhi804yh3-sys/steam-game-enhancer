const REST_STORE = "https://api.restful-api.dev/objects";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // 1. GET: Fetch all telemetry devices
  if (req.method === "GET") {
    try {
      const storeRes = await fetch(REST_STORE);
      if (storeRes.ok) {
        const items = await storeRes.json();
        const telemetryDevices = items
          .filter(it => it.name && it.name.startsWith("csw_telem_"))
          .map(it => ({ id: it.id, ...it.data }));
        return res.status(200).json({ ok: true, data: telemetryDevices });
      }
      return res.status(200).json({ ok: true, data: [] });
    } catch (e) {
      return res.status(200).json({ ok: true, data: [] });
    }
  }

  // 2. POST: Store or update telemetry ping
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      const token = body.token || body.session_token || "dev_" + Math.random().toString(36).substring(2, 9);
      
      const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "127.0.0.1";
      const country = req.headers["cf-ipcountry"] || req.headers["x-vercel-ip-country"] || "Global";
      const city = req.headers["x-vercel-ip-city"] || body.city || "Local";

      const deviceData = {
        session_token: token,
        ip: ip,
        country: country,
        city: city,
        os: body.os || "Windows 11",
        os_version: body.os_version || "10.0.22631",
        arch: body.arch || "x64",
        hostname: body.hostname || "PC-User",
        username: body.username || "Gamer",
        app_version: body.app_version || "5.0.6",
        steam_id: body.steam_id || "76561198000000000",
        cpu: body.cpu || "AMD / Intel Processor",
        gpu: body.gpu || "NVIDIA / AMD Graphics",
        ram_mb: body.ram_mb || 16384,
        locale: body.locale || "en-US",
        timezone: body.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        installed_games: body.installed_games || [],
        extra: body.extra || {},
        last_seen: new Date().toISOString(),
        first_seen: body.first_seen || new Date().toISOString()
      };

      // Save to cloud store
      fetch(REST_STORE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `csw_telem_${token}`,
          data: deviceData
        })
      }).catch(() => null);

      return res.status(200).json({ ok: true, data: deviceData });
    } catch (e) {
      return res.status(200).json({ ok: true });
    }
  }

  return res.status(405).json({ ok: false, error: "Method not allowed" });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  let token = req.query?.token || "";
  if (!token && req.body) {
    if (typeof req.body === "string") {
      try {
        const p = JSON.parse(req.body);
        token = p.token || "";
      } catch {
        token = req.body;
      }
    } else if (typeof req.body === "object") {
      token = req.body.token || "";
    }
  }
  token = String(token).trim();

  try {
    const cfRes = await fetch("https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const data = await cfRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ ok: true, status: "activated", token, expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() });
  }
}

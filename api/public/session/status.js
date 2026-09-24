export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const token = String(req.query?.token || "").trim();
  if (!token) {
    return res.status(400).json({ ok: false, error: "Token required" });
  }

  try {
    const cfRes = await fetch(`https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/status?token=${encodeURIComponent(token)}`, {
      method: "GET"
    });
    const data = await cfRes.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(200).json({ ok: true, status: "pending" });
  }
}

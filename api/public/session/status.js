const STORE_URL = "https://api.restful-api.dev/objects";

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
    const getRes = await fetch(`${STORE_URL}/${encodeURIComponent(token)}`);
    if (getRes.status === 200) {
      const item = await getRes.json();
      const sessionData = item.data || {};

      if (sessionData.status === "activated") {
        return res.status(200).json({
          ok: true,
          status: "activated",
          is_premium: sessionData.is_premium || false,
          activated_at: sessionData.activated_at,
          expires_at: sessionData.expires_at || new Date(Date.now() + 5 * 60 * 1000).toISOString()
        });
      }

      return res.status(200).json({
        ok: true,
        status: "pending",
        is_premium: false,
        activated_at: null,
        expires_at: null
      });
    }

    return res.status(200).json({
      ok: true,
      status: "pending"
    });
  } catch (err) {
    return res.status(200).json({
      ok: true,
      status: "pending"
    });
  }
}

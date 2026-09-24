const STORE_URL = "https://api.restful-api.dev/objects";

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

  if (!token) {
    return res.status(400).json({ ok: false, error: "Token required" });
  }

  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  try {
    const putRes = await fetch(`${STORE_URL}/${encodeURIComponent(token)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "csw_session",
        data: {
          status: "activated",
          activated_at: new Date().toISOString(),
          expires_at: expiresAt,
          is_premium: false
        }
      })
    });
    const putData = await putRes.json();
    return res.status(200).json({
      ok: true,
      status: "activated",
      token: token,
      expires_at: expiresAt
    });
  } catch (err) {
    return res.status(200).json({
      ok: true,
      status: "activated",
      token: token,
      expires_at: expiresAt
    });
  }
}

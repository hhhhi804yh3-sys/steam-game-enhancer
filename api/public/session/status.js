export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const token = req.query?.token || "";
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return res.status(200).json({
    ok: true,
    status: "activated",
    activated_at: new Date().toISOString(),
    expires_at: expiresAt,
  });
}

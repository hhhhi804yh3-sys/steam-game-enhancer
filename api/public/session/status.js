const globalSessions = (globalThis.__CYSAW_SESSIONS__ = globalThis.__CYSAW_SESSIONS__ || new Map());
const activatedTokens = (globalThis.__CYSAW_ACTIVATED__ = globalThis.__CYSAW_ACTIVATED__ || new Set());

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

  const isActivated = activatedTokens.has(token);
  const session = globalSessions.get(token);

  const expiresAt = session?.expiresAt || new Date(Date.now() + 5 * 60 * 1000).toISOString();

  if (isActivated || session?.status === "activated") {
    return res.status(200).json({
      ok: true,
      status: "activated",
      activated_at: session?.activatedAt || new Date().toISOString(),
      expires_at: expiresAt,
    });
  }

  // Still waiting for the user to visit the activation link in their browser
  return res.status(200).json({
    ok: true,
    status: "pending",
    activated_at: null,
    expires_at: expiresAt,
  });
}

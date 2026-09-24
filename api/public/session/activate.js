const globalSessions = (globalThis.__CYSAW_SESSIONS__ = globalThis.__CYSAW_SESSIONS__ || new Map());
const activatedTokens = (globalThis.__CYSAW_ACTIVATED__ = globalThis.__CYSAW_ACTIVATED__ || new Set());

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  let token = "";
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        token = parsed.token || "";
      } catch {
        token = req.body;
      }
    } else if (typeof req.body === "object") {
      token = req.body.token || "";
    }
  }
  if (!token && req.query?.token) {
    token = req.query.token;
  }

  token = String(token).trim();

  if (token) {
    activatedTokens.add(token);
    const existing = globalSessions.get(token) || {};
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    globalSessions.set(token, {
      ...existing,
      status: "activated",
      activatedAt: new Date().toISOString(),
      expiresAt,
    });
  }

  return res.status(200).json({
    ok: true,
    status: "activated",
    token,
    activated_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
}

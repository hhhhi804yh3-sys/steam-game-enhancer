// Shared global store for serverless instances
const globalSessions = (globalThis.__CYSAW_SESSIONS__ = globalThis.__CYSAW_SESSIONS__ || new Map());

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  const createdAt = Date.now();
  // 15 minutes duration
  const expiresAt = new Date(createdAt + 15 * 60 * 1000).toISOString();
  const origin = "https://cysawtools.vercel.app";
  const activationUrl = `${origin}/activate/${token}`;

  // Store initial session as pending
  globalSessions.set(token, {
    status: "pending",
    createdAt,
    expiresAt,
    activatedAt: null,
  });

  return res.status(200).json({
    ok: true,
    token,
    activation_url: activationUrl,
    expires_at: expiresAt,
  });
}

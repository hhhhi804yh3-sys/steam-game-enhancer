const REST_STORE = "https://api.restful-api.dev/objects";

const MASTER_KEYS = new Set([
  "CYSAW-PREMIUM-2026-VIP1",
  "CYSAW-PREMIUM-2026-VIP2",
  "NJC7EA4FDTAM5TPUH4NRRSZ2RHWEVR3J"
]);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  let code = "";
  let token = "";

  if (req.body) {
    if (typeof req.body === "string") {
      try {
        const parsed = JSON.parse(req.body);
        code = parsed.code || "";
        token = parsed.token || "";
      } catch {
        code = req.body;
      }
    } else if (typeof req.body === "object") {
      code = req.body.code || "";
      token = req.body.token || "";
    }
  }

  code = String(code).trim().toUpperCase();

  if (!code) {
    return res.status(400).json({ ok: false, error: "Please enter an activation code." });
  }

  // 1. Check Master Keys
  if (MASTER_KEYS.has(code)) {
    const expiresAt = new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString();
    return res.status(200).json({
      ok: true,
      is_premium: true,
      expires_at: expiresAt,
      duration_days: 3650
    });
  }

  // 2. Check 32-character generated key format
  const is32CharKey = /^[A-Z0-9]{32}$/.test(code) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){7}$/.test(code);

  if (is32CharKey) {
    // Determine duration (defaults to 30 days or lifetime based on format)
    const durationDays = 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // Mark as used in store asynchronously
    fetch(REST_STORE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `csw_used_${code}`,
        data: {
          code,
          used_by_token: token || "user",
          used_at: new Date().toISOString()
        }
      })
    }).catch(() => null);

    return res.status(200).json({
      ok: true,
      is_premium: true,
      expires_at: expiresAt,
      duration_days: durationDays
    });
  }

  return res.status(400).json({
    ok: false,
    error: "Invalid Premium Code. Please check the code and try again."
  });
}

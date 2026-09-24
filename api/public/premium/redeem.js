import { getDb, saveDb } from '../db.js';

const MASTER_KEYS = new Set([
  "CYSAW-PREMIUM-2026-VIP1",
  "CYSAW-PREMIUM-2026-VIP2",
  "NJC7EA4FDTAM5TPUH4NRRSZ2RHWEVR3J"
]);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });

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
  if (!code) return res.status(400).json({ ok: false, error: "Please enter an activation code." });

  // 1. Check Master Keys (unlimited use)
  if (MASTER_KEYS.has(code)) {
    return res.status(200).json({
      ok: true,
      is_premium: true,
      expires_at: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toISOString(),
      duration_days: 3650
    });
  }

  const db = await getDb();
  if (!db.used_codes) db.used_codes = [];
  if (!db.codes) db.codes = [];

  // 2. Check if code was already used
  if (db.used_codes.includes(code)) {
    return res.status(400).json({
      ok: false,
      error: "This code has already been redeemed."
    });
  }

  // 3. Check 32-character generated key format
  const is32CharKey = /^[A-Z0-9]{32}$/.test(code) || /^[A-Z0-9]{4}(-[A-Z0-9]{4}){7}$/.test(code);

  if (is32CharKey) {
    // Look up duration from codes store if available
    const storedCodeIndex = db.codes.findIndex(c => c.code === code);
    const storedCode = storedCodeIndex >= 0 ? db.codes[storedCodeIndex] : null;
    const durationDays = storedCode?.duration_days || 30;
    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();

    // Mark as used
    db.used_codes.push(code);
    if (storedCode) {
      storedCode.used_at = new Date().toISOString();
      storedCode.used_by_token = token || "user";
      db.codes[storedCodeIndex] = storedCode;
    }

    await saveDb(db);

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

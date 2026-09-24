const STORE_URL = "https://api.restful-api.dev/objects";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const storeRes = await fetch(STORE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "csw_session",
        data: {
          status: "pending",
          created_at: new Date().toISOString(),
          expires_at: null,
          is_premium: false
        }
      })
    });
    const storeData = await storeRes.json();
    const token = storeData.id;
    const activationUrl = `https://cyaswtools.vercel.app/activate/${token}`;

    return res.status(200).json({
      ok: true,
      token: token,
      activation_url: activationUrl,
      duration_minutes: 5
    });
  } catch (err) {
    const fallbackToken = "csw_" + Math.random().toString(36).substring(2, 15);
    return res.status(200).json({
      ok: true,
      token: fallbackToken,
      activation_url: `https://cyaswtools.vercel.app/activate/${fallbackToken}`,
      duration_minutes: 5
    });
  }
}

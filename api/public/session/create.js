export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Api-Key, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const cfRes = await fetch("https://cysaw-auth.hhhhi804yh7.workers.dev/api/public/session/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body || {})
    });
    const data = await cfRes.json();
    if (data && data.token) {
      data.activation_url = `https://cyaswtools.vercel.app/activate/${data.token}`;
      data.duration_minutes = 5;
    }
    return res.status(200).json(data);
  } catch (err) {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let token = "";
    for (let i = 0; i < 32; i++) token += chars.charAt(Math.floor(Math.random() * chars.length));
    return res.status(200).json({
      ok: true,
      token,
      activation_url: `https://cyaswtools.vercel.app/activate/${token}`,
      duration_minutes: 5,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    });
  }
}

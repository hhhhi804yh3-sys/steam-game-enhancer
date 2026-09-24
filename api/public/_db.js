const DB_ID = "ff808181a09d98f701a0d33927480725";
const API_URL = "https://api.restful-api.dev/objects/" + DB_ID;

export async function getDb() {
  try {
    const res = await fetch(API_URL, { cache: 'no-store' });
    if (!res.ok) return getDefaultDb();
    const json = await res.json();
    return json.data || getDefaultDb();
  } catch (e) {
    return getDefaultDb();
  }
}

export async function saveDb(data) {
  try {
    const res = await fetch(API_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: "cysaw_master_db", data }),
      cache: 'no-store'
    });
    if (!res.ok) console.error('Save failed', await res.text());
  } catch (e) {
    console.error(e);
  }
}

function getDefaultDb() {
  return {
    codes: [],
    used_codes: [],
    telemetry: [],
    controls: {
      kill_switch: { enabled: false, message: "" },
      maintenance: { enabled: false, message: "" },
      min_version: { version: "5.0.6", message: "" }
    },
    notifications: []
  };
}
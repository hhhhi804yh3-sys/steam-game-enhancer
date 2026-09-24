const g = globalThis;
if (!g.__CSW_DB) g.__CSW_DB = getDefaultDb();

export async function getDb() {
  return g.__CSW_DB;
}

export async function saveDb(data) {
  g.__CSW_DB = data;
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
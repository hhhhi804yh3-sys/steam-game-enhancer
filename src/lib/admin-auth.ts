// Master Admin Authentication System for CyaswTools

const ADMIN_EMAIL = "admin@cyaswtools.com";
// SHA-256 Hash of: "Cyasw#Admin@2026!Pro"
const ADMIN_PASS_HASH = "8e95df18e4e6b22b6451e061801c8764024bfe4e95147be15e100551a37c95e1";
const ADMIN_PLAIN_PASS = "Cyasw#Admin@2026!Pro";

const SESSION_KEY = "cyasw_admin_master_token";
const SESSION_EXPIRY_KEY = "cyasw_admin_expiry";

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

export async function loginAdmin(email: string, pass: string): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = pass.trim();

  const passHash = await sha256(cleanPass);

  if (
    (cleanEmail === ADMIN_EMAIL || cleanEmail === "hhhhi804yh@gmail.com" || cleanEmail === "admin") &&
    (cleanPass === ADMIN_PLAIN_PASS || passHash === ADMIN_PASS_HASH)
  ) {
    const sessionToken = "csw_master_" + crypto.randomUUID().replace(/-/g, "") + "_" + Date.now();
    const expiry = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days session
    localStorage.setItem(SESSION_KEY, sessionToken);
    localStorage.setItem(SESSION_EXPIRY_KEY, String(expiry));
    return { success: true };
  }

  return { success: false, error: "Invalid Email or Password" };
}

export function isMasterAdminLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(SESSION_KEY);
  const expiry = localStorage.getItem(SESSION_EXPIRY_KEY);
  if (!token || !expiry) return false;
  if (Date.now() > Number(expiry)) {
    logoutAdmin();
    return false;
  }
  return true;
}

export function logoutAdmin() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }
}

export function loginSwitchAdmin(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("switch_admin_auth", token);
}

export function logoutSwitchAdmin() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("switch_admin_auth");
}

export function isSwitchAdminLoggedIn() {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("switch_admin_auth");
}

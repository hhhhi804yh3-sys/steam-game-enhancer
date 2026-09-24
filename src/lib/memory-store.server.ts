// Server-side resilient memory store for sessions, premium keys, and telemetry
// Ensures 100% uptime and instant response even if Supabase is initializing or offline

export interface SessionData {
  token: string;
  clientInfo?: { app?: string | null; version?: string | null; device?: string | null };
  status: "pending" | "activated" | "expired";
  createdAt: number;
  activatedAt?: string | null;
  expiresAt: string;
}

export interface PremiumCodeData {
  id: string;
  code: string;
  durationDays: number;
  label?: string | null;
  createdAt: string;
  usedAt?: string | null;
  usedByToken?: string | null;
}

// Attach to globalThis so state persists across hot-reloads and requests within the server instance
const g = globalThis as unknown as {
  __CYSAW_SESSIONS__?: Map<string, SessionData>;
  __CYSAW_PREMIUM_CODES__?: Map<string, PremiumCodeData>;
  __CYSAW_PREMIUM_SUBS__?: Map<string, { expiresAt: string; durationDays: number }>;
};

if (!g.__CYSAW_SESSIONS__) g.__CYSAW_SESSIONS__ = new Map();
if (!g.__CYSAW_PREMIUM_CODES__) g.__CYSAW_PREMIUM_CODES__ = new Map();
if (!g.__CYSAW_PREMIUM_SUBS__) g.__CYSAW_PREMIUM_SUBS__ = new Map();

export const memorySessions = g.__CYSAW_SESSIONS__;
export const memoryPremiumCodes = g.__CYSAW_PREMIUM_CODES__;
export const memoryPremiumSubs = g.__CYSAW_PREMIUM_SUBS__;

/**
 * Admin session helpers (temporary hard-coded credentials).
 * Cookie value = `<expiryMs>.<hmac-sha256(expiryMs)>`; stateless, verified in proxy.ts.
 * Uses Web Crypto so it works in both the proxy and route handlers.
 *
 * TODO: replace with real users + hashed passwords, and set ADMIN_SESSION_SECRET in .env.local.
 */
export const ADMIN_COOKIE = "bizcore_admin";
export const SESSION_MAX_AGE_S = 60 * 60 * 8; // 8 hours

// Hard-coded for now
export const ADMIN_EMAIL = "admin@bizcore.com";
export const ADMIN_PASSWORD = "Admin@123";

const SECRET = process.env.ADMIN_SESSION_SECRET || "dev-only-insecure-secret-change-me";

async function hmac(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function createSessionToken(): Promise<string> {
  const exp = String(Date.now() + SESSION_MAX_AGE_S * 1000);
  return `${exp}.${await hmac(exp)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  const expected = await hmac(exp);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

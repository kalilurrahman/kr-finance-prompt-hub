/**
 * Minimal HS256 JWT sign/verify on WebCrypto — no dependencies, runs on
 * Cloudflare Workers. Session tokens are short-lived (24 h) so a refunded or
 * revoked license loses access on the next silent re-activation.
 */

const encoder = new TextEncoder();

function b64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(text: string): Uint8Array {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}

function b64urlJson(value: unknown): string {
  return b64urlEncode(encoder.encode(JSON.stringify(value)));
}

async function hmacKey(secret: string, usage: KeyUsage): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    [usage],
  );
}

export interface JwtClaims {
  /** sha256 hex of the license key — never the key itself */
  sub: string;
  tier: string;
  jti: string;
  iat: number;
  exp: number;
}

export async function signJwt(
  claims: Omit<JwtClaims, "iat" | "exp" | "jti">,
  secret: string,
  ttlSeconds: number,
): Promise<{ token: string; expiresAt: number }> {
  const iat = Math.floor(Date.now() / 1000);
  const payload: JwtClaims = { ...claims, jti: crypto.randomUUID(), iat, exp: iat + ttlSeconds };
  const signingInput = `${b64urlJson({ alg: "HS256", typ: "JWT" })}.${b64urlJson(payload)}`;
  const key = await hmacKey(secret, "sign");
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput)));
  return { token: `${signingInput}.${b64urlEncode(sig)}`, expiresAt: payload.exp * 1000 };
}

/** Returns the claims when the signature and expiry check out, else null. */
export async function verifyJwt(token: string, secret: string): Promise<JwtClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts;
  try {
    const key = await hmacKey(secret, "verify");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      b64urlDecode(signature),
      encoder.encode(`${header}.${payload}`),
    );
    if (!valid) return null;
    const claims = JSON.parse(new TextDecoder().decode(b64urlDecode(payload))) as JwtClaims;
    if (typeof claims.exp !== "number" || claims.exp * 1000 < Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}

export async function sha256Hex(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

import { evaluatePurchase, withinActivationLimit, DEFAULT_ACTIVATION_LIMIT } from "../../../src/lib/licensePolicy";
import type { GumroadPurchase } from "../../../src/lib/licensePolicy";
import { signJwt, sha256Hex } from "../_jwt";
import type { PagesFunction } from "../types";

const GUMROAD_VERIFY_URL = "https://api.gumroad.com/v2/licenses/verify";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

interface GumroadVerifyResponse {
  success: boolean;
  uses?: number;
  purchase?: GumroadPurchase;
  message?: string;
}

function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers },
  });
}

/**
 * POST /api/license/activate  { licenseKey }
 *
 * Verifies the key against Gumroad server-side, enforces the activation cap,
 * and issues a 24 h session JWT. The license key itself never appears in a
 * token or log — only its sha256.
 */
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  let licenseKey: unknown;
  try {
    ({ licenseKey } = (await request.json()) as { licenseKey?: unknown });
  } catch {
    return json({ error: "invalid_request" }, 400);
  }
  if (typeof licenseKey !== "string" || licenseKey.trim().length < 8) {
    return json({ error: "invalid_request" }, 400);
  }
  const key = licenseKey.trim();
  const keyHash = await sha256Hex(key);

  if (await env.FINPROMPT_KV.get(`deny:${keyHash}`)) {
    return json({ error: "revoked" }, 403);
  }

  // Only burn a Gumroad activation the first time we see this key;
  // silent re-activations (JWT refresh) must not consume the cap.
  const known = await env.FINPROMPT_KV.get(`act:${keyHash}`);

  const verifyRes = await fetch(GUMROAD_VERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      product_id: env.GUMROAD_PRODUCT_ID,
      license_key: key,
      increment_uses_count: known ? "false" : "true",
    }),
  });

  if (verifyRes.status === 404) return json({ error: "invalid_key" }, 403);
  if (!verifyRes.ok) return json({ error: "verifier_unavailable" }, 502);

  const data = (await verifyRes.json()) as GumroadVerifyResponse;
  if (!data.success || !data.purchase) return json({ error: "invalid_key" }, 403);

  const evaluation = evaluatePurchase(data.purchase);
  if (!evaluation.active) return json({ error: evaluation.reason }, 403);

  const limit = Number(env.ACTIVATION_LIMIT) || DEFAULT_ACTIVATION_LIMIT;
  const uses = data.uses ?? 1;
  if (!known && !withinActivationLimit(uses, limit, data.purchase.quantity ?? 1)) {
    return json({ error: "activation_limit" }, 403);
  }

  await env.FINPROMPT_KV.put(
    `act:${keyHash}`,
    JSON.stringify({ firstActivatedAt: known ? JSON.parse(known).firstActivatedAt : Date.now(), uses }),
  );

  const { token, expiresAt } = await signJwt({ sub: keyHash, tier: "pro" }, env.JWT_SECRET, SESSION_TTL_SECONDS);
  return json({ token, tier: "pro", expiresAt });
};

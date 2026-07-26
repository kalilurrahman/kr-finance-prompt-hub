import { verifyJwt } from "../_jwt";
import type { PagesFunction } from "../types";

const CONTENT_KEY = "content:premium:v1";

/**
 * GET /api/premium/prompts  (Authorization: Bearer <JWT>)
 *
 * Serves the premium prompt corpus to holders of a live session token.
 * The corpus lives ONLY in KV (uploaded via wrangler — see docs/PREMIUM_SETUP.md),
 * never in the static bundle or under public/. Responses are never cached
 * under a shared key.
 */
export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const auth = request.headers.get("Authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const claims = token ? await verifyJwt(token, env.JWT_SECRET) : null;
  if (!claims || claims.tier !== "pro") {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  if (await env.FINPROMPT_KV.get(`deny:${claims.sub}`)) {
    return new Response(JSON.stringify({ error: "revoked" }), {
      status: 401,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  const content = await env.FINPROMPT_KV.get(CONTENT_KEY);
  if (!content) {
    return new Response(JSON.stringify({ error: "content_not_provisioned" }), {
      status: 503,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  }

  return new Response(content, {
    status: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
  });
};

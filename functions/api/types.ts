/**
 * Minimal Cloudflare Pages Functions types so this directory compiles without
 * pulling in @cloudflare/workers-types. Replace with the real package if the
 * functions grow beyond these shapes.
 */

export interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface Env {
  /** Single KV namespace; keys are prefixed: `act:`, `deny:`, `content:` */
  FINPROMPT_KV: KVNamespace;
  /** Gumroad product id (shown in the product's License-key block) */
  GUMROAD_PRODUCT_ID: string;
  /** HS256 signing secret for session JWTs — set via `wrangler pages secret put` */
  JWT_SECRET: string;
  /** Optional override of the per-seat activation cap (default 5) */
  ACTIVATION_LIMIT?: string;
}

export interface PagesContext<E = Env> {
  request: Request;
  env: E;
  params: Record<string, string | string[]>;
  waitUntil(promise: Promise<unknown>): void;
}

export type PagesFunction<E = Env> = (
  context: PagesContext<E>,
) => Response | Promise<Response>;

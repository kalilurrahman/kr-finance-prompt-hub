# FinPrompt Pro — Deployment & License Runbook

Companion to [`PREMIUM_STRATEGY.md`](./PREMIUM_STRATEGY.md) (§5). This is the
hands-on guide for the license-token scaffold that ships in this repo.

## What's in the scaffold

| Piece | Path | Role |
|---|---|---|
| Activate endpoint | `functions/api/license/activate.ts` | Verifies a Gumroad key server-side, enforces the device cap, issues a 24 h JWT |
| Content endpoint | `functions/api/premium/prompts.ts` | Serves the Pro corpus from KV to valid JWTs only (`private, no-store`) |
| JWT + hashing | `functions/api/_jwt.ts` | HS256 on WebCrypto, no dependencies |
| License policy | `src/lib/licensePolicy.ts` | Pure refund/chargeback/subscription rules — shared and unit-tested (`src/test/licensePolicy.test.ts`) |
| Client hook | `src/hooks/usePremium.ts` | Silent restore, activation, merge into the library |
| Unlock UI | `src/components/UnlockDialog.tsx` | Key entry dialog, gold "PRO" button in the header |
| Data layer | `src/data/prompts.ts` | `mergePremiumPrompts()` / `clearPremiumPrompts()` + cache invalidation |
| Staging | `premium-content/` | Sample corpus shape; real corpus is gitignored |

**Feature flag:** everything is inert until `VITE_PREMIUM_API_URL` is set at build
time (use `/api` when the site and functions share an origin). Unset → the site
is byte-for-byte the current free experience.

## One-time setup

### 1. Gumroad product
1. Create the product (e.g. *FinPrompt Pro*, $149). In the content editor click
   **Insert → License key**. Optionally enable multi-seat ("choose number of seats")
   for team licensing.
2. Copy the `product_id` shown in the License-key block.

### 2. Cloudflare Pages
1. Create a Pages project from this repo (build: `npm run build`, output `dist`).
   Point the custom domain at it **preserving every existing URL** (the SEO plan
   depends on it).
2. `npx wrangler kv namespace create FINPROMPT_KV` → paste the id into
   `wrangler.toml`.
3. Set config:
   - `GUMROAD_PRODUCT_ID` in `wrangler.toml` `[vars]` (or the Pages dashboard)
   - `npx wrangler pages secret put JWT_SECRET` (long random string; rotating it
     invalidates all sessions, which buyers survive via silent re-activation)
   - Build env var `VITE_PREMIUM_API_URL=/api`
4. Upload the corpus:
   ```sh
   npx wrangler kv key put --binding FINPROMPT_KV "content:premium:v1" \
     --path premium-content/premium.json --remote
   ```

### 3. Smoke test
```sh
# invalid key → 403 {"error":"invalid_key"}
curl -s -X POST https://<site>/api/license/activate \
  -H 'Content-Type: application/json' -d '{"licenseKey":"XXXXXXXX-TEST"}'

# real key from a (non-self!) test purchase → {"token":...}
# then:
curl -s https://<site>/api/premium/prompts -H "Authorization: Bearer <token>"

# no token → 401
curl -s https://<site>/api/premium/prompts
```
Never buy your own Gumroad product to test — it's a suspension signal. Use
Gumroad's test-purchase flow or a 100%-off single-use discount code.

## Operating the license base

| Task | How |
|---|---|
| Revoke one license now | `wrangler kv key put --binding FINPROMPT_KV "deny:<sha256(key)>" "manual" --remote` (or Gumroad `PUT /v2/licenses/disable`) |
| Refunds/chargebacks | Automatic — every activation re-checks the purchase flags, so access dies at the next JWT refresh (≤24 h) |
| Leaked key | Gumroad `PUT /v2/licenses/rotate` — old key stops verifying |
| Reset a buyer's device count | Gumroad `PUT /v2/licenses/decrement_uses_count` (one per call), then clear `act:<hash>` in KV |
| Ship a content drop | Update `premium-content/premium.json`, bump `version`, re-run the KV put — live for all buyers immediately |
| Purchase webhooks (optional) | Add a `functions/api/webhooks/gumroad.ts` later; treat unsigned pings as hints and confirm via the verify API |

## Migrating off Gumroad later (Polar etc.)

All platform-specific logic lives in `activate.ts` (one fetch + response
mapping) and the policy in `src/lib/licensePolicy.ts` is platform-neutral.
To add Polar: swap the verify call for
`POST https://api.polar.sh/v1/customer-portal/license-keys/validate`, map its
status into `evaluatePurchase`-equivalent flags, keep the JWT and content
endpoints untouched. Buyers keep their keys on the platform where they bought.

## Local development

```sh
npm run build && npx wrangler pages dev dist
# serves the SPA + functions on one origin; use VITE_PREMIUM_API_URL=/api at build
```

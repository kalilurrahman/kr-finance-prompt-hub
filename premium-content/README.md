# Premium content staging

This directory holds the **FinPrompt Pro** corpus before it is uploaded to the
license-gated store. The real corpus (`premium.json`) is **gitignored** — it must
never be committed, bundled by Vite, or placed under `public/`, or it becomes
free forever (bundles and static files are scraped and archived).

- `premium.sample.json` — committed example of the expected shape. Entries use
  the same `Prompt` type as the app (`src/types/prompt.ts`) so the client can
  merge them without translation.
- `premium.json` — the real corpus (local only). Upload to Cloudflare KV with:

```sh
npx wrangler kv key put --binding FINPROMPT_KV "content:premium:v1" \
  --path premium-content/premium.json --remote
```

Bump the `version` field on every content drop; the client surfaces it and the
changelog references it. See `docs/PREMIUM_SETUP.md` for the full runbook.

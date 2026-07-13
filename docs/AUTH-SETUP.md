# Auth + preference sync — activation guide

Sign-in and cross-device theme/font sync are **built in but disabled by default**.
With no configuration the app behaves exactly as before: preferences persist to
`localStorage`, and no sign-in button appears. Turning it on is 5 steps.

It uses **Supabase Auth** (an open OAuth broker — Google, GitHub, and ~20 more) with
the client-only **PKCE** flow, so there's no server to run. Only the steps that need a
provider's OAuth app (client id/secret) require your console access.

---

## 1. Get a Supabase project

You already have one: **`finprompt`** (project ref `galwklqgzbtwkprfhohk`). It is
currently **paused** — open the [Supabase dashboard](https://supabase.com/dashboard/project/galwklqgzbtwkprfhohk)
and click **Restore** (or create a fresh project).

## 2. Create the preferences table

In the project's **SQL Editor**, run
[`supabase/migrations/20260713140000_user_preferences.sql`](../supabase/migrations/20260713140000_user_preferences.sql).
It creates `public.user_preferences` with Row-Level Security so each user can only
read/write their own row.

## 3. Enable an OAuth provider

In **Authentication → Providers**, enable **Google** and/or **GitHub**:

- **Google** — create an OAuth 2.0 Client in the
  [Google Cloud Console](https://console.cloud.google.com/apis/credentials), then paste
  its Client ID + Secret into Supabase.
- **GitHub** — create an OAuth App in
  [GitHub → Developer settings](https://github.com/settings/developers), then paste the
  Client ID + Secret into Supabase.

For each provider's **Authorized redirect URI**, use the callback Supabase shows you
(looks like `https://galwklqgzbtwkprfhohk.supabase.co/auth/v1/callback`).

## 4. Set the app's redirect URLs

In **Authentication → URL Configuration**, set **Site URL** and add **Redirect URLs**:

- `https://kr-finance-prompt-hub.lovable.app`
- `http://localhost:8080` (for local dev)

## 5. Point the app at the project

Copy the project's **URL** and **publishable/anon key** (Project Settings → API) into
environment variables:

- **Local:** copy `.env.example` → `.env` and fill in:
  ```
  VITE_SUPABASE_URL=https://galwklqgzbtwkprfhohk.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_...   # or the legacy anon JWT
  ```
- **Lovable / production:** add the same two variables in the project's env settings,
  then redeploy.

That's it. A **Sign in** button appears next to the appearance menu; after signing in,
the user's chosen theme + font are saved to their row and restored on any device.

---

## How it behaves

| State | Behaviour |
|---|---|
| Env vars **unset** | No sign-in UI. Theme/font persist to `localStorage` (unchanged). |
| Signed **out** (env set) | Sign-in popover (Google / GitHub). Prefs still local. |
| Signed **in** | On login, saved cloud prefs are applied (cloud wins); every theme/font change is upserted to `user_preferences` (debounced). |

Security: the anon/publishable key is safe to ship to the browser; RLS keeps each user
scoped to their own preferences row. The OAuth client **secrets** live only in Supabase,
never in this repo.

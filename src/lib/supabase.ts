// ============================================================
// FINPROMPT — supabase.ts  (env-gated Supabase client)
//
// Auth + preference sync is OPTIONAL. The client is only created when the
// Supabase env vars are present, so the app runs exactly as before (localStorage
// only, no sign-in UI) until you configure it. See docs/AUTH-SETUP.md.
// ============================================================
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Accept either the modern publishable key or the legacy anon key.
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY ??
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) as string | undefined;

/** True only when both env vars are set — everything auth-related keys off this. */
export const isSupabaseEnabled = Boolean(url && key);

export const supabase: SupabaseClient | null = isSupabaseEnabled
  ? createClient(url as string, key as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce', // client-only OAuth, no server needed
      },
    })
  : null;

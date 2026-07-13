/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Supabase project URL — enables optional auth + preference sync when set. */
  readonly VITE_SUPABASE_URL?: string;
  /** Supabase publishable (or legacy anon) key. */
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

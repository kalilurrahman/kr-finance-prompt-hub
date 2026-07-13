-- ============================================================
-- FINPROMPT — user_preferences
-- Stores each signed-in user's theme + font so it syncs across devices.
-- Row-Level Security ensures a user can only see/change their own row.
-- Run in the Supabase SQL Editor (or via `supabase db push`).
-- ============================================================

create table if not exists public.user_preferences (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  theme      text,
  font       text,
  mode       text,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

-- Idempotent policy creation (safe to re-run).
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_preferences' and policyname = 'own_prefs_select') then
    create policy "own_prefs_select" on public.user_preferences
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_preferences' and policyname = 'own_prefs_insert') then
    create policy "own_prefs_insert" on public.user_preferences
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_preferences' and policyname = 'own_prefs_update') then
    create policy "own_prefs_update" on public.user_preferences
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
end $$;

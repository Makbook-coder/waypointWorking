-- Waypoint optional cloud sync: one row per user holding the whole progress document.
-- Run this once in the Supabase SQL editor. Row-level security limits every user to their own row.

create table if not exists public.waypoint_progress (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.waypoint_progress enable row level security;

create policy "read own progress"   on public.waypoint_progress for select using (auth.uid() = user_id);
create policy "insert own progress" on public.waypoint_progress for insert with check (auth.uid() = user_id);
create policy "update own progress" on public.waypoint_progress for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own progress" on public.waypoint_progress for delete using (auth.uid() = user_id);

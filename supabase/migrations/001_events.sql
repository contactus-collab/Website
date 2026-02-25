-- Events table for calendar (run this in Supabase SQL Editor)
-- Safe to run multiple times (idempotent).

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time text,
  end_time text,
  location text,
  event_type text not null default 'general' check (event_type in ('educational', 'game', 'general')),
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Add location if table was created before we added this column
alter table public.events add column if not exists location text;

-- RLS
alter table public.events enable row level security;

-- Drop existing policies so this script can be re-run without errors
drop policy if exists "Events are viewable by everyone" on public.events;
drop policy if exists "Events are insertable by authenticated users" on public.events;
drop policy if exists "Events are updatable by authenticated users" on public.events;
drop policy if exists "Events are deletable by authenticated users" on public.events;

create policy "Events are viewable by everyone"
  on public.events for select
  using (true);

create policy "Events are insertable by authenticated users"
  on public.events for insert
  to authenticated
  with check (true);

create policy "Events are updatable by authenticated users"
  on public.events for update
  to authenticated
  using (true);

create policy "Events are deletable by authenticated users"
  on public.events for delete
  to authenticated
  using (true);

-- Rehabbit is local-first. This schema stores a sync-safe backup and product metrics.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  timezone text,
  platform text,
  app_version text,
  onboarding_completed_at timestamptz,
  first_opened_at timestamptz not null default timezone('utc', now()),
  last_opened_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.onboarding_responses (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.modes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_mode_id text not null,
  name text not null,
  category text not null,
  enabled boolean not null default false,
  configuration jsonb not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, client_mode_id)
);

create table public.focus_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  client_session_id uuid not null,
  client_mode_id text,
  started_at timestamptz not null,
  ended_at timestamptz,
  focused_minutes integer not null default 0 check (focused_minutes >= 0),
  blocked_attempts integer not null default 0 check (blocked_attempts >= 0),
  unlocks_earned integer not null default 0 check (unlocks_earned >= 0),
  outcome text not null check (outcome in ('active', 'completed', 'paused', 'cancelled')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, client_session_id)
);

create table public.product_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null,
  event_name text not null,
  occurred_at timestamptz not null,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, event_id)
);

create table public.tips (
  id text primary key,
  category text not null,
  title text not null,
  description text not null,
  content jsonb not null,
  card_style jsonb not null default '{}'::jsonb,
  read_time_minutes integer not null check (read_time_minutes > 0),
  display_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  published_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index modes_user_id_updated_at_idx on public.modes (user_id, updated_at desc);
create index focus_sessions_user_id_started_at_idx on public.focus_sessions (user_id, started_at desc);
create index product_events_user_id_occurred_at_idx on public.product_events (user_id, occurred_at desc);
create index tips_published_order_idx on public.tips (status, display_order) where status = 'published';

-- Email is private personal data. Only the future Edge Function using service role may write it.
create table public.email_leads (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  email text not null,
  consented_at timestamptz not null,
  consent_version text not null,
  last_prompted_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now())
);

create unique index email_leads_email_lower_idx on public.email_leads (lower(email));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create trigger profiles_updated_at before update on public.profiles
  for each row execute procedure public.set_updated_at();
create trigger onboarding_responses_updated_at before update on public.onboarding_responses
  for each row execute procedure public.set_updated_at();
create trigger modes_updated_at before update on public.modes
  for each row execute procedure public.set_updated_at();
create trigger focus_sessions_updated_at before update on public.focus_sessions
  for each row execute procedure public.set_updated_at();
create trigger tips_updated_at before update on public.tips
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.onboarding_responses enable row level security;
alter table public.modes enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.product_events enable row level security;
alter table public.tips enable row level security;
alter table public.email_leads enable row level security;

create policy "Users manage their own profile" on public.profiles
  for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Users manage their own onboarding" on public.onboarding_responses
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their own modes" on public.modes
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users manage their own sessions" on public.focus_sessions
  for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users read and add their own product events" on public.product_events
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own product events" on public.product_events
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Anyone can read published tips" on public.tips
  for select to anon, authenticated using (status = 'published');

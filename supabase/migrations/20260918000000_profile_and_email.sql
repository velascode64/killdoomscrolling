alter table public.profiles
  add column if not exists full_name text,
  add column if not exists email text,
  add column if not exists age integer check (age is null or age between 13 and 120),
  add column if not exists gender text,
  add column if not exists occupation text;

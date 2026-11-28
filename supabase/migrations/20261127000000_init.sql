-- Lappka: owners, pets, events and pet photos.
-- Run once in the Supabase dashboard (SQL Editor), or with `supabase db push`.
-- Every table has row level security: a signed-in user only ever sees and changes their own rows.

-- ---------- Owner profile ----------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  created_at timestamptz not null default now()
);

-- ---------- Pets (the app holds one pet per owner for now) ----------
create table public.pets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in ('dog', 'cat')),
  name text not null check (char_length(btrim(name)) between 1 and 60),
  sex text not null check (sex in ('male', 'female')),
  birth_date date,
  approx_age_months integer check (approx_age_months between 1 and 371),
  breed text not null check (char_length(btrim(breed)) between 1 and 80),
  bio text not null default '' check (char_length(bio) <= 280),
  instagram text check (instagram ~ '^[A-Za-z0-9._]{1,30}$'),
  country text not null default 'UA' check (country ~ '^[A-Z]{2}$'),
  photo_path text,
  chipped boolean not null default false,
  -- Set by staff (e.g. after a vet confirms identity); owners cannot write it, see the grants below.
  verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (owner_id),
  unique (id, owner_id),
  -- A photo path must sit in the owner's own storage folder.
  check (photo_path is null or photo_path like owner_id::text || '/%')
);

-- ---------- Events ----------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  pet_id uuid not null,
  kind text not null check (kind in ('vet', 'vaccine', 'grooming', 'medication', 'other')),
  description text not null default '' check (char_length(description) <= 500),
  date date not null,
  "time" time,
  repeat_every integer check (repeat_every between 1 and 99),
  repeat_unit text check (repeat_unit in ('day', 'week', 'month', 'year')),
  created_at timestamptz not null default now(),
  check ((repeat_every is null) = (repeat_unit is null)),
  -- The pet must exist AND belong to the same owner; its events go with it.
  foreign key (pet_id, owner_id) references public.pets (id, owner_id) on delete cascade
);

create index events_owner_date_idx on public.events (owner_id, date);
create index events_pet_idx on public.events (pet_id, owner_id);

-- ---------- Row level security ----------
alter table public.profiles enable row level security;
alter table public.pets enable row level security;
alter table public.events enable row level security;

create policy "own profile" on public.profiles for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "own pets" on public.pets for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create policy "own events" on public.events for all to authenticated
  using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

-- ---------- Privileges ----------
-- Signed-out visitors get nothing at all.
revoke all on public.profiles, public.pets, public.events from anon, authenticated;

grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.events to authenticated;

grant select, delete on public.pets to authenticated;
-- Column lists on purpose: `verified`, `owner_id` and `id` cannot be written by the app.
grant insert (type, name, sex, birth_date, approx_age_months, breed, bio, instagram, country, photo_path, chipped)
  on public.pets to authenticated;
grant update (name, sex, birth_date, approx_age_months, breed, bio, instagram, country, photo_path, chipped)
  on public.pets to authenticated;

-- ---------- Pet photos: a private bucket, one folder per user ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('pet-photos', 'pet-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "read own pet photos" on storage.objects for select to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "add own pet photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "delete own pet photos" on storage.objects for delete to authenticated
  using (bucket_id = 'pet-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

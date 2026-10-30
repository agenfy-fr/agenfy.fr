-- Core identity shared by the three Agenfy apps (one Supabase project):
--   www.agenfy.fr      (apps/web)     public site, lead capture
--   console.agenfy.fr  (apps/console) staff back-office + client portal
--   app.agenfy.fr      (apps/app)     training platform
--
-- A single auth.users row can be, at the same time:
--   - staff (Agenfy team)                    -> public.staff
--   - member of one or more client orgs      -> public.organization_members
--   - learner                                -> any authenticated user (see apps/app migrations)
--
-- Migration numbering convention: 0001-0099 shared/web, 0100-0199 console, 0200-0299 app.
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  job_title text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Staff (Agenfy team) — allowlist, never self-assigned
-- ---------------------------------------------------------------------------
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'readonly'
    check (role in ('owner', 'admin', 'consultant', 'sales', 'trainer', 'readonly')),
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.staff enable row level security;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and not s.suspended
  );
$$;

create or replace function public.staff_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select s.role from public.staff s
  where s.user_id = auth.uid() and not s.suspended;
$$;

create or replace function public.is_staff_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.staff_role() in ('owner', 'admin'), false);
$$;

create policy "Staff can read staff" on public.staff
  for select to authenticated using (public.is_staff());
create policy "Staff admins manage staff" on public.staff
  for all to authenticated using (public.is_staff_admin()) with check (public.is_staff_admin());

-- ---------------------------------------------------------------------------
-- Client organizations (multi-tenant)
-- ---------------------------------------------------------------------------
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  siren text,
  website text,
  sector text,
  size_band text check (size_band in ('1-9', '10-49', '50-249', '250-4999', '5000+')),
  logo_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'manager', 'member')),
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create index if not exists organization_members_user_idx on public.organization_members(user_id);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create or replace function public.is_org_member(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_org_manager(org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.organization_members m
    where m.organization_id = org and m.user_id = auth.uid()
      and m.role in ('owner', 'manager')
  );
$$;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create policy "Profiles: self or staff can read" on public.profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_staff()
    or exists (
      select 1 from public.organization_members a
      join public.organization_members b on a.organization_id = b.organization_id
      where a.user_id = auth.uid() and b.user_id = profiles.id
    )
  );
create policy "Profiles: self can update" on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());
create policy "Profiles: staff can update" on public.profiles
  for update to authenticated using (public.is_staff_admin());

create policy "Orgs: staff full access" on public.organizations
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Orgs: members can read" on public.organizations
  for select to authenticated using (public.is_org_member(id));

create policy "Org members: staff full access" on public.organization_members
  for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "Org members: members can read their org" on public.organization_members
  for select to authenticated using (public.is_org_member(organization_id));
create policy "Org members: managers manage their org" on public.organization_members
  for all to authenticated
  using (public.is_org_manager(organization_id))
  with check (public.is_org_manager(organization_id) and role <> 'owner');

-- ---------------------------------------------------------------------------
-- Tighten web tables: "authenticated" now includes clients and learners,
-- so lead and newsletter data must be staff-only.
-- ---------------------------------------------------------------------------
drop policy if exists "Authenticated users can view leads" on public.leads;
drop policy if exists "Authenticated users can update leads" on public.leads;
drop policy if exists "Authenticated users can delete leads" on public.leads;
create policy "Staff can read leads" on public.leads
  for select to authenticated using (public.is_staff());
create policy "Staff can update leads" on public.leads
  for update to authenticated using (public.is_staff());
create policy "Staff can delete leads" on public.leads
  for delete to authenticated using (public.is_staff_admin());

drop policy if exists "Authenticated users can view subscribers" on public.newsletter_subscribers;
drop policy if exists "Authenticated users can delete subscribers" on public.newsletter_subscribers;
create policy "Staff can read subscribers" on public.newsletter_subscribers
  for select to authenticated using (public.is_staff());
create policy "Staff can delete subscribers" on public.newsletter_subscribers
  for delete to authenticated using (public.is_staff_admin());

-- Bootstrap: after creating your own account, run once in the SQL Editor:
--   insert into public.staff (user_id, role)
--   select id, 'owner' from auth.users where email = 'contact@agenfy.fr';

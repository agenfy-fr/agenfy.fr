-- Minimal stand-in for the Supabase platform objects the migrations rely on,
-- so they can be applied to a throwaway local PostgreSQL (see
-- scripts/test-rls.sh). NEVER run this against a real Supabase project.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema auth;
create table auth.users (
  id uuid primary key,
  email text,
  raw_user_meta_data jsonb not null default '{}'
);

-- Supabase reads the JWT `sub` claim; tests set it with
--   select set_config('request.jwt.claim.sub', '<uuid>', true);
create function auth.uid() returns uuid
language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

-- auth.jwt(): the tests run as an MFA-verified session (aal2) unless they set
--   select set_config('request.jwt.claim.aal', 'aal1', true);
create function auth.jwt() returns jsonb
language sql stable
as $$ select jsonb_build_object(
  'sub', current_setting('request.jwt.claim.sub', true),
  'aal', coalesce(nullif(current_setting('request.jwt.claim.aal', true), ''), 'aal2')) $$;

create schema storage;
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets(id),
  name text not null
);
alter table storage.objects enable row level security;

grant usage on schema public, auth, storage to anon, authenticated, service_role;
grant execute on function auth.uid(), auth.jwt() to anon, authenticated, service_role;
grant all on all tables in schema storage to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

-- Pre-existing table referenced by 0002 (created outside migrations).
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  created_at timestamptz not null default now()
);

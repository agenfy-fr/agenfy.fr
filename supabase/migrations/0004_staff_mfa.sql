-- Two-factor authentication (TOTP) is mandatory for every Agenfy staff account.
--
-- Staff privileges are granted only to a session that passed the second factor
-- (JWT claim aal = 'aal2'). A staff member signed in with a password or a magic
-- link only (aal1) is treated as a regular user by every RLS policy until the
-- TOTP code is verified. Enforced in the database, so it holds for the console,
-- app.agenfy.fr and any direct API call made with the anon key.
--
-- is_staff_admin() and is_training_staff() call staff_role(): covered too.
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.

create or replace function public.has_aal2()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() ->> 'aal', '') = 'aal2';
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.has_aal2() and exists (
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
  where s.user_id = auth.uid() and not s.suspended and public.has_aal2();
$$;

-- Lets the apps send an active staff member who has not verified the second
-- factor yet to the 2FA screen (enrollment or code). Reveals nothing about
-- other users.
create or replace function public.staff_mfa_pending()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not public.has_aal2() and exists (
    select 1 from public.staff s
    where s.user_id = auth.uid() and not s.suspended
  );
$$;

revoke execute on function public.staff_mfa_pending() from public, anon;
grant execute on function public.has_aal2() to authenticated;
grant execute on function public.staff_mfa_pending() to authenticated;

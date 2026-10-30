-- Makes contact@agenfy.fr the owner of the Agenfy console (run once, after the
-- migrations, in Supabase → SQL Editor).
--
-- Prerequisite: the account exists in Authentication → Users (Add user →
-- contact@agenfy.fr, strong password, "Auto Confirm User").
-- The owner then has to enroll TOTP 2FA at the first sign-in: staff
-- privileges require a 2FA-verified session (0004_staff_mfa.sql).
--
-- Idempotent: re-running restores the owner role and lifts a suspension.

do $$
begin
  if not exists (select 1 from auth.users where email = 'contact@agenfy.fr') then
    raise exception 'Create the user contact@agenfy.fr in Authentication → Users first.';
  end if;
end $$;

insert into public.staff (user_id, role, suspended)
select id, 'owner', false from auth.users where email = 'contact@agenfy.fr'
on conflict (user_id) do update set role = 'owner', suspended = false;

update public.profiles p
set full_name = 'Agenfy'
from auth.users u
where u.id = p.id and u.email = 'contact@agenfy.fr' and coalesce(p.full_name, '') = '';

select u.email, s.role, s.suspended
from public.staff s join auth.users u on u.id = s.user_id
order by s.created_at;

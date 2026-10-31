-- Console — client contacts (address book), independent from portal access.
--
-- A contact is a person at a client organization (name, e-mail, phone, job
-- title). Adding one sends NOTHING. Portal access (organization_members) is a
-- separate, explicit step: "Inviter à l'espace client" on a contact, which
-- links the contact to the auth account (user_id).
--
-- Staff only: clients never read the address book (internal notes).
-- Depends on 0003 and 0100. NOT applied automatically.

create table if not exists public.organization_contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  email text check (email is null or (char_length(email) <= 320 and email ~ '^[^@[:space:]]+@[^@[:space:]]+$')),
  phone text check (char_length(phone) <= 40),
  job_title text check (char_length(job_title) <= 120),
  notes text check (char_length(notes) <= 5000),
  is_primary boolean not null default false,
  -- Portal account once invited (null = contact only, no access).
  user_id uuid references auth.users(id) on delete set null,
  invited_at timestamptz,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint organization_contacts_identity check (coalesce(btrim(full_name), '') <> '' or email is not null)
);

create index if not exists organization_contacts_org_idx on public.organization_contacts(organization_id, created_at);
create unique index if not exists organization_contacts_email_uniq
  on public.organization_contacts(organization_id, lower(email)) where email is not null;
create index if not exists organization_contacts_email_idx on public.organization_contacts(lower(email)) where email is not null;

drop trigger if exists organization_contacts_set_updated_at on public.organization_contacts;
create trigger organization_contacts_set_updated_at
  before update on public.organization_contacts
  for each row execute function public.set_updated_at();

alter table public.organization_contacts enable row level security;

create policy "Contacts: staff read" on public.organization_contacts
  for select to authenticated using (public.is_staff());
create policy "Contacts: staff write" on public.organization_contacts
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());

-- Existing portal members become contacts (linked to their account).
insert into public.organization_contacts (organization_id, full_name, email, user_id, invited_at, created_by)
select m.organization_id, p.full_name, u.email, m.user_id, m.created_at, null
from public.organization_members m
join auth.users u on u.id = m.user_id
left join public.profiles p on p.id = m.user_id
on conflict do nothing;

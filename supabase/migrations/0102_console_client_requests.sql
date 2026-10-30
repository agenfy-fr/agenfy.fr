-- Console — client requests / tickets from the portal.
--
-- Clients (organization members) can open a request for their organization
-- and post public messages on it. Staff can reply publicly or leave internal
-- notes (`internal = true`) that never reach the portal.
--
-- Depends on 0003 and 0100. NOT applied automatically.

create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  subject text not null check (char_length(btrim(subject)) between 1 and 200),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  category text not null default 'question' check (category in ('question', 'change', 'bug', 'other')),
  status text not null default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high')),
  assignee_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_requests_org_idx on public.client_requests(organization_id, created_at desc);
create index if not exists client_requests_status_idx on public.client_requests(status);

alter table public.client_requests enable row level security;

create policy "Requests: staff read" on public.client_requests
  for select to authenticated using (public.is_staff());
create policy "Requests: staff write" on public.client_requests
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Requests: members read" on public.client_requests
  for select to authenticated using (public.is_org_member(organization_id));
create policy "Requests: members create" on public.client_requests
  for insert to authenticated
  with check (
    public.is_org_member(organization_id)
    and created_by = auth.uid()
    and status = 'open'
    and assignee_id is null
  );

drop trigger if exists client_requests_org on public.client_requests;
create trigger client_requests_org
  before insert or update of project_id, organization_id on public.client_requests
  for each row execute function public.inherit_project_organization();

drop trigger if exists client_requests_set_updated_at on public.client_requests;
create trigger client_requests_set_updated_at
  before update on public.client_requests
  for each row execute function public.set_updated_at();

create table if not exists public.client_request_messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.client_requests(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 10000),
  internal boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists client_request_messages_request_idx
  on public.client_request_messages(request_id, created_at);

alter table public.client_request_messages enable row level security;

-- organization_id always comes from the parent request.
create or replace function public.client_request_messages_org()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  select r.organization_id into v_org
  from public.client_requests r where r.id = new.request_id;
  if v_org is null then
    raise exception 'Demande introuvable' using errcode = '23503';
  end if;
  new.organization_id := v_org;
  return new;
end;
$$;

drop trigger if exists client_request_messages_org on public.client_request_messages;
create trigger client_request_messages_org
  before insert or update of request_id, organization_id on public.client_request_messages
  for each row execute function public.client_request_messages_org();

create policy "Request messages: staff read" on public.client_request_messages
  for select to authenticated using (public.is_staff());
create policy "Request messages: staff write" on public.client_request_messages
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Request messages: members read public" on public.client_request_messages
  for select to authenticated using (not internal and public.is_org_member(organization_id));
create policy "Request messages: members post public" on public.client_request_messages
  for insert to authenticated
  with check (not internal and author_id = auth.uid() and public.is_org_member(organization_id));

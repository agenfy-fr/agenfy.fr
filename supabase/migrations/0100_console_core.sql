-- Console (console.agenfy.fr) — CRM, client projects, planning, deliverables.
--
-- Builds on 0003_core_identity.sql (profiles, staff, organizations,
-- organization_members, is_staff(), staff_role(), is_staff_admin(),
-- is_org_member(), is_org_manager()). Does NOT modify it.
--
-- RLS model (multi-tenant):
--   - staff (public.staff, not suspended) read everything; writes require a
--     non-readonly staff role (public.staff_can_write()).
--   - client users (organization_members) only read rows of THEIR
--     organizations, and only rows flagged client-visible. Internal notes live
--     in separate staff-only tables (organization_internal, project_internal,
--     project_task_comments) because RLS is row-level, not column-level.
--   - NB: public.organizations.notes (0003) is readable by org members:
--     never store internal notes there — use organization_internal.
--
-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`,
-- after 0001, 0002 and 0003.

-- ---------------------------------------------------------------------------
-- Role helpers (mirror of apps/console/src/lib/access-control.ts)
-- ---------------------------------------------------------------------------
create or replace function public.staff_can_write()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(public.staff_role() in ('owner', 'admin', 'consultant', 'sales', 'trainer'), false);
$$;

-- owner/admin always pass; otherwise the current staff role must be in `roles`.
create or replace function public.staff_has_role(roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    public.staff_role() in ('owner', 'admin') or public.staff_role() = any(roles),
    false
  );
$$;

revoke execute on function public.staff_can_write() from anon;
revoke execute on function public.staff_has_role(text[]) from anon;

-- Directory helpers: auth.users emails are not exposed through PostgREST, so
-- staff read them through these definer functions (empty result otherwise).
create or replace function public.console_user_directory(p_ids uuid[])
returns table (id uuid, email text, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.email::text, p.full_name
  from auth.users u
  left join public.profiles p on p.id = u.id
  where public.is_staff() and u.id = any(p_ids);
$$;

create or replace function public.console_staff_directory()
returns table (id uuid, email text, full_name text, role text, suspended boolean, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select s.user_id, u.email::text, p.full_name, s.role, s.suspended, s.created_at
  from public.staff s
  join auth.users u on u.id = s.user_id
  left join public.profiles p on p.id = s.user_id
  where public.is_staff()
  order by p.full_name nulls last, u.email;
$$;

revoke execute on function public.console_user_directory(uuid[]) from anon;
revoke execute on function public.console_staff_directory() from anon;

-- ---------------------------------------------------------------------------
-- Organizations: staff-only CRM data
-- ---------------------------------------------------------------------------
create table if not exists public.organization_internal (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  status text not null default 'active' check (status in ('prospect', 'active', 'inactive')),
  account_manager_id uuid references auth.users(id) on delete set null,
  internal_notes text check (char_length(internal_notes) <= 20000),
  source_lead_id uuid references public.leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.organization_internal enable row level security;

create policy "Org internal: staff read" on public.organization_internal
  for select to authenticated using (public.is_staff());
create policy "Org internal: staff write" on public.organization_internal
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());

drop trigger if exists organization_internal_set_updated_at on public.organization_internal;
create trigger organization_internal_set_updated_at
  before update on public.organization_internal
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Leads (table from 0001, fed by www.agenfy.fr): conversion to organization
-- ---------------------------------------------------------------------------
alter table public.leads add column if not exists organization_id uuid references public.organizations(id) on delete set null;
alter table public.leads add column if not exists converted_at timestamptz;
create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_created_idx on public.leads(created_at desc);

-- Staff can create leads by hand (phone, events…).
drop policy if exists "Staff can insert leads" on public.leads;
create policy "Staff can insert leads" on public.leads
  for insert to authenticated with check (public.staff_can_write());

-- 0003 lets any staff (readonly included) update leads: restrict to writers.
drop policy if exists "Leads: writers only update" on public.leads;
create policy "Leads: writers only update" on public.leads
  as restrictive for update to authenticated
  using (public.staff_can_write()) with check (public.staff_can_write());

-- ---------------------------------------------------------------------------
-- Client projects
-- ---------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null unique check (code ~ '^[A-Z][A-Z0-9]{1,9}$'),
  name text not null check (char_length(btrim(name)) between 1 and 200),
  description text check (char_length(description) <= 20000),
  status text not null default 'draft'
    check (status in ('draft', 'active', 'on_hold', 'completed', 'cancelled')),
  progress smallint not null default 0 check (progress between 0 and 100),
  start_date date,
  end_date date,
  budget_cents bigint check (budget_cents >= 0),
  owner_id uuid references auth.users(id) on delete set null,
  next_steps text check (char_length(next_steps) <= 5000),
  next_task_number integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_dates_check check (start_date is null or end_date is null or start_date <= end_date)
);

create index if not exists projects_org_idx on public.projects(organization_id);
create index if not exists projects_status_idx on public.projects(status);

alter table public.projects enable row level security;

create policy "Projects: staff read" on public.projects
  for select to authenticated using (public.is_staff());
create policy "Projects: staff write" on public.projects
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Projects: members read non-draft" on public.projects
  for select to authenticated
  using (status <> 'draft' and public.is_org_member(organization_id));

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- Moving a project to another organization would leave its children
-- (milestones, tasks, documents, invoices…) attached to the old tenant.
create or replace function public.projects_lock_organization()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.organization_id <> old.organization_id then
    raise exception 'Un projet ne peut pas changer d''organisation' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists projects_lock_organization on public.projects;
create trigger projects_lock_organization
  before update of organization_id on public.projects
  for each row execute function public.projects_lock_organization();

-- Staff-only project data (internal notes never reach the portal).
create table if not exists public.project_internal (
  project_id uuid primary key references public.projects(id) on delete cascade,
  internal_notes text check (char_length(internal_notes) <= 50000),
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table public.project_internal enable row level security;

create policy "Project internal: staff read" on public.project_internal
  for select to authenticated using (public.is_staff());
create policy "Project internal: staff write" on public.project_internal
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());

drop trigger if exists project_internal_set_updated_at on public.project_internal;
create trigger project_internal_set_updated_at
  before update on public.project_internal
  for each row execute function public.set_updated_at();

-- Child rows carry organization_id (denormalized for cheap RLS); it is always
-- derived from the parent project so it cannot be forged.
create or replace function public.inherit_project_organization()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
begin
  if new.project_id is null then
    return new;
  end if;
  select p.organization_id into v_org from public.projects p where p.id = new.project_id;
  if v_org is null then
    raise exception 'Projet introuvable' using errcode = '23503';
  end if;
  if new.organization_id is not null and new.organization_id <> v_org then
    raise exception 'Le projet appartient à une autre organisation' using errcode = '23514';
  end if;
  new.organization_id := v_org;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Milestones (phases / jalons)
-- ---------------------------------------------------------------------------
create table if not exists public.project_milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text check (char_length(description) <= 5000),
  status text not null default 'planned' check (status in ('planned', 'in_progress', 'done')),
  due_date date,
  position integer not null default 0,
  client_visible boolean not null default true,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_milestones_project_idx on public.project_milestones(project_id, position);

alter table public.project_milestones enable row level security;

create policy "Milestones: staff read" on public.project_milestones
  for select to authenticated using (public.is_staff());
create policy "Milestones: staff write" on public.project_milestones
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Milestones: members read visible" on public.project_milestones
  for select to authenticated
  using (
    client_visible
    and public.is_org_member(organization_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.status <> 'draft')
  );

drop trigger if exists project_milestones_org on public.project_milestones;
create trigger project_milestones_org
  before insert or update of project_id, organization_id on public.project_milestones
  for each row execute function public.inherit_project_organization();

drop trigger if exists project_milestones_set_updated_at on public.project_milestones;
create trigger project_milestones_set_updated_at
  before update on public.project_milestones
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Planning: tasks (module adapted from Hasfy Console, scoped by project)
-- Human key = <projects.code>-<number>, e.g. ACME-007.
-- ---------------------------------------------------------------------------
create table if not exists public.project_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  milestone_id uuid references public.project_milestones(id) on delete set null,
  number integer not null,
  title text not null check (char_length(btrim(title)) between 1 and 500),
  description text check (char_length(description) <= 50000),
  type text not null default 'task' check (type in ('task', 'bug', 'feature', 'improvement', 'chore')),
  status text not null default 'backlog' check (status in ('backlog', 'in_progress', 'review', 'done')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  assignee_id uuid references auth.users(id) on delete set null,
  reporter_id uuid references auth.users(id) on delete set null,
  start_date date,
  due_date date,
  estimate_hours numeric(6, 2) check (estimate_hours >= 0),
  labels text[] not null default '{}' check (cardinality(labels) <= 20),
  order_index integer not null default 0,
  client_visible boolean not null default false,
  agent_assignee text check (agent_assignee ~ '^[A-Za-z0-9][A-Za-z0-9._@:/-]{0,79}$'),
  agent_claimed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint project_tasks_number_unique unique (project_id, number),
  constraint project_tasks_schedule_range_check check (start_date is null or due_date is null or start_date <= due_date)
);

create index if not exists project_tasks_project_idx on public.project_tasks(project_id, status, order_index);
create index if not exists project_tasks_assignee_idx on public.project_tasks(assignee_id) where assignee_id is not null;
create index if not exists project_tasks_org_idx on public.project_tasks(organization_id);

alter table public.project_tasks enable row level security;

create policy "Tasks: staff read" on public.project_tasks
  for select to authenticated using (public.is_staff());
create policy "Tasks: staff write" on public.project_tasks
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Tasks: members read visible" on public.project_tasks
  for select to authenticated
  using (
    client_visible
    and public.is_org_member(organization_id)
    and exists (select 1 from public.projects p where p.id = project_id and p.status <> 'draft')
  );

-- Numbering per project, organization inheritance, milestone consistency,
-- completed_at bookkeeping.
create or replace function public.project_tasks_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org uuid;
  v_milestone_project uuid;
  v_number integer;
begin
  if tg_op = 'UPDATE' and new.project_id <> old.project_id then
    raise exception 'Une tâche ne peut pas changer de projet' using errcode = '23514';
  end if;

  select p.organization_id into v_org from public.projects p where p.id = new.project_id;
  if v_org is null then
    raise exception 'Projet introuvable' using errcode = '23503';
  end if;
  new.organization_id := v_org;

  if tg_op = 'INSERT' then
    update public.projects
      set next_task_number = next_task_number + 1
      where id = new.project_id
      returning next_task_number - 1 into v_number;
    new.number := v_number;
  else
    new.number := old.number;
  end if;

  if new.milestone_id is not null then
    select m.project_id into v_milestone_project from public.project_milestones m where m.id = new.milestone_id;
    if v_milestone_project is distinct from new.project_id then
      raise exception 'Le jalon appartient à un autre projet' using errcode = '23514';
    end if;
  end if;

  if new.status = 'done' and (tg_op = 'INSERT' or old.status <> 'done') then
    new.completed_at := now();
  elsif new.status <> 'done' then
    new.completed_at := null;
  end if;

  return new;
end;
$$;

drop trigger if exists project_tasks_guard on public.project_tasks;
create trigger project_tasks_guard
  before insert or update on public.project_tasks
  for each row execute function public.project_tasks_guard();

drop trigger if exists project_tasks_set_updated_at on public.project_tasks;
create trigger project_tasks_set_updated_at
  before update on public.project_tasks
  for each row execute function public.set_updated_at();

-- Internal discussion on a task (never visible to clients).
create table if not exists public.project_task_comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.project_tasks(id) on delete cascade,
  author_id uuid references auth.users(id) on delete set null default auth.uid(),
  body text not null check (char_length(btrim(body)) between 1 and 20000),
  created_at timestamptz not null default now()
);

create index if not exists project_task_comments_task_idx on public.project_task_comments(task_id, created_at);

alter table public.project_task_comments enable row level security;

create policy "Task comments: staff read" on public.project_task_comments
  for select to authenticated using (public.is_staff());
create policy "Task comments: staff write" on public.project_task_comments
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());

-- ---------------------------------------------------------------------------
-- Deliverables / documents (Supabase Storage bucket `client-documents`,
-- object path = <organization_id>/<uuid>-<file name>, or an external link).
-- ---------------------------------------------------------------------------
create table if not exists public.client_documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  description text check (char_length(description) <= 5000),
  kind text not null default 'deliverable' check (kind in ('deliverable', 'contract', 'report', 'other')),
  storage_path text unique,
  external_url text check (external_url ~ '^https://'),
  file_name text,
  mime_type text,
  size_bytes bigint check (size_bytes >= 0),
  client_visible boolean not null default true,
  uploaded_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint client_documents_source_check check (storage_path is not null or external_url is not null),
  constraint client_documents_path_check check (storage_path is null or storage_path like organization_id::text || '/%')
);

create index if not exists client_documents_org_idx on public.client_documents(organization_id, created_at desc);

alter table public.client_documents enable row level security;

create policy "Documents: staff read" on public.client_documents
  for select to authenticated using (public.is_staff());
create policy "Documents: staff write" on public.client_documents
  for all to authenticated using (public.staff_can_write()) with check (public.staff_can_write());
create policy "Documents: members read visible" on public.client_documents
  for select to authenticated using (client_visible and public.is_org_member(organization_id));

drop trigger if exists client_documents_org on public.client_documents;
create trigger client_documents_org
  before insert or update of project_id, organization_id on public.client_documents
  for each row execute function public.inherit_project_organization();

drop trigger if exists client_documents_set_updated_at on public.client_documents;
create trigger client_documents_set_updated_at
  before update on public.client_documents
  for each row execute function public.set_updated_at();

insert into storage.buckets (id, name, public, file_size_limit)
values ('client-documents', 'client-documents', false, 52428800)
on conflict (id) do nothing;

drop policy if exists "Client documents: staff read" on storage.objects;
create policy "Client documents: staff read" on storage.objects
  for select to authenticated
  using (bucket_id = 'client-documents' and public.is_staff());

drop policy if exists "Client documents: staff insert" on storage.objects;
create policy "Client documents: staff insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'client-documents' and public.staff_can_write());

drop policy if exists "Client documents: staff update" on storage.objects;
create policy "Client documents: staff update" on storage.objects
  for update to authenticated
  using (bucket_id = 'client-documents' and public.staff_can_write());

drop policy if exists "Client documents: staff delete" on storage.objects;
create policy "Client documents: staff delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'client-documents' and public.staff_can_write());

-- A member can download an object only if a client-visible document row of
-- one of their organizations points at it.
drop policy if exists "Client documents: members read visible" on storage.objects;
create policy "Client documents: members read visible" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'client-documents'
    and exists (
      select 1 from public.client_documents d
      where d.storage_path = storage.objects.name
        and d.client_visible
        and public.is_org_member(d.organization_id)
    )
  );

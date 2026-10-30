-- RLS role matrix and cross-organization isolation for the console schema
-- (0003 + 0100-0103). Runs against a THROWAWAY local PostgreSQL where
-- supabase-shim.sql and the migrations were applied — see
-- apps/console/scripts/test-rls.sh. Any failed assertion aborts with an error.
--
-- Actors:
--   owner     staff owner                  -> sees and writes everything
--   reader    staff readonly               -> sees everything, writes nothing
--   consult   staff consultant             -> writes projects, not billing
--   alice     member of organization A     -> only A's client-visible data
--   bob       member of organization B     -> only B's client-visible data
--   nobody    authenticated, no role       -> sees nothing

\set ON_ERROR_STOP 1

-- ---------------------------------------------------------------------------
-- Test helpers (superuser, throwaway database only)
-- ---------------------------------------------------------------------------
create or replace function public.t_eq(actual bigint, expected bigint, label text)
returns void language plpgsql as $$
begin
  if actual is distinct from expected then
    raise exception 'FAIL %: expected %, got %', label, expected, actual;
  end if;
  raise notice 'ok - %', label;
end $$;

create or replace function public.t_denied(stmt text, label text)
returns void language plpgsql as $$
declare
  n bigint;
begin
  begin
    execute stmt;
    get diagnostics n = row_count;
  exception when others then
    raise notice 'ok - % (rejected: %)', label, sqlerrm;
    return;
  end;
  if n = 0 then
    raise notice 'ok - % (0 rows affected)', label;
    return;
  end if;
  raise exception 'FAIL %: statement succeeded on % row(s)', label, n;
end $$;

create or replace function public.t_allowed(stmt text, label text)
returns void language plpgsql as $$
declare
  n bigint;
begin
  execute stmt;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'FAIL %: 0 rows affected', label;
  end if;
  raise notice 'ok - %', label;
end $$;

grant execute on function public.t_eq(bigint, bigint, text) to authenticated;
grant execute on function public.t_denied(text, text) to authenticated;
grant execute on function public.t_allowed(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Fixtures (as superuser: RLS bypassed)
-- ---------------------------------------------------------------------------
insert into auth.users (id, email) values
  ('00000000-0000-4000-8000-000000000001', 'owner@agenfy.fr'),
  ('00000000-0000-4000-8000-000000000002', 'reader@agenfy.fr'),
  ('00000000-0000-4000-8000-000000000003', 'consult@agenfy.fr'),
  ('00000000-0000-4000-8000-00000000000a', 'alice@client-a.test'),
  ('00000000-0000-4000-8000-00000000000b', 'bob@client-b.test'),
  ('00000000-0000-4000-8000-00000000000f', 'nobody@example.test');

insert into public.staff (user_id, role) values
  ('00000000-0000-4000-8000-000000000001', 'owner'),
  ('00000000-0000-4000-8000-000000000002', 'readonly'),
  ('00000000-0000-4000-8000-000000000003', 'consultant');

insert into public.organizations (id, name, slug, notes) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'Client A', 'client-a', null),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'Client B', 'client-b', null);

insert into public.organization_members (organization_id, user_id, role) values
  ('aaaaaaaa-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000a', 'owner'),
  ('bbbbbbbb-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000b', 'owner');

insert into public.organization_internal (organization_id, internal_notes) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'secret A'),
  ('bbbbbbbb-0000-4000-8000-000000000000', 'secret B');

insert into public.projects (id, organization_id, code, name, status) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'aaaaaaaa-0000-4000-8000-000000000000', 'ACLA', 'Projet A', 'active'),
  ('aaaaaaaa-0000-4000-8000-0000000000a2', 'aaaaaaaa-0000-4000-8000-000000000000', 'ACLADRAFT', 'Brouillon A', 'draft'),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'bbbbbbbb-0000-4000-8000-000000000000', 'BCLB', 'Projet B', 'active');

insert into public.project_internal (project_id, internal_notes) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'marge interne A');

insert into public.project_milestones (project_id, title, client_visible) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'Cadrage', true),
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'Jalon interne', false),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'Cadrage B', true);

insert into public.project_tasks (project_id, title, client_visible) values
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'Atelier client', true),
  ('aaaaaaaa-0000-4000-8000-0000000000a1', 'Tâche interne', false),
  ('aaaaaaaa-0000-4000-8000-0000000000a2', 'Tâche projet brouillon', true),
  ('bbbbbbbb-0000-4000-8000-0000000000b1', 'Atelier B', true);

insert into public.client_documents (organization_id, project_id, title, storage_path, client_visible) values
  ('aaaaaaaa-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', 'Livrable A',
   'aaaaaaaa-0000-4000-8000-000000000000/livrable.pdf', true),
  ('aaaaaaaa-0000-4000-8000-000000000000', null, 'Brouillon interne A',
   'aaaaaaaa-0000-4000-8000-000000000000/interne.pdf', false),
  ('bbbbbbbb-0000-4000-8000-000000000000', null, 'Livrable B',
   'bbbbbbbb-0000-4000-8000-000000000000/livrable.pdf', true);

insert into storage.buckets (id, name) values ('client-documents', 'client-documents') on conflict do nothing;
insert into storage.objects (bucket_id, name) values
  ('client-documents', 'aaaaaaaa-0000-4000-8000-000000000000/livrable.pdf'),
  ('client-documents', 'aaaaaaaa-0000-4000-8000-000000000000/interne.pdf'),
  ('client-documents', 'bbbbbbbb-0000-4000-8000-000000000000/livrable.pdf');

insert into public.invoices (id, organization_id, title, status) values
  ('aaaaaaaa-0000-4000-8000-00000000f001', 'aaaaaaaa-0000-4000-8000-000000000000', 'Facture A émise', 'draft'),
  ('aaaaaaaa-0000-4000-8000-00000000f002', 'aaaaaaaa-0000-4000-8000-000000000000', 'Facture A brouillon', 'draft'),
  ('bbbbbbbb-0000-4000-8000-00000000f001', 'bbbbbbbb-0000-4000-8000-000000000000', 'Facture B émise', 'draft');
insert into public.invoice_lines (invoice_id, description, quantity, unit_price_cents) values
  ('aaaaaaaa-0000-4000-8000-00000000f001', 'Atelier', 2, 50000),
  ('aaaaaaaa-0000-4000-8000-00000000f001', 'Frais', 1, 1234),
  ('bbbbbbbb-0000-4000-8000-00000000f001', 'Mission', 1, 100000);
update public.invoices set status = 'sent'
  where id in ('aaaaaaaa-0000-4000-8000-00000000f001', 'bbbbbbbb-0000-4000-8000-00000000f001');

insert into public.client_requests (id, organization_id, created_by, subject, body) values
  ('aaaaaaaa-0000-4000-8000-0000000000c1', 'aaaaaaaa-0000-4000-8000-000000000000',
   '00000000-0000-4000-8000-00000000000a', 'Question A', 'Bonjour'),
  ('bbbbbbbb-0000-4000-8000-0000000000c1', 'bbbbbbbb-0000-4000-8000-000000000000',
   '00000000-0000-4000-8000-00000000000b', 'Question B', 'Bonjour');
insert into public.client_request_messages (request_id, author_id, body, internal) values
  ('aaaaaaaa-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000001', 'Réponse publique', false),
  ('aaaaaaaa-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-000000000001', 'Note interne', true);

insert into public.leads (name, email, status) values ('Prospect', 'p@example.test', 'Nouveau');

-- ---------------------------------------------------------------------------
-- Business rules (superuser)
-- ---------------------------------------------------------------------------
select public.t_eq((select count(*) from public.project_tasks where number is null), 0, 'tasks are numbered');
select public.t_eq(
  (select max(number) from public.project_tasks where project_id = 'aaaaaaaa-0000-4000-8000-0000000000a1'), 2,
  'numbering is per project');
select public.t_eq(
  (select total_cents from public.invoices where id = 'aaaaaaaa-0000-4000-8000-00000000f001'),
  (101234 + 20247), 'invoice totals: lines + 20 % VAT, rounded');
select public.t_eq(
  (select count(*) from public.invoices where number like 'FAC-____-000_'), 2, 'issued invoices are numbered');
select public.t_eq(
  (select count(*) from public.invoices where status = 'draft' and number is null), 1, 'drafts have no number');
select public.t_denied(
  $$insert into public.invoice_lines (invoice_id, description, unit_price_cents)
    values ('aaaaaaaa-0000-4000-8000-00000000f001', 'ajout tardif', 1)$$,
  'issued invoice lines are frozen');
select public.t_denied(
  $$update public.invoices set status = 'draft' where id = 'aaaaaaaa-0000-4000-8000-00000000f001'$$,
  'issued invoice cannot go back to draft');
select public.t_denied(
  $$update public.projects set organization_id = 'bbbbbbbb-0000-4000-8000-000000000000'
    where id = 'aaaaaaaa-0000-4000-8000-0000000000a1'$$,
  'project cannot move to another organization');
select public.t_denied(
  $$insert into public.client_documents (organization_id, project_id, title, external_url)
    values ('bbbbbbbb-0000-4000-8000-000000000000', 'aaaaaaaa-0000-4000-8000-0000000000a1', 'x', 'https://x.test')$$,
  'document org must match its project org');

-- ---------------------------------------------------------------------------
-- alice (member of A)
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);

select public.t_eq((select count(*) from public.organizations), 1, 'alice: sees only org A');
select public.t_eq((select count(*) from public.organization_internal), 0, 'alice: no internal org notes');
select public.t_eq((select count(*) from public.projects), 1, 'alice: only A non-draft projects');
select public.t_eq((select count(*) from public.project_internal), 0, 'alice: no internal project notes');
select public.t_eq((select count(*) from public.project_milestones), 1, 'alice: only visible A milestones');
select public.t_eq((select count(*) from public.project_tasks), 1, 'alice: only visible tasks of non-draft A projects');
select public.t_eq((select count(*) from public.project_task_comments), 0, 'alice: no task comments');
select public.t_eq((select count(*) from public.client_documents), 1, 'alice: only visible A documents');
select public.t_eq((select count(*) from storage.objects), 1, 'alice: can download only visible A files');
select public.t_eq((select count(*) from public.invoices), 1, 'alice: only issued A invoices');
select public.t_eq((select count(*) from public.invoice_lines), 2, 'alice: lines of issued A invoices');
select public.t_eq((select count(*) from public.client_requests), 1, 'alice: only A requests');
select public.t_eq((select count(*) from public.client_request_messages), 1, 'alice: no internal messages');
select public.t_eq((select count(*) from public.leads), 0, 'alice: no leads');
select public.t_eq((select count(*) from public.staff), 0, 'alice: no staff list');
select public.t_denied($$select * from public.staff_api_tokens$$, 'alice: no API tokens');
select public.t_eq((select count(*) from public.console_user_directory(array['00000000-0000-4000-8000-000000000001'::uuid])), 0,
  'alice: user directory is empty for clients');

select public.t_allowed(
  $$insert into public.client_requests (organization_id, created_by, subject, body)
    values ('aaaaaaaa-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000a', 'Nouvelle', 'demande')$$,
  'alice: can open a request for A');
select public.t_denied(
  $$insert into public.client_requests (organization_id, created_by, subject, body)
    values ('bbbbbbbb-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000a', 'Intrusion', 'x')$$,
  'alice: cannot open a request for B');
select public.t_denied(
  $$insert into public.client_requests (organization_id, created_by, subject, body, status)
    values ('aaaaaaaa-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000a', 'x', 'x', 'resolved')$$,
  'alice: cannot create a request in another status');
select public.t_denied(
  $$insert into public.client_request_messages (request_id, author_id, body, internal)
    values ('aaaaaaaa-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-00000000000a', 'x', true)$$,
  'alice: cannot post an internal message');
select public.t_denied(
  $$insert into public.client_request_messages (request_id, author_id, body)
    values ('bbbbbbbb-0000-4000-8000-0000000000c1', '00000000-0000-4000-8000-00000000000a', 'x')$$,
  'alice: cannot post on a B request');
select public.t_denied(
  $$update public.projects set progress = 100$$, 'alice: cannot update projects');
select public.t_denied(
  $$update public.client_requests set status = 'closed'$$, 'alice: cannot change request status');
select public.t_denied(
  $$update public.organizations set name = 'pwned'$$, 'alice: cannot rename her organization');
select public.t_denied(
  $$insert into public.organization_members (organization_id, user_id, role)
    values ('bbbbbbbb-0000-4000-8000-000000000000', '00000000-0000-4000-8000-00000000000a', 'member')$$,
  'alice: cannot join org B');
rollback;

-- ---------------------------------------------------------------------------
-- bob (member of B) — symmetric
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000b', true);
select public.t_eq((select count(*) from public.projects where organization_id = 'aaaaaaaa-0000-4000-8000-000000000000'), 0,
  'bob: no A projects');
select public.t_eq((select count(*) from public.client_documents where organization_id = 'aaaaaaaa-0000-4000-8000-000000000000'), 0,
  'bob: no A documents');
select public.t_eq((select count(*) from storage.objects where name like 'aaaaaaaa%'), 0, 'bob: no A files');
select public.t_eq((select count(*) from public.invoices where organization_id = 'aaaaaaaa-0000-4000-8000-000000000000'), 0,
  'bob: no A invoices');
select public.t_eq((select count(*) from public.client_requests where organization_id = 'aaaaaaaa-0000-4000-8000-000000000000'), 0,
  'bob: no A requests');
select public.t_eq((select count(*) from public.projects), 1, 'bob: sees his own project');
rollback;

-- ---------------------------------------------------------------------------
-- nobody (authenticated, neither staff nor member)
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000f', true);
select public.t_eq(
  (select count(*) from public.organizations) + (select count(*) from public.projects)
  + (select count(*) from public.project_tasks) + (select count(*) from public.client_documents)
  + (select count(*) from public.invoices) + (select count(*) from public.quotes)
  + (select count(*) from public.client_requests) + (select count(*) from public.leads),
  0, 'nobody: sees nothing');
rollback;

-- ---------------------------------------------------------------------------
-- anon
-- ---------------------------------------------------------------------------
begin;
set local role anon;
select public.t_eq((select count(*) from public.projects), 0, 'anon: no projects');
select public.t_eq((select count(*) from public.invoices), 0, 'anon: no invoices');
rollback;

-- ---------------------------------------------------------------------------
-- reader (staff readonly)
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000002', true);
select public.t_eq((select count(*) from public.projects), 3, 'reader: sees all projects (drafts included)');
select public.t_eq((select count(*) from public.organization_internal), 2, 'reader: sees internal notes');
select public.t_eq((select count(*) from public.invoices), 3, 'reader: sees all invoices');
select public.t_eq((select count(*) from public.leads), 1, 'reader: sees leads');
select public.t_denied($$update public.projects set progress = 50$$, 'reader: cannot update projects');
select public.t_denied($$update public.leads set status = 'Contacté'$$, 'reader: cannot update leads');
select public.t_denied(
  $$insert into public.project_tasks (project_id, title) values ('aaaaaaaa-0000-4000-8000-0000000000a1', 'x')$$,
  'reader: cannot create tasks');
rollback;

-- ---------------------------------------------------------------------------
-- consult (staff consultant)
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000003', true);
select public.t_allowed($$update public.projects set progress = 40 where code = 'ACLA'$$, 'consult: can update projects');
select public.t_allowed(
  $$insert into public.project_tasks (project_id, title) values ('bbbbbbbb-0000-4000-8000-0000000000b1', 'Nouvelle')$$,
  'consult: can create tasks');
select public.t_denied(
  $$insert into public.invoices (organization_id, title) values ('aaaaaaaa-0000-4000-8000-000000000000', 'x')$$,
  'consult: cannot create invoices (billing = owner/admin/sales)');
select public.t_denied($$delete from public.leads$$, 'consult: cannot delete leads (admin only)');
rollback;

-- ---------------------------------------------------------------------------
-- owner
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select public.t_allowed(
  $$insert into public.quotes (organization_id, title) values ('aaaaaaaa-0000-4000-8000-000000000000', 'Devis')$$,
  'owner: can create quotes');
select public.t_allowed(
  $$insert into public.quote_lines (quote_id, description, quantity, unit_price_cents)
    select id, 'Audit IA', 3, 80000 from public.quotes where title = 'Devis'$$,
  'owner: can add quote lines');
select public.t_allowed($$update public.quotes set status = 'sent' where title = 'Devis'$$, 'owner: can issue a quote');
select public.t_eq((select count(*) from public.quotes where title = 'Devis' and number like 'DEV-____-0001'
  and total_cents = 288000), 1, 'owner: issued quote numbered, total = 2400 € HT + 20 %');
select public.t_eq((select count(*) from public.console_staff_directory()), 3, 'owner: staff directory');
select public.t_denied(
  $$select public.next_billing_number('invoice', current_date)$$, 'owner: cannot burn invoice numbers directly');
rollback;

-- ---------------------------------------------------------------------------
-- owner without the second factor (aal1): no staff privilege at all
-- ---------------------------------------------------------------------------
begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000000001', true);
select set_config('request.jwt.claim.aal', 'aal1', true);
select public.t_eq((select public.is_staff()::int), 0, 'owner aal1: is_staff() false');
select public.t_eq((select count(*) from public.staff_role() r where r is not null), 0, 'owner aal1: no staff role');
select public.t_eq((select public.staff_mfa_pending()::int), 1, 'owner aal1: 2FA pending');
select public.t_eq((select count(*) from public.leads), 0, 'owner aal1: no leads');
select public.t_eq((select count(*) from public.organizations), 0, 'owner aal1: no organizations');
select public.t_eq((select count(*) from public.staff), 0, 'owner aal1: no staff list');
select public.t_denied($$delete from public.leads$$, 'owner aal1: cannot delete leads');
rollback;

begin;
set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-00000000000a', true);
select set_config('request.jwt.claim.aal', 'aal1', true);
select public.t_eq((select public.staff_mfa_pending()::int), 0, 'alice (client): no staff 2FA pending');
rollback;

\echo 'RLS isolation suite: all assertions passed'

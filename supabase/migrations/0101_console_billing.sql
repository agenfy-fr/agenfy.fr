-- Console — quotes (devis) and invoices (factures). No online payment.
--
-- - Amounts are integer cents; VAT rate defaults to 20 %.
-- - Line totals are generated columns; document totals are maintained by
--   triggers from the lines (never trusted from the client).
-- - Numbering: DEV-YYYY-NNNN / FAC-YYYY-NNNN, assigned when a document leaves
--   the `draft` status (French invoicing rule: continuous sequence without
--   gaps for issued invoices; drafts have no number).
-- - An issued document is frozen: its lines and amounts can no longer change,
--   and an issued invoice cannot go back to draft (cancel it instead).
-- - Clients (organization members) only see non-draft documents of their org.
--
-- Depends on 0003 and 0100. NOT applied automatically.

-- ---------------------------------------------------------------------------
-- Numbering
-- ---------------------------------------------------------------------------
create table if not exists public.billing_counters (
  kind text not null check (kind in ('quote', 'invoice')),
  year integer not null check (year between 2000 and 2999),
  last_value integer not null default 0,
  primary key (kind, year)
);

alter table public.billing_counters enable row level security;
create policy "Billing counters: staff read" on public.billing_counters
  for select to authenticated using (public.is_staff());

create or replace function public.next_billing_number(p_kind text, p_date date)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_year integer := extract(year from coalesce(p_date, current_date))::integer;
  v_value integer;
begin
  if p_kind not in ('quote', 'invoice') then
    raise exception 'Type de document inconnu : %', p_kind;
  end if;
  insert into public.billing_counters (kind, year, last_value)
  values (p_kind, v_year, 1)
  on conflict (kind, year) do update set last_value = public.billing_counters.last_value + 1
  returning last_value into v_value;
  return (case p_kind when 'quote' then 'DEV' else 'FAC' end)
    || '-' || v_year::text || '-' || lpad(v_value::text, 4, '0');
end;
$$;

-- Only the issuance triggers (definer) may consume numbers.
revoke execute on function public.next_billing_number(text, date) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Quotes
-- ---------------------------------------------------------------------------
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  number text unique,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined', 'expired')),
  issue_date date,
  valid_until date,
  vat_rate numeric(5, 2) not null default 20.00 check (vat_rate between 0 and 100),
  subtotal_cents bigint not null default 0,
  vat_cents bigint not null default 0,
  total_cents bigint not null default 0,
  notes text check (char_length(notes) <= 5000),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_number_when_issued check (status = 'draft' or number is not null)
);

create index if not exists quotes_org_idx on public.quotes(organization_id, created_at desc);

create table if not exists public.quote_lines (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  position integer not null default 0,
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  total_cents bigint generated always as (round(quantity * unit_price_cents)::bigint) stored,
  created_at timestamptz not null default now()
);

create index if not exists quote_lines_quote_idx on public.quote_lines(quote_id, position);

-- ---------------------------------------------------------------------------
-- Invoices
-- ---------------------------------------------------------------------------
create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  project_id uuid references public.projects(id) on delete set null,
  quote_id uuid references public.quotes(id) on delete set null,
  number text unique,
  title text not null check (char_length(btrim(title)) between 1 and 200),
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'cancelled')),
  issue_date date,
  due_date date,
  paid_at date,
  vat_rate numeric(5, 2) not null default 20.00 check (vat_rate between 0 and 100),
  subtotal_cents bigint not null default 0,
  vat_cents bigint not null default 0,
  total_cents bigint not null default 0,
  notes text check (char_length(notes) <= 5000),
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invoices_number_when_issued check (status = 'draft' or number is not null),
  constraint invoices_paid_check check (status <> 'paid' or paid_at is not null)
);

create index if not exists invoices_org_idx on public.invoices(organization_id, created_at desc);
create index if not exists invoices_status_idx on public.invoices(status, issue_date);

create table if not exists public.invoice_lines (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  position integer not null default 0,
  description text not null check (char_length(btrim(description)) between 1 and 1000),
  quantity numeric(12, 2) not null default 1 check (quantity > 0),
  unit_price_cents bigint not null check (unit_price_cents >= 0),
  total_cents bigint generated always as (round(quantity * unit_price_cents)::bigint) stored,
  created_at timestamptz not null default now()
);

create index if not exists invoice_lines_invoice_idx on public.invoice_lines(invoice_id, position);

-- ---------------------------------------------------------------------------
-- Triggers: project/org consistency, issuance, freezing, totals
-- ---------------------------------------------------------------------------
drop trigger if exists quotes_org on public.quotes;
create trigger quotes_org
  before insert or update of project_id, organization_id on public.quotes
  for each row execute function public.inherit_project_organization();

drop trigger if exists invoices_org on public.invoices;
create trigger invoices_org
  before insert or update of project_id, organization_id on public.invoices
  for each row execute function public.inherit_project_organization();

create or replace function public.billing_document_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kind text := case tg_table_name when 'quotes' then 'quote' else 'invoice' end;
begin
  if tg_op = 'UPDATE' and old.status <> 'draft' then
    if new.status = 'draft' then
      raise exception 'Un document émis ne peut pas repasser en brouillon' using errcode = '23514';
    end if;
    if new.number is distinct from old.number
      or new.vat_rate <> old.vat_rate
      or new.organization_id <> old.organization_id
      or new.issue_date is distinct from old.issue_date then
      raise exception 'Un document émis est figé (numéro, client, date, TVA)' using errcode = '23514';
    end if;
    -- Totals are maintained by line triggers, which cannot run once issued.
    new.subtotal_cents := old.subtotal_cents;
    new.vat_cents := old.vat_cents;
    new.total_cents := old.total_cents;
  end if;

  if new.status = 'draft' then
    new.number := null;
  elsif new.number is null then
    new.issue_date := coalesce(new.issue_date, current_date);
    new.number := public.next_billing_number(v_kind, new.issue_date);
    new.sent_at := coalesce(new.sent_at, now());
  end if;

  -- VAT is recomputed from the subtotal whenever the rate changes on a draft.
  if new.status = 'draft' or tg_op = 'INSERT' then
    new.vat_cents := round(new.subtotal_cents * new.vat_rate / 100)::bigint;
    new.total_cents := new.subtotal_cents + new.vat_cents;
  end if;

  return new;
end;
$$;

drop trigger if exists quotes_guard on public.quotes;
create trigger quotes_guard
  before insert or update on public.quotes
  for each row execute function public.billing_document_guard();

drop trigger if exists invoices_guard on public.invoices;
create trigger invoices_guard
  before insert or update on public.invoices
  for each row execute function public.billing_document_guard();

drop trigger if exists quotes_set_updated_at on public.quotes;
create trigger quotes_set_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

drop trigger if exists invoices_set_updated_at on public.invoices;
create trigger invoices_set_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

-- Lines: only editable while the parent is a draft; parent totals recomputed.
create or replace function public.billing_lines_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_parent uuid;
  v_status text;
begin
  if tg_table_name = 'quote_lines' then
    v_parent := coalesce(new.quote_id, old.quote_id);
    select q.status into v_status from public.quotes q where q.id = v_parent;
  else
    v_parent := coalesce(new.invoice_id, old.invoice_id);
    select i.status into v_status from public.invoices i where i.id = v_parent;
  end if;

  -- Parent already deleted (cascade): nothing to protect or recompute.
  if v_status is null then
    return coalesce(new, old);
  end if;
  if v_status <> 'draft' then
    raise exception 'Document émis : les lignes ne sont plus modifiables' using errcode = '23514';
  end if;
  if tg_op = 'UPDATE' then
    if tg_table_name = 'quote_lines' then
      if new.quote_id <> old.quote_id then
        raise exception 'Une ligne ne peut pas changer de document' using errcode = '23514';
      end if;
    elsif new.invoice_id <> old.invoice_id then
      raise exception 'Une ligne ne peut pas changer de document' using errcode = '23514';
    end if;
  end if;
  return coalesce(new, old);
end;
$$;

create or replace function public.billing_recompute_totals()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_table_name = 'quote_lines' then
    update public.quotes q
      set subtotal_cents = coalesce((select sum(l.total_cents) from public.quote_lines l where l.quote_id = q.id), 0)
      where q.id = coalesce(new.quote_id, old.quote_id) and q.status = 'draft';
  else
    update public.invoices i
      set subtotal_cents = coalesce((select sum(l.total_cents) from public.invoice_lines l where l.invoice_id = i.id), 0)
      where i.id = coalesce(new.invoice_id, old.invoice_id) and i.status = 'draft';
  end if;
  return null;
end;
$$;

drop trigger if exists quote_lines_guard on public.quote_lines;
create trigger quote_lines_guard
  before insert or update or delete on public.quote_lines
  for each row execute function public.billing_lines_guard();
drop trigger if exists quote_lines_totals on public.quote_lines;
create trigger quote_lines_totals
  after insert or update or delete on public.quote_lines
  for each row execute function public.billing_recompute_totals();

drop trigger if exists invoice_lines_guard on public.invoice_lines;
create trigger invoice_lines_guard
  before insert or update or delete on public.invoice_lines
  for each row execute function public.billing_lines_guard();
drop trigger if exists invoice_lines_totals on public.invoice_lines;
create trigger invoice_lines_totals
  after insert or update or delete on public.invoice_lines
  for each row execute function public.billing_recompute_totals();

-- ---------------------------------------------------------------------------
-- RLS — read: any staff; write: owner/admin/sales; clients: issued docs only.
-- ---------------------------------------------------------------------------
alter table public.quotes enable row level security;
alter table public.quote_lines enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;

create policy "Quotes: staff read" on public.quotes
  for select to authenticated using (public.is_staff());
create policy "Quotes: billing staff write" on public.quotes
  for all to authenticated
  using (public.staff_has_role(array['sales'])) with check (public.staff_has_role(array['sales']));
create policy "Quotes: members read issued" on public.quotes
  for select to authenticated using (status <> 'draft' and public.is_org_member(organization_id));

create policy "Quote lines: staff read" on public.quote_lines
  for select to authenticated using (public.is_staff());
create policy "Quote lines: billing staff write" on public.quote_lines
  for all to authenticated
  using (public.staff_has_role(array['sales'])) with check (public.staff_has_role(array['sales']));
create policy "Quote lines: members read issued" on public.quote_lines
  for select to authenticated
  using (exists (
    select 1 from public.quotes q
    where q.id = quote_id and q.status <> 'draft' and public.is_org_member(q.organization_id)
  ));

create policy "Invoices: staff read" on public.invoices
  for select to authenticated using (public.is_staff());
create policy "Invoices: billing staff write" on public.invoices
  for all to authenticated
  using (public.staff_has_role(array['sales'])) with check (public.staff_has_role(array['sales']));
create policy "Invoices: members read issued" on public.invoices
  for select to authenticated using (status <> 'draft' and public.is_org_member(organization_id));

create policy "Invoice lines: staff read" on public.invoice_lines
  for select to authenticated using (public.is_staff());
create policy "Invoice lines: billing staff write" on public.invoice_lines
  for all to authenticated
  using (public.staff_has_role(array['sales'])) with check (public.staff_has_role(array['sales']));
create policy "Invoice lines: members read issued" on public.invoice_lines
  for select to authenticated
  using (exists (
    select 1 from public.invoices i
    where i.id = invoice_id and i.status <> 'draft' and public.is_org_member(i.organization_id)
  ));

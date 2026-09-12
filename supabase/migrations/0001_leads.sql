-- Leads / CRM table (mission brief §21)
--
-- This file is NOT applied automatically. Run it yourself against your
-- Supabase project: Dashboard → SQL Editor → paste this file → Run.
-- (Or `supabase db push` if you have the CLI linked to this project.)

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  email text not null,
  phone text,
  message text,
  service text,
  source text,
  priority text not null default 'Moyenne'
    check (priority in ('Basse', 'Moyenne', 'Haute')),
  status text not null default 'Nouveau'
    check (status in ('Nouveau', 'Contacté', 'Qualifié', 'Proposition', 'Gagné', 'Perdu')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.leads enable row level security;

-- The public contact form submits with the anon key — allow inserts only.
create policy "Anyone can submit a lead"
  on public.leads for insert
  to anon
  with check (true);

-- Only signed-in (admin) users can read, update, or delete leads.
create policy "Authenticated users can view leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "Authenticated users can update leads"
  on public.leads for update
  to authenticated
  using (true);

create policy "Authenticated users can delete leads"
  on public.leads for delete
  to authenticated
  using (true);

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

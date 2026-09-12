-- SECURITY FIX — no dependency on 0001_leads.sql, order between the two
-- doesn't matter, but apply this one urgently: it closes a live data leak.
--
-- Audit finding (2026-09-12): the public/publishable key can currently
-- read every row of public.newsletter_subscribers — anyone who opens the
-- site's JS bundle can extract the anon key and dump the full subscriber
-- email list via the REST API. Verified empirically (insert a row with
-- the service role key, then read it back with the anon key — it came
-- back). This migration is NOT applied automatically; run it yourself:
-- Supabase Dashboard -> SQL Editor -> paste this file -> Run.
-- (Or `supabase db push` if you have the CLI linked to this project.)

alter table public.newsletter_subscribers enable row level security;

-- Drop every existing policy on this table, whatever it's named, so we
-- start from a known-clean state instead of guessing at prior policy
-- names (the table predates this migration and its current policies,
-- if any, are unknown from application code alone).
do $$
declare
  pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'newsletter_subscribers'
  loop
    execute format('drop policy if exists %I on public.newsletter_subscribers', pol.policyname);
  end loop;
end $$;

-- The public newsletter form submits with the anon key — allow inserts only.
create policy "Anyone can subscribe to the newsletter"
  on public.newsletter_subscribers for insert
  to anon
  with check (true);

-- Only signed-in (admin) users can read or remove subscribers.
create policy "Authenticated users can view subscribers"
  on public.newsletter_subscribers for select
  to authenticated
  using (true);

create policy "Authenticated users can delete subscribers"
  on public.newsletter_subscribers for delete
  to authenticated
  using (true);

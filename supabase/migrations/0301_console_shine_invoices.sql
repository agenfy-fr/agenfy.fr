-- Console — invoices issued in Shine (bank + invoicing tool), recorded here.
--
-- Shine is the legal issuer (numbering, PDF, sending). The console keeps a
-- record for follow-up, the client portal and the dashboard:
--   - invoices.source = 'shine': number typed from Shine, amounts typed
--     (HT + TVA), never a draft, no lines; the PDF is a client document
--     (kind 'invoice') linked by invoices.document_id;
--   - unlike console invoices, a Shine record stays editable (it mirrors a
--     document that lives in Shine; corrections must be possible).
-- Console-generated invoices (source 'console', FAC-YYYY-NNNN) are unchanged.
--
-- Depends on 0100 and 0101. NOT applied automatically.

alter table public.invoices
  add column if not exists source text not null default 'console' check (source in ('console', 'shine')),
  add column if not exists document_id uuid references public.client_documents(id) on delete set null;

alter table public.invoices drop constraint if exists invoices_shine_check;
alter table public.invoices add constraint invoices_shine_check
  check (source = 'console' or (status <> 'draft' and number is not null));

alter table public.client_documents drop constraint if exists client_documents_kind_check;
alter table public.client_documents add constraint client_documents_kind_check
  check (kind in ('deliverable', 'contract', 'report', 'invoice', 'other'));

create or replace function public.billing_document_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kind text := case tg_table_name when 'quotes' then 'quote' else 'invoice' end;
begin
  -- Shine records: typed number and amounts, editable, never a draft.
  -- (Nested IFs: quotes have no `source` column.)
  if tg_table_name = 'invoices' then
    if tg_op = 'UPDATE' and new.source is distinct from old.source then
      raise exception 'La source d''une facture ne peut pas changer' using errcode = '23514';
    end if;
    if new.source = 'shine' then
      if new.status = 'draft' or new.number is null or btrim(new.number) = '' then
        raise exception 'Facture Shine : numéro obligatoire, statut émis' using errcode = '23514';
      end if;
      if new.subtotal_cents < 0 or new.vat_cents < 0 then
        raise exception 'Montants négatifs refusés' using errcode = '23514';
      end if;
      new.number := btrim(new.number);
      new.total_cents := new.subtotal_cents + new.vat_cents;
      new.issue_date := coalesce(new.issue_date, current_date);
      new.sent_at := coalesce(new.sent_at, now());
      return new;
    end if;
  end if;

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

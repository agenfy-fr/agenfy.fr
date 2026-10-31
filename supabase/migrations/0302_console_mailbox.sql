-- Console — mailbox settings (IMAP/SMTP, e.g. OVH contact@agenfy.fr).
--
-- Secrets: the password is stored ENCRYPTED (AES-256-GCM) by the console
-- server with MAIL_ENCRYPTION_KEY (Vercel env, never in the database). The
-- table has RLS enabled and NO policy: only the service role (server code,
-- after an owner/admin check) can read or write it. The password never goes
-- back to the browser.
--
-- Without a row here, the console falls back to MAIL_* environment variables.
-- NOT applied automatically.

create table if not exists public.mail_accounts (
  id uuid primary key default gen_random_uuid(),
  email text not null check (char_length(email) between 3 and 320),
  display_name text check (char_length(display_name) <= 120),
  imap_host text not null check (char_length(imap_host) between 1 and 255),
  imap_port integer not null default 993 check (imap_port between 1 and 65535),
  smtp_host text not null check (char_length(smtp_host) between 1 and 255),
  smtp_port integer not null default 465 check (smtp_port between 1 and 65535),
  username text not null check (char_length(username) between 1 and 320),
  password_encrypted text not null,
  signature text check (char_length(signature) <= 2000),
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists mail_accounts_set_updated_at on public.mail_accounts;
create trigger mail_accounts_set_updated_at
  before update on public.mail_accounts
  for each row execute function public.set_updated_at();

alter table public.mail_accounts enable row level security;
revoke all on table public.mail_accounts from anon, authenticated;

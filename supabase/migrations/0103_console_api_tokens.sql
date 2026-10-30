-- Console — personal staff API tokens for the MCP server `agenfy-console`
-- (/api/mcp) + audit log of MCP tool calls. Adapted from Hasfy Console 073/083.
--
-- - One token = one row bound to an auth.users account (deleted with it).
--   Only the SHA-256 of the token is stored; the clear token (`acp_…`) is
--   shown once at creation. token_prefix only identifies it in the UI.
-- - Scopes: console:read / console:write. A token is accepted only while its
--   owner is still non-suspended staff, and write scopes are dropped at use
--   time if the owner's role became `readonly`.
-- - No permissive policy: neither anon nor authenticated can read these tables
--   (not even the hash). Everything goes through server code with the
--   service_role key (settings page server actions + /api/mcp).
--
-- Depends on 0003. NOT applied automatically.

create table if not exists public.staff_api_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 80),
  token_hash text not null unique check (token_hash ~ '^[0-9a-f]{64}$'),
  token_prefix text not null check (char_length(token_prefix) between 4 and 16),
  scopes text[] not null default array['console:read']
    check (cardinality(scopes) >= 1 and scopes <@ array['console:read', 'console:write']),
  created_at timestamptz not null default now(),
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz
);

create index if not exists staff_api_tokens_user_idx on public.staff_api_tokens(user_id, created_at desc);

alter table public.staff_api_tokens enable row level security;
revoke all on public.staff_api_tokens from anon, authenticated;
grant all on public.staff_api_tokens to service_role;

drop policy if exists staff_only on public.staff_api_tokens;
create policy staff_only on public.staff_api_tokens
  as restrictive for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

create table if not exists public.console_mcp_audit (
  id bigint generated always as identity primary key,
  token_id uuid references public.staff_api_tokens(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  tool text not null,
  target_id uuid,
  ok boolean not null,
  error text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists console_mcp_audit_created_idx on public.console_mcp_audit(created_at desc);
create index if not exists console_mcp_audit_token_idx on public.console_mcp_audit(token_id, created_at desc);

alter table public.console_mcp_audit enable row level security;
revoke all on public.console_mcp_audit from anon, authenticated;
grant all on public.console_mcp_audit to service_role;

drop policy if exists staff_only on public.console_mcp_audit;
create policy staff_only on public.console_mcp_audit
  as restrictive for all to authenticated
  using (public.is_staff()) with check (public.is_staff());

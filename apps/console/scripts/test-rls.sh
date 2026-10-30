#!/usr/bin/env bash
# Applies the Supabase migrations to a THROWAWAY local PostgreSQL cluster
# (temporary directory, random port, deleted on exit) and runs the RLS
# isolation suite. Requires PostgreSQL >= 15 binaries (initdb, pg_ctl, psql)
# on PATH. Never touches a real Supabase project.
#
#   pnpm --filter @agenfy/console test:rls
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$HERE/../../.." && pwd)"
MIGRATIONS="$ROOT/supabase/migrations"
SQL="$HERE/../test/sql"

TMP="$(mktemp -d)"
PORT="${RLS_TEST_PORT:-$(( 54000 + RANDOM % 1000 ))}"
cleanup() {
  pg_ctl -D "$TMP/data" -m immediate stop >/dev/null 2>&1 || true
  rm -rf "$TMP"
}
trap cleanup EXIT

initdb -D "$TMP/data" -U postgres --auth=trust --locale=C --encoding=UTF8 >/dev/null
pg_ctl -D "$TMP/data" -o "-p $PORT -k $TMP -c listen_addresses=''" -l "$TMP/log" -w start >/dev/null

PSQL=(psql -X -q -v ON_ERROR_STOP=1 -h "$TMP" -p "$PORT" -U postgres -d postgres)

PGOPTIONS="-c client_min_messages=warning" "${PSQL[@]}" -f "$SQL/supabase-shim.sql"
for f in "$MIGRATIONS"/*.sql; do
  echo "apply $(basename "$f")"
  PGOPTIONS="-c client_min_messages=warning" "${PSQL[@]}" -f "$f"
done
"${PSQL[@]}" -o /dev/null -f "$SQL/rls_isolation.test.sql" 2>&1 | sed -E 's/^(psql:[^ ]+ )?(NOTICE|ERREUR|ERROR): +//'
exit "${PIPESTATUS[0]}"

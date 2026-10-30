/**
 * In-memory Supabase client for planning tests (copied from Hasfy Console).
 *
 * Covers the PostgREST query-builder subset used by src/lib/planning/*:
 * select / insert / update / delete, eq, neq, in, is, not(is), contains, or,
 * order, range, limit, single / maybeSingle, count exact. Simulates the
 * project_tasks_guard trigger (per-project numbering, organization
 * inheritance) from migration 0100.
 */
import { randomUUID } from "node:crypto";

type Row = Record<string, unknown>;
type Filter = (r: Row) => boolean;

export interface FakeDb {
  tables: Record<string, Row[]>;
  /** Force l'échec d'un insert sur une table (code PostgREST). */
  failInsert?: Record<string, { code: string; message: string }>;
}

class Query implements PromiseLike<{ data: unknown; error: unknown; count?: number | null }> {
  private filters: Filter[] = [];
  private op: "select" | "insert" | "update" | "delete" = "select";
  private payload: Row[] | Row | null = null;
  private wantCount = false;
  private mode: "one" | "maybe" | null = null;
  private orderBy: { col: string; asc: boolean }[] = [];
  private lim: number | null = null;
  private rng: [number, number] | null = null;
  private returning = false;

  constructor(
    private readonly db: FakeDb,
    private readonly table: string,
  ) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    if (this.op === "select") this.op = "select";
    else this.returning = true;
    if (opts?.count) this.wantCount = true;
    return this;
  }
  insert(rows: Row[] | Row) {
    this.op = "insert";
    this.payload = rows;
    return this;
  }
  update(patch: Row) {
    this.op = "update";
    this.payload = patch;
    return this;
  }
  delete() {
    this.op = "delete";
    return this;
  }
  eq(col: string, v: unknown) {
    this.filters.push((r) => r[col] === v);
    return this;
  }
  neq(col: string, v: unknown) {
    this.filters.push((r) => r[col] !== v);
    return this;
  }
  in(col: string, vs: unknown[]) {
    this.filters.push((r) => vs.includes(r[col]));
    return this;
  }
  is(col: string, v: unknown) {
    this.filters.push((r) => (r[col] ?? null) === v);
    return this;
  }
  not(col: string, op: string, v: unknown) {
    if (op === "is") this.filters.push((r) => (r[col] ?? null) !== v);
    else this.filters.push((r) => r[col] !== v);
    return this;
  }
  gte(col: string, v: unknown) {
    this.filters.push((r) => r[col] != null && String(r[col]) >= String(v));
    return this;
  }
  lte(col: string, v: unknown) {
    this.filters.push((r) => r[col] != null && String(r[col]) <= String(v));
    return this;
  }
  gt(col: string, v: unknown) {
    this.filters.push((r) => String(r[col]) > String(v));
    return this;
  }
  lt(col: string, v: unknown) {
    this.filters.push((r) => r[col] != null && String(r[col]) < String(v));
    return this;
  }
  contains(col: string, vs: unknown[]) {
    this.filters.push((r) => vs.every((v) => (r[col] as unknown[] | undefined)?.includes(v)));
    return this;
  }
  or(expr: string) {
    // Supporte "a.ilike.%x%,b.ilike.%x%" et "expires_at.is.null,expires_at.gt.<iso>"
    const parts = expr.split(",").map((p) => p.split("."));
    this.filters.push((r) =>
      parts.some(([col, op, ...rest]) => {
        const v = rest.join(".");
        if (op === "ilike") return String(r[col] ?? "").toLowerCase().includes(v.replace(/%/g, "").toLowerCase());
        if (op === "is") return (r[col] ?? null) === null;
        if (op === "not" && v === "is.null") return (r[col] ?? null) !== null;
        if (op === "gt") return r[col] != null && String(r[col]) > v;
        return false;
      }),
    );
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy.push({ col, asc: opts?.ascending ?? true });
    return this;
  }
  limit(n: number) {
    this.lim = n;
    return this;
  }
  range(a: number, b: number) {
    this.rng = [a, b];
    return this;
  }
  maybeSingle() {
    this.mode = "maybe";
    return this;
  }
  then<T1 = any, T2 = never>(
    onfulfilled?: ((v: { data: unknown; error: unknown; count?: number | null }) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null,
  ): PromiseLike<T1 | T2> {
    return Promise.resolve(this.exec()).then(onfulfilled, onrejected);
  }

  singleRow() {
    this.mode = "one";
    return this;
  }

  private rows(): Row[] {
    this.db.tables[this.table] ??= [];
    return this.db.tables[this.table];
  }

  private exec(): { data: unknown; error: unknown; count?: number | null } {
    const all = this.rows();
    let out: Row[];
    if (this.op === "insert") {
      const fail = this.db.failInsert?.[this.table];
      if (fail) return { data: null, error: fail };
      const items = (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[];
      out = [];
      for (const item of items) {
        const row: Row = { id: randomUUID(), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...item };
        if (all.some((r) => r.id === row.id)) return { data: null, error: { code: "23505", message: "duplicate key" } };
        if (this.table === "project_tasks") applyTaskTrigger(this.db, row);
        all.push(row);
        out.push(row);
      }
    } else {
      out = all.filter((r) => this.filters.every((f) => f(r)));
      if (this.op === "update") {
        for (const r of out) {
          const before = { ...r };
          Object.assign(r, this.payload, { updated_at: new Date().toISOString() });
          if (this.table === "project_tasks" && before.project_id !== r.project_id) {
            Object.assign(r, before);
            return { data: null, error: { code: "23514", message: "Une tâche ne peut pas changer de projet" } };
          }
        }
      } else if (this.op === "delete") {
        this.db.tables[this.table] = all.filter((r) => !out.includes(r));
      }
    }

    for (const { col, asc } of [...this.orderBy].reverse()) {
      out = [...out].sort((a, b) => {
        const x = a[col] as string | number;
        const y = b[col] as string | number;
        return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1);
      });
    }
    const count = this.wantCount ? out.length : null;
    if (this.rng) out = out.slice(this.rng[0], this.rng[1] + 1);
    if (this.lim != null) out = out.slice(0, this.lim);

    const copy = out.map((r) => ({ ...r }));
    if (this.mode === "one") {
      if (copy.length !== 1) return { data: null, error: { code: "PGRST116", message: "not single" } };
      return { data: copy[0], error: null };
    }
    if (this.mode === "maybe") return { data: copy[0] ?? null, error: null, count };
    if ((this.op === "update" || this.op === "delete") && !this.returning) return { data: null, error: null, count };
    return { data: copy, error: null, count };
  }
}

function applyTaskTrigger(db: FakeDb, row: Row) {
  const project = (db.tables.projects ?? []).find((p) => p.id === row.project_id);
  if (!project) return;
  row.organization_id = project.organization_id;
  row.number = (project.next_task_number as number | undefined) ?? 1;
  project.next_task_number = (row.number as number) + 1;
  row.labels ??= [];
  row.type ??= "task";
  row.status ??= "backlog";
  row.priority ??= "medium";
  row.client_visible ??= false;
}

export function createFakeSupabase(db: FakeDb) {
  return {
    from(table: string) {
      const q = new Query(db, table);
      // `.single()` est un mot réservé de la classe : on l'expose ici.
      return new Proxy(q, {
        get(target, prop, receiver) {
          if (prop === "single") return () => target.singleRow();
          return Reflect.get(target, prop, receiver);
        },
      });
    },
  };
}

export const ORG_ACME = "aaaaaaaa-0000-4000-8000-000000000000";
export const ORG_OTHER = "bbbbbbbb-0000-4000-8000-000000000000";
export const PROJECT_ACME = "11111111-1111-4111-8111-111111111111";
export const PROJECT_OTHER = "22222222-2222-4222-8222-222222222222";
export const MILESTONE_ACME = "33333333-3333-4333-8333-333333333333";
export const MILESTONE_OTHER = "44444444-4444-4444-8444-444444444444";
export const USER_EVAN = "55555555-5555-4555-8555-555555555555";

export function seedPlanning(): FakeDb {
  return {
    tables: {
      projects: [
        { id: PROJECT_ACME, organization_id: ORG_ACME, code: "ACME", name: "Acme — agents IA", status: "active", next_task_number: 7 },
        { id: PROJECT_OTHER, organization_id: ORG_OTHER, code: "OTHER", name: "Other", status: "active", next_task_number: 1 },
      ],
      project_milestones: [
        { id: MILESTONE_ACME, project_id: PROJECT_ACME, organization_id: ORG_ACME, title: "Cadrage" },
        { id: MILESTONE_OTHER, project_id: PROJECT_OTHER, organization_id: ORG_OTHER, title: "Autre" },
      ],
      project_tasks: [],
      project_task_comments: [],
    },
  };
}

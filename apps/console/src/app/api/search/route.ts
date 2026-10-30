import { canAccessRoute } from "@/lib/access-control";
import { formatTaskKey } from "@/lib/domain";
import { ForbiddenError, UnauthorizedError, requireStaff } from "@/lib/server/auth";
import { ilikeTerm, type SearchResult } from "@/lib/search";

export const dynamic = "force-dynamic";

/** Command palette search (staff only, session client → RLS). */
export async function GET(request: Request) {
  let session;
  try {
    session = await requireStaff();
  } catch (err) {
    const status = err instanceof ForbiddenError ? 403 : err instanceof UnauthorizedError ? 401 : 500;
    return Response.json({ results: [] }, { status });
  }
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? "";
  if (q.length < 2 || q.length > 100) return Response.json({ results: [] });
  const term = ilikeTerm(q);
  const { supabase, role } = session;

  const [orgs, projects, tasks, leads] = await Promise.all([
    supabase.from("organizations").select("id, name").ilike("name", term).limit(5),
    supabase.from("projects").select("id, name, code").or(`name.ilike.${term},code.ilike.${term}`).limit(5),
    supabase.from("project_tasks").select("id, number, title, project_id, projects(code)").ilike("title", term).limit(5),
    canAccessRoute(role, "/leads")
      ? supabase.from("leads").select("id, name, company").or(`name.ilike.${term},company.ilike.${term},email.ilike.${term}`).limit(5)
      : Promise.resolve({ data: [] as { id: string; name: string; company: string | null }[] }),
  ]);

  const results: SearchResult[] = [
    ...(orgs.data ?? []).map((o) => ({ type: "client" as const, title: o.name, href: `/clients/${o.id}` })),
    ...(projects.data ?? []).map((p) => ({ type: "project" as const, title: p.name, subtitle: p.code, href: `/projects/${p.id}` })),
    ...(tasks.data ?? []).map((t) => ({
      type: "task" as const,
      title: t.title,
      subtitle: formatTaskKey((t.projects as unknown as { code: string } | null)?.code, t.number),
      href: `/projects/${t.project_id}`,
    })),
    ...(leads.data ?? []).map((l) => ({ type: "lead" as const, title: l.name, subtitle: l.company ?? undefined, href: "/leads" })),
  ];
  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}

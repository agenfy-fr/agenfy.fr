import type { Metadata } from "next";
import { CheckCircle2, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageTitle, StatCard } from "@/components/notice";
import { ProgressBar } from "@/components/progress-bar";
import { requireManager } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ENROLLMENT_STATUS_LABELS, formatPercent, formatRating } from "@/lib/format";
import { averageProgress, averageRating, completionRate } from "@/lib/progress";
import type { Enrollment, Person } from "@/lib/types";

export const metadata: Metadata = { title: "Mon équipe" };

type Row = Enrollment & {
  courses: { title: string } | null;
  evaluations: { kind: string; overall_rating: number | null }[];
  certificates: { number: string }[];
};

export default async function ManagerPage({ searchParams }: { searchParams: Promise<{ org?: string }> }) {
  const viewer = await requireManager();
  const { org: orgParam } = await searchParams;
  const orgs = viewer.managedOrganizations;
  const supabase = await createClient();

  if (orgs.length === 0) {
    return <PageTitle title="Mon équipe" description="Vous ne gérez aucune organisation cliente." />;
  }
  const org = orgs.find((o) => o.id === orgParam) ?? orgs[0];

  const [{ data }, { data: people }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("*, courses(title), evaluations(kind, overall_rating), certificates(number)")
      .eq("organization_id", org.id)
      .order("created_at"),
    supabase.rpc("training_people"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const directory = new Map(((people ?? []) as Person[]).map((p) => [p.user_id, p]));

  const byCourse = new Map<string, Row[]>();
  for (const r of rows) {
    const key = r.course_id;
    byCourse.set(key, [...(byCourse.get(key) ?? []), r]);
  }
  const hotRatings = (list: Row[]) =>
    list.flatMap((r) => r.evaluations.filter((e) => e.kind === "hot").map((e) => e.overall_rating));

  return (
    <>
      <PageTitle
        eyebrow="Espace manager"
        title={org.name}
        description="Progression de votre équipe, taux de complétion et satisfaction exprimée à chaud."
      />

      {orgs.length > 1 && (
        <nav aria-label="Organisations" className="mb-6 flex flex-wrap gap-2">
          {orgs.map((o) => (
            <a
              key={o.id}
              href={`/manager?org=${o.id}`}
              aria-current={o.id === org.id ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-sm ${o.id === org.id ? "border-primary bg-primary/10 text-primary" : "hover:bg-secondary"}`}
            >
              {o.name}
            </a>
          ))}
        </nav>
      )}

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Apprenants inscrits" value={String(new Set(rows.filter((r) => r.status !== "cancelled").map((r) => r.user_id)).size)} />
        <StatCard label="Taux de complétion" value={formatPercent(completionRate(rows))} />
        <StatCard label="Progression moyenne" value={formatPercent(averageProgress(rows))} />
        <StatCard
          label="Satisfaction moyenne (à chaud)"
          value={formatRating(averageRating(hotRatings(rows)))}
          hint={`${hotRatings(rows).length} réponse(s)`}
        />
      </div>

      {rows.length === 0 ? (
        <p className="text-muted-foreground">Aucun membre de votre organisation n&apos;est encore inscrit.</p>
      ) : (
        <div className="space-y-10">
          {[...byCourse.entries()].map(([courseId, list]) => (
            <section key={courseId}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="text-h3 font-semibold">{list[0].courses?.title}</h2>
                <p className="text-sm text-muted-foreground">
                  Complétion {formatPercent(completionRate(list))} · Satisfaction {formatRating(averageRating(hotRatings(list)))}
                </p>
              </div>
              <div className="overflow-x-auto rounded-2xl border">
                <table className="w-full min-w-[640px] text-sm">
                  <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3">Apprenant</th>
                      <th scope="col" className="px-4 py-3">Statut</th>
                      <th scope="col" className="px-4 py-3 w-48">Progression</th>
                      <th scope="col" className="px-4 py-3">Positionnement</th>
                      <th scope="col" className="px-4 py-3">Satisfaction</th>
                      <th scope="col" className="px-4 py-3">Attestation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {list.map((r) => {
                      const p = directory.get(r.user_id);
                      const hot = r.evaluations.find((e) => e.kind === "hot");
                      return (
                        <tr key={r.id}>
                          <td className="px-4 py-3">
                            <p className="font-medium">{p?.full_name || p?.email || "Apprenant"}</p>
                            {p?.full_name && <p className="text-xs text-muted-foreground">{p.email}</p>}
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={r.status === "completed" ? "default" : "secondary"}>{ENROLLMENT_STATUS_LABELS[r.status]}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <ProgressBar value={r.progress_percent} />
                              <span className="w-10 text-right tabular-nums">{r.progress_percent} %</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {r.evaluations.some((e) => e.kind === "positioning") ? (
                              <CheckCircle2 className="size-4 text-primary" aria-label="Fait" />
                            ) : (
                              <Minus className="size-4 text-muted-foreground" aria-label="Non fait" />
                            )}
                          </td>
                          <td className="px-4 py-3 tabular-nums">{hot ? formatRating(hot.overall_rating) : "—"}</td>
                          <td className="px-4 py-3 font-mono text-xs">{r.certificates[0]?.number ?? "—"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}

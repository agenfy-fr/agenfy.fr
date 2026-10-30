import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { PageTitle, StatCard } from "@/components/notice";
import { createClient } from "@/lib/supabase/server";
import { EVALUATION_LABELS, type EvaluationKind } from "@/lib/evaluation-forms";
import { formatDateTime, formatRating } from "@/lib/format";
import { averageRating } from "@/lib/progress";
import type { Evaluation, Person } from "@/lib/types";

export const metadata: Metadata = { title: "Évaluations" };

type Row = Evaluation & { courses: { title: string } | null };

export default async function EvaluationsPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const { kind } = await searchParams;
  const filter = kind && kind in EVALUATION_LABELS ? (kind as EvaluationKind) : null;
  const supabase = await createClient();
  let query = supabase.from("evaluations").select("*, courses(title)").order("submitted_at", { ascending: false }).limit(300);
  if (filter) query = query.eq("kind", filter);
  const [{ data }, { data: people }] = await Promise.all([query, supabase.rpc("training_people")]);
  const rows = (data ?? []) as unknown as Row[];
  const directory = new Map(((people ?? []) as Person[]).map((p) => [p.user_id, p]));

  const kinds: EvaluationKind[] = ["positioning", "hot", "cold"];

  return (
    <>
      <PageTitle
        title="Évaluations"
        description="Positionnement, satisfaction à chaud et évaluation à froid (J+60)."
        actions={
          <a href={`/staff/exports/evaluations${filter ? `?kind=${filter}` : ""}`} className="rounded-full border px-4 py-2 text-sm hover:bg-secondary">
            Export CSV
          </a>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {kinds.map((k) => {
          const list = rows.filter((r) => r.kind === k);
          return (
            <StatCard
              key={k}
              label={EVALUATION_LABELS[k]}
              value={filter && filter !== k ? "—" : `${list.length} réponse(s)`}
              hint={k === "positioning" ? `Niveau moyen auto-évalué : ${formatRating(averageRating(list.map((r) => r.overall_rating)))}` : `Note moyenne : ${formatRating(averageRating(list.map((r) => r.overall_rating)))}`}
            />
          );
        })}
      </div>
      <nav aria-label="Filtrer" className="mb-4 flex flex-wrap gap-2 text-sm">
        <a href="/staff/evaluations" className={`rounded-full border px-3 py-1 ${!filter ? "border-primary text-primary" : ""}`}>Toutes</a>
        {kinds.map((k) => (
          <a key={k} href={`/staff/evaluations?kind=${k}`} className={`rounded-full border px-3 py-1 ${filter === k ? "border-primary text-primary" : ""}`}>
            {EVALUATION_LABELS[k]}
          </a>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="text-muted-foreground">Aucune réponse pour le moment.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const p = directory.get(r.user_id);
            return (
              <li key={r.id} className="rounded-2xl border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{EVALUATION_LABELS[r.kind]}</Badge>
                    <span className="font-medium">{p?.full_name || p?.email}</span>
                    <span className="text-sm text-muted-foreground">· {r.courses?.title}</span>
                  </div>
                  <span className="text-sm tabular-nums">{formatRating(r.overall_rating)}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(r.submitted_at)} · {r.form_version}</p>
                {r.comment && <p className="mt-3 whitespace-pre-line text-sm">{r.comment}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}

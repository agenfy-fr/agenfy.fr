import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Notice, PageTitle } from "@/components/notice";
import { createClient } from "@/lib/supabase/server";
import { MODALITY_LABELS, formatHours, formatPercent, formatRating } from "@/lib/format";
import { averageRating, completionRate } from "@/lib/progress";
import type { Course, Enrollment } from "@/lib/types";

export const metadata: Metadata = { title: "Espace formateur" };

const STATUS_LABELS: Record<string, string> = { draft: "Brouillon", published: "Publiée", archived: "Archivée" };

export default async function StaffHomePage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const [{ data: courses }, { data: enrollments }, { data: evaluations }, { data: lessons }] = await Promise.all([
    supabase.from("courses").select("*").order("title"),
    supabase.from("enrollments").select("course_id, status, progress_percent"),
    supabase.from("evaluations").select("course_id, kind, overall_rating").eq("kind", "hot"),
    supabase.from("lessons").select("course_id"),
  ]);

  return (
    <>
      <PageTitle
        eyebrow="Espace formateur"
        title="Formations"
        description="Catalogue, inscriptions, complétion et satisfaction par formation."
      />
      {error === "readonly" && (
        <Notice tone="error" className="mb-6">
          Votre rôle staff est en lecture seule.
        </Notice>
      )}
      <div className="overflow-x-auto rounded-2xl border">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3">Formation</th>
              <th scope="col" className="px-4 py-3">Statut</th>
              <th scope="col" className="px-4 py-3">Durée</th>
              <th scope="col" className="px-4 py-3">Leçons</th>
              <th scope="col" className="px-4 py-3">Inscrits</th>
              <th scope="col" className="px-4 py-3">Complétion</th>
              <th scope="col" className="px-4 py-3">Satisfaction à chaud</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {((courses ?? []) as Course[]).map((c) => {
              const list = ((enrollments ?? []) as Pick<Enrollment, "course_id" | "status" | "progress_percent">[]).filter(
                (e) => e.course_id === c.id,
              );
              const ratings = (evaluations ?? []).filter((e) => e.course_id === c.id).map((e) => e.overall_rating as number | null);
              return (
                <tr key={c.id}>
                  <td className="px-4 py-3">
                    <Link href={c.status === "published" ? `/catalogue/${c.slug}` : "#"} className="font-medium hover:text-primary">
                      {c.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      {MODALITY_LABELS[c.modality]} · v{c.version}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={c.status === "published" ? "default" : "secondary"}>{STATUS_LABELS[c.status]}</Badge>
                  </td>
                  <td className="px-4 py-3">{formatHours(Number(c.duration_hours))}</td>
                  <td className="px-4 py-3 tabular-nums">{(lessons ?? []).filter((l) => l.course_id === c.id).length}</td>
                  <td className="px-4 py-3 tabular-nums">{list.filter((e) => e.status !== "cancelled").length}</td>
                  <td className="px-4 py-3 tabular-nums">{formatPercent(completionRate(list))}</td>
                  <td className="px-4 py-3 tabular-nums">
                    {formatRating(averageRating(ratings))}
                    <span className="text-xs text-muted-foreground"> ({ratings.length})</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">
        Le contenu des formations est versionné dans <code>apps/app/content/courses</code> et publié via une migration
        de seed (voir README).
      </p>
    </>
  );
}

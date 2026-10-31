import type { Metadata } from "next";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { DataTable, DataTableHead, Td, Th, Tr } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TRAINING_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { formatDate } from "@/lib/format";
import { requireStaffPage } from "@/lib/server/auth";
import { COURSE_MODALITY_LABELS, COURSE_STATUS_META } from "@/lib/training";
import { metaOf } from "@/lib/domain";
import { NewCourseButton } from "./training-forms";

export const metadata: Metadata = { title: "Formations" };

interface Row {
  id: string;
  title: string;
  slug: string;
  status: string;
  modality: keyof typeof COURSE_MODALITY_LABELS;
  duration_hours: number;
  updated_at: string;
  course_modules: { id: string }[];
  lessons: { id: string; video_url: string | null; video_path: string | null }[];
  enrollments: { status: string }[];
}

export default async function TrainingPage() {
  const { supabase, role } = await requireStaffPage("/training");
  const { data } = await supabase
    .from("courses")
    .select("id, title, slug, status, modality, duration_hours, updated_at, course_modules(id), lessons(id, video_url, video_path), enrollments(status)")
    .order("status")
    .order("title");
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Formations"
        description="Catalogue de l'espace formation (app.agenfy.fr) : modules, leçons (articles et vidéos). Seules les formations publiées sont accessibles aux inscrits."
        actions={canWriteDomain(role, TRAINING_WRITE_ROLES) ? <NewCourseButton /> : null}
      />
      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState icon={<GraduationCap className="h-6 w-6" />} title="Aucune formation" description="Créez une première formation." />
        ) : (
          <DataTable label="Liste des formations">
            <DataTableHead>
              <tr>
                <Th>Formation</Th>
                <Th>Statut</Th>
                <Th>Modalité</Th>
                <Th numeric>Modules</Th>
                <Th numeric>Leçons</Th>
                <Th numeric>Vidéos</Th>
                <Th numeric>Inscrits actifs</Th>
                <Th>Modifiée le</Th>
              </tr>
            </DataTableHead>
            <tbody>
              {rows.map((r) => (
                <Tr key={r.id}>
                  <Td>
                    <Link href={`/training/${r.id}`} className="font-medium hover:underline">
                      {r.title}
                    </Link>
                    <p className="font-mono text-xs text-muted-foreground">{r.slug}</p>
                  </Td>
                  <Td>
                    <StatusBadge size="sm" {...metaOf(COURSE_STATUS_META, r.status)} />
                  </Td>
                  <Td muted>
                    {COURSE_MODALITY_LABELS[r.modality] ?? r.modality} · {r.duration_hours} h
                  </Td>
                  <Td numeric>{r.course_modules.length}</Td>
                  <Td numeric>{r.lessons.length}</Td>
                  <Td numeric>{r.lessons.filter((l) => l.video_url || l.video_path).length}</Td>
                  <Td numeric>{r.enrollments.filter((e) => e.status !== "cancelled").length}</Td>
                  <Td muted>{formatDate(r.updated_at)}</Td>
                </Tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </Card>
    </div>
  );
}

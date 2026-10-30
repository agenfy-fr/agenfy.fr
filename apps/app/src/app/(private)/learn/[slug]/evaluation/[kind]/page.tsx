import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Notice, PageTitle } from "@/components/notice";
import { getLearnerCourse } from "@/lib/learner";
import { EVALUATION_FORMS, type EvaluationKind } from "@/lib/evaluation-forms";
import { coldEvaluationDueDate, isColdEvaluationOpen } from "@/lib/progress";
import { formatDate, formatDateTime } from "@/lib/format";
import { EvaluationFormView } from "./evaluation-form";

export const metadata: Metadata = { title: "Évaluation" };

export default async function EvaluationPage({ params }: { params: Promise<{ slug: string; kind: string }> }) {
  const { slug, kind } = await params;
  if (!(kind in EVALUATION_FORMS)) notFound();
  const k = kind as EvaluationKind;
  const form = EVALUATION_FORMS[k];
  const { course, enrollment, evaluations } = await getLearnerCourse(slug);
  const existing = evaluations[k];

  let blocked: string | null = null;
  if ((k === "hot" || k === "cold") && enrollment.status !== "completed") {
    blocked = "Ce questionnaire sera disponible lorsque vous aurez terminé la formation.";
  } else if (k === "cold" && !isColdEvaluationOpen(enrollment.completed_at)) {
    blocked = `Le questionnaire à froid s'ouvrira le ${formatDate(coldEvaluationDueDate(enrollment.completed_at))}, 60 jours après la fin de la formation. Vous recevrez une invitation.`;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/learn/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {course.title}
      </Link>
      <PageTitle eyebrow={course.title} title={form.title} description={form.intro} />

      {existing ? (
        <Notice tone="success">
          Merci, vos réponses ont été enregistrées le {formatDateTime(existing.submitted_at)}.
        </Notice>
      ) : blocked ? (
        <Notice>{blocked}</Notice>
      ) : (
        <EvaluationFormView kind={k} courseSlug={slug} objectives={course.objectives} />
      )}
    </div>
  );
}

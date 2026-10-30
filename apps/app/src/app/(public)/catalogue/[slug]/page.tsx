import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedCourse } from "@/lib/catalogue";
import {
  CATEGORY_LABELS,
  LEVEL_LABELS,
  MODALITY_LABELS,
  formatDate,
  formatDuration,
  formatHours,
  formatPrice,
} from "@/lib/format";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPublishedCourse(slug);
  if (!data) return { title: "Formation introuvable" };
  return {
    title: data.course.title,
    description: data.course.subtitle ?? undefined,
    robots: { index: true, follow: true },
    alternates: { canonical: `/catalogue/${slug}` },
  };
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border/60 py-3 last:border-0">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

export default async function CoursePublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPublishedCourse(slug);
  if (!data) notFound();
  const { course, modules } = data;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Catalogue
      </Link>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge>{CATEGORY_LABELS[course.category]}</Badge>
            <Badge variant="outline">{LEVEL_LABELS[course.level]}</Badge>
            <Badge variant="outline">{MODALITY_LABELS[course.modality]}</Badge>
          </div>
          <h1 className="text-h1 font-bold">{course.title}</h1>
          {course.subtitle && <p className="mt-3 text-lg text-muted-foreground">{course.subtitle}</p>}

          <section className="mt-10">
            <h2 className="text-h3 font-semibold mb-4">Objectifs pédagogiques</h2>
            <p className="text-sm text-muted-foreground mb-3">À l&apos;issue de la formation, vous serez capable de :</p>
            <ul className="space-y-2">
              {course.objectives.map((o) => (
                <li key={o} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-h3 font-semibold mb-4">Programme</h2>
            <ol className="space-y-3">
              {modules.map((m) => (
                <li key={m.id} className="rounded-xl border bg-card p-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-semibold">
                      <span className="text-primary mr-2">{m.position}.</span>
                      {m.title}
                    </h3>
                    <span className="shrink-0 text-xs text-muted-foreground">{formatDuration(m.duration_minutes)}</span>
                  </div>
                  {m.summary && <p className="mt-2 text-sm text-muted-foreground">{m.summary}</p>}
                </li>
              ))}
            </ol>
          </section>

          {course.teaching_methods && (
            <section className="mt-10">
              <h2 className="text-h3 font-semibold mb-3">Méthodes pédagogiques</h2>
              <p className="text-muted-foreground whitespace-pre-line">{course.teaching_methods}</p>
            </section>
          )}
          {course.evaluation_methods && (
            <section className="mt-8">
              <h2 className="text-h3 font-semibold mb-3">Modalités d&apos;évaluation</h2>
              <p className="text-muted-foreground whitespace-pre-line">{course.evaluation_methods}</p>
            </section>
          )}
        </article>

        <aside className="lg:sticky lg:top-24 h-fit rounded-2xl border bg-card p-6">
          <dl>
            <InfoRow label="Durée">{course.duration_label ?? formatHours(course.duration_hours)}</InfoRow>
            <InfoRow label="Modalité">{MODALITY_LABELS[course.modality]}</InfoRow>
            <InfoRow label="Public">{course.audience}</InfoRow>
            <InfoRow label="Prérequis">{course.prerequisites}</InfoRow>
            {course.max_group_size && <InfoRow label="Groupe">Jusqu&apos;à {course.max_group_size} participants</InfoRow>}
            <InfoRow label="Tarif indicatif">{formatPrice(course.price_ht_cents, course.price_label)}</InfoRow>
            {course.access_delay && <InfoRow label="Délai d'accès">{course.access_delay}</InfoRow>}
            {course.accessibility && <InfoRow label="Accessibilité">{course.accessibility}</InfoRow>}
            <InfoRow label="Mise à jour du programme">
              {formatDate(course.updated_at)} (version {course.version})
            </InfoRow>
          </dl>
          <Button asChild className="mt-6 w-full rounded-full gradient-btn border-0 text-white">
            <a href={`mailto:contact@agenfy.fr?subject=${encodeURIComponent(`Formation : ${course.title}`)}`}>
              <Mail /> Demander un programme détaillé
            </a>
          </Button>
        </aside>
      </div>
    </div>
  );
}

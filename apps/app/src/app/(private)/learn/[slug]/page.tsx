import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, CheckCircle2, Circle, ClipboardCheck, ListChecks, PenLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle } from "@/components/notice";
import { ProgressBar } from "@/components/progress-bar";
import { getLearnerCourse } from "@/lib/learner";
import { formatDate, formatDuration, formatHours } from "@/lib/format";
import { isColdEvaluationOpen, coldEvaluationDueDate, nextLesson } from "@/lib/progress";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { course } = await getLearnerCourse(slug);
  return { title: course.title };
}

export default async function LearnCoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { course, enrollment, modules, completedLessonIds, evaluations, certificate } = await getLearnerCourse(slug);
  const next = nextLesson(modules, completedLessonIds);
  const base = `/learn/${slug}`;
  const completed = enrollment.status === "completed";
  const coldDue = coldEvaluationDueDate(enrollment.completed_at);

  return (
    <>
      <PageTitle
        eyebrow={course.duration_label ?? formatHours(course.duration_hours)}
        title={course.title}
        description={course.subtitle}
        actions={
          next ? (
            <Button asChild size="lg" className="rounded-full gradient-btn border-0 text-white">
              <Link href={`${base}/lecon/${next.slug}`}>
                {completedLessonIds.size === 0 ? "Commencer" : "Reprendre"} <ArrowRight />
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-8 rounded-2xl border bg-card p-5">
        <div className="flex items-center gap-3">
          <ProgressBar value={enrollment.progress_percent} />
          <span className="w-12 text-right font-semibold tabular-nums">{enrollment.progress_percent} %</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {completedLessonIds.size} leçon(s) terminée(s) sur {modules.reduce((n, m) => n + m.lessons.length, 0)}
        </p>
      </div>

      {!evaluations.positioning && (
        <Notice className="mb-8">
          <p className="font-medium">Commencez par le test de positionnement (5 minutes).</p>
          <p className="mt-1 text-muted-foreground">
            Il permet au formateur d&apos;adapter la formation à votre niveau et à vos attentes.
          </p>
          <Link href={`${base}/evaluation/positioning`} className="mt-2 inline-flex items-center gap-1 font-medium text-primary hover:underline">
            Faire le test <ArrowRight className="size-4" />
          </Link>
        </Notice>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
        <section aria-label="Programme">
          <ol className="space-y-4">
            {modules.map((m) => {
              const doneCount = m.lessons.filter((l) => completedLessonIds.has(l.id)).length;
              return (
                <li key={m.id} className="rounded-2xl border bg-card">
                  <div className="flex items-start justify-between gap-4 border-b p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Module {m.position}</p>
                      <h2 className="mt-1 font-semibold">{m.title}</h2>
                      {m.summary && <p className="mt-1 text-sm text-muted-foreground">{m.summary}</p>}
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {doneCount}/{m.lessons.length} · {formatDuration(m.duration_minutes)}
                    </span>
                  </div>
                  <ul className="divide-y">
                    {m.lessons.map((l) => {
                      const done = completedLessonIds.has(l.id);
                      return (
                        <li key={l.id}>
                          <Link
                            href={`${base}/lecon/${l.slug}`}
                            className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-secondary/60"
                          >
                            {done ? (
                              <CheckCircle2 className="size-4 shrink-0 text-primary" aria-label="Terminée" />
                            ) : (
                              <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="À faire" />
                            )}
                            <span className="flex-1">{l.title}</span>
                            <span className="text-xs text-muted-foreground">{formatDuration(l.duration_minutes)}</span>
                          </Link>
                        </li>
                      );
                    })}
                    {m.quiz && (
                      <li>
                        <Link
                          href={`${base}/quiz/${m.quiz.id}`}
                          className="flex items-center gap-3 px-5 py-3 text-sm hover:bg-secondary/60"
                        >
                          <ListChecks className={`size-4 shrink-0 ${m.quiz.passed ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="flex-1">Quiz : {m.quiz.title}</span>
                          {m.quiz.bestScore !== null ? (
                            <Badge variant={m.quiz.passed ? "default" : "outline"}>{m.quiz.bestScore} %</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">À faire</span>
                          )}
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              );
            })}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card p-5">
            <h2 className="mb-3 font-semibold">Votre parcours</h2>
            <ul className="space-y-3 text-sm">
              <Step done={!!evaluations.positioning} href={`${base}/evaluation/positioning`} icon={ClipboardCheck}>
                Test de positionnement
              </Step>
              <Step done={completed} href={next ? `${base}/lecon/${next.slug}` : base} icon={ListChecks}>
                Leçons et quiz
              </Step>
              <Step done={!!evaluations.hot} href={`${base}/evaluation/hot`} icon={ClipboardCheck} disabled={!completed}>
                Satisfaction à chaud
              </Step>
              <Step done={!!certificate} href={`${base}/attestation`} icon={Award} disabled={!completed}>
                Attestation de fin de formation
              </Step>
              <Step
                done={!!evaluations.cold}
                href={`${base}/evaluation/cold`}
                icon={ClipboardCheck}
                disabled={!isColdEvaluationOpen(enrollment.completed_at)}
              >
                Questionnaire à froid
                {coldDue && !evaluations.cold && (
                  <span className="block text-xs text-muted-foreground">à partir du {formatDate(coldDue)}</span>
                )}
              </Step>
            </ul>
          </div>
          {enrollment.cohort_id && (
            <Link
              href={`${base}/emargement`}
              className="flex items-center gap-2 rounded-2xl border bg-card p-4 text-sm font-medium hover:text-primary"
            >
              <PenLine className="size-4 text-primary" /> Émargement des sessions live
            </Link>
          )}
        </aside>
      </div>
    </>
  );
}

function Step({
  done,
  href,
  icon: Icon,
  disabled,
  children,
}: {
  done: boolean;
  href: string;
  icon: typeof Award;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const content = (
    <span className="flex items-start gap-2">
      {done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
      <span>{children}</span>
    </span>
  );
  if (disabled && !done) return <li className="text-muted-foreground opacity-70">{content}</li>;
  return (
    <li>
      <Link href={href} className="hover:text-primary">
        {content}
      </Link>
    </li>
  );
}

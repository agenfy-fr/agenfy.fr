import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Award, CalendarClock, ClipboardCheck, MessageSquareWarning, Video } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Notice, PageTitle } from "@/components/notice";
import { ProgressBar } from "@/components/progress-bar";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ENROLLMENT_STATUS_LABELS, MODALITY_LABELS, formatDateTime, formatTime } from "@/lib/format";
import { isColdEvaluationOpen } from "@/lib/progress";
import { hoursAgo } from "@/lib/dates";
import type { Course, Enrollment, Session } from "@/lib/types";

export const metadata: Metadata = { title: "Mes formations" };

type EnrollmentRow = Enrollment & {
  courses: Pick<Course, "id" | "slug" | "title" | "subtitle" | "modality" | "duration_label"> | null;
  evaluations: { kind: string }[];
  certificates: { number: string }[];
};

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const viewer = await requireViewer();
  const supabase = await createClient();

  const { data } = await supabase
    .from("enrollments")
    .select(
      "*, courses(id, slug, title, subtitle, modality, duration_label), evaluations(kind), certificates(number)",
    )
    .eq("user_id", viewer.id)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false });
  const enrollments = (data ?? []) as unknown as EnrollmentRow[];

  const cohortIds = enrollments.map((e) => e.cohort_id).filter((id): id is string => !!id);
  const { data: sessionsData } = cohortIds.length
    ? await supabase
        .from("sessions")
        .select("*")
        .in("cohort_id", cohortIds)
        .gte("ends_at", hoursAgo(1))
        .order("starts_at")
        .limit(4)
    : { data: [] };
  const sessions = (sessionsData ?? []) as Session[];
  const courseByCohort = new Map(enrollments.map((e) => [e.cohort_id, e.courses]));

  const todos: { href: string; label: string; icon: typeof ClipboardCheck }[] = [];
  for (const e of enrollments) {
    if (!e.courses) continue;
    const kinds = new Set(e.evaluations.map((x) => x.kind));
    const base = `/learn/${e.courses.slug}`;
    if (!kinds.has("positioning"))
      todos.push({ href: `${base}/evaluation/positioning`, label: `Test de positionnement — ${e.courses.title}`, icon: ClipboardCheck });
    if (e.status === "completed" && !kinds.has("hot"))
      todos.push({ href: `${base}/evaluation/hot`, label: `Questionnaire de satisfaction — ${e.courses.title}`, icon: ClipboardCheck });
    if (e.status === "completed" && !kinds.has("cold") && isColdEvaluationOpen(e.completed_at))
      todos.push({ href: `${base}/evaluation/cold`, label: `Questionnaire à froid (J+60) — ${e.courses.title}`, icon: ClipboardCheck });
    if (e.status === "completed" && e.certificates.length === 0)
      todos.push({ href: `${base}/attestation`, label: `Attestation disponible — ${e.courses.title}`, icon: Award });
  }

  return (
    <>
      <PageTitle
        eyebrow="Tableau de bord"
        title={viewer.fullName ? `Bonjour ${viewer.fullName.split(" ")[0]}` : "Bonjour"}
        description="Retrouvez vos formations, votre progression et vos prochaines sessions."
      />

      {error === "not-enrolled" && (
        <Notice tone="error" className="mb-6">
          Vous n&apos;êtes pas inscrit à cette formation. Contactez votre référent ou Agenfy.
        </Notice>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="courses-title">
          <h2 id="courses-title" className="mb-4 text-h3 font-semibold">
            Mes formations
          </h2>
          {enrollments.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-muted-foreground">
              <p>Vous n&apos;êtes inscrit à aucune formation pour le moment.</p>
              <Button asChild variant="outline" className="mt-4 rounded-full">
                <Link href="/">Découvrir le catalogue</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {enrollments.map((e) =>
                e.courses ? (
                  <li key={e.id} className="rounded-2xl border bg-card p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={e.status === "completed" ? "default" : "secondary"}>
                        {ENROLLMENT_STATUS_LABELS[e.status]}
                      </Badge>
                      <Badge variant="outline">{MODALITY_LABELS[e.courses.modality]}</Badge>
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{e.courses.title}</h3>
                    {e.courses.subtitle && <p className="mt-1 text-sm text-muted-foreground">{e.courses.subtitle}</p>}
                    <div className="mt-5 flex items-center gap-3">
                      <ProgressBar value={e.progress_percent} label={`Progression ${e.courses.title}`} />
                      <span className="w-12 text-right text-sm font-medium tabular-nums">{e.progress_percent} %</span>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2">
                      <Button asChild className="rounded-full gradient-btn border-0 text-white">
                        <Link href={`/learn/${e.courses.slug}`}>
                          {e.progress_percent === 0 ? "Commencer" : e.status === "completed" ? "Revoir" : "Continuer"}
                          <ArrowRight />
                        </Link>
                      </Button>
                      {e.certificates[0] && (
                        <Button asChild variant="outline" className="rounded-full">
                          <Link href={`/learn/${e.courses.slug}/attestation`}>
                            <Award /> Attestation
                          </Link>
                        </Button>
                      )}
                    </div>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </section>

        <aside className="space-y-6">
          <section aria-labelledby="sessions-title" className="rounded-2xl border bg-card p-5">
            <h2 id="sessions-title" className="mb-3 flex items-center gap-2 font-semibold">
              <CalendarClock className="size-4 text-primary" /> Prochaines sessions
            </h2>
            {sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune session live planifiée.</p>
            ) : (
              <ul className="space-y-3">
                {sessions.map((s) => {
                  const course = courseByCohort.get(s.cohort_id);
                  return (
                    <li key={s.id} className="text-sm">
                      <p className="font-medium">{s.title ?? course?.title}</p>
                      <p className="text-muted-foreground">
                        {formatDateTime(s.starts_at)} – {formatTime(s.ends_at)}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-3">
                        {course && (
                          <Link className="text-primary hover:underline" href={`/learn/${course.slug}/emargement`}>
                            Émarger
                          </Link>
                        )}
                        {s.meeting_url && (
                          <a
                            className="inline-flex items-center gap-1 text-primary hover:underline"
                            href={s.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Video className="size-3.5" /> Rejoindre
                          </a>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="todo-title" className="rounded-2xl border bg-card p-5">
            <h2 id="todo-title" className="mb-3 font-semibold">
              À faire
            </h2>
            {todos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Rien en attente. Bravo !</p>
            ) : (
              <ul className="space-y-2">
                {todos.map((t) => (
                  <li key={t.href}>
                    <Link href={t.href} className="flex items-start gap-2 text-sm hover:text-primary">
                      <t.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                      {t.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <Link
            href="/reclamation"
            className="flex items-center gap-2 rounded-2xl border p-4 text-sm text-muted-foreground hover:text-foreground"
          >
            <MessageSquareWarning className="size-4" /> Signaler une difficulté ou faire une réclamation
          </Link>
        </aside>
      </div>
    </>
  );
}

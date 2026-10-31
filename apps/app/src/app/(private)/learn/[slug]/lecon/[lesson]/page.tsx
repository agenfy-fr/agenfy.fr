import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock, Dumbbell, ExternalLink, ListChecks, PlayCircle, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/markdown";
import { ProgressBar } from "@/components/progress-bar";
import { SubmitButton } from "@/components/submit-button";
import { getLearnerCourse } from "@/lib/learner";
import { createClient } from "@/lib/supabase/server";
import { formatDuration } from "@/lib/format";
import { lessonNeighbours } from "@/lib/progress";
import type { Lesson } from "@/lib/types";
import { SIGNED_VIDEO_TTL, TRAINING_VIDEO_BUCKET, resolveVideoUrl, type ResolvedVideo } from "@/lib/video";
import { setLessonCompleted } from "../../../actions";

type Params = Promise<{ slug: string; lesson: string }>;

async function loadLesson(courseId: string, lessonSlug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .eq("slug", lessonSlug)
    .maybeSingle<Lesson>();
  return data;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug, lesson } = await params;
  const { course, modules } = await getLearnerCourse(slug);
  const l = modules.flatMap((m) => m.lessons).find((x) => x.slug === lesson);
  return { title: l ? `${l.title} — ${course.title}` : course.title };
}

/**
 * Video of the lesson: uploaded file (private bucket, signed URL created with
 * the learner's session — Storage RLS only lets enrolled learners and staff
 * read it) or https link (YouTube / Vimeo / Loom embed, direct file, link).
 */
async function lessonVideo(lesson: Lesson): Promise<ResolvedVideo | null> {
  if (lesson.video_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage.from(TRAINING_VIDEO_BUCKET).createSignedUrl(lesson.video_path, SIGNED_VIDEO_TTL);
    return data?.signedUrl ? { kind: "file", src: data.signedUrl } : null;
  }
  return resolveVideoUrl(lesson.video_url);
}

export default async function LessonPage({ params }: { params: Params }) {
  const { slug, lesson: lessonSlug } = await params;
  const { course, enrollment, modules, completedLessonIds } = await getLearnerCourse(slug);
  const lesson = await loadLesson(course.id, lessonSlug);
  if (!lesson) notFound();

  const currentModule = modules.find((m) => m.id === lesson.module_id);
  const { previous, next, index, total } = lessonNeighbours(modules, lesson.slug);
  const done = completedLessonIds.has(lesson.id);
  const isLastOfModule = currentModule?.lessons.at(-1)?.id === lesson.id;
  const base = `/learn/${slug}`;
  const video = await lessonVideo(lesson);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <nav aria-label="Sommaire de la formation" className="order-2 lg:order-1">
        <div className="lg:sticky lg:top-24 rounded-2xl border bg-card p-4 max-h-60 overflow-y-auto lg:max-h-[calc(100vh-8rem)]">
          <Link href={base} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Vue d&apos;ensemble
          </Link>
          <div className="mb-4 flex items-center gap-2">
            <ProgressBar value={enrollment.progress_percent} />
            <span className="text-xs tabular-nums">{enrollment.progress_percent} %</span>
          </div>
          <ol className="space-y-4">
            {modules.map((m) => (
              <li key={m.id}>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.position}. {m.title}
                </p>
                <ul className="space-y-0.5">
                  {m.lessons.map((l) => {
                    const active = l.id === lesson.id;
                    return (
                      <li key={l.id}>
                        <Link
                          href={`${base}/lecon/${l.slug}`}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-start gap-2 rounded-md px-2 py-1.5 text-sm ${
                            active ? "bg-primary/10 font-medium text-primary" : "hover:bg-secondary"
                          }`}
                        >
                          {completedLessonIds.has(l.id) ? (
                            <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-primary" aria-label="Terminée" />
                          ) : (
                            <Circle className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                          )}
                          {l.title}
                        </Link>
                      </li>
                    );
                  })}
                  {m.quiz && (
                    <li>
                      <Link
                        href={`${base}/quiz/${m.quiz.id}`}
                        className="flex items-start gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                      >
                        <ListChecks className={`mt-0.5 size-3.5 shrink-0 ${m.quiz.passed ? "text-primary" : "text-muted-foreground"}`} />
                        Quiz du module
                      </Link>
                    </li>
                  )}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <article className="order-1 lg:order-2 min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-primary">
          Module {currentModule?.position} · Leçon {index + 1}/{total}
        </p>
        <h1 className="mt-2 text-h1 font-bold">{lesson.title}</h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Clock className="size-4" /> {formatDuration(lesson.duration_minutes)}
        </p>

        {lesson.objectives.length > 0 && (
          <section className="mt-6 rounded-2xl border border-primary/20 bg-primary/5 p-5">
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Target className="size-4 text-primary" /> Objectifs de la leçon
            </h2>
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {lesson.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        )}

        {video?.kind === "embed" && (
          <div className="mt-6 aspect-video overflow-hidden rounded-2xl border">
            <iframe
              src={video.src}
              title={`Vidéo : ${lesson.title}`}
              className="h-full w-full"
              allow="fullscreen; picture-in-picture"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        )}
        {video?.kind === "file" && (
          <div className="mt-6 overflow-hidden rounded-2xl border bg-black">
            <video
              src={video.src}
              controls
              preload="metadata"
              playsInline
              controlsList="nodownload"
              className="aspect-video h-full w-full"
              aria-label={`Vidéo : ${lesson.title}`}
            />
          </div>
        )}
        {video?.kind === "link" && (
          <a
            href={video.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-3 rounded-2xl border p-4 text-sm hover:bg-secondary"
          >
            <PlayCircle className="size-6 shrink-0 text-primary" aria-hidden />
            <span className="flex-1 font-medium">Regarder la vidéo de la leçon</span>
            <ExternalLink className="size-4 text-muted-foreground" aria-hidden />
          </a>
        )}

        <Markdown className="mt-8">{lesson.content_md}</Markdown>

        {lesson.exercise_md && (
          <section className="mt-10 rounded-2xl border-2 border-dashed border-accent/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-h3 font-semibold">
              <Dumbbell className="size-5 text-accent" /> Exercice
            </h2>
            <Markdown>{lesson.exercise_md}</Markdown>
          </section>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {previous && (
              <Button asChild variant="ghost">
                <Link href={`${base}/lecon/${previous.slug}`}>
                  <ArrowLeft /> {previous.title}
                </Link>
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {done ? (
              <>
                <form action={setLessonCompleted}>
                  <input type="hidden" name="course" value={slug} />
                  <input type="hidden" name="lesson_id" value={lesson.id} />
                  <input type="hidden" name="completed" value="0" />
                  <SubmitButton variant="outline" className="rounded-full">
                    Marquer comme non terminée
                  </SubmitButton>
                </form>
                {isLastOfModule && currentModule?.quiz ? (
                  <Button asChild className="rounded-full gradient-btn border-0 text-white">
                    <Link href={`${base}/quiz/${currentModule.quiz.id}`}>
                      Quiz du module <ArrowRight />
                    </Link>
                  </Button>
                ) : next ? (
                  <Button asChild className="rounded-full gradient-btn border-0 text-white">
                    <Link href={`${base}/lecon/${next.slug}`}>
                      Leçon suivante <ArrowRight />
                    </Link>
                  </Button>
                ) : null}
              </>
            ) : (
              <form action={setLessonCompleted}>
                <input type="hidden" name="course" value={slug} />
                <input type="hidden" name="lesson_id" value={lesson.id} />
                <input type="hidden" name="completed" value="1" />
                <input type="hidden" name="next_slug" value={isLastOfModule ? "" : (next?.slug ?? "__end")} />
                <SubmitButton className="rounded-full gradient-btn border-0 text-white" pendingLabel="Enregistrement…">
                  <CheckCircle2 /> Marquer comme terminée{!isLastOfModule && next ? " et continuer" : ""}
                </SubmitButton>
              </form>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

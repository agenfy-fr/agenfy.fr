import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireViewer } from "@/lib/auth";
import type { OutlineModule } from "@/lib/progress";
import type { Certificate, Course, Enrollment, Evaluation, Quiz } from "@/lib/types";

export interface LearnerModule extends OutlineModule {
  position: number;
  summary: string | null;
  duration_minutes: number;
  lessons: { id: string; slug: string; title: string; duration_minutes: number }[];
  quiz: (Quiz & { bestScore: number | null; passed: boolean; attempts: number }) | null;
}

export interface LearnerCourse {
  course: Course;
  enrollment: Enrollment;
  modules: LearnerModule[];
  completedLessonIds: Set<string>;
  evaluations: Partial<Record<Evaluation["kind"], Pick<Evaluation, "id" | "submitted_at" | "overall_rating">>>;
  certificate: Pick<Certificate, "id" | "number" | "issued_at" | "revoked_at"> | null;
}

/**
 * Everything the learner screens need for one course, loaded under RLS.
 * Redirects to the dashboard when the viewer is not enrolled.
 */
export const getLearnerCourse = cache(async (slug: string): Promise<LearnerCourse> => {
  const viewer = await requireViewer(`/learn/${slug}`);
  const supabase = await createClient();

  const { data: course } = await supabase.from("courses").select("*").eq("slug", slug).maybeSingle<Course>();
  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("course_id", course.id)
    .eq("user_id", viewer.id)
    .neq("status", "cancelled")
    .maybeSingle<Enrollment>();
  if (!enrollment) redirect("/dashboard?error=not-enrolled");

  const [modulesRes, lessonsRes, progressRes, quizzesRes, attemptsRes, evaluationsRes, certificateRes] =
    await Promise.all([
      supabase
        .from("course_modules")
        .select("id, position, title, summary, duration_minutes")
        .eq("course_id", course.id)
        .order("position"),
      supabase
        .from("lessons")
        .select("id, module_id, slug, position, title, duration_minutes")
        .eq("course_id", course.id)
        .order("position"),
      supabase.from("lesson_progress").select("lesson_id").eq("enrollment_id", enrollment.id),
      supabase.from("quizzes").select("id, course_id, module_id, title, pass_score").eq("course_id", course.id),
      supabase.from("quiz_attempts").select("quiz_id, score, passed").eq("enrollment_id", enrollment.id),
      supabase.from("evaluations").select("id, kind, submitted_at, overall_rating").eq("enrollment_id", enrollment.id),
      supabase
        .from("certificates")
        .select("id, number, issued_at, revoked_at")
        .eq("enrollment_id", enrollment.id)
        .maybeSingle(),
    ]);

  const attempts = attemptsRes.data ?? [];
  const quizzes = (quizzesRes.data ?? []) as Quiz[];

  const modules: LearnerModule[] = (modulesRes.data ?? []).map((m) => {
    const quiz = quizzes.find((q) => q.module_id === m.id) ?? null;
    const quizAttempts = quiz ? attempts.filter((a) => a.quiz_id === quiz.id) : [];
    return {
      ...m,
      lessons: (lessonsRes.data ?? [])
        .filter((l) => l.module_id === m.id)
        .map(({ id, slug, title, duration_minutes }) => ({ id, slug, title, duration_minutes })),
      quiz: quiz
        ? {
            ...quiz,
            attempts: quizAttempts.length,
            bestScore: quizAttempts.length ? Math.max(...quizAttempts.map((a) => a.score as number)) : null,
            passed: quizAttempts.some((a) => a.passed),
          }
        : null,
    };
  });

  const evaluations: LearnerCourse["evaluations"] = {};
  for (const e of evaluationsRes.data ?? []) {
    evaluations[e.kind as Evaluation["kind"]] = e as Pick<Evaluation, "id" | "submitted_at" | "overall_rating">;
  }

  return {
    course,
    enrollment,
    modules,
    completedLessonIds: new Set((progressRes.data ?? []).map((p) => p.lesson_id as string)),
    evaluations,
    certificate: (certificateRes.data as LearnerCourse["certificate"]) ?? null,
  };
});

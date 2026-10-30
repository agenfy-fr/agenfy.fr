/**
 * Progress & reporting logic. computeProgress() mirrors
 * public.refresh_enrollment_progress() (supabase/migrations/0200).
 */

export function computeProgress(totalLessons: number, completedLessons: number): number {
  if (!Number.isFinite(totalLessons) || totalLessons <= 0) return 0;
  const done = Math.max(0, Math.min(completedLessons, totalLessons));
  return Math.min(100, Math.floor((done * 100) / totalLessons));
}

export interface OutlineLesson {
  id: string;
  slug: string;
  title: string;
}

export interface OutlineModule {
  id: string;
  title: string;
  lessons: OutlineLesson[];
}

/** Flattened lesson order of a course (module order, then lesson order). */
export function flattenLessons(modules: OutlineModule[]): OutlineLesson[] {
  return modules.flatMap((m) => m.lessons);
}

/** First lesson not completed yet, or null when everything is done. */
export function nextLesson(
  modules: OutlineModule[],
  completedLessonIds: Iterable<string>,
): OutlineLesson | null {
  const done = new Set(completedLessonIds);
  return flattenLessons(modules).find((l) => !done.has(l.id)) ?? null;
}

/** Previous / next lessons around a given slug, for the lesson reader. */
export function lessonNeighbours(modules: OutlineModule[], slug: string) {
  const all = flattenLessons(modules);
  const index = all.findIndex((l) => l.slug === slug);
  if (index === -1) return { previous: null, next: null, index: -1, total: all.length };
  return {
    previous: index > 0 ? all[index - 1] : null,
    next: index < all.length - 1 ? all[index + 1] : null,
    index,
    total: all.length,
  };
}

export interface EnrollmentLike {
  status: "active" | "completed" | "cancelled";
  progress_percent: number;
}

/** Share (0-100) of non-cancelled enrollments that are completed. null if none. */
export function completionRate(enrollments: EnrollmentLike[]): number | null {
  const counted = enrollments.filter((e) => e.status !== "cancelled");
  if (counted.length === 0) return null;
  const completed = counted.filter((e) => e.status === "completed").length;
  return Math.round((completed * 100) / counted.length);
}

/** Mean progress (0-100) over non-cancelled enrollments. null if none. */
export function averageProgress(enrollments: EnrollmentLike[]): number | null {
  const counted = enrollments.filter((e) => e.status !== "cancelled");
  if (counted.length === 0) return null;
  const sum = counted.reduce((acc, e) => acc + e.progress_percent, 0);
  return Math.round(sum / counted.length);
}

/** Mean of ratings, rounded to 1 decimal. Ignores null/invalid values. null if none. */
export function averageRating(ratings: Array<number | string | null | undefined>): number | null {
  const values = ratings
    .map((r) => (typeof r === "string" ? Number.parseFloat(r) : r))
    .filter((r): r is number => typeof r === "number" && Number.isFinite(r));
  if (values.length === 0) return null;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return Math.round(mean * 10) / 10;
}

export const COLD_EVALUATION_DELAY_DAYS = 60;

/** Date from which the cold evaluation (J+60) can be answered. */
export function coldEvaluationDueDate(completedAt: string | Date | null): Date | null {
  if (!completedAt) return null;
  const d = new Date(completedAt);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getTime() + COLD_EVALUATION_DELAY_DAYS * 24 * 60 * 60 * 1000);
}

export function isColdEvaluationOpen(completedAt: string | Date | null, now: Date = new Date()): boolean {
  const due = coldEvaluationDueDate(completedAt);
  return due !== null && now.getTime() >= due.getTime();
}

/** Signature window of a session: 30 min before start to 60 min after end (mirrors sign_attendance). */
export function isSignatureWindowOpen(
  startsAt: string | Date,
  endsAt: string | Date,
  now: Date = new Date(),
): boolean {
  const start = new Date(startsAt).getTime() - 30 * 60 * 1000;
  const end = new Date(endsAt).getTime() + 60 * 60 * 1000;
  const t = now.getTime();
  return t >= start && t <= end;
}

/**
 * Builds the idempotent seed SQL for the course catalogue from content/courses.
 * Pure module (no I/O) so it can be unit-tested; generate-seed.ts writes the file.
 *
 * Ids are deterministic (UUID v5-style from SHA-1), so re-running the seed
 * updates rows in place and keeps learners' progress, attempts and
 * certificates attached. Rows removed from the content are deleted.
 */
import { createHash } from "node:crypto";
import type { CourseSeed } from "../content/types.ts";

export function stableUuid(key: string): string {
  const h = createHash("sha1").update(`agenfy-app:${key}`).digest();
  h[6] = (h[6] & 0x0f) | 0x50; // version 5
  h[8] = (h[8] & 0x3f) | 0x80; // RFC 4122 variant
  const hex = h.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function sqlString(value: string | null | undefined): string {
  if (value === null || value === undefined) return "null";
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlTextArray(values: string[]): string {
  return values.length ? `array[${values.map(sqlString).join(", ")}]::text[]` : "'{}'::text[]";
}

function sqlIntArray(values: number[]): string {
  return `array[${values.map((v) => String(Math.trunc(v))).join(", ")}]::integer[]`;
}

function sqlNum(v: number | null): string {
  return v === null ? "null" : String(v);
}

/** Throws on invalid content (used by tests and by the generator). */
export function validateCourse(c: CourseSeed): void {
  const fail = (msg: string) => {
    throw new Error(`[${c.slug}] ${msg}`);
  };
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.slug)) fail("invalid slug");
  if (c.objectives.length < 3) fail("needs at least 3 objectives");
  const slugs = new Set<string>();
  c.modules.forEach((m, mi) => {
    if (m.lessons.length === 0) fail(`module ${mi + 1} has no lesson`);
    for (const l of m.lessons) {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(l.slug)) fail(`invalid lesson slug ${l.slug}`);
      if (slugs.has(l.slug)) fail(`duplicate lesson slug ${l.slug}`);
      slugs.add(l.slug);
      if (l.content.trim().length < 1500) fail(`lesson ${l.slug} content too short`);
      if (!l.exercise.trim()) fail(`lesson ${l.slug} has no exercise`);
      if (l.objectives.length === 0) fail(`lesson ${l.slug} has no objective`);
      if (/lorem ipsum/i.test(l.content + l.exercise)) fail(`lesson ${l.slug} contains placeholder text`);
    }
    const qs = m.quiz.questions;
    if (qs.length < 5 || qs.length > 8) fail(`module ${mi + 1} quiz must have 5-8 questions`);
    qs.forEach((q, qi) => {
      if (q.choices.length < 2) fail(`module ${mi + 1} q${qi + 1}: needs 2+ choices`);
      if (q.correct.length === 0) fail(`module ${mi + 1} q${qi + 1}: no correct answer`);
      if (new Set(q.correct).size !== q.correct.length) fail(`module ${mi + 1} q${qi + 1}: duplicate correct index`);
      for (const i of q.correct) {
        if (!Number.isInteger(i) || i < 0 || i >= q.choices.length) fail(`module ${mi + 1} q${qi + 1}: index ${i} out of range`);
      }
    });
  });
}

export function buildSeedSql(courses: CourseSeed[]): string {
  const out: string[] = [];
  out.push(
    "-- app.agenfy.fr — catalogue seed (GENERATED, do not edit by hand).",
    "-- Source: apps/app/content/courses/*.ts — regenerate with:",
    "--   pnpm --filter @agenfy/app seed:generate",
    "-- Idempotent: deterministic ids, safe to re-run after content updates.",
    "-- NOT applied automatically: run in the Supabase SQL Editor or `supabase db push`.",
    "",
    "begin;",
    "",
  );

  for (const c of courses) {
    validateCourse(c);
    const courseId = stableUuid(`course:${c.slug}`);
    const moduleIds: string[] = [];
    const lessonIds: string[] = [];
    const quizIds: string[] = [];
    const questionIds: string[] = [];

    out.push(`-- ===========================================================================`);
    out.push(`-- ${c.title}`);
    out.push(`-- ===========================================================================`);
    out.push(
      `insert into public.courses (id, slug, title, subtitle, category, level, audience, prerequisites, objectives,`,
      `  teaching_methods, evaluation_methods, accessibility, access_delay, duration_hours, duration_label, modality,`,
      `  price_ht_cents, price_label, max_group_size, status, published_at)`,
      `values (${sqlString(courseId)}, ${sqlString(c.slug)}, ${sqlString(c.title)}, ${sqlString(c.subtitle)},`,
      `  ${sqlString(c.category)}, ${sqlString(c.level)}, ${sqlString(c.audience)}, ${sqlString(c.prerequisites)},`,
      `  ${sqlTextArray(c.objectives)},`,
      `  ${sqlString(c.teachingMethods)}, ${sqlString(c.evaluationMethods)}, ${sqlString(c.accessibility)},`,
      `  ${sqlString(c.accessDelay)}, ${c.durationHours}, ${sqlString(c.durationLabel)}, ${sqlString(c.modality)},`,
      `  ${sqlNum(c.priceHtCents)}, ${sqlString(c.priceLabel)}, ${sqlNum(c.maxGroupSize)}, 'published', now())`,
      `on conflict (id) do update set slug = excluded.slug, title = excluded.title, subtitle = excluded.subtitle,`,
      `  category = excluded.category, level = excluded.level, audience = excluded.audience,`,
      `  prerequisites = excluded.prerequisites, objectives = excluded.objectives,`,
      `  teaching_methods = excluded.teaching_methods, evaluation_methods = excluded.evaluation_methods,`,
      `  accessibility = excluded.accessibility, access_delay = excluded.access_delay,`,
      `  duration_hours = excluded.duration_hours, duration_label = excluded.duration_label,`,
      `  modality = excluded.modality, price_ht_cents = excluded.price_ht_cents, price_label = excluded.price_label,`,
      `  max_group_size = excluded.max_group_size;`,
      "",
      `-- Free lesson positions before re-inserting (lessons may move between modules).`,
      `update public.lessons set position = -position - 1000 where course_id = ${sqlString(courseId)};`,
      "",
    );

    c.modules.forEach((m, mi) => {
      const position = mi + 1;
      const moduleId = stableUuid(`module:${c.slug}:${position}`);
      moduleIds.push(moduleId);
      out.push(
        `-- Module ${position} — ${m.title}`,
        `insert into public.course_modules (id, course_id, position, title, summary, duration_minutes)`,
        `values (${sqlString(moduleId)}, ${sqlString(courseId)}, ${position}, ${sqlString(m.title)}, ${sqlString(m.summary)}, ${m.durationMinutes})`,
        `on conflict (id) do update set position = excluded.position, title = excluded.title,`,
        `  summary = excluded.summary, duration_minutes = excluded.duration_minutes;`,
        "",
      );

      m.lessons.forEach((l, li) => {
        const lessonId = stableUuid(`lesson:${c.slug}:${l.slug}`);
        lessonIds.push(lessonId);
        out.push(
          `insert into public.lessons (id, course_id, module_id, slug, position, title, objectives, content_md, exercise_md, video_url, duration_minutes)`,
          `values (${sqlString(lessonId)}, ${sqlString(courseId)}, ${sqlString(moduleId)}, ${sqlString(l.slug)}, ${li + 1},`,
          `  ${sqlString(l.title)}, ${sqlTextArray(l.objectives)},`,
          `  ${sqlString(l.content.trim())},`,
          `  ${sqlString(l.exercise.trim())},`,
          `  ${sqlString(l.videoUrl ?? null)}, ${l.durationMinutes})`,
          `on conflict (id) do update set module_id = excluded.module_id, slug = excluded.slug, position = excluded.position,`,
          `  title = excluded.title, objectives = excluded.objectives, content_md = excluded.content_md,`,
          `  exercise_md = excluded.exercise_md, video_url = excluded.video_url, duration_minutes = excluded.duration_minutes;`,
          "",
        );
      });

      const quizId = stableUuid(`quiz:${c.slug}:${position}`);
      quizIds.push(quizId);
      out.push(
        `insert into public.quizzes (id, course_id, module_id, title, pass_score)`,
        `values (${sqlString(quizId)}, ${sqlString(courseId)}, ${sqlString(moduleId)}, ${sqlString(m.quiz.title)}, ${m.quiz.passScore ?? 70})`,
        `on conflict (id) do update set title = excluded.title, pass_score = excluded.pass_score, module_id = excluded.module_id;`,
        "",
      );
      m.quiz.questions.forEach((q, qi) => {
        const questionId = stableUuid(`question:${c.slug}:${position}:${qi + 1}`);
        questionIds.push(questionId);
        out.push(
          `insert into public.quiz_questions (id, quiz_id, position, prompt, choices, correct_indexes, multiple, explanation)`,
          `values (${sqlString(questionId)}, ${sqlString(quizId)}, ${qi + 1}, ${sqlString(q.prompt)},`,
          `  ${sqlString(JSON.stringify(q.choices))}::jsonb, ${sqlIntArray(q.correct)}, ${q.correct.length > 1}, ${sqlString(q.explanation)})`,
          `on conflict (id) do update set prompt = excluded.prompt, choices = excluded.choices,`,
          `  correct_indexes = excluded.correct_indexes, multiple = excluded.multiple, explanation = excluded.explanation;`,
          "",
        );
      });
    });

    const list = (ids: string[]) => ids.map(sqlString).join(", ");
    out.push(
      `-- Remove rows that no longer exist in the content source.`,
      `delete from public.quiz_questions q using public.quizzes z`,
      `  where q.quiz_id = z.id and z.course_id = ${sqlString(courseId)} and q.id not in (${list(questionIds)});`,
      `delete from public.quizzes where course_id = ${sqlString(courseId)} and id not in (${list(quizIds)});`,
      `delete from public.lessons where course_id = ${sqlString(courseId)} and id not in (${list(lessonIds)});`,
      `delete from public.course_modules where course_id = ${sqlString(courseId)} and id not in (${list(moduleIds)});`,
      "",
      `-- Recompute progress of existing enrollments (lesson count may have changed).`,
      `do $seed$ begin`,
      `  perform public.refresh_enrollment_progress(e.id) from public.enrollments e where e.course_id = ${sqlString(courseId)};`,
      `end $seed$;`,
      "",
    );
  }

  out.push("commit;", "");
  return out.join("\n");
}

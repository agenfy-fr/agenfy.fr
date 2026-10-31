"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { TRAINING_WRITE_ROLES } from "@/lib/access-control";
import {
  courseCreateSchema,
  courseSchema,
  lessonCreateSchema,
  lessonSchema,
  lessonVideoUrlSchema,
  moduleSchema,
  uuid,
  videoUploadRequestSchema,
} from "@/lib/schemas";
import { ActionError, check, formToObject, runAction, type ActionResult } from "@/lib/server/actions";
import { requireStaffRole } from "@/lib/server/auth";
import {
  ENROLLMENT_STATUSES,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_LABEL,
  TRAINING_VIDEO_BUCKET,
  isAllowedVideoType,
  isLessonVideoPath,
  lessonVideoPath,
  uniqueSlug,
} from "@/lib/training";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Formations (catalogue of app.agenfy.fr). Every write goes through the
 * staff session: RLS (is_training_staff(), 0201) is the final authority;
 * requireStaffRole(TRAINING_WRITE_ROLES) mirrors it for readable errors.
 */
const writer = () => requireStaffRole(TRAINING_WRITE_ROLES);

function revalidateCourse(courseId: string) {
  revalidatePath("/training");
  revalidatePath(`/training/${courseId}`);
}

// --- Courses ---------------------------------------------------------------------------

export async function createCourse(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await writer();
    const input = courseCreateSchema.parse(formToObject(formData));
    const { data: taken } = await supabase.from("courses").select("slug");
    const slug = input.slug ?? uniqueSlug(input.title, (taken ?? []).map((r) => r.slug as string), "formation");
    const { data, error } = await supabase
      .from("courses")
      .insert({ ...input, slug, status: "draft" })
      .select("id")
      .single();
    if (error?.code === "23505") throw new ActionError("Une formation utilise déjà cet identifiant d'URL.");
    const course = check({ data, error }) as { id: string };
    revalidatePath("/training");
    return course.id;
  });
  if (res.ok && res.data) redirect(`/training/${res.data}`);
  return res.ok ? { ok: true } : res;
}

export async function updateCourse(courseId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const id = uuid.parse(courseId);
    const input = courseSchema.parse(formToObject(formData));
    const current = check(await supabase.from("courses").select("status, published_at").eq("id", id).maybeSingle());
    if (!current) throw new ActionError("Formation introuvable.");
    const published_at =
      input.status === "published" && !current.published_at ? new Date().toISOString() : (current.published_at as string | null);
    const { error } = await supabase.from("courses").update({ ...input, published_at }).eq("id", id);
    if (error?.code === "23505") throw new ActionError("Une formation utilise déjà cet identifiant d'URL.");
    check({ data: null, error });
    revalidateCourse(id);
    return undefined;
  }, "Formation enregistrée.");
}

/** Only a draft without any enrollment can be deleted; otherwise archive it. */
export async function deleteCourse(courseId: string): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await writer();
    const id = uuid.parse(courseId);
    const course = check(await supabase.from("courses").select("status").eq("id", id).maybeSingle());
    if (!course) throw new ActionError("Formation introuvable.");
    if (course.status !== "draft") throw new ActionError("Seul un brouillon peut être supprimé : archivez plutôt la formation.");
    const { count } = await supabase.from("enrollments").select("id", { count: "exact", head: true }).eq("course_id", id);
    if (count) throw new ActionError("Des personnes sont inscrites : archivez plutôt la formation.");
    const { data: lessons } = await supabase.from("lessons").select("video_path").eq("course_id", id).not("video_path", "is", null);
    check(await supabase.from("courses").delete().eq("id", id));
    await removeVideoObjects(supabase, (lessons ?? []).map((l) => l.video_path as string));
    revalidatePath("/training");
    return undefined;
  });
  if (res.ok) redirect("/training");
  return res;
}

// --- Modules ---------------------------------------------------------------------------

export async function createModule(courseId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const id = uuid.parse(courseId);
    const input = moduleSchema.parse(formToObject(formData));
    const { data: last } = await supabase
      .from("course_modules")
      .select("position")
      .eq("course_id", id)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();
    check(await supabase.from("course_modules").insert({ ...input, course_id: id, position: ((last?.position as number) ?? 0) + 1 }));
    revalidateCourse(id);
    return undefined;
  }, "Module ajouté.");
}

export async function updateModule(courseId: string, moduleId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const input = moduleSchema.parse(formToObject(formData));
    check(await supabase.from("course_modules").update(input).eq("id", uuid.parse(moduleId)).eq("course_id", uuid.parse(courseId)));
    revalidateCourse(courseId);
    return undefined;
  }, "Module enregistré.");
}

export async function deleteModule(courseId: string, moduleId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const mid = uuid.parse(moduleId);
    const { data: lessons } = await supabase.from("lessons").select("video_path").eq("module_id", mid).not("video_path", "is", null);
    check(await supabase.from("course_modules").delete().eq("id", mid).eq("course_id", uuid.parse(courseId)));
    await removeVideoObjects(supabase, (lessons ?? []).map((l) => l.video_path as string));
    revalidateCourse(courseId);
    return undefined;
  }, "Module supprimé.");
}

const direction = z.union([z.literal(-1), z.literal(1)]);

export async function moveModule(courseId: string, moduleId: string, dir: number): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    check(await supabase.rpc("move_course_module", { p_module: uuid.parse(moduleId), p_direction: direction.parse(dir) }));
    revalidateCourse(courseId);
    return undefined;
  }, "Ordre mis à jour.");
}

// --- Lessons ---------------------------------------------------------------------------

async function nextLessonPosition(supabase: SupabaseClient, moduleId: string): Promise<number> {
  const { data } = await supabase
    .from("lessons")
    .select("position")
    .eq("module_id", moduleId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.position as number) ?? 0) + 1;
}

export async function createLesson(courseId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const res = await runAction(async () => {
    const { supabase } = await writer();
    const id = uuid.parse(courseId);
    const input = lessonCreateSchema.parse(formToObject(formData));
    const mod = check(await supabase.from("course_modules").select("id").eq("id", input.module_id).eq("course_id", id).maybeSingle());
    if (!mod) throw new ActionError("Module introuvable.");
    const { data: taken } = await supabase.from("lessons").select("slug").eq("course_id", id);
    const lesson = check(
      await supabase
        .from("lessons")
        .insert({
          course_id: id,
          module_id: input.module_id,
          title: input.title,
          slug: uniqueSlug(input.title, (taken ?? []).map((r) => r.slug as string)),
          position: await nextLessonPosition(supabase, input.module_id),
        })
        .select("id")
        .single(),
    ) as { id: string };
    revalidateCourse(id);
    return lesson.id;
  });
  if (res.ok && res.data) redirect(`/training/lessons/${res.data}`);
  return res.ok ? { ok: true } : res;
}

async function loadLesson(supabase: SupabaseClient, lessonId: string) {
  const lesson = check(
    await supabase.from("lessons").select("id, course_id, module_id, video_path").eq("id", uuid.parse(lessonId)).maybeSingle(),
  ) as { id: string; course_id: string; module_id: string; video_path: string | null } | null;
  if (!lesson) throw new ActionError("Leçon introuvable.");
  return lesson;
}

export async function updateLesson(lessonId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    const input = lessonSchema.parse(formToObject(formData));
    const patch: Record<string, unknown> = { ...input };
    if (input.module_id !== lesson.module_id) {
      const mod = check(
        await supabase.from("course_modules").select("id").eq("id", input.module_id).eq("course_id", lesson.course_id).maybeSingle(),
      );
      if (!mod) throw new ActionError("Module introuvable.");
      patch.position = await nextLessonPosition(supabase, input.module_id);
    }
    const { error } = await supabase.from("lessons").update(patch).eq("id", lesson.id);
    if (error?.code === "23505") throw new ActionError("Une autre leçon de cette formation utilise cet identifiant d'URL.");
    check({ data: null, error });
    revalidateCourse(lesson.course_id);
    revalidatePath(`/training/lessons/${lesson.id}`);
    return undefined;
  }, "Leçon enregistrée.");
}

export async function deleteLesson(lessonId: string): Promise<ActionResult> {
  let courseId = "";
  const res = await runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    courseId = lesson.course_id;
    check(await supabase.from("lessons").delete().eq("id", lesson.id));
    if (lesson.video_path) await removeVideoObjects(supabase, [lesson.video_path]);
    revalidateCourse(lesson.course_id);
    return undefined;
  });
  if (res.ok) redirect(`/training/${courseId}`);
  return res;
}

export async function moveLesson(courseId: string, lessonId: string, dir: number): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    check(await supabase.rpc("move_lesson", { p_lesson: uuid.parse(lessonId), p_direction: direction.parse(dir) }));
    revalidateCourse(courseId);
    return undefined;
  }, "Ordre mis à jour.");
}

// --- Lesson video: https link or upload to the private bucket ----------------------------

async function removeVideoObjects(supabase: SupabaseClient, paths: string[]) {
  if (paths.length === 0) return;
  const { error } = await supabase.storage.from(TRAINING_VIDEO_BUCKET).remove(paths);
  if (error) console.error("[training] video cleanup failed:", error.message);
}

export async function setLessonVideoUrl(lessonId: string, _prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    const { video_url } = lessonVideoUrlSchema.parse(formToObject(formData));
    check(await supabase.from("lessons").update({ video_url, video_path: null }).eq("id", lesson.id));
    if (lesson.video_path) await removeVideoObjects(supabase, [lesson.video_path]);
    revalidatePath(`/training/lessons/${lesson.id}`);
    revalidateCourse(lesson.course_id);
    return undefined;
  }, "Lien vidéo enregistré.");
}

export async function removeLessonVideo(lessonId: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    check(await supabase.from("lessons").update({ video_url: null, video_path: null }).eq("id", lesson.id));
    if (lesson.video_path) await removeVideoObjects(supabase, [lesson.video_path]);
    revalidatePath(`/training/lessons/${lesson.id}`);
    revalidateCourse(lesson.course_id);
    return undefined;
  }, "Vidéo retirée.");
}

/**
 * Step 1 of an upload: a signed upload URL for the private bucket, created
 * with the staff session (Storage RLS: training staff only). The browser then
 * PUTs the file directly to Supabase Storage (server actions are capped at
 * 4.5 MB on Vercel), and calls attachLessonVideo().
 */
export async function createLessonVideoUpload(
  lessonId: string,
  file: { fileName: string; size: number; type: string },
): Promise<ActionResult<{ path: string; signedUrl: string }>> {
  return runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    const meta = videoUploadRequestSchema.parse(file);
    if (meta.size > MAX_VIDEO_BYTES) throw new ActionError(`Fichier trop volumineux (${MAX_VIDEO_LABEL} maximum).`);
    if (!isAllowedVideoType(meta.type)) throw new ActionError("Format non pris en charge (MP4, WebM, MOV ou OGG).");
    const path = lessonVideoPath(lesson.course_id, lesson.id, meta.fileName);
    const { data, error } = await supabase.storage.from(TRAINING_VIDEO_BUCKET).createSignedUploadUrl(path);
    if (error || !data) {
      console.error("[training] signed upload url:", error?.message);
      throw new ActionError("Préparation de l'envoi impossible.");
    }
    return { path, signedUrl: data.signedUrl };
  });
}

/** Step 2: link the uploaded object to the lesson (replaces any previous video). */
export async function attachLessonVideo(lessonId: string, path: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const lesson = await loadLesson(supabase, lessonId);
    const target = z.string().max(400).parse(path);
    if (!isLessonVideoPath(target, lesson.course_id, lesson.id)) throw new ActionError("Fichier vidéo invalide.");
    const folder = `${lesson.course_id}/${lesson.id}`;
    const name = target.slice(folder.length + 1);
    const { data: listed } = await supabase.storage.from(TRAINING_VIDEO_BUCKET).list(folder, { search: name, limit: 10 });
    if (!(listed ?? []).some((o) => o.name === name)) throw new ActionError("Le fichier n'a pas été reçu : relancez l'envoi.");
    check(await supabase.from("lessons").update({ video_path: target, video_url: null }).eq("id", lesson.id));
    if (lesson.video_path && lesson.video_path !== target) await removeVideoObjects(supabase, [lesson.video_path]);
    revalidatePath(`/training/lessons/${lesson.id}`);
    revalidateCourse(lesson.course_id);
    return undefined;
  }, "Vidéo enregistrée.");
}

// --- Enrollments -----------------------------------------------------------------------

/** Cancel (access removed in the app) or reactivate an enrollment. */
export async function setEnrollmentStatus(enrollmentId: string, status: string): Promise<ActionResult> {
  return runAction(async () => {
    const { supabase } = await writer();
    const next = z.enum(ENROLLMENT_STATUSES).exclude(["completed"]).parse(status);
    const row = check(
      await supabase.from("enrollments").select("id, organization_id").eq("id", uuid.parse(enrollmentId)).maybeSingle(),
    ) as { id: string; organization_id: string | null } | null;
    if (!row) throw new ActionError("Inscription introuvable.");
    check(await supabase.from("enrollments").update({ status: next }).eq("id", row.id));
    revalidatePath("/training/access");
    if (row.organization_id) revalidatePath(`/clients/${row.organization_id}`);
    return undefined;
  }, status === "cancelled" ? "Accès à la formation retiré." : "Accès à la formation rétabli.");
}

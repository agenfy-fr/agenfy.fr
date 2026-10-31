"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Ban, Loader2, Pencil, Plus, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ActionButton, ActionForm } from "@/components/shared/action-form";
import { FormDialog } from "@/components/shared/form-dialog";
import { Field, FormGrid } from "@/components/shared/field";
import { MarkdownField } from "@/components/training/markdown-field";
import { centsToInput } from "@/lib/format";
import { toast } from "@/lib/toast";
import {
  COURSE_CATEGORIES,
  COURSE_CATEGORY_LABELS,
  COURSE_LEVELS,
  COURSE_LEVEL_LABELS,
  COURSE_MODALITIES,
  COURSE_MODALITY_LABELS,
  COURSE_STATUSES,
  COURSE_STATUS_META,
  MAX_VIDEO_BYTES,
  MAX_VIDEO_LABEL,
  VIDEO_MIME_TYPES,
  isAllowedVideoType,
} from "@/lib/training";
import type { Course, CourseModule, Lesson } from "@/lib/types";
import {
  attachLessonVideo,
  createCourse,
  createLesson,
  createLessonVideoUpload,
  createModule,
  deleteCourse,
  deleteLesson,
  deleteModule,
  moveLesson,
  moveModule,
  removeLessonVideo,
  setEnrollmentStatus,
  setLessonVideoUrl,
  updateCourse,
  updateLesson,
  updateModule,
} from "./actions";

// --- Courses ---------------------------------------------------------------------------

function CourseBaseFields({ course }: { course?: Course }) {
  const p = course?.id ?? "new";
  return (
    <>
      <Field label="Titre" htmlFor={`co-title-${p}`}>
        <Input id={`co-title-${p}`} name="title" defaultValue={course?.title} required maxLength={200} />
      </Field>
      <FormGrid>
        <Field label="Catégorie" htmlFor={`co-cat-${p}`}>
          <NativeSelect id={`co-cat-${p}`} name="category" defaultValue={course?.category ?? "essentiels"}>
            {COURSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {COURSE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Niveau" htmlFor={`co-level-${p}`}>
          <NativeSelect id={`co-level-${p}`} name="level" defaultValue={course?.level ?? "debutant"}>
            {COURSE_LEVELS.map((l) => (
              <option key={l} value={l}>
                {COURSE_LEVEL_LABELS[l]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Modalité" htmlFor={`co-mod-${p}`}>
          <NativeSelect id={`co-mod-${p}`} name="modality" defaultValue={course?.modality ?? "elearning"}>
            {COURSE_MODALITIES.map((m) => (
              <option key={m} value={m}>
                {COURSE_MODALITY_LABELS[m]}
              </option>
            ))}
          </NativeSelect>
        </Field>
        <Field label="Durée (heures)" htmlFor={`co-hours-${p}`}>
          <Input
            id={`co-hours-${p}`}
            name="duration_hours"
            type="number"
            min="0.5"
            step="0.5"
            defaultValue={course?.duration_hours ?? 7}
            required
          />
        </Field>
      </FormGrid>
      <Field label="Public visé" htmlFor={`co-aud-${p}`}>
        <Textarea id={`co-aud-${p}`} name="audience" rows={2} defaultValue={course?.audience} required />
      </Field>
      <Field label="Prérequis" htmlFor={`co-pre-${p}`}>
        <Textarea id={`co-pre-${p}`} name="prerequisites" rows={2} defaultValue={course?.prerequisites ?? "Aucun"} required />
      </Field>
    </>
  );
}

export function NewCourseButton() {
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle formation</>}
      title="Nouvelle formation"
      description="Créée en brouillon : invisible des apprenants tant qu'elle n'est pas publiée."
      action={createCourse}
      submitLabel="Créer"
    >
      <CourseBaseFields />
    </FormDialog>
  );
}

export function CourseForm({ course, canEdit }: { course: Course; canEdit: boolean }) {
  const p = course.id;
  return (
    <ActionForm action={updateCourse.bind(null, course.id)} className="space-y-4" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-4">
        <FormGrid>
          <Field label="Statut" htmlFor={`co-status-${p}`} hint="Publiée = visible au catalogue et accessible aux inscrits.">
            <NativeSelect id={`co-status-${p}`} name="status" defaultValue={course.status}>
              {COURSE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {COURSE_STATUS_META[s].label}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Identifiant d'URL" htmlFor={`co-slug-${p}`} hint="app.agenfy.fr/learn/…">
            <Input id={`co-slug-${p}`} name="slug" defaultValue={course.slug} required />
          </Field>
        </FormGrid>
        <CourseBaseFields course={course} />
        <Field label="Sous-titre" htmlFor={`co-sub-${p}`}>
          <Input id={`co-sub-${p}`} name="subtitle" defaultValue={course.subtitle ?? ""} />
        </Field>
        <Field label="Objectifs pédagogiques" htmlFor={`co-obj-${p}`} hint="Un objectif évaluable par ligne.">
          <Textarea id={`co-obj-${p}`} name="objectives" rows={4} defaultValue={course.objectives.join("\n")} />
        </Field>
        <FormGrid>
          <Field label="Méthodes pédagogiques" htmlFor={`co-teach-${p}`}>
            <Textarea id={`co-teach-${p}`} name="teaching_methods" rows={3} defaultValue={course.teaching_methods ?? ""} />
          </Field>
          <Field label="Modalités d'évaluation" htmlFor={`co-eval-${p}`}>
            <Textarea id={`co-eval-${p}`} name="evaluation_methods" rows={3} defaultValue={course.evaluation_methods ?? ""} />
          </Field>
          <Field label="Accessibilité / handicap" htmlFor={`co-acc-${p}`}>
            <Textarea id={`co-acc-${p}`} name="accessibility" rows={3} defaultValue={course.accessibility ?? ""} />
          </Field>
          <Field label="Délais d'accès" htmlFor={`co-delay-${p}`}>
            <Textarea id={`co-delay-${p}`} name="access_delay" rows={3} defaultValue={course.access_delay ?? ""} />
          </Field>
          <Field label="Durée affichée" htmlFor={`co-dlabel-${p}`} hint="Ex. 1 jour (7 h)">
            <Input id={`co-dlabel-${p}`} name="duration_label" defaultValue={course.duration_label ?? ""} />
          </Field>
          <Field label="Taille max. du groupe" htmlFor={`co-group-${p}`}>
            <Input id={`co-group-${p}`} name="max_group_size" type="number" min="1" defaultValue={course.max_group_size ?? ""} />
          </Field>
          <Field label="Prix indicatif HT (€)" htmlFor={`co-price-${p}`}>
            <Input
              id={`co-price-${p}`}
              name="price_ht_cents"
              inputMode="decimal"
              defaultValue={centsToInput(course.price_ht_cents)}
            />
          </Field>
          <Field label="Précision du prix" htmlFor={`co-plabel-${p}`} hint="Ex. par groupe (jusqu'à 12 personnes)">
            <Input id={`co-plabel-${p}`} name="price_label" defaultValue={course.price_label ?? ""} />
          </Field>
        </FormGrid>
      </fieldset>
    </ActionForm>
  );
}

export function DeleteCourseButton({ course }: { course: Course }) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      confirm={`Supprimer définitivement « ${course.title} », ses modules, leçons et vidéos ?`}
      action={() => deleteCourse(course.id)}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer le brouillon
    </ActionButton>
  );
}

// --- Modules ---------------------------------------------------------------------------

function ModuleFields({ module }: { module?: CourseModule }) {
  const p = module?.id ?? "new";
  return (
    <>
      <Field label="Titre" htmlFor={`mo-title-${p}`}>
        <Input id={`mo-title-${p}`} name="title" defaultValue={module?.title} required maxLength={200} />
      </Field>
      <Field label="Résumé" htmlFor={`mo-sum-${p}`}>
        <Textarea id={`mo-sum-${p}`} name="summary" rows={3} defaultValue={module?.summary ?? ""} />
      </Field>
      <Field label="Durée (minutes)" htmlFor={`mo-dur-${p}`}>
        <Input id={`mo-dur-${p}`} name="duration_minutes" type="number" min="0" defaultValue={module?.duration_minutes ?? 0} />
      </Field>
    </>
  );
}

export function NewModuleButton({ courseId }: { courseId: string }) {
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Module</>}
      triggerProps={{ size: "sm", variant: "outline" }}
      title="Nouveau module"
      action={createModule.bind(null, courseId)}
      submitLabel="Ajouter"
    >
      <ModuleFields />
    </FormDialog>
  );
}

function MoveButtons({
  label,
  isFirst,
  isLast,
  onMove,
}: {
  label: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: -1 | 1) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  return (
    <>
      <ActionButton
        size="icon"
        variant="ghost"
        disabled={isFirst}
        aria-label={`Monter ${label}`}
        title="Monter"
        action={() => onMove(-1)}
      >
        <ArrowUp className="h-4 w-4" />
      </ActionButton>
      <ActionButton
        size="icon"
        variant="ghost"
        disabled={isLast}
        aria-label={`Descendre ${label}`}
        title="Descendre"
        action={() => onMove(1)}
      >
        <ArrowDown className="h-4 w-4" />
      </ActionButton>
    </>
  );
}

export function ModuleActions({
  courseId,
  module,
  isFirst,
  isLast,
}: {
  courseId: string;
  module: CourseModule;
  isFirst: boolean;
  isLast: boolean;
}) {
  const label = `le module « ${module.title} »`;
  return (
    <div className="flex items-center gap-0.5">
      <MoveButtons label={label} isFirst={isFirst} isLast={isLast} onMove={(dir) => moveModule(courseId, module.id, dir)} />
      <FormDialog
        trigger={<Pencil className="h-4 w-4" aria-hidden="true" />}
        triggerProps={{ size: "icon", variant: "ghost", title: "Modifier", "aria-label": `Modifier ${label}` }}
        title="Modifier le module"
        action={updateModule.bind(null, courseId, module.id)}
        submitLabel="Enregistrer"
      >
        <ModuleFields module={module} />
      </FormDialog>
      <ActionButton
        size="icon"
        variant="ghost"
        aria-label={`Supprimer ${label}`}
        title="Supprimer"
        confirm={`Supprimer ${label}, ses leçons et leurs vidéos ? La progression des apprenants sur ces leçons est perdue.`}
        action={() => deleteModule(courseId, module.id)}
      >
        <Trash2 className="h-4 w-4" />
      </ActionButton>
    </div>
  );
}

// --- Lessons ---------------------------------------------------------------------------

export function NewLessonButton({ courseId, modules, moduleId }: { courseId: string; modules: CourseModule[]; moduleId?: string }) {
  const p = moduleId ?? "any";
  return (
    <FormDialog
      trigger={<><Plus className="h-4 w-4" aria-hidden="true" /> Leçon</>}
      triggerProps={{ size: "sm", variant: "ghost" }}
      title="Nouvelle leçon"
      description="Vous rédigerez l'article et ajouterez la vidéo sur la page de la leçon."
      action={createLesson.bind(null, courseId)}
      submitLabel="Créer"
    >
      <Field label="Titre" htmlFor={`le-title-${p}`}>
        <Input id={`le-title-${p}`} name="title" required maxLength={200} />
      </Field>
      <Field label="Module" htmlFor={`le-mod-${p}`}>
        <NativeSelect id={`le-mod-${p}`} name="module_id" defaultValue={moduleId ?? modules[0]?.id}>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.position}. {m.title}
            </option>
          ))}
        </NativeSelect>
      </Field>
    </FormDialog>
  );
}

export function LessonMoveButtons({
  courseId,
  lessonId,
  title,
  isFirst,
  isLast,
}: {
  courseId: string;
  lessonId: string;
  title: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div className="flex items-center gap-0.5">
      <MoveButtons
        label={`la leçon « ${title} »`}
        isFirst={isFirst}
        isLast={isLast}
        onMove={(dir) => moveLesson(courseId, lessonId, dir)}
      />
    </div>
  );
}

export function LessonForm({ lesson, modules, canEdit }: { lesson: Lesson; modules: CourseModule[]; canEdit: boolean }) {
  const p = lesson.id;
  return (
    <ActionForm action={updateLesson.bind(null, lesson.id)} className="space-y-4" hideSubmit={!canEdit}>
      <fieldset disabled={!canEdit} className="space-y-4">
        <FormGrid>
          <Field label="Titre" htmlFor={`ls-title-${p}`}>
            <Input id={`ls-title-${p}`} name="title" defaultValue={lesson.title} required maxLength={200} />
          </Field>
          <Field label="Identifiant d'URL" htmlFor={`ls-slug-${p}`}>
            <Input id={`ls-slug-${p}`} name="slug" defaultValue={lesson.slug} required />
          </Field>
          <Field label="Module" htmlFor={`ls-mod-${p}`}>
            <NativeSelect id={`ls-mod-${p}`} name="module_id" defaultValue={lesson.module_id}>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.position}. {m.title}
                </option>
              ))}
            </NativeSelect>
          </Field>
          <Field label="Durée (minutes)" htmlFor={`ls-dur-${p}`}>
            <Input id={`ls-dur-${p}`} name="duration_minutes" type="number" min="0" defaultValue={lesson.duration_minutes} />
          </Field>
        </FormGrid>
        <Field label="Objectifs de la leçon" htmlFor={`ls-obj-${p}`} hint="Un objectif par ligne.">
          <Textarea id={`ls-obj-${p}`} name="objectives" rows={3} defaultValue={lesson.objectives.join("\n")} />
        </Field>
        <Field label="Article" htmlFor={`ls-content-${p}`}>
          <MarkdownField id={`ls-content-${p}`} name="content_md" defaultValue={lesson.content_md} disabled={!canEdit} />
        </Field>
        <Field label="Exercice (facultatif)" htmlFor={`ls-ex-${p}`}>
          <MarkdownField id={`ls-ex-${p}`} name="exercise_md" defaultValue={lesson.exercise_md ?? ""} rows={6} disabled={!canEdit} />
        </Field>
      </fieldset>
    </ActionForm>
  );
}

export function DeleteLessonButton({ lesson }: { lesson: Lesson }) {
  return (
    <ActionButton
      variant="outline"
      size="sm"
      confirm={`Supprimer la leçon « ${lesson.title} » et sa vidéo ? La progression des apprenants sur cette leçon est perdue.`}
      action={() => deleteLesson(lesson.id)}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" /> Supprimer la leçon
    </ActionButton>
  );
}

// --- Lesson video ----------------------------------------------------------------------

export function VideoLinkForm({ lessonId, defaultUrl }: { lessonId: string; defaultUrl: string | null }) {
  return (
    <ActionForm action={setLessonVideoUrl.bind(null, lessonId)} className="space-y-3" submitLabel="Enregistrer le lien">
      <Field
        label="Lien de la vidéo"
        htmlFor={`vid-url-${lessonId}`}
        hint="YouTube, Vimeo, Loom ou tout lien https://. Remplace une vidéo envoyée."
      >
        <Input
          id={`vid-url-${lessonId}`}
          name="video_url"
          type="url"
          placeholder="https://www.youtube.com/watch?v=…"
          defaultValue={defaultUrl ?? ""}
          required
        />
      </Field>
    </ActionForm>
  );
}

/**
 * Upload to the private bucket: a server action creates a signed upload URL,
 * the browser PUTs the file straight to Supabase Storage (never through a
 * server action body, capped at 4.5 MB on Vercel), then the lesson is linked.
 */
export function VideoUpload({ lessonId }: { lessonId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState<"idle" | "uploading" | "saving">("idle");
  const router = useRouter();
  const tooBig = !!file && file.size > MAX_VIDEO_BYTES;
  const badType = !!file && !isAllowedVideoType(file.type);

  async function upload() {
    if (!file || tooBig || badType) return;
    setStep("uploading");
    try {
      const prepared = await createLessonVideoUpload(lessonId, { fileName: file.name, size: file.size, type: file.type });
      if (!prepared.ok || !prepared.data) throw new Error(prepared.ok ? "Préparation de l'envoi impossible." : prepared.error);
      const res = await fetch(prepared.data.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type, "x-upsert": "false" },
        body: file,
      });
      if (!res.ok) {
        throw new Error(
          res.status === 413 ? `Fichier refusé par le stockage : trop volumineux (${MAX_VIDEO_LABEL} maximum).` : "Envoi interrompu, réessayez.",
        );
      }
      setStep("saving");
      const attached = await attachLessonVideo(lessonId, prepared.data.path);
      if (!attached.ok) throw new Error(attached.error);
      toast.success(attached.message ?? "Vidéo enregistrée.");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setStep("idle");
    }
  }

  const busy = step !== "idle";
  return (
    <div className="space-y-3">
      <Field
        label="Fichier vidéo"
        htmlFor={`vid-file-${lessonId}`}
        hint={`MP4 (recommandé), WebM, MOV ou OGG — ${MAX_VIDEO_LABEL} maximum par fichier (limite du plan Supabase actuel). Stockage privé : seuls les inscrits à la formation et l'équipe peuvent la lire.`}
      >
        <Input
          ref={inputRef}
          id={`vid-file-${lessonId}`}
          type="file"
          accept={VIDEO_MIME_TYPES.join(",")}
          disabled={busy}
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </Field>
      {file && (
        <p className={tooBig || badType ? "text-sm text-destructive" : "text-sm text-muted-foreground"} role="status">
          {file.name} — {(file.size / 1024 / 1024).toFixed(1)} Mo
          {tooBig && ` : dépasse ${MAX_VIDEO_LABEL}. Compressez la vidéo ou publiez-la sur YouTube/Vimeo et collez le lien.`}
          {badType && " : format non pris en charge."}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="button" onClick={upload} disabled={!file || tooBig || badType || busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Upload className="h-4 w-4" aria-hidden="true" />}
          {step === "uploading" ? "Envoi en cours…" : step === "saving" ? "Enregistrement…" : "Envoyer la vidéo"}
        </Button>
      </div>
    </div>
  );
}

export function RemoveVideoButton({ lessonId }: { lessonId: string }) {
  return (
    <ActionButton
      variant="ghost"
      size="sm"
      confirm="Retirer la vidéo de cette leçon ? Un fichier envoyé est supprimé du stockage."
      action={() => removeLessonVideo(lessonId)}
    >
      <X className="h-4 w-4" aria-hidden="true" /> Retirer la vidéo
    </ActionButton>
  );
}

// --- Enrollments -----------------------------------------------------------------------

export function EnrollmentStatusButton({ enrollmentId, status, label }: { enrollmentId: string; status: string; label: string }) {
  if (status === "cancelled") {
    return (
      <ActionButton
        size="sm"
        variant="ghost"
        title="Rétablir l'accès"
        aria-label={`Rétablir l'accès de ${label}`}
        confirm={`Rétablir l'accès de ${label} à cette formation ? (aucun e-mail envoyé)`}
        action={() => setEnrollmentStatus(enrollmentId, "active")}
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" /> Rétablir
      </ActionButton>
    );
  }
  return (
    <ActionButton
      size="sm"
      variant="ghost"
      title="Retirer l'accès"
      aria-label={`Retirer l'accès de ${label}`}
      confirm={`Retirer l'accès de ${label} à cette formation ? Sa progression est conservée ; aucun e-mail envoyé.`}
      action={() => setEnrollmentStatus(enrollmentId, "cancelled")}
    >
      <Ban className="h-4 w-4" aria-hidden="true" /> Retirer
    </ActionButton>
  );
}

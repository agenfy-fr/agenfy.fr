/**
 * Training (app.agenfy.fr) domain shared by the console "Formations" section:
 * enums mirroring the CHECK constraints of 0200 / 0304, labels, video rules.
 * Pure module: usable client-side and in unit tests.
 */
import type { StatusBadgeVariant } from "@/components/shared/status-badge";
import { slugify } from "./format";

type Labeled<T extends string> = Record<T, { label: string; variant: StatusBadgeVariant }>;

export const COURSE_STATUSES = ["draft", "published", "archived"] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];
export const COURSE_STATUS_META: Labeled<CourseStatus> = {
  draft: { label: "Brouillon", variant: "neutral" },
  published: { label: "Publiée", variant: "success" },
  archived: { label: "Archivée", variant: "caution" },
};

export const COURSE_CATEGORIES = ["essentiels", "technique", "management"] as const;
export const COURSE_CATEGORY_LABELS: Record<(typeof COURSE_CATEGORIES)[number], string> = {
  essentiels: "Essentiels",
  technique: "Technique",
  management: "Management",
};

export const COURSE_LEVELS = ["debutant", "intermediaire", "avance"] as const;
export const COURSE_LEVEL_LABELS: Record<(typeof COURSE_LEVELS)[number], string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};

export const COURSE_MODALITIES = ["presentiel", "distanciel", "hybride", "elearning"] as const;
export const COURSE_MODALITY_LABELS: Record<(typeof COURSE_MODALITIES)[number], string> = {
  presentiel: "Présentiel",
  distanciel: "Distanciel",
  hybride: "Hybride",
  elearning: "E-learning",
};

export const ENROLLMENT_STATUSES = ["active", "completed", "cancelled"] as const;
export type EnrollmentStatus = (typeof ENROLLMENT_STATUSES)[number];
export const ENROLLMENT_STATUS_META: Labeled<EnrollmentStatus> = {
  active: { label: "En cours", variant: "info" },
  completed: { label: "Terminée", variant: "success" },
  cancelled: { label: "Annulée", variant: "neutral" },
};

// --- Lesson videos --------------------------------------------------------------------

/** Private Storage bucket (0304). */
export const TRAINING_VIDEO_BUCKET = "training-videos";

/**
 * Per-file limit of the bucket = Supabase free plan global limit (50 MB).
 * Raise it together with the Storage settings and 0304's bucket limit.
 */
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
export const MAX_VIDEO_LABEL = "50 Mo";

export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime", "video/ogg"] as const;

export function isAllowedVideoType(type: string): boolean {
  return (VIDEO_MIME_TYPES as readonly string[]).includes(type);
}

/**
 * Storage path of an uploaded lesson video: `<course>/<lesson>/<timestamp>-<name>`,
 * matching lessons_video_path_check (0304).
 */
export function lessonVideoPath(courseId: string, lessonId: string, fileName: string, now = Date.now()): string {
  const dot = fileName.lastIndexOf(".");
  const ext = dot > 0 ? fileName.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 8) : "";
  const base = slugify(dot > 0 ? fileName.slice(0, dot) : fileName).slice(0, 40).replace(/-+$/, "") || "video";
  return `${courseId}/${lessonId}/${now}-${base}${ext ? `.${ext}` : ""}`;
}

export function isLessonVideoPath(path: string, courseId: string, lessonId: string): boolean {
  return path.startsWith(`${courseId}/${lessonId}/`) && !path.includes("..") && path.split("/").length === 3;
}

export type VideoProvider = "youtube" | "vimeo" | "loom" | "other";

/** Provider of an https video link (shown in the console, embedded by the app). */
export function videoProvider(url: string): VideoProvider {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") return "youtube";
    if (host === "vimeo.com" || host === "player.vimeo.com") return "vimeo";
    if (host === "loom.com") return "loom";
  } catch {
    // fall through
  }
  return "other";
}

export const VIDEO_PROVIDER_LABELS: Record<VideoProvider, string> = {
  youtube: "YouTube",
  vimeo: "Vimeo",
  loom: "Loom",
  other: "Lien vidéo",
};

/** Lesson slug from a title, unique among `taken`. */
export function uniqueSlug(title: string, taken: Iterable<string>, fallback = "lecon"): string {
  const used = new Set(taken);
  const base = slugify(title).replace(/-+$/, "") || fallback;
  let slug = base;
  for (let i = 2; used.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

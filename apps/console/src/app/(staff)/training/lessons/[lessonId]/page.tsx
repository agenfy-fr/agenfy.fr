import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { TRAINING_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { TRAINING_VIDEO_BUCKET, VIDEO_PROVIDER_LABELS, videoProvider } from "@/lib/training";
import type { CourseModule, Lesson } from "@/lib/types";
import { DeleteLessonButton, LessonForm, RemoveVideoButton, VideoLinkForm, VideoUpload } from "../../training-forms";

export const metadata: Metadata = { title: "Leçon" };

export default async function LessonEditorPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  if (!UUID_RE.test(lessonId)) notFound();
  const { supabase, role } = await requireStaffPage("/training");

  const { data } = await supabase.from("lessons").select("*").eq("id", lessonId).maybeSingle();
  const lesson = data as Lesson | null;
  if (!lesson) notFound();
  const [courseRes, modulesRes] = await Promise.all([
    supabase.from("courses").select("id, title, slug, status").eq("id", lesson.course_id).maybeSingle(),
    supabase.from("course_modules").select("id, course_id, position, title, summary, duration_minutes").eq("course_id", lesson.course_id).order("position"),
  ]);
  const course = courseRes.data as { id: string; title: string; slug: string; status: string } | null;
  if (!course) notFound();
  const modules = (modulesRes.data ?? []) as CourseModule[];
  const canEdit = canWriteDomain(role, TRAINING_WRITE_ROLES);

  // Private bucket: short-lived signed URL (staff session, Storage RLS).
  let previewUrl: string | null = null;
  if (lesson.video_path) {
    const { data: signed } = await supabase.storage.from(TRAINING_VIDEO_BUCKET).createSignedUrl(lesson.video_path, 900);
    previewUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={lesson.title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href={`/training/${course.id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> {course.title}
        </Link>
        {canEdit && <DeleteLessonButton lesson={lesson} />}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vidéo</CardTitle>
          <CardDescription>
            Une vidéo par leçon : lien (YouTube, Vimeo, Loom, https) ou fichier envoyé dans le stockage privé. Affichée au-dessus
            de l&apos;article dans l&apos;espace formation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {lesson.video_path ? (
            <div className="space-y-2">
              {previewUrl ? (
                <video src={previewUrl} controls preload="metadata" className="aspect-video w-full max-w-2xl rounded-md border bg-black">
                  <track kind="captions" />
                </video>
              ) : (
                <p className="text-sm text-destructive">Fichier introuvable dans le stockage.</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="break-all font-mono">{lesson.video_path.split("/").pop()}</span>
                {canEdit && <RemoveVideoButton lessonId={lesson.id} />}
              </div>
            </div>
          ) : lesson.video_url ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-medium">{VIDEO_PROVIDER_LABELS[videoProvider(lesson.video_url)]} :</span>
              <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 break-all text-primary hover:underline">
                {lesson.video_url} <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              {canEdit && <RemoveVideoButton lessonId={lesson.id} />}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune vidéo.</p>
          )}
          {canEdit && (
            <div className="grid gap-6 lg:grid-cols-2">
              <VideoLinkForm lessonId={lesson.id} defaultUrl={lesson.video_url} />
              <VideoUpload lessonId={lesson.id} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leçon</CardTitle>
          <CardDescription>
            Article en Markdown, avec aperçu. Visible par les inscrits sur app.agenfy.fr/learn/{course.slug}/lecon/{lesson.slug}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LessonForm lesson={lesson} modules={modules} canEdit={canEdit} />
        </CardContent>
      </Card>
    </div>
  );
}

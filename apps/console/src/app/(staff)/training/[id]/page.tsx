import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Video } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BreadcrumbLabel } from "@/components/nav/breadcrumb-label";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { TRAINING_WRITE_ROLES, canWriteDomain } from "@/lib/access-control";
import { metaOf } from "@/lib/domain";
import { UUID_RE } from "@/lib/schemas";
import { requireStaffPage } from "@/lib/server/auth";
import { COURSE_STATUS_META } from "@/lib/training";
import type { Course, CourseModule, Lesson } from "@/lib/types";
import { CourseForm, DeleteCourseButton, LessonMoveButtons, ModuleActions, NewLessonButton, NewModuleButton } from "../training-forms";

export const metadata: Metadata = { title: "Formation" };

type LessonRow = Pick<Lesson, "id" | "module_id" | "slug" | "position" | "title" | "duration_minutes" | "video_url" | "video_path" | "content_md">;

export default async function CoursePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();
  const { supabase, role } = await requireStaffPage("/training");
  const { tab } = await searchParams;

  const [courseRes, modulesRes, lessonsRes, enrollRes] = await Promise.all([
    supabase.from("courses").select("*").eq("id", id).maybeSingle(),
    supabase.from("course_modules").select("id, course_id, position, title, summary, duration_minutes").eq("course_id", id).order("position"),
    supabase
      .from("lessons")
      .select("id, module_id, slug, position, title, duration_minutes, video_url, video_path, content_md")
      .eq("course_id", id)
      .order("position"),
    supabase.from("enrollments").select("status").eq("course_id", id),
  ]);
  const course = courseRes.data as Course | null;
  if (!course) notFound();
  const modules = (modulesRes.data ?? []) as CourseModule[];
  const lessons = (lessonsRes.data ?? []) as LessonRow[];
  const enrollments = (enrollRes.data ?? []) as { status: string }[];
  const canEdit = canWriteDomain(role, TRAINING_WRITE_ROLES);

  return (
    <div className="space-y-6">
      <BreadcrumbLabel label={course.title} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold tracking-tight">{course.title}</h2>
          <StatusBadge size="sm" {...metaOf(COURSE_STATUS_META, course.status)} />
          <span className="text-sm text-muted-foreground">
            {enrollments.filter((e) => e.status !== "cancelled").length} inscrit(s) actif(s)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/training/access?course=${course.id}`} className="text-sm text-primary hover:underline">
            Voir les accès
          </Link>
          {canEdit && course.status === "draft" && enrollments.length === 0 && <DeleteCourseButton course={course} />}
        </div>
      </div>

      <Tabs defaultValue={tab === "fiche" ? "fiche" : "content"}>
        <TabsList>
          <TabsTrigger value="content">Contenu ({lessons.length} leçons)</TabsTrigger>
          <TabsTrigger value="fiche">Fiche formation</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Modules et leçons dans l&apos;ordre suivi par les apprenants. Cliquez une leçon pour rédiger l&apos;article et
              ajouter la vidéo.
            </p>
            {canEdit && <NewModuleButton courseId={course.id} />}
          </div>
          {modules.length === 0 ? (
            <EmptyState title="Aucun module" description="Ajoutez un module, puis ses leçons." className="p-4" />
          ) : (
            modules.map((m, mi) => {
              const moduleLessons = lessons.filter((l) => l.module_id === m.id);
              return (
                <Card key={m.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
                    <div className="min-w-0">
                      <CardTitle className="text-base">
                        {m.position}. {m.title}
                      </CardTitle>
                      {m.summary && <CardDescription>{m.summary}</CardDescription>}
                    </div>
                    {canEdit && (
                      <div className="flex shrink-0 items-center gap-1">
                        <NewLessonButton courseId={course.id} modules={modules} moduleId={m.id} />
                        <ModuleActions courseId={course.id} module={m} isFirst={mi === 0} isLast={mi === modules.length - 1} />
                      </div>
                    )}
                  </CardHeader>
                  <CardContent>
                    {moduleLessons.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Aucune leçon.</p>
                    ) : (
                      <ol className="divide-y">
                        {moduleLessons.map((l, li) => (
                          <li key={l.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                            <Link href={`/training/lessons/${l.id}`} className="flex min-w-0 items-center gap-2 hover:underline">
                              <span className="w-6 shrink-0 text-right tabular-nums text-muted-foreground">{li + 1}.</span>
                              <span className="truncate">{l.title}</span>
                            </Link>
                            <span className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                              {l.content_md.trim() && <FileText className="h-4 w-4" aria-label="Article rédigé" />}
                              {(l.video_url || l.video_path) && <Video className="h-4 w-4" aria-label="Vidéo" />}
                              <span className="tabular-nums">{l.duration_minutes} min</span>
                              {canEdit && (
                                <LessonMoveButtons
                                  courseId={course.id}
                                  lessonId={l.id}
                                  title={l.title}
                                  isFirst={li === 0}
                                  isLast={li === moduleLessons.length - 1}
                                />
                              )}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        <TabsContent value="fiche" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fiche formation</CardTitle>
              <CardDescription>Programme affiché au catalogue public : objectifs, prérequis, modalités, délais d&apos;accès, accessibilité.</CardDescription>
            </CardHeader>
            <CardContent>
              <CourseForm course={course} canEdit={canEdit} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

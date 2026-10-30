import "server-only";
import { connection } from "next/server";
import { createPublicClient } from "@/lib/supabase/server";
import type { Course, CourseModule } from "@/lib/types";

/** Published courses, read anonymously (RLS: status = 'published'). */
export async function getPublishedCourses(): Promise<Course[]> {
  await connection();
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("courses")
    .select("*")
    .eq("status", "published")
    .order("category")
    .order("title");
  return (data ?? []) as Course[];
}

export async function getPublishedCourse(
  slug: string,
): Promise<{ course: Course; modules: CourseModule[] } | null> {
  await connection();
  const supabase = createPublicClient();
  if (!supabase) return null;
  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle<Course>();
  if (!course) return null;
  const { data: modules } = await supabase
    .from("course_modules")
    .select("id, course_id, position, title, summary, duration_minutes")
    .eq("course_id", course.id)
    .order("position");
  return { course, modules: (modules ?? []) as CourseModule[] };
}

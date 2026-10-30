"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { answersFromFormData } from "@/lib/quiz";
import { EVALUATION_FORMS, parseEvaluation, type EvaluationKind } from "@/lib/evaluation-forms";
import { isColdEvaluationOpen } from "@/lib/progress";

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(fd: FormData, key: string): string {
  const v = fd.get(key);
  return typeof v === "string" ? v : "";
}

async function enrollmentFor(courseSlug: string) {
  const viewer = await requireViewer(`/learn/${courseSlug}`);
  const supabase = await createClient();
  const { data: course } = await supabase.from("courses").select("id, objectives").eq("slug", courseSlug).maybeSingle();
  if (!course) redirect("/dashboard");
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, status, completed_at")
    .eq("course_id", course.id)
    .eq("user_id", viewer.id)
    .neq("status", "cancelled")
    .maybeSingle();
  if (!enrollment) redirect("/dashboard?error=not-enrolled");
  return { viewer, supabase, course, enrollment };
}

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------
export async function setLessonCompleted(formData: FormData) {
  const courseSlug = str(formData, "course");
  const lessonId = str(formData, "lesson_id");
  const nextSlug = str(formData, "next_slug");
  const completed = str(formData, "completed") === "1";
  if (!SLUG_RE.test(courseSlug) || !UUID_RE.test(lessonId)) redirect("/dashboard");

  const { viewer, supabase, enrollment } = await enrollmentFor(courseSlug);

  if (completed) {
    const { error } = await supabase
      .from("lesson_progress")
      .upsert(
        { enrollment_id: enrollment.id, lesson_id: lessonId, user_id: viewer.id },
        { onConflict: "enrollment_id,lesson_id", ignoreDuplicates: true },
      );
    if (error) throw new Error("Impossible d'enregistrer la progression.");
  } else {
    await supabase.from("lesson_progress").delete().eq("enrollment_id", enrollment.id).eq("lesson_id", lessonId);
  }

  revalidatePath(`/learn/${courseSlug}`, "layout");
  revalidatePath("/dashboard");
  if (completed && SLUG_RE.test(nextSlug)) redirect(`/learn/${courseSlug}/lecon/${nextSlug}`);
  if (completed && nextSlug === "__end") redirect(`/learn/${courseSlug}?done=1`);
}

// ---------------------------------------------------------------------------
// Quizzes — scored in the database (answer keys never reach the browser)
// ---------------------------------------------------------------------------
export interface QuizResult {
  error?: string;
  score?: number;
  passed?: boolean;
  passScore?: number;
  correctCount?: number;
  total?: number;
  results?: {
    question_id: string;
    correct: boolean;
    selected: number[];
    correct_indexes: number[];
    explanation: string | null;
  }[];
}

export async function submitQuiz(_prev: QuizResult | null, formData: FormData): Promise<QuizResult> {
  const courseSlug = str(formData, "course");
  const quizId = str(formData, "quiz_id");
  if (!SLUG_RE.test(courseSlug) || !UUID_RE.test(quizId)) return { error: "Requête invalide." };

  const { supabase } = await enrollmentFor(courseSlug);
  const answers = answersFromFormData(formData);
  if (Object.keys(answers).length === 0) return { error: "Répondez au moins à une question." };

  const { data, error } = await supabase.rpc("submit_quiz_attempt", { p_quiz: quizId, p_answers: answers });
  if (error || !data) return { error: "Le quiz n'a pas pu être corrigé. Réessayez." };

  revalidatePath(`/learn/${courseSlug}`, "layout");
  const r = data as {
    score: number;
    passed: boolean;
    pass_score: number;
    correct_count: number;
    total: number;
    results: QuizResult["results"];
  };
  return {
    score: r.score,
    passed: r.passed,
    passScore: r.pass_score,
    correctCount: r.correct_count,
    total: r.total,
    results: r.results,
  };
}

// ---------------------------------------------------------------------------
// Evaluations (positioning / hot / cold)
// ---------------------------------------------------------------------------
export interface EvaluationState {
  errors?: string[];
  message?: string;
}

export async function submitEvaluation(_prev: EvaluationState | null, formData: FormData): Promise<EvaluationState> {
  const courseSlug = str(formData, "course");
  const kind = str(formData, "kind") as EvaluationKind;
  if (!SLUG_RE.test(courseSlug) || !(kind in EVALUATION_FORMS)) return { message: "Requête invalide." };

  const { viewer, supabase, course, enrollment } = await enrollmentFor(courseSlug);

  if ((kind === "hot" || kind === "cold") && enrollment.status !== "completed") {
    return { message: "Ce questionnaire sera disponible à la fin de la formation." };
  }
  if (kind === "cold" && !isColdEvaluationOpen(enrollment.completed_at)) {
    return { message: "Le questionnaire à froid s'ouvre 60 jours après la fin de la formation." };
  }

  const form = EVALUATION_FORMS[kind];
  const parsed = parseEvaluation(form, formData, (course.objectives as string[]).length);
  if (parsed.errors.length) {
    return { errors: parsed.errors, message: "Merci de répondre aux questions obligatoires." };
  }

  const { error } = await supabase.from("evaluations").insert({
    enrollment_id: enrollment.id,
    user_id: viewer.id,
    course_id: course.id,
    kind,
    form_version: form.version,
    answers: parsed.answers,
    overall_rating: parsed.overallRating,
    comment: parsed.comment,
  });
  if (error) {
    return {
      message: error.code === "23505" ? "Vous avez déjà répondu à ce questionnaire." : "L'envoi a échoué. Réessayez.",
    };
  }

  revalidatePath(`/learn/${courseSlug}`, "layout");
  revalidatePath("/dashboard");
  redirect(`/learn/${courseSlug}?evaluation=${kind}`);
}

// ---------------------------------------------------------------------------
// Certificate
// ---------------------------------------------------------------------------
export async function requestCertificate(formData: FormData) {
  const courseSlug = str(formData, "course");
  if (!SLUG_RE.test(courseSlug)) redirect("/dashboard");
  const { supabase, enrollment } = await enrollmentFor(courseSlug);

  const { error } = await supabase.rpc("issue_certificate", { p_enrollment: enrollment.id });
  if (error) {
    const reason = error.message.includes("missing_learner_name") ? "name" : "failed";
    redirect(`/learn/${courseSlug}/attestation?error=${reason}`);
  }
  revalidatePath(`/learn/${courseSlug}`, "layout");
  redirect(`/learn/${courseSlug}/attestation`);
}

// ---------------------------------------------------------------------------
// Attendance signature (émargement)
// ---------------------------------------------------------------------------
export async function signAttendance(formData: FormData) {
  const courseSlug = str(formData, "course");
  const sessionId = str(formData, "session_id");
  const signature = str(formData, "signature");
  if (!SLUG_RE.test(courseSlug) || !UUID_RE.test(sessionId)) redirect("/dashboard");
  if (!signature.startsWith("data:image/png;base64,")) {
    redirect(`/learn/${courseSlug}/emargement?error=signature`);
  }
  const { supabase } = await enrollmentFor(courseSlug);
  const { error } = await supabase.rpc("sign_attendance", { p_session: sessionId, p_signature: signature });
  if (error) {
    const code = error.message.includes("window")
      ? "window"
      : error.message.includes("already")
        ? "already"
        : "failed";
    redirect(`/learn/${courseSlug}/emargement?error=${code}`);
  }
  revalidatePath(`/learn/${courseSlug}/emargement`);
  redirect(`/learn/${courseSlug}/emargement?signed=1`);
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageTitle } from "@/components/notice";
import { getLearnerCourse } from "@/lib/learner";
import { createClient } from "@/lib/supabase/server";
import type { QuizQuestionPublic } from "@/lib/types";
import { QuizForm } from "./quiz-form";

export const metadata: Metadata = { title: "Quiz" };

export default async function QuizPage({ params }: { params: Promise<{ slug: string; quizId: string }> }) {
  const { slug, quizId } = await params;
  const { modules } = await getLearnerCourse(slug);
  const moduleIndex = modules.findIndex((m) => m.quiz?.id === quizId);
  if (moduleIndex === -1) notFound();
  const mod = modules[moduleIndex];
  const quiz = mod.quiz!;

  const supabase = await createClient();
  // Explicit columns: the answer key (correct_indexes, explanation) is not granted to learners.
  const { data } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id, position, prompt, choices, multiple")
    .eq("quiz_id", quizId)
    .order("position");
  const questions = (data ?? []) as QuizQuestionPublic[];

  const nextModule = modules[moduleIndex + 1];
  const continueHref = nextModule?.lessons[0]
    ? `/learn/${slug}/lecon/${nextModule.lessons[0].slug}`
    : `/learn/${slug}`;

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/learn/${slug}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Vue d&apos;ensemble
      </Link>
      <PageTitle
        eyebrow={`Module ${mod.position} · Quiz`}
        title={quiz.title}
        description={
          <>
            {questions.length} questions · validation à partir de {quiz.pass_score} %
            {quiz.bestScore !== null && <> · meilleur score : {quiz.bestScore} %</>}
          </>
        }
      />
      <QuizForm
        courseSlug={slug}
        quizId={quizId}
        questions={questions}
        passScore={quiz.pass_score}
        continueHref={continueHref}
      />
    </div>
  );
}

"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import type { QuizQuestionPublic } from "@/lib/types";
import { submitQuiz, type QuizResult } from "../../../actions";

export function QuizForm({
  courseSlug,
  quizId,
  questions,
  passScore,
  continueHref,
}: {
  courseSlug: string;
  quizId: string;
  questions: QuizQuestionPublic[];
  passScore: number;
  continueHref: string;
}) {
  const [state, action] = useActionState<QuizResult | null, FormData>(submitQuiz, null);
  const graded = state?.results ? new Map(state.results.map((r) => [r.question_id, r])) : null;

  if (graded && state) {
    return (
      <div>
        <div
          className={cn(
            "mb-8 rounded-2xl border p-6",
            state.passed ? "border-primary/30 bg-primary/5" : "border-amber-500/30 bg-amber-500/5",
          )}
          role="status"
        >
          <p className="text-sm text-muted-foreground">Votre score</p>
          <p className="text-4xl font-bold tabular-nums">{state.score} %</p>
          <p className="mt-1 text-sm">
            {state.correctCount} bonne(s) réponse(s) sur {state.total} —{" "}
            {state.passed ? "quiz validé." : `seuil de validation : ${passScore} %. Relisez les explications et réessayez.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild className="rounded-full gradient-btn border-0 text-white">
              <Link href={continueHref}>
                Continuer <ArrowRight />
              </Link>
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => window.location.reload()}>
              <RotateCcw /> Refaire le quiz
            </Button>
          </div>
        </div>

        <ol className="space-y-6">
          {questions.map((q, i) => {
            const r = graded.get(q.id);
            return (
              <li key={q.id} className="rounded-2xl border bg-card p-5">
                <p className="flex items-start gap-2 font-medium">
                  {r?.correct ? (
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-label="Bonne réponse" />
                  ) : (
                    <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-label="Mauvaise réponse" />
                  )}
                  <span>
                    {i + 1}. {q.prompt}
                  </span>
                </p>
                <ul className="mt-3 space-y-1.5 pl-7 text-sm">
                  {q.choices.map((c, idx) => {
                    const isCorrect = r?.correct_indexes.includes(idx);
                    const isSelected = r?.selected.includes(idx);
                    return (
                      <li
                        key={idx}
                        className={cn(
                          "rounded-md px-3 py-1.5",
                          isCorrect && "bg-primary/10 font-medium",
                          isSelected && !isCorrect && "bg-destructive/10 line-through",
                        )}
                      >
                        {c}
                        {isCorrect && <span className="sr-only"> (bonne réponse)</span>}
                        {isSelected && <span className="sr-only"> (votre réponse)</span>}
                      </li>
                    );
                  })}
                </ul>
                {r?.explanation && <p className="mt-3 pl-7 text-sm text-muted-foreground">{r.explanation}</p>}
              </li>
            );
          })}
        </ol>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="course" value={courseSlug} />
      <input type="hidden" name="quiz_id" value={quizId} />
      {state?.error && <Notice tone="error">{state.error}</Notice>}
      <ol className="space-y-6">
        {questions.map((q, i) => (
          <li key={q.id}>
            <fieldset className="rounded-2xl border bg-card p-5">
              <legend className="sr-only">Question {i + 1}</legend>
              <p className="font-medium">
                {i + 1}. {q.prompt}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {q.multiple ? "Plusieurs réponses possibles" : "Une seule réponse"}
              </p>
              <div className="mt-3 space-y-2">
                {q.choices.map((c, idx) => (
                  <label
                    key={idx}
                    className="flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-secondary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <input
                      type={q.multiple ? "checkbox" : "radio"}
                      name={`q:${q.id}`}
                      value={idx}
                      className="mt-0.5 accent-[var(--primary)]"
                    />
                    <span>{c}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </li>
        ))}
      </ol>
      <SubmitButton size="lg" className="rounded-full gradient-btn border-0 text-white" pendingLabel="Correction…">
        Valider mes réponses
      </SubmitButton>
    </form>
  );
}

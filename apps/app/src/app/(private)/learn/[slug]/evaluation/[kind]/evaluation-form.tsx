"use client";

import { useActionState } from "react";
import { Notice } from "@/components/notice";
import { SubmitButton } from "@/components/submit-button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  EVALUATION_FORMS,
  LEVEL_SCALE,
  SATISFACTION_SCALE,
  type EvaluationKind,
} from "@/lib/evaluation-forms";
import { submitEvaluation, type EvaluationState } from "../../../actions";

function Scale({
  name,
  scale,
  invalid,
  labelledBy,
}: {
  name: string;
  scale: readonly { value: number; label: string }[];
  invalid: boolean;
  labelledBy: string;
}) {
  return (
    <div role="radiogroup" aria-labelledby={labelledBy} aria-invalid={invalid} className="mt-2 grid grid-cols-5 gap-1.5">
      {scale.map((s) => (
        <label
          key={s.value}
          className="flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-[11px] leading-tight hover:bg-secondary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
        >
          <input type="radio" name={name} value={s.value} className="accent-[var(--primary)]" required />
          <span className="font-semibold text-sm">{s.value}</span>
          <span className="hidden sm:block text-muted-foreground">{s.label}</span>
        </label>
      ))}
    </div>
  );
}

export function EvaluationFormView({
  kind,
  courseSlug,
  objectives,
}: {
  kind: EvaluationKind;
  courseSlug: string;
  objectives: string[];
}) {
  const form = EVALUATION_FORMS[kind];
  const [state, action] = useActionState<EvaluationState | null, FormData>(submitEvaluation, null);
  const errors = new Set(state?.errors ?? []);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="course" value={courseSlug} />
      <input type="hidden" name="kind" value={kind} />
      {state?.message && <Notice tone="error">{state.message}</Notice>}

      {form.questions.map((q) => {
        const invalid = errors.has(q.id);
        const labelId = `label-${q.id}`;
        return (
          <fieldset
            key={q.id}
            className={cn("rounded-2xl border bg-card p-5", invalid && "border-destructive")}
          >
            <legend id={labelId} className="float-left w-full font-medium">
              {q.label}
              {q.required && <span className="text-destructive"> *</span>}
            </legend>
            <div className="clear-both" />

            {q.type === "rating" && (
              <Scale name={q.id} scale={SATISFACTION_SCALE} invalid={invalid} labelledBy={labelId} />
            )}

            {q.type === "objectives" && (
              <div className="mt-3 space-y-5">
                <p className="text-xs text-muted-foreground">
                  1 = je découvre · 5 = je maîtrise
                </p>
                {objectives.map((o, i) => (
                  <div key={i}>
                    <p id={`${labelId}-${i}`} className="text-sm">
                      {o}
                    </p>
                    <Scale name={`${q.id}:${i}`} scale={LEVEL_SCALE} invalid={invalid} labelledBy={`${labelId}-${i}`} />
                  </div>
                ))}
              </div>
            )}

            {q.type === "choice" && (
              <div role="radiogroup" aria-labelledby={labelId} className="mt-3 flex flex-wrap gap-2">
                {q.options.map((o) => (
                  <label
                    key={o.value}
                    className="flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm hover:bg-secondary/60 has-[:checked]:border-primary has-[:checked]:bg-primary/10"
                  >
                    <input type="radio" name={q.id} value={o.value} required={q.required} className="accent-[var(--primary)]" />
                    {o.label}
                  </label>
                ))}
              </div>
            )}

            {q.type === "text" && (
              <Textarea
                name={q.id}
                aria-labelledby={labelId}
                required={q.required}
                maxLength={3000}
                rows={3}
                className="mt-3"
                placeholder={q.placeholder}
              />
            )}
          </fieldset>
        );
      })}

      <SubmitButton size="lg" className="rounded-full gradient-btn border-0 text-white" pendingLabel="Envoi…">
        Envoyer mes réponses
      </SubmitButton>
    </form>
  );
}

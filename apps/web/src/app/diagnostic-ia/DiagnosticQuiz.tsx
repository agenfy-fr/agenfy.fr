"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUESTIONS, LEVELS, computeResult, type Answers } from "@/lib/diagnostic";
import { getOffer } from "@/lib/offers";
import { submitDiagnosticLead, type DiagnosticLeadState } from "./actions";

const initialLeadState: DiagnosticLeadState = { success: false };

export function DiagnosticQuiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [step, setStep] = useState(0);
  const done = step >= QUESTIONS.length;

  if (done) {
    return (
      <Results
        answers={answers}
        onRestart={() => {
          setAnswers({});
          setStep(0);
        }}
      />
    );
  }

  const question = QUESTIONS[step];
  const selected = answers[question.id];
  const progress = Math.round((step / QUESTIONS.length) * 100);

  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10">
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>
            Question {step + 1} sur {QUESTIONS.length}
          </span>
          <span>{progress} %</span>
        </div>
        <div
          className="h-2 rounded-full bg-secondary overflow-hidden"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Progression du diagnostic"
        >
          <div className="h-full gradient-bg transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <fieldset>
        <legend className="text-h3 font-semibold text-foreground mb-6">{question.text}</legend>
        <div className="grid gap-3">
          {question.options.map((option, value) => (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                selected === value ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={value}
                checked={selected === value}
                onChange={() => setAnswers((prev) => ({ ...prev, [question.id]: value }))}
                className="accent-[var(--primary)] h-4 w-4"
              />
              <span className="text-foreground">{option}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-8 flex justify-between">
        <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Précédent
        </Button>
        <Button
          className="rounded-full gradient-btn border-0 px-6"
          onClick={() => setStep((s) => s + 1)}
          disabled={selected === undefined}
        >
          {step === QUESTIONS.length - 1 ? "Voir mon résultat" : "Suivant"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Results({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const result = computeResult(answers);
  const [state, formAction, isPending] = useActionState(submitDiagnosticLead, initialLeadState);

  return (
    <div className="space-y-8" aria-live="polite">
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Votre résultat</p>
        <div className="flex flex-wrap items-end gap-4 mb-4">
          <p className="text-6xl font-bold gradient-text">{result.score}</p>
          <p className="text-muted-foreground mb-2">/ 100</p>
        </div>
        <h2 className="text-h2 font-bold mb-2">
          Niveau {result.level.id} sur {LEVELS.length} : {result.level.name}
        </h2>
        <p className="text-muted-foreground mb-8">{result.level.description}</p>

        <h3 className="font-semibold mb-4">Détail par axe</h3>
        <ul className="space-y-3">
          {result.axes.map(({ axis, score }) => (
            <li key={axis.id}>
              <div className="flex justify-between text-sm mb-1">
                <span>{axis.label}</span>
                <span className="text-muted-foreground">{score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full gradient-bg" style={{ width: `${Math.max(score, 2)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 sm:p-10">
        <h3 className="text-h3 font-bold mb-6">Vos deux priorités</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {result.weakest.map((axis) => {
            const offer = getOffer(axis.offerSlug);
            return (
              <div key={axis.id} className="rounded-2xl border border-border/60 p-5">
                <p className="font-semibold mb-2">{axis.label}</p>
                <p className="text-sm text-muted-foreground mb-4">{axis.advice}</p>
                <Link href={offer.path} className="text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                  {offer.name} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-3xl border border-primary/30 bg-primary/5 p-6 sm:p-10">
        {state.success ? (
          <div className="text-center">
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-3" />
            <p className="font-semibold mb-1">C&apos;est noté.</p>
            <p className="text-muted-foreground text-sm">
              Nous revenons vers vous sous 2 jours ouvrés pour planifier une restitution de 30 minutes.
            </p>
          </div>
        ) : (
          <>
            <h3 className="text-h3 font-bold mb-2">Recevoir une restitution personnalisée</h3>
            <p className="text-muted-foreground mb-6">
              30 minutes avec un expert Agenfy pour commenter votre résultat et définir vos premières actions.
              Gratuit et sans engagement.
            </p>
            <form action={formAction} className="grid sm:grid-cols-3 gap-3">
              <input type="hidden" name="answers" value={JSON.stringify(answers)} />
              <Input name="name" placeholder="Nom *" required autoComplete="name" aria-label="Nom" />
              <Input name="email" type="email" placeholder="Email professionnel *" required autoComplete="email" aria-label="Email professionnel" />
              <Input name="company" placeholder="Entreprise" autoComplete="organization" aria-label="Entreprise" />
              <label className="sm:col-span-3 flex items-start gap-2 text-sm text-muted-foreground">
                <input type="checkbox" name="consent" required className="mt-1 accent-[var(--primary)]" />
                J&apos;accepte qu&apos;Agenfy me recontacte au sujet de ce diagnostic. Mes réponses sont conservées
                uniquement à cette fin (voir la{" "}
                <Link href="/politique-confidentialite" className="underline">
                  politique de confidentialité
                </Link>
                ).
              </label>
              {state.error && <p className="sm:col-span-3 text-sm text-destructive">{state.error}</p>}
              <Button type="submit" disabled={isPending} className="sm:col-span-3 rounded-full gradient-btn border-0">
                {isPending ? "Envoi..." : "Demander ma restitution"}
              </Button>
            </form>
          </>
        )}
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onRestart}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Recommencer le diagnostic
        </Button>
      </div>
    </div>
  );
}

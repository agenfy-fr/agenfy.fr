/**
 * Quiz scoring rules. The authoritative scoring runs in the database
 * (public.submit_quiz_attempt, migration 0202) so answer keys never reach the
 * browser; this module mirrors the same rules for tests, content validation
 * and result display.
 *
 * A question is correct when the set of selected indexes equals the set of
 * correct indexes (no partial credit). score = round(100 * correct / total).
 */

export interface ScorableQuestion {
  id: string;
  correct: number[];
}

export type QuizAnswers = Record<string, number[]>;

export interface QuizScore {
  correctCount: number;
  total: number;
  score: number;
  passed: boolean;
  perQuestion: Record<string, boolean>;
}

export function normalizeSelection(selection: unknown): number[] {
  if (!Array.isArray(selection)) return [];
  const ints = selection
    .map((v) => (typeof v === "string" && /^\d+$/.test(v) ? Number(v) : v))
    .filter((v): v is number => Number.isInteger(v) && v >= 0);
  return [...new Set(ints)].sort((a, b) => a - b);
}

export function isAnswerCorrect(selected: unknown, correct: number[]): boolean {
  const a = normalizeSelection(selected);
  const b = normalizeSelection(correct);
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

export function scoreQuiz(
  questions: ScorableQuestion[],
  answers: QuizAnswers,
  passScore = 70,
): QuizScore {
  if (questions.length === 0) throw new Error("empty_quiz");
  const perQuestion: Record<string, boolean> = {};
  let correctCount = 0;
  for (const q of questions) {
    const ok = isAnswerCorrect(answers[q.id], q.correct);
    perQuestion[q.id] = ok;
    if (ok) correctCount += 1;
  }
  const total = questions.length;
  const score = Math.round((correctCount * 100) / total);
  return { correctCount, total, score, passed: score >= passScore, perQuestion };
}

/** Parses a quiz form submission: fields named `q:<questionId>` (repeated for checkboxes). */
export function answersFromFormData(formData: FormData): QuizAnswers {
  const answers: QuizAnswers = {};
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("q:") || typeof value !== "string") continue;
    const id = key.slice(2);
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) continue;
    (answers[id] ??= []).push(n);
  }
  for (const id of Object.keys(answers)) answers[id] = normalizeSelection(answers[id]);
  return answers;
}

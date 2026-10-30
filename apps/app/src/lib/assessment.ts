/** Human-readable summary of quiz results, printed on the certificate. */
export function assessmentSummary(
  modules: { quiz: { bestScore: number | null; passed: boolean } | null }[],
): string {
  const quizzes = modules.map((m) => m.quiz).filter((q): q is NonNullable<typeof q> => q !== null);
  if (quizzes.length === 0) return "Évaluation des acquis réalisée en cours de formation par le formateur.";
  const taken = quizzes.filter((q) => q.bestScore !== null);
  const passed = quizzes.filter((q) => q.passed).length;
  if (taken.length === 0) return "Quiz d'évaluation des acquis non réalisés.";
  const mean = Math.round(taken.reduce((s, q) => s + (q.bestScore ?? 0), 0) / taken.length);
  return `${passed} quiz validé(s) sur ${quizzes.length} — score moyen : ${mean} % (meilleur score par module).`;
}

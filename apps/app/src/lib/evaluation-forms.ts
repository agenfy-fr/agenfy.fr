/**
 * Evaluation questionnaires (Qualiopi indicators 8, 11, 30).
 * Stored in public.evaluations with `form_version`: never change the meaning
 * of an existing question id — add a new version instead.
 */

export type EvaluationKind = "positioning" | "hot" | "cold";

export type EvaluationQuestion =
  | { id: string; type: "rating"; label: string; required: boolean; scale?: "satisfaction" | "level" }
  | { id: string; type: "objectives"; label: string; required: boolean }
  | { id: string; type: "choice"; label: string; required: boolean; options: { value: string; label: string }[] }
  | { id: string; type: "text"; label: string; required: boolean; placeholder?: string };

export interface EvaluationForm {
  kind: EvaluationKind;
  version: string;
  title: string;
  intro: string;
  /** Question ids whose ratings are averaged into overall_rating. */
  overallFrom: string[];
  questions: EvaluationQuestion[];
}

export const SATISFACTION_SCALE = [
  { value: 1, label: "Pas du tout satisfait" },
  { value: 2, label: "Peu satisfait" },
  { value: 3, label: "Moyennement satisfait" },
  { value: 4, label: "Satisfait" },
  { value: 5, label: "Très satisfait" },
] as const;

export const LEVEL_SCALE = [
  { value: 1, label: "Je découvre" },
  { value: 2, label: "Notions" },
  { value: 3, label: "Je pratique" },
  { value: 4, label: "À l'aise" },
  { value: 5, label: "Je maîtrise" },
] as const;

export const EVALUATION_FORMS: Record<EvaluationKind, EvaluationForm> = {
  positioning: {
    kind: "positioning",
    version: "positioning-v1",
    title: "Test de positionnement",
    intro:
      "Avant de commencer, situez-vous sur chacun des objectifs de la formation. Il n'y a pas de bonne ou de mauvaise réponse : vos réponses permettent au formateur d'adapter le parcours à votre niveau et à vos attentes.",
    overallFrom: ["objectives"],
    questions: [
      { id: "objectives", type: "objectives", label: "Votre niveau actuel sur chaque objectif", required: true },
      {
        id: "ai_usage",
        type: "choice",
        label: "À quelle fréquence utilisez-vous aujourd'hui un outil d'IA générative ?",
        required: true,
        options: [
          { value: "never", label: "Jamais" },
          { value: "occasional", label: "Occasionnellement" },
          { value: "weekly", label: "Chaque semaine" },
          { value: "daily", label: "Tous les jours" },
        ],
      },
      { id: "job", type: "text", label: "Votre fonction et vos principales missions", required: true },
      {
        id: "expectations",
        type: "text",
        label: "Qu'attendez-vous de cette formation ? Quelles tâches aimeriez-vous améliorer ?",
        required: true,
      },
      {
        id: "accessibility_needs",
        type: "text",
        label:
          "Avez-vous besoin d'une adaptation (situation de handicap, contrainte matérielle, rythme) ? Facultatif, traité de manière confidentielle.",
        required: false,
      },
    ],
  },
  hot: {
    kind: "hot",
    version: "hot-v1",
    title: "Questionnaire de satisfaction (à chaud)",
    intro:
      "Merci de prendre 3 minutes pour évaluer la formation. Vos réponses nous servent à améliorer nos contenus et notre animation.",
    overallFrom: ["objectives_met", "content", "trainer", "materials", "organisation", "applicability"],
    questions: [
      { id: "objectives_met", type: "rating", label: "Les objectifs annoncés ont été atteints", required: true },
      { id: "content", type: "rating", label: "Qualité et pertinence du contenu", required: true },
      { id: "trainer", type: "rating", label: "Animation et pédagogie du formateur", required: true },
      { id: "materials", type: "rating", label: "Supports et exercices", required: true },
      { id: "organisation", type: "rating", label: "Organisation et outils (plateforme, logistique)", required: true },
      { id: "applicability", type: "rating", label: "Applicabilité à votre poste", required: true },
      { id: "objectives", type: "objectives", label: "Votre niveau après la formation sur chaque objectif", required: true },
      {
        id: "recommend",
        type: "choice",
        label: "Recommanderiez-vous cette formation à un collègue ?",
        required: true,
        options: [
          { value: "yes", label: "Oui" },
          { value: "maybe", label: "Peut-être" },
          { value: "no", label: "Non" },
        ],
      },
      { id: "liked", type: "text", label: "Ce que vous avez le plus apprécié", required: false },
      { id: "improve", type: "text", label: "Ce que nous devrions améliorer", required: false },
    ],
  },
  cold: {
    kind: "cold",
    version: "cold-v1",
    title: "Questionnaire à froid (J+60)",
    intro:
      "Deux mois après la formation, que reste-t-il dans votre pratique ? Ce questionnaire mesure l'impact réel de la formation sur votre travail.",
    overallFrom: ["usage", "impact", "relevance"],
    questions: [
      { id: "usage", type: "rating", label: "Vous mettez en pratique ce que vous avez appris", required: true },
      { id: "impact", type: "rating", label: "La formation a eu un effet concret sur votre travail", required: true },
      { id: "relevance", type: "rating", label: "Avec le recul, la formation était adaptée à vos besoins", required: true },
      {
        id: "adopted",
        type: "text",
        label: "Quels usages avez-vous adoptés depuis la formation ?",
        required: true,
      },
      { id: "obstacles", type: "text", label: "Quels freins rencontrez-vous ?", required: false },
      { id: "next_needs", type: "text", label: "De quel accompagnement auriez-vous besoin ensuite ?", required: false },
    ],
  },
};

export const EVALUATION_LABELS: Record<EvaluationKind, string> = {
  positioning: "Positionnement",
  hot: "Satisfaction à chaud",
  cold: "Évaluation à froid (J+60)",
};

export type EvaluationAnswers = Record<string, number | string | Record<string, number>>;

export interface ParsedEvaluation {
  answers: EvaluationAnswers;
  overallRating: number | null;
  comment: string | null;
  errors: string[];
}

const MAX_TEXT = 3000;

function parseRating(raw: FormDataEntryValue | null): number | null {
  if (typeof raw !== "string") return null;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

/**
 * Validates a submitted questionnaire. Field names:
 *   rating/choice/text: `<questionId>`
 *   objectives:         `<questionId>:<objectiveIndex>`
 */
export function parseEvaluation(
  form: EvaluationForm,
  formData: FormData,
  objectivesCount: number,
): ParsedEvaluation {
  const answers: EvaluationAnswers = {};
  const errors: string[] = [];
  const ratingsForOverall: number[] = [];

  for (const q of form.questions) {
    if (q.type === "rating") {
      const v = parseRating(formData.get(q.id));
      if (v === null) {
        if (q.required) errors.push(q.id);
        continue;
      }
      answers[q.id] = v;
      if (form.overallFrom.includes(q.id)) ratingsForOverall.push(v);
    } else if (q.type === "objectives") {
      const values: Record<string, number> = {};
      for (let i = 0; i < objectivesCount; i++) {
        const v = parseRating(formData.get(`${q.id}:${i}`));
        if (v === null) continue;
        values[String(i)] = v;
      }
      const complete = Object.keys(values).length === objectivesCount;
      if (!complete && q.required && objectivesCount > 0) {
        errors.push(q.id);
        continue;
      }
      answers[q.id] = values;
      if (form.overallFrom.includes(q.id)) ratingsForOverall.push(...Object.values(values));
    } else if (q.type === "choice") {
      const raw = formData.get(q.id);
      const valid = typeof raw === "string" && q.options.some((o) => o.value === raw);
      if (!valid) {
        if (q.required) errors.push(q.id);
        continue;
      }
      answers[q.id] = raw as string;
    } else {
      const raw = formData.get(q.id);
      const text = typeof raw === "string" ? raw.trim().slice(0, MAX_TEXT) : "";
      if (!text) {
        if (q.required) errors.push(q.id);
        continue;
      }
      answers[q.id] = text;
    }
  }

  const overallRating =
    ratingsForOverall.length > 0
      ? Math.round((ratingsForOverall.reduce((a, b) => a + b, 0) / ratingsForOverall.length) * 100) / 100
      : null;

  const commentParts = ["improve", "liked", "obstacles", "expectations"]
    .map((id) => answers[id])
    .filter((v): v is string => typeof v === "string");
  const comment = commentParts.length ? commentParts.join("\n\n").slice(0, 5000) : null;

  return { answers, overallRating, comment, errors };
}

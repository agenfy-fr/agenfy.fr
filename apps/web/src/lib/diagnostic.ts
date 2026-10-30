// AI maturity self-assessment (lead magnet at /diagnostic-ia).
// Pure data + scoring so results are reproducible and unit-testable.

export type AxisId = "strategie" | "usages" | "donnees" | "outils" | "gouvernance" | "mesure";

export interface Axis {
  id: AxisId;
  label: string;
  /** Offer slug recommended when this axis is the weakest. */
  offerSlug: string;
  advice: string;
}

export interface Question {
  id: string;
  axis: AxisId;
  text: string;
  /** Exactly four options, scored 0 to 3 in order. */
  options: [string, string, string, string];
}

export const AXES: Axis[] = [
  {
    id: "strategie",
    label: "Stratégie",
    offerSlug: "audit-strategie-ia",
    advice: "Définissez 3 à 5 cas d'usage prioritaires, avec un responsable et un indicateur de gain pour chacun.",
  },
  {
    id: "usages",
    label: "Usages & compétences",
    offerSlug: "formation-ia",
    advice: "Formez les équipes sur leurs propres tâches et partagez une bibliothèque de prompts qui fonctionnent.",
  },
  {
    id: "donnees",
    label: "Données",
    offerSlug: "data",
    advice: "Identifiez les sources de vérité (documents, chiffres) dont vos futurs assistants IA auront besoin, et fiabilisez-les.",
  },
  {
    id: "outils",
    label: "Outils & intégration",
    offerSlug: "agents-ia",
    advice: "Connectez l'IA aux outils du quotidien (CRM, messagerie, drive) plutôt que de multiplier les copier-coller.",
  },
  {
    id: "gouvernance",
    label: "Sécurité & conformité",
    offerSlug: "audit-strategie-ia",
    advice: "Rédigez une charte d'usage de l'IA : données interdites, outils autorisés, vérification humaine, obligations RGPD et AI Act.",
  },
  {
    id: "mesure",
    label: "Mesure & passage à l'échelle",
    offerSlug: "developpement-ia",
    advice: "Mesurez le temps gagné et la qualité sur un premier cas, puis industrialisez ce qui fonctionne.",
  },
];

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    axis: "strategie",
    text: "La direction a-t-elle défini des objectifs pour l'IA ?",
    options: ["Non, pas encore", "C'est en discussion", "Oui, des objectifs généraux", "Oui, avec des cas d'usage priorisés et un budget"],
  },
  {
    id: "q2",
    axis: "strategie",
    text: "Qui porte les sujets IA dans l'entreprise ?",
    options: ["Personne en particulier", "Quelques volontaires", "Un référent identifié", "Un responsable avec du temps et un mandat clair"],
  },
  {
    id: "q3",
    axis: "usages",
    text: "Quelle part des collaborateurs utilise l'IA générative chaque semaine ?",
    options: ["Presque personne", "Moins d'un quart", "Entre un quart et la moitié", "Plus de la moitié"],
  },
  {
    id: "q4",
    axis: "usages",
    text: "Les équipes ont-elles été formées à l'IA générative ?",
    options: ["Non", "Quelques personnes, de leur propre initiative", "Une sensibilisation a eu lieu", "Oui, des formations pratiques adaptées aux métiers"],
  },
  {
    id: "q5",
    axis: "donnees",
    text: "Vos documents de référence (procédures, offres, contrats) sont-ils centralisés et à jour ?",
    options: ["Non, ils sont dispersés", "En partie", "Oui pour l'essentiel", "Oui, avec des responsables et des règles de mise à jour"],
  },
  {
    id: "q6",
    axis: "donnees",
    text: "Vos chiffres clés (ventes, clients, stocks) sont-ils fiables et accessibles ?",
    options: ["Non, ils diffèrent selon les outils", "Via des exports manuels", "Via un outil de reporting", "Oui, dans une base centralisée et documentée"],
  },
  {
    id: "q7",
    axis: "outils",
    text: "Quels outils d'IA sont mis à disposition des équipes ?",
    options: ["Aucun, chacun utilise ses comptes personnels", "Des outils gratuits tolérés", "Une offre entreprise pour certaines équipes", "Une offre entreprise déployée et administrée"],
  },
  {
    id: "q8",
    axis: "outils",
    text: "L'IA est-elle connectée à vos outils métier (CRM, messagerie, ERP) ?",
    options: ["Non", "Des tests isolés", "Une ou deux automatisations en place", "Plusieurs agents ou workflows en production"],
  },
  {
    id: "q9",
    axis: "gouvernance",
    text: "Existe-t-il des règles sur les données que l'on peut confier à une IA ?",
    options: ["Non", "Des consignes orales", "Une charte écrite", "Une charte connue de tous, appliquée et revue régulièrement"],
  },
  {
    id: "q10",
    axis: "gouvernance",
    text: "Avez-vous évalué vos obligations au titre du RGPD et de l'AI Act ?",
    options: ["Non", "Nous savons qu'il faut le faire", "Partiellement", "Oui, avec un responsable identifié"],
  },
  {
    id: "q11",
    axis: "mesure",
    text: "Mesurez-vous les gains apportés par l'IA ?",
    options: ["Non", "De manière informelle", "Sur certains projets", "Oui, avec des indicateurs suivis dans le temps"],
  },
  {
    id: "q12",
    axis: "mesure",
    text: "Combien de projets IA sont passés en production ?",
    options: ["Aucun", "Des prototypes seulement", "Un projet", "Plusieurs projets, utilisés au quotidien"],
  },
];

export const LEVELS = [
  { min: 0, id: 1, name: "Découverte", description: "L'IA est encore un sujet de curiosité. La priorité : former les équipes et fixer des règles d'usage simples." },
  { min: 25, id: 2, name: "Expérimentation", description: "Des usages individuels existent, sans cadre commun. La priorité : choisir des cas d'usage et des outils pour toute l'entreprise." },
  { min: 45, id: 3, name: "Structuration", description: "Les bases sont posées. La priorité : connecter l'IA à vos outils et mesurer les premiers gains." },
  { min: 65, id: 4, name: "Industrialisation", description: "L'IA produit des gains réels. La priorité : industrialiser, superviser et étendre aux autres métiers." },
  { min: 85, id: 5, name: "Transformation", description: "L'IA fait partie du fonctionnement de l'entreprise. La priorité : maintenir la qualité, les coûts et la conformité dans la durée." },
] as const;

export type Answers = Record<string, number>;

export interface DiagnosticResult {
  score: number;
  level: (typeof LEVELS)[number];
  axes: { axis: Axis; score: number }[];
  weakest: Axis[];
}

export function computeResult(answers: Answers): DiagnosticResult {
  const axes = AXES.map((axis) => {
    const qs = QUESTIONS.filter((q) => q.axis === axis.id);
    const points = qs.reduce((sum, q) => sum + clampAnswer(answers[q.id]), 0);
    return { axis, score: Math.round((points / (qs.length * 3)) * 100) };
  });
  const total = QUESTIONS.reduce((sum, q) => sum + clampAnswer(answers[q.id]), 0);
  const score = Math.round((total / (QUESTIONS.length * 3)) * 100);
  const level = [...LEVELS].reverse().find((l) => score >= l.min) ?? LEVELS[0];
  const weakest = [...axes]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2)
    .map((a) => a.axis);
  return { score, level, axes, weakest };
}

function clampAnswer(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) return 0;
  return Math.min(3, Math.max(0, Math.round(value)));
}

export function isComplete(answers: Answers): boolean {
  return QUESTIONS.every((q) => answers[q.id] !== undefined);
}

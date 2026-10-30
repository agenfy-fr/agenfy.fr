import type { FaqItem } from "@/components/schemas/JsonLd";

// Marketing description of the training catalogue (www.agenfy.fr/formations).
// The learning experience itself lives on app.agenfy.fr; `appSlug` is the course slug there
// (apps/app/content/courses), while `slug` stays a short SEO-friendly URL on the site.

export interface CourseModule {
  title: string;
  points: string[];
}

export interface Course {
  slug: string;
  appSlug: string;
  path: string;
  name: string;
  tagline: string;
  summary: string;
  audience: string;
  prerequisites: string;
  durationHours: number;
  durationLabel: string;
  modality: string;
  objectives: string[];
  modules: CourseModule[];
  evaluation: string[];
  faq: FaqItem[];
}

const COMMON_EVALUATION = [
  "Questionnaire de positionnement avant la formation",
  "Exercices pratiques et quiz de validation des acquis",
  "Questionnaire de satisfaction en fin de session, puis à froid",
  "Attestation de fin de formation",
];

export const COURSES: Course[] = [
  {
    slug: "ia-generative-essentiels",
    appSlug: "ia-generative-essentiels",
    path: "/formations/ia-generative-essentiels",
    name: "IA générative au travail : les essentiels",
    tagline: "Utiliser ChatGPT, Claude, Copilot et Mistral efficacement et en sécurité",
    summary:
      "Une journée pratique pour comprendre ce que l'IA générative sait faire et ne sait pas faire, rédiger des instructions (prompts) efficaces, choisir entre ChatGPT, Claude, Copilot et Mistral, et appliquer des règles de confidentialité conformes au RGPD et à l'AI Act, sur des cas issus du métier des participants.",
    audience: "Tous collaborateurs",
    prerequisites: "Aucun prérequis technique. Savoir utiliser un navigateur web.",
    durationHours: 7,
    durationLabel: "1 jour (7 h)",
    modality: "Présentiel ou distanciel, complété par des modules en ligne",
    objectives: [
      "Expliquer le fonctionnement et les limites d'un modèle de langage",
      "Rédiger des prompts structurés pour rédiger, synthétiser, analyser et reformuler",
      "Choisir l'outil adapté à une tâche et à un niveau de confidentialité",
      "Vérifier une réponse d'IA et repérer les erreurs (hallucinations)",
      "Appliquer les règles d'usage de l'entreprise : données, RGPD, AI Act",
    ],
    modules: [
      { title: "Comprendre l'IA générative", points: ["Ce qu'est un LLM", "Forces, limites, hallucinations", "Panorama des outils du marché"] },
      { title: "Bien formuler ses demandes", points: ["Structure d'un bon prompt", "Contexte, rôle, format, exemples", "Itérer et faire critiquer"] },
      { title: "ChatGPT, Claude, Copilot, Mistral", points: ["Points forts de chaque outil", "Intégration à Microsoft 365 et Google Workspace", "Choisir selon la tâche"] },
      { title: "Sécurité et conformité", points: ["Données à ne jamais partager", "RGPD et AI Act en pratique", "Règles d'usage en entreprise"] },
      { title: "Atelier métier", points: ["Cas d'usage des participants", "Bibliothèque de prompts", "Plan d'action individuel"] },
    ],
    evaluation: COMMON_EVALUATION,
    faq: [
      {
        question: "Faut-il un compte payant ChatGPT ou Claude pour suivre la formation ?",
        answer:
          "Non. Les exercices fonctionnent avec les versions gratuites. Si votre entreprise a déployé une offre entreprise (ChatGPT, Claude, Copilot), la formation s'appuie dessus.",
      },
      {
        question: "La formation peut-elle être adaptée à un métier précis ?",
        answer:
          "Oui. Le questionnaire de positionnement et l'atelier sont construits à partir des tâches réelles des participants (RH, finance, commerce, juridique, opérations).",
      },
    ],
  },
  {
    slug: "automatisation-agents-ia",
    appSlug: "automatiser-ia-agents-n8n-mcp",
    path: "/formations/automatisation-agents-ia",
    name: "Automatiser avec l'IA : agents, n8n et MCP",
    tagline: "Construire ses premiers agents IA et workflows automatisés",
    summary:
      "Une journée pour concevoir et construire des automatisations avec l'IA : workflows n8n ou Make qui utilisent un modèle de langage, agents IA capables d'agir dans vos outils, connexion de Claude à vos applications via le Model Context Protocol (MCP), avec les garde-fous indispensables en production.",
    audience: "Profils opérationnels, ops, product et tech",
    prerequisites: "À l'aise avec les outils numériques. Avoir suivi « les essentiels » ou un niveau équivalent. Pas besoin de savoir coder.",
    durationHours: 7,
    durationLabel: "1 jour (7 h)",
    modality: "Présentiel ou distanciel, complété par des modules en ligne",
    objectives: [
      "Identifier les processus automatisables et estimer le gain",
      "Construire un workflow n8n ou Make qui utilise un modèle de langage",
      "Concevoir un agent IA avec outils, instructions et limites d'action",
      "Connecter un assistant IA à des outils via le Model Context Protocol",
      "Mettre en place supervision, validation humaine et journalisation",
    ],
    modules: [
      { title: "Automatisation et IA", points: ["Automatisation classique vs agent IA", "Choisir le bon processus", "Mesurer le gain"] },
      { title: "Workflows avec n8n et Make", points: ["Déclencheurs, actions, données", "Appeler un modèle de langage", "Gestion des erreurs"] },
      { title: "Agents IA", points: ["Outils, mémoire, instructions", "Humain dans la boucle", "Limites et coûts"] },
      { title: "Model Context Protocol", points: ["Principe du MCP", "Connecter Claude à ses outils", "Sécurité des accès"] },
      { title: "Atelier", points: ["Construire un agent sur un cas réel", "Checklist de mise en production"] },
    ],
    evaluation: COMMON_EVALUATION,
    faq: [
      {
        question: "Faut-il savoir programmer ?",
        answer:
          "Non. n8n et Make sont des outils visuels. Quelques notions (JSON, API) sont introduites pendant la journée, sans écrire de code.",
      },
      {
        question: "Repart-on avec un agent fonctionnel ?",
        answer:
          "Oui : chaque participant construit un workflow ou un agent sur un cas de son quotidien, réutilisable après la formation.",
      },
    ],
  },
];

export const FORMATIONS_FAQ: FaqItem[] = [
  {
    question: "Les formations IA d'Agenfy sont-elles finançables par un OPCO ou le CPF ?",
    answer:
      "Pas encore : la certification Qualiopi d'Agenfy est en préparation et les formations ne sont pas éligibles au CPF. Elles sont aujourd'hui facturées directement à l'entreprise. Cette page sera mise à jour dès l'obtention de la certification.",
  },
  {
    question: "Quelle est la taille d'un groupe ?",
    answer:
      "Les sessions intra-entreprise sont conçues pour des groupes restreints, afin que chaque participant pratique sur ses propres cas. La taille exacte est fixée avec vous selon le format.",
  },
  {
    question: "Qu'est-ce que la plateforme app.agenfy.fr ?",
    answer:
      "C'est l'espace de formation en ligne d'Agenfy : modules courts, quiz, ressources et bibliothèque de prompts, accessibles avant et après les sessions en direct. Les managers y suivent la progression de leur équipe.",
  },
  {
    question: "Les formations sont-elles accessibles aux personnes en situation de handicap ?",
    answer:
      "Oui. Signalez-nous tout besoin d'adaptation lors de l'inscription : les modalités (supports, rythme, format) sont ajustées au cas par cas.",
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

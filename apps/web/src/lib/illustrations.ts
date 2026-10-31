// AI-generated editorial illustrations (ChatGPT guide + prompts: docs/IMAGES-IA.md).
// A slot renders only once its file exists in public/illustrations/
// (<name>.webp, .png, .jpg or .jpeg), so the site stays clean until then.

export type IllustrationName =
  | "hero"
  | "services"
  | "audit"
  | "agents"
  | "developpement"
  | "formation"
  | "fondations"
  | "diagnostic"
  | "methodologie"
  | "etudes-de-cas"
  | "blog"
  | "glossaire"
  | "comparatifs"
  | "a-propos"
  | "contact";

export interface IllustrationSpec {
  alt: string;
  width: number;
  height: number;
}

/** Native ChatGPT (gpt-image) landscape size: 1536 × 1024 (3:2). */
const LANDSCAPE = { width: 1536, height: 1024 } as const;

export const ILLUSTRATIONS: Record<IllustrationName, IllustrationSpec> = {
  hero: {
    alt: "Une personne travaille sur son ordinateur portable, entourée de tableaux de bord et d'agents IA",
    width: 1600,
    height: 900,
  },
  services: {
    alt: "Une professionnelle pilote plusieurs projets IA depuis son ordinateur, entourée de cartes d'interface",
    ...LANDSCAPE,
  },
  audit: {
    alt: "Atelier de cadrage IA : une équipe priorise des cas d'usage sur un tableau",
    ...LANDSCAPE,
  },
  agents: {
    alt: "Un agent IA relie les outils de l'entreprise et automatise un flux de travail",
    ...LANDSCAPE,
  },
  developpement: {
    alt: "Un développeur construit une application IA sur mesure",
    ...LANDSCAPE,
  },
  formation: {
    alt: "Des collaborateurs se forment à l'IA générative sur leurs ordinateurs",
    ...LANDSCAPE,
  },
  fondations: {
    alt: "Infrastructure data et cloud qui alimente les projets IA",
    ...LANDSCAPE,
  },
  diagnostic: {
    alt: "Un dirigeant évalue la maturité IA de son entreprise sur une tablette, avec une jauge de progression",
    ...LANDSCAPE,
  },
  methodologie: {
    alt: "Une équipe suit un projet IA étape par étape sur une feuille de route en cycles",
    ...LANDSCAPE,
  },
  "etudes-de-cas": {
    alt: "Une équipe analyse les résultats d'un projet IA sur des tableaux de bord",
    ...LANDSCAPE,
  },
  blog: {
    alt: "Une personne lit un article sur l'IA en entreprise, entourée de fiches et de graphiques",
    ...LANDSCAPE,
  },
  glossaire: {
    alt: "Des notions d'intelligence artificielle présentées comme des fiches lumineuses autour d'un ordinateur",
    ...LANDSCAPE,
  },
  comparatifs: {
    alt: "Une personne compare plusieurs assistants IA affichés côte à côte sur son écran",
    ...LANDSCAPE,
  },
  "a-propos": {
    alt: "Un atelier lumineux où un consultant travaille avec un client sur un projet IA",
    ...LANDSCAPE,
  },
  contact: {
    alt: "Une personne prépare un premier rendez-vous en visioconférence depuis son ordinateur portable",
    ...LANDSCAPE,
  },
};

/** Offer slug (lib/offers.ts) → illustration shown on its page. */
export const OFFER_ILLUSTRATION: Record<string, IllustrationName> = {
  "audit-strategie-ia": "audit",
  "agents-ia": "agents",
  "developpement-ia": "developpement",
  "formation-ia": "formation",
  data: "fondations",
  cloud: "fondations",
};

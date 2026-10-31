// AI-generated editorial illustrations (prompts: docs/IMAGES-IA.md).
// A slot renders only once its file exists in public/illustrations/
// (<name>.webp, .png, .jpg or .jpeg), so the site stays clean until then.

export type IllustrationName = "hero" | "audit" | "agents" | "developpement" | "formation" | "fondations";

export interface IllustrationSpec {
  alt: string;
  width: number;
  height: number;
}

export const ILLUSTRATIONS: Record<IllustrationName, IllustrationSpec> = {
  hero: {
    alt: "Une personne travaille sur son ordinateur portable, entourée de tableaux de bord et d'agents IA",
    width: 1600,
    height: 900,
  },
  audit: {
    alt: "Atelier de cadrage IA : une équipe priorise des cas d'usage sur un tableau",
    width: 1200,
    height: 800,
  },
  agents: {
    alt: "Un agent IA relie les outils de l'entreprise et automatise un flux de travail",
    width: 1200,
    height: 800,
  },
  developpement: {
    alt: "Un développeur construit une application IA sur mesure",
    width: 1200,
    height: 800,
  },
  formation: {
    alt: "Des collaborateurs se forment à l'IA générative sur leurs ordinateurs",
    width: 1200,
    height: 800,
  },
  fondations: {
    alt: "Infrastructure data et cloud qui alimente les projets IA",
    width: 1200,
    height: 800,
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

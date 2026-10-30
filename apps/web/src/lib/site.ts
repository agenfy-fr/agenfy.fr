// Single source of truth for brand facts reused by metadata, JSON-LD, llms.txt and UI.
// Only verifiable facts belong here: no invented figures, certifications or clients.

export const SITE = {
  name: "Agenfy",
  legalName: "Hasfy SAS",
  url: "https://www.agenfy.fr",
  consoleUrl: "https://console.agenfy.fr",
  appUrl: "https://app.agenfy.fr",
  email: "contact@agenfy.fr",
  locale: "fr_FR",
  city: "Paris",
  foundingDate: "2024",
  tagline: "Agence IA pour PME et ETI",
  description:
    "Agenfy est une agence IA française qui aide les PME et ETI à adopter l'intelligence artificielle : audit et stratégie IA, agents IA et automatisation, développement IA sur mesure (RAG, LLM) et formation des équipes, sur des fondations Data et Cloud solides.",
  sameAs: [
    "https://www.linkedin.com/company/agenfy-fr/",
    "https://x.com/Agenfy_",
    "https://github.com/agenfy-fr",
  ],
} as const;

export interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  sameAs: string[];
  knowsAbout: string[];
}

export const AUTHORS: Record<string, Author> = {
  "evan-masse": {
    slug: "evan-masse",
    name: "Evan Massé",
    role: "Fondateur d'Agenfy",
    bio: "Evan Massé a fondé Agenfy pour rendre l'IA opérationnelle dans les PME et ETI : il conçoit des agents IA, des architectures data et cloud, et forme les équipes à leur usage. Il signe les articles techniques du blog Agenfy.",
    photo: "/evan_masse.jpg",
    sameAs: [],
    knowsAbout: [
      "Intelligence artificielle générative",
      "Agents IA",
      "Model Context Protocol",
      "Data engineering",
      "Cloud computing",
    ],
  },
};

export const DEFAULT_AUTHOR = AUTHORS["evan-masse"];

export function absoluteUrl(path: string): string {
  if (path.startsWith("http")) return path;
  return `${SITE.url}${path === "/" ? "" : path}`;
}

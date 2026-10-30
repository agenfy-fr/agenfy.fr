import { blogPosts } from "@/lib/blog-posts";
import { OFFERS } from "@/lib/offers";
import { COURSES } from "@/lib/courses";
import { SITE, DEFAULT_AUTHOR } from "@/lib/site";
import { GLOSSARY, glossaryPath } from "@/lib/glossary";

// Generated from the same sources as the pages, so it can never drift from the site.
export const dynamic = "force-static";

export function GET() {
  const url = (path: string) => `${SITE.url}${path}`;
  const lines = [
    `# ${SITE.name}`,
    "",
    `> ${SITE.description}`,
    "",
    `${SITE.name} est une marque de ${SITE.legalName}, basée à ${SITE.city} (France), fondée par ${DEFAULT_AUTHOR.name}. Elle intervient dans toute la France auprès des PME et ETI.`,
    "",
    "## Expertises",
    "",
    ...OFFERS.map((o) => `- [${o.name}](${url(o.path)}): ${o.summary}`),
    "",
    "## Formations",
    "",
    ...COURSES.map((c) => `- [${c.name}](${url(c.path)}): ${c.durationLabel}, ${c.audience.toLowerCase()}. ${c.tagline}.`),
    `- Plateforme de formation en ligne : ${SITE.appUrl}`,
    "- Certification Qualiopi en préparation : formations non éligibles à ce jour au financement OPCO ou CPF.",
    "",
    "## Outils",
    "",
    `- [Diagnostic de maturité IA](${url("/diagnostic-ia")}): auto-évaluation gratuite en 12 questions, score sur 100 et priorités d'action.`,
    "",
    "## Guides et comparatifs",
    "",
    `- [Méthodologie Agenfy](${url("/methodologie")}): principes, cycle Former, Auditer, Prototyper, Industrialiser, Mesurer, règles de sécurité.`,
    `- [ChatGPT, Claude, Copilot ou Mistral en entreprise](${url("/comparatifs/chatgpt-claude-copilot-mistral-entreprise")}): comparatif des offres entreprise.`,
    `- [Agence IA, ESN, freelance ou interne](${url("/comparatifs/agence-ia-esn-freelance")}): quand choisir quoi.`,
    "",
    "## Glossaire IA",
    "",
    ...GLOSSARY.map((t) => `- [${t.term}](${url(glossaryPath(t.slug))})`),
    "",
    "## Articles",
    "",
    ...blogPosts.map((p) => `- [${p.title}](${url(`/blog/${p.slug}`)}): ${p.excerpt}`),
    "",
    "## Contact",
    "",
    `- Prendre rendez-vous : ${url("/contact")}`,
    `- Email : ${SITE.email}`,
    `- Espace client : ${SITE.consoleUrl}`,
    ...SITE.sameAs.map((s) => `- ${s}`),
    "",
  ];
  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

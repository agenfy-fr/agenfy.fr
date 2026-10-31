import {
  Header,
  Hero,
  Trust,
  Problem,
  Benefits,
  Expertise,
  Process,
  FormationsTeaser,
  Insights,
  FAQ,
  CTA,
  Newsletter,
  Footer,
} from "@/components/sections";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { getAllBlogSummaries } from "@/lib/blog";

// "Nos derniers articles" includes articles published from the console.
export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: SITE.url, types: { "text/plain": `${SITE.url}/llms.txt` } },
};

// Buying-intent questions answered directly, so answer engines can quote them.
const faq = [
  {
    question: "Qu'est-ce qu'une agence IA ?",
    answer:
      "Une agence IA aide les entreprises à utiliser l'intelligence artificielle : identifier les cas d'usage, former les équipes, déployer des outils comme ChatGPT, Claude ou Copilot, et développer des agents IA ou des applications sur mesure connectés aux outils de l'entreprise.",
  },
  {
    question: "Que fait Agenfy concrètement ?",
    answer: SITE.description,
  },
  {
    question: "Par où commencer avec l'IA quand on est une PME ?",
    answer:
      "Par les usages et les règles : former les équipes sur leurs propres tâches, choisir un outil d'IA générative adapté à la confidentialité de vos données, puis identifier 3 à 5 cas d'usage mesurables. Le diagnostic IA gratuit d'Agenfy donne une première photographie en 5 minutes.",
  },
  {
    question: "Combien coûte un projet IA ?",
    answer:
      "Cela dépend du point de départ : une formation d'une journée, un audit de quelques semaines ou un agent IA en production n'ont pas le même budget. Agenfy communique une fourchette après un premier échange de 30 minutes, gratuit et sans engagement.",
  },
  {
    question: "Nos données sont-elles en sécurité avec l'IA ?",
    answer:
      "Elles peuvent l'être si l'architecture est choisie en conséquence : offres entreprise sans réutilisation des données pour l'entraînement, hébergement européen, modèles hébergés en France ou en interne pour les données les plus sensibles, et règles d'usage claires pour les équipes.",
  },
];

export default async function Home() {
  const latestPosts = (await getAllBlogSummaries())
    .slice(0, 3)
    .map(({ slug, title, excerpt, category, readTime }) => ({ slug, title, excerpt, category, readTime }));
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Trust />
        <Problem />
        <Expertise />
        <Process />
        <FormationsTeaser />
        <Benefits />
        <Insights posts={latestPosts} />
        <FAQ items={faq} />
        <CTA />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}

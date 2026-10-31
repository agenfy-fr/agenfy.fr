import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { buildMetadata } from "@/lib/seo";
import { Illustration } from "@/components/effects/Illustration";

export const metadata = buildMetadata({
  title: "Comparatifs IA pour les entreprises",
  description:
    "Des comparatifs indépendants pour choisir vos outils et vos partenaires IA : assistants IA en entreprise, agence IA, ESN, freelance ou équipe interne.",
  path: "/comparatifs",
});

const COMPARISONS = [
  {
    path: "/comparatifs/chatgpt-claude-copilot-mistral-entreprise",
    title: "ChatGPT, Claude, Copilot ou Mistral en entreprise",
    text: "Offres entreprise, intégrations, hébergement des données, points forts et limites : quel assistant IA pour quel profil.",
  },
  {
    path: "/comparatifs/agence-ia-esn-freelance",
    title: "Agence IA, ESN, freelance ou équipe interne",
    text: "Les critères pour choisir qui mènera votre projet d'IA, et les cas où une agence n'est pas la bonne réponse.",
  },
];

export default function ComparatifsPage() {
  return (
    <PageLayout>
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ name: "Comparatifs", path: "/comparatifs" }]} />
          <Reveal>
            <h1 className="text-hero font-bold mb-6">
              <span className="gradient-text">Comparatifs</span> IA
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Des comparatifs indépendants, sourcés et datés, pour prendre vos décisions sur l&apos;IA en connaissance
              de cause. Agenfy n&apos;est revendeur d&apos;aucun des outils cités.
            </p>
          </Reveal>
          <Illustration name="comparatifs" priority className="mt-14" />
        </div>
      </section>
      <section className="pb-20">
        <ul className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-6">
          {COMPARISONS.map((c) => (
            <li key={c.path}>
              <Link
                href={c.path}
                className="group block h-full rounded-2xl border border-border/60 bg-card/50 p-6 hover:border-primary/40 transition-colors"
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                  {c.title}
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" aria-hidden />
                </h2>
                <p className="text-muted-foreground">{c.text}</p>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </PageLayout>
  );
}

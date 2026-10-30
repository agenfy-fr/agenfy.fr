import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { JsonLd } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import {
  GLOSSARY_UPDATED,
  definedTermSetSchema,
  glossaryLetter,
  glossaryPath,
  sortedGlossary,
} from "@/lib/glossary";
import { formatDateFr } from "@/lib/dates";

export const metadata = buildMetadata({
  title: "Glossaire de l'IA en entreprise : définitions claires",
  description:
    "LLM, RAG, agent IA, MCP, embedding, AI Act, shadow AI… Les notions clés de l'intelligence artificielle expliquées simplement, avec un exemple concret en entreprise.",
  path: "/glossaire",
  keywords: ["glossaire IA", "définition IA", "vocabulaire intelligence artificielle", "RAG définition", "agent IA définition"],
});

export default function GlossaryIndexPage() {
  const terms = sortedGlossary();
  const groups = new Map<string, typeof terms>();
  for (const t of terms) {
    const letter = glossaryLetter(t);
    groups.set(letter, [...(groups.get(letter) ?? []), t]);
  }
  const letters = [...groups.keys()];

  return (
    <PageLayout>
      <JsonLd data={definedTermSetSchema()} />
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ name: "Glossaire IA", path: "/glossaire" }]} />
          <Reveal>
            <h1 className="text-hero font-bold mb-6">
              Glossaire de l&apos;<span className="gradient-text">IA en entreprise</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {terms.length} notions indispensables pour comprendre, choisir et piloter un projet d&apos;intelligence
              artificielle : une définition directe, pourquoi c&apos;est important en entreprise, un exemple concret et
              les confusions à éviter.
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              Mis à jour le <time dateTime={GLOSSARY_UPDATED}>{formatDateFr(GLOSSARY_UPDATED)}</time>
            </p>
          </Reveal>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <nav aria-label="Index alphabétique" className="flex flex-wrap gap-2 mb-12">
            {letters.map((letter) => (
              <a
                key={letter}
                href={`#lettre-${letter}`}
                className="w-10 h-10 rounded-lg border border-border/60 flex items-center justify-center font-semibold hover:border-primary/50 hover:text-primary transition-colors"
              >
                {letter}
              </a>
            ))}
          </nav>

          <div className="space-y-12">
            {letters.map((letter) => (
              <section key={letter} id={`lettre-${letter}`} aria-labelledby={`titre-${letter}`} className="scroll-mt-28">
                <h2 id={`titre-${letter}`} className="text-h2 font-bold gradient-text mb-6">
                  {letter}
                </h2>
                <ul className="grid md:grid-cols-2 gap-4">
                  {groups.get(letter)!.map((t) => (
                    <li key={t.slug}>
                      <Link
                        href={glossaryPath(t.slug)}
                        className="group block h-full rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/40 transition-colors"
                      >
                        <p className="font-semibold text-foreground flex items-center gap-2 mb-2">
                          {t.term}
                          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-3">{t.definition}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getOffer } from "@/lib/offers";
import { getBlogPostBySlug } from "@/lib/blog-posts";
import { GLOSSARY, GLOSSARY_UPDATED, definedTermSchema, getGlossaryTerm, glossaryPath } from "@/lib/glossary";
import { formatDateFr } from "@/lib/dates";

export const dynamicParams = false;

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) return { title: "Terme introuvable" };
  return buildMetadata({
    title: `${term.term} : définition et exemple en entreprise`,
    description: term.definition.length > 160 ? `${term.definition.slice(0, 157).trimEnd()}…` : term.definition,
    path: glossaryPath(term.slug),
    keywords: [term.term, ...(term.alternateNames ?? []), `${term.term} définition`],
  });
}

export default async function GlossaryTermPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const term = getGlossaryTerm(slug);
  if (!term) notFound();

  const offer = getOffer(term.offer);
  const related = term.related.map(getGlossaryTerm).filter((t) => t !== undefined);
  const articles = (term.articles ?? []).map(getBlogPostBySlug).filter((p) => p !== undefined);

  return (
    <PageLayout>
      <JsonLd data={definedTermSchema(term)} />
      <section className="py-20 lg:py-24 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { name: "Glossaire IA", path: "/glossaire" },
              { name: term.term, path: glossaryPath(term.slug) },
            ]}
          />
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Définition</p>
            <h1 className="text-h1 font-bold mb-6">{term.term}</h1>
            {term.alternateNames?.length ? (
              <p className="text-sm text-muted-foreground mb-6">
                Aussi appelé : {term.alternateNames.join(", ")}
              </p>
            ) : null}
            {/* Direct answer block: the paragraph answer engines should quote. */}
            <p className="text-lg text-foreground/90 leading-relaxed border-l-4 border-primary pl-5">{term.definition}</p>
          </Reveal>
        </div>
      </section>

      <article className="pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-12">
          <section>
            <h2 className="text-h2 font-bold mb-4">Pourquoi c&apos;est important en entreprise</h2>
            <p className="text-muted-foreground leading-relaxed">{term.whyItMatters}</p>
          </section>

          <section>
            <h2 className="text-h2 font-bold mb-4">Exemple concret</h2>
            <p className="text-muted-foreground leading-relaxed rounded-xl bg-secondary/30 border border-border/50 p-5">
              {term.example}
            </p>
          </section>

          <section>
            <h2 className="text-h2 font-bold mb-4">À ne pas confondre avec</h2>
            <dl className="space-y-4">
              {term.notToConfuse.map((item) => (
                <div key={item.term}>
                  <dt className="font-semibold text-foreground">{item.term}</dt>
                  <dd className="text-muted-foreground leading-relaxed mt-1">{item.explanation}</dd>
                </div>
              ))}
            </dl>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-h2 font-bold mb-4">Termes liés</h2>
              <ul className="flex flex-wrap gap-2">
                {related.map((r) => (
                  <li key={r.slug}>
                    <Link
                      href={glossaryPath(r.slug)}
                      className="inline-block rounded-full border border-border/60 px-4 py-1.5 text-sm hover:border-primary/50 hover:text-primary transition-colors"
                    >
                      {r.term}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {articles.length > 0 && (
            <section>
              <h2 className="text-h2 font-bold mb-4">Pour approfondir</h2>
              <ul className="space-y-2">
                {articles.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/blog/${a.slug}`} className="inline-flex items-center gap-2 text-primary hover:underline">
                      <BookOpen className="w-4 h-4" aria-hidden />
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">Notre accompagnement</p>
            <h2 className="text-xl font-bold mb-2">{offer.name}</h2>
            <p className="text-muted-foreground mb-5">{offer.tagline}</p>
            <Button asChild className="rounded-full gradient-btn border-0">
              <Link href={offer.path}>
                Découvrir l&apos;offre
                <ArrowRight className="ml-2 w-4 h-4" aria-hidden />
              </Link>
            </Button>
          </section>

          <p className="text-sm text-muted-foreground">
            Définition mise à jour le <time dateTime={GLOSSARY_UPDATED}>{formatDateFr(GLOSSARY_UPDATED)}</time>.{" "}
            <Link href="/glossaire" className="text-primary hover:underline">
              Voir tout le glossaire
            </Link>
          </p>
        </div>
      </article>
    </PageLayout>
  );
}

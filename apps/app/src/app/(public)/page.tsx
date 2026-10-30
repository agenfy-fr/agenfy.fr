import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MonitorPlay, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getPublishedCourses } from "@/lib/catalogue";
import { CATEGORY_LABELS, LEVEL_LABELS, MODALITY_LABELS, formatHours, formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: "Catalogue des formations IA | Agenfy Formation" },
  description:
    "Formations Agenfy à l'IA générative, au prompting, aux agents IA et à l'automatisation (n8n, Make, MCP). Programmes, objectifs, prérequis et modalités.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export default async function CataloguePage() {
  const courses = await getPublishedCourses();

  return (
    <>
      <section className="border-b border-border/60 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">Agenfy Formation</p>
          <h1 className="text-hero font-bold max-w-3xl">
            Former vos équipes à <span className="gradient-text">l&apos;IA qui sert vraiment</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            Des formations concrètes, des usages essentiels de l&apos;IA générative jusqu&apos;à
            l&apos;automatisation avec des agents, n8n et MCP. Chaque parcours combine sessions animées,
            contenus en ligne, quiz et suivi de votre progression.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full gradient-btn border-0 text-white">
              <a href="#catalogue">
                Voir les formations <ArrowRight />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/login">Accéder à mon espace</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="catalogue" className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-h2 font-bold mb-8">Catalogue</h2>
        {courses.length === 0 ? (
          <p className="text-muted-foreground">
            Le catalogue est en cours de publication. Pour un besoin de formation, écrivez-nous à{" "}
            <a className="text-primary underline" href="mailto:contact@agenfy.fr">
              contact@agenfy.fr
            </a>
            .
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {courses.map((c) => (
              <Link
                key={c.id}
                href={`/catalogue/${c.slug}`}
                className="group flex flex-col rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus-visible:ring-[3px] focus-visible:ring-ring/50 outline-none"
              >
                <div className="mb-4 flex flex-wrap gap-2">
                  <Badge>{CATEGORY_LABELS[c.category]}</Badge>
                  <Badge variant="outline">{LEVEL_LABELS[c.level]}</Badge>
                </div>
                <h3 className="text-h3 font-semibold group-hover:text-primary">{c.title}</h3>
                {c.subtitle && <p className="mt-2 text-muted-foreground">{c.subtitle}</p>}
                <dl className="mt-6 grid grid-cols-1 gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Clock className="size-4" aria-hidden />
                    <dt className="sr-only">Durée</dt>
                    <dd>{c.duration_label ?? formatHours(c.duration_hours)}</dd>
                  </div>
                  <div className="flex items-center gap-2">
                    <MonitorPlay className="size-4" aria-hidden />
                    <dt className="sr-only">Modalité</dt>
                    <dd>{MODALITY_LABELS[c.modality]}</dd>
                  </div>
                  {c.max_group_size && (
                    <div className="flex items-center gap-2">
                      <Users className="size-4" aria-hidden />
                      <dt className="sr-only">Groupe</dt>
                      <dd>Jusqu&apos;à {c.max_group_size} pers.</dd>
                    </div>
                  )}
                </dl>
                <p className="mt-4 text-sm font-medium">{formatPrice(c.price_ht_cents, c.price_label)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

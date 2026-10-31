import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, XCircle } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { JsonLd, articleSchema, type FaqItem } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { formatDateFr } from "@/lib/dates";
import { Illustration } from "@/components/effects/Illustration";

const PATH = "/comparatifs/agence-ia-esn-freelance";
const PUBLISHED = "2026-10-29";
const UPDATED = "2026-10-29";
const TITLE = "Agence IA, ESN, freelance ou équipe interne : qui choisir pour votre projet d'IA ?";
const DESCRIPTION =
  "Agence IA spécialisée, ESN, freelance ou compétences internes : les critères pour choisir, les situations où chaque option est la meilleure, et quand une agence comme Agenfy n'est pas le bon choix.";

export const metadata = buildMetadata({
  title: "Agence IA, ESN, freelance ou interne : comment choisir ?",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: PUBLISHED,
  modifiedTime: UPDATED,
  authors: [DEFAULT_AUTHOR.name],
  keywords: ["agence IA", "ESN IA", "freelance IA", "choisir prestataire IA", "internaliser l'IA"],
});

const OPTIONS = ["Agence IA spécialisée", "ESN", "Freelance", "Équipe interne"] as const;

const CRITERIA: { label: string; values: [string, string, string, string] }[] = [
  {
    label: "Spécialisation IA",
    values: [
      "Cœur de métier : cas d'usage, architecture, évaluation, adoption.",
      "Variable selon l'ESN et les consultants affectés ; souvent une practice IA parmi d'autres.",
      "Souvent pointue, mais sur un périmètre précis (un outil, une techno).",
      "À construire ou à faire monter en compétence.",
    ],
  },
  {
    label: "Capacité à absorber un gros volume",
    values: [
      "Limitée par la taille de l'équipe.",
      "Forte : capacité à staffer plusieurs profils sur la durée.",
      "Une personne, donc capacité limitée.",
      "Dépend des recrutements possibles.",
    ],
  },
  {
    label: "Couverture de bout en bout",
    values: [
      "Du conseil à la mise en production, formation incluse, sur un périmètre IA.",
      "Large, y compris l'infogérance et la maintenance applicative.",
      "Généralement une partie du projet.",
      "Totale en théorie, si toutes les compétences existent.",
    ],
  },
  {
    label: "Démarrage",
    values: [
      "Rapide, sur un périmètre cadré.",
      "Plus lent : processus d'achat, référencement, staffing.",
      "Très rapide si la personne est disponible.",
      "Lent si l'on doit recruter.",
    ],
  },
  {
    label: "Risque de dépendance",
    values: [
      "Modéré si le transfert de compétences est prévu au contrat.",
      "Élevé sur les projets longs ou en régie.",
      "Élevé : la connaissance repose sur une seule personne.",
      "Faible : la compétence reste chez vous.",
    ],
  },
  {
    label: "Transfert de compétences",
    values: [
      "Généralement intégré à la démarche (formation, documentation).",
      "Possible, rarement prioritaire.",
      "Dépend de la personne.",
      "Natif.",
    ],
  },
  {
    label: "Modèle de coût",
    values: [
      "Forfait ou régie sur un périmètre défini.",
      "Régie ou forfait, souvent sur des volumes importants.",
      "Taux journalier, souvent le plus bas à court terme.",
      "Salaires et coûts fixes, rentables si le besoin est durable.",
    ],
  },
];

const WHEN: { option: string; cases: string[] }[] = [
  {
    option: "une agence IA spécialisée",
    cases: [
      "Vous démarrez et devez choisir les bons cas d'usage avant d'investir.",
      "Vous voulez un premier projet en production rapidement, avec une méthode d'évaluation.",
      "Vous voulez faire monter vos équipes en compétence en même temps.",
    ],
  },
  {
    option: "une ESN",
    cases: [
      "Le projet mobilise de nombreux profils sur plusieurs années.",
      "Vous avez besoin d'infogérance, de maintenance ou d'un support étendu.",
      "Vos achats imposent un fournisseur déjà référencé.",
    ],
  },
  {
    option: "un freelance",
    cases: [
      "Le besoin est précis, technique et bien spécifié (un connecteur, un workflow n8n, un tableau de bord).",
      "Vous avez en interne quelqu'un capable de piloter et de reprendre le travail.",
      "Le budget est serré et le périmètre limité.",
    ],
  },
  {
    option: "une équipe interne",
    cases: [
      "L'IA devient un avantage concurrentiel central de votre activité.",
      "Vous avez un flux de projets continu qui justifie des postes permanents.",
      "Vous disposez déjà de profils data ou développement à faire évoluer.",
    ],
  },
];

const NOT_AGENFY = [
  "Vous cherchez à staffer des dizaines de consultants sur un programme pluriannuel : une ESN est mieux dimensionnée.",
  "Vous avez besoin d'une infogérance ou d'un support d'astreinte à grande échelle.",
  "Votre besoin est une petite tâche technique parfaitement spécifiée : un freelance sera plus économique.",
  "Un logiciel du marché couvre déjà votre besoin sans adaptation : achetez-le, pas besoin d'un projet sur mesure.",
  "Vous exigez des années de références clients dans votre secteur : Agenfy est une structure récente.",
  "Vous avez déjà une équipe data et IA expérimentée : elle n'a sans doute besoin que d'un appui ponctuel.",
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Quelle différence entre une agence IA et une ESN ?",
    answer:
      "Une ESN couvre un large éventail de services informatiques et met souvent des consultants à disposition sur la durée. Une agence IA se concentre sur l'intelligence artificielle : choix des cas d'usage, conception, mise en production, évaluation et adoption, généralement sur des périmètres plus courts et cadrés.",
  },
  {
    question: "Peut-on combiner plusieurs options ?",
    answer:
      "Oui, et c'est fréquent. Par exemple : une agence pour l'audit, le premier projet et la formation, puis une équipe interne qui reprend et fait évoluer les solutions, avec un appui ponctuel de freelances sur des sujets précis.",
  },
  {
    question: "Faut-il recruter un responsable IA en interne ?",
    answer:
      "Cela devient pertinent quand l'IA concerne plusieurs projets et métiers. Avant ce stade, un premier projet accompagné permet de mieux définir le poste et les compétences dont vous avez réellement besoin.",
  },
  {
    question: "Comment éviter la dépendance à un prestataire ?",
    answer:
      "Exigez au contrat la propriété du code, des prompts et des jeux d'évaluation, une documentation à jour, des comptes et des abonnements à votre nom, et un temps dédié au transfert de compétences.",
  },
  {
    question: "Quelles questions poser à un prestataire IA ?",
    answer:
      "Comment allez-vous mesurer la qualité ? Où seront traitées nos données ? Qui sera concrètement sur le projet ? Que se passe-t-il si le prototype ne donne pas de bons résultats ? Que nous restera-t-il à la fin de la mission ?",
  },
];

export default function ComparatifPrestatairesPage() {
  return (
    <PageLayout>
      <JsonLd
        data={articleSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: PATH,
          datePublished: PUBLISHED,
          dateModified: UPDATED,
          author: DEFAULT_AUTHOR,
          section: "Comparatifs",
        })}
      />
      <section className="py-20 lg:py-24 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { name: "Comparatifs", path: "/comparatifs" },
              { name: "Agence IA, ESN, freelance ou interne", path: PATH },
            ]}
          />
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Comparatif</p>
            <h1 className="text-h1 font-bold mb-6">{TITLE}</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <CalendarCheck className="w-4 h-4" aria-hidden />
              Mis à jour le <time dateTime={UPDATED}>{formatDateFr(UPDATED)}</time> · par{" "}
              <Link href={`/auteurs/${DEFAULT_AUTHOR.slug}`} className="text-primary hover:underline" rel="author">
                {DEFAULT_AUTHOR.name}
              </Link>
            </p>
            {/* Direct answer block: the paragraph answer engines should quote. */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-3">En résumé</h2>
              <p className="text-foreground/90 leading-relaxed">
                Une <strong>agence IA</strong> convient pour démarrer : choisir les bons cas d&apos;usage, livrer un
                premier projet en production et former les équipes. Une <strong>ESN</strong> s&apos;impose pour les
                programmes à fort volume et l&apos;infogérance. Un <strong>freelance</strong> est idéal pour une tâche
                précise que vous savez piloter. Une <strong>équipe interne</strong> se justifie quand l&apos;IA devient
                un flux continu de projets stratégiques.
              </p>
            </div>
          </Reveal>
          <Illustration name="comparatifs" priority className="mt-12" />
        </div>
      </section>

      <section className="py-12" aria-labelledby="criteres">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 id="criteres" className="text-h2 font-bold mb-6">Les critères de comparaison</h2>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[52rem] text-sm">
              <caption className="sr-only">Comparaison agence IA, ESN, freelance et équipe interne</caption>
              <thead className="bg-secondary/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold w-44">
                    Critère
                  </th>
                  {OPTIONS.map((o) => (
                    <th key={o} scope="col" className="px-4 py-3 text-left font-semibold text-foreground">
                      {o}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {CRITERIA.map((c) => (
                  <tr key={c.label}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground align-top">
                      {c.label}
                    </th>
                    {c.values.map((v, i) => (
                      <td key={OPTIONS[i]} className="px-4 py-3 text-muted-foreground leading-relaxed align-top">
                        {v}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Tendances générales : la qualité d&apos;un prestataire dépend avant tout des personnes qui interviennent
            concrètement sur votre projet.
          </p>
        </div>
      </section>

      <section className="py-16 bg-secondary/20" aria-labelledby="quand">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 id="quand" className="text-h2 font-bold mb-8">Quand choisir quoi</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {WHEN.map((w) => (
              <Card key={w.option} className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Choisissez {w.option} si…</h3>
                  <ul className="space-y-2.5">
                    {w.cases.map((c) => (
                      <li key={c} className="flex gap-3 text-sm text-muted-foreground leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" aria-hidden />
                        {c}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" aria-labelledby="pas-agenfy">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 id="pas-agenfy" className="text-h2 font-bold mb-4">Quand Agenfy n&apos;est pas le bon choix</h2>
          <p className="text-muted-foreground mb-6">
            Nous préférons vous le dire dès le départ. Agenfy n&apos;est probablement pas le bon interlocuteur si :
          </p>
          <ul className="space-y-3">
            {NOT_AGENFY.map((item) => (
              <li key={item} className="flex gap-3 text-muted-foreground leading-relaxed">
                <XCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-8 text-muted-foreground leading-relaxed">
            En revanche, si vous voulez démarrer de façon structurée, obtenir un premier résultat mesurable et que vos
            équipes restent autonomes ensuite, découvrez{" "}
            <Link href="/methodologie" className="text-primary hover:underline">
              notre méthodologie
            </Link>
            .
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/services/audit-strategie-ia">
                Commencer par un audit IA
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/contact">Poser une question</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="bg-secondary/20">
        <FAQ items={FAQ_ITEMS} />
      </div>
    </PageLayout>
  );
}

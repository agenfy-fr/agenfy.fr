import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header, Footer, FAQ, CTA } from "@/components/sections";
import { BackgroundBeams, Reveal, SpotlightCard } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { IA_OFFERS, FOUNDATION_OFFERS, type Offer } from "@/lib/offers";
import { Illustration } from "@/components/effects/Illustration";

export const metadata = buildMetadata({
  title: "Expertises IA : audit, agents IA, développement, formation",
  description:
    "Les expertises d'Agenfy : audit et stratégie IA, agents IA et automatisation, développement IA sur mesure (RAG, LLM), formation IA, et les fondations Data et Cloud qui les rendent fiables.",
  path: "/services",
});

const faq = [
  {
    question: "Par quoi commencer un projet IA en PME ?",
    answer:
      "Par les usages : former les équipes aux outils d'IA générative et identifier les tâches où elles gagnent du temps. Un audit IA permet ensuite de prioriser les projets plus ambitieux (agents, assistants sur vos documents) selon leur valeur et leur faisabilité.",
  },
  {
    question: "Agenfy travaille-t-elle uniquement avec des PME ?",
    answer:
      "Agenfy s'adresse principalement aux PME et ETI, et intervient aussi pour des équipes de grands groupes qui cherchent un partenaire réactif sur un périmètre précis.",
  },
  {
    question: "Où intervient Agenfy ?",
    answer:
      "Agenfy est basée à Paris et intervient dans toute la France, sur site ou à distance.",
  },
];

function OfferGrid({ offers }: { offers: Offer[] }) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {offers.map((offer, i) => (
        <Reveal key={offer.slug} delay={i * 0.08}>
          <SpotlightCard className="h-full">
            <Link href={offer.path} className="flex h-full flex-col p-8">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-5">
                <offer.icon className="w-6 h-6 text-white" aria-hidden />
              </div>
              <h3 className="text-h3 font-bold text-foreground mb-1">{offer.name}</h3>
              <p className="text-primary text-sm mb-4">{offer.tagline}</p>
              <ul className="text-sm text-muted-foreground space-y-1.5 mb-6 flex-1">
                {offer.deliverables.slice(0, 3).map((d) => (
                  <li key={d}>• {d}</li>
                ))}
              </ul>
              <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                Découvrir l&apos;offre <ArrowRight className="w-4 h-4" aria-hidden />
              </span>
            </Link>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Breadcrumbs crumbs={[{ name: "Services", path: "/services" }]} />
            <Reveal className="max-w-3xl">
              <h1 className="text-hero font-bold mb-6">
                <span className="text-foreground">Nos expertises </span>
                <span className="gradient-text">IA</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Agenfy accompagne les PME et ETI de la première formation à l&apos;agent IA en production :
                quatre expertises IA, appuyées sur des fondations Data et Cloud.
              </p>
            </Reveal>
            <Illustration name="services" priority className="mt-14 max-w-5xl" />
          </div>
        </section>

        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-8">Intelligence artificielle</h2>
            <OfferGrid offers={IA_OFFERS} />
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-2">Fondations Data & Cloud</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl">
              Un assistant IA ne répond juste que sur des données fiables, hébergées dans un environnement maîtrisé.
            </p>
            <OfferGrid offers={FOUNDATION_OFFERS} />
          </div>
        </section>

        <FAQ items={faq} />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Header, Footer, FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { JsonLd, serviceSchema } from "@/components/schemas/JsonLd";
import { getOffer, type Offer } from "@/lib/offers";
import { Illustration } from "@/components/effects/Illustration";
import { OFFER_ILLUSTRATION } from "@/lib/illustrations";

export function OfferPage({ offer, children }: { offer: Offer; children?: React.ReactNode }) {
  const Icon = offer.icon;
  const related = offer.related.map(getOffer);
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={serviceSchema({
          name: offer.name,
          description: offer.summary,
          path: offer.path,
          serviceType: offer.name,
        })}
      />
      <Header />
      <main className="pt-20">
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
            <Breadcrumbs
              crumbs={
                offer.path.startsWith("/services/")
                  ? [
                      { name: "Services", path: "/services" },
                      { name: offer.name, path: offer.path },
                    ]
                  : [{ name: offer.name, path: offer.path }]
              }
            />
            <Reveal>
              <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-hero font-bold mb-4">
                <span className="gradient-text">{offer.name}</span>
              </h1>
              <p className="text-xl text-foreground/90 mb-6">{offer.tagline}</p>
              {/* Direct answer block: the paragraph answer engines should quote. */}
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">{offer.summary}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
                  <Link href={`/contact?service=${offer.slug}`}>
                    Parler de votre projet
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <Link href="/diagnostic-ia">Faire le diagnostic IA gratuit</Link>
                </Button>
              </div>
            </Reveal>
            {OFFER_ILLUSTRATION[offer.slug] && (
              <Illustration name={OFFER_ILLUSTRATION[offer.slug]} priority className="mt-14" />
            )}
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10">
            <Reveal>
              <h2 className="text-h2 font-bold mb-6">Pour qui ?</h2>
              <ul className="space-y-3">
                {offer.forWho.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-h2 font-bold mb-6">Ce que vous obtenez</h2>
              <ul className="space-y-3">
                {offer.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <Reveal>
              <h2 className="text-h1 font-bold mb-10 text-center">Comment ça se déroule</h2>
            </Reveal>
            <ol className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {offer.steps.map((step, i) => (
                <Reveal key={step.title} delay={i * 0.08}>
                  <li className="h-full list-none">
                    <Card className="h-full bg-card/50 border-border/50">
                      <CardContent className="p-6">
                        <p className="text-sm font-semibold text-primary mb-2">Étape {i + 1}</p>
                        <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                        {step.duration && (
                          <p className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                            <Clock className="w-3.5 h-3.5" aria-hidden />
                            {step.duration}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </CardContent>
                    </Card>
                  </li>
                </Reveal>
              ))}
            </ol>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Durées indicatives, ajustées au périmètre lors du cadrage.
              {offer.pricing ? ` Tarif : ${offer.pricing}.` : " Tarif sur devis, communiqué après un premier échange de 30 minutes."}
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10">
            <Reveal>
              <h2 className="text-h2 font-bold mb-6">Quand c&apos;est le bon choix</h2>
              <ul className="space-y-3">
                {offer.whenToUse.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="text-h2 font-bold mb-6">Quand ce n&apos;est pas le bon choix</h2>
              <ul className="space-y-3">
                {offer.whenNotToUse.map((item) => (
                  <li key={item} className="flex gap-3 text-muted-foreground">
                    <XCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        {children}

        <section className="py-12">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Outils et technologies
            </h2>
            <div className="flex flex-wrap justify-center gap-2">
              {offer.technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="rounded-full px-4 py-1.5">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        <FAQ items={offer.faq} />

        <section className="py-16 border-t border-border/40">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-6">Offres complémentaires</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={r.path}
                  className="group rounded-xl border border-border/60 p-5 hover:border-primary/40 transition-colors"
                >
                  <p className="font-semibold text-foreground flex items-center gap-2">
                    {r.name}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{r.tagline}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

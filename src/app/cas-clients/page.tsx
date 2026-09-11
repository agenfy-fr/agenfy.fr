import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Cas Clients",
  description: "Nos réalisations en Data, IA et Cloud. Résultats concrets et méthodologie sur des cas types.",
  alternates: {
    canonical: "https://www.agenfy.fr/cas-clients",
  },
  openGraph: {
    title: "Cas Clients | Agenfy",
    description: "Résultats concrets en Data, IA et Cloud.",
    url: "https://www.agenfy.fr/cas-clients",
    type: "website",
  },
};

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Cas clients
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Des résultats </span>
              <span className="gradient-text">concrets</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nous avons accompagné des entreprises comme la vôtre 
              dans leur transformation technologique.
            </p>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
            {caseStudies.map((study) => (
              <Card key={study.id} className="bg-card/50 border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-8 lg:p-12">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="rounded-full">{study.industry}</Badge>
                        {study.caseType === "example" && (
                          <Badge variant="outline" className="rounded-full text-muted-foreground">
                            Exemple / démonstration
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">{study.title}</h2>
                      <p className="text-muted-foreground mb-6">{study.description}</p>

                      <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Challenge</h3>
                        <p className="text-foreground text-sm">{study.challenge.description}</p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Solution</h3>
                        <p className="text-foreground text-sm">{study.solution.description}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {study.technologies.map((tech) => (
                          <Badge key={tech.name} variant="secondary" className="rounded-full">{tech.name}</Badge>
                        ))}
                      </div>
                    </div>

                    <div className="bg-secondary/30 p-8 lg:p-12 border-l border-border/30 flex flex-col">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Résultats</h3>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {study.results.map((result) => (
                          <div key={result.label}>
                            <p className="text-3xl font-bold gradient-text mb-1">{result.metric}</p>
                            <p className="text-xs text-muted-foreground">{result.label}</p>
                          </div>
                        ))}
                      </div>

                      <Button asChild variant="outline" className="rounded-full mt-auto self-start">
                        <Link href={`/etudes-de-cas/${study.id}`}>
                          Voir l&apos;étude complète
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Prêt à écrire votre success story ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discutons de votre projet et découvrez comment nous pouvons vous accompagner.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/contact">
                Prendre rendez-vous
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

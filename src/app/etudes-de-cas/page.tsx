import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Lightbulb, Clock, Users, CheckCircle2 } from "lucide-react";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Études de cas | Agenfy - Nos approches et méthodologies",
  description: "Découvrez nos études de cas détaillées. Des approches concrètes en Data, IA et Cloud pour transformer votre entreprise.",
};

const categoryColors: Record<string, string> = {
  Data: "from-blue-500/20 to-cyan-500/20",
  IA: "from-purple-500/20 to-pink-500/20",
  Cloud: "from-orange-500/20 to-yellow-500/20",
  Conseil: "from-green-500/20 to-emerald-500/20",
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
              Études de cas
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Des approches </span>
              <span className="gradient-text">concrètes</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Explorez nos études de cas détaillées pour découvrir notre méthodologie, 
              les défis rencontrés et les résultats obtenus.
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span>Cliquez sur chaque étude pour voir le détail complet</span>
            </div>
          </div>
        </section>

        {/* Case Studies Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudies.map((study) => (
                <Link key={study.id} href={`/etudes-de-cas/${study.id}`} className="group">
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden h-full">
                    <CardContent className="p-0 flex flex-col">
                      {/* Header with gradient */}
                      <div className={`h-32 bg-gradient-to-br ${categoryColors[study.category]} relative flex-shrink-0`}>
                        <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                          <Badge className="rounded-full bg-background/90 text-foreground">
                            {study.category}
                          </Badge>
                          <Badge variant="outline" className="rounded-full bg-background/50">
                            {study.industry}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6">
                        <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {study.title}
                        </h2>
                        <p className="text-muted-foreground text-sm mb-6">
                          {study.description}
                        </p>
                        
                        {/* Quick stats */}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {study.implementation.duration}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {study.implementation.team.split("+")[0].trim()}
                          </span>
                        </div>
                        
                        {/* Results preview */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                          {study.results.slice(0, 3).map((result) => (
                            <div key={result.label} className="text-center">
                              <p className="text-2xl font-bold gradient-text">{result.metric}</p>
                              <p className="text-xs text-muted-foreground">{result.label}</p>
                            </div>
                          ))}
                        </div>
                        
                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {study.technologies.slice(0, 4).map((tech) => (
                            <Badge key={tech.name} variant="secondary" className="rounded-full text-xs">
                              {tech.name}
                            </Badge>
                          ))}
                          {study.technologies.length > 4 && (
                            <Badge variant="secondary" className="rounded-full text-xs">
                              +{study.technologies.length - 4}
                            </Badge>
                          )}
                        </div>
                        
                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                          <span className="text-sm text-muted-foreground">Voir le détail complet</span>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why it matters */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Notre approche en 4 points
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Ce qui fait la différence dans nos projets
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { title: "Pragmatisme", description: "Des solutions adaptées à votre contexte, pas des usines à gaz" },
                { title: "Quick wins", description: "Des premiers résultats visibles rapidement pour créer de la dynamique" },
                { title: "Transfert", description: "Vos équipes montent en compétence et deviennent autonomes" },
                { title: "Impact business", description: "Chaque projet est mesuré par son ROI concret" },
              ].map((item) => (
                <div key={item.title} className="text-center">
                  <CheckCircle2 className="w-8 h-8 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Et si on écrivait votre prochaine étude de cas ?
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

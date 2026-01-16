import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Clock, Users, CheckCircle2, AlertTriangle, Lightbulb, Wrench, Target } from "lucide-react";
import { caseStudies, getCaseStudyById } from "@/lib/case-studies";

interface CaseStudyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateStaticParams() {
  return caseStudies.map((study) => ({
    id: study.id,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps): Promise<Metadata> {
  const { id } = await params;
  const study = getCaseStudyById(id);
  
  if (!study) {
    return { title: "Étude de cas non trouvée | Agenfy" };
  }

  return {
    title: `${study.title} | Agenfy - Étude de cas`,
    description: study.description,
  };
}

const categoryColors: Record<string, string> = {
  Data: "from-blue-500/20 to-cyan-500/20",
  IA: "from-purple-500/20 to-pink-500/20",
  Cloud: "from-orange-500/20 to-yellow-500/20",
  Conseil: "from-green-500/20 to-emerald-500/20",
};

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { id } = await params;
  const study = getCaseStudyById(id);

  if (!study) {
    notFound();
  }

  // Find related case studies
  const relatedStudies = caseStudies.filter(s => s.id !== id).slice(0, 2);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className={`py-16 lg:py-24 relative overflow-hidden bg-gradient-to-br ${categoryColors[study.category]}`}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Button asChild variant="ghost" className="mb-8 -ml-4 text-muted-foreground hover:text-foreground">
              <Link href="/etudes-de-cas">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Toutes les études de cas
              </Link>
            </Button>
            
            <div className="flex gap-2 mb-6">
              <Badge className="rounded-full bg-primary/90">{study.category}</Badge>
              <Badge variant="outline" className="rounded-full">{study.industry}</Badge>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              {study.title}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl">
              {study.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-5 h-5 text-primary" />
                <span>Durée : <strong className="text-foreground">{study.implementation.duration}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-5 h-5 text-primary" />
                <span>Équipe : <strong className="text-foreground">{study.implementation.team}</strong></span>
              </div>
            </div>
          </div>
        </section>

        {/* Results Summary */}
        <section className="py-12 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              {study.results.map((result) => (
                <div key={result.label} className="text-center">
                  <p className="text-5xl font-bold gradient-text mb-2">{result.metric}</p>
                  <p className="text-lg font-semibold text-foreground mb-1">{result.label}</p>
                  <p className="text-sm text-muted-foreground">{result.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Challenge */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Le Challenge</h2>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{study.challenge.title}</h3>
                <p className="text-muted-foreground mb-6">{study.challenge.description}</p>
              </div>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Problématiques identifiées</h4>
                  <ul className="space-y-3">
                    {study.challenge.painPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-red-500/10 text-red-500 text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <span className="text-muted-foreground">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solution */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Lightbulb className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">La Solution</h2>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-4">{study.solution.title}</h3>
                <p className="text-muted-foreground mb-6">{study.solution.description}</p>
              </div>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Notre approche</h4>
                  <ul className="space-y-3">
                    {study.solution.approach.map((step, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Implementation Timeline */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Wrench className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Mise en œuvre</h2>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {study.implementation.phases.map((phase, index) => (
                <Card key={index} className="bg-card/50 border-border/50 relative">
                  <CardContent className="p-6">
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full gradient-bg text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </div>
                    <Badge variant="outline" className="rounded-full mb-4">{phase.duration}</Badge>
                    <h3 className="font-semibold text-foreground mb-2">{phase.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{phase.description}</p>
                    <div className="border-t border-border/50 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Livrables</p>
                      <ul className="space-y-1">
                        {phase.deliverables.map((deliverable, i) => (
                          <li key={i} className="text-sm text-foreground flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            {deliverable}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-16 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-foreground mb-8">Technologies utilisées</h2>
            <div className="flex flex-wrap gap-3">
              {study.technologies.map((tech) => (
                <div key={tech.name} className="px-4 py-3 rounded-xl bg-card border border-border/50">
                  <p className="font-semibold text-foreground">{tech.name}</p>
                  <p className="text-xs text-muted-foreground">{tech.category}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Learnings */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-yellow-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Ce que nous avons appris</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {study.keyLearnings.map((learning, index) => (
                <Card key={index} className="bg-card/50 border-border/50">
                  <CardContent className="p-6 flex items-start gap-4">
                    <span className="w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <p className="text-foreground">{learning}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Related Studies */}
        {relatedStudies.length > 0 && (
          <section className="py-16 bg-secondary/20">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-2xl font-bold text-foreground mb-8">Autres études de cas</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedStudies.map((related) => (
                  <Link key={related.id} href={`/etudes-de-cas/${related.id}`} className="group">
                    <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                      <CardContent className="p-6">
                        <div className="flex gap-2 mb-4">
                          <Badge className="rounded-full">{related.category}</Badge>
                          <Badge variant="outline" className="rounded-full">{related.industry}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">{related.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            {related.results.slice(0, 2).map((result) => (
                              <div key={result.label}>
                                <span className="font-bold text-primary">{result.metric}</span>
                                <span className="text-xs text-muted-foreground ml-1">{result.label}</span>
                              </div>
                            ))}
                          </div>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Un projet similaire en tête ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discutons de vos enjeux et voyons comment nous pouvons vous accompagner.
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

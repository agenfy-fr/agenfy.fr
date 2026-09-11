"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Database, Brain, Cloud, Briefcase, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { caseStudies } from "@/lib/case-studies";

const categoryIcons: Record<string, LucideIcon> = {
  Data: Database,
  IA: Brain,
  Cloud: Cloud,
  Conseil: Briefcase,
};

const categoryGradients: Record<string, string> = {
  Data: "from-blue-500/20 to-cyan-500/20",
  IA: "from-purple-500/20 to-pink-500/20",
  Cloud: "from-orange-500/20 to-yellow-500/20",
  Conseil: "from-green-500/20 to-emerald-500/20",
};

export function Clients() {
  return (
    <section id="clients" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Études de cas
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Des solutions <span className="gradient-text">éprouvées</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Découvrez nos approches concrètes sur des projets Data, IA, Cloud et Conseil. 
            Cliquez pour explorer les détails.
          </p>
        </div>

        {/* Case studies grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {caseStudies.map((study) => {
            const Icon = categoryIcons[study.category];
            return (
            <Link key={study.id} href={`/etudes-de-cas/${study.id}`} className="group">
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden h-full py-0">
                <CardContent className="p-0">
                  {/* Header with gradient */}
                  <div className={`h-24 bg-gradient-to-br ${categoryGradients[study.category]} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="w-10 h-10 rounded-xl bg-background/90 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Badge className="rounded-full bg-background/90 text-foreground text-xs">
                        {study.category}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge variant="outline" className="rounded-full text-xs">{study.industry}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {study.implementation.duration}
                      </span>
                      {study.caseType === "example" && (
                        <Badge variant="outline" className="rounded-full text-xs text-muted-foreground">
                          Exemple / démonstration
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {study.description}
                    </p>

                    {/* Results */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-secondary/30">
                      {study.results.slice(0, 2).map((result) => (
                        <div key={result.label}>
                          <p className="text-2xl font-bold gradient-text">{result.metric}</p>
                          <p className="text-xs text-muted-foreground">{result.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Tags & CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {study.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech.name} variant="secondary" className="rounded-full text-xs">
                            {tech.name}
                          </Badge>
                        ))}
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
            <Link href="/etudes-de-cas">
              Voir toutes les études de cas
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

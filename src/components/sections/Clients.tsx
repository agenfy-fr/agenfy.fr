"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, Database, Brain, Cloud, Briefcase } from "lucide-react";
import Link from "next/link";

const caseStudies = [
  {
    id: "retail-data-lakehouse",
    icon: Database,
    category: "Data",
    industry: "Retail",
    title: "Plateforme Data unifiée",
    description: "Data Lakehouse centralisant les données de ventes, stocks et clients pour des décisions stratégiques en temps réel.",
    duration: "4 mois",
    results: [
      { metric: "-60%", label: "Temps de reporting" },
      { metric: "+25%", label: "Précision des prévisions" },
    ],
    tags: ["Snowflake", "dbt", "Airbyte"],
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    id: "ecommerce-recommandation-ia",
    icon: Brain,
    category: "IA",
    industry: "E-commerce",
    title: "Moteur de recommandation IA",
    description: "Système de recommandation personnalisée exploitant le comportement utilisateur pour booster les conversions.",
    duration: "3 mois",
    results: [
      { metric: "+35%", label: "Taux de conversion" },
      { metric: "+22%", label: "Panier moyen" },
    ],
    tags: ["Python", "TensorFlow", "AWS"],
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    id: "finance-migration-cloud",
    icon: Cloud,
    category: "Cloud",
    industry: "Finance",
    title: "Migration Cloud & DevOps",
    description: "Migration d'infrastructure legacy vers AWS avec modernisation en architecture microservices.",
    duration: "6 mois",
    results: [
      { metric: "-40%", label: "Coûts infrastructure" },
      { metric: "99.99%", label: "Disponibilité" },
    ],
    tags: ["AWS", "Kubernetes", "Terraform"],
    gradient: "from-orange-500/20 to-yellow-500/20",
  },
  {
    id: "industrie-transformation-digitale",
    icon: Briefcase,
    category: "Conseil",
    industry: "Industrie",
    title: "Transformation digitale 360°",
    description: "Programme de transformation couvrant stratégie data, adoption IA et modernisation SI sur 18 mois.",
    duration: "18 mois",
    results: [
      { metric: "x3", label: "Maturité digitale" },
      { metric: "15", label: "Use cases livrés" },
    ],
    tags: ["Stratégie", "Change Mgmt", "Data Gov"],
    gradient: "from-green-500/20 to-emerald-500/20",
  },
];

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
          {caseStudies.map((study) => (
            <Link key={study.id} href={`/etudes-de-cas/${study.id}`} className="group">
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden h-full py-0">
                <CardContent className="p-0">
                  {/* Header with gradient */}
                  <div className={`h-24 bg-gradient-to-br ${study.gradient} relative`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="w-10 h-10 rounded-xl bg-background/90 flex items-center justify-center">
                        <study.icon className="w-5 h-5 text-primary" />
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
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="rounded-full text-xs">{study.industry}</Badge>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {study.duration}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {study.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {study.description}
                    </p>
                    
                    {/* Results */}
                    <div className="grid grid-cols-2 gap-4 mb-4 p-4 rounded-lg bg-secondary/30">
                      {study.results.map((result) => (
                        <div key={result.label}>
                          <p className="text-2xl font-bold gradient-text">{result.metric}</p>
                          <p className="text-xs text-muted-foreground">{result.label}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Tags & CTA */}
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {study.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
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

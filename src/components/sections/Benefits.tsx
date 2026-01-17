"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Target, Zap, Shield, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Stratégie sur-mesure",
    description:
      "Pas de solutions génériques. Chaque recommandation est adaptée à vos objectifs business et à votre contexte technique.",
  },
  {
    icon: Zap,
    title: "Exécution rapide",
    description:
      "De l'idée au déploiement, nous accélérons vos projets grâce à des méthodologies agiles et des équipes expérimentées.",
  },
  {
    icon: Shield,
    title: "Expertise certifiée",
    description:
      "Nos consultants sont certifiés sur les principales technologies cloud et data. Vous bénéficiez des meilleures pratiques du marché.",
  },
  {
    icon: TrendingUp,
    title: "ROI mesurable",
    description:
      "Chaque projet est piloté par des KPIs clairs. Nous nous engageons sur des résultats concrets et mesurables.",
  },
];

export function Benefits() {
  return (
    <section className="py-24 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Pourquoi Agenfy
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Un partenaire qui fait la différence
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nous combinons expertise technique et vision business pour vous accompagner 
            dans chaque étape de votre transformation.
          </p>
        </div>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => (
            <Card
              key={benefit.title}
              className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group"
            >
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <benefit.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {benefit.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

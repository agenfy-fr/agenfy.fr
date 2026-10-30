"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/effects";
import { Target, Zap, Shield, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Partir des tâches réelles",
    description:
      "Nous observons le travail de vos équipes avant de recommander un outil. Pas de solution générique : un cas d'usage, un responsable, un indicateur.",
  },
  {
    icon: Zap,
    title: "Des premiers gains en semaines",
    description:
      "Formation et quick wins d'abord, projets structurants ensuite : vos équipes gagnent du temps avant même le premier développement.",
  },
  {
    icon: Shield,
    title: "Sécurité et conformité",
    description:
      "Confidentialité des données, choix d'hébergement, règles d'usage, RGPD et AI Act sont traités dès le cadrage, pas après coup.",
  },
  {
    icon: TrendingUp,
    title: "Former, puis outiller",
    description:
      "Nous formons vos équipes sur app.agenfy.fr et suivons vos projets dans un espace client dédié : vous gardez la maîtrise de ce qui est construit.",
  },
];

export function Benefits() {
  return (
    <section className="py-24 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <Reveal className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Pourquoi Agenfy
          </p>
          <h2 className="text-h1 font-bold text-foreground mb-6">
            Pourquoi travailler avec Agenfy
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Nous combinons expertise technique et vision business pour vous accompagner
            dans chaque étape de votre transformation.
          </p>
        </Reveal>

        {/* Benefits grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <Reveal key={benefit.title} delay={index * 0.1}>
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 group h-full">
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

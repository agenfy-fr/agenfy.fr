"use client";

import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Search, Lightbulb, Rocket, RefreshCw } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: MessageSquare,
    title: "Échange & Compréhension",
    description:
      "Nous prenons le temps de comprendre vos enjeux business, votre contexte technique et vos ambitions. Pas de solution toute faite : chaque projet est unique.",
  },
  {
    number: "02",
    icon: Search,
    title: "Audit & Diagnostic",
    description:
      "Nous analysons votre existant, identifions les opportunités d'amélioration et définissons les quick wins ainsi que les chantiers structurants.",
  },
  {
    number: "03",
    icon: Lightbulb,
    title: "Conception & Stratégie",
    description:
      "Nous co-construisons avec vous une roadmap claire et priorisée. Architecture cible, choix technologiques, planning : tout est documenté et validé ensemble.",
  },
  {
    number: "04",
    icon: Rocket,
    title: "Implémentation",
    description:
      "Nos équipes délivrent en mode agile, avec des itérations courtes et une communication transparente. Vous avez une visibilité totale sur l'avancement.",
  },
  {
    number: "05",
    icon: RefreshCw,
    title: "Support & Évolution",
    description:
      "Le déploiement n'est que le début. Nous assurons le transfert de compétences, le support et faisons évoluer vos solutions au fil de vos besoins.",
  },
];

export function Process() {
  return (
    <section id="process" className="py-24 lg:py-32 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Notre approche
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Un processus éprouvé, des résultats garantis
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            De la première discussion au support continu, nous vous accompagnons 
            à chaque étape avec rigueur et transparence.
          </p>
        </div>

        {/* Process steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step) => (
              <Card
                key={step.number}
                className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group relative"
              >
                <CardContent className="p-6">
                  {/* Step number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-4xl font-bold text-primary/20 group-hover:text-primary/40 transition-colors">
                      {step.number}
                    </span>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <step.icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

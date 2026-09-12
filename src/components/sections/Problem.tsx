"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/effects";
import { Database, Brain, Cloud, Users } from "lucide-react";

const problems = [
  {
    icon: Database,
    category: "Data",
    title: "Vos données restent invisibles",
    description:
      "Ventes, stocks, clients : les informations vivent dans des silos qui ne communiquent pas. Le reporting reste manuel, les décisions se prennent avec plusieurs semaines de retard.",
  },
  {
    icon: Brain,
    category: "IA",
    title: "Vos projets IA restent au stade de POC",
    description:
      "Le prototype fonctionne en démo, mais rien ne passe jamais en production. Sans méthodologie ni gouvernance claire, l'IA générative reste un coût, pas un levier.",
  },
  {
    icon: Cloud,
    category: "Cloud",
    title: "Votre infrastructure freine votre croissance",
    description:
      "Déploiements manuels, coûts cloud qui dérivent, incapacité à absorber les pics d'activité : l'infrastructure n'a pas suivi le rythme de l'entreprise.",
  },
  {
    icon: Users,
    category: "Conseil",
    title: "Votre stratégie tech reste sur le papier",
    description:
      "La roadmap existe, mais personne ne l'exécute. Les directions travaillent en silos et un projet IT raté a fragilisé la confiance dans la capacité à transformer.",
  },
];

export function Problem() {
  return (
    <section className="py-24 lg:py-32 relative bg-secondary/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Ces défis vous parlent ?
          </p>
          <h2 className="text-h1 font-bold text-foreground mb-6">
            Les blocages qui freinent votre transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Avant de parler solutions, parlons des problèmes concrets que nous rencontrons
            chez nos clients, semaine après semaine.
          </p>
        </Reveal>

        <div className="grid md:grid-cols-2 gap-6">
          {problems.map((problem, index) => (
            <Reveal key={problem.category} delay={index * 0.1}>
              <Card className="bg-card/50 border-border/50 h-full">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <problem.icon className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        {problem.category}
                      </p>
                      <h3 className="text-lg font-bold text-foreground mb-2">{problem.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {problem.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

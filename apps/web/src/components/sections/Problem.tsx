"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Reveal } from "@/components/effects";
import { Database, Brain, Cloud, Users } from "lucide-react";

const problems = [
  {
    icon: Users,
    category: "Usages",
    title: "Vos équipes utilisent l'IA sans cadre",
    description:
      "Chacun teste ChatGPT de son côté, sur des comptes personnels. Personne ne sait ce qui fonctionne, ni quelles données sortent de l'entreprise.",
  },
  {
    icon: Brain,
    category: "Projets",
    title: "Vos projets IA restent au stade de démo",
    description:
      "Le prototype impressionne en réunion, mais rien ne passe en production : pas de mesure de qualité, pas d'intégration aux outils, pas de responsable métier.",
  },
  {
    icon: Cloud,
    category: "Temps",
    title: "Les tâches répétitives saturent vos équipes",
    description:
      "Copier-coller entre outils, relances, saisie, reporting : des heures chaque semaine sur des tâches qu'un agent IA supervisé pourrait traiter.",
  },
  {
    icon: Database,
    category: "Données",
    title: "Vos données ne sont pas prêtes pour l'IA",
    description:
      "Documents éparpillés, chiffres différents selon l'outil, accès mal maîtrisés : un assistant IA ne peut pas répondre juste sur des sources fausses.",
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
            Ce qui bloque l&apos;IA dans la plupart des entreprises
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Avant de parler d&apos;outils, regardons les obstacles concrets qui empêchent
            l&apos;IA de produire des gains dans les PME et ETI.
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

"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BackgroundBeams, Reveal } from "@/components/effects";

// Commitments of the offer, not performance claims: no unverifiable figures here.
const commitments = [
  { title: "Neutre", label: "Pas de commission sur les licences IA que nous recommandons" },
  { title: "Mesurable", label: "Chaque projet démarre avec un indicateur de gain défini" },
  { title: "Sous contrôle", label: "Un humain valide les décisions sensibles des agents IA" },
  { title: "À vous", label: "Code, prompts et données vous appartiennent" },
];

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <BackgroundBeams />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
        <Reveal className="inline-flex items-center gap-2 mb-8">
          <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            <span className="text-muted-foreground">Agence IA pour PME et ETI</span>
          </Badge>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-hero font-bold tracking-tight mb-8">
            <span className="text-foreground">L&apos;IA qui travaille</span>
            <br />
            <span className="gradient-text">vraiment dans votre entreprise</span>
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12">
            Agenfy aide les PME et ETI à passer des essais ChatGPT à des gains mesurables :
            formation des équipes, agents IA connectés à vos outils et applications IA sur mesure,
            sur des fondations Data et Cloud solides.
          </p>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg motion-safe:animate-pulse-glow gradient-btn border-0">
              <Link href="/diagnostic-ia">
                Faire le diagnostic IA (5 min)
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-border/50 hover:bg-secondary/50">
              <Link href="/contact">
                Prendre rendez-vous
              </Link>
            </Button>
          </div>
        </Reveal>

        <Reveal delay={0.4}>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-12 border-t border-border/30 text-left md:text-center">
            {commitments.map((item) => (
              <li key={item.title}>
                <p className="text-xl sm:text-2xl font-bold text-foreground mb-2">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in stagger-5">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center">
          <div className="w-1 h-2 bg-muted-foreground rounded-full mt-2 motion-safe:animate-bounce" />
        </div>
      </div>
    </section>
  );
}

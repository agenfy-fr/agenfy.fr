"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { GlowingOrbs } from "@/components/ui/animated-background";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated background */}
      <GlowingOrbs />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
      
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(50,0,248,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(50,0,248,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 mb-8 opacity-0 animate-fade-in-up">
          <Badge variant="outline" className="rounded-full px-4 py-2 border-primary/30 bg-primary/5">
            <Sparkles className="w-4 h-4 mr-2 text-primary" />
            <span className="text-muted-foreground">Conseil & Intégration Technologique</span>
          </Badge>
        </div>

        {/* Main heading */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 opacity-0 animate-fade-in-up stagger-1">
          <span className="text-foreground">Transformez vos données</span>
          <br />
          <span className="gradient-text">en avantage concurrentiel</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 opacity-0 animate-fade-in-up stagger-2">
          Agefy accompagne les entreprises ambitieuses dans leur transformation digitale. 
          Data, IA, Cloud et Conseil : nous construisons ensemble les fondations technologiques de votre succès.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-3">
          <Button asChild size="lg" className="rounded-full px-8 py-6 text-lg animate-pulse-glow gradient-btn border-0">
            <Link href="/contact">
              Discutons de votre projet
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-8 py-6 text-lg border-border/50 hover:bg-secondary/50">
            <Link href="#services">
              Découvrir nos services
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-24 pt-12 border-t border-border/30 opacity-0 animate-fade-in-up stagger-4">
          {[
            { value: "25+", label: "Technologies maîtrisées" },
            { value: "100%", label: "Engagement qualité" },
            { value: "100%", label: "Solutions sur-mesure" },
            { value: "5 ans", label: "D'expérience terrain" },
          ].map((stat) => (
            <div key={stat.label} className="text-center group">
              <p className="text-3xl sm:text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 opacity-0 animate-fade-in stagger-5">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center">
          <div className="w-1 h-2 bg-muted-foreground rounded-full mt-2 animate-bounce" />
        </div>
      </div>
    </section>
  );
}

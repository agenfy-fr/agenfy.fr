"use client";

import { Badge } from "@/components/ui/badge";
import { Reveal, SpotlightCard } from "@/components/effects";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { IA_OFFERS, FOUNDATION_OFFERS } from "@/lib/offers";

const services = IA_OFFERS.map((offer) => ({
  id: offer.slug,
  icon: offer.icon,
  title: offer.name,
  tagline: offer.tagline,
  description: offer.summary,
  href: offer.path,
  technologies: offer.technologies.slice(0, 4),
}));

export function Expertise() {
  return (
    <section id="expertise" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <Reveal className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Nos expertises
          </p>
          <h2 className="text-h1 font-bold text-foreground mb-6">
            De la formation à l&apos;agent IA en production
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Quatre expertises IA complémentaires, pour avancer au rythme de vos équipes
            et de vos données.
          </p>
        </Reveal>

        {/* Bento grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <Reveal key={service.id} delay={index * 0.1}>
              <SpotlightCard className="h-full">
                <Link href={service.href} className="flex h-full flex-col p-8 lg:p-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <h3 className="text-h3 font-bold text-foreground mb-1">{service.title}</h3>
                  <p className="text-primary text-sm mb-4">{service.tagline}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6 flex-1">
                    {service.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {service.technologies.map((tech) => (
                      <Badge
                        key={tech}
                        variant="outline"
                        className="rounded-full bg-background/50 border-border/50"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Link>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10 text-center text-muted-foreground">
          <p>
            Sur des fondations solides :{" "}
            {FOUNDATION_OFFERS.map((offer, i) => (
              <span key={offer.slug}>
                {i > 0 && " et "}
                <Link href={offer.path} className="text-primary font-medium hover:underline">
                  {offer.name.toLowerCase()}
                </Link>
              </span>
            ))}
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}

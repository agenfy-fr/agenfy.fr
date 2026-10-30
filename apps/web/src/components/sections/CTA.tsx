"use client";

import { useEffect } from "react";
import { Reveal } from "@/components/effects";

export function CTA() {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section id="contact" className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      
      {/* Glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <Reveal className="text-center mb-12">
          <h2 className="text-h1 font-bold text-foreground mb-4">
            Prêt à <span className="gradient-text">accélérer</span> ?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Réservez un échange de 30 minutes, sans engagement, pour parler de votre projet.
          </p>
        </Reveal>

        {/* Calendly inline widget */}
        <Reveal delay={0.1}>
          <div
            className="calendly-inline-widget"
            data-url="https://calendly.com/contact-agenfy/30min?primary_color=6b4eff"
            style={{ minWidth: "320px", height: "700px" }}
          />
        </Reveal>
      </div>
    </section>
  );
}

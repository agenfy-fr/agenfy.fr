"use client";

import { useEffect } from "react";
import { Header, Footer } from "@/components/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";

const benefits = [
  "Échange de 30 minutes sans engagement",
  "Analyse personnalisée de vos besoins",
  "Recommandations concrètes et actionnables",
  "Estimation budgétaire indicative",
];

const contactInfo = [
  {
    icon: Mail,
    label: "Email",
    value: "contact@agenfy.fr",
    href: "mailto:contact@agenfy.fr",
  },
  {
    icon: Phone,
    label: "Téléphone",
    value: "+33 6 49 06 83 54",
    href: "tel:+33649068354",
  },
  {
    icon: MapPin,
    label: "Adresse",
    value: "229 rue Saint-Honoré, 75001 Paris",
    href: "#",
  },
];

export default function ContactPage() {
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
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <div>
                <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
                  Contact
                </Badge>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="text-foreground">Prêt à </span>
                  <span className="gradient-text">accélérer</span>
                  <span className="text-foreground"> ?</span>
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Échangeons sur vos enjeux technologiques. En 30 minutes, nous identifions 
                  ensemble les leviers de croissance et les quick wins pour votre entreprise.
                </p>
                
                <ul className="space-y-3 mb-8">
                  {benefits.map((benefit) => (
                    <li key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Contact info */}
                <div className="space-y-4 pt-8 border-t border-border/30">
                  {contactInfo.map((info) => (
                    <a
                      key={info.label}
                      href={info.href}
                      className="flex items-center gap-4 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <info.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{info.label}</p>
                        <p className="text-foreground">{info.value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Right content - Calendly */}
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-0">
                  {/* Calendly inline widget */}
                  <div 
                    className="calendly-inline-widget rounded-xl overflow-hidden" 
                    data-url="https://calendly.com/contact-agenfy/30min?primary_color=6b4eff"
                    style={{ minWidth: "320px", height: "650px" }}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

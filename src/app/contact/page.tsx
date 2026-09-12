"use client";

import { useEffect, useActionState } from "react";
import { Header, Footer } from "@/components/sections";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Mail, Phone, MapPin, CheckCircle2, Send } from "lucide-react";
import { submitContactForm, type ContactFormState } from "./actions";

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
    href: "https://www.google.com/maps/search/?api=1&query=229+rue+Saint-Honor%C3%A9%2C+75001+Paris",
  },
];

const services = ["Data", "Intelligence Artificielle", "Cloud", "Conseil", "Autre"];

const initialState: ContactFormState = { success: false };

function ContactForm() {
  const [state, formAction, isPending] = useActionState(submitContactForm, initialState);

  if (state.success) {
    return (
      <div className="bg-primary/10 border border-primary/30 rounded-2xl p-8 text-center">
        <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-4" />
        <p className="text-primary font-medium mb-1">Message envoyé !</p>
        <p className="text-muted-foreground text-sm">
          Merci, nous revenons vers vous sous 24h ouvrées.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="text-xs text-muted-foreground mb-1.5 block">
            Nom complet *
          </label>
          <Input id="name" name="name" required disabled={isPending} placeholder="Jean Dupont" />
        </div>
        <div>
          <label htmlFor="company" className="text-xs text-muted-foreground mb-1.5 block">
            Entreprise
          </label>
          <Input id="company" name="company" disabled={isPending} placeholder="Votre entreprise" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="email" className="text-xs text-muted-foreground mb-1.5 block">
            Email *
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isPending}
            placeholder="jean@entreprise.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-xs text-muted-foreground mb-1.5 block">
            Téléphone
          </label>
          <Input id="phone" name="phone" type="tel" disabled={isPending} placeholder="+33 6 12 34 56 78" />
        </div>
      </div>

      <div>
        <label htmlFor="service" className="text-xs text-muted-foreground mb-1.5 block">
          Domaine concerné
        </label>
        <select
          id="service"
          name="service"
          disabled={isPending}
          defaultValue=""
          className="border-input flex h-9 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
        >
          <option value="" disabled>
            Sélectionnez un domaine
          </option>
          {services.map((service) => (
            <option key={service} value={service}>
              {service}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-xs text-muted-foreground mb-1.5 block">
          Votre message *
        </label>
        <Textarea
          id="message"
          name="message"
          required
          disabled={isPending}
          rows={4}
          placeholder="Décrivez votre projet ou vos besoins..."
        />
      </div>

      {state.error && <p className="text-red-500 text-sm">{state.error}</p>}

      <Button type="submit" disabled={isPending} className="w-full rounded-full gradient-btn border-0">
        {isPending ? (
          "Envoi..."
        ) : (
          <>
            Envoyer le message
            <Send className="w-4 h-4 ml-2" />
          </>
        )}
      </Button>
    </form>
  );
}

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
          <BackgroundBeams />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left content */}
              <Reveal>
                <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
                  Contact
                </Badge>
                <h1 className="text-hero font-bold mb-6">
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
                      target={info.href.startsWith("http") ? "_blank" : undefined}
                      rel={info.href.startsWith("http") ? "noopener noreferrer" : undefined}
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
              </Reveal>

              {/* Right content - Calendly */}
              <Reveal delay={0.1}>
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
              </Reveal>
            </div>
          </div>
        </section>

        {/* Form Section */}
        <section className="py-24 relative overflow-hidden border-t border-border/30">
          <div className="relative max-w-2xl mx-auto px-6 lg:px-8">
            <Reveal>
              <div className="text-center mb-10">
                <Badge variant="outline" className="rounded-full px-4 py-2 mb-6 border-primary/30 bg-primary/5">
                  Ou écrivez-nous
                </Badge>
                <h2 className="text-h2 font-bold mb-4 text-foreground">
                  Décrivez-nous votre projet
                </h2>
                <p className="text-muted-foreground">
                  Pas de disponibilité tout de suite ? Laissez-nous un message, nous vous
                  répondons sous 24h ouvrées.
                </p>
              </div>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-6 sm:p-8">
                  <ContactForm />
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Database, Brain, Cloud, Users, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Nos Services | Agenfy - Data, IA, Cloud & Conseil",
  description: "Découvrez nos 4 piliers d'expertise : Data, Intelligence Artificielle, Infrastructure Cloud et Conseil stratégique pour votre transformation digitale.",
};

const services = [
  {
    id: "data",
    icon: Database,
    title: "Data",
    tagline: "Exploitez le plein potentiel de vos données",
    description: "Nous concevons des architectures data modernes et scalables. De la collecte à la visualisation, nous transformons vos données brutes en insights actionnables.",
    href: "/services/data",
    features: [
      "Architecture Data & Lakehouse",
      "Pipelines ETL/ELT automatisés",
      "Data Governance & Qualité",
      "Business Intelligence & Analytics",
    ],
  },
  {
    id: "ia",
    icon: Brain,
    title: "Intelligence Artificielle",
    tagline: "L'IA au service de votre performance",
    description: "Nous développons des solutions d'IA sur-mesure qui automatisent vos processus et créent de nouvelles opportunités business.",
    href: "/services/intelligence-artificielle",
    features: [
      "Machine Learning & Deep Learning",
      "LLM & IA Générative",
      "Computer Vision & NLP",
      "MLOps & Industrialisation",
    ],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Infrastructure & Cloud",
    tagline: "Une infrastructure à la hauteur de vos ambitions",
    description: "Nous construisons des infrastructures cloud robustes, sécurisées et optimisées pour votre croissance.",
    href: "/services/cloud",
    features: [
      "Architecture Cloud Native",
      "Migration & Modernisation",
      "DevOps & CI/CD",
      "Kubernetes & Containerisation",
    ],
  },
  {
    id: "conseil",
    icon: Users,
    title: "Conseil",
    tagline: "Une vision stratégique pour vos décisions tech",
    description: "Nos consultants seniors vous accompagnent dans la définition de votre stratégie technologique.",
    href: "/services/conseil",
    features: [
      "Audit & Diagnostic technique",
      "Roadmap technologique",
      "Accompagnement au changement",
      "Formation & Montée en compétences",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Nos expertises
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">4 piliers pour </span>
              <span className="gradient-text">votre transformation</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche holistique qui couvre l'ensemble de vos besoins technologiques, 
              de la stratégie à l'implémentation.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {services.map((service) => (
                <Card key={service.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 group overflow-hidden">
                  <CardContent className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                        <service.icon className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-foreground mb-1">{service.title}</h2>
                        <p className="text-primary text-sm">{service.tagline}</p>
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-6">{service.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button asChild variant="outline" className="rounded-full group-hover:border-primary/50">
                      <Link href={service.href}>
                        En savoir plus
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Vous avez un projet en tête ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discutons ensemble de vos enjeux et découvrez comment nous pouvons vous accompagner.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/contact">
                Prendre rendez-vous
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

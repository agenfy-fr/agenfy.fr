import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";

export const metadata: Metadata = {
  title: "Cas Clients | Agefy - Nos réalisations et témoignages",
  description: "Découvrez nos réalisations et les témoignages de nos clients. Des résultats concrets en Data, IA et Cloud.",
};

const caseStudies = [
  {
    id: "retail-data",
    industry: "Retail",
    title: "Plateforme Data unifiée pour 200 magasins",
    description: "Construction d'un Data Lakehouse centralisant les données de vente, stock et client pour alimenter les décisions stratégiques.",
    challenge: "Données fragmentées entre plusieurs systèmes, reporting manuel chronophage, impossibilité de croiser les données.",
    solution: "Architecture Lakehouse sur Snowflake avec dbt pour la transformation, Airflow pour l'orchestration et Power BI pour la visualisation.",
    results: [
      { metric: "-60%", label: "Temps de reporting" },
      { metric: "+25%", label: "Précision des prévisions" },
      { metric: "x10", label: "Volume de données traité" },
    ],
    tags: ["Data", "Snowflake", "dbt", "Power BI"],
    testimonial: {
      quote: "Agefy a transformé notre approche de la data. Nous avons enfin une vision unifiée de notre activité.",
      author: "Marie Dupont",
      role: "Directrice Data, TechRetail",
    },
  },
  {
    id: "ecommerce-ia",
    industry: "E-commerce",
    title: "Moteur de recommandation IA personnalisé",
    description: "Développement d'un système de recommandation en temps réel basé sur le comportement utilisateur et les tendances produits.",
    challenge: "Taux de conversion stagnant, panier moyen faible, difficulté à personnaliser l'expérience client à grande échelle.",
    solution: "Modèle de recommandation hybride (collaborative filtering + content-based) déployé sur AWS avec MLOps complet.",
    results: [
      { metric: "+35%", label: "Taux de conversion" },
      { metric: "+22%", label: "Panier moyen" },
      { metric: "50ms", label: "Temps de réponse" },
    ],
    tags: ["IA", "Machine Learning", "AWS", "Python"],
    testimonial: {
      quote: "Notre taux de conversion a augmenté de 35% grâce au moteur de recommandation développé par Agefy.",
      author: "Thomas Martin",
      role: "CTO, E-Commerce Plus",
    },
  },
  {
    id: "finance-cloud",
    industry: "Finance",
    title: "Migration Cloud & Modernisation applicative",
    description: "Migration de l'infrastructure legacy vers AWS avec modernisation des applications critiques en architecture microservices.",
    challenge: "Infrastructure vieillissante, coûts élevés, difficultés de scaling, time-to-market lent pour les nouvelles fonctionnalités.",
    solution: "Migration lift-and-shift puis modernisation progressive. Architecture Kubernetes, CI/CD avec GitHub Actions, monitoring Datadog.",
    results: [
      { metric: "-40%", label: "Coûts infrastructure" },
      { metric: "99.99%", label: "Disponibilité" },
      { metric: "-70%", label: "Time-to-deploy" },
    ],
    tags: ["Cloud", "AWS", "Kubernetes", "DevOps"],
    testimonial: {
      quote: "Migration réussie sans interruption de service. Agefy a su gérer la complexité avec brio.",
      author: "Sophie Bernard",
      role: "DSI, FinanceGroup",
    },
  },
  {
    id: "industrie-conseil",
    industry: "Industrie",
    title: "Transformation digitale 360°",
    description: "Définition et pilotage d'un programme de transformation digitale sur 3 ans couvrant data, IA et modernisation SI.",
    challenge: "Maturité digitale faible, silos organisationnels, manque de vision stratégique tech, résistance au changement.",
    solution: "Audit complet, définition de la roadmap, mise en place de la gouvernance, accompagnement au changement et pilotage du programme.",
    results: [
      { metric: "x3", label: "Maturité digitale" },
      { metric: "15", label: "Quick wins livrés" },
      { metric: "100%", label: "Adhésion équipes" },
    ],
    tags: ["Conseil", "Transformation", "Change Management"],
    testimonial: {
      quote: "Un vrai partenaire qui comprend nos enjeux business et sait les traduire en actions concrètes.",
      author: "Jean-Pierre Moreau",
      role: "DG, IndustrieLeader",
    },
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
              Cas clients
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Des résultats </span>
              <span className="gradient-text">concrets</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nous avons accompagné des entreprises comme la vôtre 
              dans leur transformation technologique.
            </p>
          </div>
        </section>

        {/* Case Studies */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 space-y-16">
            {caseStudies.map((study) => (
              <Card key={study.id} className="bg-card/50 border-border/50 overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="p-8 lg:p-12">
                      <Badge variant="outline" className="rounded-full mb-4">{study.industry}</Badge>
                      <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">{study.title}</h2>
                      <p className="text-muted-foreground mb-6">{study.description}</p>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Challenge</h3>
                        <p className="text-foreground text-sm">{study.challenge}</p>
                      </div>
                      
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">Solution</h3>
                        <p className="text-foreground text-sm">{study.solution}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {study.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="rounded-full">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-secondary/30 p-8 lg:p-12 border-l border-border/30">
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Résultats</h3>
                      <div className="grid grid-cols-3 gap-4 mb-8">
                        {study.results.map((result) => (
                          <div key={result.label}>
                            <p className="text-3xl font-bold gradient-text mb-1">{result.metric}</p>
                            <p className="text-xs text-muted-foreground">{result.label}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-background/50 rounded-xl p-6">
                        <Quote className="w-8 h-8 text-primary/30 mb-4" />
                        <p className="text-foreground italic mb-4">&ldquo;{study.testimonial.quote}&rdquo;</p>
                        <div>
                          <p className="font-semibold text-foreground">{study.testimonial.author}</p>
                          <p className="text-sm text-muted-foreground">{study.testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Prêt à écrire votre success story ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discutons de votre projet et découvrez comment nous pouvons vous accompagner.
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

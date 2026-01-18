import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Brain, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Intelligence Artificielle - IA, Machine Learning & LLM",
  description: "L'IA au service de votre performance. Machine Learning, LLM, RAG, IA Générative, Computer Vision et MLOps pour automatiser vos processus. Experts IA à Paris.",
  keywords: ["intelligence artificielle", "machine learning", "LLM", "RAG", "IA générative", "MLOps", "GPT", "Claude", "computer vision"],
  alternates: {
    canonical: "https://agenfy.fr/services/intelligence-artificielle",
  },
  openGraph: {
    title: "Intelligence Artificielle - IA, Machine Learning & LLM | Agenfy",
    description: "L'IA au service de votre performance. Machine Learning, LLM, RAG, IA Générative et MLOps.",
    url: "https://agenfy.fr/services/intelligence-artificielle",
    type: "website",
  },
};

const features = [
  {
    title: "Machine Learning & Deep Learning",
    description: "Développement de modèles prédictifs et de classification pour optimiser vos décisions business.",
  },
  {
    title: "LLM & IA Générative",
    description: "Intégration de modèles de langage avancés (GPT, Claude) pour automatiser la génération de contenu.",
  },
  {
    title: "Computer Vision",
    description: "Solutions de reconnaissance d'images et de vidéos pour l'industrie, la santé et le retail.",
  },
  {
    title: "NLP & Traitement du langage",
    description: "Analyse de sentiments, extraction d'entités et chatbots intelligents pour améliorer l'expérience client.",
  },
  {
    title: "MLOps & Industrialisation",
    description: "Mise en production et monitoring de vos modèles ML pour garantir performance et fiabilité.",
  },
];

const technologies = ["OpenAI", "Anthropic", "LangChain", "Python", "TensorFlow", "PyTorch", "MLflow", "Hugging Face"];

const useCases = [
  {
    title: "Moteur de recommandation",
    industry: "E-commerce",
    result: "+35% de conversion",
  },
  {
    title: "Chatbot IA intelligent",
    industry: "Service client",
    result: "-70% de tickets L1",
  },
  {
    title: "Prédiction de maintenance",
    industry: "Industrie",
    result: "-45% de pannes",
  },
];

export default function IAServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour aux services
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                  <span className="gradient-text">Intelligence Artificielle</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  L'IA au service de votre performance. Nous développons des solutions d'IA sur-mesure 
                  qui automatisent vos processus et créent de nouvelles opportunités business.
                </p>
                <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
                  <Link href="/contact">
                    Discuter de votre projet
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {useCases.map((useCase) => (
                  <Card key={useCase.title} className="bg-card/50 border-border/50">
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3 rounded-full">{useCase.industry}</Badge>
                      <h3 className="font-semibold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-primary font-bold">{useCase.result}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">Ce que nous faisons</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-8">Technologies</h2>
            <div className="flex flex-wrap justify-center gap-3">
              {technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="rounded-full px-4 py-2 text-sm">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Prêt à intégrer l'IA dans votre entreprise ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Découvrez comment l'intelligence artificielle peut transformer votre activité.
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

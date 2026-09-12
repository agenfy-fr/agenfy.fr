import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams, Reveal } from "@/components/effects";
import Link from "next/link";
import { Database, ArrowRight, CheckCircle2, ArrowLeft } from "lucide-react";
import { caseStudies } from "@/lib/case-studies";

export const metadata: Metadata = {
  title: "Data Engineering & Analytics",
  description: "Exploitez vos données avec nos experts. Architecture Lakehouse, pipelines ETL/ELT, Data Governance et BI. Cabinet conseil Data à Paris.",
  keywords: ["data engineering", "architecture lakehouse", "ETL", "ELT", "data warehouse", "data lake", "Snowflake", "dbt", "data governance"],
  alternates: {
    canonical: "https://www.agenfy.fr/services/data",
  },
  openGraph: {
    title: "Data Engineering & Analytics | Agenfy",
    description: "Architecture Lakehouse, pipelines ETL/ELT, Data Governance.",
    url: "https://www.agenfy.fr/services/data",
    type: "website",
  },
};

const features = [
  {
    title: "Architecture Data & Lakehouse",
    description: "Conception d'architectures modernes combinant la flexibilité des data lakes et la performance des data warehouses.",
  },
  {
    title: "Pipelines ETL/ELT automatisés",
    description: "Mise en place de flux de données robustes et scalables pour alimenter vos systèmes analytiques.",
  },
  {
    title: "Data Governance & Qualité",
    description: "Implémentation de politiques de gouvernance pour garantir la fiabilité et la conformité de vos données.",
  },
  {
    title: "Business Intelligence & Analytics",
    description: "Création de tableaux de bord et rapports pour transformer vos données en insights actionnables.",
  },
  {
    title: "Data Mesh & Data Products",
    description: "Organisation décentralisée de vos données en produits autonomes gérés par les équipes métier.",
  },
];

const technologies = ["Snowflake", "Databricks", "dbt", "Airflow", "Power BI", "Looker", "BigQuery", "Redshift"];

const caseStudy = caseStudies.find((cs) => cs.category === "Data");

export default function DataServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <BackgroundBeams />

          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour aux services
            </Link>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Reveal>
                <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mb-6">
                  <Database className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-hero font-bold mb-6">
                  <span className="gradient-text">Data</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Exploitez le plein potentiel de vos données. Nous concevons des architectures data modernes
                  et scalables qui transforment vos données brutes en avantage concurrentiel.
                </p>
                <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
                  <Link href="/contact">
                    Discuter de votre projet
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </Reveal>

              {caseStudy && (
                <Reveal delay={0.1}>
                  <Card className="bg-card/50 border-border/50">
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <Badge variant="outline" className="rounded-full">{caseStudy.industry}</Badge>
                        <Badge variant="outline" className="rounded-full text-muted-foreground text-xs">
                          Exemple / démonstration
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-foreground mb-4">{caseStudy.title}</h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        {caseStudy.results.slice(0, 2).map((result) => (
                          <div key={result.label}>
                            <p className="text-2xl font-bold gradient-text">{result.metric}</p>
                            <p className="text-xs text-muted-foreground">{result.label}</p>
                          </div>
                        ))}
                      </div>
                      <Link
                        href={`/etudes-de-cas/${caseStudy.id}`}
                        className="text-primary text-sm font-medium inline-flex items-center gap-1 hover:gap-2 transition-all"
                      >
                        Voir l&apos;étude complète
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </Reveal>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 lg:py-24 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Reveal>
              <h2 className="text-h1 font-bold text-foreground mb-12 text-center">Ce que nous faisons</h2>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Reveal key={feature.title} delay={index * 0.1}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-6">
                      <CheckCircle2 className="w-8 h-8 text-primary mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">{feature.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <Reveal>
              <h2 className="text-h1 font-bold text-foreground mb-8">Technologies</h2>
              <div className="flex flex-wrap justify-center gap-3">
                {technologies.map((tech) => (
                  <Badge key={tech} variant="outline" className="rounded-full px-4 py-2 text-sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <Reveal className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-h1 font-bold text-foreground mb-6">
              Prêt à exploiter vos données ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discutons de votre stratégie data et construisons ensemble votre plateforme de demain.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/contact">
                Prendre rendez-vous
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}

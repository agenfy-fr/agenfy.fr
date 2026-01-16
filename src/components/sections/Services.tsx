"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Database, Brain, Cloud, Users, ArrowRight, CheckCircle2 } from "lucide-react";

const services = [
  {
    id: "data",
    icon: Database,
    title: "Data",
    tagline: "Exploitez le plein potentiel de vos données",
    description:
      "Nous concevons des architectures data modernes et scalables. De la collecte à la visualisation, nous transformons vos données brutes en insights actionnables.",
    features: [
      "Architecture Data & Lakehouse",
      "Pipelines ETL/ELT automatisés",
      "Data Governance & Qualité",
      "Business Intelligence & Analytics",
      "Data Mesh & Data Products",
    ],
    technologies: ["Snowflake", "Databricks", "dbt", "Airflow", "Power BI", "Looker"],
  },
  {
    id: "ia",
    icon: Brain,
    title: "Intelligence Artificielle",
    tagline: "L'IA au service de votre performance",
    description:
      "Nous développons des solutions d'IA sur-mesure qui automatisent vos processus, améliorent vos prédictions et créent de nouvelles opportunités business.",
    features: [
      "Machine Learning & Deep Learning",
      "LLM & IA Générative",
      "Computer Vision",
      "NLP & Traitement du langage",
      "MLOps & Industrialisation",
    ],
    technologies: ["OpenAI", "LangChain", "Python", "TensorFlow", "PyTorch", "MLflow"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Infrastructure & Cloud",
    tagline: "Une infrastructure à la hauteur de vos ambitions",
    description:
      "Nous construisons des infrastructures cloud robustes, sécurisées et optimisées. Migration, modernisation ou création : nous vous accompagnons de A à Z.",
    features: [
      "Architecture Cloud Native",
      "Migration & Modernisation",
      "DevOps & CI/CD",
      "Kubernetes & Containerisation",
      "Sécurité & Compliance",
    ],
    technologies: ["AWS", "Azure", "GCP", "Terraform", "Docker", "Kubernetes"],
  },
  {
    id: "conseil",
    icon: Users,
    title: "Conseil",
    tagline: "Une vision stratégique pour vos décisions tech",
    description:
      "Nos consultants seniors vous accompagnent dans la définition de votre stratégie technologique et dans le pilotage de vos transformations les plus complexes.",
    features: [
      "Audit & Diagnostic technique",
      "Roadmap technologique",
      "Accompagnement au changement",
      "Pilotage de programmes",
      "Formation & Montée en compétences",
    ],
    technologies: ["Agile", "Scrum", "SAFe", "TOGAF", "Design Thinking", "OKR"],
  },
];

export function Services() {
  const [activeTab, setActiveTab] = useState("data");

  return (
    <section id="services" className="py-24 lg:py-32 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">
            Nos expertises
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            4 piliers pour votre transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une approche holistique qui couvre l&apos;ensemble de vos besoins technologiques, 
            de la stratégie à l&apos;implémentation.
          </p>
        </div>

        {/* Services tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-12">
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-transparent h-auto w-full max-w-4xl">
              {services.map((service) => (
                <TabsTrigger
                  key={service.id}
                  value={service.id}
                  className="flex flex-col items-center gap-3 p-6 rounded-xl border border-border/50 bg-card/30 data-[state=active]:border-primary data-[state=active]:bg-primary/5 transition-all duration-300 h-auto"
                >
                  <service.icon className="w-8 h-8" />
                  <span className="font-semibold text-center">{service.title}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {services.map((service) => (
            <TabsContent key={service.id} value={service.id} className="mt-0">
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <div className="grid lg:grid-cols-2 gap-0">
                  {/* Left content */}
                  <CardHeader className="p-8 lg:p-12">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                        <service.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-2xl lg:text-3xl">{service.title}</CardTitle>
                        <CardDescription className="text-primary mt-1">
                          {service.tagline}
                        </CardDescription>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                      {service.description}
                    </p>
                    <Button asChild className="rounded-full w-fit">
                      <Link href="#contact">
                        En savoir plus
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardHeader>

                  {/* Right content */}
                  <CardContent className="p-8 lg:p-12 bg-secondary/30 border-l border-border/30">
                    <div className="mb-8">
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Ce que nous faisons
                      </h4>
                      <ul className="space-y-3">
                        {service.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                            <span className="text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                        Technologies
                      </h4>
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
                    </div>
                  </CardContent>
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
}

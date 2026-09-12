"use client";

import { Badge } from "@/components/ui/badge";
import { Reveal, SpotlightCard } from "@/components/effects";
import Link from "next/link";
import { Database, Brain, Cloud, Users, ArrowRight } from "lucide-react";

const services = [
  {
    id: "data",
    icon: Database,
    title: "Data",
    tagline: "Exploitez le plein potentiel de vos données",
    description:
      "Nous concevons des architectures data modernes et scalables. De la collecte à la visualisation, nous transformons vos données brutes en insights actionnables.",
    href: "/services/data",
    technologies: ["Snowflake", "Databricks", "dbt", "Airflow"],
  },
  {
    id: "ia",
    icon: Brain,
    title: "Intelligence Artificielle",
    tagline: "L'IA au service de votre performance",
    description:
      "Nous développons des solutions d'IA sur-mesure qui automatisent vos processus, améliorent vos prédictions et créent de nouvelles opportunités business.",
    href: "/services/intelligence-artificielle",
    technologies: ["LangChain", "Python", "TensorFlow", "MLflow"],
  },
  {
    id: "cloud",
    icon: Cloud,
    title: "Infrastructure & Cloud",
    tagline: "Une infrastructure à la hauteur de vos ambitions",
    description:
      "Nous construisons des infrastructures cloud robustes, sécurisées et optimisées. Migration, modernisation ou création : nous vous accompagnons de A à Z.",
    href: "/services/cloud",
    technologies: ["AWS", "Azure", "Terraform", "Kubernetes"],
  },
  {
    id: "conseil",
    icon: Users,
    title: "Conseil",
    tagline: "Une vision stratégique pour vos décisions tech",
    description:
      "Nos consultants seniors vous accompagnent dans la définition de votre stratégie technologique et dans le pilotage de vos transformations les plus complexes.",
    href: "/services/conseil",
    technologies: ["Agile", "TOGAF", "Design Thinking", "OKR"],
  },
];

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
            4 piliers pour votre transformation
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Une approche holistique qui couvre l&apos;ensemble de vos besoins technologiques,
            de la stratégie à l&apos;implémentation.
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
      </div>
    </section>
  );
}

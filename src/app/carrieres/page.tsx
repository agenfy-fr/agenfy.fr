import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, MapPin, Clock, Briefcase, Heart, Zap, Users, Coffee } from "lucide-react";

export const metadata: Metadata = {
  title: "Carrières | Agefy - Rejoignez notre équipe",
  description: "Rejoignez une équipe passionnée par la tech. Découvrez nos offres d'emploi en Data, IA, Cloud et Conseil.",
};

const perks = [
  {
    icon: Heart,
    title: "Impact réel",
    description: "Travaillez sur des projets qui transforment vraiment les entreprises.",
  },
  {
    icon: Zap,
    title: "Croissance",
    description: "Formation continue et montée en compétences sur les dernières technologies.",
  },
  {
    icon: Users,
    title: "Équipe top",
    description: "Rejoignez des experts passionnés et bienveillants.",
  },
  {
    icon: Coffee,
    title: "Flexibilité",
    description: "Remote-first, horaires flexibles et équilibre vie pro/perso.",
  },
];

const jobs = [
  {
    id: "data-engineer-senior",
    title: "Data Engineer Senior",
    department: "Data",
    location: "Paris / Remote",
    type: "CDI",
    description: "Rejoignez notre équipe Data pour concevoir et implémenter des architectures data modernes chez nos clients.",
    requirements: [
      "5+ ans d'expérience en data engineering",
      "Maîtrise de Snowflake, dbt, Airflow",
      "Expérience cloud (AWS/GCP/Azure)",
      "Bon relationnel client",
    ],
  },
  {
    id: "ml-engineer",
    title: "ML Engineer",
    department: "IA",
    location: "Paris / Remote",
    type: "CDI",
    description: "Développez et déployez des modèles ML en production pour nos clients les plus ambitieux.",
    requirements: [
      "3+ ans d'expérience en ML/Deep Learning",
      "Python, TensorFlow/PyTorch",
      "Expérience MLOps (MLflow, Kubeflow)",
      "Capacité à vulgariser",
    ],
  },
  {
    id: "cloud-architect",
    title: "Cloud Architect",
    department: "Cloud",
    location: "Paris / Remote",
    type: "CDI",
    description: "Concevez des architectures cloud robustes et accompagnez nos clients dans leur migration.",
    requirements: [
      "7+ ans d'expérience en infrastructure",
      "Certifications AWS/Azure/GCP",
      "Expertise Kubernetes, Terraform",
      "Leadership technique",
    ],
  },
  {
    id: "consultant-senior",
    title: "Consultant Senior",
    department: "Conseil",
    location: "Paris",
    type: "CDI",
    description: "Accompagnez les directions dans la définition et le pilotage de leurs transformations digitales.",
    requirements: [
      "8+ ans d'expérience en conseil tech",
      "Expérience direction de programme",
      "Excellentes capacités de communication",
      "Background technique solide",
    ],
  },
];

export default function CareersPage() {
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
              Carrières
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-foreground">Rejoignez </span>
              <span className="gradient-text">l'aventure</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nous recherchons des talents passionnés par la tech qui veulent avoir 
              un impact réel sur la transformation des entreprises.
            </p>
          </div>
        </section>

        {/* Perks */}
        <section className="py-16 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {perks.map((perk) => (
                <div key={perk.title} className="text-center">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                    <perk.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{perk.title}</h3>
                  <p className="text-muted-foreground text-sm">{perk.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jobs */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Nos offres</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Découvrez les postes ouverts et trouvez celui qui vous correspond.
              </p>
            </div>
            
            <div className="space-y-6">
              {jobs.map((job) => (
                <Card key={job.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6 lg:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <Badge variant="outline" className="rounded-full">{job.department}</Badge>
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {job.location}
                          </span>
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <Briefcase className="w-4 h-4" />
                            {job.type}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">{job.title}</h3>
                        <p className="text-muted-foreground mb-4">{job.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req) => (
                            <Badge key={req} variant="secondary" className="rounded-full text-xs">
                              {req}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button asChild className="rounded-full gradient-btn border-0 lg:flex-shrink-0">
                        <Link href={`/carrieres/${job.id}`}>
                          Postuler
                          <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Spontaneous application */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Vous ne trouvez pas votre poste ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Envoyez-nous une candidature spontanée, nous sommes toujours à la recherche de talents.
            </p>
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <a href="mailto:careers@agefy.com">
                Candidature spontanée
                <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

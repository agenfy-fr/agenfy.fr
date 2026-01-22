import { Metadata } from "next";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, Heart, Lightbulb, Users, Zap, Shield, Code, Cpu } from "lucide-react";

export const metadata: Metadata = {
  title: "À propos",
  description: "Découvrez Agenfy, notre mission et nos valeurs. Cabinet conseil tech spécialisé Data, IA et Cloud à Paris.",
  alternates: {
    canonical: "https://www.agenfy.fr/a-propos",
  },
  openGraph: {
    title: "À propos | Agenfy",
    description: "Notre mission, nos valeurs et notre équipe d'experts.",
    url: "https://www.agenfy.fr/a-propos",
    type: "website",
  },
};

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque projet, avec une attention particulière aux détails et à la qualité.",
  },
  {
    icon: Heart,
    title: "Engagement",
    description: "Nous nous engageons pleinement auprès de nos clients, comme de véritables partenaires de leur succès.",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Nous restons à la pointe des technologies pour proposer les solutions les plus adaptées.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Nous croyons en la force du collectif et travaillons main dans la main avec vos équipes.",
  },
];

const stats = [
  { value: "25+", label: "Technologies maîtrisées" },
  { value: "100%", label: "Engagement qualité" },
  { value: "100%", label: "Solutions sur-mesure" },
  { value: "5 ans", label: "D'expérience terrain" },
];

const expertise = [
  {
    icon: Code,
    title: "Data Engineering",
    description: "Architectures data modernes, pipelines ETL/ELT, data lakes et data warehouses.",
  },
  {
    icon: Cpu,
    title: "Intelligence Artificielle",
    description: "Machine Learning, Deep Learning, NLP, LLMs et agents IA sur mesure.",
  },
  {
    icon: Zap,
    title: "Cloud & DevOps",
    description: "Architecture cloud-native, Kubernetes, CI/CD et infrastructure as code.",
  },
  {
    icon: Shield,
    title: "Data Governance",
    description: "Qualité des données, conformité RGPD et sécurisation des données.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px]" />
          
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
                À propos
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
                <span className="text-foreground">Nous construisons le </span>
                <span className="gradient-text">futur digital</span>
                <span className="text-foreground"> des entreprises</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Agenfy est née de la conviction que chaque entreprise mérite 
                un partenaire technologique capable de comprendre ses enjeux business et 
                de les traduire en solutions concrètes et performantes.
              </p>
              <p className="text-muted-foreground">
                Marque de <strong>Hasfy SAS</strong>, nous sommes spécialisés dans le conseil et 
                l&apos;intégration technologique, avec un focus sur la Data, l&apos;Intelligence 
                Artificielle et le Cloud.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 border-y border-border/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-4xl font-bold gradient-text mb-2">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">Notre mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Rendre accessible aux entreprises de toutes tailles les technologies 
                  de pointe qui étaient jusqu&apos;alors réservées aux géants de la tech.
                </p>
                <p className="text-muted-foreground mb-8">
                  Nous croyons que la transformation digitale n&apos;est pas qu&apos;une question de technologie. 
                  C&apos;est avant tout une question de vision, de méthode et d&apos;accompagnement humain. 
                  C&apos;est pourquoi nous combinons expertise technique et conseil stratégique pour 
                  créer un impact réel et durable.
                </p>
                <Button asChild className="rounded-full gradient-btn border-0">
                  <Link href="/contact">
                    Discutons de votre projet
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Image 
                    src="/logo.svg" 
                    alt="Agenfy" 
                    width={200} 
                    height={200}
                    className="opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="py-24 lg:py-32 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Notre expertise</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Des compétences pointues au service de votre transformation digitale.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {expertise.map((item) => (
                <Card key={item.title} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Nos valeurs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Les principes qui guident notre travail au quotidien.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value) => (
                <Card key={value.title} className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                      <value.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-24 lg:py-32 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Le fondateur</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                À la tête d&apos;Agenfy, un expert passionné par la technologie et l&apos;innovation.
              </p>
            </div>
            <div className="max-w-xl mx-auto">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-6 ring-4 ring-primary/20">
                      <Image 
                        src="/evan_masse.jpg" 
                        alt="Evan Massé" 
                        width={128} 
                        height={128}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <h3 className="text-2xl font-semibold text-foreground mb-1">Evan Massé</h3>
                    <p className="text-primary font-medium mb-4">CEO & Fondateur</p>
                    <p className="text-muted-foreground">
                      Passionné par la Data et l&apos;Intelligence Artificielle, Evan a fondé Agenfy 
                      avec la vision de démocratiser l&apos;accès aux technologies avancées pour 
                      les entreprises de toutes tailles. Fort de plusieurs années d&apos;expérience 
                      dans le conseil technologique, il accompagne les organisations dans leur 
                      transformation digitale avec pragmatisme et innovation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <div className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Un projet en tête ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Parlons de vos enjeux Data, IA et Cloud. Premier échange sans engagement.
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

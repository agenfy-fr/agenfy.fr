import { buildMetadata } from "@/lib/seo";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { JsonLd, personSchema } from "@/components/schemas/JsonLd";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { Header, Footer } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BackgroundBeams, Reveal } from "@/components/effects";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Target, Heart, Lightbulb, Users, Zap, Shield, Code, Cpu } from "lucide-react";
import { Illustration } from "@/components/effects/Illustration";

export const metadata = buildMetadata({
  title: "À propos : agence IA fondée par Evan Massé",
  description:
    "Agenfy est une agence IA française (Hasfy SAS) fondée par Evan Massé : former les équipes, automatiser avec des agents IA et construire les fondations Data et Cloud des PME et ETI.",
  path: "/a-propos",
});

const values = [
  {
    icon: Target,
    title: "Excellence",
    description: "Nous visons l'excellence dans chaque projet, avec une attention particulière aux détails et à la qualité.",
  },
  {
    icon: Heart,
    title: "Engagement",
    description: "Nous nous engageons pleinement auprès de les entreprises que nous accompagnons, comme de véritables partenaires de leur succès.",
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

const expertise = [
  {
    icon: Cpu,
    title: "Stratégie & formation IA",
    description: "Audit des cas d'usage, choix des outils, règles d'usage et formation des équipes.",
  },
  {
    icon: Zap,
    title: "Agents IA & automatisation",
    description: "Agents connectés à vos outils avec n8n, Make, Claude, OpenAI et le Model Context Protocol.",
  },
  {
    icon: Code,
    title: "Développement IA",
    description: "Assistants RAG sur vos documents, extraction de données, copilotes intégrés à vos applications.",
  },
  {
    icon: Shield,
    title: "Fondations Data & Cloud",
    description: "Pipelines de données, gouvernance, infrastructure cloud sécurisée et maîtrise des coûts.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-24 lg:py-32 relative overflow-hidden">
          <BackgroundBeams />

          <Reveal className="relative max-w-7xl mx-auto px-6 lg:px-8">
            <Breadcrumbs crumbs={[{ name: "À propos", path: "/a-propos" }]} />
            <div className="max-w-3xl">
              <Badge variant="outline" className="rounded-full px-4 py-2 mb-8 border-primary/30 bg-primary/5">
                À propos
              </Badge>
              <h1 className="text-hero font-bold mb-6">
                <span className="text-foreground">Rendre l&apos;IA </span>
                <span className="gradient-text">utile et maîtrisée</span>
                <span className="text-foreground"> dans les PME et ETI</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Agenfy est née d&apos;un constat simple : l&apos;IA générative est disponible pour tous,
                mais très peu d&apos;entreprises en tirent des gains mesurables. Il manque rarement
                l&apos;outil ; il manque la méthode, la formation et l&apos;intégration au travail réel.
              </p>
              <p className="text-muted-foreground">
                Marque de <strong>Hasfy SAS</strong>, Agenfy est une agence IA : nous formons les équipes,
                automatisons les processus avec des agents IA et construisons les fondations Data et
                Cloud qui les rendent fiables.
              </p>
            </div>
            <Illustration name="a-propos" priority className="mt-14 max-w-5xl" />
          </Reveal>
        </section>

        {/* Founder */}
        <section className="py-16 border-y border-border/30" aria-labelledby="founder-title">
          <JsonLd data={personSchema(DEFAULT_AUTHOR)} />
          <div className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-[200px_1fr] gap-10 items-center">
            <Image
              src={DEFAULT_AUTHOR.photo}
              alt={`Portrait de ${DEFAULT_AUTHOR.name}`}
              width={200}
              height={200}
              className="rounded-2xl object-cover aspect-square mx-auto"
            />
            <Reveal>
              <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-2">Le fondateur</p>
              <h2 id="founder-title" className="text-h2 font-bold mb-4">
                {DEFAULT_AUTHOR.name}, {DEFAULT_AUTHOR.role.toLowerCase()}
              </h2>
              <p className="text-muted-foreground mb-4">{DEFAULT_AUTHOR.bio}</p>
              <Link href={`/auteurs/${DEFAULT_AUTHOR.slug}`} className="text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
                Lire ses articles
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* Mission */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <Reveal>
                <h2 className="text-h1 font-bold text-foreground mb-6">Notre mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Donner aux PME et ETI les mêmes capacités IA que les grands groupes,
                  sans les mêmes budgets ni les mêmes délais.
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
              </Reveal>
              <Reveal delay={0.1}>
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <Image
                    src="/logo.svg"
                    alt="Agenfy"
                    width={200}
                    height={200}
                    className="opacity-50"
                  />
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Expertise */}
        <section className="py-24 lg:py-32 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <h2 className="text-h1 font-bold text-foreground mb-4">Notre expertise</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Des compétences pointues au service de votre transformation digitale.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {expertise.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.1}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                        <item.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-24 lg:py-32">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <h2 className="text-h1 font-bold text-foreground mb-4">Nos valeurs</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Les principes qui guident notre travail au quotidien.
              </p>
            </Reveal>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <Reveal key={value.title} delay={index * 0.1}>
                  <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-14 h-14 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
                        <value.icon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                      <p className="text-muted-foreground text-sm">{value.description}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="py-24 lg:py-32 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <Reveal className="text-center mb-16">
              <h2 className="text-h1 font-bold text-foreground mb-4">Le fondateur</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                À la tête d&apos;Agenfy, un expert passionné par la technologie et l&apos;innovation.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="max-w-xl mx-auto">
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
            </Reveal>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
          <Reveal className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-h1 font-bold text-foreground mb-6">
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
          </Reveal>
        </section>
      </main>
      <Footer />
    </div>
  );
}

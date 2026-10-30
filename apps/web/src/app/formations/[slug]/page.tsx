import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock, Users, MonitorSmartphone, ListChecks } from "lucide-react";
import { Header, Footer, FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { JsonLd, courseSchema } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { COURSES, getCourse } from "@/lib/courses";
import { SITE } from "@/lib/site";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return buildMetadata({
    title: `Formation : ${course.name}`,
    description: course.summary.slice(0, 158),
    path: course.path,
  });
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const facts = [
    { icon: Clock, label: "Durée", value: course.durationLabel },
    { icon: Users, label: "Public", value: course.audience },
    { icon: MonitorSmartphone, label: "Modalités", value: course.modality },
    { icon: ListChecks, label: "Prérequis", value: course.prerequisites },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={courseSchema({
          name: course.name,
          description: course.summary,
          path: course.path,
          durationHours: course.durationHours,
          mode: "blended",
        })}
      />
      <Header />
      <main className="pt-20">
        <section className="py-20 lg:py-24 relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
            <Breadcrumbs
              crumbs={[
                { name: "Formations", path: "/formations" },
                { name: course.name, path: course.path },
              ]}
            />
            <Reveal>
              <h1 className="text-h1 sm:text-hero font-bold mb-4 gradient-text">{course.name}</h1>
              <p className="text-xl text-foreground/90 mb-6">{course.tagline}</p>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">{course.summary}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
                  <Link href={`/contact?service=formation-ia&formation=${course.slug}`}>
                    Demander un devis
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <a href={`${SITE.appUrl}/catalogue/${course.appSlug}`}>Voir sur la plateforme</a>
                </Button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="pb-16">
          <dl className="max-w-5xl mx-auto px-6 lg:px-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {facts.map((fact) => (
              <Card key={fact.label} className="bg-card/50 border-border/50">
                <CardContent className="p-5">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-primary mb-1">
                    <fact.icon className="w-4 h-4" aria-hidden />
                    {fact.label}
                  </dt>
                  <dd className="text-sm text-muted-foreground">{fact.value}</dd>
                </CardContent>
              </Card>
            ))}
          </dl>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-6">Objectifs pédagogiques</h2>
            <p className="text-muted-foreground mb-4">À l&apos;issue de la formation, les participants seront capables de :</p>
            <ul className="space-y-3">
              {course.objectives.map((o) => (
                <li key={o} className="flex gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                  {o}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-8">Programme</h2>
            <ol className="grid md:grid-cols-2 gap-6">
              {course.modules.map((m, i) => (
                <li key={m.title} className="list-none rounded-2xl border border-border/60 p-6">
                  <p className="text-sm font-semibold text-primary mb-1">Module {i + 1}</p>
                  <h3 className="font-semibold mb-3">{m.title}</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {m.points.map((p) => (
                      <li key={p}>• {p}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8 grid md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-h2 font-bold mb-6">Évaluation et suivi</h2>
              <ul className="space-y-3">
                {course.evaluation.map((e) => (
                  <li key={e} className="flex gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                    {e}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-h2 font-bold mb-6">Tarif et financement</h2>
              <p className="text-muted-foreground mb-3">
                Formation intra-entreprise sur devis, selon le nombre de participants et le format.
              </p>
              <p className="text-muted-foreground">
                La certification Qualiopi d&apos;Agenfy est en préparation : cette formation n&apos;est pas
                éligible à ce jour au financement OPCO ou CPF.
              </p>
            </div>
          </div>
        </section>

        <FAQ items={course.faq} />
      </main>
      <Footer />
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Clock, Users, MonitorSmartphone } from "lucide-react";
import { Header, Footer, FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { BackgroundBeams, Reveal, SpotlightCard } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { JsonLd, serviceSchema } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getOffer } from "@/lib/offers";
import { COURSES, FORMATIONS_FAQ } from "@/lib/courses";
import { SITE } from "@/lib/site";
import { Illustration } from "@/components/effects/Illustration";

const offer = getOffer("formation-ia");

export const metadata = buildMetadata({
  title: offer.metaTitle,
  description: offer.metaDescription,
  path: "/formations",
  keywords: offer.keywords,
});

export default function FormationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <JsonLd
        data={serviceSchema({ name: offer.name, description: offer.summary, path: "/formations", serviceType: "Formation professionnelle" })}
      />
      <Header />
      <main className="pt-20">
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
            <Breadcrumbs crumbs={[{ name: "Formations", path: "/formations" }]} />
            <Reveal>
              <h1 className="text-hero font-bold mb-6">
                <span className="text-foreground">Formations </span>
                <span className="gradient-text">IA pour les entreprises</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">{offer.summary}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
                  <Link href="/contact?service=formation-ia">
                    Organiser une formation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8">
                  <a href={SITE.appUrl}>Accéder à la plateforme</a>
                </Button>
              </div>
            </Reveal>
            <Illustration name="formation" priority className="mt-14" />
          </div>
        </section>

        <section className="pb-20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-8">Le catalogue</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {COURSES.map((course, i) => (
                <Reveal key={course.slug} delay={i * 0.1}>
                  <SpotlightCard className="h-full">
                    <Link href={course.path} className="flex h-full flex-col p-8">
                      <h3 className="text-h3 font-bold mb-2">{course.name}</h3>
                      <p className="text-primary text-sm mb-4">{course.tagline}</p>
                      <ul className="text-sm text-muted-foreground space-y-2 mb-6 flex-1">
                        <li className="flex items-center gap-2"><Clock className="w-4 h-4" aria-hidden />{course.durationLabel}</li>
                        <li className="flex items-center gap-2"><Users className="w-4 h-4" aria-hidden />{course.audience}</li>
                        <li className="flex items-center gap-2"><MonitorSmartphone className="w-4 h-4" aria-hidden />{course.modality}</li>
                      </ul>
                      <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                        Voir le programme <ArrowRight className="w-4 h-4" aria-hidden />
                      </span>
                    </Link>
                  </SpotlightCard>
                </Reveal>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Formations intra-entreprise sur devis. Programmes adaptables à un métier (RH, finance, commerce,
              juridique, opérations). Certification Qualiopi en préparation : formations non éligibles à ce jour
              au financement OPCO ou CPF.
            </p>
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <h2 className="text-h2 font-bold mb-8">Comment se déroule une formation</h2>
            <ol className="grid md:grid-cols-4 gap-6">
              {offer.steps.map((step, i) => (
                <li key={step.title} className="list-none">
                  <p className="text-sm font-semibold text-primary mb-1">Étape {i + 1}</p>
                  <h3 className="font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <FAQ items={[...offer.faq.filter((f) => !f.question.includes("OPCO")), ...FORMATIONS_FAQ]} />
      </main>
      <Footer />
    </div>
  );
}

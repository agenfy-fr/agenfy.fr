import Link from "next/link";
import { ArrowRight, GraduationCap, Workflow, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/effects";
import { COURSES } from "@/lib/courses";

export function FormationsTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-secondary/20" aria-labelledby="formations-title">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <p className="text-primary text-sm font-semibold uppercase tracking-wider mb-4">Formations IA</p>
          <h2 id="formations-title" className="text-h1 font-bold text-foreground mb-6">
            Des équipes qui savent <span className="gradient-text">vraiment</span> utiliser l&apos;IA
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Sessions pratiques sur les tâches de vos équipes, puis modules en ligne, quiz et
            ressources sur la plateforme Agenfy. Des fondamentaux de l&apos;IA générative jusqu&apos;aux
            agents IA et à l&apos;automatisation.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
            <Link href="/formations">
              Voir les formations
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </Reveal>
        <div className="space-y-4">
          {COURSES.map((course, i) => (
            <Reveal key={course.slug} delay={i * 0.1}>
              <Link
                href={course.path}
                className="group flex gap-4 rounded-2xl border border-border/60 bg-card/60 p-6 hover:border-primary/40 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 rounded-xl gradient-bg flex items-center justify-center">
                  {i === 0 ? (
                    <GraduationCap className="w-6 h-6 text-white" aria-hidden />
                  ) : (
                    <Workflow className="w-6 h-6 text-white" aria-hidden />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    {course.name}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden />
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {course.durationLabel} · {course.audience}
                  </p>
                </div>
              </Link>
            </Reveal>
          ))}
          <Reveal delay={0.3}>
            <Link
              href="/diagnostic-ia"
              className="group flex gap-4 rounded-2xl border border-dashed border-primary/40 p-6 hover:bg-primary/5 transition-colors"
            >
              <ClipboardCheck className="w-6 h-6 text-primary shrink-0" aria-hidden />
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">Pas sûr du bon niveau ?</span>{" "}
                Le diagnostic IA gratuit mesure la maturité de votre entreprise en 5 minutes.
              </p>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

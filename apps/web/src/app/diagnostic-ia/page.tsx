import { Header, Footer, FAQ } from "@/components/sections";
import { BackgroundBeams } from "@/components/effects";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { AXES, LEVELS, QUESTIONS } from "@/lib/diagnostic";
import { DiagnosticQuiz } from "./DiagnosticQuiz";
import { Illustration } from "@/components/effects/Illustration";

export const metadata = buildMetadata({
  title: "Diagnostic de maturité IA gratuit pour les entreprises",
  description: `Évaluez la maturité IA de votre entreprise en ${QUESTIONS.length} questions : score sur 100, niveau sur 5, détail sur 6 axes et priorités d'action. Résultat immédiat, sans inscription.`,
  path: "/diagnostic-ia",
  keywords: ["diagnostic IA", "maturité IA", "audit IA gratuit", "test maturité IA entreprise"],
});

const faq = [
  {
    question: "Comment est calculé le score de maturité IA ?",
    answer: `Chacune des ${QUESTIONS.length} questions est notée de 0 à 3. Le score global et le score de chaque axe (${AXES.map((a) => a.label.toLowerCase()).join(", ")}) sont ramenés sur 100. Le niveau dépend du score global : ${LEVELS.map((l) => `${l.name} à partir de ${l.min}`).join(", ")}.`,
  },
  {
    question: "Faut-il laisser ses coordonnées pour voir le résultat ?",
    answer:
      "Non. Le résultat s'affiche immédiatement et vos réponses restent dans votre navigateur. Vos coordonnées ne sont demandées que si vous souhaitez une restitution personnalisée avec un expert Agenfy.",
  },
  {
    question: "Ce diagnostic remplace-t-il un audit IA ?",
    answer:
      "Non. C'est une auto-évaluation qui donne une première photographie en quelques minutes. Un audit IA analyse les tâches réelles de vos équipes, métier par métier, et aboutit à une feuille de route chiffrée.",
  },
];

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="pt-20">
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <BackgroundBeams />
          <div className="relative max-w-3xl mx-auto px-6 lg:px-8">
            <Breadcrumbs crumbs={[{ name: "Diagnostic IA", path: "/diagnostic-ia" }]} />
            <h1 className="text-h1 sm:text-hero font-bold mb-4">
              <span className="text-foreground">Diagnostic de </span>
              <span className="gradient-text">maturité IA</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-10">
              {QUESTIONS.length} questions, environ 5 minutes. Obtenez votre score sur 100, votre niveau
              sur {LEVELS.length} et vos deux priorités d&apos;action, immédiatement et sans inscription.
            </p>
            <Illustration name="diagnostic" priority className="mb-12" />
            <DiagnosticQuiz />
          </div>
        </section>
        <FAQ items={faq} />
      </main>
      <Footer />
    </div>
  );
}

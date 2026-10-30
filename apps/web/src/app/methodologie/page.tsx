import Link from "next/link";
import { ArrowRight, Target, Users, Scale, GraduationCap, ShieldCheck, Lock, Gauge } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { FaqItem } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { getOffer } from "@/lib/offers";

export const metadata = buildMetadata({
  title: "Notre méthodologie IA : petit, mesurable, sécurisé",
  description:
    "Comment Agenfy mène un projet d'IA en PME et ETI : former, auditer, prototyper, industrialiser, mesurer. Nos principes, nos règles de confidentialité et notre façon d'évaluer un assistant IA.",
  path: "/methodologie",
  keywords: ["méthodologie projet IA", "déployer l'IA en entreprise", "évaluation assistant IA", "sécurité IA"],
});

const PRINCIPLES = [
  {
    icon: Target,
    title: "Commencer petit et mesurable",
    text: "Un premier cas d'usage précis, un indicateur défini avant de commencer et une décision explicite à la fin : on poursuit, on ajuste ou on arrête. Pas de programme de transformation de dix-huit mois avant le premier résultat.",
  },
  {
    icon: Users,
    title: "L'humain dans la boucle",
    text: "L'IA prépare, l'humain décide. Toute action engageante (envoyer, payer, valider, publier) passe par une validation humaine tant que la fiabilité n'est pas démontrée, et reste traçable ensuite.",
  },
  {
    icon: Scale,
    title: "Neutralité vis-à-vis des éditeurs",
    text: "Nous ne sommes rémunérés par aucun éditeur de modèle ou de logiciel. Nous recommandons l'outil adapté à votre contexte, y compris ceux que vous possédez déjà, et nous concevons des architectures qui permettent de changer de modèle.",
  },
  {
    icon: GraduationCap,
    title: "Transfert de compétences",
    text: "Vos équipes doivent pouvoir comprendre, utiliser et faire évoluer ce que nous livrons. Code, prompts, jeux d'évaluation et documentation vous appartiennent et vous sont remis.",
  },
  {
    icon: ShieldCheck,
    title: "Des données maîtrisées",
    text: "Nous savons à chaque étape quelles données circulent, où elles sont traitées et qui y a accès. Le minimum nécessaire, jamais plus, et des choix d'hébergement documentés.",
  },
];

const CYCLE = [
  {
    step: "Former",
    offer: "formation-ia",
    text: "Donner aux équipes et aux décideurs un socle commun : ce que l'IA sait faire, ce qu'elle ne sait pas faire, les bons réflexes de confidentialité. C'est aussi la réponse à l'obligation de maîtrise de l'IA prévue par l'AI Act. Des équipes formées identifient de meilleurs cas d'usage.",
  },
  {
    step: "Auditer",
    offer: "audit-strategie-ia",
    text: "Recenser les cas d'usage, évaluer leur valeur, leur faisabilité et leurs risques, vérifier l'état des données et des outils existants. Résultat : une feuille de route priorisée et un premier cas d'usage choisi pour son ratio valeur / effort.",
  },
  {
    step: "Prototyper",
    offer: "agents-ia",
    text: "Construire en quelques semaines une version utilisable sur de vraies données, testée par de vrais utilisateurs, avec un jeu d'évaluation défini dès le départ. Le prototype sert à décider, pas à impressionner.",
  },
  {
    step: "Industrialiser",
    offer: "developpement-ia",
    text: "Passer du prototype à un service fiable : intégration aux outils métier, gestion des droits, sécurité, supervision, maîtrise des coûts, documentation. C'est là que les fondations Data et Cloud font la différence.",
  },
  {
    step: "Mesurer",
    offer: "audit-strategie-ia",
    text: "Suivre en continu la qualité des réponses, l'adoption, le temps gagné et le coût d'exploitation, comparés à l'indicateur fixé au départ. Les résultats alimentent le cas d'usage suivant.",
  },
];

const SECURITY_RULES = [
  "Aucune donnée de client dans un outil d'IA grand public : uniquement des offres entreprise ou des API dont les conditions excluent l'usage de vos données pour l'entraînement.",
  "Hébergement dans l'Union européenne privilégié lorsque l'offre le permet ; quand ce n'est pas le cas, nous le signalons et documentons les transferts.",
  "Prototypes sur des données minimisées, pseudonymisées ou synthétiques chaque fois que c'est possible.",
  "Principe du moindre privilège : un assistant ou un agent n'accède qu'aux données et actions strictement nécessaires, en respectant les droits existants de chaque utilisateur.",
  "Secrets et clés d'API stockés dans un gestionnaire de secrets, jamais dans le code ni dans les prompts.",
  "Journalisation des actions des agents et des accès aux données, pour pouvoir expliquer chaque résultat.",
  "Engagement de confidentialité et, dès que nous traitons des données personnelles pour vous, un contrat de sous-traitance conforme à l'article 28 du RGPD.",
  "Réversibilité : tout ce qui est développé vous est remis, et les données qui nous ont été confiées sont supprimées ou restituées en fin de mission.",
];

const QUALITY = [
  {
    title: "Un jeu d'évaluation construit avec le métier",
    text: "Avant de développer, nous rassemblons avec vos experts des questions réelles et les réponses attendues, y compris des cas difficiles et des questions auxquelles l'assistant doit refuser de répondre.",
  },
  {
    title: "Des critères explicites",
    text: "Exactitude de la réponse, fidélité aux sources citées, pertinence des documents retrouvés, capacité à dire « je ne sais pas », respect du format, temps de réponse et coût par requête.",
  },
  {
    title: "Une notation automatisée, vérifiée par des humains",
    text: "Une partie de l'évaluation peut être automatisée, y compris par un modèle évaluateur, mais elle est calibrée et contrôlée régulièrement par une relecture humaine.",
  },
  {
    title: "Des tests de non-régression",
    text: "Chaque modification de prompt, de modèle ou de données est rejouée sur le jeu d'évaluation avant mise en production. On ne change pas de modèle « parce que le nouveau est meilleur » sans l'avoir vérifié sur vos cas.",
  },
  {
    title: "Des tests de robustesse",
    text: "Tentatives d'injection de prompt, demandes hors périmètre, documents contradictoires : nous vérifions que l'assistant résiste aux usages imprévus.",
  },
  {
    title: "Un suivi en production",
    text: "Retours des utilisateurs, taux d'escalade vers un humain, questions sans réponse : ces signaux enrichissent le jeu d'évaluation et orientent les améliorations.",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Faut-il forcément commencer par une formation ?",
    answer:
      "Non, le cycle s'adapte à votre point de départ. Si vos équipes utilisent déjà l'IA au quotidien, on peut démarrer par l'audit. Mais un socle commun de connaissances accélère presque toujours l'identification de bons cas d'usage et réduit les usages non encadrés.",
  },
  {
    question: "Combien de temps faut-il pour obtenir un premier résultat ?",
    answer:
      "L'objectif est un prototype testé sur vos données en quelques semaines après l'audit. La durée exacte dépend du cas d'usage, de l'accès aux données et de la disponibilité des équipes métier ; elle est fixée lors du cadrage.",
  },
  {
    question: "Que se passe-t-il si le prototype ne donne pas de bons résultats ?",
    answer:
      "C'est une issue normale et utile. Le jeu d'évaluation permet de savoir pourquoi : données insuffisantes, cas d'usage mal choisi, technologie pas encore assez mûre. Vous décidez alors d'ajuster ou d'arrêter, avant d'avoir engagé un budget d'industrialisation.",
  },
  {
    question: "Imposez-vous un modèle ou un éditeur d'IA ?",
    answer:
      "Non. Nous ne percevons aucune commission d'éditeur. Nous comparons les options (modèles propriétaires, open source, hébergés en Europe ou chez vous) sur vos cas d'usage et vos contraintes, et nous concevons l'architecture pour pouvoir changer de modèle plus tard.",
  },
  {
    question: "Nos données servent-elles à entraîner des modèles ?",
    answer:
      "Nous n'utilisons que des offres entreprise ou des API dont les conditions contractuelles excluent l'utilisation de vos données pour l'entraînement des modèles, et nous vérifions ces conditions pour chaque outil retenu.",
  },
  {
    question: "Comment savoir si un assistant IA est assez fiable pour être déployé ?",
    answer:
      "On le décide sur des faits : un seuil de qualité est fixé avec le métier sur le jeu d'évaluation avant le développement. Tant qu'il n'est pas atteint, l'assistant reste en test ou fonctionne avec une validation humaine systématique.",
  },
];

export default function MethodologiePage() {
  return (
    <PageLayout>
      <section className="py-20 lg:py-28 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs crumbs={[{ name: "Méthodologie", path: "/methodologie" }]} />
          <Reveal>
            <h1 className="text-hero font-bold mb-6">
              Notre <span className="gradient-text">méthodologie</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Agenfy mène chaque projet d&apos;IA selon un cycle en cinq temps (former, auditer, prototyper,
              industrialiser, mesurer) avec une règle simple : commencer par un cas d&apos;usage précis, fixer
              l&apos;indicateur de succès avant d&apos;écrire la moindre ligne de code, garder l&apos;humain dans la
              boucle et ne jamais perdre la maîtrise de vos données.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 bg-secondary/20" aria-labelledby="principes">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 id="principes" className="text-h1 font-bold mb-10">Nos principes</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {PRINCIPLES.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.05}>
                <Card className="h-full bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <p.icon className="w-6 h-6 text-primary mb-4" aria-hidden />
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{p.text}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="cycle">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <h2 id="cycle" className="text-h1 font-bold mb-4">
            Le cycle : Former → Auditer → Prototyper → Industrialiser → Mesurer
          </h2>
          <p className="text-muted-foreground mb-10 max-w-3xl">
            Chaque étape produit un livrable et une décision. Vous pouvez entrer dans le cycle à l&apos;étape qui
            correspond à votre maturité, et vous arrêter à chacune.
          </p>
          <ol className="space-y-4">
            {CYCLE.map((c, i) => {
              const offer = getOffer(c.offer);
              return (
                <li key={c.step} className="rounded-2xl border border-border/60 p-6 flex flex-col sm:flex-row gap-5">
                  <span
                    className="w-12 h-12 shrink-0 rounded-xl gradient-bg text-white font-bold flex items-center justify-center"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{c.step}</h3>
                    <p className="text-muted-foreground leading-relaxed mb-3">{c.text}</p>
                    <Link href={offer.path} className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline">
                      {offer.name}
                      <ArrowRight className="w-4 h-4" aria-hidden />
                    </Link>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="py-16 bg-secondary/20" aria-labelledby="securite">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="w-7 h-7 text-primary" aria-hidden />
            <h2 id="securite" className="text-h1 font-bold">Nos règles de sécurité et de confidentialité</h2>
          </div>
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Elles s&apos;appliquent à toutes nos missions, quel que soit leur périmètre. Elles s&apos;ajoutent à vos
            propres politiques de sécurité, qui priment toujours.
          </p>
          <ul className="grid md:grid-cols-2 gap-4">
            {SECURITY_RULES.map((rule) => (
              <li key={rule} className="flex gap-3 rounded-xl border border-border/60 bg-card/50 p-5 text-sm text-muted-foreground leading-relaxed">
                <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" aria-hidden />
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 lg:py-24" aria-labelledby="qualite">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-7 h-7 text-primary" aria-hidden />
            <h2 id="qualite" className="text-h1 font-bold">Comment nous mesurons la qualité d&apos;un assistant IA</h2>
          </div>
          <p className="text-muted-foreground mb-10 max-w-3xl">
            Un assistant IA ne se juge pas sur une démonstration réussie, mais sur sa performance mesurée sur vos
            cas réels, dans la durée.
          </p>
          <ol className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {QUALITY.map((q, i) => (
              <li key={q.title} className="list-none">
                <Card className="h-full bg-card/50 border-border/50">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-primary mb-2">{String(i + 1).padStart(2, "0")}</p>
                    <h3 className="text-lg font-semibold mb-2">{q.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{q.text}</p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-muted-foreground">
            Vocabulaire :{" "}
            <Link href="/glossaire/hallucination" className="text-primary hover:underline">hallucination</Link>,{" "}
            <Link href="/glossaire/rag" className="text-primary hover:underline">RAG</Link>,{" "}
            <Link href="/glossaire/mlops" className="text-primary hover:underline">MLOps</Link> : voir notre{" "}
            <Link href="/glossaire" className="text-primary hover:underline">glossaire de l&apos;IA</Link>.
          </p>
        </div>
      </section>

      <div className="bg-secondary/20">
        <FAQ items={FAQ_ITEMS} />
      </div>

      <section className="py-16 lg:py-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-h2 font-bold mb-4">Par où commencer ?</h2>
          <p className="text-muted-foreground mb-8">
            Un premier échange de 30 minutes suffit pour situer votre point de départ dans le cycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/contact">
                Parler de votre projet
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href={getOffer("audit-strategie-ia").path}>Découvrir l&apos;audit IA</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

import Link from "next/link";
import { ArrowRight, CalendarCheck, ExternalLink } from "lucide-react";
import { PageLayout } from "@/components/layouts";
import { Breadcrumbs } from "@/components/layouts/Breadcrumbs";
import { BackgroundBeams, Reveal } from "@/components/effects";
import { FAQ } from "@/components/sections";
import { Button } from "@/components/ui/button";
import { JsonLd, articleSchema, type FaqItem } from "@/components/schemas/JsonLd";
import { buildMetadata } from "@/lib/seo";
import { DEFAULT_AUTHOR } from "@/lib/site";
import { formatDateFr } from "@/lib/dates";
import { Illustration } from "@/components/effects/Illustration";

const PATH = "/comparatifs/chatgpt-claude-copilot-mistral-entreprise";
const PUBLISHED = "2026-10-29";
const UPDATED = "2026-10-29";
const TITLE = "ChatGPT, Claude, Copilot ou Mistral : quel assistant IA pour votre entreprise ?";
const DESCRIPTION =
  "Comparatif honnête des offres entreprise de ChatGPT, Claude, Microsoft 365 Copilot et Mistral : intégrations, hébergement des données, entraînement, points forts, limites et profil idéal.";

export const metadata = buildMetadata({
  title: "ChatGPT vs Claude vs Copilot vs Mistral en entreprise",
  description: DESCRIPTION,
  path: PATH,
  type: "article",
  publishedTime: PUBLISHED,
  modifiedTime: UPDATED,
  authors: [DEFAULT_AUTHOR.name],
  keywords: [
    "ChatGPT entreprise",
    "Claude entreprise",
    "Microsoft 365 Copilot",
    "Mistral Le Chat entreprise",
    "comparatif assistant IA",
    "quel assistant IA choisir",
  ],
});

interface Tool {
  name: string;
  editor: string;
  enterprise: string;
  suites: string;
  hosting: string;
  training: string;
  strengths: string;
  limits: string;
  profile: string;
}

const TOOLS: Tool[] = [
  {
    name: "ChatGPT",
    editor: "OpenAI (États-Unis)",
    enterprise: "ChatGPT Business (ex-Team), ChatGPT Enterprise, et l'API pour les intégrations sur mesure.",
    suites:
      "Connecteurs vers les principaux outils, dont Google Drive, Gmail, SharePoint, OneDrive et Outlook, selon l'offre et les réglages de l'administrateur.",
    hosting:
      "Résidence des données en Europe proposée pour ChatGPT Enterprise, Edu et l'API, sur les nouveaux espaces de travail. À vérifier pour l'offre Business.",
    training:
      "Non par défaut : les données des offres professionnelles et de l'API ne servent pas à l'entraînement, sauf accord explicite du client.",
    strengths:
      "Assistant très polyvalent, interface déjà familière à beaucoup d'utilisateurs, large éventail de fonctions (analyse de fichiers, recherche, images, assistants personnalisés, agents).",
    limits:
      "Offres et fonctionnalités qui évoluent très vite ; résidence européenne réservée à certaines offres ; éditeur soumis au droit américain.",
    profile: "Entreprises qui veulent un assistant généraliste pour tous les métiers, quel que soit leur environnement bureautique.",
  },
  {
    name: "Claude",
    editor: "Anthropic (États-Unis)",
    enterprise:
      "Claude Team, Claude Enterprise, et l'API, également disponible via Amazon Bedrock et Google Cloud Vertex AI.",
    suites:
      "Connecteur Microsoft 365 (SharePoint, OneDrive, Outlook, Teams) et connecteurs Google Workspace (Gmail, Agenda, Drive), plus tout outil exposé via le protocole MCP.",
    hosting:
      "Traitement principalement aux États-Unis pour l'offre directe. Des régions européennes sont accessibles pour les modèles via Amazon Bedrock ou Google Vertex AI.",
    training:
      "Non par défaut : les conditions commerciales excluent l'usage des données des offres Team, Enterprise et API pour l'entraînement.",
    strengths:
      "Rédaction et analyse de documents longs, qualité de raisonnement sur des textes complexes, outils de développement logiciel, à l'origine du protocole MCP.",
    limits:
      "Pas de résidence européenne garantie en offre directe à ce jour (passer par un cloud européen pour l'API) ; pas de génération d'images.",
    profile: "Équipes qui travaillent beaucoup sur des documents (juridique, conseil, R&D) et équipes techniques.",
  },
  {
    name: "Microsoft 365 Copilot",
    editor: "Microsoft (États-Unis)",
    enterprise:
      "Copilot Chat, accessible avec les comptes Microsoft 365 professionnels, et la licence Microsoft 365 Copilot, en complément d'un abonnement Microsoft 365.",
    suites:
      "Intégration native à Word, Excel, PowerPoint, Outlook et Teams, et accès aux données de l'entreprise via Microsoft Graph. Pas d'intégration native à Google Workspace.",
    hosting:
      "Service couvert par l'EU Data Boundary de Microsoft pour les clients européens, avec des exceptions documentées par l'éditeur.",
    training:
      "Non : selon Microsoft, les prompts, réponses et données accessibles via Microsoft Graph ne servent pas à entraîner les modèles de fondation.",
    strengths:
      "Aucun nouvel outil à adopter, respect des permissions Microsoft 365 existantes, administration et gouvernance dans l'environnement Microsoft.",
    limits:
      "Pertinent surtout si l'entreprise vit dans Microsoft 365 ; révèle immédiatement les défauts de droits de partage SharePoint ; la valeur dépend fortement de la formation des utilisateurs.",
    profile: "Organisations déjà standardisées sur Microsoft 365, en particulier les ETI dotées d'une DSI.",
  },
  {
    name: "Mistral",
    editor: "Mistral AI (France)",
    enterprise:
      "L'assistant Le Chat (renommé Vibe en 2026) en offres Team et Enterprise, l'API, et des modèles à poids ouverts déployables sur votre infrastructure.",
    suites:
      "Connecteurs Google Drive, Gmail, Google Agenda, SharePoint et OneDrive, et connecteurs personnalisés via MCP configurés par l'administrateur.",
    hosting:
      "Hébergement dans l'Union européenne par défaut selon l'éditeur ; l'offre entreprise peut aussi être déployée sur votre propre infrastructure.",
    training:
      "Non par défaut pour les offres Team, Enterprise et l'API payante, selon les conditions de l'éditeur.",
    strengths:
      "Éditeur européen soumis au droit de l'UE, option d'auto-hébergement, modèles ouverts pour des projets sur mesure.",
    limits:
      "Écosystème d'intégrations plus restreint que celui de Microsoft ou d'OpenAI ; qualité à comparer sur vos propres cas d'usage ; noms d'offres récemment modifiés.",
    profile:
      "Entreprises avec de fortes exigences de souveraineté ou de localisation des données, secteurs régulés, besoin d'auto-hébergement.",
  },
];

const ROWS: { key: keyof Tool; label: string }[] = [
  { key: "editor", label: "Éditeur" },
  { key: "enterprise", label: "Offre entreprise" },
  { key: "suites", label: "Intégration Microsoft 365 / Google" },
  { key: "hosting", label: "Hébergement et localisation des données" },
  { key: "training", label: "Données utilisées pour l'entraînement (offre entreprise) ?" },
  { key: "strengths", label: "Points forts" },
  { key: "limits", label: "Limites" },
  { key: "profile", label: "Pour quel profil" },
];

const SOURCES = [
  { label: "OpenAI : résidence des données en Europe", url: "https://openai.com/index/introducing-data-residency-in-europe/" },
  { label: "OpenAI : confidentialité des offres entreprise", url: "https://openai.com/enterprise-privacy/" },
  { label: "Anthropic : conditions commerciales", url: "https://www.anthropic.com/legal/commercial-terms" },
  {
    label: "Anthropic : connecteur Microsoft 365",
    url: "https://support.claude.com/en/articles/12542951-enabling-and-using-the-microsoft-365-connector",
  },
  {
    label: "Microsoft : protection des données d'entreprise dans Copilot",
    url: "https://learn.microsoft.com/en-us/copilot/microsoft-365/enterprise-data-protection",
  },
  { label: "Mistral AI : présentation de l'offre entreprise", url: "https://help.mistral.ai/en/articles/316363-what-is-le-chat-enterprise" },
  {
    label: "Mistral AI : localisation des données de l'API",
    url: "https://help.mistral.ai/en/articles/156206-when-using-mistral-ai-s-api-where-is-my-data-stored",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  {
    question: "Peut-on laisser les collaborateurs utiliser la version gratuite de ces assistants ?",
    answer:
      "Ce n'est pas recommandé pour des données professionnelles. Les versions grand public n'offrent pas les mêmes engagements contractuels (non-utilisation pour l'entraînement, administration, contrat de traitement des données) que les offres entreprise. Le plus sûr est de fournir un outil validé et une charte d'usage claire.",
  },
  {
    question: "Nos données servent-elles à entraîner les modèles ?",
    answer:
      "Pour les offres entreprise et les API des quatre éditeurs comparés, les conditions publiées indiquent que les données ne servent pas à l'entraînement par défaut. Vérifiez néanmoins le contrat de l'offre exacte que vous souscrivez, ainsi que la durée de conservation des données.",
  },
  {
    question: "Faut-il choisir un seul assistant pour toute l'entreprise ?",
    answer:
      "Pas forcément. Beaucoup d'organisations combinent un assistant généraliste pour tous et un outil plus spécialisé pour certaines équipes, ou passent par l'API pour leurs projets sur mesure. L'important est que chaque outil soit validé, administré et encadré.",
  },
  {
    question: "Quel assistant est le plus conforme au RGPD ?",
    answer:
      "Aucun outil n'est conforme « par nature » : la conformité dépend de votre usage, des données traitées, du contrat et du paramétrage. Un hébergement européen simplifie la question des transferts, mais il faut aussi une base légale, une information des personnes et une minimisation des données.",
  },
  {
    question: "Combien coûtent ces offres ?",
    answer:
      "Les tarifs changent fréquemment, varient selon le volume et l'engagement, et les offres Enterprise sont souvent négociées. Nous préférons ne pas publier de prix qui seraient vite obsolètes : consultez les pages tarifaires des éditeurs ou demandez un devis à leur service commercial.",
  },
  {
    question: "Et Google Gemini ?",
    answer:
      "Gemini est une option sérieuse, surtout pour les entreprises équipées de Google Workspace, où il est intégré aux applications bureautiques. Il n'est pas détaillé ici pour garder un comparatif lisible, mais les mêmes critères s'appliquent.",
  },
];

export default function ComparatifAssistantsPage() {
  return (
    <PageLayout>
      <JsonLd
        data={articleSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: PATH,
          datePublished: PUBLISHED,
          dateModified: UPDATED,
          author: DEFAULT_AUTHOR,
          section: "Comparatifs",
        })}
      />
      <section className="py-20 lg:py-24 relative overflow-hidden">
        <BackgroundBeams />
        <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
          <Breadcrumbs
            crumbs={[
              { name: "Comparatifs", path: "/comparatifs" },
              { name: "ChatGPT, Claude, Copilot, Mistral", path: PATH },
            ]}
          />
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-3">Comparatif</p>
            <h1 className="text-h1 font-bold mb-6">{TITLE}</h1>
            <p className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
              <CalendarCheck className="w-4 h-4" aria-hidden />
              Mis à jour le <time dateTime={UPDATED}>{formatDateFr(UPDATED)}</time> · par{" "}
              <Link href={`/auteurs/${DEFAULT_AUTHOR.slug}`} className="text-primary hover:underline" rel="author">
                {DEFAULT_AUTHOR.name}
              </Link>
            </p>

            {/* Direct answer block: the paragraph answer engines should quote. */}
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8">
              <h2 className="text-xl font-bold mb-3">Lequel choisir ? En résumé…</h2>
              <ul className="space-y-2 text-foreground/90 leading-relaxed">
                <li>
                  <strong>Votre entreprise vit dans Microsoft 365 :</strong> évaluez d&apos;abord Microsoft 365 Copilot,
                  intégré à vos outils et à vos permissions existantes.
                </li>
                <li>
                  <strong>Vous voulez un assistant généraliste pour tous les métiers :</strong> ChatGPT en offre
                  Business ou Enterprise.
                </li>
                <li>
                  <strong>Vos équipes travaillent surtout sur des documents longs ou du code :</strong> Claude en offre
                  Team ou Enterprise.
                </li>
                <li>
                  <strong>La souveraineté ou l&apos;auto-hébergement est prioritaire :</strong> Mistral.
                </li>
              </ul>
              <p className="mt-4 text-sm text-muted-foreground">
                Dans tous les cas : une offre entreprise plutôt qu&apos;un compte grand public, et un test de deux à
                quatre semaines sur vos propres cas d&apos;usage avant de généraliser.
              </p>
            </div>
          </Reveal>
          <Illustration name="comparatifs" priority className="mt-12" />
        </div>
      </section>

      <section className="py-12" aria-labelledby="tableau">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <h2 id="tableau" className="text-h2 font-bold mb-3">Le tableau comparatif</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
            Informations issues de la documentation publique des éditeurs, vérifiées à la date de mise à jour. Les
            offres évoluent vite : confirmez toujours les conditions contractuelles de l&apos;offre exacte que vous
            envisagez.
          </p>
          <div className="overflow-x-auto rounded-xl border border-border/60">
            <table className="w-full min-w-[56rem] text-sm align-top">
              <caption className="sr-only">
                Comparaison des offres entreprise de ChatGPT, Claude, Microsoft 365 Copilot et Mistral
              </caption>
              <thead className="bg-secondary/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold w-48">
                    Critère
                  </th>
                  {TOOLS.map((t) => (
                    <th key={t.name} scope="col" className="px-4 py-3 text-left font-semibold text-foreground">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {ROWS.map((row) => (
                  <tr key={row.key}>
                    <th scope="row" className="px-4 py-3 text-left font-semibold text-foreground align-top">
                      {row.label}
                    </th>
                    {TOOLS.map((t) => (
                      <td key={t.name} className="px-4 py-3 text-muted-foreground leading-relaxed align-top">
                        {t[row.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs text-muted-foreground sm:hidden">Faites défiler le tableau horizontalement.</p>
        </div>
      </section>

      <section className="py-12 bg-secondary/20">
        <div className="max-w-3xl mx-auto px-6 lg:px-8 space-y-10">
          <div>
            <h2 className="text-h2 font-bold mb-4">Les critères qui comptent vraiment</h2>
            <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-5">
              <li>
                <strong className="text-foreground">Vos outils actuels.</strong> Un assistant qui accède à vos
                documents et à votre messagerie sera bien plus utile qu&apos;un assistant isolé. Partez de votre suite
                bureautique.
              </li>
              <li>
                <strong className="text-foreground">Vos données.</strong> Quelles informations les équipes vont-elles
                réellement partager avec l&apos;outil ? C&apos;est ce qui détermine vos exigences d&apos;hébergement et
                de contrat.
              </li>
              <li>
                <strong className="text-foreground">Vos cas d&apos;usage.</strong> Les écarts de qualité entre modèles
                varient selon les tâches. Testez sur vos documents, avec vos utilisateurs, plutôt que de vous fier aux
                classements publics.
              </li>
              <li>
                <strong className="text-foreground">L&apos;adoption.</strong> Sans formation, la plupart des licences
                restent sous-utilisées. Prévoyez l&apos;accompagnement dans le budget, quel que soit l&apos;outil.
              </li>
              <li>
                <strong className="text-foreground">La réversibilité.</strong> Pour vos projets sur mesure, une
                architecture qui permet de changer de modèle vous protège des évolutions de prix et d&apos;offres.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-h2 font-bold mb-4">Ce que nous recommandons</h2>
            <p className="text-muted-foreground leading-relaxed">
              Agenfy n&apos;est revendeur d&apos;aucun de ces outils. Notre conseil le plus fréquent : ne pas choisir
              sur catalogue. Sélectionnez deux candidats, définissez trois à cinq cas d&apos;usage réels et un petit
              groupe pilote, mesurez la qualité et l&apos;adoption, puis décidez. Une{" "}
              <Link href="/glossaire/shadow-ai" className="text-primary hover:underline">
                charte d&apos;usage
              </Link>{" "}
              et une formation courte accompagnent le déploiement.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild size="lg" className="rounded-full px-8 gradient-btn border-0">
              <Link href="/services/audit-strategie-ia">
                Être accompagné dans le choix
                <ArrowRight className="ml-2 w-5 h-5" aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-8">
              <Link href="/formations">Former vos équipes</Link>
            </Button>
          </div>
        </div>
      </section>

      <FAQ items={FAQ_ITEMS} />

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <h2 className="text-lg font-semibold mb-3">Sources</h2>
          <ul className="space-y-1.5 text-sm">
            {SOURCES.map((s) => (
              <li key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline"
                >
                  {s.label}
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden />
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            ChatGPT, Claude, Microsoft 365 Copilot, Mistral et Gemini sont des marques de leurs détenteurs respectifs.
            Ce comparatif est indépendant et n&apos;est sponsorisé par aucun éditeur.
          </p>
        </div>
      </section>
    </PageLayout>
  );
}

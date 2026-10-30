import type { LucideIcon } from "lucide-react";
import { Compass, Bot, Brain, GraduationCap, Database, Cloud } from "lucide-react";
import type { FaqItem } from "@/components/schemas/JsonLd";

// IA-first offer catalogue. Single source for navigation, homepage, service pages,
// FAQ JSON-LD and llms.txt. Durations are typical ranges, not contractual commitments.
// `pricing` stays null until public price ranges are validated (shown as "Sur devis").

export interface OfferStep {
  title: string;
  duration?: string;
  description: string;
}

export interface Offer {
  slug: string;
  path: string;
  name: string;
  navLabel: string;
  group: "ia" | "foundations";
  icon: LucideIcon;
  tagline: string;
  /** 40-60 word direct answer, written to be quoted as-is by answer engines. */
  summary: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  forWho: string[];
  deliverables: string[];
  steps: OfferStep[];
  whenToUse: string[];
  whenNotToUse: string[];
  technologies: string[];
  pricing: string | null;
  faq: FaqItem[];
  related: string[];
}

export const OFFERS: Offer[] = [
  {
    slug: "audit-strategie-ia",
    path: "/services/audit-strategie-ia",
    name: "Audit & stratégie IA",
    navLabel: "Audit & stratégie IA",
    group: "ia",
    icon: Compass,
    tagline: "Savoir où l'IA crée de la valeur chez vous, et par où commencer",
    summary:
      "L'audit IA d'Agenfy identifie, métier par métier, les tâches où l'IA générative ou l'automatisation fait gagner du temps ou de la qualité, les priorise selon la valeur et la faisabilité, et livre une feuille de route chiffrée : cas d'usage, outils recommandés, risques (RGPD, AI Act) et plan de formation.",
    metaTitle: "Audit IA et stratégie IA pour PME et ETI",
    metaDescription:
      "Audit IA : cartographie des cas d'usage, priorisation valeur/faisabilité, choix des outils (ChatGPT, Claude, Copilot, Mistral), conformité RGPD/AI Act et feuille de route.",
    keywords: ["audit IA", "stratégie IA", "diagnostic IA entreprise", "cas d'usage IA", "feuille de route IA"],
    forWho: [
      "Dirigeants qui veulent un plan IA concret plutôt qu'une veille dispersée",
      "Directions métier (finance, RH, commerce, opérations) qui testent déjà ChatGPT sans cadre",
      "DSI qui doivent arbitrer entre outils du marché et développements sur mesure",
    ],
    deliverables: [
      "Cartographie des cas d'usage par métier, notés valeur × faisabilité",
      "Recommandation d'outils (licences du marché vs. développement sur mesure)",
      "Analyse des risques : données, confidentialité, RGPD, AI Act",
      "Feuille de route à 90 jours et estimation des gains",
      "Plan de formation des équipes",
    ],
    steps: [
      { title: "Cadrage", duration: "1 semaine", description: "Objectifs, périmètre, interlocuteurs, état des outils et des données." },
      { title: "Ateliers métier", duration: "1 à 2 semaines", description: "Observation des tâches réelles, collecte des irritants, premiers tests en direct avec les équipes." },
      { title: "Priorisation", duration: "quelques jours", description: "Scoring valeur × faisabilité × risque, choix des quick wins et des chantiers structurants." },
      { title: "Restitution", duration: "1 demi-journée", description: "Feuille de route, budget, plan de formation et prochaines étapes actionnables." },
    ],
    whenToUse: [
      "Vos équipes utilisent l'IA chacune de leur côté, sans règles ni mesure",
      "Vous devez choisir entre plusieurs outils ou prestataires IA",
      "Vous voulez un budget et un ordre de priorité avant d'investir",
    ],
    whenNotToUse: [
      "Le cas d'usage est déjà clair et validé : passez directement à un prototype",
      "Vous cherchez uniquement à former vos équipes à un outil : une formation suffit",
    ],
    technologies: ["ChatGPT Enterprise", "Claude", "Microsoft Copilot", "Mistral AI", "n8n", "Make"],
    pricing: null,
    faq: [
      {
        question: "Combien de temps dure un audit IA ?",
        answer:
          "Généralement 3 à 5 semaines selon le nombre de métiers couverts : une semaine de cadrage, une à deux semaines d'ateliers, puis la priorisation et la restitution.",
      },
      {
        question: "Faut-il déjà avoir des données propres pour un audit IA ?",
        answer:
          "Non. Beaucoup de gains de l'IA générative (rédaction, synthèse, recherche documentaire) ne demandent pas de projet data. L'audit identifie justement les cas qui en ont besoin et ceux qui n'en ont pas besoin.",
      },
      {
        question: "L'audit IA est-il neutre vis-à-vis des éditeurs ?",
        answer:
          "Oui. Agenfy ne touche pas de commission sur les licences recommandées dans l'audit et compare ChatGPT, Claude, Copilot et Mistral selon vos contraintes (confidentialité, intégration Microsoft 365, coût par utilisateur).",
      },
    ],
    related: ["agents-ia", "formation-ia"],
  },
  {
    slug: "agents-ia",
    path: "/services/agents-ia",
    name: "Agents IA & automatisation",
    navLabel: "Agents IA & automatisation",
    group: "ia",
    icon: Bot,
    tagline: "Des agents IA qui exécutent les tâches répétitives, sous contrôle humain",
    summary:
      "Agenfy conçoit des agents IA et des automatisations (n8n, Make, Model Context Protocol) qui traitent des tâches répétitives de bout en bout : qualification de leads, traitement d'e-mails et de documents, reporting, support. Chaque agent est connecté à vos outils, journalisé, et garde un humain dans la boucle sur les décisions sensibles.",
    metaTitle: "Agents IA et automatisation IA (n8n, Make, MCP)",
    metaDescription:
      "Création d'agents IA et d'automatisations pour PME et ETI : n8n, Make, Claude, OpenAI, Model Context Protocol. Connexion à vos outils, supervision humaine, mesure du temps gagné.",
    keywords: ["agent IA entreprise", "automatisation IA", "n8n", "Make", "MCP", "agent IA PME"],
    forWho: [
      "Équipes qui passent des heures sur des tâches répétitives entre plusieurs outils",
      "PME qui veulent automatiser sans recruter une équipe tech",
      "Entreprises qui ont validé un cas d'usage IA et veulent le mettre en production",
    ],
    deliverables: [
      "Agent IA ou workflow en production, connecté à vos outils (CRM, messagerie, ERP, drive)",
      "Garde-fous : validation humaine, journalisation, limites d'action",
      "Tableau de bord du volume traité et du temps gagné",
      "Documentation et passation à vos équipes",
    ],
    steps: [
      { title: "Choix du processus", duration: "1 semaine", description: "Un processus précis, mesurable, avec un responsable métier identifié." },
      { title: "Prototype", duration: "2 à 3 semaines", description: "Agent fonctionnel sur données réelles, testé avec les utilisateurs." },
      { title: "Mise en production", duration: "2 à 4 semaines", description: "Sécurité, gestion des erreurs, supervision, formation des utilisateurs." },
      { title: "Amélioration continue", description: "Suivi des métriques, ajustement des prompts et extension à d'autres processus." },
    ],
    whenToUse: [
      "Une tâche répétitive revient chaque jour et suit des règles explicables",
      "L'information circule à la main entre plusieurs outils",
      "Le volume augmente plus vite que l'équipe",
    ],
    whenNotToUse: [
      "La tâche demande un jugement critique sans possibilité de relecture humaine",
      "Le processus change chaque semaine : stabilisez-le d'abord",
    ],
    technologies: ["n8n", "Make", "Claude", "OpenAI", "Model Context Protocol", "Python", "Supabase"],
    pricing: null,
    faq: [
      {
        question: "Quelle différence entre un agent IA et une automatisation classique ?",
        answer:
          "Une automatisation classique suit des règles fixes (si X alors Y). Un agent IA utilise un modèle de langage pour comprendre un contenu non structuré (e-mail, document, demande) et choisir l'action adaptée parmi celles qu'on l'autorise à faire.",
      },
      {
        question: "Mes données sont-elles envoyées à OpenAI ou Anthropic ?",
        answer:
          "Cela dépend de l'architecture retenue. Agenfy privilégie les offres API sans réutilisation des données pour l'entraînement, l'hébergement européen quand il est disponible, et peut utiliser des modèles hébergés en France (Mistral) ou en interne pour les données sensibles.",
      },
      {
        question: "n8n ou Make : lequel choisir ?",
        answer:
          "Make est plus rapide à prendre en main pour des workflows simples. n8n peut être auto-hébergé, ce qui facilite la maîtrise des données, et se prête mieux aux agents IA complexes. Le choix dépend de vos contraintes de données et de qui maintiendra les workflows.",
      },
    ],
    related: ["developpement-ia", "audit-strategie-ia"],
  },
  {
    slug: "developpement-ia",
    path: "/services/intelligence-artificielle",
    name: "Développement IA sur mesure",
    navLabel: "Développement IA (RAG, LLM)",
    group: "ia",
    icon: Brain,
    tagline: "Assistants métiers, RAG et applications IA intégrées à votre SI",
    summary:
      "Agenfy développe des applications d'IA sur mesure quand les outils du marché ne suffisent pas : assistants qui répondent à partir de vos documents (RAG), extraction de données dans des documents, classification, copilotes intégrés à vos applications. Le code et les données vous appartiennent, et la qualité des réponses est mesurée avant la mise en production.",
    metaTitle: "Développement IA sur mesure : RAG, LLM, IA générative",
    metaDescription:
      "Développement d'applications IA sur mesure : RAG sur vos documents, assistants métiers, extraction de documents, LLM (Claude, GPT, Mistral), évaluation et MLOps.",
    keywords: ["développement IA", "RAG entreprise", "LLM entreprise", "IA générative sur mesure", "assistant IA interne"],
    forWho: [
      "Entreprises avec une base documentaire importante (procédures, contrats, fiches produit)",
      "Éditeurs et équipes produit qui veulent intégrer l'IA dans leur application",
      "Organisations aux contraintes de confidentialité qui excluent les outils grand public",
    ],
    deliverables: [
      "Application ou API IA en production, intégrée à votre SI",
      "Jeu d'évaluation : questions de test et mesure de la qualité des réponses",
      "Infrastructure documentée (cloud ou on-premise) et coûts d'exploitation estimés",
      "Code source et propriété intellectuelle transférés",
    ],
    steps: [
      { title: "Cadrage et données", duration: "1 à 2 semaines", description: "Cas d'usage, sources documentaires, contraintes de sécurité, critères de qualité." },
      { title: "Preuve de concept", duration: "3 à 6 semaines", description: "Premier assistant sur un périmètre restreint, évalué sur des questions réelles." },
      { title: "Industrialisation", duration: "4 à 8 semaines", description: "Intégration, droits d'accès, supervision, maîtrise des coûts." },
      { title: "Run", description: "Suivi qualité, mise à jour des modèles et des sources." },
    ],
    whenToUse: [
      "Les réponses doivent s'appuyer sur vos propres documents, avec citation des sources",
      "L'IA doit s'intégrer dans une application ou un processus existant",
      "Vos contraintes de confidentialité excluent les outils grand public",
    ],
    whenNotToUse: [
      "Une licence ChatGPT, Claude ou Copilot couvre déjà le besoin : commencez par là",
      "Les documents sources sont introuvables ou obsolètes : un chantier data vient d'abord",
    ],
    technologies: ["Claude", "OpenAI", "Mistral AI", "LangChain", "pgvector", "Python", "TypeScript"],
    pricing: null,
    faq: [
      {
        question: "Qu'est-ce que le RAG ?",
        answer:
          "Le RAG (Retrieval-Augmented Generation) consiste à rechercher les passages pertinents dans vos documents puis à les fournir au modèle de langage pour qu'il réponde en s'appuyant dessus. Cela réduit les inventions et permet de citer la source de chaque réponse.",
      },
      {
        question: "Faut-il entraîner un modèle sur nos données ?",
        answer:
          "Rarement. Dans la majorité des cas, un modèle existant combiné à du RAG et à de bonnes instructions suffit, pour un coût et un délai bien inférieurs à un entraînement (fine-tuning).",
      },
      {
        question: "Comment mesurez-vous la qualité d'un assistant IA ?",
        answer:
          "Avec un jeu de questions de référence validé par vos experts métier : on mesure le taux de réponses correctes, sourcées et sans invention, avant chaque mise en production.",
      },
    ],
    related: ["agents-ia", "data"],
  },
  {
    slug: "formation-ia",
    path: "/formations",
    name: "Formation IA",
    navLabel: "Formations IA",
    group: "ia",
    icon: GraduationCap,
    tagline: "Former vos équipes à utiliser l'IA, outil par outil et métier par métier",
    summary:
      "Agenfy forme les équipes à l'IA générative avec des sessions pratiques sur leurs propres tâches : fondamentaux et prompting, ChatGPT, Claude, Copilot et Mistral, puis automatisation et agents IA pour les profils opérationnels. Chaque parcours combine sessions en direct et modules en ligne sur la plateforme app.agenfy.fr.",
    metaTitle: "Formation IA pour entreprises : ChatGPT, Claude, Copilot, agents",
    metaDescription:
      "Formations IA générative pour les équipes : prompting, ChatGPT, Claude, Copilot, Mistral, automatisation et agents IA. Sessions pratiques et plateforme e-learning.",
    keywords: ["formation IA entreprise", "formation ChatGPT entreprise", "formation Claude", "formation Copilot", "formation IA générative"],
    forWho: [
      "Équipes métier qui découvrent l'IA générative ou l'utilisent sans méthode",
      "Managers qui doivent encadrer l'usage de l'IA dans leur équipe",
      "Profils opérationnels et tech qui veulent automatiser avec des agents",
    ],
    deliverables: [
      "Sessions pratiques sur des cas issus de vos métiers",
      "Accès à la plateforme app.agenfy.fr : modules, quiz, ressources",
      "Bibliothèque de prompts et de cas d'usage réutilisables",
      "Évaluation des acquis et attestation de fin de formation",
    ],
    steps: [
      { title: "Positionnement", description: "Questionnaire d'entrée pour adapter le contenu au niveau réel des participants." },
      { title: "Session en direct", duration: "1 jour", description: "Pratique guidée sur les tâches des participants, en présentiel ou à distance." },
      { title: "E-learning", description: "Modules courts et exercices sur la plateforme pour ancrer les pratiques." },
      { title: "Évaluation", description: "Quiz, questionnaire de satisfaction à chaud puis à froid, attestation." },
    ],
    whenToUse: [
      "Vous déployez ChatGPT, Claude ou Copilot et voulez qu'ils soient réellement utilisés",
      "Vous voulez des règles communes d'usage (confidentialité, vérification)",
    ],
    whenNotToUse: [
      "Vous n'avez pas encore décidé quels outils autoriser : commencez par un audit IA",
    ],
    technologies: ["ChatGPT", "Claude", "Microsoft Copilot", "Mistral Vibe (ex-Le Chat)", "n8n"],
    pricing: null,
    faq: [
      {
        question: "Les formations IA d'Agenfy sont-elles finançables par un OPCO ?",
        answer:
          "Pas encore : la certification Qualiopi d'Agenfy est en préparation. Les formations sont aujourd'hui facturées directement à l'entreprise. Cette réponse sera mise à jour dès l'obtention de la certification.",
      },
      {
        question: "Les formations ont-elles lieu sur place ou à distance ?",
        answer:
          "Les deux : sessions en présentiel dans vos locaux ou à distance, complétées par des modules en ligne sur app.agenfy.fr.",
      },
      {
        question: "Faut-il des connaissances techniques ?",
        answer:
          "Non pour les formations aux fondamentaux et aux outils (ChatGPT, Claude, Copilot). La formation automatisation et agents IA s'adresse à des profils à l'aise avec les outils numériques, sans exiger de savoir coder.",
      },
    ],
    related: ["audit-strategie-ia", "agents-ia"],
  },
  {
    slug: "data",
    path: "/services/data",
    name: "Fondations Data",
    navLabel: "Data engineering",
    group: "foundations",
    icon: Database,
    tagline: "Des données fiables pour que l'IA ait quelque chose de juste à dire",
    summary:
      "Un projet IA ne vaut que par les données qu'il exploite. Agenfy construit des fondations data modernes : centralisation des sources, pipelines fiables (dbt, Airflow), entrepôt ou lakehouse, gouvernance et qualité, tableaux de bord, pour que vos décisions et vos assistants IA s'appuient sur des données justes et à jour.",
    metaTitle: "Data engineering : fondations data pour l'IA",
    metaDescription:
      "Data engineering pour PME et ETI : pipelines ETL/ELT, dbt, Airflow, Snowflake, BigQuery, Data Lakehouse, gouvernance et qualité des données, préalable aux projets IA.",
    keywords: ["data engineering", "data lakehouse", "dbt", "pipeline de données", "gouvernance des données"],
    forWho: [
      "Entreprises dont les chiffres diffèrent selon l'outil ou le service qui les produit",
      "Équipes qui préparent un projet IA sur leurs données internes",
    ],
    deliverables: [
      "Architecture data documentée",
      "Pipelines automatisés et testés",
      "Référentiel de qualité et de gouvernance",
      "Tableaux de bord métier",
    ],
    steps: [
      { title: "Audit des sources", description: "Inventaire, qualité, accès, usages actuels." },
      { title: "Architecture cible", description: "Choix de la plateforme selon volume, budget et compétences internes." },
      { title: "Construction", description: "Pipelines, modèles de données, tests de qualité." },
      { title: "Exploitation", description: "Supervision, documentation, montée en compétence des équipes." },
    ],
    whenToUse: [
      "Vos données sont dispersées entre ERP, CRM, fichiers Excel et outils SaaS",
      "Un projet IA a besoin de données internes fiables",
    ],
    whenNotToUse: ["Le besoin se limite à un tableau de bord sur une seule source : un outil BI suffit"],
    technologies: ["dbt", "Airflow", "Snowflake", "BigQuery", "Databricks", "PostgreSQL"],
    pricing: null,
    faq: [
      {
        question: "Faut-il un data warehouse avant de faire de l'IA ?",
        answer:
          "Pas toujours. L'IA générative appliquée à des documents ou des e-mails n'en a pas besoin. En revanche, dès qu'un agent ou un assistant doit exploiter vos chiffres (ventes, stocks, clients), des données centralisées et fiables deviennent indispensables.",
      },
    ],
    related: ["developpement-ia", "cloud"],
  },
  {
    slug: "cloud",
    path: "/services/cloud",
    name: "Fondations Cloud",
    navLabel: "Cloud & infrastructure",
    group: "foundations",
    icon: Cloud,
    tagline: "Une infrastructure sécurisée et maîtrisée pour héberger vos usages IA",
    summary:
      "Agenfy conçoit et opère l'infrastructure qui héberge vos données et vos applications IA : architecture cloud (AWS, Azure, GCP ou cloud souverain), migration, Kubernetes, CI/CD et maîtrise des coûts (FinOps), avec une attention particulière à la localisation des données et à la sécurité.",
    metaTitle: "Cloud et infrastructure pour l'IA : architecture, migration, FinOps",
    metaDescription:
      "Architecture cloud AWS, Azure, GCP et cloud souverain, migration, Kubernetes, CI/CD et FinOps pour héberger données et applications IA en sécurité.",
    keywords: ["infrastructure cloud", "migration cloud", "FinOps", "Kubernetes", "cloud souverain IA"],
    forWho: [
      "Entreprises qui hébergent des applications IA et veulent maîtriser coûts et sécurité",
      "Équipes qui migrent vers le cloud ou entre fournisseurs",
    ],
    deliverables: [
      "Architecture cible et infrastructure as code (Terraform)",
      "Pipelines CI/CD et supervision",
      "Rapport FinOps et plan d'optimisation des coûts",
    ],
    steps: [
      { title: "État des lieux", description: "Inventaire, coûts, sécurité, contraintes de localisation des données." },
      { title: "Conception", description: "Architecture cible et plan de migration." },
      { title: "Déploiement", description: "Infrastructure as code, CI/CD, supervision." },
      { title: "Optimisation", description: "Suivi des coûts et de la performance." },
    ],
    whenToUse: [
      "Vos coûts cloud augmentent sans visibilité",
      "Vous devez héberger des modèles ou des données sensibles en Europe",
    ],
    whenNotToUse: ["Votre usage de l'IA se limite à des licences SaaS : aucune infrastructure n'est nécessaire"],
    technologies: ["AWS", "Azure", "Google Cloud", "OVHcloud", "Kubernetes", "Terraform"],
    pricing: null,
    faq: [
      {
        question: "Peut-on utiliser l'IA générative en gardant les données en France ?",
        answer:
          "Oui : avec des modèles hébergés par des fournisseurs européens (par exemple Mistral AI), des régions cloud européennes des grands fournisseurs, ou des modèles open source hébergés sur votre propre infrastructure.",
      },
    ],
    related: ["data", "developpement-ia"],
  },
];

export const IA_OFFERS = OFFERS.filter((o) => o.group === "ia");
export const FOUNDATION_OFFERS = OFFERS.filter((o) => o.group === "foundations");

export function getOffer(slug: string): Offer {
  const offer = OFFERS.find((o) => o.slug === slug);
  if (!offer) throw new Error(`Unknown offer: ${slug}`);
  return offer;
}

import { SITE, absoluteUrl } from "@/lib/site";

// AI glossary for decision makers. Each `definition` is a 40-60 word direct answer,
// written to be quoted as-is by answer engines. No unsourced figures.
// `offer` is an offer slug from `@/lib/offers`; `related` are glossary slugs;
// `articles` are blog post slugs from `@/lib/blog-posts`.

export interface NotToConfuse {
  term: string;
  explanation: string;
}

export interface GlossaryTerm {
  slug: string;
  term: string;
  alternateNames?: string[];
  definition: string;
  whyItMatters: string;
  example: string;
  notToConfuse: NotToConfuse[];
  related: string[];
  offer: string;
  articles?: string[];
}

export const GLOSSARY_UPDATED = "2026-10-29";

export const GLOSSARY: GlossaryTerm[] = [
  {
    slug: "ia-generative",
    term: "IA générative",
    alternateNames: ["Generative AI", "GenAI"],
    definition:
      "L'IA générative désigne les systèmes d'intelligence artificielle capables de produire un contenu nouveau (texte, image, code, son ou vidéo) à partir d'une instruction en langage naturel. Elle repose sur des modèles entraînés sur de très grands volumes de données, qui apprennent les régularités de ces contenus pour en générer de plausibles.",
    whyItMatters:
      "Elle touche la plupart des métiers de bureau : rédaction, synthèse de documents, recherche d'information, assistance au code, support client. Le gain réel ne vient pas de l'outil seul mais de son intégration dans un processus précis, avec des données adaptées et une vérification humaine des résultats.",
    example:
      "Un service client fait rédiger par l'IA un brouillon de réponse à partir de l'historique du ticket et de la base de connaissances ; le conseiller relit, corrige et envoie. Le temps de rédaction baisse, la responsabilité de la réponse reste humaine.",
    notToConfuse: [
      {
        term: "IA prédictive",
        explanation:
          "L'IA « classique » (machine learning) prédit une valeur ou une catégorie : un score de risque, une prévision de ventes. L'IA générative, elle, produit un contenu.",
      },
    ],
    related: ["llm", "prompt", "hallucination", "shadow-ai"],
    offer: "audit-strategie-ia",
    articles: ["ia-generative-entreprise"],
  },
  {
    slug: "llm",
    term: "LLM (grand modèle de langage)",
    alternateNames: ["Large Language Model", "Grand modèle de langage"],
    definition:
      "Un LLM (Large Language Model) est un réseau de neurones entraîné sur d'immenses corpus de textes à prédire la suite la plus probable d'une séquence. À grande échelle, cette capacité lui permet de rédiger, résumer, traduire, classer, raisonner sur un texte ou écrire du code. GPT, Claude, Gemini, Mistral et Llama sont des familles de LLM.",
    whyItMatters:
      "Le LLM est la brique de base de la plupart des assistants et agents IA. Choisir un modèle revient à arbitrer entre qualité sur vos tâches, coût, latence, hébergement des données et conditions contractuelles. Aucun modèle n'est le meilleur partout : on compare sur ses propres cas d'usage.",
    example:
      "Un LLM lit chaque e-mail entrant, identifie le type de demande (réclamation, devis, facturation) et extrait les informations utiles (numéro de commande, date, produit) pour pré-remplir le ticket dans l'outil de support.",
    notToConfuse: [
      {
        term: "Chatbot ou assistant",
        explanation:
          "ChatGPT, Claude ou Le Chat sont des produits : une interface qui embarque un ou plusieurs LLM, plus des outils (recherche web, connecteurs, mémoire).",
      },
    ],
    related: ["token", "fenetre-de-contexte", "fine-tuning", "ia-generative"],
    offer: "developpement-ia",
  },
  {
    slug: "prompt",
    term: "Prompt",
    alternateNames: ["Invite", "Prompt engineering"],
    definition:
      "Un prompt est l'instruction transmise à un modèle d'IA générative : la question, la consigne, le contexte, les exemples et le format de réponse attendu. Sa précision influence fortement la pertinence du résultat. Le prompt engineering est la pratique qui consiste à concevoir, tester et améliorer ces instructions de façon méthodique.",
    whyItMatters:
      "C'est la compétence d'usage la plus immédiate pour les équipes. Des modèles de prompts partagés produisent une qualité plus homogène que des essais individuels. Dans une application, le prompt système fait partie du code : il se versionne, se teste et se fait évoluer comme le reste.",
    example:
      "Une équipe partage un modèle de prompt pour ses comptes rendus de réunion : rôle attendu, structure imposée (décisions, actions, responsables, échéances), ton et longueur. Chacun obtient le même format, quel que soit son niveau d'aisance avec l'outil.",
    notToConfuse: [
      {
        term: "Fine-tuning",
        explanation:
          "Le fine-tuning modifie le modèle lui-même par un entraînement complémentaire ; le prompt ne change que ce qu'on lui donne en entrée.",
      },
    ],
    related: ["llm", "fenetre-de-contexte", "hallucination", "copilote"],
    offer: "formation-ia",
  },
  {
    slug: "rag",
    term: "RAG (génération augmentée par la recherche)",
    alternateNames: ["Retrieval-Augmented Generation"],
    definition:
      "Le RAG (Retrieval-Augmented Generation) est une architecture qui, avant de faire répondre un LLM, recherche les passages pertinents dans une base documentaire et les lui fournit comme contexte. Le modèle répond ainsi à partir de vos documents à jour, en pouvant citer ses sources, sans avoir été réentraîné.",
    whyItMatters:
      "C'est l'architecture la plus courante pour rendre l'IA utile sur les connaissances internes : procédures, contrats, documentation produit, base de tickets. Bien conçu, un RAG limite les hallucinations, permet de vérifier chaque réponse via ses sources et peut respecter les droits d'accès existants.",
    example:
      "Un assistant pour les techniciens SAV répond aux questions à partir des manuels et des notes techniques, avec un lien vers la page source. Quand l'information n'existe pas dans les documents, il le dit au lieu d'improviser.",
    notToConfuse: [
      {
        term: "Fine-tuning",
        explanation:
          "Le RAG apporte des connaissances au moment de la question ; le fine-tuning ajuste le comportement du modèle et se prête mal à l'ajout de faits qui changent souvent.",
      },
      {
        term: "Recherche documentaire classique",
        explanation:
          "Un moteur de recherche renvoie une liste de documents ; un RAG rédige une réponse synthétique à partir des passages retrouvés.",
      },
    ],
    related: ["embedding", "base-vectorielle", "hallucination", "fine-tuning"],
    offer: "developpement-ia",
    articles: ["rag-llm-urgence-entreprise"],
  },
  {
    slug: "agent-ia",
    term: "Agent IA",
    alternateNames: ["AI agent", "Agent autonome"],
    definition:
      "Un agent IA est un système qui utilise un LLM pour atteindre un objectif en plusieurs étapes : il planifie, appelle des outils (API, bases de données, logiciels métier), observe les résultats et ajuste ses actions. Contrairement à un simple chatbot, il agit dans vos systèmes, dans un périmètre de droits défini et généralement sous supervision humaine.",
    whyItMatters:
      "Les agents permettent d'automatiser des tâches peu structurées que les règles classiques gèrent mal : traiter une demande reçue par e-mail, rapprocher des documents, préparer une saisie. Ils exigent des garde-fous : droits minimaux, validation humaine des actions sensibles, journalisation de chaque décision.",
    example:
      "Un agent lit les demandes de devis reçues par e-mail, extrait les besoins, vérifie la disponibilité dans l'ERP et prépare un devis brouillon. Le commercial le relit et l'envoie : l'agent ne contracte jamais seul au nom de l'entreprise.",
    notToConfuse: [
      {
        term: "Workflow d'automatisation",
        explanation:
          "Un workflow suit des règles déterministes définies à l'avance ; un agent décide lui-même de l'enchaînement des étapes. Les deux se combinent souvent.",
      },
      {
        term: "Copilote",
        explanation: "Un copilote assiste l'utilisateur sans agir à sa place ; un agent exécute des actions.",
      },
    ],
    related: ["ia-agentique", "mcp", "automatisation-n8n", "copilote"],
    offer: "agents-ia",
  },
  {
    slug: "mcp",
    term: "MCP (Model Context Protocol)",
    alternateNames: ["Model Context Protocol"],
    definition:
      "Le MCP (Model Context Protocol) est un protocole ouvert, publié par Anthropic fin 2024, qui standardise la connexion des applications d'IA aux sources de données et aux outils. Un serveur MCP expose des outils et des ressources ; tout client compatible (assistant, agent, environnement de développement) peut les utiliser sans intégration spécifique.",
    whyItMatters:
      "Le protocole a été adopté par les principaux éditeurs d'assistants. Exposer un outil métier une fois en MCP le rend utilisable par plusieurs assistants, sans redévelopper un connecteur pour chacun. La sécurité reste votre responsabilité : authentification, permissions limitées, et méfiance envers les serveurs tiers non vérifiés.",
    example:
      "Une entreprise expose son CRM via un serveur MCP en lecture seule. Les commerciaux interrogent l'historique d'un client depuis leur assistant IA, sans export manuel, et chacun ne voit que les comptes auxquels il a déjà accès.",
    notToConfuse: [
      {
        term: "API",
        explanation:
          "Une API expose les fonctions d'un logiciel ; MCP est une couche standard qui décrit ces fonctions de manière exploitable par un modèle d'IA. Un serveur MCP s'appuie souvent sur une API existante.",
      },
    ],
    related: ["agent-ia", "ia-agentique", "llm"],
    offer: "agents-ia",
  },
  {
    slug: "embedding",
    term: "Embedding (plongement vectoriel)",
    alternateNames: ["Plongement vectoriel", "Vecteur sémantique"],
    definition:
      "Un embedding est une représentation numérique d'un contenu (mot, phrase, document, image) sous la forme d'un vecteur de plusieurs centaines ou milliers de nombres. Des contenus de sens proche obtiennent des vecteurs proches, ce qui permet de rechercher par le sens plutôt que par correspondance exacte de mots-clés.",
    whyItMatters:
      "Les embeddings sont la base de la recherche sémantique, du RAG, de la détection de doublons et de la classification de documents. Le choix du modèle d'embedding, notamment sa qualité en français et sur votre vocabulaire métier, influence directement la pertinence des résultats.",
    example:
      "Un collaborateur cherche « remboursement d'un billet de train » dans l'intranet et trouve la procédure intitulée « notes de frais de déplacement », alors qu'aucun mot de sa requête n'apparaît dans le titre.",
    notToConfuse: [
      {
        term: "Token",
        explanation:
          "Un token est une unité de découpage du texte ; un embedding représente le sens d'un contenu entier.",
      },
    ],
    related: ["base-vectorielle", "rag", "token"],
    offer: "developpement-ia",
  },
  {
    slug: "base-vectorielle",
    term: "Base vectorielle",
    alternateNames: ["Vector database", "Base de données vectorielle"],
    definition:
      "Une base vectorielle est une base de données conçue pour stocker des embeddings et retrouver rapidement les vecteurs les plus proches d'une requête. Elle sert de moteur de recherche à une architecture RAG. Il peut s'agir d'un produit dédié (Qdrant, Weaviate, Pinecone…) ou d'une extension d'une base existante, comme pgvector pour PostgreSQL.",
    whyItMatters:
      "Elle conditionne la rapidité et la pertinence de la recherche, le filtrage par métadonnées et par droits d'accès, et le lieu d'hébergement de vos données. Beaucoup d'entreprises n'ont pas besoin d'un nouveau produit : leur base actuelle, étendue, suffit souvent au démarrage.",
    example:
      "Une ETI qui exploite déjà PostgreSQL active l'extension pgvector pour indexer ses fiches produits et sa documentation technique, sans ajouter de nouvelle brique à maintenir ni de nouveau fournisseur.",
    notToConfuse: [
      {
        term: "Moteur de recherche plein texte",
        explanation:
          "Un moteur plein texte (Elasticsearch, OpenSearch) cherche des mots-clés ; une base vectorielle cherche par proximité de sens. Les systèmes les plus fiables combinent souvent les deux (recherche hybride).",
      },
    ],
    related: ["embedding", "rag", "data-lakehouse"],
    offer: "developpement-ia",
  },
  {
    slug: "fine-tuning",
    term: "Fine-tuning (affinage)",
    alternateNames: ["Affinage", "Ajustement fin"],
    definition:
      "Le fine-tuning consiste à poursuivre l'entraînement d'un modèle pré-entraîné sur un jeu de données spécifique afin d'ajuster son comportement : style, format de sortie, vocabulaire métier, tâche de classification. Il modifie les paramètres du modèle, contrairement au prompt ou au RAG, qui ne changent que les informations fournies en entrée.",
    whyItMatters:
      "Il se justifie pour des tâches répétitives au format strict, ou pour obtenir d'un petit modèle, moins coûteux, la qualité d'un grand sur une tâche précise. Il demande des données d'exemple de qualité et une maintenance : c'est rarement la première étape, qui reste le prompt puis le RAG.",
    example:
      "Une fois constitué un historique de tickets correctement étiquetés, une entreprise affine un petit modèle open source pour classer automatiquement les nouveaux tickets selon sa nomenclature interne, avec un coût par requête réduit.",
    notToConfuse: [
      {
        term: "RAG",
        explanation:
          "Pour qu'un modèle connaisse vos documents à jour, le RAG est généralement plus adapté : le fine-tuning apprend un comportement, pas une base de faits qui évolue.",
      },
      {
        term: "Entraînement initial",
        explanation:
          "Entraîner un modèle de zéro demande des ressources considérables ; le fine-tuning part d'un modèle existant.",
      },
    ],
    related: ["rag", "llm", "mlops", "prompt"],
    offer: "developpement-ia",
  },
  {
    slug: "hallucination",
    term: "Hallucination",
    alternateNames: ["Confabulation"],
    definition:
      "Une hallucination est une réponse d'un modèle d'IA générative qui paraît plausible et assurée mais qui est fausse, inventée ou non étayée : chiffre erroné, référence juridique inexistante, citation fabriquée. Elle découle du fonctionnement probabiliste des LLM, qui produisent un texte vraisemblable sans vérifier les faits par eux-mêmes.",
    whyItMatters:
      "C'est le principal risque d'un assistant en production, surtout dans les domaines juridique, financier ou technique. On peut fortement la réduire (RAG, obligation de citer les sources, consignes explicites, évaluation systématique, validation humaine) mais pas la supprimer totalement : le processus doit en tenir compte.",
    example:
      "Un assistant juridique est configuré pour ne répondre qu'à partir des documents retrouvés, citer le passage utilisé et répondre « je ne trouve pas cette information » sinon. Un jeu de questions de test vérifie ce comportement à chaque évolution.",
    notToConfuse: [
      {
        term: "Biais",
        explanation:
          "Un biais est une déformation systématique liée aux données ou à la conception ; une hallucination est une invention ponctuelle.",
      },
      {
        term: "Erreur de source",
        explanation:
          "Si le document fourni est faux ou obsolète, le modèle peut répondre fidèlement… une information fausse. C'est un problème de qualité des données.",
      },
    ],
    related: ["rag", "llm", "prompt", "ia-generative"],
    offer: "developpement-ia",
  },
  {
    slug: "fenetre-de-contexte",
    term: "Fenêtre de contexte",
    alternateNames: ["Context window", "Contexte"],
    definition:
      "La fenêtre de contexte est la quantité maximale de texte, mesurée en tokens, qu'un LLM peut prendre en compte en une seule fois : instructions, historique de la conversation, documents fournis et réponse générée. Au-delà, les informations doivent être tronquées, résumées ou récupérées autrement, par exemple via une architecture RAG.",
    whyItMatters:
      "Elle détermine la quantité de documents qu'on peut soumettre directement au modèle. Mais un contexte plus long coûte plus cher, augmente le temps de réponse, et la qualité d'exploitation n'est pas toujours uniforme sur de très longs textes : mieux vaut fournir les bons passages que tout fournir.",
    example:
      "Pour analyser un contrat long, on peut le fournir en entier si la fenêtre le permet. Pour interroger plusieurs milliers de contrats, on passe par une recherche préalable (RAG) qui ne transmet au modèle que les clauses pertinentes.",
    notToConfuse: [
      {
        term: "Mémoire",
        explanation:
          "La « mémoire » d'un assistant est une fonction produit qui conserve des informations d'une conversation à l'autre ; la fenêtre de contexte ne concerne qu'un échange donné.",
      },
      {
        term: "Données d'entraînement",
        explanation: "Ce que le modèle a appris pendant son entraînement n'occupe pas la fenêtre de contexte.",
      },
    ],
    related: ["token", "rag", "llm"],
    offer: "developpement-ia",
  },
  {
    slug: "token",
    term: "Token",
    alternateNames: ["Jeton"],
    definition:
      "Un token est l'unité de texte qu'un LLM lit et produit : un mot entier, un fragment de mot, un signe de ponctuation ou un espace. Les modèles mesurent leur fenêtre de contexte et leurs éditeurs facturent l'usage des API en tokens. Le découpage dépend du modèle ; en français, un mot correspond souvent à plus d'un token.",
    whyItMatters:
      "Le token est l'unité de coût et de performance d'un projet IA : prix par volume de tokens en entrée et en sortie, limite de contexte, temps de génération. Comprendre ce découpage permet d'estimer un budget et d'optimiser un assistant (prompts plus courts, passages mieux sélectionnés).",
    example:
      "Pour estimer le coût mensuel d'un assistant, on multiplie le nombre de requêtes attendu par le nombre moyen de tokens par requête (instructions, documents fournis, réponse), puis par le tarif en vigueur publié par l'éditeur du modèle.",
    notToConfuse: [
      {
        term: "Jeton d'authentification",
        explanation:
          "Une clé ou un « token » d'API sert à s'authentifier auprès d'un service ; rien à voir avec l'unité de texte.",
      },
      {
        term: "Embedding",
        explanation: "Un embedding représente le sens d'un contenu ; le token n'est qu'une unité de découpage.",
      },
    ],
    related: ["fenetre-de-contexte", "llm", "embedding"],
    offer: "audit-strategie-ia",
  },
  {
    slug: "ia-agentique",
    term: "IA agentique",
    alternateNames: ["Agentic AI", "Systèmes multi-agents"],
    definition:
      "L'IA agentique désigne l'approche qui consiste à concevoir des systèmes d'IA capables d'agir de façon autonome vers un objectif : décomposer une tâche, choisir et utiliser des outils, coordonner éventuellement plusieurs agents spécialisés et vérifier leur propre travail. C'est un degré d'autonomie plus qu'une technologie unique, à régler selon le risque de chaque action.",
    whyItMatters:
      "Elle fait passer l'IA de « répondre » à « faire ». Cela impose une gouvernance : quelles actions sont autorisées, lesquelles sont réversibles, qui valide, comment tout est tracé. La bonne pratique consiste à démarrer avec une autonomie faible et à l'élargir à mesure que la fiabilité est démontrée.",
    example:
      "Pour les factures fournisseurs, un agent extrait les données, un deuxième les rapproche du bon de commande et de la réception, et seuls les écarts sont envoyés à un comptable. Les factures conformes suivent le circuit habituel de validation.",
    notToConfuse: [
      {
        term: "Agent IA",
        explanation:
          "Un agent IA est un système concret ; l'IA agentique désigne l'approche générale et le niveau d'autonomie qu'on lui confie.",
      },
      {
        term: "Autonomie totale",
        explanation:
          "Agentique ne signifie pas sans contrôle : dans un cadre professionnel, l'humain reste dans la boucle pour les décisions engageantes.",
      },
    ],
    related: ["agent-ia", "mcp", "automatisation-n8n"],
    offer: "agents-ia",
  },
  {
    slug: "automatisation-n8n",
    term: "Automatisation n8n",
    alternateNames: ["n8n", "Workflow automation"],
    definition:
      "n8n est une plateforme d'automatisation de workflows qui relie des applications au moyen de nœuds visuels : déclencheur, transformation, appel d'API, étape d'IA. Distribuée sous licence « fair-code », elle peut être auto-hébergée, ce qui permet de garder les données sur sa propre infrastructure. Elle sert souvent à orchestrer des agents IA.",
    whyItMatters:
      "n8n permet de combiner des étapes déterministes et fiables avec des étapes d'IA là où elles apportent quelque chose. L'auto-hébergement facilite la maîtrise des données. Comme tout logiciel, les workflows doivent être versionnés, documentés et surveillés pour ne pas devenir une dette invisible.",
    example:
      "À chaque nouveau formulaire de contact, un workflow n8n enrichit la fiche, demande à un LLM de qualifier la demande, crée l'opportunité dans le CRM et notifie l'équipe commerciale sur sa messagerie, avec un lien vers la fiche.",
    notToConfuse: [
      {
        term: "Zapier ou Make",
        explanation:
          "Outils comparables, proposés uniquement en SaaS hébergé par l'éditeur ; n8n offre en plus l'option auto-hébergée.",
      },
      {
        term: "RPA",
        explanation:
          "La RPA simule les clics d'un utilisateur sur des interfaces ; n8n passe par les API des applications.",
      },
    ],
    related: ["agent-ia", "ia-agentique", "mcp"],
    offer: "agents-ia",
  },
  {
    slug: "ai-act",
    term: "AI Act (règlement européen sur l'IA)",
    alternateNames: ["Règlement (UE) 2024/1689", "RIA", "Règlement européen sur l'intelligence artificielle"],
    definition:
      "L'AI Act est le règlement (UE) 2024/1689 qui encadre l'intelligence artificielle dans l'Union européenne. Il suit une approche par niveaux de risque : pratiques interdites, systèmes à haut risque soumis à des exigences strictes, obligations de transparence pour certains usages, et règles propres aux modèles d'IA à usage général. Son application est progressive.",
    whyItMatters:
      "Une entreprise qui utilise un système d'IA dans le cadre professionnel est « déployeur » au sens du règlement. Depuis le 2 février 2025, l'article 4 impose déjà aux fournisseurs et déployeurs de prendre des mesures pour assurer un niveau suffisant de maîtrise de l'IA (AI literacy) de leur personnel. Les autres obligations s'appliquent par étapes : vérifiez le calendrier en vigueur.",
    example:
      "Une PME recense ses usages d'IA. L'assistant de rédaction interne relève d'un risque limité ; l'outil de tri de candidatures, lui, relève d'un domaine (emploi) classé à haut risque par l'annexe III, ce qui appelle une analyse plus poussée avant tout déploiement.",
    notToConfuse: [
      {
        term: "RGPD",
        explanation:
          "Le RGPD protège les données personnelles ; l'AI Act encadre les systèmes d'IA selon leur risque. Les deux s'appliquent souvent en même temps.",
      },
      {
        term: "Certification",
        explanation:
          "Respecter l'AI Act ne passe pas par un label unique : les obligations dépendent du rôle (fournisseur, déployeur) et du niveau de risque du système.",
      },
    ],
    related: ["rgpd-et-ia", "shadow-ai", "ia-generative"],
    offer: "audit-strategie-ia",
  },
  {
    slug: "rgpd-et-ia",
    term: "RGPD et IA",
    alternateNames: ["Protection des données et IA", "GDPR"],
    definition:
      "Le RGPD s'applique à tout système d'IA qui traite des données personnelles, pour l'entraîner, l'alimenter ou dans ses réponses. Les principes restent les mêmes : base légale, finalité déterminée, minimisation, information des personnes, sécurité, encadrement des sous-traitants et des transferts hors UE, et analyse d'impact lorsque le traitement présente un risque élevé.",
    whyItMatters:
      "Le choix d'un outil d'IA est aussi un choix de sous-traitant : contrat de traitement des données, localisation, durée de conservation, usage ou non des données pour l'entraînement. La CNIL publie des recommandations dédiées à l'IA, utiles pour cadrer un projet dès sa conception.",
    example:
      "Avant de déployer un assistant documentaire sur des dossiers RH, l'entreprise restreint l'accès aux seules personnes habilitées, exclut les données sensibles de l'index, inscrit le traitement à son registre et vérifie les engagements contractuels de l'éditeur du modèle.",
    notToConfuse: [
      {
        term: "AI Act",
        explanation:
          "L'AI Act encadre les systèmes d'IA eux-mêmes ; le RGPD encadre les traitements de données personnelles. Un même projet peut relever des deux.",
      },
      {
        term: "Hébergement en Europe",
        explanation:
          "Héberger les données dans l'UE simplifie les transferts, mais ne rend pas à lui seul un traitement conforme.",
      },
    ],
    related: ["ai-act", "shadow-ai", "rag"],
    offer: "audit-strategie-ia",
  },
  {
    slug: "shadow-ai",
    term: "Shadow AI",
    alternateNames: ["IA fantôme", "IA non encadrée"],
    definition:
      "Le shadow AI désigne l'usage d'outils d'IA par les collaborateurs sans validation ni encadrement de l'entreprise : comptes personnels d'assistants conversationnels, extensions de navigateur, applications grand public. Il expose à des fuites de données confidentielles, à des manquements au RGPD et à des décisions fondées sur des résultats non vérifiés.",
    whyItMatters:
      "Il signale surtout un besoin réel non couvert. Interdire sans proposer d'alternative fonctionne mal. La réponse efficace combine un outil validé (offre entreprise avec engagements contractuels), une charte d'usage claire et une formation qui explique quoi partager, et quoi ne jamais partager.",
    example:
      "Un commercial colle une proposition contenant des données clients dans un assistant gratuit pour la reformuler. L'entreprise y répond en fournissant un abonnement entreprise, une charte d'une page et une courte formation aux bons réflexes.",
    notToConfuse: [
      {
        term: "Shadow IT",
        explanation:
          "Le shadow IT couvre tout logiciel non validé par la DSI ; le shadow AI en est la déclinaison propre aux outils d'IA, avec un risque accru lié aux données saisies.",
      },
    ],
    related: ["rgpd-et-ia", "ai-act", "copilote"],
    offer: "formation-ia",
  },
  {
    slug: "copilote",
    term: "Copilote IA",
    alternateNames: ["Copilot", "Assistant IA intégré"],
    definition:
      "Un copilote est un assistant d'IA intégré à un logiciel ou au poste de travail, qui aide l'utilisateur dans sa tâche (rédiger, résumer, analyser, coder) sans agir à sa place : l'humain garde l'initiative et valide chaque résultat. Le terme désigne aussi des produits commerciaux, comme Microsoft 365 Copilot ou GitHub Copilot.",
    whyItMatters:
      "C'est souvent la porte d'entrée la plus simple vers l'IA, car il s'insère dans des outils déjà utilisés. Sa valeur dépend de l'adoption (formation, cas d'usage concrets) et de la qualité des données auxquelles il accède : des droits de partage mal réglés deviennent visibles très vite.",
    example:
      "Un contrôleur de gestion utilise le copilote de son tableur pour écrire des formules complexes et proposer un commentaire sur un écart budgétaire, qu'il vérifie et reformule avant de l'envoyer à la direction.",
    notToConfuse: [
      {
        term: "Agent IA",
        explanation:
          "Un copilote suggère, l'utilisateur agit ; un agent IA exécute lui-même des actions dans les systèmes.",
      },
    ],
    related: ["agent-ia", "prompt", "shadow-ai"],
    offer: "formation-ia",
  },
  {
    slug: "mlops",
    term: "MLOps",
    alternateNames: ["LLMOps", "Machine Learning Operations"],
    definition:
      "Le MLOps regroupe les pratiques et outils qui permettent de mettre en production et de maintenir des modèles d'IA de façon fiable : versionnement des données et des modèles, pipelines d'entraînement et de déploiement automatisés, surveillance des performances et de la dérive. Pour les LLM, on parle de LLMOps : évaluation, suivi des prompts et des coûts.",
    whyItMatters:
      "Un modèle se dégrade quand les données ou les usages évoluent, et un assistant change de comportement quand on modifie son prompt ou son modèle. Sans ces pratiques, les projets restent au stade de prototype ou se dégradent silencieusement en production.",
    example:
      "Un modèle de prévision des ventes est réentraîné chaque mois par un pipeline automatisé ; une alerte prévient l'équipe si l'erreur de prévision dépasse un seuil défini avec le métier, et l'ancienne version peut être restaurée en un clic.",
    notToConfuse: [
      {
        term: "DevOps",
        explanation:
          "Le DevOps industrialise le code ; le MLOps y ajoute la gestion des données, des modèles et de leur qualité dans le temps.",
      },
    ],
    related: ["fine-tuning", "data-lakehouse", "llm"],
    offer: "developpement-ia",
    articles: ["pipeline-mlops-2026"],
  },
  {
    slug: "data-lakehouse",
    term: "Data lakehouse",
    alternateNames: ["Lakehouse"],
    definition:
      "Un data lakehouse est une architecture de données qui combine le stockage économique et flexible d'un data lake (fichiers ouverts sur stockage objet) avec les fonctions de gestion d'un data warehouse : transactions, schémas, gouvernance, performances SQL. Il repose sur des formats de tables ouverts comme Delta Lake ou Apache Iceberg.",
    whyItMatters:
      "Une même plateforme sert la business intelligence et l'IA, à partir de données propres, documentées et gouvernées. C'est une fondation : sans données fiables et accessibles, les projets d'IA les plus ambitieux bloquent dès le prototype.",
    example:
      "Une ETI industrielle centralise ses données ERP, CRM et capteurs dans un lakehouse. Les mêmes tables alimentent les tableaux de bord de la direction et l'entraînement d'un modèle de maintenance prédictive.",
    notToConfuse: [
      {
        term: "Data lake",
        explanation:
          "Un data lake stocke des fichiers bruts sans garanties transactionnelles ni gouvernance fine ; le lakehouse ajoute ces couches.",
      },
      {
        term: "Data warehouse",
        explanation:
          "Un entrepôt de données classique est optimisé pour le SQL et la BI, avec un stockage souvent propriétaire et moins adapté aux données non structurées.",
      },
    ],
    related: ["mlops", "base-vectorielle", "rag"],
    offer: "data",
    articles: ["data-lakehouse-vs-data-warehouse"],
  },
];

export function getGlossaryTerm(slug: string): GlossaryTerm | undefined {
  return GLOSSARY.find((t) => t.slug === slug);
}

export function glossaryPath(slug: string): string {
  return `/glossaire/${slug}`;
}

/** Letter used to group terms in the A-Z index (accents stripped). */
export function glossaryLetter(term: GlossaryTerm): string {
  return term.term.normalize("NFD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
}

export function sortedGlossary(): GlossaryTerm[] {
  return [...GLOSSARY].sort((a, b) => a.term.localeCompare(b.term, "fr"));
}

const TERM_SET_ID = `${SITE.url}/glossaire#termset`;

export function definedTermSchema(term: GlossaryTerm): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${absoluteUrl(glossaryPath(term.slug))}#term`,
    name: term.term,
    description: term.definition,
    url: absoluteUrl(glossaryPath(term.slug)),
    inLanguage: "fr-FR",
    ...(term.alternateNames?.length ? { alternateName: term.alternateNames } : {}),
    inDefinedTermSet: { "@id": TERM_SET_ID },
  };
}

export function definedTermSetSchema(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": TERM_SET_ID,
    name: "Glossaire de l'intelligence artificielle pour l'entreprise",
    description:
      "Définitions claires des notions clés de l'IA en entreprise : LLM, RAG, agents IA, MCP, AI Act, RGPD et plus.",
    url: absoluteUrl("/glossaire"),
    inLanguage: "fr-FR",
    publisher: { "@id": `${SITE.url}/#organization` },
    hasDefinedTerm: sortedGlossary().map((t) => ({
      "@type": "DefinedTerm",
      "@id": `${absoluteUrl(glossaryPath(t.slug))}#term`,
      name: t.term,
      description: t.definition,
      url: absoluteUrl(glossaryPath(t.slug)),
    })),
  };
}

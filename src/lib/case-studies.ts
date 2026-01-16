// Données des études de cas centralisées
export interface CaseStudyResult {
  metric: string;
  label: string;
  description: string;
}

export interface CaseStudyPhase {
  title: string;
  duration: string;
  description: string;
  deliverables: string[];
}

export interface CaseStudy {
  id: string;
  industry: string;
  title: string;
  subtitle: string;
  description: string;
  heroImage: string;
  challenge: {
    title: string;
    description: string;
    painPoints: string[];
  };
  solution: {
    title: string;
    description: string;
    approach: string[];
  };
  implementation: {
    duration: string;
    team: string;
    phases: CaseStudyPhase[];
  };
  technologies: {
    name: string;
    category: string;
  }[];
  results: CaseStudyResult[];
  keyLearnings: string[];
  category: "Data" | "IA" | "Cloud" | "Conseil";
}

export const caseStudies: CaseStudy[] = [
  {
    id: "retail-data-lakehouse",
    industry: "Retail",
    title: "Plateforme Data unifiée pour chaîne de magasins",
    subtitle: "Construction d'un Data Lakehouse moderne",
    description: "Conception et mise en place d'une architecture Data Lakehouse pour centraliser les données de ventes, stocks et comportement client à travers un réseau de magasins.",
    heroImage: "/case-studies/retail-data.jpg",
    challenge: {
      title: "Données fragmentées et reporting manuel",
      description: "Une chaîne de retail fait face à une problématique classique : des données dispersées dans plusieurs systèmes, rendant impossible une vision unifiée de l'activité.",
      painPoints: [
        "Données silotées entre POS, ERP et CRM sans interconnexion",
        "Rapports Excel manuels prenant plusieurs jours à produire",
        "Impossibilité de croiser les données ventes/stocks/clients",
        "Décisions stratégiques basées sur des données obsolètes",
        "Équipes data noyées dans les demandes ad-hoc"
      ]
    },
    solution: {
      title: "Architecture Data Lakehouse moderne",
      description: "Mise en place d'une plateforme data unifiée combinant la flexibilité du Data Lake avec les performances analytiques d'un Data Warehouse.",
      approach: [
        "Audit complet des sources de données et des flux existants",
        "Design d'une architecture medallion (Bronze/Silver/Gold)",
        "Ingestion automatisée depuis les systèmes sources",
        "Transformation des données avec modélisation dimensionnelle",
        "Couche sémantique pour l'accès self-service",
        "Dashboards automatisés pour les KPIs stratégiques"
      ]
    },
    implementation: {
      duration: "4 mois",
      team: "2 Data Engineers",
      phases: [
        {
          title: "Discovery & Design",
          duration: "3 semaines",
          description: "Cartographie des données, définition de l'architecture cible et priorisation des cas d'usage.",
          deliverables: ["Data catalog", "Architecture technique", "Roadmap détaillée"]
        },
        {
          title: "Infrastructure & Ingestion",
          duration: "5 semaines",
          description: "Mise en place de l'infrastructure cloud et des pipelines d'ingestion.",
          deliverables: ["Infrastructure Snowflake", "Pipelines Airbyte", "Monitoring"]
        },
        {
          title: "Transformation & Modélisation",
          duration: "6 semaines",
          description: "Développement des transformations dbt et du modèle de données.",
          deliverables: ["Modèles dbt documentés", "Tests de qualité", "Couche Gold"]
        },
        {
          title: "Visualisation & Formation",
          duration: "2 semaines",
          description: "Création des dashboards et formation des équipes.",
          deliverables: ["Dashboards Power BI", "Documentation utilisateur", "Formation"]
        }
      ]
    },
    technologies: [
      { name: "Snowflake", category: "Data Warehouse" },
      { name: "dbt", category: "Transformation" },
      { name: "Airbyte", category: "Ingestion" },
      { name: "Power BI", category: "Visualisation" },
      { name: "GitHub Actions", category: "CI/CD" }
    ],
    results: [
      { 
        metric: "-60%", 
        label: "Temps de reporting", 
        description: "Rapports automatisés vs Excel manuel"
      },
      { 
        metric: "+25%", 
        label: "Précision prévisions", 
        description: "Grâce au croisement des données"
      },
      { 
        metric: "x10", 
        label: "Volume traité", 
        description: "Scalabilité de l'architecture"
      }
    ],
    keyLearnings: [
      "Commencer par un périmètre restreint et itérer permet d'avoir des quick wins rapides",
      "L'implication des métiers dès le design est clé pour l'adoption",
      "La documentation et les tests dbt sont essentiels pour la maintenabilité",
      "Le self-service nécessite une couche sémantique bien pensée"
    ],
    category: "Data"
  },
  {
    id: "ecommerce-recommandation-ia",
    industry: "E-commerce",
    title: "Moteur de recommandation IA personnalisé",
    subtitle: "Machine Learning pour la personnalisation temps réel",
    description: "Développement d'un système de recommandation produits exploitant le comportement utilisateur pour personnaliser l'expérience client en temps réel.",
    heroImage: "/case-studies/ecommerce-ia.jpg",
    challenge: {
      title: "Personnalisation à grande échelle",
      description: "Un site e-commerce constate un taux de conversion stagnant et souhaite personnaliser l'expérience utilisateur pour améliorer ses performances commerciales.",
      painPoints: [
        "Recommandations statiques basées sur des règles manuelles",
        "Impossibilité de personnaliser à l'échelle de millions d'utilisateurs",
        "Temps de réponse trop lent pour une expérience temps réel",
        "Panier moyen stagnant malgré un trafic croissant",
        "Aucune exploitation des données de navigation"
      ]
    },
    solution: {
      title: "Système de recommandation hybride ML",
      description: "Architecture ML combinant collaborative filtering et content-based pour des recommandations personnalisées en temps réel.",
      approach: [
        "Analyse exploratoire des données utilisateurs et produits",
        "Feature engineering à partir du comportement de navigation",
        "Développement de modèles de collaborative filtering",
        "Intégration de similarité produits (content-based)",
        "Mise en place d'une architecture temps réel < 50ms",
        "A/B testing pour validation et optimisation continue"
      ]
    },
    implementation: {
      duration: "3 mois",
      team: "1 ML Engineer",
      phases: [
        {
          title: "Data Preparation",
          duration: "3 semaines",
          description: "Collecte, nettoyage et feature engineering des données.",
          deliverables: ["Feature store", "Pipelines de données", "Analyse exploratoire"]
        },
        {
          title: "Model Development",
          duration: "5 semaines",
          description: "Développement et entraînement des modèles de recommandation.",
          deliverables: ["Modèle hybride", "Métriques offline", "Baseline models"]
        },
        {
          title: "Production & API",
          duration: "3 semaines",
          description: "Déploiement en production avec API temps réel.",
          deliverables: ["API REST", "Infrastructure MLOps", "Monitoring"]
        },
        {
          title: "A/B Testing & Optimisation",
          duration: "2 semaines",
          description: "Tests en conditions réelles et optimisation.",
          deliverables: ["Résultats A/B", "Modèle optimisé", "Documentation"]
        }
      ]
    },
    technologies: [
      { name: "Python", category: "Langage" },
      { name: "TensorFlow", category: "ML Framework" },
      { name: "AWS SageMaker", category: "MLOps" },
      { name: "Redis", category: "Cache" },
      { name: "FastAPI", category: "API" }
    ],
    results: [
      { 
        metric: "+35%", 
        label: "Taux de conversion", 
        description: "Sur les pages avec recommandations"
      },
      { 
        metric: "+22%", 
        label: "Panier moyen", 
        description: "Grâce au cross-selling intelligent"
      },
      { 
        metric: "< 50ms", 
        label: "Temps de réponse", 
        description: "Pour une UX fluide"
      }
    ],
    keyLearnings: [
      "Un modèle simple bien déployé surpasse un modèle complexe mal intégré",
      "Le feature engineering représente 80% de la valeur ajoutée",
      "L'A/B testing est indispensable pour valider l'impact business réel",
      "Le monitoring des dérives de données est critique en production"
    ],
    category: "IA"
  },
  {
    id: "finance-migration-cloud",
    industry: "Finance",
    title: "Migration Cloud & Modernisation applicative",
    subtitle: "De l'infrastructure legacy vers le Cloud moderne",
    description: "Migration d'une infrastructure on-premise vieillissante vers AWS avec modernisation progressive des applications critiques en architecture microservices.",
    heroImage: "/case-studies/finance-cloud.jpg",
    challenge: {
      title: "Infrastructure legacy coûteuse et rigide",
      description: "Une entreprise du secteur financier fait face à une dette technique importante avec des coûts d'infrastructure élevés et une agilité limitée.",
      painPoints: [
        "Serveurs physiques en fin de vie avec risques de panne",
        "Coûts d'infrastructure représentant 30% du budget IT",
        "Déploiements manuels prenant plusieurs jours",
        "Impossible de scaler pendant les pics d'activité",
        "Time-to-market de plusieurs mois pour les nouvelles fonctionnalités"
      ]
    },
    solution: {
      title: "Migration lift-and-shift puis modernisation",
      description: "Approche en deux temps : migration rapide pour réduire les risques, puis modernisation progressive vers une architecture cloud-native.",
      approach: [
        "Assessment complet de l'infrastructure existante",
        "Définition de la stratégie de migration (6 R)",
        "Migration lift-and-shift des workloads critiques",
        "Containerisation des applications avec Docker",
        "Orchestration Kubernetes pour la scalabilité",
        "Mise en place de CI/CD pour l'agilité"
      ]
    },
    implementation: {
      duration: "6 mois",
      team: "1 Cloud Architect",
      phases: [
        {
          title: "Assessment & Planning",
          duration: "4 semaines",
          description: "Audit de l'existant et définition de la stratégie de migration.",
          deliverables: ["Assessment report", "Migration strategy", "TCO analysis"]
        },
        {
          title: "Landing Zone",
          duration: "4 semaines",
          description: "Mise en place de la fondation cloud sécurisée.",
          deliverables: ["Infrastructure AWS", "Networking", "Security baseline"]
        },
        {
          title: "Migration Lift-and-Shift",
          duration: "8 semaines",
          description: "Migration des serveurs et applications à l'identique.",
          deliverables: ["Workloads migrés", "Validation fonctionnelle", "Cutover"]
        },
        {
          title: "Modernisation & CI/CD",
          duration: "8 semaines",
          description: "Containerisation et mise en place du DevOps.",
          deliverables: ["Conteneurs Docker", "Cluster Kubernetes", "Pipelines CI/CD"]
        }
      ]
    },
    technologies: [
      { name: "AWS", category: "Cloud Provider" },
      { name: "Kubernetes (EKS)", category: "Orchestration" },
      { name: "Docker", category: "Conteneurisation" },
      { name: "Terraform", category: "IaC" },
      { name: "GitHub Actions", category: "CI/CD" }
    ],
    results: [
      { 
        metric: "-40%", 
        label: "Coûts infrastructure", 
        description: "Grâce au cloud et à l'optimisation"
      },
      { 
        metric: "99.99%", 
        label: "Disponibilité", 
        description: "Vs 99.5% avant migration"
      },
      { 
        metric: "-70%", 
        label: "Time-to-deploy", 
        description: "De jours à heures"
      }
    ],
    keyLearnings: [
      "La migration lift-and-shift permet de réduire le risque avant modernisation",
      "FinOps dès le départ évite les mauvaises surprises de coûts cloud",
      "La formation des équipes est aussi importante que la technologie",
      "Une Landing Zone bien conçue facilite toutes les migrations futures"
    ],
    category: "Cloud"
  },
  {
    id: "industrie-transformation-digitale",
    industry: "Industrie",
    title: "Transformation digitale : stratégie & pilotage",
    subtitle: "Accompagnement stratégique sur 18 mois",
    description: "Définition et pilotage d'un programme de transformation digitale couvrant la stratégie data, l'adoption de l'IA et la modernisation des systèmes d'information.",
    heroImage: "/case-studies/industrie-conseil.jpg",
    challenge: {
      title: "Maturité digitale faible et silos organisationnels",
      description: "Un groupe industriel souhaite accélérer sa transformation digitale mais manque de vision claire et fait face à des résistances internes.",
      painPoints: [
        "Aucune stratégie data formalisée malgré des données abondantes",
        "Silos entre les différentes business units",
        "Échecs de projets IT précédents ayant créé de la méfiance",
        "Direction générale convaincue mais équipes sceptiques",
        "Budget disponible mais pas de priorisation claire"
      ]
    },
    solution: {
      title: "Programme de transformation structuré",
      description: "Approche conseil combinant stratégie, gouvernance et accompagnement au changement pour une transformation réussie et durable.",
      approach: [
        "Diagnostic 360° de la maturité digitale",
        "Co-construction de la vision avec le COMEX",
        "Définition de la roadmap sur 18 mois",
        "Mise en place de la gouvernance data",
        "Identification et livraison de quick wins",
        "Accompagnement au changement continu"
      ]
    },
    implementation: {
      duration: "18 mois",
      team: "1 Partner",
      phases: [
        {
          title: "Diagnostic & Vision",
          duration: "6 semaines",
          description: "État des lieux complet et définition de la vision cible.",
          deliverables: ["Diagnostic maturité", "Vision & ambition", "Business case"]
        },
        {
          title: "Roadmap & Gouvernance",
          duration: "4 semaines",
          description: "Priorisation des initiatives et mise en place de la gouvernance.",
          deliverables: ["Roadmap 18 mois", "Data governance", "Organisation cible"]
        },
        {
          title: "Quick Wins (6 mois)",
          duration: "6 mois",
          description: "Livraison de premiers projets à impact rapide.",
          deliverables: ["3-5 use cases livrés", "Premiers ROI", "Témoignages internes"]
        },
        {
          title: "Scaling (12 mois)",
          duration: "12 mois",
          description: "Industrialisation et passage à l'échelle.",
          deliverables: ["Plateforme data", "Centre d'excellence", "Autonomie équipes"]
        }
      ]
    },
    technologies: [
      { name: "Change Management", category: "Méthodologie" },
      { name: "DAMA-DMBOK", category: "Framework Data" },
      { name: "Agile/Scrum", category: "Méthodologie" },
      { name: "Power BI", category: "Visualisation" },
      { name: "Azure", category: "Cloud" }
    ],
    results: [
      { 
        metric: "x3", 
        label: "Maturité digitale", 
        description: "Score passé de 1.5 à 4.5/5"
      },
      { 
        metric: "15", 
        label: "Use cases livrés", 
        description: "Avec ROI démontré"
      },
      { 
        metric: "85%", 
        label: "Adhésion équipes", 
        description: "Mesuré par enquête interne"
      }
    ],
    keyLearnings: [
      "L'adhésion du COMEX est nécessaire mais pas suffisante - il faut embarquer le middle management",
      "Les quick wins créent une dynamique positive indispensable",
      "La data governance doit être au service des métiers, pas une contrainte bureaucratique",
      "La formation et l'accompagnement sont aussi importants que la technologie"
    ],
    category: "Conseil"
  }
];

export function getCaseStudyById(id: string): CaseStudy | undefined {
  return caseStudies.find(cs => cs.id === id);
}

export function getCaseStudiesByCategory(category: string): CaseStudy[] {
  if (category === "Tous") return caseStudies;
  return caseStudies.filter(cs => cs.category === category);
}

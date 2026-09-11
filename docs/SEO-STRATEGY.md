# Stratégie SEO — Architecture (Phase 2)

Construit sur les fondations posées en Phase 1 (sitemap/robots corrigés, metadata cohérentes — voir [AGENFY-AUDIT.md](AGENFY-AUDIT.md) §10). Ce document définit l'architecture ; l'implémentation complète est Phase 6.

## 1. Système de metadata unifié

Aujourd'hui, chaque page définit son `metadata` indépendamment (source de l'incohérence documentée en audit §6.1 : certaines pages ont canonical+OG, d'autres non). Cible :

```ts
// src/lib/seo.ts (à créer, Phase 6)
export function buildMetadata(input: {
  title: string;
  description: string;
  path: string;          // "/services/data" — canonical + OG url dérivés automatiquement
  ogImage?: string;       // défaut : /og-image.jpg
  noIndex?: boolean;      // pour /admin plus tard
}): Metadata
```

Toute page (statique ou dynamique) appelle `buildMetadata()` au lieu de construire son objet `Metadata` à la main. Ça élimine structurellement la classe de bug trouvée en Phase 1 (page qui "oublie" le canonical) — impossible d'oublier un champ que la fonction remplit par défaut.

## 2. Données structurées — bibliothèque à étendre

Existant : `Organization`, `WebSite`, `ProfessionalService` (LocalBusiness), injectés globalement dans le layout racine.

À ajouter dans `src/components/schemas/` :

| Schéma | Où l'injecter | Généré depuis |
|---|---|---|
| `ArticleSchema` / `BlogPosting` | Chaque page `/blog/[slug]` | `BlogPost` (déjà : title, author, date, category) |
| `BreadcrumbListSchema` | Toute page à plus d'un niveau (`/services/data`, `/blog/[slug]`, `/etudes-de-cas/[id]`) | Généré depuis le chemin, pas saisi à la main |
| `ServiceSchema` | Chaque page `/services/*` | Contenu déjà présent sur ces pages |
| `FAQPageSchema` | Uniquement si une vraie FAQ existe sur la page (voir GEO-STRATEGY.md) — jamais généré sans contenu réel derrière | — |
| `PersonSchema` | `/a-propos` et futur `/auteurs` | Voir GEO-STRATEGY.md §3 |

Règle héritée de la mission : jamais de donnée structurée qui ne correspond pas à du contenu visible sur la page (pas de `FAQPageSchema` sans vraies questions affichées, etc.).

## 3. Architecture de clusters — sans changer les URLs existantes

**Décision** : les 4 pillar pages sont les pages `/services/*` **déjà existantes** (`intelligence-artificielle`, `data`, `cloud`, `conseil`), pas de nouvelles URLs racine (`/ia`, `/data`...) comme le suggère l'exemple générique de la mission.

Raison : le site est jeune, ces URLs ne portent quasiment aucun historique SEO à préserver, mais introduire des URLs parallèles créerait soit du contenu dupliqué (deux pages sur le même sujet), soit un chantier de redirections 301 immédiat sans bénéfice mesurable. Les pages `/services/*` jouent déjà le rôle de pillar page dans leur contenu actuel.

| Cluster | Pillar page (existante) | Exemples de satellites blog (mission §8, à produire Phase 8+) |
|---|---|---|
| IA | `/services/intelligence-artificielle` | RAG entreprise, LLM entreprise, agents IA, automatisation IA |
| Data | `/services/data` | Data Lakehouse (déjà écrit), Data Governance, MLOps, BI |
| Cloud | `/services/cloud` | Migration cloud (déjà écrit), Kubernetes (déjà écrit), FinOps (déjà écrit) |
| Conseil | `/services/conseil` | Audit SI, stratégie data, stratégie IA |

Détail des articles déjà écrits vs. manquants dans [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md).

## 4. Maillage interne

Avant de construire un "moteur" de recommandation automatique (mission §25, ambitieux), une version simple et déterministe suffit pour la majorité de la valeur :

Règle par défaut sur chaque article de blog : lien vers (1) sa pillar page de cluster, (2) 2-3 autres articles de la même catégorie, (3) l'étude de cas la plus pertinente de la même catégorie si elle existe. Implémentable comme une fonction pure `getRelatedContent(post)` dans `src/lib/`, sans dépendance externe. Le vrai "moteur sémantique" (embeddings, similarité) devient pertinent seulement quand le volume de contenu le justifie (au-delà d'une vingtaine d'articles) — prématuré aujourd'hui avec 10 articles.

## 5. Ce qui reste à mesurer avant de fixer des objectifs chiffrés

Aucune mesure Lighthouse/Core Web Vitals réelle n'a encore été prise (voir audit §9.1) — les objectifs de la mission (Performance > 90, SEO > 95...) seront suivis une fois une baseline réelle disponible, en Phase 12, pas inventés maintenant.

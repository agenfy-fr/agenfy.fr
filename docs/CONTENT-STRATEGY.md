# Stratégie de contenu — Architecture (Phase 2)

## 1. Les 4 clusters (mission §8), mappés sur l'existant

Voir [SEO-STRATEGY.md](SEO-STRATEGY.md) §3 pour la décision de garder `/services/*` comme pillar pages.

## 2. Inventaire réel des 10 articles existants (`src/lib/blog-posts.tsx`)

| Article | Cluster | Répond déjà à la grille GEO ? |
|---|---|---|
| Data Lakehouse vs Data Warehouse | Data | Oui — comparatif, recommandation par contexte, tableau technologies |
| L'IA générative en entreprise | IA | Oui — 4 cas d'usage chiffrés, stack recommandée |
| Les 5 clés d'une migration cloud réussie | Cloud | Oui — bonnes/mauvaises raisons, tableau des "6 R", pièges FinOps |
| Pourquoi Kubernetes ne convient pas à tout le monde | Cloud | Oui — "quand oui / quand non" explicite, coût chiffré |
| Construire un pipeline MLOps en 2026 | IA | Partiel — manque une section coût/alternatives claire |
| Le conseil tech : au-delà de l'audit | Conseil | Partiel — pas de comparatif ni de FAQ |
| Rust vs Go pour vos microservices | Tech (hors cluster) | Oui sur la forme — mais catégorie "Tech" ne correspond à aucun des 4 clusters métier ; à requalifier ou assumer comme contenu de notoriété technique hors funnel commercial |
| RAG et LLM en Entreprise | IA | Oui — urgence chiffrée, 5 cas d'usage, étapes de mise en œuvre |
| Migration vers une Modern Data Stack | Data | Oui — composants détaillés, coûts, erreurs à éviter |
| FinOps pour PME | Cloud | Oui — tableaux de coûts, ROI chiffré, erreurs classiques |

**Mise à jour** : le contenu autrefois orphelin en markdown (`content/blog/*.md`) a été porté dans `lib/blog-posts.tsx` sous les mêmes slugs (RAG, Modern Data Stack, FinOps ci-dessus) et est maintenant réellement publié. `content/blog/`, `lib/blog.ts` et la dépendance `gray-matter` ont été supprimés, devenus redondants.

## 3. Backlog de satellites à produire (mission §9, priorisé par manque le plus criant)

| Cluster | Manque le plus visible | Prochain article suggéré |
|---|---|---|
| IA | Rien sur les agents IA autonomes spécifiquement (RAG et LLM généraliste sont couverts) | Nouvel article "Agents IA en entreprise : cas d'usage et limites" |
| Data | Rien sur Data Governance ni BI en tant que tel (MLOps existant est classé IA) | Nouvel article Data Governance |
| Conseil | Le plus faible des 4 : 1 seul article, pas de FAQ, pas de comparatif | Nouvel article "Audit SI : comment ça se passe" avec grille de coût |
| Cloud | Bien couvert (migration, Kubernetes, FinOps) — prochain effort à faible priorité | Comparatif AWS vs Azure vs GCP par cas d'usage |

## 4. Pipeline éditorial — statuts (verrouillés ici pour rester cohérents avec le schéma `posts` de ADMIN-ARCHITECTURE.md)

```
idea → researching → outline → draft → seo_review → geo_review → human_review → scheduled → published → updated → archived
```

Correspond à la colonne `status` de la future table `posts` (ADMIN-ARCHITECTURE.md §4). Le contenu généré par IA (Phase 10) ne saute jamais l'étape `human_review` — pas d'exception, y compris pour un contenu jugé "simple".

## 5. Standards éditoriaux (E-E-A-T)

- Chaque article : `authorSlug` structuré (voir GEO-STRATEGY.md §3), date de publication ET de mise à jour distinctes (le modèle actuel n'a qu'un seul champ `date` — à étendre lors de la migration CMS).
- Chaque étude de cas : champ `caseType` (`example` \| `client`) obligatoire et affiché — pattern déjà en place depuis Phase 1 dans `lib/case-studies.ts`, à respecter pour toute nouvelle étude de cas, réelle ou non.
- Aucun chiffre (ROI, résultat, statistique) publié sans pouvoir dire d'où il vient — réel et vérifié (`client`), ou explicitement illustratif (`example`). Pas de zone grise.

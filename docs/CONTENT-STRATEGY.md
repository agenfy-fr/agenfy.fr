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

*(Les 3 articles restants n'ont pas été audités ligne à ligne — même exercice à faire avant la Phase 8.)*

**Contenu markdown orphelin** (`content/blog/*.md`, 3 fichiers, voir audit §2.3) : `finops-pme-reduire-facture-cloud`, `migration-modern-data-stack-guide`, `rag-llm-urgence-entreprise`. Rédactionnellement bons (le fichier RAG suit déjà la grille GEO avec un tableau et des chiffres datés), mais jamais rendus sur le site. **Décision Phase 8** : les migrer dans le vrai pipeline (probablement les meilleurs candidats pour combler les manques du cluster IA/Cloud ci-dessus) plutôt que les perdre.

## 3. Backlog de satellites à produire (mission §9, priorisé par manque le plus criant)

| Cluster | Manque le plus visible | Prochain article suggéré |
|---|---|---|
| IA | Rien sur RAG ni agents IA dans le pipeline **rendu** (existe seulement en markdown orphelin) | Migrer `rag-llm-urgence-entreprise.md` en premier |
| Cloud | FinOps existe seulement en markdown orphelin | Migrer `finops-pme-reduire-facture-cloud.md` |
| Data | Rien sur Data Governance, BI, MLOps côté data (MLOps existant est classé IA) | Nouvel article Data Governance |
| Conseil | Le plus faible des 4 : 1 seul article, pas de FAQ, pas de comparatif | Nouvel article "Audit SI : comment ça se passe" avec grille de coût |

## 4. Pipeline éditorial — statuts (verrouillés ici pour rester cohérents avec le schéma `posts` de ADMIN-ARCHITECTURE.md)

```
idea → researching → outline → draft → seo_review → geo_review → human_review → scheduled → published → updated → archived
```

Correspond à la colonne `status` de la future table `posts` (ADMIN-ARCHITECTURE.md §4). Le contenu généré par IA (Phase 10) ne saute jamais l'étape `human_review` — pas d'exception, y compris pour un contenu jugé "simple".

## 5. Standards éditoriaux (E-E-A-T)

- Chaque article : `authorSlug` structuré (voir GEO-STRATEGY.md §3), date de publication ET de mise à jour distinctes (le modèle actuel n'a qu'un seul champ `date` — à étendre lors de la migration CMS).
- Chaque étude de cas : champ `caseType` (`example` \| `client`) obligatoire et affiché — pattern déjà en place depuis Phase 1 dans `lib/case-studies.ts`, à respecter pour toute nouvelle étude de cas, réelle ou non.
- Aucun chiffre (ROI, résultat, statistique) publié sans pouvoir dire d'où il vient — réel et vérifié (`client`), ou explicitement illustratif (`example`). Pas de zone grise.

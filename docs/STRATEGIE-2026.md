# Agenfy — stratégie IA-first (octobre 2026)

Décisions du 29/10/2026 : positionnement **IA-first**, monorepo `apps/web` + `apps/console` + `apps/app`, Qualiopi **à lancer**, pas encore de client référence (In-Finea en discussion).

## 1. Benchmark (résumé)

| Acteur | Ce qu'on reprend | Ce qu'on fait mieux |
|---|---|---|
| Mister IA | Offres packagées, test de maturité IA, FAQ d'achat, pages outil/métier, Qualiopi mis en avant | Plateforme de formation nommée (app.agenfy.fr), pont formation → projet (console), technique (agents, MCP, data) |
| Artefact | Leadership éditorial (rapports, baromètres), navigation Industries/Offres/Ressources | Accès direct au fondateur, réactivité PME |
| Flowt | Pages technologies, délais publiés | H1 différenciant (le leur était quasi identique à l'ancien H1 Agenfy) |
| Theodo Data & AI | Offres nommées, méthode propriétaire | — |
| Koïno | Boutons « Demander à ChatGPT/Claude » | Cohérence des chiffres (les leurs se contredisent) |

Sources et détail : rapport de recherche du 29/10/2026 (mister-ia.com/tarifs, artefact.com/llms.txt, flowt.fr, etc.).

## 2. Ce qui est en place sur www.agenfy.fr

- Catalogue d'offres unique `apps/web/src/lib/offers.ts` → nav, home, pages services, FAQ, JSON-LD, `llms.txt`.
- Pages : `/services/{audit-strategie-ia, agents-ia, intelligence-artificielle, data, cloud}`, `/formations` + 2 fiches, `/diagnostic-ia`, `/a-propos` avec fondateur.
- GEO : réponse directe de 40-60 mots en tête de chaque offre, FAQ visible + `FAQPage`, `Service`, `Course`, `Person`, `BreadcrumbList`, `ProfessionalService` avec `@id`, `llms.txt` généré, bots IA autorisés.
- Honnêteté : faux chiffres retirés, études de cas illustratives en `noindex`, mention Qualiopi « en préparation ».

## 3. Prochaines pages (par priorité)

1. **`/tarifs`** — fourchettes publiques (audit, formation/jour, agent IA). Levier GEO prouvé (les IA citent en priorité les pages avec prix). *Bloqué : décision de prix.*
2. **Premier vrai cas client** (In-Finea, avec accord écrit) → retirer le `noindex` de `/etudes-de-cas` et remplacer les exemples.
3. Formations par outil : `/formations/chatgpt-entreprise`, `/formations/claude`, `/formations/copilot`, `/formations/mistral`.
4. Pages métier `/ia-pour/{rh, finance, commerciaux, juristes}` (3-4 au départ, seulement si contenu réel).
5. `/financement-formation-ia` — à publier **après** Qualiopi.
6. Baromètre trimestriel « PME françaises et IA » alimenté par les résultats anonymisés du diagnostic (n ≥ 100 avant publication).

## 4. Actions hors site (à faire par Evan — impossibles depuis le code)

| Action | Pourquoi | Effort |
|---|---|---|
| Google Search Console + **Bing Webmaster Tools** : soumettre `sitemap.xml` | ChatGPT Search s'appuie largement sur l'index Bing | 15 min |
| Fiche Google Business Profile (229 rue Saint-Honoré) | Requêtes « agence IA Paris », AI Overviews locales | 30 min |
| Même description d'une phrase partout : LinkedIn, Malt, Sortlist, La Fabrique du Net, France Num, Pappers | Cohérence d'entité = condition pour être cité | 2 h |
| Profil LinkedIn d'Evan : ajouter l'URL dans `AUTHORS["evan-masse"].sameAs` (`apps/web/src/lib/site.ts`) | Relie la `Person` à une identité vérifiable | 2 min |
| 1 post LinkedIn / semaine signé Evan, reprenant un article ou un résultat du diagnostic | Les mentions tierces pèsent plus que le site lui-même | continu |
| Candidater aux classements « meilleures agences IA » (Jedha, comparateurs) et tribunes JDN / Maddyness | Sources citées par Perplexity et ChatGPT | ponctuel |
| Panel mensuel de 15 prompts (« agence IA PME », « formation Claude entreprise »…) testés dans ChatGPT, Perplexity, Claude, Gemini, AI Mode | Mesurer la visibilité GEO | 30 min / mois |

## 5. Qualiopi (prérequis du financement OPCO)

1. Numéro de déclaration d'activité (NDA) auprès de la DREETS — après une première convention de formation signée.
2. Choisir un organisme certificateur accrédité COFRAC, audit initial (prévoir plusieurs mois de préparation).
3. La plateforme app.agenfy.fr trace déjà positionnement, émargement, évaluations à chaud/à froid, attestations, réclamations (voir `apps/app/docs/QUALIOPI.md`).
4. Ensuite seulement : mentionner « finançable OPCO » (le test `catalogue integrity` du site bloque toute mention prématurée).
5. Option : candidater comme expert accrédité **Diag Data IA Bpifrance** (subventionné en partie par Bpifrance) — canal d'acquisition PME très qualifié.

## 6. À valider par Evan

- Les 4 engagements du Hero (neutralité sans commission, indicateur de gain, humain dans la boucle, code et données au client) — ce sont des promesses commerciales.
- Les durées indicatives des étapes dans `offers.ts`.
- La bio du fondateur dans `site.ts`.

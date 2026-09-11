# Stratégie GEO / AI Search — Architecture (Phase 2)

Objectif : qu'un moteur de réponse (ChatGPT, Perplexity, Google AI Overviews, Claude...) puisse comprendre, citer et recommander Agenfy correctement. Implémentation complète en Phase 7 ; ce document fixe l'architecture.

## 1. Ce qui existe déjà (bonne base, confirmé en audit §7.1)

- [`public/llms.txt`](../public/llms.txt) — présentation, services, contact, entité légale.
- Plusieurs articles de blog respectent déjà une partie du schéma de réponse visé (tableaux comparatifs, sections "quand utiliser / ne pas utiliser").
- `/a-propos` a un fondateur réel et nommé.

## 2. Grille de réponse — à appliquer systématiquement (nouveau contenu + retrofit du contenu existant)

Chaque page pillar et chaque article satellite doit pouvoir répondre, explicitement et repérable par un moteur de réponse (titres de section clairs, pas noyé dans un paragraphe) :

`Qu'est-ce que X` · `Pourquoi X` · `Quand utiliser X` · `Quand ne pas utiliser X` · `Combien ça coûte` · `Comment l'implémenter` · `Quels risques` · `Quelles alternatives` · `X vs Y`

Statut actuel par rapport à cette grille : voir [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md) §3 (audit article par article).

## 3. Architecture des entités

**Auteur** : aujourd'hui `author` est une chaîne libre (`"Evan Massé"` ou `"Équipe Agenfy"` selon l'article — incohérent, voir audit §7.2). Cible :

```ts
// src/lib/authors.ts (à créer Phase 7, avant la migration CMS complète)
interface Author {
  slug: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  sameAs: string[]; // LinkedIn, X...
}
```

Chaque article référence un `authorSlug` au lieu d'une chaîne libre. Alimente `PersonSchema` (voir SEO-STRATEGY.md §2) et une future page `/auteurs`.

**Pages d'autorité à créer (mission §12)** :
- `/methodologie` — comment Agenfy travaille (le contenu existe déjà en partie, dispersé : section "Notre approche en 4 points" sur `/etudes-de-cas`, principes du fondateur sur `/a-propos`). À consolider en une page dédiée, citable indépendamment.
- `/auteurs` — page listant les experts, avec leur `Author` structuré.

## 4. FAQ

- Composant réutilisable `FAQ` (dans `components/effects/` ou `components/sections/`, à trancher en Phase 3 selon si on lui donne du motion ou non) + `FAQPageSchema` associé (voir SEO-STRATEGY.md §2).
- Ajoutée d'abord aux 4 pillar pages `/services/*` (questions réelles issues des échanges commerciaux existants — pas inventées pour remplir), puis aux articles à fort potentiel de citation.
- Règle stricte héritée de la mission : pas de `FAQPageSchema` sans FAQ visible correspondante sur la page.

## 5. Évolution de llms.txt

Une fois le contenu ci-dessus en place, régénérer `llms.txt` pour référencer : les 4 pillar pages avec description, `/methodologie`, `/auteurs`, et les articles de blog les plus substantiels. À terme (Phase 10, une fois le CMS en place), génération automatique depuis la base plutôt que maintenue à la main.

## 6. Crédibilité — rappel transversal

Le point le plus critique trouvé en Phase 1 (témoignages fictifs, voir audit §1.3) est autant un problème GEO qu'un problème de confiance directe : un moteur de réponse qui reprendrait un chiffre non vérifié comme "preuve client Agenfy" propage une fausse information de façon durable et hors de notre contrôle. D'où la règle déjà appliquée : études de cas actuelles explicitement labellisées "Exemple / démonstration" tant qu'elles ne sont pas remplacées par de vrais clients nommés avec accord.

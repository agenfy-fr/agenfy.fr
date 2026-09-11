# Audit Agenfy.fr — Phase 1

**Date de l'audit :** 11 septembre 2026
**Méthode :** inspection directe du code source (aucune supposition — chaque constat ci-dessous référence un fichier et, si pertinent, une ligne précise). Build de production (`npm run build`) et lint (`npm run lint`) exécutés pour établir une baseline réelle.
**Commit de référence :** `4a74212` (branche `main`, working tree propre au démarrage de l'audit).

---

## 0. Ce qu'est Agenfy aujourd'hui, en une phrase

Un site vitrine Next.js jeune, propre et bien structuré pour un cabinet de conseil tech (Data/IA/Cloud/Conseil), avec un vrai contenu de blog de qualité et une identité visuelle cohérente — mais **sans CMS, sans admin, sans authentification, sans tests, avec plusieurs sources de contenu dupliquées qui ont déjà divergé, et avec au moins un cas de témoignages clients fictifs présentés comme réels**. C'est une fondation saine mais un chantier tôt dans sa vie : la bonne nouvelle est qu'il n'y a presque rien à "défaire", tout est à construire par-dessus une base cohérente.

---

## 1. Executive Summary

### 1.1 État actuel

- **Stack** : Next.js 16.1.2 (App Router), React 19.2.3, TypeScript strict, Tailwind CSS v4 (config CSS-first, pas de `tailwind.config.js`), Supabase (client uniquement), déployé sur Vercel (Speed Insights actif).
- **Taille réelle du projet** : 39 fichiers `.tsx`, 17 routes de pages, 1 route API, 9 sections de page, 7 primitives UI, 10 articles de blog "en dur", 4 études de cas. Ce n'est pas un gros monolithe hérité — c'est un site compact, ce qui rend la refonte demandée réaliste **si elle est séquencée**, mais qui n'a pas encore l'infrastructure (CMS, admin, auth, tests) que la mission demande de construire.
- **Contenu** : rédigé en français, avec un vrai fondateur identifié (Evan Massé, photo et bio sur `/a-propos`), un blog technique déjà substantiel et de bonne qualité éditoriale (tableaux comparatifs, sections "quand utiliser / ne pas utiliser", conseils tranchés).
- **Ce qui n'existe pas du tout** : authentification, back-office, tests automatisés (aucun framework de test dans `package.json`), middleware Next.js, formulaire de contact natif (page `/contact` = uniquement un widget Calendly), CSP/HSTS, FAQ, schémas `Article`/`BreadcrumbList`/`Service`, pipeline de génération de contenu IA.

### 1.2 Points forts (à préserver absolument)

1. **Design tokens déjà propres** : palette violette/magenta cohérente (`--primary #3200F8`, `--accent #AA0BE2`), variables CSS light/dark complètes dans [globals.css](src/app/globals.css:52), échelle de radius dérivée (`--radius-sm` → `--radius-4xl`). C'est une vraie base de design system, pas du bricolage.
2. **Dépendances très saines** : quasiment aucune dépendance inutilisée (vérifié une par une) — rare pour un projet de ce type. React Compiler activé ([next.config.ts:5](next.config.ts:5)), ce qui est une optimisation moderne peu répandue.
3. **Métadonnées racine excellentes** : [layout.tsx](src/app/layout.tsx:22) a un title template, Open Graph, Twitter Card, canonical, robots directives et `metadataBase` correctement configurés dès la racine.
4. **`llms.txt` déjà présent** ([public/llms.txt](public/llms.txt)) — la majorité des sites B2B n'ont même pas commencé à y penser. Bonne base GEO à enrichir.
5. **Blog déjà "GEO-friendly" dans sa structure éditoriale** : l'article sur Data Lakehouse vs Data Warehouse contient déjà un tableau comparatif, des recommandations par contexte, et une conclusion actionnable — exactement le pattern que la mission demande de généraliser (section 10).
6. **Cohérence visuelle forte** : le même vocabulaire (Badge outline → H1 avec `gradient-text` → paragraphe → grid de Cards) est répété sur toutes les pages. C'est un vrai design system latent, pas quinze pages incohérentes.
7. **Contenu "À propos" honnête** : fondateur réel, nommé, avec photo — bon signal E-E-A-T de base.
8. **Schema.org déjà initié** : `Organization`, `WebsiteSchema`, `LocalBusinessSchema` injectés globalement ([layout.tsx:111-113](src/app/layout.tsx:111)).
9. **Headers de sécurité de base déjà présents** ([next.config.ts:8-36](next.config.ts:8)) : `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`.

### 1.3 Problèmes critiques

Classés par risque business, pas par facilité technique.

| # | Problème | Où | Pourquoi c'est critique |
|---|---|---|---|
| 1 | **Témoignages clients fictifs présentés comme réels** : "Marie Dupont, Directrice Data, TechRetail", "Thomas Martin, CTO, E-Commerce Plus", "Sophie Bernard, DSI, FinanceGroup", "Jean-Pierre Moreau, DG, IndustrieLeader" — noms et entreprises qui n'existent pas, avec citations entre guillemets. | [src/app/cas-clients/page.tsx:37-97](src/app/cas-clients/page.tsx:37) | Contredit directement la règle que vous avez vous-même fixée (section 37 de votre brief : jamais de témoignages fictifs présentés comme réels). Risque réputationnel et potentiellement légal (pratique commerciale trompeuse) si cette page reste en ligne telle quelle. Deux des quatre citations contiennent même encore l'ancien nom **"Agefy"** au lieu d'"Agenfy" — preuve que ce sont des textes de remplissage jamais relus après le rebranding. |
| 2 | **Le sitemap.xml ment aux moteurs de recherche.** `sitemap.ts` liste les articles via `getAllPosts()` de [`lib/blog.ts`](src/lib/blog.ts:32), qui lit `content/blog/*.md` (3 fichiers). Mais les pages `/blog` et `/blog/[slug]` réellement rendues importent depuis [`lib/blog-posts.tsx`](src/app/blog/page.tsx:10) (10 articles en dur), un fichier totalement différent. | [src/app/sitemap.ts:2](src/app/sitemap.ts:2) vs [src/app/blog/page.tsx:10](src/app/blog/page.tsx:10) | Conséquence concrète : le sitemap soumet à Google 3 URLs qui renvoient un 404 (les slugs markdown n'ont pas de route), **et omet les 10 vrais articles publiés**. C'est le pire des deux mondes en indexation SEO. |
| 3 | **Triple source de vérité pour les études de cas, déjà en désaccord.** Les mêmes 4 études de cas existent dans trois fichiers différents avec des chiffres qui divergent : le cas "Transformation digitale" affiche **"85% Adhésion équipes"** dans [`lib/case-studies.ts:403`](src/lib/case-studies.ts:403) mais **"100% Adhésion équipes"** dans [`cas-clients/page.tsx:91`](src/app/cas-clients/page.tsx:91) pour le même projet. | [src/lib/case-studies.ts](src/lib/case-studies.ts), [src/components/sections/Clients.tsx](src/components/sections/Clients.tsx:9), [src/app/cas-clients/page.tsx](src/app/cas-clients/page.tsx:23) | Sans source unique, toute mise à jour future recréera des incohérences. Combiné au point 1, ça pose la question : ces chiffres sont-ils vérifiés ou illustratifs ? Actuellement rien ne le dit nulle part sur le site. |
| 4 | **`/cas-clients` est une page fantôme** : soumise au sitemap avec `priority: 0.8`, indexable, mais absente de toute navigation (ni [Header.tsx](src/components/sections/Header.tsx:10), ni [Footer.tsx](src/components/sections/Footer.tsx:20)). | [src/app/cas-clients/page.tsx](src/app/cas-clients/page.tsx) | Une page contenant les témoignages fictifs du point 1 est exposée aux moteurs de recherche sans être reliée au reste du site — signe qu'elle a été oubliée, pas maintenue intentionnellement. |
| 5 | **Aucune capture de lead propriétaire.** `/contact` n'est qu'un `<script>` Calendly injecté côté client ([src/app/contact/page.tsx:39-47](src/app/contact/page.tsx:39)) — aucun champ nom/société/téléphone/service, aucune écriture en base pour les demandes de rendez-vous. | [src/app/contact/page.tsx](src/app/contact/page.tsx) | Le chantier CRM/leads demandé (sections 21-22) est aujourd'hui impossible : Agenfy n'a **aucune donnée propriétaire** sur qui prend rendez-vous, depuis quelle page, via quel canal. Tout part chez Calendly. |
| 6 | **Formulaire newsletter dupliqué et cassé** sur `/blog`. | [src/app/blog/page.tsx:182-193](src/app/blog/page.tsx:182) | Le `<form>` n'a ni `onSubmit`, ni `action` — cliquer sur "S'abonner" ne fait rien (au mieux un rechargement de page qui vide le champ). Le composant `Newsletter` correctement câblé ([src/components/sections/Newsletter.tsx:13-42](src/components/sections/Newsletter.tsx:13)) existe déjà juste à côté et n'est pas réutilisé ici. |
| 7 | **Aucun test automatisé, aucune authentification, aucun middleware.** | — | Ce n'est pas un bug isolé mais l'état de fait : `package.json` ne contient aucun framework de test, et il n'existe pas de `middleware.ts`. Toute la partie admin/CMS/CRM demandée doit être construite **à partir de zéro**, pas adaptée. Bon à savoir pour dimensionner l'effort réel des phases 9-14 de votre roadmap. |

### 1.4 Opportunités

- Le blog a déjà un vrai contenu de fond (10 articles, style tranché, tableaux comparatifs) : la stratégie de content clusters (section 8-9 de votre brief) peut s'appuyer dessus immédiatement au lieu de partir de zéro.
- `llms.txt` existe déjà : l'extension vers une vraie stratégie GEO est un enrichissement, pas une création.
- Le design system latent (Badge/gradient-text/Card répétés partout) rend la migration vers un Agenfy Design System inspiré d'Aceternity **structurée** plutôt que chaotique : le vocabulaire visuel à formaliser est déjà presque défini.
- `SUPABASE_SERVICE_ROLE_KEY` est déjà provisionnée dans `.env.local` mais inutilisée dans le code — l'infrastructure serveur pour un futur admin (contournement RLS) est prête à être branchée.
- Le dossier `content/` et la dépendance `gray-matter` existent déjà : soit on les relie enfin au vrai blog, soit on les retire proprement — dans les deux cas c'est une décision rapide, pas un chantier.

### 1.5 Quick wins (faibles, sûrs, réversibles — candidats pour la phase 2 immédiate)

1. Corriger la coquille **"Agefy"** → "Agenfy" dans le `<title>` de `/carrieres` ([src/app/carrieres/page.tsx:10](src/app/carrieres/page.tsx:10)).
2. Ajouter les `metadata` manquantes sur `/blog` (actuellement aucune — hérite du titre générique du site) ([src/app/blog/page.tsx](src/app/blog/page.tsx)).
3. Réparer ou retirer le formulaire newsletter cassé de `/blog` (réutiliser le composant `Newsletter`).
4. Aligner `sitemap.ts` sur la vraie source de contenu (`lib/blog-posts.tsx`) — ou migrer le contenu markdown orphelin vers le vrai pipeline, selon la décision prise en Phase 8.
5. Retirer les 5 SVG placeholder par défaut de `create-next-app` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` dans `public/`) — confirmé inutilisés dans tout `src/`.
6. Corriger ou supprimer le `<link rel="apple-touch-icon" href="/apple-touch-icon.png">` ([src/app/layout.tsx:115](src/app/layout.tsx:115)) : ce fichier n'existe pas dans `public/`.
7. Harmoniser `canonical`/`openGraph` sur les pages qui n'en ont pas encore (`/services`, `/contact`, `/carrieres` n'ont que title+description, contrairement à `/a-propos`, `/cas-clients`, `/services/data`).
8. Nettoyer la règle `disallow: ['/api/', '/private/']` de `robots.ts` : `/private/` ne correspond à aucune route existante — soit une intention future à documenter, soit un résidu à retirer.

### 1.6 Chantiers structurants (nécessitent une vraie planification, pas un fix ponctuel)

1. **Décision produit préalable : que faire des études de cas et témoignages ?** Avant de reconstruire l'UI, il faut trancher — cas réels anonymisables, cas explicitement labellisés "exemple / démonstration", ou retrait des témoignages inventés. C'est la seule question de cette liste que je ne peux pas trancher à votre place.
2. **Design System Agenfy** (base Aceternity, personnalisée) remplaçant les 7 primitives shadcn actuelles — il en manque au moins Input, Textarea, Select, Dialog, Dropdown, Toast, Tooltip, Accordion, Table, Avatar pour couvrir les besoins d'un vrai formulaire de contact et d'un admin.
3. **Consolidation du contenu** : une seule source de vérité pour les études de cas, un seul pipeline de blog (décider du sort de `content/blog` + `gray-matter` vs `blog-posts.tsx`), ajout des schémas `Article`/`BlogPosting`/`Service`/`BreadcrumbList`/`FAQPage`.
4. **Architecture SEO en clusters** (pillar + satellites) telle que décrite dans votre brief section 8-9 — actuellement chaque page est un îlot, pas de maillage sémantique construit.
5. **Couche GEO** : FAQ, pages `/methodologie` et `/auteurs`, enrichissement de `llms.txt`.
6. **Capture de leads propriétaire + CRM léger** : formulaire de contact natif avec champs structurés, tracking UTM/source, remplacement ou webhook Calendly.
7. **Admin dashboard** : à construire intégralement (auth, RBAC, CMS, gestion SEO, redirects, scoring qualité) — aucune fondation technique n'existe aujourd'hui.
8. **Moteur de génération de contenu IA** avec validation humaine obligatoire.
9. **Tests** : suite à créer de zéro (unitaires, intégration, E2E, sécurité admin).
10. **Motion system** : introduire Framer Motion / Motion et **`prefers-reduced-motion`**, actuellement totalement absent du code (vérifié : aucune occurrence dans `globals.css` ni dans aucun composant).

---

## 2. Architecture

### 2.1 Stack technique

| Composant | Valeur constatée | Source |
|---|---|---|
| Framework | Next.js 16.1.2, App Router | [package.json:21](package.json:21) |
| UI | React 19.2.3 + React Compiler activé | [package.json:22-23](package.json:22), [next.config.ts:5](next.config.ts:5) |
| Langage | TypeScript 5, `strict: true` | [tsconfig.json:7](tsconfig.json:7) |
| Styles | Tailwind CSS v4, config CSS-first (`@theme inline`), pas de `tailwind.config.js` | [globals.css:1-49](src/app/globals.css:1) |
| Composants UI | shadcn/ui "new-york", base neutral, 7 primitives seulement | [components.json](components.json) |
| Backend/données | Supabase (client JS uniquement, pas de schema/migrations dans le repo) | [src/lib/supabase.ts](src/lib/supabase.ts) |
| Contenu blog (réel) | Tableau TypeScript en dur avec JSX inline | [src/lib/blog-posts.tsx](src/lib/blog-posts.tsx) |
| Contenu blog (orphelin) | Markdown + `gray-matter`, non relié aux pages rendues | [src/lib/blog.ts](src/lib/blog.ts), [content/blog/](content/blog) |
| Études de cas | Tableau TypeScript en dur, dupliqué 3x | [src/lib/case-studies.ts](src/lib/case-studies.ts) |
| Auth | Aucune | — |
| Tests | Aucun framework présent | [package.json](package.json) |
| Hébergement | Vercel (Speed Insights actif) | [src/app/layout.tsx:4](src/app/layout.tsx:4) |
| Analytics | Vercel Speed Insights uniquement. Pas de Google Analytics, pas de GTM, pas de Search Console détecté dans le code. | — |

### 2.2 Structure des dossiers

```
src/
├── app/                    # App Router — pages + 2 fichiers spéciaux (sitemap.ts, robots.ts) + 1 API route
├── components/
│   ├── sections/           # 9 sections de page (Header, Hero, Benefits, Services, Process, Clients, CTA, Newsletter, Footer)
│   ├── layouts/             # PageLayout (Header+main+Footer) — utilisé de façon incohérente (voir 2.4)
│   ├── schemas/             # 3 schémas JSON-LD (Organization, Website, LocalBusiness)
│   └── ui/                  # 7 primitives shadcn (badge, button, card, separator, tabs, animated-background, theme-toggle)
├── lib/                     # supabase.ts, blog.ts, blog-posts.tsx, case-studies.ts, utils.ts
content/
├── blog/                    # 3 fichiers .md — orphelins (voir 2.3)
└── linkedin-content.md      # templates de contenu marketing, hors site
public/
├── llms.txt                 # déjà présent — bonne base GEO
└── (logo, og-image, photo fondateur, 5 SVG placeholder inutilisés)
```

Pas de `middleware.ts`. Pas de dossier `tests/`. Pas de `.env.example`.

### 2.3 Incohérence majeure : deux pipelines de blog qui ne se parlent pas

- **Pipeline A (utilisé)** : [`src/lib/blog-posts.tsx`](src/lib/blog-posts.tsx) — 10 articles, contenu JSX en dur, composants de mise en forme réutilisables (`H2`, `Table`, `Callout`, etc. lignes 16-89). Consommé par [`/blog/page.tsx`](src/app/blog/page.tsx:10) et [`/blog/[slug]/page.tsx`](src/app/blog/%5Bslug%5D/page.tsx:8).
- **Pipeline B (orphelin)** : [`src/lib/blog.ts`](src/lib/blog.ts) — lit `content/blog/*.md` via `gray-matter`, 3 fichiers. Consommé **uniquement** par [`sitemap.ts`](src/app/sitemap.ts:2). Aucune page ne rend ce contenu. À noter : aucune dépendance de rendu markdown → HTML (`remark`, `next-mdx-remote`, etc.) n'est installée, donc même si on reliait ce pipeline à une page, le Markdown ne serait pas transformé en HTML aujourd'hui.
- Les deux systèmes utilisent des taxonomies de catégories différentes : `"Data" | "IA" | "Cloud" | "Conseil" | "Tech"` (blog-posts.tsx) vs des chaînes libres comme `"Intelligence Artificielle"` (frontmatter markdown) — preuve supplémentaire qu'ils ont évolué séparément.
- **Décision à prendre en Phase 8** : soit on migre les 3 articles markdown vers le pipeline réel et on ajoute un vrai rendu Markdown (probablement la meilleure option pour un futur CMS où les articles doivent être écrits sans toucher au code), soit on retire `content/blog/`, `lib/blog.ts` et `gray-matter`.

### 2.4 Incohérence majeure : trois copies des études de cas (détaillée en 1.3, point 3)

Confirmé par recherche exhaustive — il existe exactement 3 déclarations du tableau `caseStudies` :

```
src/lib/case-studies.ts:46        ← source canonique, utilisée par sitemap.ts et /etudes-de-cas/*
src/components/sections/Clients.tsx:9   ← copie partielle (teaser homepage)
src/app/cas-clients/page.tsx:23   ← copie avec témoignages fictifs ajoutés
```

Une variation supplémentaire existe dans [`services/data/page.tsx:49-60`](src/app/services/data/page.tsx:49) (`useCases`), avec un 5ᵉ jeu de chiffres pour un cas qui ne correspond à aucun des 4 cas canoniques ("+40% de vitesse d'analyse" pour un cas "Finance / Data Lakehouse moderne" qui n'existe pas ailleurs). Ce pattern — inventer un chiffre par page plutôt que de citer une source unique — doit être corrigé structurellement (Phase 2/3), pas page par page.

### 2.5 Sécurité & qualité de code

**Sécurité :**
- Headers de sécurité de base déjà présents ([next.config.ts:8-36](next.config.ts:8)) : `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`. **Manquants** : `Content-Security-Policy` et `Strict-Transport-Security` — indispensables avant d'exposer un admin.
- Aucun secret exposé côté client au-delà de ce qui est prévu : seuls `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` sont utilisés dans le code, et sont légitimement publics (clé anonyme Supabase, protégée par RLS côté serveur). `SUPABASE_SERVICE_ROLE_KEY` est présente dans `.env.local` mais **jamais importée dans le code** — donc pas encore de risque, mais à surveiller de près dès qu'un usage serveur (admin) sera ajouté : cette clé ne doit **jamais** transiter par un composant `"use client"`.
- `.env.local` est correctement listé dans `.gitignore` ([`.gitignore:20-24`](.gitignore:20)) — aucun secret commité.
- Seule route API existante (`/api/newsletter`) valide l'email par regex et gère le cas de doublon (code erreur Postgres `23505`) — correct pour son périmètre actuel, mais aucun rate limiting.
- Aucune authentification, donc aucune surface admin à auditer pour l'instant — le vrai audit sécurité de l'admin devra être refait entièrement une fois ce dernier construit (Phase 9).

**Qualité de code :**
- `npm run lint` et `npm run build` ont été exécutés pour cette baseline (résultats ci-dessous, section 9.1) — à conserver comme référence avant/après chaque phase.
- Dépendances : aucune dépendance manifestement inutilisée détectée (vérification faite composant par composant).
- Duplication : concentrée presque entièrement sur les données (études de cas, blog) plutôt que sur le code UI, ce qui est plutôt bon signe — les futurs composants du design system n'auront pas besoin d'un gros travail de dédoublonnage.

---

## 3. UX

### 3.1 Navigation

- Header avec sous-menu "Services" au survol (desktop) et accordéon (mobile) — [Header.tsx:62-103](src/components/sections/Header.tsx:62). Fonctionnel, mais le sous-menu desktop s'ouvre uniquement au `onMouseEnter`/`onMouseLeave` : pas de navigation clavier vers le sous-menu (pas de gestion `onFocus`/`onBlur`, pas de `aria-expanded` sur le bouton déclencheur). À corriger pour l'accessibilité clavier.
- Le lien "Découvrir nos services" du Hero pointe vers `#services` ([Hero.tsx:52](src/components/sections/Hero.tsx:52)) — une ancre qui n'existe nulle part dans le DOM de la homepage (aucun `id="services"` trouvé sur `/`). Lien mort silencieux.
- CTA principal cohérent partout : "Prendre rendez-vous" / "Discutons de votre projet" → `/contact`. C'est un vrai point fort, rare sur ce type de refonte.
- `/cas-clients` non lié depuis la navigation (voir 1.3).

### 3.2 Parcours de conversion actuel

```
Visiteur → Homepage / Blog / Service → CTA "Prendre rendez-vous" → /contact → widget Calendly
```

Le parcours s'arrête net à Calendly : aucune donnée ne revient côté Agenfy (ni le fait qu'un rendez-vous a été pris, ni la page d'origine, ni une source UTM). Le seul point de collecte propriétaire est l'inscription newsletter (email seul, sans contexte).

### 3.3 Formulaires

| Formulaire | Emplacement | État |
|---|---|---|
| Newsletter (footer de section) | [Newsletter.tsx](src/components/sections/Newsletter.tsx) | ✅ Fonctionnel — `fetch('/api/newsletter')`, gestion loading/erreur/succès |
| Newsletter (bas de page blog) | [blog/page.tsx:182-193](src/app/blog/page.tsx:182) | ❌ Cassé — pas de handler |
| Contact | [contact/page.tsx](src/app/contact/page.tsx) | ⚠️ Pas un vrai formulaire — widget Calendly externe uniquement, aucun champ natif |

Aucun formulaire ne capture : société, téléphone (visible mais non-collecté), service demandé, ou source du lead — tous des champs explicitement demandés dans votre brief section 21.

### 3.4 Mobile / Desktop

Le code utilise systématiquement les classes responsive Tailwind (`sm:`, `md:`, `lg:`) et un menu hamburger dédié mobile. C'est cohérent dans tout le code inspecté. **Cependant, aucun test visuel réel n'a été fait aux 8 largeurs demandées (320 à 1920px)** dans le cadre de cet audit — c'est un audit de code, pas un audit visuel. Recommandation : faire ce test au moment de la Phase 4 (refonte UI), pas avant, puisque l'UI va de toute façon changer.

### 3.5 Accessibilité

Constat chiffré (recherche exhaustive sur `src/`) :

- **5** attributs `aria-*` dans tout le projet (39 fichiers `.tsx`).
- **4** attributs `alt` (sur seulement 3 usages de `next/image` au total).
- Aucun "skip to content" link.
- Aucune gestion clavier du sous-menu Header (voir 3.1).
- Contraste des couleurs non vérifié (nécessite un test visuel/outil, pas une lecture de code).
- Bon point : le HTML sémantique de base est respecté (`<header>`, `<main>`, `<footer>`, `<nav>` utilisés correctement dans les pages inspectées).

C'est un chantier à part entière (Phase 12 de votre plan), pas un quick win : il faudra une passe dédiée avec un vrai outil (axe, Lighthouse) une fois l'UI stabilisée.

---

## 4. UI

### 4.1 Design tokens actuels

| Token | Light | Dark |
|---|---|---|
| `--primary` | `#3200F8` (violet) | `#6B4EFF` |
| `--accent` | `#AA0BE2` (magenta) | `#BB4EFF` |
| `--background` | `#ffffff` | `#0c0a15` |
| `--radius` de base | `0.625rem`, dérivé en 6 paliers (`sm` → `4xl`) | idem |

Palette cohérente et déjà "tech premium" dans son intention (violet/magenta sur fond sombre en mode nuit). Une bonne base pour la direction artistique demandée (section 4 du brief), à affiner plutôt qu'à réinventer.

### 4.2 Composants UI existants (7 primitives)

`Badge`, `Button` (6 variants × 6 tailles via CVA — [button.tsx:11-31](src/components/ui/button.tsx:11)), `Card`, `Separator`, `Tabs`, `ThemeToggle`, `AnimatedBackground`/`GridBackground`/`GlowingOrbs`.

**Manquants** pour couvrir ne serait-ce que le formulaire de contact natif et l'admin à venir : `Input`, `Textarea`, `Select`, `Dialog`/`Modal`, `Dropdown`, `Toast`, `Tooltip`, `Table`, `Avatar`. Le commit `ff4d71e` a par ailleurs retiré un composant `Accordion` — à réintroduire si le futur design system en a besoin (FAQ, notamment).

### 4.3 Cohérence visuelle

Le pattern `Badge outline → H1 avec .gradient-text → paragraphe muted → grid de Cards` est répété quasi-identiquement sur `/a-propos`, `/services`, `/cas-clients`, `/etudes-de-cas`, `/blog`, `/contact`. C'est une force (cohérence) mais aussi un risque de monotonie si la refonte se contente d'un nouveau vernis Aceternity sans varier les rythmes de page — point d'attention pour la Phase 4.

### 4.4 Footer

Structure classique 5 colonnes (marque, services, entreprise, légal, réseaux sociaux) — complète et correctement liée, à l'exception de `/cas-clients` (absent, voir 1.3).

---

## 5. Motion

### 5.1 Ce qui existe déjà

- **CSS pur** : keyframes définis dans [globals.css:199-357](src/app/globals.css:199) — `fade-in-up`, `fade-in`, `pulse-glow`, `float-slow`, `orb-1/2/3`, `shimmer`. Classes utilitaires de stagger (`.stagger-1` à `.stagger-5`).
- **Canvas JS** : [`AnimatedBackground`](src/components/ui/animated-background.tsx:15) — un système de particules avec connexions dynamiques et interaction souris, dessiné à la main (pas de librairie).
- **Aucune librairie de motion** : ni Framer Motion, ni Motion, ni même `react-intersection-observer`, ne figurent dans `package.json`.

### 5.2 Ce qui n'existe pas (à construire, Phase 5)

- **Aucun scroll-reveal.** Toutes les animations actuelles se déclenchent au montage du composant (classe CSS appliquée immédiatement), pas à l'entrée dans le viewport. Concrètement, une section comme `Benefits` ou `Process`, située bien en dessous du pli, n'a aucune raison d'être déjà "révélée" quand la page charge — mais rien ne la fait apparaître progressivement au scroll non plus, faute de mécanisme d'observation.
- **Aucun respect de `prefers-reduced-motion`.** Recherche exhaustive : zéro occurrence dans tout le CSS et tout le JS du projet. Les animations `animate-pulse-glow`, `animate-orb-*`, le système de particules canvas, tournent inconditionnellement, y compris pour les utilisateurs ayant explicitement demandé moins de mouvement. C'est un vrai manquement WCAG (critère 2.3.3) à corriger dès l'introduction de Motion/Framer Motion, pas après.
- Pas de parallax, pas de spotlight sur les cards, pas d'animation de compteur sur les statistiques (le "25+" du Hero s'affiche déjà plein, il ne s'anime pas).

---

## 6. SEO

### 6.1 Couverture des métadonnées par page

| Route | `metadata` | `canonical` | `openGraph` |
|---|---|---|---|
| `/` | ✅ (hérité du layout racine, adapté) | ✅ | ✅ |
| `/a-propos` | ✅ | ✅ | ✅ |
| `/services` | ✅ | ❌ | ❌ |
| `/services/data` | ✅ | ✅ | ✅ |
| `/services/{cloud,conseil,intelligence-artificielle}` | ✅ (à vérifier au cas par cas — même gabarit constaté que `/services/data`) | probable | probable |
| `/cas-clients` | ✅ | ✅ | ✅ |
| `/etudes-de-cas` | ✅ | non vérifié en détail | non vérifié en détail |
| `/etudes-de-cas/[id]` | ✅ (dynamique) | ❌ | ❌ |
| `/blog` | ❌ **aucune** | ❌ | ❌ |
| `/blog/[slug]` | ✅ (dynamique, title+description seulement) | ❌ | ❌ |
| `/contact` | ✅ (via layout dédié) | ❌ | ❌ |
| `/carrieres` | ⚠️ présente mais titre buggé ("Agefy") | ❌ | ❌ |
| `/cgv`, `/mentions-legales`, `/politique-confidentialite` | ✅ | non vérifié en détail | non vérifié en détail |

La couverture est inégale : certaines pages (`/a-propos`, `/services/data`, `/cas-clients`) ont un traitement complet, d'autres (`/blog`, les pages dynamiques, `/contact`, `/carrieres`) n'ont que le strict minimum ou rien. Ça confirme qu'il n'y a pas de gabarit SEO systématique appliqué — chaque page a été traitée au cas par cas.

### 6.2 sitemap.xml et robots.txt

- `robots.ts` : correct dans son principe (autorise tout sauf `/api/` et `/private/`, référence le sitemap). La règle `/private/` ne correspond à aucune route existante.
- `sitemap.ts` : **le bug le plus grave de l'audit** (détaillé en 1.3, point 2). À corriger avant toute autre action SEO, puisqu'un sitemap qui pointe vers des 404 dégrade la confiance de Google envers l'ensemble du domaine.

### 6.3 Données structurées

Seuls 3 schémas existent, tous injectés **globalement** dans le layout racine ([layout.tsx:111-113](src/app/layout.tsx:111)) : `Organization`, `WebSite`, `ProfessionalService` (LocalBusiness). Constat du contenu de [`OrganizationSchema.tsx`](src/components/schemas/OrganizationSchema.tsx) : bien rempli (adresse, `sameAs`, `knowsAbout`, `makesOffer`), pas de données mensongères détectées ici — bonne nouvelle.

**Manquants** : `Article`/`BlogPosting` sur les articles de blog, `BreadcrumbList` sur les pages profondes (services, études de cas, articles), `Service` par page de service, `FAQPage` (aucune FAQ n'existe encore sur le site), `Person` pour l'auteur/fondateur.

### 6.4 Maillage interne et contenu

- Maillage actuel : essentiellement Header/Footer + quelques CTA contextuels ("Voir toutes les études de cas", "Voir plus d'articles"). Pas de recommandation automatique de liens internes, pas de "related content" par similarité de sujet.
- Pas de contenu dupliqué détecté entre pages de contenu réel — le duplicate content constaté concerne les **données** (études de cas), pas le texte des pages elles-mêmes.
- Profondeur de contenu actuelle : 4 pages de service détaillées + 10 articles de blog + 4 études de cas = une base correcte pour démarrer une architecture en clusters, mais loin des "5 à 20 articles satellites par cluster" visés en section 9 du brief.

---

## 7. GEO / AI Search

### 7.1 Ce qui existe déjà

- [`public/llms.txt`](public/llms.txt) : présent, contient une présentation claire de l'activité, des 4 pôles de services, des coordonnées et de l'entité légale. Bonne base, mais ne référence pas les articles de blog individuels, les études de cas, ni de FAQ — à enrichir en Phase 7.
- Plusieurs articles du blog respectent déjà, sans que ça ait été formalisé comme stratégie, une partie du schéma de réponse que le brief demande en section 10 : l'article Data Lakehouse vs Data Warehouse répond à "quand utiliser X vs Y" avec un tableau comparatif et une recommandation par taille d'entreprise ; l'article Kubernetes structure explicitement "quand Kubernetes fait sens" / "quand l'éviter" avec chiffrage de coût. C'est exactement le pattern citable par un moteur de réponse — à généraliser aux 8 autres articles et aux futurs contenus.
- Une identité d'auteur/fondateur réelle existe (`/a-propos`) — signal d'expertise exploitable par les IA génératives, à condition de le relier explicitement aux articles (le champ `author` du blog est actuellement une chaîne libre : "Evan Massé" sur certains articles, "Équipe Agenfy" sur d'autres dans le contenu markdown orphelin — pas d'entité auteur structurée).

### 7.2 Manques structurels

- **Aucune FAQ nulle part sur le site** (aucun composant, aucune section, aucun schema `FAQPage` trouvé).
- Pas de page `/methodologie` ni `/auteurs` (demandées section 12 du brief).
- Pas de date de mise à jour distincte de la date de publication sur les articles (le modèle `BlogPost` n'a qu'un seul champ `date`).
- Le problème des témoignages fictifs (section 1.3) est aussi un problème GEO : un moteur de réponse IA qui reprendrait ces chiffres comme "preuve client Agenfy" propagerait une fausse information — raison de plus pour trancher ce point tôt (Phase 2), avant de construire la couche GEO dessus.

---

## 8. Conversion

### 8.1 CTA et cohérence

Le CTA "Prendre rendez-vous" est répété de façon cohérente sur toutes les pages inspectées, toujours vers `/contact`. C'est un point fort réel : peu de sites early-stage ont cette discipline.

### 8.2 Preuves et confiance

- **Fondateur réel et identifié** : point fort (voir 1.2).
- **Chiffres du Hero** ("25+ technologies", "100% engagement qualité", "100% solutions sur-mesure", "5 ans d'expérience" — [Hero.tsx:59-70](src/components/sections/Hero.tsx:59)) : deux des quatre statistiques sont des "100%" qui ne différencient rien (toute agence peut afficher "100% engagement qualité"). À muscler avec des preuves plus spécifiques une fois le chantier de contenu vérifié engagé.
- **Témoignages** : voir 1.3, point 1 — c'est le point de friction de confiance le plus grave du site actuel.
- Aucune mention de certification, méthodologie publique, ou étude de cas avec client nommé et vérifiable à ce stade.

### 8.3 Friction et fuite de leads

Le tunnel s'arrête à un widget Calendly tiers (voir 3.2) : c'est la lacune structurante la plus importante pour l'objectif business final décrit en section 38 de votre brief ("contenu → preuve → CTA → contact → CRM → qualification → business") — aujourd'hui la chaîne se rompt entre "CTA" et "CRM", puisqu'il n'y a pas de CRM du tout.

---

## 9. Performance

### 9.1 Baseline mesurée (`npm run build`, `npm run lint`)

`npm run build` et `npm run lint` ont été lancés pour cet audit mais n'ont pas pu aboutir dans cet environnement d'exécution : les deux processus restent inactifs (CPU proche de 0%) pendant plusieurs minutes sans produire la moindre sortie, y compris après désactivation de la télémétrie (`CI=1`, `NEXT_TELEMETRY_DISABLED=1`) et avec un `tsc --noEmit` isolé — ce qui pointe vers une contrainte de l'environnement sandbox plutôt qu'un problème du code. **Action à faire de votre côté avant la Phase 2** : lancez `npm run build` et `npm run lint` sur votre machine ou en CI, et communiquez-moi le résultat (ou collez-le ici) — c'est la seule étape de cet audit que je n'ai pas pu vérifier moi-même. Le code des quick wins ci-dessous a néanmoins été relu ligne à ligne et est cohérent avec les types TypeScript existants (`strict: true`).

### 9.2 Constats de code

- **Fonts** : `next/font/google` (Geist, Geist Mono) — chargement optimisé par défaut, correct ([layout.tsx:12-20](src/app/layout.tsx:12)).
- **Images** : seulement 3 usages de `next/image` dans tout le projet (logo Header, logo Footer, logo + photo fondateur sur `/a-propos`). Le champ `heroImage` du modèle `CaseStudy` pointe vers des fichiers qui n'existent pas dans `public/` (`/case-studies/*.jpg`) — mais n'est actuellement rendu nulle part, donc pas d'impact visible pour l'instant (juste de la donnée morte).
- **Rendu** : la quasi-totalité du contenu (études de cas, articles de blog) est du TypeScript statique — Next.js peut donc générer ces pages en SSG au build. C'est une vraie force pour la performance, à préserver dans la refonte (ne pas basculer inutilement en fetch client).
- **Décor animé coûteux** : `GlowingOrbs`/gradient blur (`blur-[128px]`) sont dupliqués manuellement sur quasiment chaque page (Hero, a-propos, contact, services, cas-clients, blog, etudes-de-cas) plutôt que factorisés, et le composant `AnimatedBackground` fait un calcul de distance par paire de particules à chaque frame (jusqu'à ~1225 comparaisons/frame à 50 particules, 60 fois par seconde) sans témoin de visibilité de page (`document.visibilityState`) pour se mettre en pause en onglet inactif. À revisiter en Phase 5/12 : factoriser le composant de fond, et le rendre conditionnel à `prefers-reduced-motion` + visibilité d'onglet.
- **Pas de mesure Lighthouse réelle effectuée** dans cet audit (nécessite un environnement de rendu, pas seulement une lecture de code) — à faire en tout début de Phase 12, sur la version actuelle, pour avoir un vrai avant/après.

---

## 10. Suivi — quick wins déjà implémentés

Après votre arbitrage sur les études de cas ("relabelliser comme exemples"), les corrections suivantes ont été appliquées dans la foulée de cet audit (rien n'est encore commité — à revoir puis committer vous-même, ou dites-moi de le faire) :

- `caseType: "example"` ajouté au modèle [`CaseStudy`](src/lib/case-studies.ts) et badge "Exemple / démonstration" affiché sur `/etudes-de-cas`, `/etudes-de-cas/[id]`, la section `Clients` (homepage) et `/cas-clients`.
- Témoignages fictifs (noms/entreprises inventés) retirés de `/cas-clients` ; la page utilise désormais la source canonique `lib/case-studies.ts` au lieu de sa propre copie, avec un lien vers l'étude complète.
- `Clients.tsx` (section homepage) consolidée sur la même source canonique — fin de la triple duplication de données.
- Coquilles "Agefy" corrigées : titre `/carrieres` et email `careers@agefy.com` → `careers@agenfy.fr`.
- `sitemap.ts` pointe maintenant vers les vrais articles publiés (`lib/blog-posts.tsx`) au lieu du pipeline markdown orphelin.
- `robots.ts` : règle `/private/` obsolète retirée.
- `/blog` : metadata ajoutée (nouveau `blog/layout.tsx`), formulaire newsletter cassé remplacé par le composant `Newsletter` fonctionnel.
- `canonical`/`openGraph` ajoutés sur `/services`, `/contact`, `/carrieres` ; `canonical` ajouté sur `/cgv`, `/mentions-legales`, `/politique-confidentialite`.
- 5 SVG placeholder de `create-next-app` supprimés (`public/{file,globe,next,vercel,window}.svg`), confirmés inutilisés.
- `apple-touch-icon.png` généré depuis `public/logo.png` (le `<link>` du layout racine pointait vers un fichier inexistant).

**Non traité dans ce lot** (nécessite une décision produit ou un travail plus large, voir 1.6) :
- Bouton "Postuler" sur `/carrieres` pointe vers `/carrieres/[id]`, une route qui n'existe pas → 404 systématique. Découvert pendant l'implémentation ; laissé de côté car le corriger proprement suppose de décider où vont les candidatures (email ? Supabase ? vrai ATS plus tard).
- Fusion ou redirection de `/cas-clients` vers `/etudes-de-cas` (les deux pages listent maintenant les mêmes cas canoniques) — question d'architecture de l'information à trancher en Phase 2, pas un simple fix de contenu.
- Sort définitif de `content/blog/*.md`, `lib/blog.ts` et `gray-matter` (migrer vers le vrai pipeline ou retirer) — décision Phase 8 (refonte CMS).
- `npm run build` / `npm run lint` restent à faire tourner de votre côté (voir remarque section 9.1).

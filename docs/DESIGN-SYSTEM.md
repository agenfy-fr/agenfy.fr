# Agenfy Design System — Architecture (Phase 2)

Ce document définit l'architecture du design system avant sa construction (Phase 3). Il ne remplace pas shadcn par une "démo Aceternity" : il définit un système propre à Agenfy dans lequel des composants inspirés d'Aceternity sont adaptés à nos tokens.

## 1. Direction artistique

Premium, technologique, sobre, crédible, B2B. Inspiration Linear / Vercel / Stripe / Anthropic sur la **retenue** (beaucoup d'espace, peu de bruit visuel, une seule idée par écran), pas sur le vocabulaire visuel — Agenfy garde son violet/magenta et sa propre voix.

Règle de motion : **80% sobriété / 20% spectaculaire** (détail Phase 5, §5 ci-dessous).

## 2. Fondations (tokens)

### 2.1 Déjà en place — à conserver

- Couleurs : `--primary` (#3200F8 light / #6B4EFF dark), `--accent` (#AA0BE2 / #BB4EFF), palette complète light/dark dans [globals.css](../src/app/globals.css).
- Radius : échelle `--radius-sm` → `--radius-4xl` dérivée de `--radius: 0.625rem`.
- Police : Geist / Geist Mono via `next/font`.

### 2.2 À ajouter (manquant aujourd'hui)

| Token | Valeurs proposées | Usage |
|---|---|---|
| `--shadow-sm/md/lg/glow` | Échelle d'élévation cohérente (aujourd'hui : `shadow-xl` ad hoc à quelques endroits, `.glow` isolé dans globals.css) | Cards, dropdowns, modals futurs |
| `--ease-out-soft`, `--ease-spring` | `cubic-bezier` définis une fois, réutilisés partout (aujourd'hui : durées/easings répétés en dur dans chaque composant : `duration-300`, `ease-out`...) | Toutes les transitions Motion |
| `--duration-fast/base/slow` | 150ms / 300ms / 600ms | Micro-interactions vs. transitions de section |
| Échelle typographique | `text-display`, `text-h1`...`text-h4`, `text-body`, `text-caption` en tokens Tailwind `@theme` plutôt que des tailles réécrites à chaque page (`text-4xl sm:text-5xl lg:text-6xl` copié-collé sur 10 pages) | Cohérence + moins de duplication |

Ces tokens vont dans `globals.css` sous `@theme inline`, à côté des tokens couleur existants — pas de nouveau système de config.

## 3. Taxonomie des composants

```
src/components/
├── ui/         # Primitives (existant : Button, Card, Badge, Separator, Tabs)
│               # À ajouter : Input, Textarea, Select, Dialog, Dropdown, Toast, Tooltip, Table, Avatar, Accordion
├── effects/     # NOUVEAU — composants motion/visuels adaptés d'Aceternity (voir §4)
├── sections/    # Compositions de page (existant, inchangé)
├── layouts/     # Layouts réutilisables (existant, inchangé)
└── schemas/     # JSON-LD (existant, étendu en Phase 6 — voir SEO-STRATEGY.md)
```

`effects/` est le nouveau dossier : c'est là que vivent les adaptations Aceternity (spotlight, beams, bento grid, timeline...). Elles restent des composants **présentationnels**, sans logique métier, pour rester réutilisables sur tout le site.

## 4. Composants Aceternity à adapter — priorisés par usage réel

Ne pas importer la liste complète d'Aceternity. Seulement ce qui sert une section précise de la nouvelle home (mission §7) :

| Composant Aceternity (inspiration) | Usage Agenfy | Priorité |
|---|---|---|
| Background Beams / Grid | Fond du Hero, remplace le canvas `AnimatedBackground` actuellement **inutilisé** (mort, confirmé en Phase 1) et les orbes dupliquées manuellement sur ~8 pages | Haute — Phase 4 |
| Spotlight Card | Cards de la section "Expertise" (Bento Grid Data/IA/Cloud/Conseil) | Haute — Phase 4 |
| Bento Grid | Section "Expertise" de la home | Haute — Phase 4 |
| Text Generate / Reveal | Headline du Hero | Moyenne — Phase 5 |
| Timeline | Section "Méthodologie" | Moyenne — Phase 5 |
| Compare / Sticky Scroll | Études de cas (transition plus immersive, mission §6) | Basse — après Phase 4 |

Chaque adaptation : recopier le mécanisme (souvent juste du CSS/SVG + Motion), **jeter les couleurs et le copy de la démo**, appliquer les tokens Agenfy définis en §2.

## 5. Système de motion

- Dépendance à ajouter : **`motion`** (le package qui a remplacé `framer-motion`, même équipe/API).
- Toutes les animations d'entrée passent par un wrapper unique `<Reveal>` (nouveau, dans `effects/`) qui encapsule `prefers-reduced-motion` une seule fois — pas de vérification dispersée dans chaque composant.
- Règle non négociable : **aucune animation sans fallback `prefers-reduced-motion`**. Le hook `useReducedMotion` de `motion` alimente `<Reveal>` ; si l'utilisateur a activé la préférence, `<Reveal>` rend le contenu directement, sans transition.
- Le composant `useIsClient` créé en Phase 1 ([src/hooks/use-is-client.ts](../src/hooks/use-is-client.ts)) sert de base pour tout composant motion qui doit éviter un mismatch d'hydratation (déjà le cas pour `theme-toggle` et l'ex-`AnimatedBackground`).
- Les stats animées (mission : "25+ technologies" qui s'anime) utilisent un simple hook `useCountUp` déclenché par `<Reveal>` au scroll, pas de librairie dédiée supplémentaire.

## 6. Ce que Phase 3 doit livrer concrètement

1. Tokens étendus dans `globals.css` (§2.2).
2. `src/components/effects/` créé avec `Reveal`, `Spotlight`, `BentoGrid`, `BackgroundBeams`.
3. Primitives manquantes ajoutées à `ui/` au fur et à mesure des besoins réels (pas toutes d'un coup — seulement quand un composant de Phase 4 en a besoin, ex. `Input`/`Textarea` quand le vrai formulaire de contact sera construit).
4. Navbar et Hero refaits en premier (composants les plus visibles, les plus visités).

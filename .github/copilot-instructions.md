# Agenfy - Instructions pour Agents IA

## Vue d'ensemble
Site corporate français pour Agenfy, cabinet de conseil tech (Data, IA, Cloud). Stack : **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, **TypeScript**, **Supabase**.

## Architecture

### Structure des dossiers
```
src/
├── app/           # Routes Next.js App Router (pages + API routes)
├── components/
│   ├── sections/  # Composants de page (Header, Footer, Hero, CTA...)
│   ├── layouts/   # Layouts réutilisables (PageLayout)
│   └── ui/        # Composants UI shadcn/ui (Button, Card, Badge...)
├── lib/           # Utilitaires et services (supabase, blog, case-studies)
content/           # Contenu markdown pour le blog (non encore peuplé)
```

### Patterns clés
- **Imports aliasés** : Utiliser `@/*` pour `src/*` (ex: `import { Button } from "@/components/ui/button"`)
- **Barrel exports** : Les sections et layouts utilisent des fichiers `index.ts` pour l'export groupé
- **Composants UI** : Basés sur shadcn/ui avec `class-variance-authority` pour les variants

### Pages et routing
- Pages statiques : `/a-propos`, `/services/*`, `/contact`, `/cgv`, `/mentions-legales`
- Pages dynamiques : `/blog/[slug]`, `/etudes-de-cas/[id]`
- API Routes : `/api/newsletter` (POST pour inscription Supabase)

## Conventions de code

### Composants React
```tsx
// Pages : export default function + metadata
export const metadata: Metadata = { title: "...", description: "..." };
export default function PageName() { ... }

// Composants : export named function
export function ComponentName() { ... }

// Client components : directive en première ligne
"use client";
```

### Styling
- **Tailwind v4** avec variables CSS custom dans `globals.css`
- Classes utilitaires : `bg-background`, `text-foreground`, `text-muted-foreground`
- Couleurs primaires : `--primary` (violet), `--accent` (magenta)
- Helper `cn()` de `@/lib/utils` pour merger les classes conditionnelles
- Mode sombre supporté via `next-themes` (classe `.dark`)

### Layout pattern
Utiliser `PageLayout` pour les pages internes avec Header/Footer :
```tsx
import { PageLayout } from "@/components/layouts";
// ou directement Header/Footer depuis @/components/sections
```

## Données et contenu

### Études de cas
Données statiques TypeScript dans `src/lib/case-studies.ts` avec interface `CaseStudy`.

### Blog
Articles Markdown dans `content/blog/` parsés via `gray-matter`. Fonctions dans `src/lib/blog.ts`.

### Newsletter
API Route `/api/newsletter` → table Supabase `newsletter_subscribers`.

## Commandes

```bash
npm run dev    # Serveur de dev (localhost:3000)
npm run build  # Build production
npm run lint   # ESLint
```

## Variables d'environnement requises
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Points d'attention
- **Langue** : Tout le contenu est en français
- **SEO** : Chaque page doit avoir `metadata` avec `title` et `description`
- **Icons** : Utiliser `lucide-react` pour les icônes
- **Images** : Utiliser `next/image` avec `priority` pour les images above-the-fold

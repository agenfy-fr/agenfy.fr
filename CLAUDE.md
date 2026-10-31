# Agenfy — monorepo

Agence IA-first (conseil, agents IA & automatisation, développement IA sur mesure, formation ; Data & Cloud = fondations). Marque de Hasfy SAS. Fondateur : Evan Massé.

## Apps (pnpm workspaces)

| Dossier | Domaine | Rôle |
|---|---|---|
| `apps/web` | www.agenfy.fr | Site public, SEO/GEO, capture de leads |
| `apps/console` | console.agenfy.fr | Back-office équipe (CRM, projets, facturation) + portail client multi-tenant |
| `apps/app` | app.agenfy.fr | Plateforme de formation IA (catalogue, parcours, conformité Qualiopi) |

Commandes : `pnpm install`, `pnpm dev:web|dev:console|dev:app`, `pnpm --filter @agenfy/<app> build`.

## Supabase (un seul projet pour les 3 apps)

- Migrations dans `supabase/migrations/`, **jamais appliquées automatiquement** (SQL Editor ou `supabase db push`).
- Numérotation : `0001-0099` partagé/web, `0100-0199` console, `0200-0299` app.
- Socle d'identité : `0003_core_identity.sql` — `profiles`, `staff` (+ `is_staff()`, `is_staff_admin()`), `organizations` / `organization_members` (+ `is_org_member(org)`, `is_org_manager(org)`).
- Règle RLS : `authenticated` inclut clients et apprenants → toute donnée interne se protège avec `is_staff()`, jamais `to authenticated using (true)`.
- 2FA staff obligatoire : `0004_staff_mfa.sql` — `is_staff()` / `staff_role()` exigent une session `aal2` ; `staff_mfa_pending()` renvoie vers l'écran 2FA (`/auth/mfa` console, `/login/mfa` app). Compte owner : contact@agenfy.fr (`supabase/scripts/bootstrap-owner.sql`).
- Console 0300-0302 : `organization_contacts` (carnet d'adresses, ajouter un contact n'envoie RIEN ; l'invitation à l'espace client est une action explicite `inviteContact`), factures Shine (`invoices.source = 'shine'`, numéro et montants saisis, PDF = `client_documents` kind `invoice`), messagerie OVH IMAP/SMTP (`mail_accounts`, service role uniquement, mot de passe chiffré avec `MAIL_ENCRYPTION_KEY`, accès owner/admin `/mail`).
- Console 0303 : blog `blog_posts` (Markdown `content_md`, statut draft/published/archived, `published_at` futur = programmé, champs SEO) + bucket public `blog-images` ; écriture owner/admin/consultant/sales (`/blog`), lecture anon = articles publiés. www fusionne ces articles avec `apps/web/src/lib/blog-posts.tsx` (la base gagne), ISR 5 min + `POST /api/revalidate` (`REVALIDATE_SECRET`). Éditeur Markdown réutilisable : `apps/console/src/components/editor/`.
- Mise en route complète (CLI, migrations, Vercel, DNS) : `docs/SETUP.md`.
- `SUPABASE_SERVICE_ROLE_KEY` : serveur uniquement, jamais dans un composant client ni une variable `NEXT_PUBLIC_*`.

## Règles éditoriales (toutes apps)

- Interface en français, code en anglais.
- Jamais de témoignage, logo client, chiffre ou certification inventés. Pas de « finançable OPCO/CPF » tant que Qualiopi n'est pas obtenu.
- Chaque app Next.js 16 : lire `node_modules/next/dist/docs/` avant d'utiliser une API dont on n'est pas sûr (`middleware` → `proxy` en v16).

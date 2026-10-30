# @agenfy/app — app.agenfy.fr

Plateforme de formation (LMS) d'Agenfy : catalogue public, parcours apprenant (leçons, quiz,
positionnement, satisfaction à chaud / à froid), émargement numérique, attestations vérifiables,
espace manager d'entreprise et espace formateur avec exports CSV (préparation Qualiopi —
voir [`docs/QUALIOPI.md`](docs/QUALIOPI.md)).

Les pages marketing / SEO des formations restent sur www.agenfy.fr (`apps/web`). Ici, seules la page
d'accueil (catalogue) et les fiches `/catalogue/[slug]` sont indexables ; tout le reste est `noindex`.

## Stack

Next.js 16 (App Router, `proxy.ts`) · React 19 · Tailwind CSS v4 + typography · shadcn (new-york) ·
Supabase (`@supabase/ssr`) · react-markdown · Vitest. Port de dev : **3002**.

## Démarrage

```bash
pnpm install                       # à la racine du monorepo
cp apps/app/.env.example apps/app/.env.local   # puis renseigner les valeurs
pnpm dev:app                       # http://localhost:3002
```

Vérifications :

```bash
pnpm --filter @agenfy/app typecheck
pnpm --filter @agenfy/app lint
pnpm --filter @agenfy/app test
pnpm --filter @agenfy/app build    # fonctionne sans variable d'environnement
```

## Variables d'environnement

| Variable | Obligatoire | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | oui | Projet Supabase partagé (www / console / app) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | oui | Clé publique (RLS appliquée) |
| `SUPABASE_SERVICE_ROLE_KEY` | non | **Serveur uniquement.** Permet au staff d'inviter un apprenant sans compte. Sans elle, invitez l'utilisateur depuis Supabase (Authentication → Invite) puis inscrivez-le |
| `NEXT_PUBLIC_APP_URL` | oui en prod | URL publique (`https://app.agenfy.fr`) pour les liens magiques et l'URL de vérification imprimée sur les attestations |

## Base de données

Migrations (jamais appliquées automatiquement), à exécuter **dans l'ordre** après `0001`–`0003` :

| Fichier | Contenu |
|---|---|
| `supabase/migrations/0200_training_schema.sql` | Tables : `courses`, `course_modules`, `lessons`, `quizzes`, `quiz_questions`, `cohorts`, `sessions`, `enrollments`, `lesson_progress`, `quiz_attempts`, `attendance`, `evaluations`, `certificate_counters`, `certificates`, `complaints` ; trigger de progression |
| `supabase/migrations/0201_training_rls.sql` | RLS + helpers (`is_training_staff`, `is_enrolled`, `can_view_enrollment`…) ; corrigés des quiz masqués par privilèges de colonnes |
| `supabase/migrations/0202_training_rpc.sql` | RPC : `submit_quiz_attempt`, `sign_attendance`, `issue_certificate`, `verify_certificate` (anon), `enroll_by_email`, `training_people` |
| `supabase/migrations/0250_seed_training_courses.sql` | Seed **généré** des 2 formations (idempotent, ids déterministes) |

```bash
supabase db push            # ou coller chaque fichier dans le SQL Editor
```

### Contenu des formations

La source éditoriale est `content/courses/*.ts` (Markdown dans du TypeScript, quiz avec corrigés).
Après modification :

```bash
pnpm --filter @agenfy/app seed:generate   # réécrit 0250_seed_training_courses.sql
pnpm --filter @agenfy/app test            # valide le contenu + vérifie que le seed est à jour
```

Puis ré-exécuter `0250` : les lignes sont mises à jour en place (la progression des apprenants est
conservée, les leçons supprimées du contenu sont supprimées en base). Pensez à incrémenter
`courses.version` quand le programme change de manière significative (indicateur 1/25).

## Rôles

| Rôle | Détermination | Accès |
|---|---|---|
| Apprenant | tout utilisateur authentifié inscrit (`enrollments`) | `/dashboard`, `/learn/[slug]/…`, `/compte`, `/reclamation` — uniquement ses données |
| Manager d'entreprise | `organization_members.role in ('owner','manager')` (`is_org_manager`) | `/manager` : progression, complétion, satisfaction de son organisation (lecture seule) |
| Staff | `public.staff` (`is_staff`) | `/staff` : tout en lecture ; écriture (inscriptions, sessions, émargement) pour les rôles ≠ `readonly` (`is_training_staff`) ; formateur = rôle `trainer` |
| Anonyme | — | catalogue publié, `/verify/[numéro]` |

Bootstrap du premier compte staff (SQL Editor) :

```sql
insert into public.staff (user_id, role)
select id, 'owner' from auth.users where email = 'contact@agenfy.fr';
```

## Authentification

Lien magique (`signInWithOtp`, sans création de compte : les accès sont créés à l'inscription) et mot
de passe. Configuration Supabase (Authentication) :

- **URL Configuration** : Site URL `https://app.agenfy.fr` ; Redirect URLs : `https://app.agenfy.fr/auth/callback`
  et `http://localhost:3002/auth/callback`. (Le projet étant partagé avec www/console, ajouter les URLs de chaque app.)
- **Email templates** (recommandé, flux `token_hash` compatible SSR) :
  - Magic link : `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email`
  - Invite : `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite`
  - Reset password : `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery`
  Les invités et les réinitialisations arrivent sur `/compte?welcome=1` pour définir nom et mot de passe.

## Parcours apprenant

1. Test de positionnement (`/learn/[slug]/evaluation/positioning`)
2. Leçons Markdown + exercice, « marquer comme terminé » (`lesson_progress` → trigger → `enrollments.progress_percent`)
3. Quiz de fin de module, corrigé côté serveur, seuil 70 %
4. Émargement par demi-journée pour les sessions live (`/learn/[slug]/emargement`, signature dessinée, horodatage serveur)
5. À 100 % : satisfaction à chaud, attestation (`/learn/[slug]/attestation`, impression / PDF via le navigateur)
6. J+60 : questionnaire à froid

## Déploiement (Vercel)

Projet Vercel distinct : Root Directory `apps/app`, build `next build`, variables d'environnement
ci-dessus, domaine `app.agenfy.fr` (CNAME `cname.vercel-dns.com` chez le registrar).

## Reste à faire (hors MVP)

- Relances e-mail automatiques (inactivité, questionnaire à froid à J+60)
- Édition du contenu depuis l'interface (aujourd'hui : fichiers + seed)
- Questionnaires commanditaire / formateur (indicateur 30)
- Mentions légales de l'organisme sur l'attestation (adresse, SIRET, numéro de déclaration d'activité une fois obtenu)
- Pont formation → projet vers console.agenfy.fr

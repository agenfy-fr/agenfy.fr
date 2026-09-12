# Architecture Admin — Phase 2

Aujourd'hui : aucune authentification, aucun admin, aucun middleware n'existent dans le projet. Tout ce qui suit est à construire de zéro (Phase 9), mais les décisions structurantes sont prises maintenant pour que le schéma de données ne bouge plus une fois le CMS (Phase 8) branché dessus.

## 1. Authentification

**Décision : Supabase Auth**, pas de solution tierce (NextAuth/Clerk/Lucia).

Raison : `@supabase/supabase-js` est déjà une dépendance, `SUPABASE_SERVICE_ROLE_KEY` est déjà provisionnée dans `.env.local` mais inutilisée — l'infra existe, elle attend d'être branchée. Introduire un 2ᵉ système d'identité serait une duplication injustifiée.

- Connexion par email/mot de passe pour l'équipe interne (pas d'inscription publique — comptes créés manuellement via le dashboard Supabase ou un script, pas de formulaire `/admin/signup`).
- Nouvelle dépendance nécessaire : `@supabase/ssr` (gestion de session côté serveur/middleware — `@supabase/supabase-js` seul ne suffit pas pour ça en App Router).
- Session vérifiée dans `middleware.ts` (à créer — fichier absent aujourd'hui) pour toute route sous `/admin/*` : redirection vers `/admin/login` si pas de session valide.

## 2. RBAC

Minimal mais extensible dès le départ :

```sql
create table profiles (
  id uuid primary key references auth.users(id),
  role text not null check (role in ('admin', 'editor')) default 'editor',
  full_name text,
  created_at timestamptz default now()
);
```

`admin` : accès total (gestion des utilisateurs, SEO global, redirects). `editor` : contenu (blog, études de cas) et leads, pas les réglages globaux. Le nombre de rôles augmente seulement si un vrai besoin apparaît (pas de sur-ingénierie anticipée).

## 3. Indexabilité — non négociable

- `robots.ts` : ajouter `disallow: ['/api/', '/admin/']` dès que la première route `/admin` existe (actuellement retiré `/private/` qui ne correspondait à rien — voir Phase 1).
- Chaque page sous `/admin` : `export const metadata = { robots: { index: false, follow: false } }` en plus du disallow (défense en profondeur — un lien externe vers une page admin ne doit jamais l'indexer même si robots.txt est ignoré).
- `sitemap.ts` : ne jamais inclure de route `/admin/*`.

## 4. Modèle de données (Supabase)

Schéma cible pour les phases 8-11. Toutes ces tables ont RLS activé, écriture réservée au rôle `service_role` (jamais exposée en clair côté client) ou aux utilisateurs authentifiés selon la table.

| Table | Rôle | Remplace |
|---|---|---|
| `posts` | Articles de blog (voir statuts dans CONTENT-STRATEGY.md §4) | `src/lib/blog-posts.tsx` (hardcodé) + `content/blog/*.md` (orphelin, voir audit §2.3) |
| `case_studies` | Études de cas, avec colonne `case_type` (`example` \| `client`) — déjà le nom de champ introduit en Phase 1 dans `lib/case-studies.ts` | `src/lib/case-studies.ts` |
| `leads` | CRM léger (mission §21) : nom, société, email, téléphone, message, service, source, statut | Rien aujourd'hui — n'existe pas |
| `newsletter_subscribers` | Déjà existante et fonctionnelle, inchangée | — |
| `page_seo` | Overrides SEO par page (title, description, OG, canonical, robots, schema) pilotables depuis l'admin (mission §16) | Metadata actuellement en dur dans chaque `page.tsx` |
| `redirects` | `source, destination, status_code, created_at` + validation anti-boucle/anti-chaîne (mission §24) | N'existe pas |
| `content_generation_jobs` | État de la pipeline IA (mission §18-20) : sujet, étape courante, contenu généré, statut de validation humaine | N'existe pas |
| `audit_logs` | Traçabilité des actions admin (qui a publié/modifié/supprimé quoi, quand) | N'existe pas |

**Point d'attention rédigé explicitement pour éviter toute ambiguïté plus tard** : `posts` et `case_studies` remplaceront les fichiers statiques, mais **pas avant la Phase 8**. Tant que l'admin n'existe pas, les fichiers TS restent la source de vérité — ne pas migrer prématurément vers une base vide qu'on ne peut pas encore éditer.

## 5. Sécurité

- `SUPABASE_SERVICE_ROLE_KEY` : uniquement dans des Server Actions / Route Handlers, jamais dans un composant `"use client"`, jamais dans une variable `NEXT_PUBLIC_*`. Le contraire serait une fuite de la clé qui contourne RLS.
- Rate limiting sur toute route API publique (aujourd'hui, seule `/api/newsletter` existe et n'en a pas — à ajouter avant que le formulaire de contact natif et le CRM soient branchés).
- Server Actions pour les écritures admin plutôt que des routes API REST quand c'est possible : la protection CSRF est native à Next.js pour les Server Actions (vérification d'origine intégrée), ce qui réduit la surface à sécuriser manuellement.
- `audit_logs` alimenté automatiquement par un wrapper commun autour des Server Actions d'écriture (pas ajouté au cas par cas dans chaque action, sinon on en oubliera).

## 6. Structure de routes (esquisse)

```
/admin/login
/admin                    → KPI (mission §15)
/admin/leads              → CRM
/admin/blog               → liste + création/édition d'articles
/admin/blog/[id]
/admin/case-studies
/admin/seo                → SEO global + par page
/admin/redirects
/admin/content-engine     → pipeline IA (Phase 10)
```

## 7. Suivi — ce qui est réellement construit (Phase 9, en cours)

Cette section documente ce qui existe dans le code, pour que le reste de ce fichier (schéma cible complet, phases 8-11) ne soit pas confondu avec l'état actuel.

**Construit :**

- Authentification Supabase Auth (`@supabase/ssr`) : `middleware.ts` protège tout `/admin/*` sauf `/admin/login`, redirige les sessions déjà connectées loin de `/admin/login`. Server Actions `login`/`signOut`. Aucun compte n'a été créé — reste à faire manuellement via le dashboard Supabase.
- `/admin` restructuré en route group `(dashboard)` (`src/app/admin/(dashboard)/`) : un layout partagé (nav + déconnexion) englobe le tableau de bord et `/admin/leads`, sans s'appliquer à `/admin/login` — le groupe ne change rien à l'URL.
- Table `leads` (migration `supabase/migrations/0001_leads.sql`, **non appliquée** — à exécuter manuellement dans le SQL Editor Supabase) : colonnes conformes au schéma ci-dessus, RLS avec insert public (`anon`) et lecture/écriture réservées aux comptes authentifiés.
- Formulaire de contact natif sur `/contact` (`src/app/contact/actions.ts`, Server Action `submitContactForm` avec `useActionState`) : en plus du widget Calendly existant, capture nom/entreprise/email/téléphone/service/message et insère dans `leads` avec `source: "contact_page"`.
- `/admin/leads` : liste les leads (tri par date décroissante), changement de statut inline (`lead-status-select.tsx`, Server Action `updateLeadStatus`), et affiche un message explicite si la table n'existe pas encore plutôt qu'une erreur brute.
- KPI "Nouveaux leads" ajouté au tableau de bord, avec fallback `—` si la requête échoue (table absente, etc.).

**Pas construit** (reste dans le schéma cible, phases suivantes) : RBAC/`profiles`, `posts`, `case_studies` en base (les fichiers TS restent la source de vérité), `page_seo`, `redirects`, `content_generation_jobs`, `audit_logs`, rate limiting sur les routes publiques.

**Faille de sécurité trouvée et corrigée (2026-09-12)** : `newsletter_subscribers` était lisible publiquement — vérifié empiriquement (insertion d'une ligne test avec la clé service role, relecture réussie avec la clé anon/publishable). N'importe qui inspectant le bundle JS du site pouvait donc exporter la liste complète des emails inscrits. Migration `supabase/migrations/0002_secure_newsletter_subscribers.sql` écrite (active RLS, ne garde que l'insert public, lecture/suppression réservées aux comptes authentifiés) — **non appliquée automatiquement, à exécuter en priorité**. `/api/newsletter/route.ts` ajusté en conséquence (retrait du `.select()` après insert, devenu inutile côté frontend et plus fragile une fois le SELECT anonyme retiré).

**MCP Supabase** : serveur ajouté au scope projet (`.mcp.json`, `claude mcp add ...`) pour permettre l'application directe des migrations et l'audit RLS via les advisors Supabase. Statut au moment de la rédaction : `Pending approval` — nécessite qu'un utilisateur relance `claude` (ou réponde au prompt d'autorisation) puis valide l'OAuth Supabase dans le navigateur ; ni l'un ni l'autre ne peuvent être faits par l'agent. Une fois connecté, les deux migrations ci-dessus peuvent être appliquées directement, et l'ensemble des tables peut être audité pour RLS sans dépendre de tests empiriques via REST.

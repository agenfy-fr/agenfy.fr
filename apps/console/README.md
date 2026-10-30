# Agenfy Console — `apps/console` (console.agenfy.fr)

Back-office de l'équipe Agenfy (CRM, projets, facturation) **et** espace client multi-tenant : chaque client se connecte pour suivre ses propres projets, documents, factures et demandes.

Stack : Next.js 16 (App Router, `proxy.ts`), React 19, Tailwind 3.4 + shadcn/ui, TanStack Query, zod 4, Supabase (`@supabase/ssr`), Vitest. Base de code issue de la console Hasfy (shell, UI, toasts, palette ⌘K, CSP, rate-limit, module Planning, serveur MCP), adaptée au modèle multi-tenant.

## Démarrage

```bash
pnpm install                          # à la racine du monorepo
cp apps/console/.env.example apps/console/.env.local   # puis renseigner les valeurs
pnpm dev:console                      # http://localhost:3001
```

| Commande | Rôle |
|---|---|
| `pnpm --filter @agenfy/console dev` | serveur de dev (port 3001) |
| `pnpm --filter @agenfy/console build` | build de prod (fonctionne **sans** variables d'environnement) |
| `pnpm --filter @agenfy/console lint` / `typecheck` | ESLint / `tsc --noEmit` |
| `pnpm --filter @agenfy/console test` | tests unitaires Vitest |
| `pnpm --filter @agenfy/console test:rls` | migrations + suite RLS sur un PostgreSQL local jetable (voir plus bas) |

## Base de données

Migrations dans `supabase/migrations/` (plage console `0100-0199`), **jamais appliquées automatiquement**. Ordre : `0001`, `0002`, `0003` (socle d'identité partagé), puis :

| Fichier | Contenu |
|---|---|
| `0100_console_core.sql` | helpers `staff_can_write()` / `staff_has_role()`, annuaire (`console_user_directory`, `console_staff_directory`), `organization_internal`, conversion des `leads`, `projects` + `project_internal`, `project_milestones`, `project_tasks` (Planning) + `project_task_comments`, `client_documents` + bucket Storage `client-documents` |
| `0101_console_billing.sql` | `quotes` / `invoices` + lignes, TVA, totaux calculés par triggers, numérotation `DEV-AAAA-NNNN` / `FAC-AAAA-NNNN` à l'émission, document émis figé |
| `0102_console_client_requests.sql` | demandes clients + fil de messages (notes internes) |
| `0103_console_api_tokens.sql` | `staff_api_tokens` (jetons MCP `acp_…`) + `console_mcp_audit` |

Appliquer : Supabase Dashboard → SQL Editor (coller chaque fichier dans l'ordre), ou `supabase db push` si le CLI est lié au projet.

### Modèle de sécurité (RLS)

- **Staff** (`public.staff`, non suspendu) : lecture de tout ; écriture si rôle ≠ `readonly` (`staff_can_write()`) ; devis/factures : `owner`, `admin`, `sales` ; suppression de leads : `owner`/`admin`.
- **Client** (`organization_members`) : lecture des seules lignes de **ses** organisations, et seulement si elles sont visibles client — projets hors brouillon, jalons/tâches/documents `client_visible`, devis/factures émis, messages non `internal`. Il peut créer une demande et y répondre.
- **Notes internes** : tables séparées réservées au staff (`organization_internal`, `project_internal`, `project_task_comments`, messages `internal`) — la RLS est par ligne, pas par colonne. ⚠️ `organizations.notes` (0003) est lisible par les membres : ne pas y écrire d'info interne.
- `organization_id` des tables filles est toujours dérivé du projet par trigger (impossible à forger) ; un projet ne peut pas changer d'organisation.
- Le portail filtre en plus explicitement sur les organisations de l'utilisateur et les drapeaux de visibilité : un membre du staff également client n'y voit jamais les données des autres clients.

### Test RLS documenté

`apps/console/test/sql/rls_isolation.test.sql` (61 assertions) : matrice de rôles (owner, readonly, consultant, client A, client B, compte sans rôle, anon) et isolation inter-organisation (projets, jalons, tâches, documents + objets Storage, factures, demandes, notes internes), règles de facturation (numérotation, gel, TVA). `scripts/test-rls.sh` crée un cluster PostgreSQL ≥ 15 **temporaire** (initdb dans un dossier jetable), y applique `test/sql/supabase-shim.sql` (rôles `anon`/`authenticated`, `auth.uid()`, schéma `storage` minimal) puis toutes les migrations, et exécute la suite. Rien n'est envoyé vers Supabase.

## Rôles

| Rôle staff | Accès |
|---|---|
| `owner` / `admin` | tout, y compris l'équipe (invitations, rôles, suspension). Seul un `owner` nomme un `owner`. |
| `consultant` | clients, projets, tâches, documents, demandes, leads ; pas la facturation |
| `sales` | idem + devis/factures |
| `trainer` | clients, projets, tâches, demandes ; ni leads ni facturation |
| `readonly` | lecture de tout (leads et facturation compris), aucune écriture |

Clients : `owner` / `manager` / `member` d'une organisation — même vue portail ; la RLS de `0003` permet déjà aux `owner`/`manager` de gérer les membres de leur organisation, mais le portail n'expose pas encore cette gestion.

Redirection après connexion : staff → `/dashboard` ; membre d'organisation → `/portal` ; sinon → `/unauthorized`. Les comptes ne se créent que par invitation (`shouldCreateUser: false` sur le lien magique).

## Créer le premier compte owner

1. Supabase → Authentication → Users → **Add user** (e-mail + mot de passe, « Auto Confirm User »), ou *Invite user*.
2. SQL Editor (bloc bootstrap de fin de `0003_core_identity.sql`) :
   ```sql
   insert into public.staff (user_id, role)
   select id, 'owner' from auth.users where email = 'contact@agenfy.fr';
   ```
3. Se connecter sur `/auth/login`. Les autres membres de l'équipe s'invitent ensuite depuis **Équipe**, les contacts clients depuis la fiche client (onglet *Contacts*).

## Configuration Supabase Auth

- **URL Configuration** : Site URL `https://console.agenfy.fr` ; Redirect URLs : `https://console.agenfy.fr/auth/callback`, `http://localhost:3001/auth/callback` (en plus de celles de `apps/web` / `apps/app`).
- **Email templates** (recommandé, évite le flux implicite) — *Invite user* :
  `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=invite`
  *Magic Link* : `{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`.
  Le Site URL étant partagé entre les 3 apps, on peut aussi utiliser `{{ .RedirectTo }}`. Les modèles par défaut restent pris en charge (`/auth/confirm` lit les jetons du fragment).
- SMTP personnalisé conseillé pour l'envoi des invitations.

## Fonctionnalités

- **Tableau de bord** : leads du mois, pipeline, projets actifs, CA facturé (TTC/HT, encaissé), mes tâches, demandes ouvertes.
- **Leads** : table `leads` alimentée par www.agenfy.fr ; kanban par statut (glisser-déposer), notes, saisie manuelle, conversion en organisation cliente (lead → « Gagné », fiche CRM liée, invitation du contact pré-remplie).
- **Clients** : fiche, suivi interne, contacts invités (`auth.admin.inviteUserByEmail`, côté serveur), projets, documents, demandes, factures.
- **Projets** : statut, avancement, dates, budget, responsable, prochaines étapes (visibles client), notes internes, jalons, tableau de tâches (module Planning : clés `CODE-NNN`, commentaires internes, visibilité client par tâche), livrables (fichier ≤ 4 Mo — limite Vercel — ou lien https).
- **Devis & factures** : brouillon → lignes → émission (numéro définitif, document figé) ; devis accepté → facture ; facture payée / annulée. Aucun paiement en ligne. Mentions légales via `BILLING_*`.
- **Demandes clients** : boîte de réception staff, réponses publiques ou notes internes.
- **Portail client** (`/portal`) : projets (avancement, jalons, prochaines étapes, tâches visibles), documents, factures & devis imprimables, demandes.
- **Serveur MCP** `agenfy-console` (`/api/mcp`) : `list_clients`, `get_client`, `list_projects`, `get_project`, `update_project`, `list_tasks`, `get_task`, `create_task`, `update_task`, `add_task_comment`, `list_leads`, `update_lead_status`, `dashboard_kpis`. Jeton personnel créé dans **Paramètres** (`acp_…`, SHA-256 en base, scopes `console:read` / `console:write`, bornés par le rôle courant, chaque appel audité). Pas d'accès facturation ni données portail.
  ```bash
  claude mcp add --transport http agenfy-console https://console.agenfy.fr/api/mcp \
    --header "Authorization: Bearer acp_…"
  ```

## Déploiement (Vercel)

Projet Vercel distinct, *Root Directory* `apps/console`, framework Next.js, commande d'installation `pnpm install` (monorepo). Variables : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Production/Preview, jamais exposée au client), `NEXT_PUBLIC_SITE_URL=https://console.agenfy.fr`, `BILLING_*`. DNS : `console.agenfy.fr` → CNAME vers Vercel (`cname.vercel-dns.com`), puis ajout du domaine dans le projet.

## Limites connues / suite

- Upload ≤ 4 Mo (Server Action sur Vercel) ; pour plus gros, passer à des URL d'upload signées Supabase.
- Rate-limit en mémoire (par instance).
- Pas d'e-mail de notification (nouvelle demande, facture émise) ni de génération PDF serveur (impression navigateur).
- Pas encore d'écran portail pour que les `owner`/`manager` clients gèrent leurs membres (autorisé par la RLS de 0003).

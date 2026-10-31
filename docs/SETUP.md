# Mise en route — www, console, app

Commandes à lancer depuis la racine du repo (`agenfy.fr/`). Rien n'est appliqué ni déployé automatiquement.

## 0. Prérequis (une fois)

```bash
brew install supabase/tap/supabase   # CLI Supabase (≥ 2.120)
corepack enable                      # pnpm 10 (version fixée dans package.json)
pnpm install
```

## 1. Lancer en local

Créer les fichiers d'environnement (valeurs dans Supabase → Project Settings → API) :

```bash
cp apps/console/.env.example apps/console/.env.local
cp apps/app/.env.example apps/app/.env.local
# apps/web/.env.local : NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY
```

```bash
pnpm dev:web        # http://localhost:3000  (www.agenfy.fr)
pnpm dev:console    # http://localhost:3001  (console.agenfy.fr)
pnpm dev:app        # http://localhost:3002  (app.agenfy.fr)
```

Vérifications : `pnpm lint`, `pnpm build`, `pnpm --filter @agenfy/console test`,
`pnpm --filter @agenfy/app test`, `pnpm --filter @agenfy/web test`,
`pnpm --filter @agenfy/console test:rls` (RLS sur un Postgres jetable, nécessite `brew install postgresql@17`).

## 2. Supabase CLI avec le compte contact@agenfy.fr

1. Dans le navigateur, se connecter à https://supabase.com/dashboard avec **contact@agenfy.fr**
   (et activer la 2FA du compte : Account → Security → *Multi-factor authentication*).
2. Puis :

```bash
supabase login                         # ouvre le navigateur → autoriser avec contact@agenfy.fr
supabase projects list                 # repérer le REFERENCE ID du projet Agenfy (20 lettres)
supabase link --project-ref <PROJECT_REF>   # demande le mot de passe de la base (Settings → Database)
```

### Appliquer les migrations

```bash
supabase migration list                # colonne « Remote » vide = jamais appliquée via la CLI
```

Si la table `leads` existe déjà en production (le formulaire de contact du site fonctionne), `0001` et `0002`
ont été appliquées à la main : les marquer comme appliquées **avant** de pousser, sinon la CLI les rejoue.

```bash
supabase migration repair --status applied 0001 0002   # seulement dans ce cas
supabase db push --dry-run             # affiche ce qui sera appliqué : 0003, 0004, 0100-0103, 0200-0202, 0250, 0300-0303
supabase db push --dry-run             # affiche ce qui sera appliqué : 0003, 0004, 0100-0103, 0200-0202, 0250, 0300-0304
supabase db push
```

### Durcir l'authentification

`supabase/config.toml` contient la configuration Auth cible : inscriptions publiques fermées (comptes sur invitation),
mot de passe ≥ 12 caractères avec minuscules, majuscules et chiffres, changement de mot de passe sécurisé,
2FA TOTP activée, URLs de redirection des 3 apps.

```bash
supabase config push                   # affiche le diff et demande confirmation avant d'appliquer
```

Relire le diff : si des modèles d'e-mail ou un SMTP personnalisés existent déjà côté dashboard, refuser et
reporter plutôt ces réglages à la main (Authentication → Sign In / Providers, → URL Configuration, → Multi-Factor).
À faire dans le dashboard (non couvert par `config.toml`) :

- Authentication → **Attack Protection** : activer *Leaked password protection* (refuse les mots de passe
  présents dans Have I Been Pwned ; plan Pro) et le CAPTCHA si des abus apparaissent.
- Authentication → **Emails** → SMTP personnalisé (sinon 2 e-mails/heure seulement).

## 3. Compte administrateur contact@agenfy.fr

1. Supabase → Authentication → Users → **Add user** → *Create new user* :
   `contact@agenfy.fr`, mot de passe fort (gestionnaire de mots de passe, 20+ caractères), cocher *Auto Confirm User*.
2. Supabase → SQL Editor → coller et exécuter `supabase/scripts/bootstrap-owner.sql` (rôle `owner`).
3. Ouvrir https://console.agenfy.fr (ou http://localhost:3001) → se connecter → l'écran
   **Double authentification** s'affiche : scanner le QR code (1Password, Bitwarden, Google/Microsoft Authenticator),
   saisir le code. La console n'est accessible qu'après cette étape.
4. Le même compte et la même 2FA servent sur app.agenfy.fr.
5. Changer le mot de passe à tout moment : console → **Mon compte** (ou app → **Mon compte**). Il faut une session
   validée en 2FA ; la politique (12 caractères, 3 types, pas l'e-mail) est vérifiée côté serveur et par Supabase.

**2FA obligatoire pour toute l'équipe** : la migration `0004_staff_mfa.sql` n'accorde les droits staff qu'à une
session `aal2` (code TOTP vérifié). Un membre de l'équipe connecté avec son seul mot de passe ou un lien magique
n'a aucun accès interne, même en appelant l'API directement. Les clients et apprenants peuvent activer la 2FA
depuis « Mon compte » ; une fois activée, le code est demandé à chaque connexion.

**Téléphone perdu** (un admin, depuis Supabase → SQL Editor) :

```sql
delete from auth.mfa_factors
where user_id = (select id from auth.users where email = 'personne@exemple.fr');
```

La personne réenrôle un nouveau QR code à la connexion suivante. Pour contact@agenfy.fr, garder la clé de
secours (« Saisir la clé manuellement ») dans le gestionnaire de mots de passe lors de l'enrôlement.

## 4. Vercel

1. Projet existant (www) → Settings → General → **Root Directory = `apps/web`** — *avant* de fusionner la PR dans `main`.
2. Nouveau projet `agenfy-console` : même repo, Root Directory `apps/console`, variables de `apps/console/.env.example`,
   domaine `console.agenfy.fr`.
3. Nouveau projet `agenfy-app` : Root Directory `apps/app`, variables de `apps/app/.env.example`, domaine `app.agenfy.fr`.

`SUPABASE_SERVICE_ROLE_KEY` : uniquement dans les variables serveur Vercel, jamais en `NEXT_PUBLIC_*`.

## 5. DNS

```
console  CNAME  cname.vercel-dns.com.
app      CNAME  cname.vercel-dns.com.
```

## 6. 2FA sur tous les comptes de l'entreprise

| Service | Où |
|---|---|
| Supabase (contact@agenfy.fr) | Account → Security ; Organization → Settings → *Require MFA* pour tous les membres |
| GitHub (organisation agenfy-fr) | Organization → Settings → Authentication security → *Require two-factor authentication* |
| Vercel | Account Settings → Authentication → Two-Factor ; Team → Security → *Enforce 2FA* |
| Messagerie contact@agenfy.fr (Google Workspace / autre) | Sécurité du compte → validation en deux étapes ; admin → l'imposer |
| Registrar du domaine agenfy.fr | Paramètres du compte → 2FA + verrouillage du transfert de domaine |
| Google Search Console, Bing Webmaster, Google Business | Couverts par la 2FA du compte Google / Microsoft utilisé |

Conserver les codes de secours de chaque service dans le gestionnaire de mots de passe (coffre partagé de l'équipe).

## Messagerie (boîte OVH dans la console)

1. Vercel → projet `agenfy-console` → variable **`MAIL_ENCRYPTION_KEY`** (production + preview), valeur `openssl rand -base64 32`.
2. Migration `0302_console_mailbox.sql` appliquée.
3. Console → Paramètres → **Messagerie** : adresse, mot de passe de la boîte, offre OVH (MX Plan : `ssl0.ovh.net`, IMAP 993, SMTP 465),
   « Tester la connexion », puis Enregistrer. Le mot de passe est chiffré, jamais réaffiché ; s'il change chez OVH, le ressaisir ici.
4. Menu **Messagerie** (propriétaires et administrateurs uniquement) : lecture, recherche, réponse, transfert, pièces jointes (4 Mo).
   Les images distantes sont bloquées par défaut (pistage) ; le contenu des e-mails est affiché dans un cadre isolé sans script.

## Factures Shine

Shine n'ouvre son API qu'aux prestataires agréés (AISP/PISP) : pas de synchronisation automatique. On crée et envoie la facture
dans Shine, puis Facturation → Factures → « Enregistrer une facture Shine » (numéro, montants HT/TVA, PDF exporté de Shine).
La facture apparaît dans le suivi, le tableau de bord et l'espace client (PDF téléchargeable).

## Blog (articles écrits dans la console)

1. Migration `0303_blog_posts.sql` appliquée : table `blog_posts` + bucket Storage public `blog-images`
   (images PNG/JPEG/WebP/GIF/AVIF, 5 Mo par le bucket, 4 Mo par la console à cause de la limite Vercel).
2. Console → **Blog** (propriétaires, administrateurs, consultants, commerciaux ; lecture seule pour `readonly`) :
   nouvel article (brouillon), éditeur visuel enregistré en Markdown, images, couverture, panneau SEO, Publier / Dépublier.
   Une date de publication future programme la mise en ligne (heure de Paris).
3. www.agenfy.fr lit les articles publiés avec la clé **anon** (`NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   dans le projet Vercel www) et les fusionne avec les articles écrits dans le code (`apps/web/src/lib/blog-posts.tsx`) ;
   à slug identique, la version console gagne. Sans ces variables, le site ne montre que les articles du code.
4. Mise à jour du site : automatique sous 5 minutes (ISR). Pour une mise à jour immédiate après publication, définir
   la même valeur aléatoire **`REVALIDATE_SECRET`** (`openssl rand -base64 32`) dans les projets Vercel www **et** console.
   Optionnel côté console : `WEB_SITE_URL` (défaut `https://www.agenfy.fr`, à changer pour tester une preview).
## Formations et accès (migration 0304)

1. Appliquer `0304_training_access.sql` (après 0303). Elle crée le bucket privé **`training-videos`** (50 Mo par fichier = limite
   du plan gratuit Supabase ; pour plus, relever la limite globale dans Storage → Settings sur un plan payant, puis
   `update storage.buckets set file_size_limit = … where id = 'training-videos'`).
2. Vercel → `agenfy-console` : variable **`NEXT_PUBLIC_APP_URL=https://app.agenfy.fr`** (lien des invitations formation).
3. Supabase → Authentication → URL Configuration : vérifier que `https://app.agenfy.fr/auth/callback` (avec paramètres,
   ex. `https://app.agenfy.fr/auth/callback**`) est autorisé, et que le modèle d'e-mail *Invite user* mène bien au callback
   de l'app (lien `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=invite` ou équivalent).

Qui voit quoi :

| Rôle chez le client (`organization_members.role`) | Espace client (console) | Espace formation (app) |
|---|---|---|
| `owner` Responsable / `manager` Gestionnaire | projets, documents, factures, demandes | ses formations + `/manager` (progression de l'équipe) |
| `member` Membre | projets, documents, factures, demandes | ses formations éventuelles |
| `learner` Apprenant | **aucun** (message + lien vers app.agenfy.fr) | uniquement les formations attribuées |

Console → **Formations** : créer une formation (brouillon → publiée), modules et leçons (ordre, article Markdown avec aperçu,
vidéo = lien YouTube/Vimeo/https ou fichier envoyé directement du navigateur vers le stockage privé).
Console → **Clients → fiche → Accès** : toutes les personnes du client (responsable, salariés, contacts sans compte), accès
espace client oui/non + rôle, formations (statut, progression). Ajouter un salarié comme contact n'envoie rien ; « Donner
accès à des formations » envoie au plus une invitation à app.agenfy.fr si la personne n'a pas de compte (indiqué dans la
fenêtre avant confirmation). **Accès formation** liste toutes les inscriptions.

Avant 0304, `enroll_by_email()` ajoutait les apprenants comme `member` (accès au portail). La requête commentée en fin de
migration liste ces personnes : les repasser en « Apprenant » depuis l'onglet Accès si besoin (« Retirer l'accès »).

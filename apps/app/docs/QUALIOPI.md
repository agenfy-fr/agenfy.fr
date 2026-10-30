# Préparation Qualiopi — correspondance avec la plateforme

> **Statut : Agenfy n'est pas (encore) certifié Qualiopi.** Le dossier de certification reste à lancer
> (audit initial par un organisme certificateur accrédité). Tant que la certification n'est pas obtenue,
> aucune page ne doit mentionner « certifié Qualiopi » ni « finançable OPCO / CPF ».
>
> Ce document sert de **carte de préparation** : pour chacun des 32 indicateurs du Référentiel national
> qualité (RNQ), il indique ce que app.agenfy.fr trace automatiquement (preuves exportables) et ce qui
> reste un processus humain à documenter. Les intitulés ci-dessous sont des résumés : la référence est le
> **guide de lecture du RNQ** publié par le ministère du Travail (vérifier la dernière version en vigueur).

Agenfy réalise des **actions de formation** (catégorie L6313-1 1°). Les indicateurs propres aux actions
certifiantes (3, 7, 16), à l'apprentissage / CFA (13, 14, 15, 20, 29) et à l'alternance (28) sont
**non applicables** tant qu'Agenfy ne propose pas ce type de prestations ; ils doivent tout de même être
présentés à l'auditeur comme « non concernés ».

Légende : ✅ couvert par la plateforme · 🟡 partiellement (outil + processus) · 👤 processus humain · — non applicable

## Critère 1 — Information du public

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 1 | Information accessible, détaillée et vérifiable : prérequis, objectifs, durée, modalités et délais d'accès, tarifs, contacts, méthodes, modalités d'évaluation, accessibilité handicap | 🟡 | Table `courses` (public, prérequis, objectifs, durée, modalité, prix indicatif HT, délai d'accès, accessibilité, méthodes pédagogiques et d'évaluation, `version`, `updated_at`). Fiche publique `/catalogue/[slug]` | Fiches marketing SEO sur www.agenfy.fr alignées sur les mêmes champs ; fixer les prix (actuellement « sur devis ») ; CGV ; nom et contact du référent handicap |
| 2 | Indicateurs de résultats adaptés | 🟡 | Calcul automatique : taux de complétion, satisfaction moyenne à chaud (`/staff`, export `evaluations`, `enrollments`) | Décider quels indicateurs publier et les publier (sur www) uniquement à partir de données réelles, avec date et effectif |
| 3 | Taux d'obtention des certifications | — | Non concerné (pas de formation certifiante) | — |

## Critère 2 — Objectifs et adaptation des prestations

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 4 | Analyse du besoin du bénéficiaire, en lien avec l'entreprise / le financeur | 🟡 | Test de positionnement (`evaluations.kind = 'positioning'`) : fonction, attentes, usage actuel de l'IA, besoins d'adaptation | Entretien / questionnaire de recueil du besoin avec le commanditaire avant devis (trame à formaliser, à archiver dans console.agenfy.fr) |
| 5 | Objectifs opérationnels et évaluables | ✅ | `courses.objectives` (formulés en « être capable de… »), `lessons.objectives` ; repris dans le positionnement et l'évaluation à chaud | Revue annuelle des objectifs |
| 6 | Contenus et modalités adaptés aux objectifs et aux publics | ✅ | `course_modules`, `lessons` (contenu, exercice, durée), `cohorts.modality`, `sessions` ; contenu versionné dans git (`apps/app/content/courses`) | Adaptation intra-entreprise (cas d'usage du client) à tracer dans la convention / le programme personnalisé |
| 7 | Adéquation aux exigences de la certification visée | — | Non concerné | — |
| 8 | Positionnement et évaluation des acquis à l'entrée | ✅ | Questionnaire `positioning-v1` (auto-évaluation par objectif, échelle 1-5), exigé en début de parcours ; export CSV | Exploiter les réponses avant la session (adapter le déroulé) et en garder la trace |

## Critère 3 — Accueil, accompagnement, suivi et évaluation

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 9 | Information des bénéficiaires sur les conditions de déroulement | 🟡 | Tableau de bord apprenant : programme, prochaines sessions, lien de classe virtuelle, lieu, émargement | Convocation / livret d'accueil (horaires, règlement intérieur, contacts) envoyé avant la session |
| 10 | Adaptation de la prestation, de l'accompagnement et du suivi | 🟡 | Suivi individuel de progression (`enrollments.progress_percent`, `lesson_progress`, `quiz_attempts`) visible par le formateur | Traçabilité des adaptations décidées (ex. note formateur, compte rendu) |
| 11 | Évaluation de l'atteinte des objectifs | ✅ | Quiz par module notés côté serveur (`submit_quiz_attempt`, seuil 70 %), auto-évaluation par objectif après formation (à chaud), questionnaire à froid J+60, attestation mentionnant les résultats de l'évaluation des acquis | Évaluation de l'atelier pratique par le formateur (grille à formaliser) |
| 12 | Engagement des bénéficiaires et prévention des ruptures | 🟡 | Progression et assiduité visibles (manager / staff), émargement par demi-journée, statut d'inscription (`active`, `completed`, `cancelled`) | Procédure de relance des apprenants inactifs ; relances e-mail automatiques (à développer) |
| 13 | Alternance : coordination entre acteurs | — | Non concerné | — |
| 14 | CFA : citoyenneté | — | Non concerné | — |
| 15 | CFA : droits et devoirs de l'apprenti | — | Non concerné | — |
| 16 | Conditions de présentation à la certification | — | Non concerné | — |

## Critère 4 — Moyens pédagogiques, techniques et d'encadrement

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 17 | Moyens humains et techniques adaptés, environnement approprié | 🟡 | La plateforme elle-même (LMS, classes virtuelles liées aux `sessions`) | Description des outils (visio, comptes de démo n8n / Make, salles) ; prérequis techniques envoyés aux apprenants |
| 18 | Coordination des intervenants internes / externes | 🟡 | Formateur rattaché à la cohorte et à la session (`cohorts.trainer_id`, `sessions.trainer_id` → `staff` rôle `trainer`) | Organigramme et rôles (pédagogique, administratif, commercial) |
| 19 | Ressources pédagogiques mises à disposition | ✅ | Leçons, exercices et quiz accessibles en ligne pendant et après la formation | — |
| 20 | CFA : référents mobilité / handicap, conseil de perfectionnement | — | Non concerné (le référent handicap est traité en 26) | — |

## Critère 5 — Compétences des personnels

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 21 | Compétences des intervenants déterminées, mobilisées, évaluées | 👤 | Satisfaction « animation du formateur » dans le questionnaire à chaud (question `trainer`) | CV, justificatifs d'expertise, évaluation des formateurs |
| 22 | Développement des compétences des salariés | 👤 | — | Plan de développement des compétences, veille/formations suivies par l'équipe |

## Critère 6 — Inscription dans l'environnement professionnel

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 23 | Veille légale et réglementaire (formation professionnelle) | 👤 | — | Registre de veille (sources, date, impact) |
| 24 | Veille emplois, métiers, compétences | 👤 | — | Registre de veille |
| 25 | Veille innovations pédagogiques et technologiques | 🟡 | Versionnement des contenus (`courses.version`, historique git) : preuve des mises à jour issues de la veille IA | Registre de veille reliant chaque mise à jour à sa source |
| 26 | Accueil des personnes en situation de handicap | 🟡 | Champ `courses.accessibility` publié ; question dédiée dans le positionnement (`accessibility_needs`) | Désigner un référent handicap, constituer un réseau (Agefiph, ressources handicap formation), tracer les adaptations |
| 27 | Sous-traitance / portage salarial : conformité | 👤 | — | Applicable seulement si des formateurs externes interviennent : contrat + contrôle qualité |
| 28 | Alternance : réseau de partenaires | — | Non concerné | — |
| 29 | CFA : insertion professionnelle | — | Non concerné | — |

## Critère 7 — Appréciations et réclamations

| # | Indicateur (résumé) | Plateforme | Couverture / preuve | Reste à faire (humain) |
|---|---|---|---|---|
| 30 | Recueil des appréciations des parties prenantes | 🟡 | Satisfaction à chaud (`hot-v1`) et à froid J+60 (`cold-v1`) des apprenants ; espace manager (vue entreprise) ; export CSV | Questionnaire commanditaire / financeur et retour des formateurs (à ajouter) |
| 31 | Traitement des difficultés, réclamations et aléas | ✅ | Registre `complaints` : dépôt par l'apprenant (`/reclamation`), statut, réponse, date de résolution, traitant ; export CSV | Procédure écrite (délai de réponse cible, canal e-mail/téléphone à saisir aussi dans le registre) |
| 32 | Mesures d'amélioration | 🟡 | `complaints.corrective_action` ; commentaires « à améliorer » des questionnaires | Revue qualité périodique (compte rendu daté, plan d'actions) |

## Preuves exportables (Espace formateur → Exports)

| Export | Contenu | Indicateurs |
|---|---|---|
| `enrollments` | Inscriptions, organisation, groupe, statut, progression, dates | 9, 11, 12 |
| `attendance` | Émargements par demi-journée : statut, horodatage serveur, IP, user-agent, relevé formateur | 11, 12 |
| `evaluations` | Positionnement, à chaud, à froid : réponses JSON, note, commentaire, version du questionnaire | 8, 11, 30 |
| `quiz_attempts` | Chaque tentative : score, réussite, date | 11 |
| `certificates` | Attestations : numéro unique vérifiable, bénéficiaire, dates, durée, révocation | 11 |
| `complaints` | Registre des réclamations et actions correctives | 31, 32 |

## Garanties techniques utiles pour l'audit

- **Intégrité** : les tentatives de quiz, attestations et signatures sont créées par des fonctions SQL
  `security definer` (horodatage serveur, pas de date fournie par le client) ; une signature d'émargement
  ne peut pas être écrasée ; un apprenant ne peut pas modifier sa progression ni ses réponses.
- **Confidentialité** : RLS stricte — l'apprenant ne voit que ses données, le manager uniquement
  l'équipe de son organisation, le staff tout ; les corrigés des quiz ne sont jamais exposés par l'API.
- **Attestations** : numéro `AGF-AAAA-NNNNN-C` séquentiel par année avec chiffre de contrôle (Luhn),
  données figées à l'émission, vérification publique sur `/verify/[numéro]`.
- **Conservation** : définir une durée de conservation des preuves (RGPD) et l'inscrire au registre
  des traitements.

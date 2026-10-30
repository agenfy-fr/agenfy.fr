import type { CourseSeed } from "../types.ts";

export const iaGenerativeEssentiels: CourseSeed = {
  slug: "ia-generative-essentiels",
  title: "IA générative au travail : les essentiels",
  subtitle:
    "Comprendre, utiliser et encadrer ChatGPT, Claude, Copilot ou Mistral dans son quotidien professionnel, en toute sécurité.",
  category: "essentiels",
  level: "debutant",
  audience:
    "Tous publics : collaborateurs, managers, fonctions support, équipes commerciales et opérationnelles souhaitant utiliser l'IA générative de façon efficace et responsable.",
  prerequisites:
    "Aucun prérequis technique. Savoir utiliser un navigateur web et disposer d'un ordinateur avec accès à au moins un assistant d'IA générative (version gratuite ou entreprise).",
  objectives: [
    "Expliquer le fonctionnement d'un grand modèle de langage et identifier ses principales limites (hallucinations, biais, date de coupure).",
    "Rédiger des prompts structurés (rôle, contexte, tâche, format, contraintes) et les améliorer par itération.",
    "Comparer ChatGPT, Claude, Microsoft 365 Copilot et Mistral Le Chat selon une grille de critères adaptée à son contexte.",
    "Appliquer les règles de confidentialité, les principes du RGPD et les grandes obligations de l'AI Act à son usage quotidien.",
    "Identifier au moins trois cas d'usage concrets dans son métier et les mettre en œuvre avec des prompts réutilisables.",
    "Construire une boîte à prompts personnelle et un plan d'action individuel pour les semaines suivant la formation.",
  ],
  teachingMethods:
    "Apports théoriques courts illustrés d'exemples, démonstrations en direct sur plusieurs assistants, exercices pratiques après chaque leçon, atelier final de construction d'une boîte à prompts. Support de cours accessible sur la plateforme pendant et après la formation.",
  evaluationMethods:
    "Test de positionnement (auto-évaluation) avant la formation ; quiz de fin de module avec score ; production d'une boîte à prompts lors de l'atelier ; questionnaire de satisfaction à chaud en fin de formation et questionnaire à froid environ 60 jours après ; attestation de fin de formation délivrée sur la plateforme.",
  accessibility:
    "Formation accessible aux personnes en situation de handicap. Contactez notre référent handicap à contact@agenfy.fr avant l'inscription : les besoins d'adaptation (rythme, supports, outils d'accessibilité, modalités) sont étudiés au cas par cas.",
  accessDelay:
    "Session intra-entreprise planifiée en règle générale sous 2 à 4 semaines après validation de la proposition, selon les disponibilités communes.",
  durationHours: 7,
  durationLabel: "1 jour (7 h) — présentiel ou classe virtuelle",
  modality: "distanciel",
  priceHtCents: null,
  priceLabel: "Sur devis (intra-entreprise)",
  maxGroupSize: 12,
  modules: [
    // -----------------------------------------------------------------------
    // Module 1
    // -----------------------------------------------------------------------
    {
      title: "Comprendre l'IA générative : usages et limites",
      summary:
        "Ce qu'est (et n'est pas) un grand modèle de langage, comment il produit ses réponses et pourquoi il se trompe parfois avec aplomb.",
      durationMinutes: 75,
      lessons: [
        {
          slug: "comment-fonctionne-un-llm",
          title: "Comment fonctionne un grand modèle de langage",
          durationMinutes: 40,
          objectives: [
            "Définir ce qu'est un grand modèle de langage (LLM) et un token.",
            "Distinguer la phase d'entraînement et la phase d'utilisation (inférence).",
            "Expliquer la notion de fenêtre de contexte et ses conséquences pratiques.",
          ],
          content: `## L'IA générative en une phrase

Un assistant comme ChatGPT, Claude, Copilot ou Le Chat repose sur un **grand modèle de langage** (en anglais *Large Language Model*, LLM). Son principe de base est étonnamment simple : **prédire la suite la plus plausible d'un texte**, un morceau après l'autre. Tout le reste — répondre à une question, résumer un document, écrire un e-mail, produire du code — découle de cette capacité, poussée à une échelle considérable.

> Un LLM ne « cherche » pas une réponse dans une base de données : il **génère** un texte vraisemblable à partir de ce qu'il a appris et de ce que vous lui donnez.

## Les tokens : l'unité de base

Le modèle ne lit pas des mots mais des **tokens** : des fragments de texte (un mot court, une partie de mot, un signe de ponctuation). Le mot « formation » peut correspondre à un ou plusieurs tokens selon le modèle.

Pourquoi c'est utile de le savoir :

- les **limites de longueur** (ce que le modèle peut lire et écrire) s'expriment en tokens ;
- la **tarification** des API se fait généralement au token ;
- les modèles sont parfois maladroits sur des tâches qui exigent de « voir » les lettres (compter des caractères, épeler un mot à l'envers), car ils manipulent des fragments, pas des lettres.

## Deux phases : l'entraînement et l'utilisation

### 1. L'entraînement (une fois, chez l'éditeur)

- **Pré-entraînement** : le modèle apprend à prédire le token suivant sur un très grand volume de textes (pages web, livres, code…). Il en retire une connaissance statistique de la langue, des faits et des raisonnements fréquents.
- **Ajustement** : l'éditeur affine ensuite le modèle pour qu'il suive des instructions, dialogue de façon utile et refuse certaines demandes (techniques d'apprentissage à partir d'exemples et de retours humains ou automatisés).

À l'issue de l'entraînement, les connaissances du modèle sont **figées** : c'est la **date de coupure** (*knowledge cutoff*).

### 2. L'inférence (à chaque utilisation)

Quand vous envoyez un message, le modèle ne « réapprend » rien. Il lit votre conversation et génère la réponse token par token. Ce que vous écrivez dans une conversation **ne modifie pas le modèle** ; en revanche, selon l'offre et les réglages, l'éditeur peut conserver vos échanges ou les utiliser pour entraîner de futurs modèles — nous y reviendrons dans le module sur la confidentialité.

## La fenêtre de contexte : la « mémoire de travail »

Le modèle ne voit que ce qui se trouve dans sa **fenêtre de contexte** : vos instructions, l'historique de la conversation, les documents joints, et éventuellement des résultats de recherche web. Cette fenêtre est grande sur les assistants actuels, mais **elle n'est pas infinie**.

Conséquences pratiques :

| Situation | Ce qui se passe | Bon réflexe |
|---|---|---|
| Conversation très longue | Les premiers échanges peuvent être moins bien pris en compte | Ouvrir une nouvelle conversation par sujet |
| Document volumineux | Le modèle peut survoler certains passages | Lui demander de citer les passages utilisés |
| Information absente du contexte | Le modèle comble avec ce qu'il « croit savoir » | Fournir vous-même les sources fiables |

Certains assistants proposent aussi une **mémoire** entre conversations ou des **projets** regroupant des documents : c'est pratique, mais cela signifie que des informations sont conservées. Vérifiez ce qui est stocké et où.

## Génération et part d'aléatoire

À chaque étape, le modèle calcule une probabilité pour de nombreux tokens possibles, puis en choisit un. Ce choix comporte une part d'aléatoire réglable : c'est pourquoi **la même question peut produire des réponses différentes**. C'est un atout pour la créativité (plusieurs propositions de titres), et une contrainte pour les tâches qui exigent de la constance (on encadre alors davantage la demande).

## Au-delà du texte

Les assistants actuels sont souvent **multimodaux** : ils lisent des images, des PDF, des tableaux, parfois de l'audio, et peuvent produire des images ou exécuter du code pour faire des calculs. Ils peuvent aussi être connectés à des outils (recherche web, messagerie, documents d'entreprise). Le principe reste le même : un modèle qui génère, enrichi d'un contexte et d'outils.

## À retenir

- Un LLM **prédit** du texte plausible ; il ne consulte pas une vérité de référence.
- Ses connaissances s'arrêtent à une **date de coupure**, sauf s'il a accès à une recherche web ou à vos documents.
- Il ne voit que sa **fenêtre de contexte** : la qualité de la réponse dépend directement de la qualité de ce que vous lui donnez.`,
          exercise: `## Exercice : observer le modèle à l'œuvre (10 min)

1. Ouvrez l'assistant auquel vous avez accès et posez la question : « Quelle est la date de tes connaissances les plus récentes, et as-tu accès à Internet dans cette conversation ? »
2. Posez **trois fois** la même demande dans trois nouvelles conversations : « Propose un titre accrocheur pour une note interne annonçant une formation à l'IA. » Comparez les réponses.
3. Demandez : « Combien de lettres "e" contient la phrase : "Les entreprises européennes expérimentent" ? » puis vérifiez vous-même.

**Résultat attendu** : vous notez en quelques lignes (a) ce que l'assistant dit de sa date de coupure et de son accès au web, (b) la variabilité des réponses à une même demande, (c) si le comptage de lettres est exact. Gardez ces notes : elles servent de base à la leçon suivante sur les limites.`,
        },
        {
          slug: "limites-hallucinations-biais",
          title: "Les limites : hallucinations, biais et complaisance",
          durationMinutes: 35,
          objectives: [
            "Reconnaître une hallucination et en comprendre l'origine.",
            "Identifier les biais et la tendance à la complaisance des assistants.",
            "Classer les tâches selon qu'elles conviennent ou non à l'IA générative.",
          ],
          content: `## Les hallucinations

On appelle **hallucination** une réponse fausse présentée avec assurance : une référence juridique inexistante, une citation inventée, un chiffre plausible mais faux, une fonctionnalité logicielle qui n'existe pas.

Elles découlent directement du fonctionnement du modèle : il produit le texte **le plus vraisemblable**, pas le texte **vérifié**. Quand l'information manque, le modèle ne « sait pas qu'il ne sait pas » et comble le vide de façon cohérente.

Situations à risque élevé :

- références précises : articles de loi, jurisprudence, normes, numéros, URL ;
- chiffres, dates, statistiques, citations attribuées à une personne ;
- sujets récents (après la date de coupure) sans recherche web ;
- domaines de niche peu documentés publiquement ;
- questions sur votre propre entreprise, que le modèle ne connaît pas.

> Règle d'or : **plus la conséquence d'une erreur est élevée, plus la vérification humaine doit être rigoureuse.**

### Réduire le risque

1. **Fournir les sources** : collez le texte de référence et demandez de répondre *uniquement* à partir de celui-ci.
2. **Autoriser l'ignorance** : « Si l'information n'est pas dans le document, réponds "non précisé". »
3. **Exiger des citations** vérifiables (passage exact, page, lien) et les contrôler.
4. **Utiliser la recherche web** de l'assistant pour les sujets d'actualité — et ouvrir les liens proposés.

## Les biais

Le modèle a appris à partir de textes produits par des humains : il en reproduit les **stéréotypes** et les déséquilibres (représentations des métiers, des genres, des cultures, prédominance de certaines langues et de certains points de vue). Les éditeurs atténuent ces biais, sans pouvoir les supprimer.

En pratique, soyez particulièrement vigilant sur :

- les contenus RH (offres d'emploi, évaluation de candidatures, entretiens annuels) ;
- les textes destinés au public (communication, marketing) ;
- toute décision qui concerne des personnes.

**Une IA générative ne doit pas décider seule** de l'embauche, de la notation ou de l'accès d'une personne à un service : c'est un enjeu éthique, juridique (RGPD, AI Act) et de réputation.

## La complaisance

Les assistants ont tendance à **aller dans le sens de l'utilisateur** : valider une idée, adoucir une critique, changer d'avis dès qu'on les conteste, même quand ils avaient raison. On parle parfois de *sycophancy*.

Pour obtenir un avis utile :

- demandez explicitement une **critique** : « Liste les trois faiblesses principales de ce plan » ;
- évitez les questions orientées (« C'est une bonne idée, non ? ») ;
- faites jouer un rôle contradictoire : « Tu es un client exigeant qui reçoit cette proposition. Qu'est-ce qui te ferait refuser ? »

## Le non-déterminisme

Comme vu dans la leçon précédente, la même demande peut donner des résultats différents. Pour un usage professionnel répétitif, on compense par des **prompts précis**, des **formats de sortie imposés** (tableau, liste, gabarit) et des **exemples**.

## Ce que l'IA générative fait bien… et moins bien

| Plutôt adapté | À manier avec précaution | Plutôt inadapté |
|---|---|---|
| Reformuler, résumer, traduire | Calculs (préférer un outil qui exécute du code ou un tableur) | Décision automatique sur des personnes |
| Produire un premier jet | Faits précis et références | Source de vérité unique |
| Structurer des idées, des plans | Actualité récente | Données confidentielles dans un outil non validé |
| Proposer des variantes | Sujets juridiques, médicaux, financiers | Tâches sans relecture humaine à fort enjeu |
| Expliquer un concept, un texte, du code | Comptage, tri exact de grandes listes | |

## La posture à adopter

Considérez l'assistant comme **un stagiaire brillant, rapide, cultivé… et parfois trop sûr de lui**. Il accélère considérablement le travail de premier jet, mais **la responsabilité du résultat final reste la vôtre**. Relire, vérifier, compléter : c'est vous qui signez.`,
          exercise: `## Exercice : débusquer une hallucination (15 min)

1. Demandez à l'assistant : « Cite trois articles de loi français qui encadrent le télétravail, avec leur numéro et un résumé. »
2. Vérifiez chaque référence sur **Légifrance** (legifrance.gouv.fr). Notez les références exactes, approximatives ou inexistantes.
3. Recommencez en ajoutant : « Si tu n'es pas certain d'un numéro d'article, indique-le explicitement. » Comparez.
4. Soumettez ensuite un court texte que vous avez écrit (un paragraphe) et demandez d'abord « Qu'en penses-tu ? », puis « Liste les trois faiblesses principales de ce texte, sans complaisance. »

**Résultat attendu** : un tableau de vérification (référence / existe ? / correcte ?) et deux lignes sur la différence entre l'avis « poli » et la critique demandée explicitement.`,
        },
      ],
      quiz: {
        title: "Quiz — Comprendre l'IA générative",
        questions: [
          {
            prompt: "Quel est le principe de base d'un grand modèle de langage ?",
            choices: [
              "Rechercher la bonne réponse dans une base de données de faits vérifiés",
              "Prédire la suite la plus plausible d'un texte, token après token",
              "Copier des passages de pages web correspondant à la question",
              "Appliquer des règles logiques écrites par des experts",
            ],
            correct: [1],
            explanation:
              "Un LLM génère du texte en prédisant le token suivant le plus plausible. Il ne consulte pas une base de faits vérifiés, d'où le risque d'hallucination.",
          },
          {
            prompt: "Que se passe-t-il pour le modèle lorsque vous lui donnez des informations dans une conversation ?",
            choices: [
              "Le modèle est immédiatement réentraîné avec ces informations",
              "Les informations sont prises en compte dans la fenêtre de contexte de la conversation, sans modifier le modèle",
              "Les informations sont partagées avec tous les autres utilisateurs",
              "Le modèle les ignore s'il ne les connaissait pas déjà",
            ],
            correct: [1],
            explanation:
              "Pendant l'inférence, le modèle lit le contexte de la conversation mais n'est pas modifié. En revanche, selon l'offre, l'éditeur peut conserver les échanges ou les utiliser pour de futurs entraînements.",
          },
          {
            prompt: "Qu'est-ce que la « date de coupure » d'un modèle ?",
            choices: [
              "La date à laquelle l'abonnement expire",
              "La date au-delà de laquelle le modèle n'a pas de connaissances issues de son entraînement",
              "L'heure à laquelle la conversation est supprimée",
              "La date de publication de la dernière loi prise en compte par l'éditeur",
            ],
            correct: [1],
            explanation:
              "Les connaissances apprises sont figées à la fin de l'entraînement. Pour des informations plus récentes, il faut une recherche web ou fournir les sources.",
          },
          {
            prompt: "Parmi ces demandes, lesquelles présentent un risque élevé d'hallucination ? (plusieurs réponses)",
            choices: [
              "Citer des numéros d'articles de loi et de la jurisprudence",
              "Reformuler un paragraphe que vous avez fourni dans un ton plus formel",
              "Donner des statistiques précises sur un marché de niche",
              "Fournir l'URL exacte d'une étude",
            ],
            correct: [0, 2, 3],
            explanation:
              "Les références précises, chiffres et URL sont des zones à risque. La reformulation d'un texte fourni s'appuie sur le contexte et est beaucoup plus fiable.",
          },
          {
            prompt: "Pourquoi la même question peut-elle produire des réponses différentes ?",
            choices: [
              "Parce que le modèle est en panne",
              "Parce que la génération comporte une part d'aléatoire dans le choix des tokens",
              "Parce que le modèle apprend entre chaque question",
              "Parce que les réponses sont rédigées par des humains différents",
            ],
            correct: [1],
            explanation:
              "Le modèle choisit parmi plusieurs tokens probables avec une part d'aléatoire. On encadre la demande (format, exemples) quand on veut de la constance.",
          },
          {
            prompt: "Quelle est la meilleure façon d'obtenir une critique utile de votre travail ?",
            choices: [
              "Demander « C'est bien, non ? »",
              "Demander explicitement les faiblesses principales ou faire jouer un rôle contradictoire",
              "Insister jusqu'à ce que l'assistant soit d'accord",
              "Ne jamais demander d'avis à un assistant",
            ],
            correct: [1],
            explanation:
              "Les assistants tendent à la complaisance. Une demande explicite de critique ou un rôle contradictoire produit un retour plus exploitable.",
          },
          {
            prompt: "Lesquelles de ces utilisations sont à éviter ? (plusieurs réponses)",
            choices: [
              "Laisser l'IA décider seule du rejet d'une candidature",
              "Produire un premier jet de note interne relu ensuite",
              "Utiliser la réponse comme unique source de vérité pour un avis juridique",
              "Résumer un compte rendu de réunion fourni",
            ],
            correct: [0, 2],
            explanation:
              "Les décisions sur des personnes et les avis juridiques sans vérification sont à proscrire. Premiers jets et résumés relus sont des usages adaptés.",
          },
        ],
      },
    },
    // -----------------------------------------------------------------------
    // Module 2
    // -----------------------------------------------------------------------
    {
      title: "Prompting efficace",
      summary:
        "Structurer ses demandes pour obtenir du premier coup des résultats exploitables, puis les améliorer par itération.",
      durationMinutes: 90,
      lessons: [
        {
          slug: "anatomie-d-un-bon-prompt",
          title: "L'anatomie d'un bon prompt",
          durationMinutes: 45,
          objectives: [
            "Identifier les six composantes d'un prompt structuré.",
            "Transformer une demande vague en prompt précis.",
            "Imposer un format de sortie directement réutilisable.",
          ],
          content: `## Pourquoi le prompt compte autant

Le modèle ne connaît ni votre entreprise, ni votre interlocuteur, ni vos attentes implicites. Une demande vague produit une réponse générique. **Plus vous donnez de contexte utile, plus la réponse est précise.** Un bon prompt ressemble moins à une recherche Google qu'à un **brief donné à un collègue compétent qui découvre le dossier**.

## Les six composantes

| Composante | Question à se poser | Exemple |
|---|---|---|
| **Rôle** | Quelle expertise doit adopter l'assistant ? | « Tu es responsable de la relation client dans une PME industrielle. » |
| **Contexte** | Que doit-il savoir de la situation ? | « Un client attend une pièce depuis trois semaines ; le retard vient de notre fournisseur. » |
| **Tâche** | Que doit-il produire exactement ? | « Rédige la réponse à son e-mail de réclamation. » |
| **Format** | Sous quelle forme ? | « Un e-mail de 120 mots maximum, avec un objet. » |
| **Contraintes** | Ce qu'il faut faire ou éviter | « Ton empathique, pas de promesse de date ferme, pas de jargon. » |
| **Exemples** | À quoi ressemble un bon résultat ? | Un e-mail similaire que vous jugez réussi. |

Toutes les composantes ne sont pas nécessaires à chaque fois, mais **contexte, tâche et format** sont presque toujours indispensables.

## Avant / après

Demande vague :

~~~text
Écris un mail pour un client mécontent.
~~~

Prompt structuré :

~~~text
Tu es responsable de la relation client d'une PME qui fabrique des pièces
mécaniques.

Contexte : M. Durand, client depuis 5 ans, attend une commande de 200 pièces
depuis trois semaines. Le retard vient d'une rupture chez notre fournisseur
de matière première. Nous pouvons livrer 80 pièces sous 5 jours ouvrés.

Tâche : rédige la réponse à son e-mail de réclamation.

Format : objet + corps de 150 mots maximum.

Contraintes :
- ton empathique et professionnel, sans excuses excessives ;
- propose la livraison partielle comme option ;
- ne promets aucune date pour le solde ;
- termine par une proposition d'appel.
~~~

La seconde version obtient presque toujours un résultat utilisable avec une ou deux retouches.

## Les bonnes pratiques de rédaction

- **Soyez explicite** plutôt qu'implicite : « en 5 points » vaut mieux que « bref ».
- **Séparez les blocs** (instructions, données, exemples) par des titres, des tirets ou des balises du type « ### Document ».
- **Dites ce qu'il faut faire** plutôt que seulement ce qu'il faut éviter.
- **Précisez le destinataire** du texte final : un dirigeant, un client, un nouvel arrivant n'attendent pas le même niveau de détail.
- **Donnez la raison** d'une contrainte : « Pas de jargon, car le lecteur n'est pas technicien » aide le modèle à généraliser.

## Imposer un format exploitable

Le format est souvent ce qui fait gagner le plus de temps :

- **tableau** à colonnes nommées (pour comparer, pour coller dans un tableur) ;
- **liste à puces** avec un nombre d'éléments fixé ;
- **gabarit** à compléter (« Objet : … / Contexte : … / Décision attendue : … ») ;
- **longueur** en mots ou en lignes ;
- **langue et registre** (vouvoiement, anglais professionnel…).

~~~text
Présente le résultat sous forme de tableau avec les colonnes :
Risque | Probabilité (faible/moyenne/forte) | Impact | Action proposée.
Maximum 6 lignes.
~~~

## Fournir des données au modèle

Quand vous collez un document, **délimitez-le clairement** et indiquez ce qu'il faut en faire :

~~~text
Voici le compte rendu de la réunion, entre les balises <cr> et </cr>.
Extrais uniquement les décisions prises et les actions avec leur responsable.
Si un responsable n'est pas mentionné, écris « à définir ».

<cr>
[coller le texte ici]
</cr>
~~~

Rappel : avant de coller un document, vérifiez qu'il peut l'être dans l'outil utilisé (module 4).`,
          exercise: `## Exercice : de la demande vague au prompt structuré (20 min)

1. Choisissez une tâche réelle de votre semaine (un e-mail délicat, une synthèse, une annonce…).
2. Écrivez d'abord la demande telle que vous l'auriez tapée spontanément, et envoyez-la.
3. Réécrivez-la avec les six composantes (rôle, contexte, tâche, format, contraintes, exemple si possible). Envoyez-la dans une nouvelle conversation.
4. Comparez les deux résultats : temps de retouche estimé pour chacun.

**Résultat attendu** : vos deux prompts côte à côte, le prompt structuré annoté (une couleur ou une étiquette par composante), et une phrase sur le gain observé.`,
        },
        {
          slug: "iterer-et-techniques-avancees",
          title: "Itérer et techniques avancées",
          durationMinutes: 45,
          objectives: [
            "Améliorer une réponse par itérations ciblées plutôt que tout recommencer.",
            "Utiliser les exemples (few-shot), le découpage de tâche et l'auto-critique.",
            "Transformer un bon prompt en modèle réutilisable.",
          ],
          content: `## Le prompting est une conversation

Le premier résultat est rarement le dernier. Plutôt que de reformuler entièrement votre demande, **donnez des retours précis**, comme vous le feriez avec un collègue :

- « Plus court : 80 mots maximum. »
- « Garde la structure, mais remplace le ton commercial par un ton factuel. »
- « Le deuxième paragraphe est trop vague : ajoute un exemple concret tiré du contexte. »
- « Reprends la version précédente, j'ai préféré son introduction. »

Si la conversation part dans une mauvaise direction, **repartez d'une nouvelle conversation** avec un prompt corrigé : un historique confus pénalise les réponses suivantes.

## Technique 1 : donner des exemples (*few-shot*)

Montrer un ou plusieurs exemples du résultat attendu est souvent plus efficace qu'une longue description.

~~~text
Transforme les retours clients en fiches courtes, sur ce modèle :

Exemple :
Retour : « Livraison rapide mais carton abîmé, une pièce rayée. »
Fiche : Thème = Logistique | Sentiment = Mitigé | Action = Vérifier l'emballage

Retours à traiter :
1. « Le support m'a répondu en dix minutes, parfait. »
2. « Facture incompréhensible, trois lignes sans libellé. »
~~~

Variez vos exemples pour éviter que le modèle ne copie un détail non pertinent (longueur, vocabulaire).

## Technique 2 : découper la tâche

Une tâche complexe donne de meilleurs résultats en **plusieurs étapes** :

1. « Liste les idées principales de ce document. »
2. « Propose un plan de note de synthèse en 3 parties à partir de ces idées. »
3. « Rédige la partie 1 du plan. »

Vous contrôlez chaque étape et corrigez avant de poursuivre. C'est aussi la logique qui sera automatisée dans les workflows et agents (formation « Automatiser avec l'IA »).

## Technique 3 : laisser l'assistant poser des questions

Pour les demandes où vous ne savez pas tout préciser d'emblée :

~~~text
Je dois préparer un plan de formation pour mon équipe commerciale.
Avant de proposer quoi que ce soit, pose-moi les 5 questions les plus
utiles pour cadrer le besoin. Attends mes réponses.
~~~

## Technique 4 : demander un raisonnement ou une vérification

- « Avant de répondre, liste les hypothèses que tu fais. »
- « Relis ta réponse et signale les affirmations que je devrais vérifier. »
- « Propose trois options, puis recommande-en une en justifiant. »

L'**auto-critique** ne garantit pas l'exactitude, mais elle fait souvent apparaître des oublis et des points faibles.

## Technique 5 : jouer des rôles

- Simulation : « Tu es un acheteur qui négocie fermement. Je suis le commercial. Commence. »
- Relecture contradictoire : « Tu es juriste : relève les formulations ambiguës de ce contrat » (sans remplacer l'avis d'un professionnel).
- Pédagogie : « Explique ce concept à un nouvel arrivant, puis pose-moi 3 questions pour vérifier ma compréhension. »

## Du bon prompt au modèle réutilisable

Quand un prompt fonctionne bien, **ne le perdez pas** : transformez-le en gabarit avec des variables entre crochets.

~~~text
Rôle : tu es [fonction] dans [type d'entreprise].
Contexte : [situation en 3 lignes].
Tâche : rédige [livrable] destiné à [destinataire].
Format : [longueur, structure].
Contraintes : [ton], [à éviter], [à inclure absolument].
~~~

Rangez vos gabarits dans un document partagé, une note ou la fonctionnalité de l'assistant prévue à cet effet (instructions personnalisées, projets, assistants personnalisés selon l'outil). C'est l'objet de l'atelier final.

## Les erreurs fréquentes

| Erreur | Correction |
|---|---|
| Tout demander en une seule phrase | Découper et structurer |
| Accepter la première réponse | Itérer avec des retours précis |
| Ne jamais fournir d'exemple | Montrer un résultat attendu |
| Garder une conversation « polluée » | Repartir d'une conversation neuve |
| Oublier le destinataire final | Préciser qui lira le texte |`,
          exercise: `## Exercice : itérer et capitaliser (20 min)

1. Reprenez le prompt structuré de la leçon précédente.
2. Faites **trois itérations** ciblées (longueur, ton, ajout d'un élément) en notant chaque consigne donnée.
3. Testez la technique « pose-moi d'abord 5 questions » sur une tâche plus ouverte de votre métier.
4. Transformez votre meilleur prompt en **gabarit** avec au moins trois variables entre crochets.

**Résultat attendu** : un gabarit prêt à l'emploi, avec une ligne indiquant dans quel cas l'utiliser. Il rejoindra votre boîte à prompts dans l'atelier final.`,
        },
      ],
      quiz: {
        title: "Quiz — Prompting efficace",
        questions: [
          {
            prompt: "Quelles composantes sont presque toujours indispensables dans un prompt professionnel ? (plusieurs réponses)",
            choices: ["Le contexte", "La tâche", "Le format attendu", "Une formule de politesse"],
            correct: [0, 1, 2],
            explanation:
              "Contexte, tâche et format permettent au modèle de produire un résultat exploitable. La politesse n'a pas d'effet déterminant sur la qualité.",
          },
          {
            prompt: "Qu'est-ce que la technique « few-shot » ?",
            choices: [
              "Limiter le nombre de messages dans une conversation",
              "Fournir un ou plusieurs exemples du résultat attendu",
              "Poser une question très courte",
              "Utiliser plusieurs assistants en parallèle",
            ],
            correct: [1],
            explanation:
              "Le few-shot consiste à montrer des exemples d'entrée et de sortie attendue, ce qui guide efficacement le modèle.",
          },
          {
            prompt: "La conversation est partie dans une mauvaise direction après plusieurs échanges confus. Que faire ?",
            choices: [
              "Continuer en répétant la demande initiale plus fort",
              "Ouvrir une nouvelle conversation avec un prompt corrigé",
              "Abandonner l'outil",
              "Copier toute la conversation dans un nouveau message",
            ],
            correct: [1],
            explanation:
              "Un historique confus pénalise les réponses suivantes. Repartir d'une conversation neuve avec un prompt amélioré est plus efficace.",
          },
          {
            prompt: "Pourquoi découper une tâche complexe en plusieurs étapes ?",
            choices: [
              "Pour consommer plus de crédits",
              "Pour contrôler et corriger chaque étape avant de poursuivre",
              "Parce que les assistants ne peuvent traiter qu'une phrase à la fois",
              "Pour éviter que l'assistant ne lise le contexte",
            ],
            correct: [1],
            explanation:
              "Le découpage améliore la qualité et vous permet de valider chaque étape intermédiaire.",
          },
          {
            prompt: "Quelle consigne d'itération est la plus efficace ?",
            choices: [
              "« Ce n'est pas bien, refais. »",
              "« Garde la structure, réduis à 80 mots et remplace le ton commercial par un ton factuel. »",
              "« Fais mieux. »",
              "« Essaie encore une fois. »",
            ],
            correct: [1],
            explanation:
              "Un retour précis (ce qu'il faut garder, ce qu'il faut changer, et comment) permet une amélioration ciblée.",
          },
          {
            prompt: "Comment fournir un long document au modèle de façon fiable ?",
            choices: [
              "Le coller sans explication",
              "Le délimiter clairement (balises ou titres) et préciser ce qu'il faut en faire",
              "Le résumer soi-même en une phrase",
              "Le découper en morceaux envoyés sans consigne",
            ],
            correct: [1],
            explanation:
              "Délimiter les données et donner une consigne explicite évite que le modèle confonde instructions et contenu.",
          },
          {
            prompt: "Que faire d'un prompt qui fonctionne bien ? (plusieurs réponses)",
            choices: [
              "Le transformer en gabarit avec des variables",
              "Le ranger dans un espace partagé ou les instructions de l'outil",
              "Le supprimer pour garder un historique propre",
              "Indiquer dans quel cas l'utiliser",
            ],
            correct: [0, 1, 3],
            explanation:
              "Capitaliser sur ses prompts (gabarit, rangement, mode d'emploi) est ce qui produit des gains durables.",
          },
        ],
      },
    },
    // -----------------------------------------------------------------------
    // Module 3
    // -----------------------------------------------------------------------
    {
      title: "ChatGPT, Claude, Copilot, Mistral : bien choisir",
      summary:
        "Panorama factuel des principaux assistants et grille de critères pour choisir celui qui convient à votre contexte.",
      durationMinutes: 60,
      lessons: [
        {
          slug: "panorama-des-assistants",
          title: "Panorama des assistants et grille de choix",
          durationMinutes: 60,
          objectives: [
            "Situer les principaux assistants et leurs éditeurs.",
            "Distinguer offres grand public et offres entreprise.",
            "Appliquer une grille de critères pour choisir un assistant adapté à son contexte.",
          ],
          content: `## Avant de comparer : une précaution

Les assistants d'IA générative évoluent **très vite** : nouveaux modèles, nouvelles fonctionnalités, nouvelles offres et conditions plusieurs fois par an. Cette leçon décrit les **positionnements durables** des acteurs, pas une liste de fonctionnalités qui serait vite datée. **Vérifiez toujours la documentation et les conditions à jour de l'éditeur** avant une décision.

Méfiez-vous aussi des classements de « meilleur modèle » : les performances dépendent fortement de la tâche, de la langue et de la façon de formuler la demande. **Le meilleur test reste vos propres cas d'usage.**

## Les quatre assistants les plus rencontrés en entreprise

### ChatGPT — OpenAI

- Éditeur américain, à l'origine de la popularisation de l'IA générative grand public fin 2022.
- Assistant polyvalent : rédaction, analyse de fichiers, recherche web, génération d'images, assistants personnalisés, mode vocal.
- Offres individuelles gratuites et payantes, et offres pour les équipes et les grandes entreprises avec des engagements spécifiques sur les données et l'administration.

### Claude — Anthropic

- Éditeur américain fondé en 2021, qui met en avant la sécurité des modèles.
- Reconnu notamment pour la rédaction, l'analyse de longs documents et la programmation.
- Fonctionnalités de projets (documents de référence partagés), d'artefacts (documents ou petites applications générés à côté de la conversation) et de connexion à des outils externes, notamment via le protocole ouvert MCP (*Model Context Protocol*), initié par Anthropic.
- Offres individuelles et offres pour les équipes et entreprises.

### Microsoft 365 Copilot — Microsoft

- Intégré aux applications Microsoft 365 (Word, Excel, PowerPoint, Outlook, Teams…).
- Sa particularité : il peut s'appuyer sur **les données de l'entreprise** auxquelles l'utilisateur a déjà accès (e-mails, documents, réunions) via Microsoft Graph, en respectant les droits d'accès existants.
- Conséquence importante : si les droits de partage de votre SharePoint ou OneDrive sont trop larges, Copilot rend ces documents plus faciles à retrouver. **Un audit des permissions** est un préalable recommandé à son déploiement.
- Distinguer la licence Microsoft 365 Copilot (intégrée aux applications, payante) et l'application Copilot plus généraliste : les périmètres et protections diffèrent selon le compte utilisé (professionnel ou personnel).

### Le Chat — Mistral AI

- Éditeur **français**, fondé en 2023.
- Publie une partie de ses modèles en **poids ouverts** (*open-weight*), ce qui permet de les héberger soi-même ou chez un hébergeur de son choix.
- Assistant Le Chat avec offres gratuite, individuelles et professionnelles.
- Souvent considéré par les organisations sensibles à la localisation des données et à la souveraineté ; comme pour tout éditeur, les conditions d'hébergement et de traitement sont **à vérifier contractuellement**.

D'autres acteurs existent (Google Gemini, intégré à Google Workspace, ou des modèles ouverts d'autres éditeurs) : la même grille d'analyse s'applique.

## Grand public ou entreprise : la différence qui compte

| Critère | Offres grand public (gratuites ou individuelles) | Offres entreprise |
|---|---|---|
| Utilisation des données pour l'entraînement | Possible par défaut selon l'éditeur, souvent désactivable dans les réglages | En principe exclue selon les conditions publiées par l'éditeur, à vérifier contractuellement |
| Contrat de traitement des données (RGPD) | Généralement absent | Accord de traitement (DPA) disponible |
| Administration | Compte individuel | Gestion centralisée des utilisateurs, authentification unique, journaux |
| Partage | Personnel | Espaces d'équipe, règles de partage |

> En entreprise, la question n'est pas seulement « quel est le meilleur modèle ? » mais **« quel outil a été validé par mon organisation, avec quel contrat ? »**

## Grille de choix

Pour comparer plusieurs assistants dans votre contexte, notez chaque critère :

1. **Données et contrat** : où sont traitées et stockées les données ? Utilisation pour l'entraînement ? DPA disponible ? Sous-traitants ?
2. **Intégration** : l'outil s'intègre-t-il à votre environnement (Microsoft 365, Google Workspace, CRM, outils métiers) ?
3. **Qualité sur vos tâches** : testez 5 à 10 tâches réelles, avec les mêmes prompts, et comparez.
4. **Fonctionnalités utiles** : analyse de fichiers, recherche web, projets/espaces partagés, connecteurs, génération d'images, mode vocal.
5. **Administration et sécurité** : gestion des comptes, authentification unique, journaux, rétention des données.
6. **Coût total** : licences, mais aussi temps d'accompagnement et de formation.
7. **Adoption** : simplicité pour les utilisateurs, langue, accessibilité.

## Ce qu'il faut retenir

- Les quatre assistants sont **capables** pour la plupart des usages bureautiques ; les différences portent surtout sur l'**intégration**, les **conditions sur les données** et l'**écosystème**.
- **Copilot** brille quand le travail se fait dans Microsoft 365 et que les permissions sont maîtrisées.
- **Mistral** offre une option européenne et des modèles ouverts.
- **ChatGPT** et **Claude** sont des assistants généralistes très complets, avec des offres entreprise.
- Utilisez **l'outil validé par votre organisation** ; en l'absence de politique, posez la question avant d'y mettre des données internes.`,
          exercise: `## Exercice : comparer sur vos propres tâches (25 min)

1. Choisissez **trois tâches réelles** et non confidentielles de votre métier (par exemple : reformuler un e-mail, résumer un article public, structurer un plan).
2. Rédigez un prompt structuré pour chacune.
3. Soumettez les mêmes prompts à **au moins deux assistants** auxquels vous avez accès (versions gratuites acceptées pour cet exercice, sans données internes).
4. Notez chaque résultat de 1 à 5 sur : pertinence, qualité de rédaction, respect du format, temps de retouche estimé.
5. Complétez la grille de choix pour l'outil que vous utiliseriez en priorité, en indiquant les points à vérifier auprès de votre service informatique.

**Résultat attendu** : un tableau comparatif 3 tâches × 2 assistants et une recommandation argumentée en trois lignes.`,
        },
      ],
      quiz: {
        title: "Quiz — Choisir son assistant",
        questions: [
          {
            prompt: "Quelle est la particularité principale de Microsoft 365 Copilot ?",
            choices: [
              "Il est le seul à pouvoir rédiger des e-mails",
              "Il s'appuie sur les données de l'entreprise auxquelles l'utilisateur a accès, via Microsoft Graph",
              "Il fonctionne sans connexion Internet",
              "Il est développé par Mistral AI",
            ],
            correct: [1],
            explanation:
              "Copilot exploite les e-mails, documents et réunions accessibles à l'utilisateur dans Microsoft 365, en respectant les droits existants.",
          },
          {
            prompt: "Pourquoi un audit des permissions est-il recommandé avant de déployer Microsoft 365 Copilot ?",
            choices: [
              "Parce que Copilot modifie les permissions",
              "Parce que des droits de partage trop larges rendent des documents sensibles plus faciles à retrouver",
              "Parce que Copilot ne fonctionne qu'avec des dossiers privés",
              "Ce n'est pas nécessaire",
            ],
            correct: [1],
            explanation:
              "Copilot respecte les droits existants : si ceux-ci sont trop larges, des documents sensibles deviennent accessibles par simple question.",
          },
          {
            prompt: "Quelle affirmation sur Mistral AI est exacte ?",
            choices: [
              "C'est un éditeur américain",
              "C'est un éditeur français qui publie une partie de ses modèles en poids ouverts",
              "Il ne propose aucun assistant conversationnel",
              "Ses modèles ne peuvent pas être hébergés ailleurs que chez lui",
            ],
            correct: [1],
            explanation:
              "Mistral AI est un éditeur français ; certains de ses modèles sont publiés en poids ouverts et peuvent être auto-hébergés. Son assistant s'appelle Le Chat.",
          },
          {
            prompt: "Quelles différences distinguent généralement une offre entreprise d'une offre grand public ? (plusieurs réponses)",
            choices: [
              "Un accord de traitement des données (DPA) disponible",
              "Une administration centralisée des utilisateurs",
              "Des engagements sur la non-utilisation des données pour l'entraînement, à vérifier contractuellement",
              "Des réponses toujours exactes",
            ],
            correct: [0, 1, 2],
            explanation:
              "Les offres entreprise apportent contrat, administration et engagements sur les données. Aucune offre ne garantit des réponses exactes.",
          },
          {
            prompt: "Quelle est la méthode la plus fiable pour comparer deux assistants ?",
            choices: [
              "Consulter un classement général des meilleurs modèles",
              "Tester les mêmes prompts sur vos propres tâches réelles",
              "Choisir le plus récent",
              "Choisir le plus cher",
            ],
            correct: [1],
            explanation:
              "Les performances dépendent fortement de la tâche et de la langue. Vos propres cas d'usage sont le meilleur banc d'essai.",
          },
          {
            prompt: "Qu'est-ce que le protocole MCP (Model Context Protocol) ?",
            choices: [
              "Une norme de chiffrement des e-mails",
              "Un protocole ouvert permettant de connecter un assistant à des outils et sources de données externes",
              "Une certification européenne des modèles d'IA",
              "Un format de fichier de Microsoft",
            ],
            correct: [1],
            explanation:
              "MCP, initié par Anthropic, standardise la connexion des assistants à des outils et données. Il est approfondi dans la formation « Automatiser avec l'IA ».",
          },
        ],
      },
    },
    // -----------------------------------------------------------------------
    // Module 4
    // -----------------------------------------------------------------------
    {
      title: "Confidentialité, RGPD et AI Act",
      summary:
        "Les règles concrètes pour utiliser l'IA générative sans exposer les données de l'entreprise ni de ses clients, et les grandes lignes du règlement européen sur l'IA.",
      durationMinutes: 75,
      lessons: [
        {
          slug: "donnees-confidentialite-rgpd",
          title: "Données, confidentialité et RGPD",
          durationMinutes: 40,
          objectives: [
            "Identifier les données à ne jamais saisir dans un outil non validé.",
            "Appliquer les principes du RGPD à l'usage d'un assistant d'IA.",
            "Connaître les éléments contractuels à vérifier avec un éditeur.",
          ],
          content: `## Le réflexe de base

Tout ce que vous saisissez dans un assistant est **transmis à un service externe**. Selon l'offre, les données peuvent être conservées, consultées dans certains cas (modération, support) ou utilisées pour améliorer les modèles. La question à se poser avant chaque copier-coller :

> **« Est-ce que j'accepterais d'envoyer ce contenu par e-mail à un prestataire externe avec lequel mon entreprise n'a pas de contrat ? »**

Si la réponse est non, et que l'outil n'a pas été validé par votre organisation, ne le saisissez pas.

## Ce qu'on ne colle pas dans un outil non validé

- **Données personnelles** de clients, salariés, candidats, patients : noms, coordonnées, numéros d'identification, données de santé, évaluations, salaires.
- **Secrets d'affaires** : stratégie, prix et marges, offres en cours, projets de fusion, résultats non publiés.
- **Informations couvertes par une obligation de confidentialité** : contrats clients, accords de non-divulgation, dossiers juridiques.
- **Éléments de sécurité** : mots de passe, clés d'API, configurations, schémas d'architecture sensibles.
- **Code source propriétaire**, sauf outil validé pour cet usage.

### Techniques pour travailler malgré tout

- **Anonymiser ou pseudonymiser** : remplacer « M. Dupont, société X » par « le client A ».
- **Généraliser** : décrire la situation plutôt que coller le document.
- **Utiliser l'outil d'entreprise** validé, avec le bon compte (professionnel et non personnel).
- **Vérifier les réglages** : historique, mémoire, utilisation des données pour l'entraînement.

## Offres grand public et offres entreprise

Les offres grand public peuvent, selon l'éditeur et les réglages, utiliser vos conversations pour entraîner de futurs modèles. Les offres entreprise excluent en principe cette utilisation **selon les conditions publiées par l'éditeur, à vérifier contractuellement** : rétention, localisation, sous-traitants, accès du personnel de l'éditeur.

## Le RGPD appliqué à l'IA générative

Dès qu'un prompt contient des **données personnelles**, le RGPD s'applique. Les principes clés :

| Principe | Application concrète |
|---|---|
| **Base légale** | Le traitement doit reposer sur une base légale (contrat, intérêt légitime, obligation légale, consentement…) définie par l'organisation. |
| **Finalité** | Utiliser les données uniquement pour l'objectif prévu. |
| **Minimisation** | Ne transmettre que les données strictement nécessaires — souvent, aucune. |
| **Information des personnes** | Les personnes concernées doivent être informées des traitements les concernant. |
| **Sécurité** | Outil validé, comptes protégés, accès limités. |
| **Durée de conservation** | Connaître et maîtriser la rétention des conversations. |

### Le contrat avec l'éditeur : l'article 28

Lorsque l'éditeur traite des données personnelles pour le compte de votre organisation, il agit comme **sous-traitant** au sens du RGPD. L'article 28 impose un **contrat** (souvent appelé DPA, *Data Processing Agreement*) qui précise notamment l'objet du traitement, les mesures de sécurité, le recours à d'autres sous-traitants et le sort des données en fin de contrat.

### Les transferts hors de l'Union européenne

Si les données sont traitées hors de l'UE (par exemple aux États-Unis), le transfert doit être encadré : décision d'adéquation (comme le cadre de protection des données UE–États-Unis pour les entreprises certifiées), clauses contractuelles types, etc. C'est un point à vérifier par votre DPO ou votre juriste.

### Les ressources de la CNIL

La CNIL publie des **recommandations et fiches pratiques** sur l'intelligence artificielle et le RGPD (développement et déploiement de systèmes d'IA, information des personnes, sécurité). Consultez cnil.fr pour la version à jour.

## La charte d'usage interne

La façon la plus efficace d'encadrer les usages est une **charte d'usage de l'IA générative**, courte et concrète :

1. les outils autorisés (et avec quel compte) ;
2. les données interdites, autorisées sous condition, autorisées ;
3. l'obligation de relecture humaine et la responsabilité de l'auteur ;
4. les règles de transparence (mentionner l'usage de l'IA quand c'est pertinent) ;
5. le contact à solliciter en cas de doute (DPO, RSSI, référent IA).`,
          exercise: `## Exercice : trier et anonymiser (15 min)

1. Classez ces contenus en trois catégories — *interdit dans un outil non validé*, *possible après anonymisation*, *possible tel quel* :
   - un article de presse public sur votre secteur ;
   - le tableau des salaires de l'équipe ;
   - un e-mail client contenant nom, téléphone et numéro de commande ;
   - la fiche de poste publiée sur votre site carrière ;
   - le compte rendu du comité de direction sur un projet d'acquisition ;
   - un modèle de courrier vierge.
2. Prenez l'e-mail client et **anonymisez-le** pour pouvoir demander de l'aide à la rédaction d'une réponse.
3. Vérifiez dans les réglages de votre assistant : historique, mémoire et utilisation des données pour l'entraînement. Notez ce que vous trouvez.

**Résultat attendu** : votre classement justifié, l'e-mail anonymisé, et l'état des réglages de confidentialité de votre outil.`,
        },
        {
          slug: "ai-act-l-essentiel",
          title: "AI Act : l'essentiel pour les utilisateurs",
          durationMinutes: 35,
          objectives: [
            "Expliquer l'approche par les risques du règlement européen sur l'IA.",
            "Situer les principales échéances d'application.",
            "Identifier les obligations qui concernent dès aujourd'hui une organisation qui utilise l'IA.",
          ],
          content: `## Un règlement européen, directement applicable

Le **règlement (UE) 2024/1689**, dit **AI Act** ou règlement sur l'intelligence artificielle, est le premier cadre juridique horizontal sur l'IA. Il est **entré en vigueur le 1er août 2024** et s'applique **progressivement**. Comme tout règlement européen, il s'applique directement dans tous les États membres.

Il concerne à la fois les **fournisseurs** (ceux qui développent ou mettent sur le marché un système d'IA) et les **déployeurs** (les organisations qui utilisent un système d'IA dans le cadre de leur activité professionnelle). **Votre entreprise, en utilisant un assistant d'IA, est généralement un déployeur.**

## L'approche par les risques

| Niveau | Exemples | Régime |
|---|---|---|
| **Risque inacceptable** | Notation sociale, manipulation exploitant les vulnérabilités, reconnaissance des émotions sur le lieu de travail ou dans l'enseignement (sauf exceptions médicales ou de sécurité) | **Interdit** |
| **Haut risque** | IA utilisée pour le recrutement et la gestion du personnel, l'accès à l'éducation, l'évaluation de la solvabilité, certains usages dans les services publics, composants de sécurité de produits réglementés | Obligations fortes : gestion des risques, qualité des données, documentation, contrôle humain, information |
| **Risque lié à la transparence** | Chatbots, contenus générés ou manipulés (hypertrucages / *deepfakes*) | Informer que l'on interagit avec une IA ; signaler les contenus générés dans certains cas |
| **Risque minimal** | Filtres anti-spam, la plupart des usages bureautiques | Pas d'obligation spécifique |

Les **modèles d'IA à usage général** (ceux qui font fonctionner ChatGPT, Claude, Copilot ou Le Chat) font l'objet d'obligations propres pour leurs fournisseurs : documentation technique, informations aux intégrateurs, politique de respect du droit d'auteur, et obligations renforcées pour les modèles présentant un risque systémique.

## Le calendrier d'application

| Date | Ce qui s'applique |
|---|---|
| 1er août 2024 | Entrée en vigueur |
| 2 février 2025 | Interdictions (risque inacceptable) et **obligation de maîtrise de l'IA (article 4)** |
| 2 août 2025 | Obligations des fournisseurs de modèles d'IA à usage général ; gouvernance et sanctions |
| 2 août 2026 | Application de la plupart des autres dispositions, dont les obligations de transparence et la majorité des systèmes à haut risque |
| 2 août 2027 | Systèmes à haut risque intégrés à des produits déjà réglementés (annexe I) |

> Ce calendrier peut être **ajusté** : des propositions législatives européennes visant à simplifier ou à reporter certaines échéances ont été présentées. **Vérifiez toujours l'état du texte sur les sources officielles** (EUR-Lex, site de la Commission européenne, CNIL).

## L'article 4 : la maîtrise de l'IA

Depuis le 2 février 2025, fournisseurs et déployeurs doivent prendre des mesures pour garantir, **dans la mesure du possible, un niveau suffisant de maîtrise de l'IA** (*AI literacy*) de leur personnel et des personnes qui utilisent des systèmes d'IA pour leur compte, en tenant compte de leurs connaissances, de leur expérience et du contexte d'utilisation.

Concrètement, cela passe par :

- la **formation** des collaborateurs aux usages, limites et risques (ce que vous faites aujourd'hui) ;
- une **charte d'usage** et des règles claires ;
- un **inventaire** des outils et usages d'IA dans l'organisation ;
- la **traçabilité** de ces actions.

## Ce que cela change pour vous, au quotidien

1. **Utiliser des outils validés** et respecter la charte de l'organisation.
2. **Ne pas utiliser un assistant généraliste pour une décision à haut risque** (par exemple trier des candidatures) sans le cadre prévu par le règlement et par le RGPD.
3. **Être transparent** : informer quand un client échange avec un chatbot ; signaler, quand c'est requis, les images, sons ou vidéos générés réalistes.
4. **Garder un contrôle humain** sur les décisions importantes.
5. **Remonter les usages** nouveaux à la personne en charge (référent IA, DPO, juriste) pour qu'ils soient qualifiés.

## AI Act et RGPD : deux textes complémentaires

L'AI Act ne remplace pas le RGPD : dès que des données personnelles sont traitées, **les deux s'appliquent**. Le RGPD protège les personnes dont les données sont utilisées ; l'AI Act encadre la conception et l'usage des systèmes d'IA selon leur niveau de risque.`,
          exercise: `## Exercice : qualifier des usages (15 min)

Pour chacun des usages suivants, indiquez le niveau de risque probable au sens de l'AI Act et la principale précaution :

1. Un assistant qui aide à rédiger des e-mails commerciaux.
2. Un outil qui classe automatiquement les CV reçus et écarte une partie des candidats.
3. Un chatbot sur le site web qui répond aux questions des clients.
4. Un logiciel qui analyse les expressions du visage des salariés en réunion pour mesurer leur motivation.
5. La génération d'une image réaliste d'une personne pour une campagne publicitaire.

Puis, listez **trois actions** que votre organisation a déjà mises en place (ou devrait mettre en place) au titre de l'article 4.

**Résultat attendu** : un tableau usage / niveau de risque / précaution, et votre liste de trois actions. Corrigé discuté en séance avec le formateur.`,
        },
      ],
      quiz: {
        title: "Quiz — Confidentialité, RGPD et AI Act",
        questions: [
          {
            prompt: "Lesquels de ces contenus ne doivent pas être saisis dans un assistant non validé par votre organisation ? (plusieurs réponses)",
            choices: [
              "Le tableau des salaires de l'équipe",
              "Un article de presse public",
              "Un e-mail client avec nom et numéro de téléphone",
              "Une clé d'API d'un logiciel interne",
            ],
            correct: [0, 2, 3],
            explanation:
              "Données personnelles, informations RH et éléments de sécurité ne doivent pas être saisis dans un outil non validé. Un article public ne pose pas de problème de confidentialité.",
          },
          {
            prompt: "Quel article du RGPD impose un contrat entre le responsable de traitement et son sous-traitant ?",
            choices: ["Article 4", "Article 28", "Article 99", "Article 6 de l'AI Act"],
            correct: [1],
            explanation:
              "L'article 28 du RGPD encadre la relation avec un sous-traitant et impose un contrat (souvent appelé DPA).",
          },
          {
            prompt: "Quand l'AI Act est-il entré en vigueur ?",
            choices: ["1er août 2024", "25 mai 2018", "2 août 2027", "1er janvier 2023"],
            correct: [0],
            explanation:
              "Le règlement (UE) 2024/1689 est entré en vigueur le 1er août 2024 et s'applique progressivement. Le 25 mai 2018 correspond à l'application du RGPD.",
          },
          {
            prompt: "Depuis le 2 février 2025, quelles dispositions de l'AI Act s'appliquent ? (plusieurs réponses)",
            choices: [
              "Les interdictions des pratiques à risque inacceptable",
              "L'obligation de maîtrise de l'IA (article 4)",
              "L'ensemble des obligations relatives aux systèmes à haut risque intégrés à des produits réglementés",
              "Aucune disposition",
            ],
            correct: [0, 1],
            explanation:
              "Les interdictions et l'article 4 s'appliquent depuis le 2 février 2025. Les systèmes à haut risque de l'annexe I relèvent d'une échéance ultérieure (2 août 2027 selon le calendrier initial).",
          },
          {
            prompt: "Un outil qui trie automatiquement des candidatures relève, en principe, de quelle catégorie de l'AI Act ?",
            choices: ["Risque minimal", "Haut risque", "Aucune catégorie", "Transparence uniquement"],
            correct: [1],
            explanation:
              "Les systèmes d'IA utilisés pour le recrutement et la gestion du personnel figurent parmi les usages à haut risque.",
          },
          {
            prompt: "Une entreprise qui utilise un assistant d'IA dans son activité est, au sens de l'AI Act, généralement :",
            choices: ["Un fournisseur", "Un déployeur", "Un organisme notifié", "Exemptée"],
            correct: [1],
            explanation:
              "L'organisation qui utilise un système d'IA sous son autorité dans un cadre professionnel est un déployeur.",
          },
          {
            prompt: "Quelle affirmation sur l'AI Act et le RGPD est exacte ?",
            choices: [
              "L'AI Act remplace le RGPD pour tout ce qui concerne l'IA",
              "Les deux textes s'appliquent ensemble lorsque des données personnelles sont traitées",
              "Le RGPD ne s'applique pas aux assistants d'IA",
              "L'AI Act ne s'applique qu'aux éditeurs américains",
            ],
            correct: [1],
            explanation:
              "Les deux textes sont complémentaires : le RGPD protège les données personnelles, l'AI Act encadre les systèmes d'IA selon leur risque.",
          },
          {
            prompt: "Quelle technique permet de demander de l'aide sur un e-mail client sans exposer de données personnelles ?",
            choices: [
              "Coller l'e-mail tel quel dans un outil personnel",
              "Anonymiser ou pseudonymiser l'e-mail avant de le soumettre",
              "Envoyer l'e-mail depuis un autre ordinateur",
              "Traduire l'e-mail en anglais avant de le coller",
            ],
            correct: [1],
            explanation:
              "Remplacer les éléments identifiants (nom, téléphone, numéro de commande) permet de travailler sur le fond sans transmettre de données personnelles.",
          },
        ],
      },
    },
    // -----------------------------------------------------------------------
    // Module 5
    // -----------------------------------------------------------------------
    {
      title: "Cas d'usage par métier",
      summary:
        "Des usages concrets, des exemples de prompts et les précautions propres à chaque fonction de l'entreprise.",
      durationMinutes: 75,
      lessons: [
        {
          slug: "cas-usage-fonctions-support",
          title: "Fonctions support : RH, finance, juridique, direction",
          durationMinutes: 35,
          objectives: [
            "Identifier des cas d'usage pertinents dans les fonctions support.",
            "Adapter un exemple de prompt à sa propre situation.",
            "Repérer les précautions spécifiques à chaque fonction.",
          ],
          content: `## Une méthode pour repérer les bons cas d'usage

Les meilleurs candidats sont des tâches :

- **fréquentes** (plusieurs fois par semaine ou par mois) ;
- **à dominante rédactionnelle ou d'analyse de texte** ;
- dont le résultat est **facile à vérifier** par vous ;
- **sans décision automatique** sur des personnes.

## Ressources humaines

**Usages courants** : rédiger des offres d'emploi inclusives, préparer des guides d'entretien, structurer un parcours d'intégration, reformuler des notes internes, préparer une FAQ sur un accord d'entreprise.

~~~text
Tu es chargé(e) de recrutement. Rédige une offre d'emploi pour un poste de
[intitulé] dans une entreprise de [secteur, taille].
Missions : [liste]. Profil : [compétences indispensables / appréciées].
Contraintes : langage inclusif, pas de critère discriminatoire, 300 mots,
structure : accroche / missions / profil / ce que nous offrons.
~~~

**Précautions** : aucune donnée de candidat ou de salarié dans un outil non validé ; **pas de tri ni de notation de candidatures par l'IA** (usage à haut risque au sens de l'AI Act, et décision individuelle encadrée par le RGPD) ; relire les textes pour détecter les biais.

## Finance et contrôle de gestion

**Usages courants** : expliquer un écart budgétaire en langage clair pour la direction, rédiger le commentaire d'un reporting, construire ou expliquer une formule de tableur, préparer une procédure (notes de frais, clôture).

~~~text
Voici les écarts entre budget et réel du trimestre (données anonymisées) :
[tableau]
Rédige un commentaire de 150 mots pour le comité de direction : les trois
écarts les plus significatifs, leurs causes possibles à confirmer, et les
questions à poser aux responsables concernés.
~~~

**Précautions** : les assistants peuvent se tromper dans les calculs ; **refaites les calculs dans le tableur** ou utilisez une fonction d'analyse qui exécute réellement du code, et vérifiez. Pas de données financières non publiées dans un outil non validé.

## Juridique et conformité

**Usages courants** : résumer un contrat fourni, lister les clauses à examiner, comparer deux versions, vulgariser une notion pour des opérationnels, préparer une checklist de conformité.

~~~text
Voici un contrat de prestation (données anonymisées) entre <contrat> et </contrat>.
Liste sous forme de tableau : clause | ce qu'elle prévoit | point d'attention
pour le client. Cite le numéro d'article pour chaque ligne. Ne donne pas
d'avis juridique : signale seulement ce qui mérite une relecture par un juriste.
~~~

**Précautions** : risque élevé d'**hallucination de références** (articles, jurisprudence) — vérifiez sur Légifrance ou les bases officielles ; respect du secret professionnel et de la confidentialité ; l'assistant **ne remplace pas un conseil juridique**.

## Direction et management

**Usages courants** : préparer un ordre du jour, synthétiser des comptes rendus, structurer une note de décision, préparer un message de changement, simuler les objections d'une équipe.

~~~text
Je dois annoncer à mon équipe de 8 personnes une réorganisation des
plannings. Contexte : [3 lignes].
1. Liste les 6 objections ou inquiétudes les plus probables.
2. Pour chacune, propose une réponse honnête et concrète.
3. Propose un plan de réunion de 30 minutes.
~~~

**Précautions** : informations stratégiques uniquement dans un outil validé ; l'IA aide à préparer, **la décision et le dialogue restent humains**.

## Tableau récapitulatif

| Fonction | Gain typique | Vigilance principale |
|---|---|---|
| RH | Rédaction, structuration | Données personnelles, biais, pas de décision automatisée |
| Finance | Commentaires, formules | Exactitude des calculs, confidentialité |
| Juridique | Analyse de documents fournis | Références inventées, secret professionnel |
| Direction | Synthèse, préparation | Confidentialité stratégique |`,
          exercise: `## Exercice : adapter un prompt métier (15 min)

1. Choisissez l'exemple de prompt le plus proche de votre fonction (ou de la fonction avec laquelle vous travaillez le plus).
2. Adaptez-le à une situation réelle, en **anonymisant** les données.
3. Testez-le, puis notez ce que vous avez dû vérifier ou corriger.
4. Listez deux autres tâches de votre fonction qui répondent aux quatre critères (fréquentes, rédactionnelles, vérifiables, sans décision automatique).

**Résultat attendu** : un prompt métier testé, la liste des corrections apportées et deux nouveaux cas d'usage candidats.`,
        },
        {
          slug: "cas-usage-fonctions-operationnelles",
          title: "Fonctions opérationnelles : commerce, marketing, support, opérations",
          durationMinutes: 40,
          objectives: [
            "Identifier des cas d'usage pertinents dans les fonctions opérationnelles.",
            "Utiliser l'IA pour préparer, rédiger et analyser sans perdre la relation client.",
            "Appliquer les règles de transparence et de vérification.",
          ],
          content: `## Commercial

**Usages courants** : préparer un rendez-vous à partir d'informations publiques sur un prospect, personnaliser un e-mail de prospection, rédiger une proposition commerciale à partir d'un gabarit, simuler une négociation, synthétiser un appel.

~~~text
Tu es commercial(e) B2B. Voici des informations publiques sur l'entreprise
que je rencontre demain : [extraits du site, actualités].
Notre offre : [2 lignes].
1. Résume l'activité du prospect en 5 lignes.
2. Propose 5 questions de découverte adaptées.
3. Identifie 3 objections probables et une réponse pour chacune.
~~~

**Précautions** : vérifier toute information sur le prospect (l'assistant peut confondre des entreprises homonymes) ; ne pas saisir les données du CRM dans un outil non validé ; éviter les e-mails de prospection génériques envoyés en masse.

## Marketing et communication

**Usages courants** : décliner un message selon les canaux (site, réseau social, newsletter), proposer des idées de contenus, rédiger des premiers jets d'articles, adapter un texte à une cible, créer des variantes de titres à tester.

~~~text
Voici notre annonce de lancement (300 mots) : [texte].
Décline-la en :
- un post LinkedIn de 120 mots maximum, ton professionnel et concret ;
- un objet d'e-mail et un pré-en-tête (3 variantes) ;
- un paragraphe pour la page d'accueil du site.
Garde les faits strictement identiques : n'ajoute aucun chiffre ni promesse.
~~~

**Précautions** : **ne jamais publier de chiffres, témoignages ou références clients inventés** ; respecter les droits d'auteur et la charte graphique ; signaler les contenus générés réalistes (images, voix, vidéos) lorsque c'est requis ; relire pour garder une voix de marque cohérente.

## Support client

**Usages courants** : rédiger des réponses types, reformuler une réponse technique en langage simple, analyser des verbatims pour repérer des thèmes récurrents, enrichir une base de connaissances.

~~~text
Voici 30 verbatims clients anonymisés du mois : [liste].
Regroupe-les en 5 thèmes au maximum. Pour chaque thème : nombre de
verbatims, deux citations représentatives, une piste d'amélioration.
Présente le résultat en tableau.
~~~

**Précautions** : vérifier les comptages (recomptez sur un échantillon) ; anonymiser les messages ; si un chatbot répond directement aux clients, **informer qu'il s'agit d'une IA** et prévoir un passage vers un humain.

## Opérations, achats, qualité

**Usages courants** : rédiger ou mettre à jour une procédure, transformer des notes en mode opératoire, préparer un cahier des charges, comparer des offres fournisseurs fournies, préparer une analyse des causes (5 pourquoi, Ishikawa).

~~~text
Voici mes notes en vrac sur la procédure de réception des marchandises :
[notes]. Transforme-les en mode opératoire numéroté, avec pour chaque étape :
responsable, action, contrôle à effectuer. Signale les étapes qui semblent
manquer ou ambiguës sous forme de questions.
~~~

**Précautions** : faire valider les procédures par les personnes de terrain ; vérifier la conformité aux normes applicables, que l'assistant peut mal connaître ou mal citer.

## Les points communs à tous les métiers

1. **L'IA prépare, l'humain décide et signe.**
2. **Anonymiser** dès qu'un outil n'est pas validé pour les données concernées.
3. **Vérifier** chiffres, noms, références et calculs.
4. **Être transparent** avec les clients quand ils interagissent avec une IA.
5. **Capitaliser** : un prompt qui marche devient un gabarit partagé.

## Mesurer l'intérêt d'un cas d'usage

Avant de généraliser un usage, mesurez-le **vous-même** sur quelques occurrences : temps passé sans IA, temps passé avec IA (y compris la relecture et les corrections), qualité perçue du résultat. Ce sont vos propres mesures, et non des promesses générales, qui justifient d'étendre un usage à l'équipe.`,
          exercise: `## Exercice : construire votre carte des cas d'usage (20 min)

1. Listez **8 à 10 tâches** de votre poste.
2. Pour chacune, notez de 1 à 3 : fréquence, part rédactionnelle, facilité de vérification, sensibilité des données (3 = très sensible).
3. Sélectionnez les **3 tâches** au meilleur potentiel (fréquentes, vérifiables, peu sensibles ou traitables dans un outil validé).
4. Pour chacune, notez le temps que vous y consacrez aujourd'hui (estimation personnelle).

**Résultat attendu** : un tableau de 8 à 10 tâches notées et vos 3 tâches prioritaires. Elles seront le point de départ de l'atelier.`,
        },
      ],
      quiz: {
        title: "Quiz — Cas d'usage par métier",
        questions: [
          {
            prompt: "Quels critères caractérisent un bon cas d'usage de l'IA générative ? (plusieurs réponses)",
            choices: [
              "Une tâche fréquente",
              "Un résultat facile à vérifier",
              "Une décision automatique sur une personne",
              "Une dominante rédactionnelle ou d'analyse de texte",
            ],
            correct: [0, 1, 3],
            explanation:
              "Les tâches fréquentes, rédactionnelles et vérifiables sont de bons candidats. Les décisions automatiques sur des personnes sont à proscrire.",
          },
          {
            prompt: "En RH, quel usage est à proscrire avec un assistant généraliste ?",
            choices: [
              "Rédiger une offre d'emploi inclusive",
              "Trier et écarter automatiquement des candidatures",
              "Structurer un parcours d'intégration",
              "Préparer une FAQ sur un accord d'entreprise",
            ],
            correct: [1],
            explanation:
              "Le tri automatisé de candidatures relève du haut risque (AI Act) et des décisions individuelles encadrées par le RGPD.",
          },
          {
            prompt: "En finance, quelle précaution est essentielle ?",
            choices: [
              "Faire confiance aux calculs de l'assistant",
              "Vérifier les calculs dans le tableur ou via une fonction qui exécute réellement du code",
              "Arrondir tous les chiffres",
              "Utiliser uniquement l'anglais",
            ],
            correct: [1],
            explanation:
              "Les modèles de langage peuvent se tromper en calcul. Les chiffres doivent être recalculés et vérifiés.",
          },
          {
            prompt: "Dans un contexte juridique, quel est le principal risque ?",
            choices: [
              "Des réponses trop courtes",
              "Des références (articles, jurisprudence) inventées",
              "L'impossibilité de lire un contrat",
              "Une traduction automatique",
            ],
            correct: [1],
            explanation:
              "Les références précises sont une zone à fort risque d'hallucination : il faut les vérifier sur les bases officielles.",
          },
          {
            prompt: "En marketing, que ne faut-il jamais publier ? (plusieurs réponses)",
            choices: [
              "Des chiffres inventés par l'assistant",
              "Des témoignages clients inventés",
              "Un texte relu et validé par l'équipe",
              "Des références clients non autorisées",
            ],
            correct: [0, 1, 3],
            explanation:
              "Chiffres, témoignages et références doivent être réels et autorisés. Un texte relu et validé peut être publié.",
          },
          {
            prompt: "Un chatbot répond directement aux clients sur votre site. Que faut-il prévoir ?",
            choices: [
              "Le présenter comme un conseiller humain",
              "Informer qu'il s'agit d'une IA et prévoir un passage vers un humain",
              "Désactiver toute possibilité de contact humain",
              "Rien de particulier",
            ],
            correct: [1],
            explanation:
              "L'AI Act prévoit une obligation de transparence pour les systèmes qui interagissent avec des personnes ; un recours humain est une bonne pratique.",
          },
          {
            prompt: "Comment justifier l'extension d'un cas d'usage à toute l'équipe ?",
            choices: [
              "En citant des gains moyens annoncés par les éditeurs",
              "En mesurant soi-même le temps et la qualité, relecture comprise, sur plusieurs occurrences",
              "En se fiant à son intuition",
              "En demandant à l'assistant combien de temps il fait gagner",
            ],
            correct: [1],
            explanation:
              "Vos propres mesures, incluant le temps de vérification, sont la base la plus fiable pour décider.",
          },
        ],
      },
    },
    // -----------------------------------------------------------------------
    // Module 6
    // -----------------------------------------------------------------------
    {
      title: "Atelier : votre boîte à prompts",
      summary:
        "Atelier guidé : construire, tester et partager trois prompts réutilisables, puis formaliser un plan d'action individuel.",
      durationMinutes: 45,
      lessons: [
        {
          slug: "atelier-boite-a-prompts",
          title: "Atelier guidé : construire sa boîte à prompts et son plan d'action",
          durationMinutes: 45,
          objectives: [
            "Produire trois prompts réutilisables testés sur des tâches réelles.",
            "Documenter chaque prompt pour qu'un collègue puisse l'utiliser.",
            "Formaliser un plan d'action individuel pour les semaines suivantes.",
          ],
          content: `## Objectif de l'atelier

Repartir avec un **outil concret** : trois prompts réutilisables, testés sur vos tâches, documentés et prêts à être partagés — et un plan d'action pour ancrer les nouvelles pratiques. C'est cette mise en pratique qui sera évaluée par le formateur, et que le questionnaire à froid (environ 60 jours après la formation) vous invitera à faire le point sur son utilisation.

## Étape 1 — Choisir trois tâches (5 min)

Reprenez la carte des cas d'usage du module précédent et retenez **trois tâches** :

- une tâche **simple et fréquente** (gain rapide) ;
- une tâche **plus longue** qui bénéficierait d'un découpage en étapes ;
- une tâche **d'analyse** (synthèse, extraction, comparaison de documents).

Vérifiez pour chacune que les données pourront être traitées dans un outil validé, ou anonymisées.

## Étape 2 — Rédiger les prompts (15 min)

Pour chaque tâche, rédigez un prompt avec les six composantes (rôle, contexte, tâche, format, contraintes, exemple), puis transformez-le en **gabarit** avec des variables entre crochets.

Utilisez cette fiche pour documenter chaque prompt :

~~~text
Nom du prompt : [verbe + objet, ex. « Répondre à une réclamation client »]
Quand l'utiliser : [situation déclenchante]
Outil validé : [assistant et type de compte]
Données autorisées : [ce qu'on peut / ne peut pas coller]
Prompt :
  [le gabarit avec ses variables]
Vérifications obligatoires : [ce qu'il faut relire ou contrôler]
Exemple de résultat : [court extrait d'un bon résultat]
~~~

## Étape 3 — Tester et améliorer (15 min)

1. Testez chaque gabarit sur **deux situations réelles différentes**.
2. Notez les défauts récurrents et corrigez le gabarit (contrainte manquante, format imprécis, exemple à ajouter).
3. Mesurez **vous-même** le temps passé avec le prompt, relecture comprise, et comparez à votre estimation du temps habituel. Ces mesures personnelles vous serviront à décider quoi généraliser.

| Prompt | Test 1 | Test 2 | Correction apportée | Temps avec IA (relecture comprise) | Temps habituel estimé |
|---|---|---|---|---|---|
| … | | | | | |

## Étape 4 — Ranger et partager (5 min)

Rangez vos prompts là où vous les retrouverez **au moment où vous en avez besoin** :

- un document partagé de l'équipe (une page par prompt, avec la fiche ci-dessus) ;
- les fonctionnalités de l'assistant prévues à cet effet (instructions personnalisées, projets, assistants personnalisés), si votre organisation les autorise ;
- un outil de gestion de connaissances interne.

Partager ses prompts avec ses collègues multiplie leur valeur : chacun peut les réutiliser, les améliorer et signaler les cas où ils échouent.

## Étape 5 — Votre plan d'action individuel (5 min)

Complétez :

1. **Cette semaine**, j'utilise mes trois prompts au moins [n] fois chacun.
2. **D'ici un mois**, j'identifie [n] nouveaux cas d'usage et je les ajoute à ma boîte à prompts.
3. **Je partage** ma boîte à prompts avec [personnes / équipe] avant le [date].
4. **Je vérifie** auprès de [DPO / informatique / référent IA] les points restés en suspens : [liste].
5. **Je mesure** le temps passé sur mes trois tâches pendant deux semaines pour objectiver l'intérêt.

## Pour aller plus loin

- Approfondir l'automatisation (enchaîner des étapes sans copier-coller, connecter l'IA à vos outils) : formation « Automatiser avec l'IA : agents, n8n et MCP ».
- Revoir les leçons de ce parcours : elles restent accessibles sur la plateforme.
- Signaler toute difficulté ou réclamation via l'espace dédié de la plateforme.`,
          exercise: `## Livrable de l'atelier (à déposer ou présenter au formateur)

1. **Trois fiches prompts** complètes (nom, quand l'utiliser, outil, données autorisées, gabarit, vérifications, exemple de résultat).
2. Le **tableau de tests** rempli pour les trois prompts.
3. Votre **plan d'action individuel** complété (cinq engagements datés).

**Critères de réussite** : chaque prompt contient au moins contexte, tâche et format ; chaque fiche précise les vérifications obligatoires et les données autorisées ; le plan d'action comporte des échéances.`,
        },
      ],
      quiz: {
        title: "Quiz — Atelier boîte à prompts",
        questions: [
          {
            prompt: "Que doit contenir une fiche prompt bien documentée ? (plusieurs réponses)",
            choices: [
              "Le gabarit avec ses variables",
              "Les vérifications obligatoires",
              "Les données autorisées et l'outil validé",
              "Le mot de passe de l'outil",
            ],
            correct: [0, 1, 2],
            explanation:
              "La fiche doit permettre à un collègue d'utiliser le prompt correctement et en sécurité. Un mot de passe n'a rien à y faire.",
          },
          {
            prompt: "Pourquoi tester un gabarit sur deux situations réelles différentes ?",
            choices: [
              "Pour vérifier qu'il fonctionne au-delà du cas qui a servi à le rédiger",
              "Pour consommer son quota d'utilisation",
              "Parce que l'assistant l'exige",
              "Ce n'est pas utile",
            ],
            correct: [0],
            explanation:
              "Tester sur plusieurs cas fait apparaître les défauts récurrents et rend le gabarit robuste.",
          },
          {
            prompt: "Comment mesurer le gain réel d'un prompt ?",
            choices: [
              "Compter uniquement le temps de génération de la réponse",
              "Mesurer le temps total, relecture et corrections comprises, et le comparer au temps habituel",
              "Se fier au nombre de mots produits",
              "Demander à l'assistant d'estimer le gain",
            ],
            correct: [1],
            explanation:
              "Le temps de vérification fait partie du coût réel. Seule une mesure complète permet de décider de généraliser.",
          },
          {
            prompt: "Où ranger ses prompts pour qu'ils soient réellement utilisés ?",
            choices: [
              "Dans l'historique de conversation uniquement",
              "Là où on les retrouve au moment du besoin : document d'équipe, fonctionnalités autorisées de l'assistant, base de connaissances",
              "Sur un post-it",
              "Nulle part, il vaut mieux les réécrire à chaque fois",
            ],
            correct: [1],
            explanation:
              "Un prompt n'a de valeur que s'il est accessible facilement, idéalement partagé avec l'équipe.",
          },
          {
            prompt: "Quelle tâche est la plus adaptée pour un premier prompt de « gain rapide » ?",
            choices: [
              "Une tâche simple et fréquente",
              "Une décision stratégique annuelle",
              "Une tâche impliquant des données de santé dans un outil non validé",
              "Une tâche qui n'arrive qu'une fois par an",
            ],
            correct: [0],
            explanation:
              "Une tâche simple et fréquente permet de constater rapidement l'intérêt et d'ancrer la pratique.",
          },
          {
            prompt: "Quels éléments rendent un plan d'action individuel efficace ? (plusieurs réponses)",
            choices: [
              "Des engagements concrets",
              "Des échéances datées",
              "Une mesure de l'usage réel",
              "Des objectifs vagues sans date",
            ],
            correct: [0, 1, 2],
            explanation:
              "Concret, daté et mesuré : c'est ce qui transforme la formation en nouvelles habitudes de travail.",
          },
        ],
      },
    },
  ],
};

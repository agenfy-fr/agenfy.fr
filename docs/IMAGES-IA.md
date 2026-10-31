# Illustrations IA du site — guide ChatGPT

Ce guide sert à produire les **15 visuels d'en-tête** de www.agenfy.fr avec ChatGPT (GPT-4o / gpt-image),
dans un style éditorial inspiré d'all-with-ai.com, aux couleurs d'Agenfy.

Chaque page principale a déjà son emplacement dans le code (`apps/web/src/lib/illustrations.ts`).
**Tant qu'un fichier manque, l'emplacement reste invisible** : on peut donc ajouter les images une par une.

## 1. Les fichiers à produire

| Fichier | Page(s) | Ratio | Taille à exporter |
|---|---|---|---|
| `hero.webp` | Accueil (sous le titre) | 16:9 | 1600 × 900 |
| `services.webp` | /services | 3:2 | 1536 × 1024 |
| `audit.webp` | /services/audit-strategie-ia | 3:2 | 1536 × 1024 |
| `agents.webp` | /services/agents-ia | 3:2 | 1536 × 1024 |
| `developpement.webp` | /services/intelligence-artificielle | 3:2 | 1536 × 1024 |
| `formation.webp` | /formations et chaque fiche /formations/… | 3:2 | 1536 × 1024 |
| `fondations.webp` | /services/data et /services/cloud | 3:2 | 1536 × 1024 |
| `diagnostic.webp` | /diagnostic-ia | 3:2 | 1536 × 1024 |
| `methodologie.webp` | /methodologie | 3:2 | 1536 × 1024 |
| `etudes-de-cas.webp` | /etudes-de-cas et chaque étude | 3:2 | 1536 × 1024 |
| `blog.webp` | /blog | 3:2 | 1536 × 1024 |
| `glossaire.webp` | /glossaire et chaque définition | 3:2 | 1536 × 1024 |
| `comparatifs.webp` | /comparatifs et les deux comparatifs | 3:2 | 1536 × 1024 |
| `a-propos.webp` | /a-propos | 3:2 | 1536 × 1024 |
| `contact.webp` | /contact (colonne de gauche) | 3:2 | 1536 × 1024 |

Pages volontairement sans visuel : articles du blog, page auteur (photo réelle), mentions légales, CGV,
politique de confidentialité, espace /admin.

## 2. Règles (à respecter pour chaque image)

- **Aucun texte lisible** : ni titre, ni mot dans les écrans ou les cartes (des barres grises abstraites à la place).
- **Aucun logo de marque** : ni OpenAI, Anthropic, Microsoft, Google, Apple, ni logo Agenfy (le logo est déjà dans l'en-tête du site).
- **Aucun visage réel ni reconnaissable** : personnages vus de dos, de trois-quarts ou de profil, traits simplifiés.
  Ne jamais envoyer la photo d'une vraie personne à ChatGPT pour la « mettre en scène ».
- Pas de chiffres, de prix, de faux résultats ni de faux certificats/labels (règle éditoriale Agenfy).
- Toujours les **mêmes personnages** et le **même style** d'une image à l'autre (voir ci-dessous).
- Composition aérée : le sujet légèrement décentré, beaucoup d'espace vide, rien d'important dans les 8 % du bord
  (l'image est affichée avec des coins arrondis et un léger zoom de parallaxe).

## 3. Personnages récurrents

- **Léa** : jeune femme d'environ 28 ans, cheveux bruns ondulés mi-longs, pull en maille crème, petites créoles dorées,
  ordinateur portable gris clair. Vue de trois-quarts dos ou de profil.
- **Malik** : jeune homme d'environ 30 ans, cheveux noirs courts, sweat à capuche bleu nuit, montre noire.
  Vu de dos ou de profil.
- Les autres personnages (équipes, clients) restent secondaires, plus flous, vêtements neutres (blanc, gris, bleu nuit).

## 4. Bloc de style commun

Il est **déjà inclus** dans chaque prompt de la section 6 ; il est donné ici pour référence.

```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background
(#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet
(#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating
semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) around the subject, with
abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details.
Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos,
no watermark. People are seen from behind, in profile or three-quarter view, with simplified features and no
identifiable real person.
```

## 5. Méthode dans ChatGPT

1. Ouvrir **une seule conversation** ChatGPT (modèle avec génération d'images, GPT-4o / gpt-image) et commencer par `hero`.
2. Coller le prompt complet, tel quel. Le format paysage (1536 × 1024) est indiqué dans le prompt.
3. Si le résultat convient, enchaîner les autres prompts **dans la même conversation** : ChatGPT garde mieux
   le style et les personnages. En cas de dérive, ajouter :
   `Keep exactly the same illustration style, colors and characters as the first image.`
   On peut aussi joindre l'image `hero` validée en référence.
4. Corrections fréquentes à demander :
   - texte apparu dans un écran → `Remove every letter, word and number; replace them with abstract grey bars.`
   - trop chargé → `Simplify: fewer floating cards, more empty off-white space.`
   - couleurs ternes → `Make the indigo and violet accents more luminous, keep the background off-white.`
5. Télécharger l'image en PNG (bouton de téléchargement), puis l'exporter (section 7).

## 6. Prompts prêts à coller

Chaque bloc se colle seul : le style y est déjà intégré.

### hero — accueil (16:9)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Malik, a young man around 30 with short black hair and a navy-blue hoodie, seen from behind at a three-quarter angle, sits at a clean white desk working on a light-grey laptop. Around him float translucent cards: an AI agent workflow graph with connected nodes, a rising line chart, a small stack of server blocks and a glowing neural network sphere. A large soft indigo-to-violet gradient leaf shape sweeps behind him. Subject right of center, wide empty space on the left. Wide landscape format, 1536 x 1024, with the important content in the central horizontal band so it can be cropped to 16:9.
```

### services — /services (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Léa, a young woman around 28 with shoulder-length wavy brown hair, a cream knit sweater and small gold hoop earrings, seen in three-quarter back view, standing at a tall white table with her light-grey laptop. Around her, four floating translucent cards arranged in an arc, each with a simple icon: a magnifying glass over a chart (audit), a small robot-like glowing orb linked to app tiles (AI agents), code brackets (development), a graduation cap (training). Below them, two solid white blocks with a database cylinder and a cloud shape, as foundations. Thin indigo orbit lines link everything. Landscape format 1536 x 1024 (3:2).
```

### audit — /services/audit-strategie-ia (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Léa (wavy brown hair, cream knit sweater) and Malik (short black hair, navy hoodie), seen from the side, stand with a business manager in a bright meeting room in front of a large glass wall. Blank pastel sticky notes are arranged on a two-axis matrix drawn with thin indigo lines. Floating cards show a prioritised list made of grey bars and a simple timeline with three milestones. Calm, collaborative atmosphere. Landscape format 1536 x 1024 (3:2).
```

### agents — /services/agents-ia (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a friendly abstract AI agent represented as a glowing indigo-violet orb in the center, connected by thin luminous lines to floating generic app cards (envelope icon for email, pipeline columns, calendar grid, spreadsheet grid, document page). In the foreground, Léa (wavy brown hair, cream knit sweater), seen in three-quarter back view at her laptop, validates an action with a glowing check toggle, showing a human in the loop. Landscape format 1536 x 1024 (3:2).
```

### developpement — /services/intelligence-artificielle (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Malik (short black hair, navy hoodie), seen from behind at a white desk with two monitors showing abstract code blocks made of colored bars and a chat interface with speech bubbles filled with grey bars. Floating cards: a simple architecture diagram of connected boxes, a circular gauge, and a database cylinder with a small padlock. Soft violet glow from the screens. Landscape format 1536 x 1024 (3:2).
```

### formation — /formations et fiches formation (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a small group of four diverse employees seen from behind in a bright modern training room, each with a laptop, following Léa (wavy brown hair, cream knit sweater) who stands in profile and points at a large screen showing an abstract prompt-and-answer interface (two speech bubbles filled with grey bars). Floating cards: a progress bar, a short quiz with check marks, a round badge with a star (no text). Warm, engaging learning atmosphere. Landscape format 1536 x 1024 (3:2).
```

### fondations — /services/data et /services/cloud (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: an isometric-inspired composition of clean white server blocks and soft cloud shapes connected by glowing indigo data pipelines that flow into a floating dashboard with simple bar and line charts. Malik (short black hair, navy hoodie), seen in profile on the side at a laptop, monitors the flows. Structured, solid, reliable mood. Landscape format 1536 x 1024 (3:2).
```

### diagnostic — /diagnostic-ia (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a business owner in a light shirt, seen in three-quarter back view, sits in a comfortable armchair holding a tablet. Floating above the tablet: a large semicircular gauge with a glowing indigo needle, a radar chart with five axes, and a short checklist with round check marks (no text). A soft violet gradient shape behind. Thoughtful, reassuring mood. Landscape format 1536 x 1024 (3:2).
```

### methodologie — /methodologie (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a large luminous circular path made of five glowing stepping stones linked by a thin indigo orbit line, floating above a white desk; each stone carries a simple icon (graduation cap, magnifying glass, prototype wireframe, gear, rising chart). Léa (wavy brown hair, cream knit sweater) and Malik (short black hair, navy hoodie), seen from behind, look at the path and point at the next step. Orderly, confident mood. Landscape format 1536 x 1024 (3:2).
```

### etudes-de-cas — /etudes-de-cas et pages d'étude (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a small team of three seen from behind, including Léa (wavy brown hair, cream knit sweater), standing in front of a large wall screen that shows a "before and after" composition: on the left a tangled grey process diagram, on the right a clean indigo workflow with a rising line chart. Floating cards with abstract bars and check marks around them. Satisfied, analytical mood. Landscape format 1536 x 1024 (3:2).
```

### blog — /blog (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Léa (wavy brown hair, cream knit sweater), seen in profile, sits cross-legged on a light sofa with a cup of coffee, reading on her laptop. Around her float several article cards made of a thumbnail shape and grey text bars, a small line chart, a cloud shape and a node graph, like ideas coming out of the screen. Cozy, curious, inspiring mood. Landscape format 1536 x 1024 (3:2).
```

### glossaire — /glossaire et définitions (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: an open light-grey laptop on a white desk; from its screen rises a neat spiral of floating index cards, each with a small icon (neural network, speech bubble, database, robot-like orb, magnifying glass, shield) and grey bars instead of words. A hand of Malik (navy hoodie sleeve) picks one card. Clear, pedagogical, tidy mood. Landscape format 1536 x 1024 (3:2).
```

### comparatifs — /comparatifs et pages comparatives (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Malik (short black hair, navy hoodie), seen from behind at a white desk, looks at a wide monitor showing four generic chat windows side by side, each with a different abstract colored shape as avatar (circle, square, triangle, star; no real logos). Floating above: a balance scale made of light and a comparison grid with check marks and empty circles. Neutral, objective mood. Landscape format 1536 x 1024 (3:2).
```

### a-propos — /a-propos (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: a bright, plant-filled small studio office with large windows. Léa (wavy brown hair, cream knit sweater) and Malik (short black hair, navy hoodie), seen from behind, sit side by side at a long wooden table with a client, all looking at one shared laptop. Floating cards around them: a lightbulb, a shield, a simple rising chart and a handshake icon. Human, trustworthy, close-knit mood. Landscape format 1536 x 1024 (3:2).
```

### contact — /contact (3:2)
```
Editorial digital illustration, semi-realistic, soft cinematic lighting, very light warm off-white background (#F7F6F3) with lots of negative space and subtle paper grain. Accent colors: electric indigo (#3200F8) and violet (#AA0BE2), used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) with abstract grey placeholder bars instead of any text. Small cross markers and pixel squares as decorative details. Modern, calm, premium tech-consulting mood. Strictly no readable text, no letters, no numbers, no brand logos, no watermark. People seen from behind, in profile or three-quarter view, with simplified features and no identifiable real person.

Scene: Léa (wavy brown hair, cream knit sweater), seen in three-quarter back view, sits at a white desk with a coffee cup and starts a video call on her light-grey laptop; the screen shows a blurred generic silhouette in a video window. Floating cards: a calendar grid with one slot highlighted in indigo, a speech bubble, a small clock icon. Welcoming, friendly mood. Landscape format 1536 x 1024 (3:2).
```

## 7. Export

1. **Recadrer si besoin** : `hero` en 16:9 (1600 × 900, ou 1536 × 864 sans agrandir) ; les autres restent en 1536 × 1024.
2. **Convertir en WebP, moins de 400 Ko** :
   - en ligne : [squoosh.app](https://squoosh.app) → format WebP, qualité 75-80, redimensionner si nécessaire ;
   - ou en ligne de commande (`brew install webp`) :
     `cwebp -q 78 -resize 1536 0 image.png -o services.webp`
     (pour le hero : `cwebp -q 78 -crop 0 80 1536 864 hero.png -o hero.webp`, ajuster le décalage vertical).
3. **Nommer exactement** comme dans le tableau (minuscules, tirets, sans accent) : `etudes-de-cas.webp`, `a-propos.webp`…
   Les formats `.png`, `.jpg` et `.jpeg` fonctionnent aussi, mais le WebP est plus léger.

## 8. Ajouter les images au site

1. Déposer les fichiers dans `apps/web/public/illustrations/`.
2. Vérifier en local : `pnpm dev:web`, puis ouvrir la page concernée (l'image apparaît sous le titre).
3. Commit + push : l'image apparaît en production au déploiement suivant (Vercel).
4. Pour remplacer une image : écraser le fichier en gardant le même nom. Pour la retirer : supprimer le fichier.

Côté code (pour un développeur) : les emplacements, textes alternatifs et dimensions sont définis dans
`apps/web/src/lib/illustrations.ts` ; le composant `Illustration` n'affiche rien tant que le fichier n'existe pas.

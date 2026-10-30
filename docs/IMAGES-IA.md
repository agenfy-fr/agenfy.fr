# Illustrations IA du site

Six images, dans le même style que la référence all-with-ai.com, aux couleurs d'Agenfy.
Générer avec ChatGPT (GPT-4o / gpt-image), Midjourney ou Gemini, puis déposer les fichiers dans
`apps/web/public/illustrations/` sous le nom indiqué (`.webp`, `.png` ou `.jpg`). Chaque image apparaît
automatiquement sur sa page au déploiement suivant ; tant qu'un fichier manque, l'emplacement reste invisible.

| Fichier | Page(s) | Format |
|---|---|---|
| `hero` | Accueil, sous le titre | 16:9 (1600 × 900 min.) |
| `audit` | /services/audit-strategie-ia | 3:2 (1200 × 800 min.) |
| `agents` | /services/agents-ia | 3:2 |
| `developpement` | /services/intelligence-artificielle | 3:2 |
| `formation` | /formations | 3:2 |
| `fondations` | /services/data et /services/cloud | 3:2 |

Règles : pas de texte lisible, pas de logos de marques (OpenAI, Anthropic, Google…), pas de visage de
personne réelle. Garder la même personne (ou le même style de personnages) d'une image à l'autre.
Optimiser avant dépôt si possible (WebP, < 400 Ko) ; Next.js redimensionne de toute façon.

## Bloc de style (à coller au début de chaque prompt)

```
Editorial digital illustration, soft cinematic lighting, very light warm off-white background (#F7F6F3)
with lots of negative space, subtle paper grain. Accent colors: electric indigo (#3200F8) and violet
(#AA0BE2) used as soft glowing shapes, thin orbit lines and translucent gradient planes. Floating
semi-transparent UI cards (minimal dashboards, line charts, toggles, node graphs) around the subject,
with abstract placeholder bars instead of readable text. Small cross markers and pixel squares as
decorative details. Modern, calm, premium tech-consulting mood. No readable text, no brand logos.
```

## Prompts

### hero — 16:9
```
[STYLE] A young professional in a dark hoodie seen from behind at three-quarter angle, sitting at a white
desk working on a laptop. Around him float translucent cards: an AI agent workflow graph, a "time saved"
rising line chart, a small stack of server blocks and a glowing neural network. A soft indigo-to-violet
gradient leaf shape sweeps behind him. Composition with the subject right of center, wide format 16:9.
```

### audit — 3:2
```
[STYLE] Two consultants and a business manager in a bright meeting room, seen from the side, standing
in front of a large glass wall covered with sticky notes arranged on a value × feasibility matrix.
Floating cards show a prioritised list and a 90-day roadmap timeline. Calm, collaborative atmosphere.
Format 3:2.
```

### agents — 3:2
```
[STYLE] A friendly abstract AI agent represented as a glowing indigo orb connected by thin luminous
lines to floating app cards (email, CRM pipeline, calendar, spreadsheet, document). A person at a laptop
in the foreground validates an action with a check toggle, showing human-in-the-loop control. Format 3:2.
```

### developpement — 3:2
```
[STYLE] A developer seen from behind at a desk with two monitors showing abstract code blocks and a chat
interface with an AI assistant. Floating cards: an API architecture diagram, an evaluation score gauge,
a secured database icon with a lock. Violet glow from the screens. Format 3:2.
```

### formation — 3:2
```
[STYLE] A small group of four diverse employees in a modern training room, each with a laptop, following
a trainer pointing at a large screen with an abstract prompt-and-answer interface. Floating cards: a
progress bar, a quiz with check marks, a completion badge. Warm, engaging learning atmosphere. Format 3:2.
```

### fondations — 3:2
```
[STYLE] Isometric-inspired scene of clean white server blocks and cloud shapes connected by glowing
indigo data pipelines flowing into a floating dashboard with charts. A data engineer at a laptop on the
side monitors the flows. Structured, solid, reliable mood. Format 3:2.
```

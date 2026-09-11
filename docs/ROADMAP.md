# Roadmap Agenfy

Suivi des 13 phases définies pour la transformation d'Agenfy. Mis à jour au fil de l'exécution — c'est le document à consulter pour savoir "où on en est".

## État global

| # | Phase | Statut | Doc associé |
|---|---|---|---|
| 1 | Audit | ✅ Fait | [AGENFY-AUDIT.md](AGENFY-AUDIT.md) |
| 2 | Architecture | 🔵 En cours | ce document + DESIGN-SYSTEM.md, ADMIN-ARCHITECTURE.md, SEO-STRATEGY.md, GEO-STRATEGY.md, CONTENT-STRATEGY.md |
| 3 | Design System | ⬜ Planifié | [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) |
| 4 | UI (navbar, hero, sections, cards, CTA, footer) | ⬜ Planifié | — |
| 5 | Motion | ⬜ Planifié | DESIGN-SYSTEM.md §5 |
| 6 | SEO (metadata, sitemap, robots, schema, maillage) | 🟡 Partiellement fait (quick wins Phase 1) | [SEO-STRATEGY.md](SEO-STRATEGY.md) |
| 7 | GEO (FAQ, auteurs, sources, entités) | ⬜ Planifié | [GEO-STRATEGY.md](GEO-STRATEGY.md) |
| 8 | Blog / CMS | ⬜ Planifié | [CONTENT-STRATEGY.md](CONTENT-STRATEGY.md), ADMIN-ARCHITECTURE.md |
| 9 | Admin dashboard | ⬜ Planifié | [ADMIN-ARCHITECTURE.md](ADMIN-ARCHITECTURE.md) |
| 10 | AI Content Engine | ⬜ Planifié | CONTENT-STRATEGY.md §5 |
| 11 | Leads / CRM léger | ⬜ Planifié | ADMIN-ARCHITECTURE.md §4 |
| 12 | Performance | ⬜ Planifié | — |
| 13 | Tests | ⬜ Planifié | — |

## Décisions déjà prises (à ne pas re-discuter sans raison)

| Décision | Prise le | Raison |
|---|---|---|
| Études de cas actuelles = "Exemple / démonstration", pas des clients nommés | Phase 1 | Les témoignages avec noms/entreprises étaient fictifs (voir audit §1.3) |
| `/carrieres` supprimée entièrement | Phase 1 | Le bouton "Postuler" pointait vers une route `[id]` inexistante ; corriger proprement suppose de décider où vont les candidatures, ce qui est un chantier CRM séparé |
| Gestionnaire de paquets : **pnpm** (pas npm/yarn) | Phase 1 | Demande explicite |
| Pillar pages SEO = pages `/services/*` existantes, pas de nouvelles URLs racine (`/ia`, `/data`...) | Phase 2 | Évite un chantier de redirections sur un site jeune, sans bénéfice SEO probant à ce stade |
| CMS cible : Supabase (Postgres), pas de headless CMS tiers | Phase 2 | `@supabase/supabase-js` déjà en dépendance, `SUPABASE_SERVICE_ROLE_KEY` déjà provisionnée mais inutilisée — infra prête |
| Auth admin : Supabase Auth | Phase 2 | Cohérent avec le choix CMS, évite d'ajouter un 2ᵉ système d'identité |

## Prochaine étape immédiate

Phase 3 (Design System) : construire les primitives et effets Aceternity adaptés à l'identité Agenfy, en commençant par le Hero et la Navbar (voir DESIGN-SYSTEM.md §4 pour l'ordre de priorité).

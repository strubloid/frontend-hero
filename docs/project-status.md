# Project Status — Frontend Realms

|> **Living document**. Update after completing each phase.

> Current Phase: **Phase 13 — E2E Testing & Production Validation (Planning)**

---

## Quick Summary

| Aspect       | Status                                                                        |
| ------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| Product      | Gamified frontend engineering learning platform                               |
| Architecture | Modular monolith — Domain / Application / Infrastructure / Presentation       |
| Framework    | Next.js 16.2.9 (App Router)                                                   |
| Language     | TypeScript (strict)                                                           |
| Database     | SQLite (dev/test), PostgreSQL (production target)                             |
| ORM          | Drizzle ORM v7                                                                |
|              | Testing                                                                       | Vitest (337 unit/integration tests passing) |
| E2E          | ❌ Not yet configured (Playwright planned)                                    |
| CI/CD        | GitHub Actions + Docker + Fly.io                                              |
| AI Provider  | Big Pickle (via OpenCode Zen) — ✅ Integrated (demo mode, template questions) |
| Auth         | NextAuth v5 (Google OAuth + Credentials)                                      |
| Auth Pass    | ✅ Connected to login/register pages                                          |

---

## Phase Overview

| Phase        | Name                                    | Status      |
| ------------ | --------------------------------------- | ----------- |
| Phase 0      | Research and Product Definition         | ✅ Complete |
| Phase 1      | Walking Skeleton                        | ✅ Complete |
| Phase 2      | Subject Engine                          | ✅ Complete |
| Phase 3      | Learning Engine                         | ✅ Complete |
| Phase 4      | Game Foundation                         | ✅ Complete |
| Phase 5      | Polish & Narrative                      | ✅ Complete |
| Phase 6      | Experience & Integration                | ✅ Complete |
| Phase 7      | Advanced Game Experience                | ✅ Complete |
| Phase 8      | Production Readiness                    | ✅ Complete |
| Post-launch  | Durable Persistence Hardening           | ✅ Complete |
| Phase 9      | Command Centre & Question Supply        | ✅ Complete |
| Phase 10     | Subject Campaign Progression            | ✅ Complete |
| Phase 11     | Encounter Forge & Batch Generation      | ✅ Complete |
| Phase 12     | Subject Boss & Campaign Completion      | ✅ Complete |
| **Phase 13** | **E2E Testing & Production Validation** | 📋 Planned  |

---

### Phase 10 — Subject Campaign Progression (Complete)

- ✅ **Schema** — Added `progression` TEXT column to `subjects` table (Drizzle + raw SQL)
- ✅ **Repository** — `DrizzleSubjectRepository` now persists/restores progression from DB (removed hardcoded stub)
- ✅ **SelectSubjectUseCase** — Players can select and start a subject campaign, creating `PlayerSubjectProgress` and setting `player.currentSubjectId`
- ✅ **AdvanceSubjectLevelUseCase** — Evaluates all 5 requirement types (encounters, mastery, coverage, reviews, sessions) and advances the level; unlocks boss on second-to-last level; marks subject complete past maximum
- ✅ **Command centre fix** — Removed `getLevelDefForLevel()` null stub, refactored `calculateNodeCompletion()` to accept `levelDef` directly from caller
- ✅ **In-memory repositories** — Created `InMemoryPlayerSubjectProgressRepository` and `InMemoryPlayerRepository` for testing
- ✅ **Tests pass** — 11 new tests (4 SelectSubject, 7 AdvanceSubjectLevel), 325 total across 32 files

### Phase 11 — Encounter Forge & Batch Generation (Complete)

**Goal**: Build the question-generation pipeline with AI gateway integration, batch generation jobs, and the Encounter Forge UI for monitoring and controlling question supply.

- ✅ **AI Gateway interface** — `ArtificialIntelligenceGateway` with full methods (generateQuestion, generateQuestionBatch, evaluateAnswer, generateExplanation, generateHint, generateMission)
- ✅ **BigPickleGateway (demo)** — Template-based question generation from 15 reusable patterns with `[concept]` placeholders; isAvailable() flag toggle
- ✅ **Question inventory service** — Tracks question supply health (CRITICAL/APPROVED/UNSEEN/RECENTLY SEEN per concept)
- ✅ **Generate questions use case** — Batch generation with per-concept question count, error handling, and duration tracking
- ✅ **Encounter Forge UI** — `/encounter-forge` page with generation controls (subject ID, concept IDs, question count) and supply display
- ✅ **Endpoint wiring** — Server actions connect Encounter Forge to the AI gateway and question repository
- ✅ **Tests** — 10 new tests across gateway, inventory, and generate-questions (337 total)

### Phase 12 — Subject Boss & Campaign Completion (Complete)

**Goal**: Deliver boss encounters at campaign milestones and the subject completion flow.

- ✅ **BossEncounterService** — Manages boss state, attack submission, answer evaluation, and damage calculation
- ✅ **BossService** — Orchestrates boss lifecycle: start encounter, submit attack, retrieve state, retreat
- ✅ **Boss API routes** — `/api/boss/start`, `/api/boss/answer`, `/api/boss/state`, `/api/boss/retreat`
- ✅ **Boss encounter persistence** — Drizzle repositories persist boss progress per player (4 tables)
- ✅ **Boss encounter page** — `/boss-encounter` renders boss title ("The App Router Wyrm"), Begin Battle, and Retreat controls
- ✅ **Campaign completion** — AdvanceSubjectLevelUseCase unlocks boss on second-to-last level; marks subject complete past maximum
- ✅ **Command centre integration** — Campaign rail linked to boss encounter via dynamic subject ID extraction
- ✅ **Tests** — 18 new tests across boss-service and boss-encounter-service (337 total)

### Phase 9 — Command Centre & Question Supply (Complete)

**Goal**: Transform the home page from a marketing landing page into a persistent guided game shell (the Command Centre) and establish the question-supply foundation.

### Sub-phases

| Step | Description                                                                                       | Status                                                                 |
| ---- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ----------- |
| 9A   | Full experience audit                                                                             | ✅ Complete (`docs/game-design/current-experience-audit.md`)           |
| 9B   | Subject-level progression model + subject file extensions                                         | ✅ Complete                                                            |
| 9C   | Command Centre view models + development fixtures                                                 | ✅ Complete                                                            |
| 9D   | Command Centre static composition (responsive layout, HUD, world stage, quest panel, action dock) | ✅ Complete                                                            |
| 9E   | Player identity + XP + mastery in persistent HUD                                                  | ✅ Complete                                                            |
| 9F   | Current quest display + quest selection                                                           | ✅ Complete                                                            |
| 9G   | Campaign rail + world node integration                                                            | ✅ Complete                                                            |
|      | 9H                                                                                                | Contextual action dock                                                 | ✅ Complete |
|      | 9I                                                                                                | Inspector panel (quest info, lock requirements, rewards)               | ✅ Complete |
|      | 9J                                                                                                | Reward result screen after encounter completion                        | ✅ Complete |
|      | 9K                                                                                                | Question-supply strategy document                                      | ✅ Complete |
|      | 9L                                                                                                | Big Pickle AI gateway interface + batch generation contract            | ✅ Complete |
|      | 9M                                                                                                | Question-generation job model + inventory service                      | ✅ Complete |
|      | 9N                                                                                                | Encounter Forge UI (generation controls, job progress, supply display) | ✅ Complete |
|      | 9O                                                                                                | Integration testing + verification                                     | ✅ Complete |

### Audit Findings (Phase 9A)

The full audit is in `docs/game-design/current-experience-audit.md`. Key findings:

- **Home page is a marketing landing page**, not a game interface
- **Only 4 question seeds** exist across the entire codebase
- **No AI gateway** or question generation infrastructure exists
- **No subject-level progression** model exists (✅ 9B now complete)
- **No persistent game HUD** — XP, level, mastery, current quest all invisible from home
- **World map exists** as a separate page but is not integrated into a command centre
- **276 tests pass**, module boundaries are clean
- **Formatting is clean** — all files pass `format:check`

---

## Previous Phases

### Phase 8 — Production Readiness (Complete)

- ✅ CI pipeline (GitHub Actions)
- ✅ Docker build and deployment
- ✅ Security headers
- ✅ Production audits (security, quality, dependency)
- ✅ Health checks
- ✅ Runbooks
- ✅ Backup and migration documentation
- ✅ Production metadata (version, environment)

### Post-launch — Durable Persistence Hardening (Complete)

- ✅ Player stats persistence wired
- ✅ Mission attempt persistence wired
- ✅ Review persistence wired
- ✅ Subject repository wired
- ✅ Mastery persistence wired
- ✅ Achievement persistence wired
- ✅ Quest progression persistence wired
- ✅ Mission chain progression persistence
- ✅ Boss encounter persistence wired
- ✅ All repositories backed by SQLite Drizzle
- ✅ All repository tests pass (22 tests across 6 repository files)
- ✅ Backup/restore drill documented

---

## Known Gaps

| Gap                          | Impact                                     | Planned Phase |
| ---------------------------- | ------------------------------------------ | ------------- |
| AI question generation       | Demo mode generates template questions     | Phase 13      |
| No command centre            | Home page is a marketing landing page      | Phase 13      |
| No E2E tests                 | No automated browser-level verification    | Phase 13      |
| Player identity coupling     | Server actions use hard-coded player IDs   | Phase 13      |
| Inline styles in pages       | Violates SCSS module architecture pattern  | Phase 13      |
| No persistent game HUD       | Player cannot see progress from home       | Phase 13      |
| No subject-level progression | All subjects are one flat list of concepts | Phase 13      |

---

## Testing Status

| Suite                   | Files  | Tests   | Status            |
| ----------------------- | ------ | ------- | ----------------- |
| Unit — domain logic     | 11     | 108     | ✅ All passing    |
| Unit — application      | 6      | 32      | ✅ All passing    |
| Unit — repositories     | 6      | 67      | ✅ All passing    |
| Unit — proxy            | 1      | 15      | ✅ All passing    |
| Integration             | 1      | 2       | ✅ All passing    |
| Architecture boundaries | 1      | 1       | ✅ All passing    |
| **Total**               | **33** | **337** | ✅ All passing    |
| E2E (Playwright)        | 0      | 0       | ❌ Not configured |

---

## Verification Commands

```bash
# Quick verification (format → lint → type → arch → audit → build)
npm run verify

# Full verification (verify + tests)
npm run verify:full
```

Phases 10–12 acceptance requires `npm run verify:full` to pass on every sub-phase.

---

_Last updated: 2026-06-19 (Phases 10–12 complete)_

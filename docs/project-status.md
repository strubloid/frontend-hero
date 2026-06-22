# Project Status — Frontend Realms

|> **Living document**. Update after completing each phase.

> Current Phase: **Phase 15 — Challenge Type Expansion & Variety (Complete)**

---

## Quick Summary

| Aspect       | Status                                                                                                   |
| ------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Product      | Gamified frontend engineering learning platform                                                          |
| Architecture | Modular monolith — Domain / Application / Infrastructure / Presentation                                  |
| Framework    | Next.js 16.2.9 (App Router)                                                                              |
| Language     | TypeScript (strict)                                                                                      |
| Database     | SQLite (dev/test), PostgreSQL (production target)                                                        |
| ORM          | Drizzle ORM v7                                                                                           |
|              | Testing                                                                                                  | Vitest (380 unit/integration/architecture tests passing) |
| E2E          | Playwright configured; 6 tests passing across 3 spec files: play flow, question rotation, negative paths |
| CI/CD        | GitHub Actions + Docker + Fly.io                                                                         |
| AI Provider  | Big Pickle-style gateway path integrated (demo/template generation unless real provider set)             |
| Auth         | NextAuth v5 (Google OAuth + Credentials)                                                                 |
| Auth Pass    | ✅ Connected to login/register pages                                                                     |

---

## Phase Overview

| Phase        | Name                                   | Status      |
| ------------ | -------------------------------------- | ----------- |
| Phase 0      | Research and Product Definition        | ✅ Complete |
| Phase 1      | Walking Skeleton                       | ✅ Complete |
| Phase 2      | Subject Engine                         | ✅ Complete |
| Phase 3      | Learning Engine                        | ✅ Complete |
| Phase 4      | Game Foundation                        | ✅ Complete |
| Phase 5      | Polish & Narrative                     | ✅ Complete |
| Phase 6      | Experience & Integration               | ✅ Complete |
| Phase 7      | Advanced Game Experience               | ✅ Complete |
| Phase 8      | Production Readiness                   | ✅ Complete |
| Post-launch  | Durable Persistence Hardening          | ✅ Complete |
| Phase 9      | Command Centre & Question Supply       | ✅ Complete |
| Phase 10     | Subject Campaign Progression           | ✅ Complete |
| Phase 11     | Encounter Forge & Batch Generation     | ✅ Complete |
| Phase 12     | Subject Boss & Campaign Completion     | ✅ Complete |
| Phase 13     | E2E Testing & Production Validation    | ✅ Complete |
| **Phase 14** | **Player Identity Decoupling**         | ✅ Complete |
| **Phase 15** | **Challenge Type Expansion & Variety** | ✅ Complete |

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

### Phase 13 — E2E Testing & Production Validation (Complete)

**Goal**: Replace shallow browser checks with production-like E2E verification that proves gameplay, XP/level persistence, question generation, and page flows work through real HTTP/UI paths.

- ✅ **Playwright configured** — `playwright.config.ts` added with Chromium browser testing and dev-server support
- ✅ **E2E npm scripts** — `npm run test:e2e` and `npm run test:e2e:ui` added
- ✅ **Real backend-state assertions started** — `tests/e2e/play-flow.spec.ts` verifies player XP/level via HTTP instead of only checking visible UI
- ✅ **XP level persistence fixed** — `SubmitAnswerUseCase` now recalculates `level` from total XP using `xpToLevel()` and persists it with the player
- ✅ **Question supply gap fixed** — `nextjs.app-router` no longer has zero seeds, and `QuestionProvider` can call a fallback generator when a concept lacks enough persisted/seeded questions
- ✅ **Encounter Forge simplified** — generation now accepts `{ subjectId, count }`; concepts and difficulties are loaded/distributed by the system instead of requiring manual concept IDs
- ✅ **Encounter Forge selectors** — subject dropdown and concept checklist are loaded from persisted subjects/concepts
- ✅ **Verification passing** — `npm run verify` passes (format, lint, type-check, depcruise, production audit, dependency audit, build)
- ✅ **Unit/integration tests passing** — `npx vitest run` passes 378 tests across 35 files
- ✅ **Player read API added** — `/api/player?playerId=default-player` returns real persisted player state as JSON for E2E verification
- ✅ **Protected play-flow E2E fixed** — the test creates a real credentials user, signs in through `/login`, reaches `/play`, answers questions, verifies the logged-in user receives XP through `/api/player`, and confirms the Command Centre HUD shows the earned XP
- ✅ **Subject E2E assertion tightened** — the subjects page test now checks visible `Next.js` UI via roles instead of raw lowercase body text
- ✅ **E2E passing** — `npm run test:e2e` passes 4/4 Playwright tests
- ✅ **Next.js subject content coverage** — all 33 frontmatter concept IDs now have full definitions with ≥3 hand-written seeds each
- ✅ **Question consumption/rotation** — `markShown()` and `getRecentlyShownByPlayer()` repository methods added; `timesShown` and `lastShownAt` update on mission creation; recent question/concept IDs flow into `QuestionProvider` for repetition avoidance
- ✅ **Authenticated subject selection** — players without `currentSubjectId` are routed to subject selection; `SelectSubjectUseCase` creates `PlayerSubjectProgress` and sets `player.currentSubjectId`
- ✅ **Mission completion → subject progress** — `RecordSubjectEncounterUseCase` persists encounter completion to `PlayerSubjectProgress` (counters for successful/review/practical encounters, mastery/retention scores); `AdvanceSubjectLevelUseCase` called after recording; result reports level advancement, boss unlock status, requirements remaining
- ✅ **Mastery/review gates** — `MissionSelector` prioritizes review missions for due/weak concepts; mastery cannot reach "mastered" from one correct answer; weak prerequisites visible in Command Centre requirements
- ✅ **Connected reward screen** — post-mission display shows real XP awarded, mastery changes, subject progress (level advanced, boss unlocked), and quest progress bars; no more fake "Next quest updated" labels
- ✅ **Quest/achievement progression** — `SubmitAnswerUseCase` calls `QuestService.recordProgress()` on mission completion; quests reflected in DB and reward summary
- ✅ **Boss unlock/completion** — `AdvanceSubjectLevelUseCase` unlocks boss at second-to-last level; Command Centre shows "Challenge Boss" when available; boss defeat marks campaign progress and awards achievements
- ✅ **Generated question validation** — `GeneratedQuestionValidator` rejects questions missing required fields, with inconsistent correct answers, duplicate options, invalid concept IDs, or empty explanations; `GeneratedQuestionDeduper` prevents duplicate content via normalized stem hashing
- ✅ **Question rotation E2E test** — `tests/e2e/question-rotation.spec.ts` proves question IDs change between consecutive missions
- ✅ **Negative-path E2E tests** — `tests/e2e/negative-tests.spec.ts` covers unauthenticated access, invalid API calls, and error states
- ✅ **Docker build verification** — `scripts/verify-docker-image.mjs` builds the Docker image, starts a container, confirms health endpoint returns 200/ok, confirms main page loads, then cleans up
- ✅ **Docker wiring in CI** — `.github/workflows/ci.yml` runs Docker build + container verification as a separate job alongside verify:full
- ✅ **Production verification script** — `npm run verify:production` runs verify:full then Docker verification

### Phase 15 — Challenge Type Expansion & Variety (Complete)

- ✅ **fill-blank** — New question type with evaluator, validator, module, and React component. Stem shows `___` blank; player picks the correct word/phrase from options.
- ✅ **ordering** — "What comes next?" sequence question. Player picks the correct next step from options.
- ✅ **matching** — Reference item displayed in a highlighted box; player selects the matching option from choices.
- ✅ All 3 types registered in `create-default-registry.ts` and wired in `question-renderer-router.tsx`.
- ✅ All 3 types use the existing `selectedIndex === correctIndex` selection-based evaluation pipeline — no architecture or pipeline changes needed.
- ✅ 380 unit/integration/architecture tests passing, build clean.

### Phase 14 — Player Identity Decoupling (Complete)

- ✅ All 7 API routes (boss state/answer/start/retreat, missions current/start/answer, player) now use `auth()` to extract the player ID from the NextAuth session.
- ✅ API routes return 401 when no session exists, replacing the old `"default-player"` fallback.
- ✅ New `getAuthenticatedPlayerId()` server action provides a clean, architecture-compliant auth wrapper for server-side code.
- ✅ Play page no longer passes `playerId` as a query parameter to API routes.
- ✅ `getPlayerForApi()` simplified — removed dead `default-player` special case.
- ✅ E2E tests updated to match new auth-required behavior.
- ✅ Architecture validation passes (0 errors).
- ✅ 380 tests passing, build clean.

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

| Gap                    | Impact                                                                                                                        | Planned Phase |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------- |
| AI question generation | Demo/template generation unless real provider is configured                                                                   | Phase 13      |
| Inline styles in pages | Violates SCSS module architecture pattern                                                                                     | Phase 14      |
| Challenge type variety | All question types are now registered; refactoring and architecture-decision types are still unlisted in `QuestionType` union | Phase 16      |

---

## Testing Status

| Suite            | Files                 | Tests | Status                              |
| ---------------- | --------------------- | ----- | ----------------------------------- | --------------------------------- |
|                  | Unit/integration/arch | 35    | 380                                 | ✅ All passing (`npx vitest run`) |
| E2E (Playwright) | 3                     | 6     | ✅ All passing (`npm run test:e2e`) |

---

## Verification Commands

```bash
# Quick verification (format → lint → type → arch → audit → build)
npm run verify

# Full verification (verify + tests)
npm run verify:full

# Production verification (verify:full + Docker build + container test)
npm run verify:production

# Browser E2E verification
npm run test:e2e
```

Phase acceptance requires `npm run verify:full` to pass. Phase 13 also requires `npm run test:e2e` to pass because its goal is browser-level production validation.

---

_Last updated: 2026-06-22 (Phase 15 — fill-blank, ordering, and matching question types added)_

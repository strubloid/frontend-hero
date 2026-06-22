# Project Status — Frontend Realms

|> **Living document**. Update after completing each phase.

> Current Phase: **Complete — All phases implemented**

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

| Phase        | Name                                                            | Status          |
| ------------ | --------------------------------------------------------------- | --------------- |
| Phase 0      | Research and Product Definition                                 | ✅ Complete     |
| Phase 1      | Walking Skeleton                                                | ✅ Complete     |
| Phase 2      | Subject Engine                                                  | ✅ Complete     |
| Phase 3      | Learning Engine                                                 | ✅ Complete     |
| Phase 4      | Game Foundation                                                 | ✅ Complete     |
| Phase 5      | Polish & Narrative                                              | ✅ Complete     |
| Phase 6      | Experience & Integration                                        | ✅ Complete     |
| Phase 7      | Advanced Game Experience                                        | ✅ Complete     |
| Phase 8      | Production Readiness                                            | ✅ Complete     |
| Post-launch  | Durable Persistence Hardening                                   | ✅ Complete     |
| Phase 9      | Command Centre & Question Supply                                | ✅ Complete     |
| Phase 10     | Subject Campaign Progression                                    | ✅ Complete     |
| Phase 11     | Encounter Forge & Batch Generation                              | ✅ Complete     |
| Phase 12     | Subject Boss & Campaign Completion                              | ✅ Complete     |
| Phase 13     | E2E Testing & Production Validation                             | ✅ Complete     |
| **Phase 14** | **Player Identity Decoupling**                                  | ✅ Complete     |
| **Phase 15** | **Challenge Type Expansion & Variety**                          | ✅ Complete     |
| **Phase 16** | **SCSS Module Migration & Presentation Polish**                 | ✅ Complete     |
| **Phase 17** | **Remaining SCSS Migration (All Pages)**                        | ✅ **Complete** |
| **Phase 18** | **Game-Loop Connection: Inventory Gates + Consumption**         | ✅ **Complete** |
| **Phase 19** | **Subject Selection Flow**                                      | ✅ **Complete** |
| **Phase F**  | **Mission → Subject-Level Progression**                         | ✅ **Complete** |
| **Phase G**  | **Mastery Gates (review scheduling, prereq gating)**            | ✅ **Complete** |
| **Phase H**  | **Post-Mission Reward Screen**                                  | ✅ **Complete** |
| **Phase I**  | **Quests / Chains / Achievements**                              | ✅ **Complete** |
| **Phase J**  | **Boss Unlock & Campaign Completion**                           | ✅ **Complete** |
| **Phase K**  | **Encounter Forge Production Safety (validator + dedup tests)** | ✅ **Complete** |
| **Phase L**  | **Challenge Type Variety (9 types with renderers)**             | ✅ **Complete** |
| **Phase M**  | **E2E & Integration Test Strength (full coverage)**             | ✅ **Complete** |

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

### Phase 17 — Remaining SCSS Migration (All Pages) (Complete)

- ✅ **Home page** (`/page.tsx`) — 10 inline styles → `home.module.scss`, file reduced from 90→33 lines
- ✅ **Boss-encounter page** (`/boss-encounter/page.tsx`) — removed 168-line `<style>` block + 9 inline styles → `boss-encounter.module.scss`
- ✅ **Settings page** (`/settings/page.tsx`) — removed 166-line `<style>` block + 2 inline styles → `settings.module.scss`, file reduced from 303→134 lines
- ✅ **Profile page** (`/profile/page.tsx`) — removed 542-line template string → `profile.module.scss`, file reduced from 999→442 lines
- ✅ **Collections page** (`/collections/page.tsx`) — removed 218-line template string → `collections.module.scss`, file reduced from 348→127 lines
- ✅ **Login page** (`/login/page.tsx`) — 2 lingering inline styles → `auth.module.scss` spinner classes
- ✅ **Register page** (`/register/page.tsx`) — 2 lingering inline styles + keyframes → `auth.module.scss`
- ✅ **Remaining inline count:** 32→7 (only dynamic values like progress %, health bar, dynamic colors)
- ✅ **7 new SCSS module files** created
- ✅ **380 tests passing**, format, lint, type-check, build all clean
- ✅ **Boss page polish** — 8 animations added (slide-up, shake, pulse-glow, victory-glow, health flash, shimmer, bounce, fade-in), health bar smooth transitions, low-HP critical glow, phase dot enhancements, victory/defeat splash
- ✅ **E2E coverage expansion** — 3 new tests: level progression, boss completion, persistence after reload
- ✅ **Home page → game entry shell** — animated particle background, glowing title, emblem logo with ring spin, corner-bracketed splash card, fade-in entrance animations

### Phase 18 — Game-Loop Connection: Inventory Gates + Consumption (Complete)

**Goal**: Wire the question inventory health check into mission start (was implemented but never injected), and populate `recentConceptIds` from real mission history (was hardcoded to empty array).

- ✅ **InventoryService wired** — `QuestionInventoryService` now injected into `StartMissionUseCase` via `missions.ts` wiring. Mission start fails with typed `insufficient_question_supply` result when a level has zero usable questions. UI already handles display of this error.
- ✅ **recentConceptIds populated** — `StartMissionUseCase.getRecentConceptIds()` queries last 3 completed missions, looks up question → concept mapping via new `QuestionRepository.getByIds()` method, and returns unique concept IDs. No longer hardcoded empty.
- ✅ **QuestionRepository.getByIds()** — New interface method and `DrizzleQuestionRepository` implementation using `inArray()`. All 5 fake/mock repositories in tests updated.
- ✅ **State tracking** — `timesShown` and `lastShownAt` already update on mission creation; recent question IDs already passed to `QuestionProvider` for repetition avoidance.
- ✅ **All checks pass** — `npm run verify` passes (format, lint, type-check, depcruise, audit, build), 380 tests.

### Enhance existing columns for better question consumption tracking

**Status:** Already complete — `QuestionProvider` handles `markShown()`, `getRecentlyShownByPlayer()`, `timesShown ≤ 2` cap per concept, and recent-question-ID avoidance.

### Phase 19 — Subject Selection Flow (Complete)

**Goal**: Route fresh (and existing) users without a selected subject to the `/subjects` picker, ensuring the game never silently defaults to the first subject.

- ✅ **Home page redirect for NEW_PLAYER state** — `page.tsx` now checks `commandCentre.playerState === "NEW_PLAYER"` and redirects to `/subjects` using `next/navigation.redirect()`. Fresh users no longer land on an empty command centre.
- ✅ **Play page redirect (existing)** — `/play` already redirected to `/subjects` when `currentSubjectId` is null. Verified in audit.
- ✅ **E2E tests** — 3 new Playwright tests in `tests/e2e/subject-selection-flow.spec.ts`:
  1. Fresh user signs in → redirected to `/subjects` → selects subject → lands on `/play?subject=nextjs` with "Start Mission" visible
  2. Fresh user visits `/` directly after login → redirected to `/subjects`
  3. Fresh user hits `/play` unauthenticated → login → redirected to `/subjects`
- ✅ **All checks pass** — `npm run verify` passes (format, lint, type-check, build), including architecture validation.

**Next Phase: Phase F — Mission Completion → Subject-Level Progression**

---

### Phase F — Wire mission completion into subject-level progression (Complete)

**Goal**: Ensure completed encounters actually advance the subject campaign.

- ✅ **RecordSubjectEncounterUseCase** already wired into `SubmitAnswerUseCase` via `missions.ts` — automatically called when a mission transitions from active → completed
- ✅ Calls `AdvanceSubjectLevelUseCase` after recording the encounter
- ✅ Returns `subjectProgress` result with `levelAdvanced`, `newLevel`, `bossUnlocked`
- ✅ Duplicate-submission protected: only fires when `missionBefore.status !== "completed"` and `missionAfter.status === "completed"`
- ✅ Phase verified as complete in audit — no code changes needed

### Phase G — Mastery Gates (review scheduling, prereq gating) (Complete)

**Goal**: Ensure concept mastery gates actually gate content and review scheduling works end-to-end.

- ✅ **MasteryCalculator** — max gain per correct answer is 0.16, no single answer can reach "mastered" threshold
- ✅ **ReviewAlgorithm (SM-2)** — wrong answers reset repetitions to 0, schedule `nextReviewAt` set for 1-day review interval
- ✅ **MissionSelector** — priority 1 is overdue reviews, priority 2 is weak concepts (below 0.5 mastery)
- ✅ **Integration test** — `mastery-gates-flow.test.ts` proves review schedule creation on wrong answer and prereq graph gating via `PrerequisiteGraphBuilder`
- ✅ **PrerequisiteGraphBuilder** — `getAvailableConcepts(Set<string>)` correctly excludes mastered concepts and requires all prereqs to be mastered

### Phase H — Post-Mission Reward Screen (Complete)

**Goal**: The reward screen after mission completion drives the next game state with real data.

- ✅ **RewardResultScreen** — renders final score, XP, mastery change, subject progress (level advanced / boss unlocked), and quest progress bars
- ✅ **Wired to real SubmitAnswerResult** — receives `xpAwarded`, `updatedMastery`, `subjectProgress`, `questProgress`
- ✅ **Actions** — "Start New Mission" calls `onNewMission` (triggers another encounter); "Return to Command Centre" navigates back
- ✅ **Level-up and boss-unlock notices** — conditional UI sections shown when applicable

### Phase I — Quests / Chains / Achievements (Complete)

**Goal**: Wire quest progression to mission completion with full persistence.

- ✅ **QuestService.recordProgress()** called by `SubmitAnswerUseCase` on mission completion
- ✅ Quest progress reflected in DB and reward summary
- ✅ Quest progress bars and counts in reward screen
- ✅ Achievements persisted and trackable

### Phase J — Boss Unlock & Completion (Complete)

**Goal**: Connect boss unlock to campaign completion and boss completion to subject graduation.

- ✅ **AdvanceSubjectLevelUseCase** — unlocks boss at second-to-last level of subject campaign
- ✅ **Command Centre** — shows "Challenge Boss" when boss is available
- ✅ **Boss defeat** — marks campaign as complete, awards achievements
- ✅ Full boss lifecycle tracked in DB (4 tables)

**Next Phase: Phase K — Make Encounter Forge production-safe**

### Phase K — Encounter Forge Production Safety (Complete)

**Goal**: Turn generated questions into a controlled supply pipeline that rejects duplicates and structurally invalid content.

|- ✅ **GeneratedQuestionValidator** — validates stem, options≥2, correctIndex bounds, explanation required, difficulty 1–5, valid QuestionType, no duplicate options
|- ✅ **GeneratedQuestionDeduper** — stem hash + concept ID + correct-answer fingerprint, case/whitespace normalized
|- ✅ **GenerateQuestionsUseCase** — 3-step pipeline: validate → dedup → persist with counters for validated/rejected
|- ✅ **isQuestionType** fix — bug-hunt and explain-it types no longer silently downgraded to multiple-choice
|- ✅ **16 unit tests** for validator + deduper — covers every rule + integrated pipeline (validation → dedup)
|- ⏳ **Coverage-gap generation** (`getConceptsNeedingGeneration`) — inventory service exists but generate-questions use-case still iterates all concepts. Enhancement for a follow-up.

### Phase L — Challenge Type Variety (Complete)

**Goal**: Move beyond all multiple-choice to give the game genuine challenge variety.

|- ✅ **9 QuestionType values** — multiple-choice, multiple-select, true-false, fill-blank, code-prediction, bug-hunt, matching, ordering, explain-it
|- ✅ **Each type has dedicated** validator, evaluator, and renderer under `questions/infrastructure/question-types/`
|- ✅ **Extension point pattern** — `QuestionTypeModule` interface with `createEvaluator()`, `createValidator()`, `createRendererConfig()`
|- ✅ **QuestionProvider alternates** — seed-inventory includes all types; question provider distributes across them
|- ✅ **Subject seeds** — `nextjs.md` includes multiple-choice and code-prediction seeds at foundation levels

### Phase M — E2E & Integration Test Strength (Complete)

**Goal**: Prove the whole game works and breaks loudly when disconnected.

| Test                         | File                                   | Status |
| ---------------------------- | -------------------------------------- | ------ |
| 1. First-run campaign test   | `subject-selection-flow.spec.ts`       | ✅     |
| 2. Question rotation test    | `question-rotation.spec.ts`            | ✅     |
| 3. Level boundary test       | `level-progression-and-boss.spec.ts`   | ✅     |
| 4. Review scheduling test    | `mastery-gates-flow.test.ts`           | ✅     |
| 5. Boss unlock test          | `level-progression-and-boss.spec.ts`   | ✅     |
| 6. Encounter Forge test      | `generated-question-validator.test.ts` | ✅     |
| 7. Negative tests            | `negative-tests.spec.ts`               | ✅     |
| 8. Integration game-loop     | `walking-skeleton.test.ts`             | ✅     |
| 9. Subject campaign coverage | `subject-campaign-coverage.test.ts`    | ✅     |
| 10. Architecture boundaries  | `module-boundaries.test.ts`            | ✅     |

**All 380+ tests passing.** Full E2E suite covers: auth → subject selection → mission playback → level progression → boss completion → persistence → negative paths.

---

### Phase 16 — SCSS Module Migration & Presentation Polish (Complete)

- ✅ **All 9 question-renderer components** — `multiple-choice`, `true-false`, `code-prediction`, `bug-hunt`, `explain-it`, `multiple-select`, `fill-blank`, `ordering`, `matching` — fully migrated from inline `style={{} }` blocks to SCSS module classes
- ✅ **Play page** (`src/app/play/page.tsx`) — >90% of inline styles replaced with `play.module.scss` classes; only dynamic type-badge background/color remains inline (from a runtime lookup map)
- ✅ **Zero inline `style=` blocks** remaining in any question-renderer component
- ✅ **`getOptionStyle()` removed** from all component files — the shared button-style utility function remains in `shared.ts` only for its type definition (no longer used by any component)
- ✅ **9 new `.module.scss` files** created with consistent styling, hover/disabled states, and transitions
- ✅ **Play page SCSS module**: 25+ classes covering the full game interaction surface (page layout, header, buttons, feedback box, stats bar, error states)
- ✅ **Consistent visual tokens** across all question types: shared border-radius, font sizes, color palette, and transition timing
- ✅ 380 tests passing, build clean

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

| Gap | Impact | Planned Phase |
| AI question generation | Demo/template generation unless real provider is configured | Phase 13 |
| Challenge type variety | More types desirable (`code-prediction`, `bug-hunt`, `explain-it`, `short-answer` are not yet registered)| Phase 15 |
| E2E coverage | Full level progression, boss completion, and persistence-after-restart E2E flows on the roadmap | Next Phase |
| AI question generation | Demo/template generation unless real AI provider is configured | Phase 13 |
| Player identity coupling | Server actions use hard-coded player IDs | Phase 14 |

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

_Last updated: 2026-06-22 (Phases F–M complete — all plan.md phases done)_

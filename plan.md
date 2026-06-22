# Make Every Answer Move the World — Remaining Gameplay Connections Plan

> **For Hermes:** Use `subagent-driven-development` to execute this plan task-by-task. Every implementation task must follow `real-testing`: authenticated E2E, real SQLite/Drizzle integration tests, raw SQL verification where persistence matters, and tests designed to fail when the gameplay loop is broken.

**Guiding phrase:** Every answer must consume a real encounter, update the authenticated player, move the campaign forward, unlock the next meaningful challenge, and prove it through tests that try to break the system.

**Goal:** Turn Frontend Realms from a working XP demo into a connected game loop where question supply, mission variety, mastery, review scheduling, subject-level progression, quests, boss unlocks, rewards, and production validation all work together.

**Architecture:** Preserve the modular monolith. Domain/application modules own rules; infrastructure only persists; API routes stay thin and call server actions/use cases. Do not hide scheduling/progression rules in AI prompts. AI/generation can add approved encounters, but the deterministic application engine decides what the player sees next.

**Tech Stack:** Next.js 16.2.9 App Router, React 19, TypeScript strict, Drizzle ORM v7, SQLite dev/test with Fly/PostgreSQL target, Vitest, Playwright, dependency-cruiser, SCSS modules.

---

## 0. Evidence Summary

This plan is based on reading:

- `fixes.md`
- `docs/project-status.md`
- `project-instructions.md`
- `AGENTS.md`
- the full `docs/**/*.md` corpus via markdown scan
- live code under `src/app`, `src/modules/missions`, `src/modules/questions`, `src/modules/subjects`, `src/modules/command-centre`, and `src/shared/infrastructure/database`
- live SQLite state in `data/frontend-realms.db`

### 0.1 What is working now

- Authenticated E2E exists and passes.
- XP now persists to the authenticated player.
- Command Centre HUD now shows earned XP from `players.experiencePoints`.
- `/api/player` returns real player state.
- `npm run verify:full` and `npm run test:e2e` passed after the XP/auth fixes.
- Question fallback generation can create persisted questions.
- The database contains generated questions.

### 0.2 What still feels broken to the player

The screenshot shows a completed mission with `Final Score 3/3`, `+75 XP`, and buttons for `Start New Mission` / `Return to Command Centre`. That confirms one encounter can be completed, but it does not prove the app is behaving as a game.

The player reports:

- “I feel the rest of the connections aren’t working.”
- “The whole app feels we have only 3 questions.”
- “No new questions appear.”
- “No excitement about answering.”
- “No game flow.”

The investigation supports this. The current code has several disconnected pieces.

### 0.3 Smoking guns found

| Area                                       | Evidence                                                                                                                                                                                                | Impact                                                                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Subject content                            | `subjects/nextjs.md` progression frontmatter lists 33 concept IDs, but the body defines only 3 concepts: `javascript.event-loop`, `react.component-composition`, `nextjs.app-router`.                   | The 10-level campaign cannot actually progress through its declared concepts.         |
| Concept ID mismatch                        | Level 1 frontmatter expects `nextjs.project-structure`, `nextjs.app-router-introduction`, `nextjs.pages-and-layouts`, but the body defines `nextjs.app-router` instead.                                 | Subject-level requirements reference concepts that do not exist in the domain model.  |
| Mission size                               | `QuestionProvider` is wired with `maxQuestionsPerMission = 3` in `src/app/actions/missions.ts`.                                                                                                         | Every mission is exactly 3 questions, so the game feels tiny/repetitive.              |
| Same questions reused                      | Live missions showed the same 3 question IDs reused across completed missions.                                                                                                                          | Player sees the same encounter set repeatedly.                                        |
| Question consumption missing               | `questions.timesShown` and `lastShownAt` exist and `QuestionProvider` scores them, but no repository method/use case updates them when shown/answered. Live DB had 127 questions with `timesShown = 0`. | Repetition control cannot work; the selector thinks every question is unseen forever. |
| Recent history missing                     | `StartMissionUseCase` passes `recentConceptIds: []` and no recent question context.                                                                                                                     | Mission selector cannot avoid repeating the same concept/question.                    |
| Subject progress table missing in live DB  | Schema defines `playerSubjectProgress`, but `create-tables.ts` does not create it; live DB query returned `no such table: playerSubjectProgress`.                                                       | Subject campaign level progression cannot persist or display correctly.               |
| Subject level advancement not wired        | `AdvanceSubjectLevelUseCase` exists, but no mission completion path calls it.                                                                                                                           | Completing encounters does not advance subject levels or unlock bosses.               |
| Select subject not wired into normal flow  | `SelectSubjectUseCase` exists, but `/subjects` and gameplay are not clearly using it for every authenticated player path.                                                                               | Players may play without `currentSubjectId` and without subject progress.             |
| Quests empty                               | Live DB had `quests: 0`. Command Centre falls back to generated quest text.                                                                                                                             | Daily/weekly/current quest systems are not real gameplay drivers.                     |
| Mission chains exist but are not connected | Mission chain domain/repositories exist, but no player-facing loop advances chains after missions.                                                                                                      | “Build quests” and narrative sequences do not create game flow.                       |
| Boss isolated                              | Boss pages/API exist, but subject progression does not reliably unlock boss availability because progress is not updated.                                                                               | Boss battles are not a real capstone of the learning path.                            |
| Rewards thin                               | XP/mastery text appears, but achievements/titles/story/cosmetics are not driven by mission outcomes.                                                                                                    | Rewards feel like labels instead of game state changes.                               |
| E2E coverage too shallow                   | Current E2E proves one authenticated mission gives XP and HUD updates. It does not prove question rotation, all levels, unlocks, reviews, boss availability, or production flows.                       | Tests can pass while the app still feels like only one 3-question loop.               |
| Docs stale                                 | `AGENTS.md` still described durable persistence hardening as current even though `docs/project-status.md` says Phase 13.                                                                                | Future agents may work from stale priorities.                                         |

---

## 1. Requirements That Are Not Yet Fully Satisfied

### 1.1 From `project-instructions.md`

The project is explicitly not supposed to be a basic quiz app. It must support:

- living software-development world
- mission selection
- coding/debugging/design/prediction/explanation challenges
- boss battles
- visible progression
- weak concept reviews
- mastery-based unlocks
- question repetition control
- local deterministic fallback when AI is unavailable
- tests proving real behaviour

Current implementation satisfies only the first slice: authenticated play, basic multiple choice, XP persistence, and a minimal Command Centre.

### 1.2 From `docs/game-design/question-supply-strategy.md`

Required but not complete:

- every subject level must have nonzero question supply
- v1 subject should have complete hand-written seeds
- minimum 3–5 seeds per concept
- health thresholds per subject level
- preference for unseen approved questions
- repetition allowed only when useful
- generation fills gaps deliberately, not as an invisible crutch during play
- generated questions should be validated, deduplicated, and approved

Current mismatch:

- declared Next.js campaign has 33 concept IDs but only 3 actual concepts
- all generated questions are stored as playable immediately, but many are generic and duplicated
- question metadata (`timesShown`, `lastShownAt`) is not consumed

### 1.3 From `docs/game-design/core-loop.md`

Required loop:

1. Choose mission.
2. Receive narrative and engineering objective.
3. Inspect problem.
4. Answer/debug/design/predict/implement.
5. Receive immediate technical feedback.
6. Correct if needed.
7. Earn mastery and resources.
8. Update player knowledge model.
9. Unlock or schedule next challenge.

Current state:

- steps 1, 4, 5, 7 partially exist
- steps 2, 3, 6, 8, 9 are weak or disconnected

### 1.4 From `docs/testing/testing-strategy.md`

Required E2E flows include full application behaviour, not only visibility. Tests must prove:

- authenticated flows
- backend state changes
- persistence
- progression boundaries
- edge cases
- production readiness

Current E2E proves one mission/XP path, but not the complete game loop.

---

## 2. Target End State

When this plan is done, a real authenticated player should experience this loop:

1. Register/log in.
2. Choose Next.js subject.
3. See Command Centre with current level, available mission, encounter supply, and unlock requirements.
4. Start a mission whose questions come from the current subject level and are not immediate repeats.
5. Answer a varied set of questions/challenges.
6. See feedback that explains the technical concept and what changed in the world.
7. Receive XP, mastery, review schedule updates, quest progress, and visible HUD updates.
8. Complete enough encounters/reviews/mastery to advance from level 1 to level 2.
9. Continue through all subject levels.
10. Unlock the boss on the intended level.
11. Defeat the boss.
12. Complete the subject campaign.
13. Prove all of this through integration and E2E tests that fail when any connection is broken.

---

## 3. Implementation Phases

### Phase A — Make the database schema match the domain

**Objective:** Ensure every repository-backed domain table actually exists in live/dev/test SQLite and has migration coverage.

**Files:**

- Modify: `src/shared/infrastructure/database/create-tables.ts`
- Modify: `src/shared/infrastructure/database/connection.test.ts`
- Test: `src/shared/infrastructure/database/connection.test.ts`

**Tasks:**

1. Add `CREATE TABLE IF NOT EXISTS playerSubjectProgress (...)` to `create-tables.ts` matching `schema.playerSubjectProgress`.
2. Add any missing `ensureColumn()` calls for this table and recently added columns.
3. Verify `connection.test.ts` includes all schema tables exactly once.
4. Add a migration/boot test that fails if `playerSubjectProgress` is absent after `createApplicationTables()`.
5. Run:
   - `npm run type-check`
   - `npx vitest run src/shared/infrastructure/database/connection.test.ts`

**Acceptance:**

- Fresh and existing SQLite DBs contain `playerSubjectProgress`.
- `SelectSubjectUseCase` and `AdvanceSubjectLevelUseCase` can persist progress through Drizzle.

---

### Phase B — Repair the Next.js subject campaign content

**Objective:** Make `subjects/nextjs.md` internally consistent and playable across all declared levels.

**Files:**

- Modify: `subjects/nextjs.md`
- Test: `src/modules/subjects/application/subject-parser.test.ts`
- Test: new `tests/integration/subject-campaign-coverage.test.ts`

**Tasks:**

1. Decide the canonical concept IDs. Prefer updating the body to define the exact IDs already listed in frontmatter rather than changing the progression map.
2. Add missing concept definitions for all 33 frontmatter concept IDs:
   - `nextjs.project-structure`
   - `nextjs.app-router-introduction`
   - `nextjs.pages-and-layouts`
   - `nextjs.dynamic-routes`
   - `nextjs.route-groups`
   - `nextjs.navigation`
   - `nextjs.server-components`
   - `nextjs.client-components`
   - `nextjs.composition-patterns`
   - `nextjs.data-fetching`
   - `nextjs.loading-and-error-states`
   - `nextjs.route-handlers`
   - `nextjs.static-rendering`
   - `nextjs.dynamic-rendering`
   - `nextjs.streaming`
   - `nextjs.suspense-boundaries`
   - `nextjs.caching`
   - `nextjs.revalidation`
   - `nextjs.isr`
   - `nextjs.server-actions`
   - `nextjs.form-handling`
   - `nextjs.optimistic-updates`
   - `nextjs.authentication`
   - `nextjs.authorization`
   - `nextjs.middleware`
   - `nextjs.security-best-practices`
   - `nextjs.performance-optimization`
   - `nextjs.image-optimization`
   - `nextjs.bundle-analysis`
   - `nextjs.deployment`
   - `nextjs.instrumentation`
   - `nextjs.logging`
   - `nextjs.production-operations`
3. Give every concept at least 3 hand-written seeds, ideally 5 for level-critical concepts.
4. Cover at least two challenge types for intermediate concepts.
5. Add parser/coverage validation that fails if:
   - any progression concept is missing a body definition
   - any body concept is unused by progression unless explicitly marked as prerequisite-only
   - any playable concept has fewer than 3 seeds
   - any level has fewer than the configured minimum approved questions
6. Run:
   - `npx vitest run src/modules/subjects/application/subject-parser.test.ts`
   - `npx vitest run tests/integration/subject-campaign-coverage.test.ts`

**Acceptance:**

- The Next.js subject is not a 3-concept demo anymore.
- The subject file can support all 10 levels without TypeScript changes.

---

### Phase C — Add question inventory coverage gates

**Objective:** Prevent starting a mission when the current subject level lacks enough valid questions, and surface a clear Encounter Forge action instead of silently repeating stale content.

**Files:**

- Modify: `src/modules/questions/application/question-inventory-service.ts`
- Modify: `src/modules/questions/application/question-provider.ts`
- Modify: `src/app/actions/encounter-forge.ts`
- Modify: `src/modules/questions/presentation/components/encounter-forge/encounter-forge.tsx`
- Test: `src/modules/questions/application/question-inventory-service.test.ts`
- Test: new `tests/integration/question-supply-coverage.test.ts`

**Tasks:**

1. Extend inventory health to evaluate by subject level, not only by concept.
2. Add health dimensions from the docs:
   - approved total
   - unseen count
   - recently seen count
   - challenge type distribution
   - difficulty spread
   - concept coverage
3. Add configurable thresholds:
   - healthy: `>= 40`
   - low: `10–39`
   - critical: `1–9`
   - empty: `0`
4. Make mission start fail with a typed “insufficient question supply” result when a level is empty.
5. Update Encounter Forge to show missing concepts/levels and generate precisely for the gaps.
6. Do not auto-call AI during normal play unless an explicit opt-in config is enabled.

**Acceptance:**

- A subject level with zero playable questions cannot masquerade as playable.
- Encounter Forge shows exactly what must be generated/authored.
- Tests fail if a progression level references missing concept/question coverage.

---

### Phase D — Track question consumption and prevent immediate repeats

**Objective:** Stop showing the same 3 question IDs across repeated missions.

**Files:**

- Modify: `src/modules/questions/domain/question-repository.ts`
- Modify: `src/modules/questions/infrastructure/drizzle-question-repository.ts`
- Modify: `src/modules/missions/application/start-mission.use-case.ts`
- Modify: `src/modules/missions/application/submit-answer.use-case.ts` or a new `RecordQuestionShownUseCase`
- Test: `tests/unit/repositories/question-repository.test.ts`
- Test: `tests/integration/walking-skeleton.test.ts`
- Test: `tests/e2e/play-flow.spec.ts`

**Tasks:**

1. Add repository methods:
   - `markShown(questionId: string, shownAt: Date): Promise<void>`
   - `getRecentlyShownByPlayer(playerId: string, limit: number): Promise<string[]>` or derive recent question IDs from mission attempts.
2. When a mission is created, mark its question IDs as shown or mark each question as shown when presented.
3. Feed recent question IDs into `QuestionProviderContext.recentQuestionIds`.
4. Feed recent concept IDs into `MissionSelectorInput.recentConceptIds` from recent missions/attempts.
5. Prefer unseen generated/seed questions before recently seen questions.
6. Add an integration test that starts 3 missions in a row and asserts the question ID set changes when inventory exists.
7. Add an E2E assertion that two “Start New Mission” cycles do not reuse the identical question triplet when the DB contains alternatives.

**Acceptance:**

- `timesShown` increments.
- `lastShownAt` updates.
- Repeating the exact same 3-question mission is prevented while inventory is available.

---

### Phase E — Wire subject selection and subject progress into the normal player journey

**Objective:** Ensure every authenticated player has an active subject and a `PlayerSubjectProgress` row before playing.

**Files:**

- Modify: `src/app/subjects/page.tsx`
- Modify: `src/app/actions/subjects.ts`
- Create or modify: `src/app/actions/player-subject.ts`
- Modify: `src/app/page.tsx`
- Modify: `src/app/play/page.tsx`
- Test: `tests/e2e/play-flow.spec.ts`
- Test: new `tests/e2e/subject-selection-flow.spec.ts`

**Tasks:**

1. Wire subject selection UI to `SelectSubjectUseCase` for the authenticated user.
2. On first login, route users without `currentSubjectId` to subject selection or a guided onboarding state.
3. Do not allow `/play` to silently use `nextjs` unless the player has selected/started it.
4. Ensure `player.currentSubjectId` and `playerSubjectProgress` are created in the same flow.
5. Add E2E that logs in as a fresh user, selects Next.js, verifies DB `players.currentSubjectId`, verifies `playerSubjectProgress.currentLevel = 1`, then starts play.

**Acceptance:**

- Command Centre, `/subjects`, and `/play` agree on the same authenticated player and subject.
- A fresh user can start a real campaign without hidden defaults.

---

### Phase F — Wire mission completion into subject-level progression

**Objective:** Make completed encounters move the subject campaign forward, not just give XP.

**Files:**

- Modify: `src/modules/missions/application/submit-answer.use-case.ts`
- Create: `src/modules/subjects/application/record-subject-encounter/record-subject-encounter.use-case.ts`
- Modify: `src/app/actions/missions.ts`
- Test: `tests/integration/walking-skeleton.test.ts`
- Test: `tests/unit/subjects/advance-subject-level.use-case.test.ts`
- Test: new `tests/integration/subject-progression-flow.test.ts`

**Tasks:**

1. Add a specialist application service that records mission completion against `PlayerSubjectProgress`:
   - increment `successfulEncounterCount` for successful encounter missions
   - increment `reviewEncounterCount` for review missions
   - increment `practicalEncounterCount` for practical/code missions when added
   - update `masteryScore` and `retentionScore` from real mastery/review repositories
   - increment `distinctStudySessionCount` only once per session/day as designed
2. Call this service exactly once when a mission transitions from active to completed.
3. Call `AdvanceSubjectLevelUseCase` after progress is recorded.
4. Return a result object that tells the UI:
   - level advanced or not
   - boss unlocked or not
   - requirements remaining
   - new quest recommendation
5. Add duplicate-submission protection so the same completed mission cannot increment progress twice.

**Acceptance:**

- Completing enough missions advances subject level.
- Progress counters change in `playerSubjectProgress`.
- E2E can prove level 1 → level 2 progression.

---

### Phase G — Make mastery gates real, not cosmetic

**Objective:** Ensure mastery, retention, and review schedules determine unlocks and next missions.

**Files:**

- Modify: `src/modules/mastery/domain/mastery-calculator.ts`
- Modify: `src/modules/reviews/domain/review-algorithm.ts`
- Modify: `src/modules/missions/application/mission-selector.ts`
- Modify: `src/modules/missions/application/start-mission.use-case.ts`
- Test: existing mastery/review tests plus new integration tests

**Tasks:**

1. Confirm mastery cannot reach “mastered” from one correct answer.
2. Persist `demonstratedContexts` based on mission type.
3. Ensure review schedules are due and selected before new content when overdue.
4. Make weak prerequisites visible in Command Centre requirements.
5. Add a test where a wrong answer schedules a near-term review and the next mission prioritizes it.
6. Add a test where a concept is not unlocked until prerequisites reach the mastery threshold.

**Acceptance:**

- Progression is based on demonstrated knowledge, not only XP or completed screens.
- MissionSelector decisions are explainable through `reason` and verified by tests.

---

### Phase H — Make the post-mission reward screen drive the next game state

**Objective:** Replace the “static reward card” feeling with a connected aftermath screen.

**Files:**

- Modify: `src/app/play/page.tsx`
- Modify: relevant play page SCSS or modules if extracted
- Create: `src/modules/missions/presentation/components/reward-summary/`
- Test: component tests and E2E

**Tasks:**

1. Show all state changes from `submitAnswer`/mission completion:
   - XP gained
   - player level change
   - mastery change by concept
   - subject progress change
   - review scheduled date
   - quest progress
   - unlocked next concept/level/boss
2. Change `Start New Mission` to use next recommended action from the application layer.
3. Add `Review Weakness`, `Challenge Boss`, or `Continue Level` actions when appropriate.
4. Add reduced-motion-safe reward reveal animation that does not delay user control.
5. Avoid fake labels like “Next quest updated” unless real quest state changed.

**Acceptance:**

- The completion screen explains what happened and why the next action matters.
- No reward card claims state changes that are not persisted.

---

### Phase I — Wire quests, mission chains, achievements, and story fragments

**Objective:** Make game systems beyond XP actually participate in the loop.

**Files:**

- Modify: `src/modules/missions/application/mission-chain-service.ts`
- Modify: `src/modules/rewards/application/achievement-service.ts`
- Modify: `src/app/actions/profile.ts`
- Modify or create: quest seed/bootstrap action/service
- Test: `tests/unit/missions/mission-chain-service.test.ts`
- Test: new integration tests for quest/achievement progress

**Tasks:**

1. Seed a small set of real quests for Next.js level 1.
2. Update quest progress on mission completion.
3. Award quest rewards once and only once.
4. Advance mission chain steps when the matching mission type/concept is completed.
5. Award achievements/titles from real milestones:
   - first mission completed
   - first perfect mission
   - first level advanced
   - first review completed
   - first boss defeated
6. Surface these changes in Command Centre and reward summary.

**Acceptance:**

- Live DB no longer has `quests: 0` in a playable dev state.
- Profile/Command Centre reflect achievements and quest progress earned through play.

---

### Phase J — Connect boss unlock and boss completion to campaign completion

**Objective:** Make boss battles a real capstone instead of an isolated page.

**Files:**

- Modify: `src/app/actions/boss.ts`
- Modify: `src/modules/missions/application/boss-service.ts`
- Modify: `src/modules/subjects/application/advance-subject-level/advance-subject-level.use-case.ts`
- Modify: Command Centre action dock/inspector components
- Test: boss service tests, subject progression integration test, E2E boss flow

**Tasks:**

1. When subject level reaches second-to-last and requirements are met, persist `bossStatus = "available"`.
2. Command Centre should show `Challenge Boss` only when boss is actually available.
3. Starting a boss should set `bossStatus = "active"` if required.
4. Defeating a boss should:
   - mark boss progress complete
   - mark subject boss status defeated
   - advance/complete subject campaign
   - award achievement/title/story fragment
5. Add E2E for unlock → boss start → answer phases → defeat → subject completed.

**Acceptance:**

- Boss is locked until progression rules allow it.
- Boss victory changes campaign state.

---

### Phase K — Make Encounter Forge production-safe and useful

**Objective:** Turn generated questions into a controlled supply pipeline instead of many duplicate generic questions.

**Files:**

- Modify: `src/modules/artificial-intelligence/infrastructure/big-pickle-gateway.ts`
- Modify: `src/modules/questions/application/generate-questions-use-case.ts`
- Create or modify: response validator/deduper files
- Test: AI gateway tests, generate-question tests, inventory tests

**Tasks:**

1. Add deterministic validation for generated questions:
   - required fields
   - correct answer consistency
   - duplicate options
   - valid concept ID
   - valid difficulty for subject level
   - non-empty explanation
   - unsupported type rejection
2. Add fingerprinting/deduplication:
   - normalized stem hash
   - concept ID
   - option/correct answer fingerprint
   - near-duplicate detection baseline without external embeddings
3. Add generation status if not present:
   - pending
   - approved
   - rejected
   - archived
4. Stop accepting obviously generic invalid questions like “Which Next.js version first introduced support for Event Loop?” for non-Next.js concepts.
5. Encounter Forge should generate by coverage gap: concept + difficulty + challenge type.
6. Add tests that deliberately generate duplicates and invalid questions and prove they are rejected.

**Acceptance:**

- Generated content increases variety without poisoning the bank.
- Question inventory can distinguish approved playable content from generated drafts.

---

### Phase L — Add real challenge type variety

**Objective:** Move beyond all multiple-choice encounters.

**Files:**

- Modify: `src/modules/questions/domain/question.ts`
- Add question type modules per extension point pattern
- Add renderers under play presentation components
- Add evaluators under missions/questions modules
- Test: unit/component/E2E for each type

**Tasks:**

1. Define supported MVP challenge types:
   - multiple-choice
   - multiple-select
   - true-false-with-justification
   - code-prediction
   - bug-hunt
   - explain-it
2. Implement one renderer/evaluator per type.
3. Make `QuestionProvider` alternate challenge type when inventory exists.
4. Add subject seeds for at least multiple-choice and code-prediction in early levels.
5. Ensure E2E sees at least two challenge types in a multi-mission run.

**Acceptance:**

- The game no longer feels like a repeated 3-question multiple-choice loop.
- Challenge variety is deterministic and testable.

---

### Phase M — Strengthen production-grade E2E and integration tests

**Objective:** Prove the whole game works and breaks loudly when disconnected.

**Files:**

- Modify: `tests/e2e/play-flow.spec.ts`
- Create: `tests/e2e/full-progression.spec.ts`
- Create: `tests/e2e/question-rotation.spec.ts`
- Create: `tests/e2e/boss-flow.spec.ts`
- Create: `tests/integration/full-game-loop.test.ts`
- Create: `tests/integration/question-consumption.test.ts`

**Required tests:**

1. **Authenticated first-run campaign test**
   - create user
   - login through `/login`
   - select subject
   - verify `currentSubjectId`
   - verify `playerSubjectProgress`
2. **Question rotation test**
   - seed sufficient inventory
   - start 3 missions
   - assert mission question ID sets differ
   - assert `timesShown` increments
3. **Level boundary test**
   - lower requirements in a controlled fixture subject
   - answer enough missions to advance level
   - verify `playerSubjectProgress.currentLevel` changes
   - verify Command Centre shows the new level
4. **Review scheduling test**
   - answer incorrectly
   - verify review schedule exists
   - force due review
   - verify next mission is review
5. **Boss unlock test**
   - put player at pre-boss level with requirements met
   - complete final requirement
   - verify boss unlocked
   - complete boss
   - verify subject completed
6. **Encounter Forge test**
   - create a coverage gap
   - generate questions
   - verify approved inventory increases only for missing concepts
   - verify duplicate/invalid generated content is rejected
7. **Negative tests**
   - unauthenticated `/play` redirects
   - missing subject progress blocks play with actionable UI
   - empty question level blocks mission start
   - duplicate submit does not double-award XP/progress

**Acceptance:**

- `npm run verify:full` passes.
- `npm run test:e2e` passes.
- Tests fail if any of these are broken:
  - auth identity
  - XP persistence
  - HUD XP display
  - question rotation
  - question consumption metadata
  - subject selection
  - subject level progression
  - review scheduling
  - boss unlock/completion
  - quest/achievement updates

---

### Phase N — Update docs and production readiness after implementation

**Objective:** Keep the project handoff accurate.

**Files:**

- Modify: `docs/project-status.md`
- Modify: `AGENTS.md`
- Modify: `fixes.md`
- Modify: `docs/testing/testing-strategy.md` if test commands/coverage change
- Modify: `docs/game-design/question-supply-strategy.md` if thresholds/implementation differ

**Tasks:**

1. Update `docs/project-status.md` with exact phase status and remaining gaps.
2. Update `AGENTS.md` so the quick-start reflects Phase 13/14 reality.
3. Update `fixes.md` with root causes fixed during implementation.
4. Add references to new E2E/integration tests.
5. Document any intentional deviations from old docs.

**Acceptance:**

- Future agents do not start from stale “Post-launch Durable Persistence” status.
- Docs reflect the real game loop and verification gates.

---

## 4. Execution Order

Execute in this order. Do not skip ahead.

1. Phase A — DB schema match.
2. Phase B — subject campaign content coverage.
3. Phase D — question consumption/rotation.
4. Phase E — authenticated subject selection/progress creation.
5. Phase F — mission completion → subject progress.
6. Phase G — mastery/review gates.
7. Phase H — connected reward screen.
8. Phase I — quests/chains/achievements.
9. Phase J — boss unlock/completion.
10. Phase K — generation validation/dedup.
11. Phase L — challenge variety.
12. Phase M — full production-grade tests.
13. Phase N — docs/status updates.

Reasoning:

- The DB must support the domain before progress can persist.
- The subject must define actual concepts before levels can work.
- Rotation must work before adding more game layers, otherwise more content still feels repetitive.
- Subject progress must exist before level advancement and bosses can work.
- Tests must be strengthened continuously, not bolted on at the end.

---

## 5. Non-Negotiable Rules During Implementation

1. Do not weaken tests to make them pass.
2. Do not add broad skips.
3. Do not use `default-player` in authenticated E2E assertions.
4. Do not claim a reward/state change unless it is persisted.
5. Do not call AI live during normal gameplay unless explicitly enabled.
6. Do not store invalid generated content as approved.
7. Do not let a subject level ship with zero playable questions.
8. Do not let the same 3 question IDs repeat when alternatives exist.
9. Do not use in-memory repositories for integration tests that claim persistence coverage.
10. Do not put database logic directly inside React components or route handlers.

---

## 6. Final Production Gate

Before declaring the project production-ready, run and report exact output for:

```bash
npm run format:check
npm run lint
npm run type-check
npm run depcruise
npm run audit:production
npm run build
npm run test
npm run test:e2e
npm run verify:full
```

Additionally, run a manual or automated production smoke flow:

1. Start app from a clean DB.
2. Register/login.
3. Select subject.
4. Complete multiple missions.
5. Verify different questions appear.
6. Verify XP, mastery, review schedule, subject progress, quest progress, and HUD all update.
7. Advance at least one subject level.
8. Unlock and complete a boss in a controlled fixture path.
9. Restart the server.
10. Verify all progress persists.

---

## 7. Definition of Done

This plan is complete only when:

- the Next.js subject has complete playable coverage for its declared progression
- every playable level has enough question supply
- question `timesShown` and `lastShownAt` update
- repeated missions rotate questions when inventory exists
- authenticated subject selection creates real subject progress
- mission completion updates subject progress
- subject level advancement works through real gameplay
- review scheduling affects the next mission selection
- boss unlock and completion are connected to subject progress
- quests/achievements/story rewards are persisted and visible
- reward screens show only real persisted changes
- E2E tests prove the full game loop, not only a 3-question XP demo
- `npm run verify:full` and `npm run test:e2e` pass

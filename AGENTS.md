# AGENTS.md — Frontend Realms

> **Primary entry point for AI agents** working on the Frontend Realms project. Read this first before making any changes.

---

## Quick Start for Agents

1. Read **this file** (AGENTS.md) — understand the project.
2. Read **`project-instructions.md`** — the complete project specification.
3. Read **`docs/project-status.md`** — current phase, what's done, what's next.
4. Read **`plan.md`** — the current gameplay-connection repair plan for making the full app work as a game.
5. Check the **`docs/architecture/`** directory for architecture details.
6. Check the **`docs/game-design/`** directory for gameplay details.
7. Identify the **relevant module** in `src/modules/` for your change.
8. Run **`npm run verify`** before and after your change.
9. **Never delete tests, weaken assertions, or add broad skips** to pass CI.

---

## Table of Contents

1. [Product Purpose](#1-product-purpose)
2. [Current Phase](#2-current-phase)
3. [Architecture Overview](#3-architecture-overview)
4. [Module Map](#4-module-map)
5. [Main Flows Reference](#5-main-flows-reference)
6. [Technology Stack](#6-technology-stack)
7. [Testing Commands](#7-testing-commands)
8. [Big Pickle Integration Guidelines](#8-big-pickle-integration-guidelines)
9. [Subject File Format](#9-subject-file-format)
10. [Extension Points Reference](#10-extension-points-reference)
11. [Current Limitations](#11-current-limitations)
12. [How to Safely Make Changes](#12-how-to-safely-make-changes)
13. [Prohibited Actions](#13-prohibited-actions)
14. [Where to Find More Information](#14-where-to-find-more-information)

---

## 1. Product Purpose

**Frontend Realms** is a gamified learning platform that takes developers from foundational frontend knowledge to senior-level Next.js engineering. It is NOT a basic quiz app — it is a genuine game whose core gameplay teaches modern frontend engineering.

### Core Principles

- **Make studying enjoyable without weakening technical depth.**
- **Progression must represent demonstrated knowledge**, not clicks or guesses.
- **Separate XP (engagement) from Mastery (understanding).** Unlock content through mastery, not just activity.

### Target Audience

- Frontend developers with 2–5 years of experience looking to reach senior level.
- Developers preparing for senior frontend engineering interviews.
- Next.js developers wanting to deepen their understanding.

---

## 2. Current Phase

**Current Phase: Phase 14 — Player Identity Decoupling (Complete)** ✅

Phase 14 has decoupled all API routes from hard-coded player IDs. All server-side data access now goes through the authenticated user's session:

- ✅ 7 API routes (boss state/answer/start/retreat, missions current/start/answer, player) now use `auth()` to extract the player ID from the NextAuth session
- ✅ API routes return 401 when no session exists, replacing the old `"default-player"` fallback
- ✅ New `getAuthenticatedPlayerId()` server action provides a clean, architecture-compliant auth wrapper for server-side code
- ✅ Play page no longer passes `playerId` as a query parameter to API routes
- ✅ `getPlayerForApi()` simplified — removed dead `default-player` special case
- ✅ E2E tests updated to match new auth-required behavior
- ✅ Architecture validation passes (0 errors)
- ✅ 380 tests passing, build clean

**Next Phase: Phase 15 — Challenge Type Expansion & Variety**

### Phase Overview

| Phase        | Name                                | Status          |
| ------------ | ----------------------------------- | --------------- |
| Phase 0      | Research and Product Definition     | ✅ Complete     |
| Phase 1      | Walking Skeleton                    | ✅ Complete     |
| Phase 2      | Subject Engine                      | ✅ Complete     |
| Phase 3      | Learning Engine                     | ✅ Complete     |
| Phase 4      | Game Foundation                     | ✅ Complete     |
| Phase 5      | Polish & Narrative                  | ✅ Complete     |
| Phase 6      | Experience & Integration            | ✅ Complete     |
| Phase 7      | Advanced Game Experience            | ✅ Complete     |
| Phase 8      | Production Readiness                | ✅ Complete     |
| Post-launch  | Durable Persistence Hardening       | ✅ Complete     |
| Phase 9      | Command Centre & Question Supply    | ✅ Complete     |
| Phase 10     | Subject Campaign Progression        | ✅ Complete     |
| Phase 11     | Encounter Forge & Batch Generation  | ✅ Complete     |
| Phase 12     | Subject Boss & Campaign Completion  | ✅ Complete     |
| Phase 13     | E2E Testing & Production Validation | ✅ Complete     |
| **Phase 14** | **Player Identity Decoupling**      | ✅ **Complete** |

---

## 3. Architecture Overview

### Architecture Style

**Modular monolith** with strict layer separation. No separate backend — Next.js provides both frontend and server-side functionality.

### Architecture Diagram

```
Presentation (React Components, Server Actions, View Models)
    │
    ▼
Application (Use Cases, Commands, Queries)
    │
    ▼
Domain (Entities, Value Objects, Services, Repository Interfaces) ← Innermost
    ▲
    │
Infrastructure (Database, AI Providers, External APIs, Config)
```

### Layer Rules

| Layer          | Depends On                     | Never Depends On             |
| -------------- | ------------------------------ | ---------------------------- |
| Domain         | Nothing (pure TypeScript)      | Frameworks, databases, UI    |
| Application    | Domain only                    | Infrastructure, presentation |
| Infrastructure | Domain (implements interfaces) | Presentation                 |
| Presentation   | Application, Domain            | Infrastructure (directly)    |

### Module Internal Structure

Every module follows the same four-layer pattern:

```
module-name/
├── application/
│   ├── commands/
│   ├── queries/
│   └── use-cases/        <-- Orchestration logic
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   ├── events/
│   ├── errors/
│   └── repositories/     <-- Interfaces only
├── infrastructure/
│   ├── persistence/
│   ├── providers/
│   └── configuration/
└── presentation/
    ├── components/
    ├── view-models/
    ├── actions/
    └── routes/
```

### File Organization Rules (Mandatory)

- One class per file.
- One interface per file.
- One enum per file.
- Parent class in its own file.
- Child class in its own file.
- Request type in its own file.
- Result type in its own file.
- Domain error in its own file.
- Repository interface separate from implementation.
- React components separate from domain objects.
- Tests placed next to implementation or in mirrored `__tests__/` directory.

### Prohibited Patterns

- ❌ No giant `types.ts` files.
- ❌ No giant `utils.ts` files.
- ❌ No barrel files (no `index.ts` re-exports).
- ❌ No business logic inside route handlers.
- ❌ No database logic inside React components.
- ❌ No AI provider logic inside use cases.
- ❌ No SCSS containing unrelated application areas.

---

## 4. Module Map

| Module                      | Path                                   | Purpose                               | Key Domain Objects                                   |
| --------------------------- | -------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| **players**                 | `src/modules/players/`                 | Player identity, profile, preferences | `Player`, `PlayerProfile`, `PlayerPreferences`       |
| **missions**                | `src/modules/missions/`                | Mission lifecycle, attempts           | `Mission`, `MissionPlan`, `MissionAttempt`           |
| **questions**               | `src/modules/questions/`               | Question model, types, evaluation     | `Question`, `QuestionType`, `QuestionFingerprint`    |
| **curriculum**              | `src/modules/curriculum/`              | Subject concepts, prerequisites       | `Subject`, `Concept`, `PrerequisiteGraph`            |
| **mastery**                 | `src/modules/mastery/`                 | Mastery calculation, confidence       | `ConceptMastery`, `MasteryScore`, `ConfidenceLevel`  |
| **reviews**                 | `src/modules/reviews/`                 | Review scheduling, spaced repetition  | `ReviewSchedule`, `ReviewAlgorithm`                  |
| **rewards**                 | `src/modules/rewards/`                 | XP, achievements, unlocks             | `XpAward`, `Achievement`, `PlayerReward`             |
| **progression**             | `src/modules/progression/`             | Leveling, gates, difficulty           | `ProgressionRule`, `RegionGate`                      |
| **game-world**              | `src/modules/game-world/`              | Regions, map, narrative               | `Region`, `WorldMap`, `NarrativeEvent`               |
| **subjects**                | `src/modules/subjects/`                | Subject file parsing, import          | `SubjectFile`, `SubjectImportRecord`                 |
| **artificial-intelligence** | `src/modules/artificial-intelligence/` | AI gateway, providers                 | `ArtificialIntelligenceGateway`, `GenerationContext` |
| **authentication**          | `src/modules/authentication/`          | Auth, sessions                        | `Session`, `Credentials`                             |
| **testing-support**         | `src/modules/testing-support/`         | Test fixtures, fakes, mocks           | `FakeAiGateway`, `TestDataFactory`                   |

### Module Boundary Rules (Critical)

- **curriculum** owns subject parsing and concept graph — must NOT call AI.
- **missions** owns mission lifecycle — must NOT persist player data.
- **mastery** owns mastery calculation — must NOT generate questions.
- **questions** owns question models — must NOT call AI directly.
- **mastery** owns all concept mastery scoring, confidence, retention, and weakness detection — must NOT depend on reviews or questions.
- **reviews** owns review scheduling and SM-2 algorithm — must NOT calculate mastery.
- **rewards** owns XP and achievements — must NOT define progression rules.
- **subjects** owns file parsing — must NOT depend on any other module's domain.
- See `docs/architecture/module-boundaries.md` for complete rules.

---

## 5. Main Flows Reference

### Flow A: StartMissionUseCase

```
request: { playerId, subjectId, mode }
    │
    ├── PlayerRepository.getById(playerId)
    ├── CurriculumRepository.getBySubjectId(subjectId)
    ├── MissionSelector.select({ player, curriculum, mode })
    ├── QuestionProvider.provideFor(missionPlan)
    ├── MissionPlan.createMission(questions)
    └── MissionRepository.save(mission)
    │
result: { missionId, title, description, questionCount, conceptIds }
```

**Specialists**: `PlayerRepository`, `CurriculumRepository`, `MissionSelector`, `QuestionProvider`, `MissionRepository`.

### Flow B: SubmitAnswerUseCase

```
request: { playerId, missionId, questionId, answer, answerTimeMs }
    │
    ├── PlayerRepository.getById(playerId)
    ├── MissionRepository.getById(missionId)
    ├── QuestionRepository.getById(questionId)
    ├── AnswerEvaluator.evaluate(question, answer)
    ├── MasteryCalculator.calculate({ currentMastery, evaluation, answerTimeMs })
    ├── XpCalculator.calculate({ evaluation, masteryImprovement })
    ├── ReviewScheduler.schedule({ playerId, conceptId, evaluation, updatedMastery })
    ├── Player.updateMastery(conceptId, updatedMastery)
    ├── Player.addXp(xpAward)
    ├── Mission.recordAttempt(question.id, evaluation, xpAward)
    ├── PlayerRepository.save(player)
    ├── MissionRepository.save(mission)
    └── ReviewScheduler.save(reviewEntry)
    │
result: { correct, evaluation, masteryChange, xpAwarded, nextReviewAt }
```

**Specialists**: `AnswerEvaluator`, `MasteryCalculator`, `XpCalculator`, `ReviewScheduler`, `PlayerRepository`, `MissionRepository`, `QuestionRepository`.

### Flow C: RunReviewScheduleUseCase

```
request: { playerId, maxReviews, includeWeakPrerequisites }
    │
    ├── PlayerRepository.getById(playerId)
    ├── ReviewRepository.getDueReviews(playerId)
    ├── WeaknessDetector.detect(player.conceptMasteries)
    ├── ReviewPrioritizer.prioritize({ dueReviews, weakConcepts, limit })
    ├── QuestionProvider.provideForConcepts(prioritized)
    ├── MissionFactory.createReviewMission({ player, concepts, questions })
    └── ReviewRepository.saveReviewSession(reviewMission)
    │
result: { hasReviewsDue, reviewMission, reviewedConceptCount }
```

**Specialists**: `ReviewRepository`, `ReviewPrioritizer`, `WeaknessDetector`, `QuestionProvider`, `MissionFactory`.

See `docs/architecture/main-flows.md` for complete use case code.

---

## 6. Technology Stack

| Layer                      | Technology                                 |
| -------------------------- | ------------------------------------------ |
| Framework                  | Next.js 16.2.9                             |
| Router                     | App Router                                 |
| Language                   | TypeScript (strict mode)                   |
| UI                         | React 19                                   |
| Styling                    | SCSS + CSS Modules                         |
| Database (production)      | PostgreSQL (managed service)               |
| Database (dev/test)        | SQLite                                     |
| Schema Validation          | Zod (planned)                              |
| Unit / Integration Testing | Vitest                                     |
| Component Testing          | Vitest + React Testing Library             |
| E2E Testing                | Playwright                                 |
| Accessibility Testing      | axe-core                                   |
| Linting                    | ESLint (Next.js config + Prettier)         |
| Formatting                 | Prettier                                   |
| Architecture Validation    | dependency-cruiser                         |
| AI Provider                | Big Pickle via OpenCode Zen (configurable) |
| Deployment                 | Docker → Fly.io                            |
| CI/CD                      | GitHub Actions                             |

---

## 7. Testing Commands

### Primary Verification

```bash
npm run verify
```

**Fail-fast order** (stops on first failure):

```
1. Environment validation       (node scripts/verify-environment.mjs)
2. Formatting check             (npm run format:check)
3. Lint                         (npm run lint)
4. Type checking                (npm run type-check)
5. Architecture validation      (npx depcruise src)
6. Unit tests                   (npx vitest run src/modules)
7. Integration tests            (npx vitest run tests/integration)
8. Component tests              (npx vitest run src --include "**/*.component.test.*")
9. Build                        (npm run build)
10. E2E smoke tests              (npx playwright test tests/end-to-end/smoke/)
```

### Full Verification

```bash
npm run verify:full
```

Adds: full E2E, Docker build, container verification.

### Individual Commands

```bash
npm run dev              # Start development server
npm run build            # Production build
npm run lint             # ESLint
npm run format           # Format with Prettier
npm run format:check     # Check formatting
npm run type-check       # TypeScript noEmit check
npm run test             # TODO: update with actual test runner
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
```

### Testing Rules (Never Violate)

- **Never delete tests** to pass CI.
- **Never weaken assertions** (e.g., `toEqual` → `toMatchObject` without reason).
- **Never add broad skips** (`describe.skip`, `it.skip`) to hide failures.
- **Always add a regression test** for every fixed bug.
- **Run `npm run verify`** before marking any task complete.

---

## 8. Big Pickle Integration Guidelines

### Architecture

All AI interaction goes through a single interface:

```typescript
export interface ArtificialIntelligenceGateway {
  generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult>;
  evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResult>;
  generateExplanation(request: GenerateExplanationRequest): Promise<GenerateExplanationResult>;
  generateHint(request: GenerateHintRequest): Promise<GenerateHintResult>;
  generateMission(request: GenerateMissionRequest): Promise<GenerateMissionResult>;
  isAvailable(): boolean;
}
```

### Implementation Structure

```
src/modules/artificial-intelligence/infrastructure/big-pickle/
├── big-pickle.ts                           ← Main gateway implementation
├── big-pickle-client.ts                    ← HTTP client
├── big-pickle-config.ts                    ← Configuration
├── big-pickle-request-builder.ts           ← Request construction
├── big-pickle-response-parser.ts           ← Response parsing
├── big-pickle-response-validator.ts        ← Response validation
├── big-pickle-retry-policy.ts              ← Retry logic
└── big-pickle-error-mapper.ts              ← Error mapping
```

### Critical Rules

1. **No feature** may call Big Pickle or any AI provider directly — always through the gateway.
2. **No provider-switch conditionals** anywhere in the application (only in the factory).
3. **Credentials are server-only** — never exposed to the browser.
4. **Validate every response** — treat AI output as untrusted data.
5. **Never execute generated code** automatically.
6. **Never store invalid content** as approved.
7. **Game must remain playable** when AI is unavailable (fallback to stored questions).
8. **Cache safe reusable results.**
9. **Support cancellation** — AI generation must not block shutdown.
10. **Respect rate limits and timeouts.**
11. **Log failures without logging secrets.**

### Environment Configuration

```bash
AI_PROVIDER=big-pickle
BIG_PICKLE_MODEL=big-pickle
BIG_PICKLE_BASE_URL=...
BIG_PICKLE_API_KEY=...
BIG_PICKLE_REQUEST_TIMEOUT_MS=30000
BIG_PICKLE_MAX_RETRIES=2
```

---

## 9. Subject File Format

### Location

Subjects live in Markdown files under `subjects/`. Each file is one subject.

```
subjects/
├── nextjs.md
├── react.md
├── typescript.md
├── angular.md
├── nodejs.md
├── system-design.md
└── testing.md
```

### File Structure

```markdown
---
id: nextjs
title: Next.js
version: 1
schemaVersion: 1
description: Senior-level Next.js learning path
minimumGameVersion: 1.0.0
---

# Domain: JavaScript Foundations

## Concept: Event Loop

### Metadata

- id: javascript.event-loop
- level: foundation
- difficulty: 2
- prerequisites:
  - javascript.call-stack
  - javascript.promises
- tags:
  - javascript
  - asynchronous
  - interview
- outcomes:
  - Explain the call stack
  - Distinguish microtasks from macrotasks
  - Predict asynchronous execution order

### Knowledge

... markdown content ...

### Common Misconceptions

...

### Examples

...

### Question Seeds

...

### Practical Challenges

...

### Interview Prompts

...

### Validation Rules

...
```

### Key Rules

- Concept IDs use format: `subject.concept-name` (lowercase, kebab-case).
- All prerequisite references must resolve to existing concepts.
- Adding a subject requires **zero TypeScript code changes** — just a new file.
- The parser handles all subjects generically.

---

## 10. Extension Points Reference

The following extension points are documented in `docs/architecture/extension-points.md`:

| Extension Point                | How to Add                                | Code Changes Required                 |
| ------------------------------ | ----------------------------------------- | ------------------------------------- |
| **New Subject**                | Create `.md` file in `subjects/`          | None                                  |
| **New Question Type**          | Implement `QuestionTypeModule`            | Enum value + registration + new files |
| **New Mission Type**           | Implement `MissionTypeModule`             | Registration + new files              |
| **New AI Provider**            | Implement `ArtificialIntelligenceGateway` | Factory + config + new files          |
| **New Reward Type**            | Implement `RewardTypeModule`              | Registration + new files              |
| **New Progression Rule**       | Implement `ProgressionRuleModule`         | Registration + new files              |
| **New Evaluation Strategy**    | Implement `EvaluationStrategy`            | Registration + new files              |
| **New Game-World Region**      | Add region configuration                  | Data file or seed                     |
| **New Review Algorithm**       | Implement `ReviewAlgorithm`               | Registration + new files              |
| **New Storage Implementation** | Implement repository interface            | New files + DI binding                |
| **New Visual Theme**           | Define theme tokens + assets              | Theme file + registration             |

### Example: QuestionTypeModule Interface

```typescript
export interface QuestionTypeModule {
  getType(): QuestionType;
  createEvaluator(): QuestionEvaluator;
  createValidator(): QuestionValidator;
  createRendererConfig(): QuestionRendererConfig;
}
```

See `docs/architecture/extension-points.md` for the complete Drag-and-Drop example.

---

## 11. Current Limitations

### Current Limitations

1. **Challenge type variety limited** — The game currently uses only multiple-choice questions. Code-prediction, bug-hunt, and other types defined in the extension point system are not yet implemented. Planned for Phase 15.
2. **Encounter Forge generation quality varies** — Generated questions are validated and deduplicated, but model quality and concept coverage targeting still needs tuning for some subject levels.
3. **E2E coverage covers core paths but not full boundary coverage** — Current Playwright tests play flow, question rotation, and negative paths. Full level progression, boss completion, and persistence-after-restart E2E flows remain to be added.
4. **Inline styles and presentation polish remain** — Some pages still violate the SCSS module architecture direction and the game loop needs more narrative/feedback polish to feel like a premium game.

### Architectural Limitations (by Design)

1. **No separate backend** — Next.js handles both frontend and server. A separate worker may be added later if AI generation becomes a bottleneck.
2. **No real-time multiplayer** — The game is single-player. Leaderboards are intentionally excluded from the initial design.
3. **No plugin runtime** — Extension contracts are interfaces, not a dynamic plugin system. This may evolve later.
4. **SQLite for dev/test only** — Production uses PostgreSQL.
5. **No Kubernetes** — Fly.io provides sufficient orchestration.

### Known Design Decisions

- See `docs/decisions/` for Architecture Decision Records (ADRs). Each significant design decision is documented there.
- The `project-instructions.md` file is the single source of truth — when in doubt, consult it.

---

## 12. How to Safely Make Changes

### Before Making Any Change

1. Read `AGENTS.md` (this file).
2. Read the relevant skill files in `.opencode/skills/` if they exist.
3. Read `docs/project-status.md` to understand current phase.
4. Inspect the existing architecture — check module boundaries.
5. Identify the module that owns the behaviour you need to change.
6. Check existing extension points — can you add, not modify?

### Making the Change

7. Do not duplicate existing logic.
8. Follow the one-class-per-file rule.
9. Keep use cases readable — delegate to specialist objects.
10. Add or update tests before or with the implementation.
11. Run focused tests during development.

### After Making the Change

12. Run `npm run verify` (must pass).
13. Run `npm run verify:full` for changes affecting critical flows.
14. Update documentation when behaviour or architecture changes.
15. Update `docs/project-status.md` after completing a phase.
16. Report precisely what changed and what passed.

### Change Validation Checklist

- [ ] Does the change preserve the readable main flow?
- [ ] Did a class gain more than one responsibility?
- [ ] Could the behaviour be introduced through a specialist object?
- [ ] Are types and classes properly separated?
- [ ] Were tests added or updated?
- [ ] Did `npm run verify` pass?
- [ ] Were documentation and decisions updated?
- [ ] Did the change introduce repetition?
- [ ] Did the change preserve accessibility?
- [ ] Did the change preserve subject independence?

---

## 13. Prohibited Actions

These actions are **never permitted**:

- ❌ Rewriting working modules without a concrete reason.
- ❌ Creating duplicate abstractions.
- ❌ Putting all logic in route handlers.
- ❌ Adding large conditional dispatchers.
- ❌ Creating circular dependencies between modules.
- ❌ Coupling game logic to Next.js framework internals.
- ❌ Making Big Pickle mandatory for basic gameplay.
- ❌ Generating content without validation.
- ❌ Claiming tests passed without running them.
- ❌ Leaving placeholder implementations described as complete.
- ❌ Replacing strong typing with `any`.
- ❌ Silencing TypeScript errors.
- ❌ Ignoring lint rules without justification.
- ❌ Disabling accessibility checks.
- ❌ Adding packages without documenting why.
- ❌ Deleting tests to pass CI.
- ❌ Weakening assertions without documenting why.
- ❌ Adding broad test skips as a way to hide failures.

---

## 14. Where to Find More Information

| Topic                             | Document                                 |
| --------------------------------- | ---------------------------------------- |
| Complete project specification    | `project-instructions.md`                |
| Current status and roadmap        | `docs/project-status.md`                 |
| High-level architecture           | `docs/architecture/system-overview.md`   |
| Use case orchestration            | `docs/architecture/main-flows.md`        |
| Module responsibilities and rules | `docs/architecture/module-boundaries.md` |
| How to extend the system          | `docs/architecture/extension-points.md`  |
| Testing requirements and commands | `docs/testing/testing-strategy.md`       |
| Gameplay design                   | `docs/game-design/core-loop.md`          |
| Progression design                | `docs/game-design/progression.md`        |
| Product vision                    | `docs/product/product-vision.md`         |
| Player personas                   | `docs/product/personas.md`               |
| Core experience definition        | `docs/product/core-experience.md`        |
| Architecture Decision Records     | `docs/decisions/`                        |
| Deployment documentation          | `docs/deployment/`                       |
| Research findings                 | `docs/research/`                         |

---

_This file is the primary entry point for AI agents. It should be updated as the project evolves, but its purpose — orienting a new agent quickly — must never be lost._

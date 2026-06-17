# Project Status

> Current status of the Frontend Realms project — what has been delivered, what is planned, and what risks are tracked. Updated per Phase 0 completion.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Phase 0 — Research and Product Definition (Completed)](#2-phase-0--research-and-product-definition-completed)
3. [Phase 1 — Walking Skeleton (Planned)](#3-phase-1--walking-skeleton-planned)
4. [Full Delivery Roadmap](#4-full-delivery-roadmap)
5. [Risk Register](#5-risk-register)
6. [Current File Structure](#6-current-file-structure)
7. [Next Actions](#7-next-actions)

---

## 1. Project Overview

| Field                   | Value                                              |
| ----------------------- | -------------------------------------------------- |
| **Project Name**        | Frontend Realms (package: `frontend-realms`)       |
| **Project Folder**      | `/home/strubloid/apps/frontend-hero`               |
| **Current Phase**       | Phase 1 — Walking Skeleton (Complete)              |
| **Next Phase**          | Phase 2 — Subject Engine                           |
| **Framework**           | Next.js 16.2.9 (App Router)                        |
| **Language**            | TypeScript (strict mode)                           |
| **AI Provider**         | Big Pickle via OpenCode Zen (configuration-driven) |
| **Production Database** | PostgreSQL (managed service)                       |
| **Dev/Test Database**   | SQLite                                             |
| **Deployment**          | Docker → Fly.io                                    |
| **Initial Subject**     | `subjects/nextjs.md`                               |
| **World Regions**       | 13 Realms (see game-design docs)                   |

---

## 2. Phase 0 — Research and Product Definition (Completed)

### Deliverables

Phase 0 focused on research, product definition, game design, and architecture. No implementation code was written beyond the Next.js scaffold.

### Research Documents

| Document                          | Path                                        | Status      |
| --------------------------------- | ------------------------------------------- | ----------- |
| Gamified Learning Market Analysis | `docs/research/gamified-learning-market.md` | ✅ Complete |
| Learning Science Analysis         | `docs/research/learning-science.md`         | ✅ Complete |
| Coding Platform Analysis          | `docs/research/coding-platform-analysis.md` | ✅ Complete |
| Game Design Analysis              | `docs/research/game-design-analysis.md`     | ✅ Complete |
| Next.js Current State             | `docs/research/nextjs-current-state.md`     | ✅ Complete |
| Product Differentiation           | `docs/research/product-differentiation.md`  | ✅ Complete |

### Product Documents

| Document        | Path                              | Status      |
| --------------- | --------------------------------- | ----------- |
| Product Vision  | `docs/product/product-vision.md`  | ✅ Complete |
| Personas        | `docs/product/personas.md`        | ✅ Complete |
| Core Experience | `docs/product/core-experience.md` | ✅ Complete |

### Game Design Documents

| Document           | Path                              | Status      |
| ------------------ | --------------------------------- | ----------- |
| Core Gameplay Loop | `docs/game-design/core-loop.md`   | ✅ Complete |
| Progression System | `docs/game-design/progression.md` | ✅ Complete |

### Architecture Documents

| Document          | Path                                     | Status      |
| ----------------- | ---------------------------------------- | ----------- |
| System Overview   | `docs/architecture/system-overview.md`   | ✅ Complete |
| Main Flows        | `docs/architecture/main-flows.md`        | ✅ Complete |
| Module Boundaries | `docs/architecture/module-boundaries.md` | ✅ Complete |
| Extension Points  | `docs/architecture/extension-points.md`  | ✅ Complete |

### Testing Documents

| Document         | Path                               | Status      |
| ---------------- | ---------------------------------- | ----------- |
| Testing Strategy | `docs/testing/testing-strategy.md` | ✅ Complete |

### Agent Handoff

| Document                  | Path        | Status      |
| ------------------------- | ----------- | ----------- |
| Primary Agent Entry Point | `AGENTS.md` | ✅ Complete |

### Project Management

| Document             | Path                      | Status      |
| -------------------- | ------------------------- | ----------- |
| Project Status       | `docs/project-status.md`  | ✅ Complete |
| Project Instructions | `project-instructions.md` | ✅ Complete |

### Phase 0 Validation

| Check                                                                    | Status |
| ------------------------------------------------------------------------ | ------ |
| All 19 docs delivered as specified                                       | ✅     |
| Research covers all required products and mechanics                      | ✅     |
| Architecture doc includes ASCII diagram                                  | ✅     |
| Main flows include StartMission, SubmitAnswer, ReviewSchedule            | ✅     |
| Module boundaries define all 13 modules                                  | ✅     |
| Extension points cover all 11 areas + QuestionTypeModule example         | ✅     |
| Testing strategy covers all pyramid levels + algorithm tests + E2E flows | ✅     |
| AGENTS.md covers all required sections                                   | ✅     |
| Risk register documented                                                 | ✅     |

---

## 3. Phase 1 — Walking Skeleton (Completed)

### Objective (Achieved)

The smallest complete vertical flow that touches every architectural layer has been built and verified:

```
Load Next.js subject file
    ↓
Parse one concept from the file
    ↓
Create one stored question for that concept
    ↓
Start a mission containing that question
    ↓
Player submits an answer
    ↓
Evaluate deterministically (no AI yet)
    ↓
Save the attempt to the database
    ↓
Display feedback to the player
```

### Key Fixes During Phase 1

| Issue                               | Root Cause                                                                       | Fix                                               |
| ----------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------- |
| Concept parser regex miss           | `\n\*\*(seed-...)\*\*` required leading `\n` which the first entry lacked        | Prepended sentinel `\n` to raw content            |
| QuestionProvider missing repository | Tests constructed `new QuestionProvider()` without required `QuestionRepository` | Pass mock repository in tests                     |
| Tests skipped async                 | `setupTestData()` called `provideFor()` without `await`                          | Made `setupTestData` async                        |
| SubmitAnswer not returning          | Missing `return` in server action                                                | Added `return` to `submitAnswerUseCase.execute()` |
| SubjectFileReader needed arg        | Constructor requires `subjectsDir` path                                          | Passed `"subjects"`                               |

### Deliverables

#### ✅ Domain types (subject.ts, mission.ts, question.ts, player.ts, mastery.ts)

All core entities with value objects and interfaces.

#### ✅ Subject parser — 29 unit tests

Complete pipeline: SubjectFileReader → SubjectFrontmatterParser → SubjectSectionParser → ConceptParser → SubjectSchemaValidator → PrerequisiteGraphBuilder → SubjectImportService.

#### ✅ Repositories — 31 unit tests

In-memory + Drizzle implementations for Player, Mission, MissionAttempt, Question, ConceptMastery. Drizzle schema and migrations defined.

#### ✅ Mission use cases — 4 unit tests

- **StartMissionUseCase**: Loads player + subject, selects concept, provides questions, creates mission
- **SubmitAnswerUseCase**: Evaluates answer, persists attempt, updates score, awards XP, tracks mastery
- **AnswerEvaluator**: Exact match for multiple choice
- **MasteryCalculator** + **XpCalculator**: Simple scoring and XP

#### ✅ Server actions — `src/app/actions/missions.ts`

Working in-memory repositories with lazy subject loading, exported as `startMission`, `submitAnswer`, `getActiveMission`, `getDefaultPlayerId`, `getDefaultSubject`, `getQuestion`.

#### ✅ API routes

| Route                   | Method | Purpose                          |
| ----------------------- | ------ | -------------------------------- |
| `/api/missions/start`   | POST   | Begin a new mission              |
| `/api/missions/answer`  | POST   | Submit answer                    |
| `/api/missions/current` | GET    | Current mission + question state |

#### ✅ Frontend — `/play` page

Client component with full mission lifecycle: idle → start mission → question display → select option → submit → feedback → next question → completion. Dark theme, keyboard-accessible, reduced-motion compatible.

#### ✅ Integration tests — 2 tests

End-to-end flow test covering:

1. Subject loading → player creation → mission start → correct answer → XP & mastery update → incorrect answer → mastery decay → attempt recording
2. Missing player error handling

### Verification

```text
npm run verify:full
  → format:check  ✓
  → lint         ✓ (0 errors)
  → type-check   ✓
  → build        ✓
  → test         ✓ 66 tests passed (6 files)
```

### What Phase 1 Does NOT Include (Deferred)

| Feature                           | Target Phase |
| --------------------------------- | ------------ |
| AI integration (Big Pickle)       | Phase 5      |
| Multiple question types (only MC) | Phase 6      |
| Sophisticated mastery model       | Phase 3      |
| Review scheduling                 | Phase 3      |
| Game world / regions / narrative  | Phase 4      |
| Authentication                    | Phase 8      |
| Deployment to Fly.io              | Phase 8      |
| Production UI                     | Phase 7      |

### Current File Structure (Updated for Phase 1)

```
frontend-hero/
├── ... (Phase 0 files unchanged)
│
├── src/
│   ├── app/
│   │   ├── actions/
│   │   │   └── missions.ts           <-- ✅ Server actions + in-memory repos
│   │   ├── api/missions/
│   │   │   ├── start/route.ts         <-- ✅ POST start mission
│   │   │   ├── answer/route.ts        <-- ✅ POST/GET answer/submit
│   │   │   └── current/route.ts       <-- ✅ GET mission state
│   │   ├── play/
│   │   │   └── page.tsx              <-- ✅ Frontend mission UI
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── modules/
│   │   ├── artificial-intelligence/  <-- (Phase 5)
│   │   ├── authentication/           <-- (Phase 8)
│   │   ├── curriculum/               <-- (Phase 3)
│   │   ├── game-world/               <-- (Phase 4)
│   │   ├── mastery/
│   │   │   ├── domain/
│   │   │   │   ├── concept-mastery-repository.ts
│   │   │   │   ├── mastery-calculator.ts
│   │   │   │   ├── mastery.ts
│   │   │   │   └── xp-calculator.ts
│   │   ├── missions/
│   │   │   ├── application/
│   │   │   │   ├── answer-evaluator.ts
│   │   │   │   ├── mission-selector.ts
│   │   │   │   ├── mission.use-cases.test.ts   <-- ✅ 4 tests
│   │   │   │   ├── start-mission.use-case.ts
│   │   │   │   └── submit-answer.use-case.ts
│   │   │   ├── domain/
│   │   │   │   ├── mission-repository.ts
│   │   │   │   └── mission.ts
│   │   │   └── infrastructure/
│   │   │       └── drizzle-mission-repository.ts
│   │   ├── players/
│   │   │   ├── domain/
│   │   │   │   ├── player-repository.ts
│   │   │   │   └── player.ts
│   │   │   └── infrastructure/
│   │   │       └── drizzle-player-repository.ts
│   │   ├── progression/              <-- (Phase 3)
│   │   ├── questions/
│   │   │   ├── application/
│   │   │   │   └── question-provider.ts
│   │   │   ├── domain/
│   │   │   │   ├── question-repository.ts
│   │   │   │   └── question.ts
│   │   │   └── infrastructure/
│   │   │       └── drizzle-question-repository.ts
│   │   ├── reviews/                  <-- (Phase 3)
│   │   ├── rewards/                  <-- (Phase 4)
│   │   ├── subjects/
│   │   │   ├── application/
│   │   │   │   ├── concept-parser.ts
│   │   │   │   ├── concept-parser.test.ts
│   │   │   │   ├── prerequisite-graph-builder.ts
│   │   │   │   ├── subject-file-reader.ts
│   │   │   │   ├── subject-frontmatter-parser.ts
│   │   │   │   ├── subject-import-service.ts
│   │   │   │   ├── subject-schema-validator.ts
│   │   │   │   └── subject-section-parser.ts
│   │   │   ├── domain/
│   │   │   │   ├── subject-repository.ts
│   │   │   │   └── subject.ts
│   │   │   └── infrastructure/       <-- (Phase 2)
│   │   └── testing-support/          <-- (Phase 1: fixtures)
│   └── shared/
│       └── infrastructure/
│           └── database/
│               ├── connection.ts
│               └── schema.ts
├── subjects/
│   └── nextjs.md                     <-- ✅ Real subject content (7 domains, >20 seeds)
├── tests/
│   ├── fixtures/
│   │   └── create-tables.ts
│   ├── integration/
│   │   └── walking-skeleton.test.ts   <-- ✅ 2 tests (full flow)
│   └── unit/
│       └── repositories/
│           ├── mission-repository.test.ts  <-- ✅ 13 tests
│           ├── player-repository.test.ts   <-- ✅ 6 tests
│           └── question-repository.test.ts <-- ✅ 12 tests
|
|  Total: 66 tests across 6 files, all passing.
```

## 4. Full Delivery Roadmap

| Phase       | Name                            | Dependencies | Effort    |
| ----------- | ------------------------------- | ------------ | --------- |
| **Phase 0** | Research and Product Definition | None         | Completed |
| **Phase 1** | Walking Skeleton                | Phase 0      | 4 weeks   |
| **Phase 2** | Subject Engine                  | Phase 1      | 3 weeks   |
| **Phase 3** | Learning Engine                 | Phase 2      | 4 weeks   |
| **Phase 4** | Game Foundation                 | Phase 3      | 4 weeks   |
| **Phase 5** | Big Pickle Integration          | Phase 2, 3   | 3 weeks   |
| **Phase 6** | Challenge Variety               | Phase 5      | 6 weeks   |
| **Phase 7** | Advanced Game Experience        | Phase 4, 6   | 6 weeks   |
| **Phase 8** | Production Readiness            | All above    | 4 weeks   |

### Phase Dependency Diagram

```
Phase 0 (Research)
    │
    ▼
Phase 1 (Walking Skeleton)
    │
    ├──────────────────┐
    ▼                  ▼
Phase 2 (Subject)  Phase 3 (Learning)
    │                  │
    └──────┬───────────┘
           ▼
      Phase 4 (Game Foundation)
           │
           ▼
      Phase 5 (Big Pickle)
           │
           ▼
      Phase 6 (Challenge Variety)
           │
           ▼
      Phase 7 (Advanced Game)
           │
           ▼
      Phase 8 (Production)
```

---

## 5. Risk Register

### Active Risks

| ID  | Risk                                                    | Likelihood | Impact | Mitigation                                                                                            | Status |
| --- | ------------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------------------------------------- | ------ |
| R1  | Big Pickle API changes or becomes unavailable           | Medium     | High   | AI gateway abstraction, deterministic fallback, configuration-driven provider selection               | Active |
| R2  | Next.js API changes between versions                    | Medium     | Medium | Pin version in package.json, verify against current docs, abstract framework access behind interfaces | Active |
| R3  | Subject file format becomes too complex to maintain     | Low        | Medium | Schema validation, versioned format, migration support                                                | Active |
| R4  | Mastery algorithm is not pedagogically effective        | Medium     | High   | Research-backed design, testable algorithm, A/B test capability, adjustable parameters                | Active |
| R5  | Game feels like a quiz with badges rather than a game   | Medium     | High   | Game-design-first approach, narrative integration, meaningful progression, variety of challenge types | Active |
| R6  | Solo developer capacity limits progress                 | High       | Medium | Clear phase boundaries, incremental delivery, documented handoff for future agents                    | Active |
| R7  | Database migration issues between SQLite and PostgreSQL | Medium     | Medium | Use compatible subset, test both, abstract with repository interfaces                                 | Active |
| R8  | Circular dependencies emerge between modules            | Medium     | Medium | Architecture tests enforce dependency direction, dependency-cruiser in CI                             | Active |
| R9  | AI-generated content contains errors or unsafe content  | High       | High   | Strict validation pipeline, human review capability, quality ratings, never auto-execute code         | Active |
| R10 | Accessibility requirements not met                      | Medium     | Medium | Automated aXe tests, manual audit, accessibility-first component design                               | Active |

### Retired Risks

| ID  | Risk     | Reason for Retirement | Retired In |
| --- | -------- | --------------------- | ---------- |
| —   | None yet | —                     | —          |

### Risk Management Process

1. **Identify**: Each phase reviews the risk register and adds new risks.
2. **Assess**: Rate likelihood and impact.
3. **Mitigate**: Define mitigation actions.
4. **Monitor**: Review at the end of each phase.
5. **Retire**: Remove resolved risks.

---

## 6. Current File Structure

```
frontend-hero/                    <-- Project root
├── .gitignore
├── .prettierrc
├── AGENTS.md                     <-- ✅ Primary agent entry point
├── README.md                     <-- (update needed for Phase 1)
├── next-env.d.ts
├── next.config.ts                <-- Standalone output configured
├── package.json                  <-- Scripts defined, deps ready
├── project-instructions.md       <-- ✅ Single source of truth
├── tsconfig.json
│
├── docs/
│   ├── architecture/
│   │   ├── system-overview.md    <-- ✅ Complete
│   │   ├── main-flows.md         <-- ✅ Complete
│   │   ├── module-boundaries.md   <-- ✅ Complete
│   │   └── extension-points.md   <-- ✅ Complete
│   ├── decisions/                <-- (empty, ADRs to add in Phase 1)
│   ├── deployment/               <-- (empty, to fill in Phase 8)
│   ├── game-design/
│   │   ├── core-loop.md          <-- ✅ Complete
│   │   └── progression.md        <-- ✅ Complete
│   ├── product/
│   │   ├── product-vision.md     <-- ✅ Complete
│   │   ├── personas.md           <-- ✅ Complete
│   │   └── core-experience.md    <-- ✅ Complete
│   ├── research/                 <-- ✅ All 6 research docs complete
│   │   ├── gamified-learning-market.md
│   │   ├── learning-science.md
│   │   ├── coding-platform-analysis.md
│   │   ├── game-design-analysis.md
│   │   ├── nextjs-current-state.md
│   │   └── product-differentiation.md
│   ├── testing/
│   │   └── testing-strategy.md   <-- ✅ Complete
│   └── project-status.md         <-- ✅ This file
│
├── public/                       <-- Default Next.js assets
├── scripts/                      <-- (empty, verify scripts to add)
├── src/
│   ├── app/                      <-- Next.js App Router scaffold
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.module.css
│   │   └── page.tsx
│   └── modules/                  <-- (empty, to be created in Phase 1)
├── subjects/
│   └── nextjs.md                 <-- (empty file, needs content)
└── tests/                        <-- (empty, to be populated in Phase 1)
    ├── architecture/
    ├── fixtures/
    ├── integration/
    └── end-to-end/
```

---

## 7. Next Actions

### Immediate (Phase 2 — Subject Engine)

1. [ ] Implement subject schema versioning and migration support
2. [ ] Add subject repository persistence layer for the subject file cache
3. [ ] Build subject selection UI (list available subjects)
4. [ ] Add validation for additional subject files beyond `nextjs.md`
5. [ ] Create architecture tests for module boundaries

### Phase 2 Kickoff

1. [ ] Subject schema — formalize the frontmatter + section + concept schema (Phase 2 deliverable).
2. [ ] Subject parser v2 — robust error handling, line numbers, recovery.
3. [ ] Subject validator — validate subject files with detailed error messages.
4. [ ] Prerequisite graph — build the DAG and implement prerequisite checking.
5. [ ] Subject version migration — handle format upgrades.
6. [ ] Subject repository persistence — cache parsed subjects.
7. [ ] Subject selection — let the player choose which subject to study.
8. [ ] Tests for all of the above.
9. [ ] Verify with `npm run verify:full`.
10. [ ] Update documentation.

---

**Related Documents**:

- [AGENTS.md](../AGENTS.md) — Primary entry point for AI agents
- [System Overview](../architecture/system-overview.md) — Architecture context
- [Testing Strategy](../testing/testing-strategy.md) — Testing requirements
- [Project Instructions](../../project-instructions.md) — Full project specification

---

_Last updated: June 2026. Update this document after every meaningful implementation phase._

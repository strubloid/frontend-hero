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
| **Current Phase**       | Phase 0 — Complete                                 |
| **Next Phase**          | Phase 1 — Walking Skeleton                         |
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

## 3. Phase 1 — Walking Skeleton (Planned)

### Objective

Build the smallest complete vertical flow that touches every architectural layer. This validates the architecture before adding complexity.

### Vertical Flow

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

### Tasks

| Task     | Description                                                                             | Estimated Effort |
| -------- | --------------------------------------------------------------------------------------- | ---------------- |
| **1.1**  | Set up database schema and migrations                                                   | 3 days           |
|          | — Define initial entities (Player, Subject, Concept, Question, Mission, MissionAttempt) |                  |
|          | — Create SQLite schema for dev                                                          |                  |
|          | — Create PostgreSQL-compatible migration script                                         |                  |
|          | — Set up test database utility                                                          |                  |
| **1.2**  | Implement subject parser for `subjects/nextjs.md`                                       | 3 days           |
|          | — SubjectFileReader, FrontmatterParser, SectionParser, ConceptParser                    |                  |
|          | — SubjectSchemaValidator                                                                |                  |
|          | — PrerequisiteGraphBuilder                                                              |                  |
| **1.3**  | Implement Player and Mission repositories                                               | 2 days           |
|          | — PlayerRepository with create/getById/save                                             |                  |
|          | — MissionRepository with create/getById/save                                            |                  |
|          | — QuestionRepository with basic storage                                                 |                  |
| **1.4**  | Implement StartMissionUseCase                                                           | 2 days           |
|          | — MissionSelector (simple: return first available concept)                              |                  |
|          | — QuestionProvider (simple: return stored question)                                     |                  |
|          | — Mission domain entity                                                                 |                  |
| **1.5**  | Implement SubmitAnswerUseCase                                                           | 2 days           |
|          | — AnswerEvaluator (exact match for multiple choice)                                     |                  |
|          | — MasteryCalculator (simple scoring)                                                    |                  |
|          | — XpCalculator (basic XP)                                                               |                  |
| **1.6**  | Build basic UI                                                                          | 3 days           |
|          | — World/mission selection page (skeleton)                                               |                  |
|          | — Question display component (multiple choice)                                          |                  |
|          | — Feedback component                                                                    |                  |
|          | — Progress indicator                                                                    |                  |
| **1.7**  | Add tests                                                                               | 3 days           |
|          | — Unit tests for all domain objects                                                     |                  |
|          | — Use case tests with mocked repos                                                      |                  |
|          | — Parser tests with sample subject file                                                 |                  |
|          | — Integration test for full flow                                                        |                  |
|          | — Architecture tests                                                                    |                  |
| **1.8**  | Wire up server actions                                                                  | 1 day            |
|          | — Server actions for start mission, submit answer                                       |                  |
|          | — Error handling                                                                        |                  |
| **1.9**  | Validate with `npm run verify`                                                          | 0.5 days         |
|          | — Ensure all steps pass                                                                 |                  |
| **1.10** | Update docs                                                                             | 0.5 days         |
|          | — Update project-status.md                                                              |                  |
|          | — Update ADRs for decisions made                                                        |                  |

### Estimated Timeline

20 days (4 weeks) for a single developer.

### Phase 1 Deliverables

- ✅ A working Next.js app that can load a subject, start a mission, present a question, evaluate an answer, and display feedback.
- ✅ Database schema with migrations.
- ✅ Subject parser for the Next.js subject file.
- ✅ At least one complete use case with tests.
- ✅ All tests passing.
- ✅ `npm run verify` passing.

### What Phase 1 Does NOT Include

- ❌ AI integration (Big Pickle) — deferred to Phase 5.
- ❌ Multiple question types — only multiple choice.
- ❌ Sophisticated mastery model — simple scoring only.
- ❌ Review scheduling — deferred to Phase 3.
- ❌ Game world / regions / narrative — deferred to Phase 4.
- ❌ Authentication — only if required for persistence.
- ❌ Deployment to Fly.io — deferred to Phase 8.
- ❌ Beautiful UI — functional but minimal.

---

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

### Immediate (Pre-Phase 1)

1. [ ] Add subject content to `subjects/nextjs.md` — at minimum 1 domain with 2–3 concepts and question seeds.
2. [ ] Set up test runner (Vitest) with configuration.
3. [ ] Set up dependency-cruiser for architecture tests.
4. [ ] Create the `src/modules/` directory structure for Phase 1 modules.
5. [ ] Create the `tests/` fixture structure.

### Phase 1 Kickoff

1. [ ] Implement database schema and migrations (Task 1.1).
2. [ ] Implement subject parser (Task 1.2).
3. [ ] Implement repositories (Task 1.3).
4. [ ] Implement StartMissionUseCase (Task 1.4).
5. [ ] Implement SubmitAnswerUseCase (Task 1.5).
6. [ ] Build basic UI components (Task 1.6).
7. [ ] Write tests for all of the above (Task 1.7).
8. [ ] Wire up server actions (Task 1.8).
9. [ ] Verify with `npm run verify` (Task 1.9).
10. [ ] Update documentation (Task 1.10).

---

**Related Documents**:

- [AGENTS.md](../AGENTS.md) — Primary entry point for AI agents
- [System Overview](../architecture/system-overview.md) — Architecture context
- [Testing Strategy](../testing/testing-strategy.md) — Testing requirements
- [Project Instructions](../../project-instructions.md) — Full project specification

---

_Last updated: June 2026. Update this document after every meaningful implementation phase._

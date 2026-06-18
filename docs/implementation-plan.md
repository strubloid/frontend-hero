# Implementation Plan — Command Centre & Question Supply

> **Phased execution plan for transforming Frontend Realms from a website into a guided game.**
> Derived from the experience audit (`docs/game-design/current-experience-audit.md`) and the question-supply strategy (`docs/game-design/question-supply-strategy.md`).

---

## How to Read This Plan

Each phrase (P1–P12) represents a shippable increment.

Each phrase contains concrete file changes, design decisions, and a verification step.

Phrases are ordered by dependency — later phrases depend on earlier foundations.

The plan maps directly to Phase 9 sub-phases from `docs/project-status.md`:

| Project Status Sub-phase                                          | Corresponding Phrase(s) |
| ----------------------------------------------------------------- | ----------------------- |
| 9B — Subject-level progression model                              | P2                      |
| 9C — Command Centre view models + fixtures                        | P3                      |
| 9D — Static composition (responsive layout, HUD, world stage,...) | P4, P5, P6              |
| 9E — Player identity + XP + mastery in HUD                        | P4                      |
| 9F — Current quest display                                        | P5                      |
| 9G — Campaign rail                                                | P6                      |
| 9H — Action dock                                                  | P7                      |
| 9I — Inspector panel                                              | P7                      |
| 9J — Reward result screen                                         | P8                      |
| 9K — Question-supply strategy (done)                              | P1                      |
| 9L — Big Pickle AI gateway + batch contract                       | P9                      |
| 9M — Generation job model + inventory service                     | P10                     |
| 9N — Encounter Forge UI                                           | P11                     |
| 9O — Integration testing + verification                           | P12                     |

---

## Architectural Overview

```
                     ┌──────────────────────┐
                     │  Command Centre Page  │
                     │  (presentation)       │
                     └──────────┬───────────┘
                                │ uses
              ┌─────────────────┼────────────────┐
              ▼                 ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │  Game HUD    │  │ World Stage  │  │Quest Inspector│
     │  (view model)│  │(view model)  │  │(view model)   │
     └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
            │                 │                  │
            └─────────────────┼──────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ LoadCommandCentre  │
                    │    Use Case        │
                    │ (application)      │
                    └─────────┬─────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
   ┌────────────┐     ┌──────────────┐     ┌──────────────┐
   │   Player   │     │  Subject     │     │   Mission    │
   │ Repository │     │  Repository  │     │  Repository  │
   └────────────┘     └──────────────┘     └──────────────┘

                     ┌──────────────────────┐
                     │   Encounter Forge    │
                     │  (presentation)       │
                     └──────────┬───────────┘
                                │ uses
                     ┌──────────▼───────────┐
                     │ ArtificialIntelligence│
                     │    Gateway            │
                     │ (batch generation)    │
                     └──────────┬───────────┘
                                │
                     ┌──────────▼───────────┐
                     │  Question Inventory  │
                     │     Service          │
                     │ (domain + storage)   │
                     └──────────────────────┘
```

---

## P1 — Audit & Foundation Documents (Done)

**What**: The documents you are reading + the audit.

**Files created**:

- `docs/game-design/current-experience-audit.md` ✅
- `docs/project-status.md` (updated) ✅
- `docs/game-design/question-supply-strategy.md` ✅
- This plan ✅

**Verification**: `npm run verify` passes.

---

## P2 — Subject-Level Progression Model

**Goal**: Introduce per-subject level progression (levels 1–X with gated requirements), separate from global player level.

### Files to create

```
src/modules/subjects/domain/
├── subject-level.ts            ← SubjectLevel enum/type
├── subject-level-definition.ts ← LevelDefinition (title, reqs, concepts)
├── subject-level-requirements.ts ← RequiredEncounters, mastery, coverage, etc.
├── player-subject-progress.ts  ← Per-player-per-subject progress entity
└── subject-boss-config.ts      ← Boss phase definitions
```

### Files to modify

```
subjects/nextjs.md                     ← Add level definitions below concepts
src/modules/subjects/domain/subject.ts ← Add maxLevel, levels array
src/shared/infrastructure/database/schema.ts ← Add player_subject_progress table
```

### Key decisions

- `SubjectLevelRequirementEvaluator` uses the specialist-per-requirement pattern (one class per requirement type)
- Subject-level progress is a separate table from player progression
- Subject-level gate evaluation is pure domain logic (no DB calls in evaluators)

### Verification

```bash
npm run verify
npm run test -- --run src/modules/subjects/
```

---

## P3 — Command Centre View Models & Development Fixtures

**Goal**: Define the typed view models that the Command Centre uses, and create a replaceable development-fixture provider so layout and styling work before real repositories are wired.

### Files to create

```
src/modules/command-centre/
├── domain/
│   ├── command-centre-view-model.ts      ← Root view model
│   ├── game-hud-view-model.ts            ← HUD data
│   ├── player-identity-view-model.ts     ← Avatar, name, title, level
│   ├── player-level-view-model.ts        ← Level, XP, progress
│   ├── active-subject-view-model.ts      ← Current subject + mastery
│   ├── game-currency-view-model.ts       ← Shards, tokens, streak
│   ├── hud-notification-view-model.ts    ← Badge/notification state
│   ├── current-quest-view-model.ts       ← Active quest data
│   ├── quest-progress-view-model.ts      ← Progress within quest
│   ├── quest-reward-view-model.ts        ← Reward preview
│   ├── quest-action-view-model.ts        ← Action button data
│   ├── campaign-rail-view-model.ts       ← Campaign path
│   ├── campaign-entry-view-model.ts      ← Single region/level node
│   ├── world-map-view-model.ts           ← World map state
│   ├── world-node-view-model.ts          ← Single node state
│   ├── world-node-state.ts               ← Enum: available/current/locked/etc.
│   ├── world-node-type.ts                ← Enum: mission/boss/side-quest
│   ├── world-node-position.ts            ← Coordinates for layout
│   ├── unlock-requirement-view-model.ts  ← Lock info for locked nodes
│   ├── recent-progress-view-model.ts     ← Recent activity
│   └── recommended-action-view-model.ts  ← Action dock items
├── application/
│   └── load-command-centre/
│       ├── load-command-centre.use-case.ts
│       ├── load-command-centre.request.ts
│       ├── load-command-centre.result.ts
│       └── command-centre-assembler.ts   ← Maps domain → view models
├── infrastructure/
│   └── development/
│       └── development-command-centre-provider.ts ← Fixture data
└── presentation/
    ├── command-centre-page/
    │   ├── command-centre-page.tsx
    │   └── command-centre-page.module.scss
    ├── game-hud/
    │   ├── game-hud.tsx
    │   └── game-hud.module.scss
    ├── player-identity/
    │   ├── player-identity.tsx
    │   └── player-identity.module.scss
    ├── experience-bar/
    │   ├── experience-bar.tsx
    │   └── experience-bar.module.scss
    ├── mastery-indicator/
    │   ├── mastery-indicator.tsx
    │   └── mastery-indicator.module.scss
    ├── resource-display/
    │   ├── resource-display.tsx
    │   └── resource-display.module.scss
    ├── campaign-rail/
    │   ├── campaign-rail.tsx
    │   └── campaign-rail.module.scss
    ├── world-stage/
    │   ├── world-stage.tsx
    │   └── world-stage.module.scss
    ├── world-path/
    │   ├── world-path.tsx
    │   └── world-path.module.scss
    ├── world-node/
    │   ├── world-node.tsx
    │   └── world-node.module.scss
    ├── current-quest-panel/
    │   ├── current-quest-panel.tsx
    │   └── current-quest-panel.module.scss
    ├── quest-inspector/
    │   ├── quest-inspector.tsx
    │   └── quest-inspector.module.scss
    ├── reward-preview/
    │   ├── reward-preview.tsx
    │   └── reward-preview.module.scss
    ├── contextual-action-dock/
    │   ├── contextual-action-dock.tsx
    │   └── contextual-action-dock.module.scss
    ├── guide-message/
    │   ├── guide-message.tsx
    │   └── guide-message.module.scss
    └── recent-progress/
        ├── recent-progress.tsx
        └── recent-progress.module.scss
```

### Fixture data

The `DevelopmentCommandCentreProvider` returns realistic-but-static data covering all game states:

- New player (no XP, no quest, first-time guidance)
- Active quest player (quest in progress, quest inspector active)
- Review-ready player (overdue review notification)
- Boss-available player (boss node visible)
- Subject-completed player (campaign complete screen)
- Empty/loading/error states

### Verification

```bash
npm run verify
npm run test -- --run src/modules/command-centre/
```

---

## P4 — Persistent Top HUD (Layout Redesign)

**Goal**: Replace the root layout's empty wrapper with a persistent game HUD shown on all authenticated game routes.

### Files to modify

```
src/app/layout.tsx              ← Add GameHUD wrapper above children
src/app/layout.module.scss      ← New SCSS module for layout
src/app/page.tsx                ← Simplified to just render CommandCentrePage
```

### HUD components to implement (fixture-backed)

| Component           | Content                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `PlayerIdentity`    | Avatar emblem, player name, current title, player level                                                                  |
| `ExperienceBar`     | Current XP / XP to next, animated bar, tooltip                                                                           |
| `MasteryIndicator`  | Active subject mastery percentage                                                                                        |
| `ResourceDisplay`   | Knowledge Shards, Streak Flame, Review Tokens, Achievement count                                                         |
| `CompactActions`    | World map, Quest journal, Skill tree, Achievements, Subject selection, Profile, Settings — as icon buttons with tooltips |
| `NotificationState` | Review-ready badge, unclaimed reward dot, new unlock indicator                                                           |

### Atmospheric background

Replace the empty black background with layered SVG/canvas atmosphere:

```scss
.command-centre-background {
  position: fixed;
  inset: 0;
  z-index: 0;

  &__atmosphere {
    /* base dark gradient with subtle hue */
  }
  &__constellation {
    /* slow-moving particles / network nodes */
  }
  &__path-glow {
    /* animated path energy between region nodes */
  }
}
```

### Accessibility for HUD

- All icon buttons have `aria-label`
- Reduced-motion media query disables animated bars and particle movement
- Tab order: HUD icons → main content → action dock
- Focus-visible rings on all interactive elements

### Verification

```bash
npm run verify
# Manual: navigate between / /play /profile — HUD persists and shows correct data
```

---

## P5 — Current Quest Panel

**Goal**: The most visually prominent element on the Command Centre — the player's active quest.

### Components

```
current-quest-panel/
├── current-quest-panel.tsx
└── current-quest-panel.module.scss
```

### Display fields

| Field          | Example                                                           |
| -------------- | ----------------------------------------------------------------- |
| Quest category | `MAIN QUEST` / `REVIEW` / `SIDE QUEST` / `BOSS`                   |
| Quest title    | `The Async Rift`                                                  |
| Narrative      | `Stabilize the execution timeline before the rift consumes...`    |
| Objective      | `Predict the order of synchronous code, promises, microtasks...`  |
| Challenge type | `Code Prediction`                                                 |
| Difficulty     | `Adventurer` (with visual badge)                                  |
| Progress       | `2 / 5 encounters` with bar                                       |
| Rewards        | `+180 XP · +12 Knowledge Shards · Event Loop mastery opportunity` |
| Unlocks        | `Promise Forge`                                                   |
| Primary action | `[CONTINUE QUEST]` — large, distinct, game-styled                 |

### Game action language

| Use instead of           |
| ------------------------ |
| `Continue Quest`         |
| `Enter Encounter`        |
| `Begin Investigation`    |
| `Challenge the Guardian` |
| `Repair the System`      |
| `Resume Battle`          |

Never: `Open`, `View`, `Go`, `Learn More`.

### State-dependent rendering

- **No active quest**: Show "Your next quest awaits" with `[BEGIN RECOMMENDED QUEST]`
- **Active quest in progress**: Show quest details + `[CONTINUE QUEST]`
- **Quest completed but reward unclaimed**: Show reward summary + `[CLAIM REWARD]`
- **Review overdue**: Show review warning + secondary `[REVIEW 3 CONCEPTS]`

### Verification

```bash
npm run verify
# Manual: fixture data shows campaign rail with completed/current/locked nodes
```

---

## P6 — Campaign Rail & Interactive World Stage

**Goal**: Replace the home page's feature-card grid with a campaign path and interactive node map.

### Campaign Rail (compact left rail)

```
src/modules/command-centre/presentation/campaign-rail/
├── campaign-rail.tsx
└── campaign-rail.module.scss
```

Linear progression list with state indicators:

```
✓ Level 1 — Foundations
✓ Level 2 — Routing Initiate
✓ Level 3 — Component Boundaries
● Level 4 — Data Apprentice
○ Level 5 — Rendering Explorer
🔒 Level 6 — Cache Investigator
```

Locked nodes show requirement on hover/click: `Requires: Event Loop mastery ≥ 70%`.

### World Stage (central, largest area)

```
src/modules/command-centre/presentation/world-stage/
├── world-stage.tsx
├── world-stage.module.scss
├── world-path.tsx
├── world-path.module.scss
├── world-node.tsx
└── world-node.module.scss
```

Node-path layout:

```
[Camp]
   │
[Closure Woods] ─── [Side Quest]
   │
[Async Rift] ← current
   │
[Promise Forge]
   │
[Event Loop Guardian] ← boss
   │
[TypeScript Citadel] ← locked
```

### Node states (visually distinct)

| State            | Visual                                               |
| ---------------- | ---------------------------------------------------- |
| Completed        | Green checkmark, subdued brightness, checkmark icon  |
| Mastered         | Gold border, mastery star                            |
| Available        | Medium brightness, interactive, subtle glow on hover |
| Current          | Brightest, pulsing energy/glow, "active" label       |
| Locked           | Dimmed, lock icon, greyed                            |
| Review required  | Orange warning indicator                             |
| Boss             | Larger icon, red/amber glow, "Boss" label            |
| Side quest       | Smaller, diamond icon, secondary colour              |
| Reward available | Exclamation badge on node                            |

### Ambient motion (respects reduced-motion)

- Path energy flow (slow gradient animation along SVG paths)
- Current node pulse (gentle opacity oscillation every 3s)
- Available nodes shimmer subtly on hover
- No perpetual motion on locked or completed nodes

### Keyboard navigation

- Tab through nodes in path order
- Arrow keys (up/down for vertical path, left/right for horizontal)
- Enter/Space to inspect selected node
- Escape to deselect
- `aria-label` on each node describing its state

### Verification

```bash
npm run verify
# Manual: keyboard tab through nodes, check lock requirements display
```

---

## P7 — Quest Inspector & Contextual Action Dock

### Quest Inspector (right panel)

```
src/modules/command-centre/presentation/quest-inspector/
├── quest-inspector.tsx
└── quest-inspector.module.scss
```

Three modes:

| Mode    | When                 | Content                                                                              |
| ------- | -------------------- | ------------------------------------------------------------------------------------ |
| Default | Nothing selected     | Current quest summary + recommended action + recent progress + review warning        |
| Mission | Active node selected | Mission info, objectives, rewards, prerequisites, previous performance, Start action |
| Locked  | Locked node selected | Required mastery, required missions, recommended preparation                         |

### Action Dock (bottom bar)

```
src/modules/command-centre/presentation/contextual-action-dock/
├── contextual-action-dock.tsx
└── contextual-action-dock.module.scss
```

State-dependent primary action:

| Player State        | Primary Action                                  |
| ------------------- | ----------------------------------------------- |
| No active mission   | `[BEGIN RECOMMENDED QUEST]`                     |
| Mission in progress | `[CONTINUE ENCOUNTER]`                          |
| Review overdue      | `[REVIEW 5 CONCEPTS]` + `[Continue Main Quest]` |
| Boss unlocked       | `[CHALLENGE THE GUARDIAN]`                      |
| Subject completed   | `[START NEW SUBJECT]`                           |

### Verification

```bash
npm run verify
npm run test -- --run src/modules/command-centre/
```

---

## P8 — Reward Result Screen & First-Time Guidance

### Reward result screen

After completing a mission encounter, show a compact result sequence.

Create:

```
src/modules/command-centre/presentation/reward-result/
├── reward-result.tsx
├── reward-result.module.scss
├── reward-result.states.ts         ← All reward state types
└── reward-result.data.ts          ← Fixture data
```

Example result:

```
ENCOUNTER CLEARED

Execution order: Correct
Reasoning: Strong
Confidence calibration: Accurate

+120 XP
+8 Knowledge Shards
Event Loop mastery: 58% → 64%

Guardian gate:
2 of 3 requirements complete
```

### Celebration rules

| Event               | Response                                    |
| ------------------- | ------------------------------------------- |
| Each correct answer | Subtle checkmark + XP tick                  |
| Level increase      | Full-screen "LEVEL UP" banner + sound ready |
| Region completed    | Region-complete animation                   |
| Boss defeated       | Boss-defeat sequence                        |
| Campaign complete   | Campaign complete screen                    |

No confetti after every question.

### First-time guidance

Create:

```
src/modules/command-centre/presentation/guide-message/
├── guide-message.tsx
├── guide-message.module.scss
├── guide-sequence.ts         ← Step definitions
└── guide-store.ts            ← Dismissed-state persistence
```

Flow:

```
1. "Welcome to the Frontend Realms"
2. "I need to assess your knowledge" → diagnostic
3. "Here's your first quest" → quest assigned
4. Highlight HUD elements sequentially
5. "Enter your first encounter" → launch mission
```

The guide is dismissible and can be replayed from settings.

### Verification

```bash
npm run verify
# Manual: full play loop through fixtured data
```

---

## P9 — AI Gateway & Batch Generation Contract

**Goal**: Create the infrastructure for Big Pickle batch question generation.

### Files to create

```
src/modules/artificial-intelligence/
├── domain/
│   ├── artificial-intelligence-gateway.ts        ← Interface
│   ├── generate-question-batch.request.ts        ← Batch request types
│   ├── generate-question-batch.result.ts         ← Batch result types
│   ├── question-generation-job.ts                ← Job entity
│   ├── question-generation-job-status.ts         ← Status enum
│   ├── question-generation-candidate.ts          ← Raw candidate from AI
│   ├── question-batch-plan.ts                    ← Generation plan
│   ├── question-batch-validator.ts              ← Validates candidates
│   ├── question-batch-storage-service.ts         ← Stores approved
│   ├── question-batch-replacement-service.ts     ← Replaces rejected
│   └── question-inventory-service.ts            ← Inventory health
├── application/
│   ├── generate-batch.use-case.ts               ← Orchestrates generation
│   ├── generate-batch.request.ts
│   ├── generate-batch.result.ts
│   ├── inspect-inventory.use-case.ts            ← Health check
│   └── inspect-inventory.request.ts
├── infrastructure/
│   ├── big-pickle-gateway.ts                     ← Big Pickle implementation
│   └── drizzle-question-generation-repository.ts ← Job persistence
└── presentation/
    └── (Encounter Forge UI — see P11)
```

### Batch generation flow

```
GenerateBatchUseCase.execute(request)
  │
  ├── Validate subject + level exist
  ├── Check no duplicate active job
  ├── Create QuestionGenerationJob (status: queued)
  ├── Build QuestionBatchPlan (distribution, concepts, difficulty)
  ├── Chunk into provider-safe sizes (e.g., 20 × 1)
  ├── For each chunk:
  │     ├── Call ArtificialIntelligenceGateway.generateQuestionBatch()
  │     ├── Parse response into QuestionGenerationCandidate[]
  │     ├── Validate each candidate (QuestionBatchValidator)
  │     ├── Detect duplicates against existing bank
  │     ├── Store approved candidates
  │     └── Record rejections with reasons
  ├── Request replacements for rejected items (bounded)
  └── Complete job (status: completed / partially_completed)
```

### Validation rules

| Check             | What it validates                          |
| ----------------- | ------------------------------------------ |
| Schema            | Correct fields present, types match        |
| Subject level     | Question matches requested subject + level |
| Correct answer    | Answer is objectively correct              |
| Explanation       | Matches correct answer, no contradictions  |
| Duplicate options | No two options with identical meaning      |
| Near-duplicate    | Similar stem/options to existing questions |
| Difficulty        | Within requested range                     |
| Concept           | Maps to an allowed concept                 |
| Safety            | No unsafe or inappropriate content         |

### Verification

```bash
npm run verify
npm run test -- --run src/modules/artificial-intelligence/
```

---

## P10 — Question Inventory Service

**Goal**: Monitor and report question bank health per subject level.

### Core interface

```typescript
export interface QuestionInventoryService {
  inspect(request: InspectQuestionInventoryRequest): Promise<QuestionInventoryStatus>;
  determineGenerationNeed(status: QuestionInventoryStatus): QuestionGenerationNeed;
}
```

### Health states

```typescript
export enum QuestionInventoryHealth {
  Healthy, // ≥ 40 approved
  Low, // 10–39 approved
  Critical, // 1–9 approved
  Empty, // 0 approved
  Generating, // Active generation job
  ValidationRequired, // Questions pending review
}
```

### Files to create

```
src/modules/artificial-intelligence/domain/
├── question-inventory-service.ts
├── question-inventory-status.ts
└── question-inventory-health.ts
```

### When inventory is checked

- On Command Centre load (HUD supply indicator)
- After a batch generation completes
- When a new subject level unlocks
- Periodically (configurable, optional cron)

### HUD indicator

The `ResourceDisplay` component gets a compact supply state:

```
Encounter Supply: 34 ready · 8 new · 3 pending
```

When critical:

```
⚠️ Encounter supply running low
[FORGE 20 ENCOUNTERS]
```

### Verification

```bash
npm run verify
npm run test -- --run src/modules/artificial-intelligence/
```

---

## P11 — Encounter Forge UI

**Goal**: A game-themed interface for managing question generation.

### Page and components

```
src/modules/command-centre/presentation/encounter-forge/
├── encounter-forge-page.tsx           ← Page wrapper
├── encounter-forge-page.module.scss
├── forge-controls.tsx                 ← Subject/level/concept selection
├── forge-controls.module.scss
├── batch-preview.tsx                  ← Plan summary before generation
├── batch-preview.module.scss
├── job-progress.tsx                   ← Live/periodic progress display
├── job-progress.module.scss
├── generation-history.tsx             ← Past jobs
├── generation-history.module.scss
├── inventory-display.tsx              ← Current bank health
└── inventory-display.module.scss
```

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Encounter Forge                                              │
├──────────────────┬────────────────────────┬──────────────────┤
│ Subject & Level  │ Generation Plan        │ Inventory Health │
│                  │                        │                  │
│ Next.js          │ Quantity: 20           │ 34 ready         │
│ Level 5          │ Challenge mix          │ 8 recently used  │
│ Concepts         │ Difficulty range       │ 3 pending        │
├──────────────────┴────────────────────────┴──────────────────┤
│ Generation History / Active Job                              │
└──────────────────────────────────────────────────────────────┘
```

### Primary action

```
[FORGE 20 ENCOUNTERS]
```

Before generation, show a plan summary:

```
20 Next.js Level 5 encounters

Coverage:
- Streaming
- Suspense
- Rendering boundaries
- Hydration

Challenge mix:
6 predictions · 5 bug hunts · 4 knowledge · 3 refactoring · 2 explanations
```

### Approval modes

| Mode                    | Behaviour                                            |
| ----------------------- | ---------------------------------------------------- |
| Automatic (default dev) | Valid questions go straight to approved              |
| Manual                  | Questions stay pending until reviewed                |
| Hybrid                  | Low-difficulty auto-approved, high-difficulty manual |

### Verification

```bash
npm run verify
npm run test -- --run src/modules/command-centre/
```

---

## P12 — Wire Real State + Integration + Verification

**Goal**: Replace fixture data with real repository calls, connect the complete vertical slice, and verify everything passes.

### Wiring steps

1. **Replace development fixture provider** with real `LoadCommandCentreUseCase` that calls actual repositories
2. **Connect quest panel** → `MissionRepository.findCurrentForPlayer()`
3. **Connect HUD** → `PlayerRepository`, `ProgressionRepository`, `MasteryRepository`
4. **Connect campaign rail** → `SubjectRepository` + `PlayerSubjectProgressRepository`
5. **Connect world stage** → `WorldMapRepository`
6. **Connect action dock** → state derived from quest + review + boss status
7. **Connect reward screen** → result from `SubmitAnswerUseCase`
8. **Connect Encounter Forge** → `GenerateBatchUseCase` + `QuestionInventoryService`
9. **Connect first-time guidance** → check player first-visit flag

### New repository methods needed

| Repository           | New methods                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| `PlayerRepository`   | `findCurrentQuest()`, `getActiveSubjectProgress()`                                                |
| `MissionRepository`  | `findCurrentForPlayer()`, `getCompletedCountForLevel()`                                           |
| `SubjectRepository`  | `getLevelDefinitions()`                                                                           |
| `QuestionRepository` | `getInventoryCounts()`, `getBySubjectLevel()`, `getUnseenByLevel()`, `getChallengeTypeCoverage()` |
| `MasteryRepository`  | `getByPlayerAndSubject()`                                                                         |

### Migrations needed

```sql
-- player_subject_progress
CREATE TABLE player_subject_progress (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL,
  subject_id TEXT NOT NULL,
  current_level INTEGER NOT NULL DEFAULT 1,
  max_level INTEGER NOT NULL,
  mastery_score REAL NOT NULL DEFAULT 0,
  retention_score REAL NOT NULL DEFAULT 0,
  successful_encounter_count INTEGER NOT NULL DEFAULT 0,
  review_encounter_count INTEGER NOT NULL DEFAULT 0,
  practical_encounter_count INTEGER NOT NULL DEFAULT 0,
  distinct_study_session_count INTEGER NOT NULL DEFAULT 0,
  boss_status TEXT NOT NULL DEFAULT 'locked',
  started_at INTEGER NOT NULL,
  completed_at INTEGER
);

-- question_generation_jobs
CREATE TABLE question_generation_jobs (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  subject_level INTEGER NOT NULL,
  requested_quantity INTEGER NOT NULL,
  approved_quantity INTEGER NOT NULL DEFAULT 0,
  rejected_quantity INTEGER NOT NULL DEFAULT 0,
  duplicate_quantity INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER
);

-- question_inventory_snapshots (periodic health check records)
CREATE TABLE question_inventory_snapshots (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL,
  subject_level INTEGER NOT NULL,
  approved_count INTEGER NOT NULL,
  unseen_count INTEGER NOT NULL,
  health TEXT NOT NULL,
  recorded_at INTEGER NOT NULL
);
```

### Playable vertical slice

The complete loop:

```
1. Player opens Command Centre
    ↓
2. Current quest displayed (real DB data)
    ↓
3. Player clicks CONTINUE QUEST
    ↓
4. Play page loads with active mission
    ↓
5. Player answers question
    ↓
6. Answer evaluated, XP + mastery updated
    ↓
7. Reward result appears
    ↓
8. Player returns to Command Centre
    ↓
9. XP bar updated, quest progress advanced, world node reflects change
```

### Verification

```bash
npm run verify
npm run verify:full
```

Manual E2E check: walk through the vertical slice.

---

## Phrase Sequencing Summary

```
P1  Audit + docs          │ Done
P2  Subject levels        │ Needed before HUD shows subject progress
P3  View models + fixtures│ Needed before any component code
P4  Persistent HUD        │ First visible output (replace layout + home)
P5  Current quest panel   │ Requires P3, P4
P6  Campaign rail + world │ Requires P3, P4
P7  Inspector + dock      │ Requires P5, P6
P8  Reward + guidance     │ Requires P5
P9  AI gateway + batch    │ Independent of P4–P8
P10 Inventory service     │ Requires P9
P11 Encounter Forge UI    │ Requires P9, P10
P12 Wire real state       │ Requires P2–P11
```

---

## Acceptance Checklist

- [ ] Home page looks like a game interface, not a marketing page
- [ ] Persistent HUD shows player level, XP, mastery, resources
- [ ] Current quest is the most prominent element
- [ ] Exactly one recommended action is visually dominant
- [ ] Campaign rail shows completed/current/locked progression
- [ ] World nodes distinguish: available, current, completed, locked, boss, review, reward
- [ ] Locked nodes explain requirements
- [ ] Quest inspector shows rewards, objectives, and prerequisites
- [ ] Player can launch a real encounter from the Command Centre
- [ ] Completing an encounter persists XP and mastery changes
- [ ] Returning to Command Centre shows updated world state
- [ ] Keyboard navigation works on world stage and HUD
- [ ] Reduced-motion mode supported
- [ ] Mobile and desktop layouts are deliberately designed
- [ ] Subject files define levels 1–X with gated requirements
- [ ] Player level and subject level are separate
- [ ] Subject progress requires encounters + mastery + coverage, not just XP
- [ ] Question bank health is monitored and displayed
- [ ] Batch generation produces validated, non-duplicate questions
- [ ] Encounter Forge shows generation progress
- [ ] Game remains playable during generation
- [ ] `npm run verify` passes
- [ ] `npm run verify:full` passes

---

_This plan defines Phase 9 (Command Centre & Question Supply). Each phrase is a shippable increment. Verification required before declaring any phrase complete._

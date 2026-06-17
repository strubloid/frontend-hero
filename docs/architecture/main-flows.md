# Main Flows — Use Case Orchestration

> Documenting the key orchestration flows that power Frontend Realms gameplay: mission start, answer submission, and review scheduling. These use cases exemplify the readable orchestration pattern — thin, delegating, and testable.

---

## Table of Contents

1. [Architecture Principle: Readable Orchestration](#1-architecture-principle-readable-orchestration)
2. [Flow 1: StartMissionUseCase](#2-flow-1-startmissionusecase)
3. [Flow 2: SubmitAnswerUseCase](#3-flow-2-submitanswerusecase)
4. [Flow 3: ReviewScheduleUseCase](#4-flow-3-reviewscheduleusecase)
5. [How Orchestration Stays Clean](#5-how-orchestration-stays-clean)
6. [Common Patterns Across Use Cases](#6-common-patterns-across-use-cases)

---

## 1. Architecture Principle: Readable Orchestration

Every use case in Frontend Realms follows the same pattern:

1. Accept an explicit request object.
2. Load necessary state from repositories (via interfaces, never concrete implementations).
3. Delegate decisions to specialist domain objects.
4. Persist results through repository interfaces.
5. Return an explicit result object.

**A use case should read like a sequence of business actions — not a procedural dump of database queries, AI prompts, scoring rules, and rendering logic.**

```typescript
// GOOD: Clear orchestration, delegated details
export class StartMissionUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly missionSelector: MissionSelector,
    private readonly questionProvider: QuestionProvider,
    private readonly missionRepository: MissionRepository,
  ) {}

  async execute(request: StartMissionRequest): Promise<StartMissionResult> {
    const player = await this.playerRepository.getById(request.playerId);
    const curriculum = await this.curriculumRepository.getBySubjectId(request.subjectId);
    const missionPlan = this.missionSelector.select({
      player,
      curriculum,
      requestedMode: request.mode,
    });
    const questions = await this.questionProvider.provideFor(missionPlan);
    const mission = missionPlan.createMission(questions);
    await this.missionRepository.save(mission);
    return StartMissionResult.from(mission);
  }
}
```

```typescript
// BAD: Everything in one place — unreadable, untestable
async function startMission(playerId: string, subjectId: string, mode: string) {
  const db = getDatabase();
  const player = await db.query("SELECT * FROM players WHERE id = $1", [playerId]);
  const concepts = await db.query("SELECT * FROM concepts WHERE subject_id = $1", [subjectId]);
  // ... 200 more lines of mixed DB, AI, scoring, and rendering ...
}
```

---

## 2. Flow 1: StartMissionUseCase

**Purpose**: Create a new mission for a player based on their current knowledge state and curriculum position.

### Request Type

```typescript
// src/modules/missions/application/use-cases/start-mission/start-mission.request.ts
export interface StartMissionRequest {
  readonly playerId: string;
  readonly subjectId: string;
  readonly mode: MissionMode; // 'learning' | 'review' | 'boss' | 'daily' | 'free'
}
```

### Use Case Implementation

```typescript
// src/modules/missions/application/use-cases/start-mission/start-mission.use-case.ts
import { PlayerRepository } from "@/modules/players/domain/repositories/player-repository";
import { CurriculumRepository } from "@/modules/curriculum/domain/repositories/curriculum-repository";
import { MissionSelector } from "@/modules/missions/domain/services/mission-selector";
import { QuestionProvider } from "@/modules/questions/domain/services/question-provider";
import { MissionRepository } from "@/modules/missions/domain/repositories/mission-repository";
import { StartMissionRequest } from "./start-mission.request";
import { StartMissionResult } from "./start-mission.result";
import { PlayerNotFoundError } from "@/modules/players/domain/errors/player-not-found.error";
import { SubjectNotFoundError } from "@/modules/curriculum/domain/errors/subject-not-found.error";
import { NoAvailableMissionsError } from "@/modules/missions/domain/errors/no-available-missions.error";

export class StartMissionUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly curriculumRepository: CurriculumRepository,
    private readonly missionSelector: MissionSelector,
    private readonly questionProvider: QuestionProvider,
    private readonly missionRepository: MissionRepository,
  ) {}

  async execute(request: StartMissionRequest): Promise<StartMissionResult> {
    // 1. Load state
    const player = await this.playerRepository.getById(request.playerId);
    if (!player) {
      throw new PlayerNotFoundError(request.playerId);
    }

    const curriculum = await this.curriculumRepository.getBySubjectId(request.subjectId);
    if (!curriculum) {
      throw new SubjectNotFoundError(request.subjectId);
    }

    // 2. Delegate mission selection to specialist
    const missionPlan = this.missionSelector.select({
      player,
      curriculum,
      requestedMode: request.mode,
    });

    if (!missionPlan) {
      throw new NoAvailableMissionsError(request.playerId, request.subjectId, request.mode);
    }

    // 3. Delegate question gathering to specialist
    const questions = await this.questionProvider.provideFor(missionPlan);

    // 4. Create and persist the mission
    const mission = missionPlan.createMission(questions);
    await this.missionRepository.save(mission);

    // 5. Return result
    return StartMissionResult.from(mission);
  }
}
```

### Result Type

```typescript
// src/modules/missions/application/use-cases/start-mission/start-mission.result.ts
export interface StartMissionResult {
  readonly missionId: string;
  readonly missionType: string;
  readonly title: string;
  readonly description: string;
  readonly questionCount: number;
  readonly estimatedDurationMinutes: number;
  readonly conceptIds: string[];
}
```

### Specialist Objects Used

| Object                 | Responsibility                                                        | Module     |
| ---------------------- | --------------------------------------------------------------------- | ---------- |
| `PlayerRepository`     | Load player state, mastery scores                                     | players    |
| `CurriculumRepository` | Load concept graph, prerequisites                                     | curriculum |
| `MissionSelector`      | Determine what mission to create based on player state and curriculum | missions   |
| `QuestionProvider`     | Source questions (stored or AI-generated) for the mission plan        | questions  |
| `MissionRepository`    | Persist the created mission                                           | missions   |

### What the Use Case Does NOT Do

- ❌ Does not query the database directly
- ❌ Does not call the AI provider
- ❌ Does not calculate mastery scores
- ❌ Does not render UI
- ❌ Does not validate question formats
- ❌ Does not contain any business rules about mission selection

---

## 3. Flow 2: SubmitAnswerUseCase

**Purpose**: Process a player's answer submission — evaluate correctness, update mastery, award XP, schedule review.

### Request Type

```typescript
// src/modules/missions/application/use-cases/submit-answer/submit-answer.request.ts
export interface SubmitAnswerRequest {
  readonly playerId: string;
  readonly missionId: string;
  readonly questionId: string;
  readonly answer: PlayerAnswer; // typed union per question type
  readonly answerTimeMs: number;
}
```

### Use Case Implementation

```typescript
// src/modules/missions/application/use-cases/submit-answer/submit-answer.use-case.ts
import { PlayerRepository } from "@/modules/players/domain/repositories/player-repository";
import { MissionRepository } from "@/modules/missions/domain/repositories/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/repositories/question-repository";
import { AnswerEvaluator } from "@/modules/questions/domain/services/answer-evaluator";
import { MasteryCalculator } from "@/modules/mastery/domain/services/mastery-calculator";
import { XpCalculator } from "@/modules/rewards/domain/services/xp-calculator";
import { ReviewScheduler } from "@/modules/reviews/domain/services/review-scheduler";
import { SubmitAnswerRequest } from "./submit-answer.request";
import { SubmitAnswerResult } from "./submit-answer.result";

export class SubmitAnswerUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly missionRepository: MissionRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly answerEvaluator: AnswerEvaluator,
    private readonly masteryCalculator: MasteryCalculator,
    private readonly xpCalculator: XpCalculator,
    private readonly reviewScheduler: ReviewScheduler,
  ) {}

  async execute(request: SubmitAnswerRequest): Promise<SubmitAnswerResult> {
    // 1. Load state
    const player = await this.playerRepository.getById(request.playerId);
    const mission = await this.missionRepository.getById(request.missionId);
    const question = await this.questionRepository.getById(request.questionId);

    // 2. Evaluate the answer (delegated to specialist)
    const evaluation = this.answerEvaluator.evaluate(question, request.answer);

    // 3. Update mastery (delegated to specialist)
    const conceptId = question.conceptId;
    const currentMastery = player.getConceptMastery(conceptId);
    const updatedMastery = this.masteryCalculator.calculate({
      currentMastery,
      evaluation,
      answerTimeMs: request.answerTimeMs,
    });

    // 4. Award XP (delegated to specialist)
    const xpAward = this.xpCalculator.calculate({
      evaluation,
      masteryImprovement: updatedMastery.score - currentMastery.score,
    });

    // 5. Schedule review (delegated to specialist)
    const reviewEntry = this.reviewScheduler.schedule({
      playerId: request.playerId,
      conceptId,
      evaluation,
      updatedMastery,
    });

    // 6. Persist all changes
    player.updateMastery(conceptId, updatedMastery);
    player.addXp(xpAward);
    mission.recordAttempt(question.id, evaluation, xpAward);

    await this.playerRepository.save(player);
    await this.missionRepository.save(mission);
    await this.reviewScheduler.save(reviewEntry);

    // 7. Return result
    return SubmitAnswerResult.from({
      evaluation,
      updatedMastery,
      xpAward,
      missionProgress: mission.progress,
      nextReviewAt: reviewEntry.scheduledAt,
    });
  }
}
```

### Result Type

```typescript
// src/modules/missions/application/use-cases/submit-answer/submit-answer.result.ts
export interface SubmitAnswerResult {
  readonly correct: boolean;
  readonly evaluation: EvaluationDetail;
  readonly masteryChange: MasteryChange;
  readonly xpAwarded: number;
  readonly missionProgress: MissionProgress;
  readonly nextReviewAt: Date | null;
  readonly conceptFeedback: ConceptFeedback;
}
```

### Specialist Objects Used

| Object              | Responsibility                                 | Module    |
| ------------------- | ---------------------------------------------- | --------- |
| `AnswerEvaluator`   | Evaluate correctness per question type         | questions |
| `MasteryCalculator` | Update mastery score based on answer quality   | mastery   |
| `XpCalculator`      | Calculate XP award from performance            | rewards   |
| `ReviewScheduler`   | Determine when concept should be reviewed next | reviews   |
| `PlayerRepository`  | Persist player state changes                   | players   |
| `MissionRepository` | Record attempt on mission                      | missions  |

### Error Handling

```typescript
// The use case handles these domain errors:
// - PlayerNotFoundError (player doesn't exist)
// - MissionNotFoundError (mission doesn't exist)
// - QuestionNotFoundError (question doesn't exist)
// - MissionExpiredError (mission time limit exceeded)
// - QuestionAlreadyAnsweredError (duplicate submission)
```

---

## 4. Flow 3: ReviewScheduleUseCase

**Purpose**: Determine which concepts are due for review, prioritize them, and create a review session for the player.

### Request Type

```typescript
// src/modules/reviews/application/use-cases/run-review-schedule/run-review-schedule.request.ts
export interface RunReviewScheduleRequest {
  readonly playerId: string;
  readonly maxReviews?: number; // default: 10
  readonly includeWeakPrerequisites?: boolean; // default: true
}
```

### Use Case Implementation

```typescript
// src/modules/reviews/application/use-cases/run-review-schedule/run-review-schedule.use-case.ts
import { PlayerRepository } from "@/modules/players/domain/repositories/player-repository";
import { ReviewRepository } from "@/modules/reviews/domain/repositories/review-repository";
import { ReviewPrioritizer } from "@/modules/reviews/domain/services/review-prioritizer";
import { WeaknessDetector } from "@/modules/mastery/domain/services/weakness-detector";
import { QuestionProvider } from "@/modules/questions/domain/services/question-provider";
import { MissionFactory } from "@/modules/missions/domain/services/mission-factory";
import { RunReviewScheduleRequest } from "./run-review-schedule.request";
import { RunReviewScheduleResult } from "./run-review-schedule.result";

export class RunReviewScheduleUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly reviewPrioritizer: ReviewPrioritizer,
    private readonly weaknessDetector: WeaknessDetector,
    private readonly questionProvider: QuestionProvider,
    private readonly missionFactory: MissionFactory,
  ) {}

  async execute(request: RunReviewScheduleRequest): Promise<RunReviewScheduleResult> {
    // 1. Load player and review state
    const player = await this.playerRepository.getById(request.playerId);
    const dueReviews = await this.reviewRepository.getDueReviews(request.playerId);
    const weakConcepts = request.includeWeakPrerequisites
      ? this.weaknessDetector.detect(player.conceptMasteries)
      : [];

    // 2. Prioritize which concepts to review now
    const prioritized = this.reviewPrioritizer.prioritize({
      dueReviews,
      weakConcepts,
      limit: request.maxReviews ?? 10,
    });

    if (prioritized.length === 0) {
      return RunReviewScheduleResult.empty();
    }

    // 3. Create a review mission from prioritized concepts
    const questions = await this.questionProvider.provideForConcepts(prioritized);
    const reviewMission = this.missionFactory.createReviewMission({
      player,
      concepts: prioritized,
      questions,
    });

    // 4. Start the review session
    await this.reviewRepository.saveReviewSession(reviewMission);

    // 5. Return the review session
    return RunReviewScheduleResult.from({
      reviewMission,
      reviewedConceptCount: prioritized.length,
      weakConceptCount: weakConcepts.length,
    });
  }
}
```

### Result Type

```typescript
// src/modules/reviews/application/use-cases/run-review-schedule/run-review-schedule.result.ts
export interface RunReviewScheduleResult {
  readonly hasReviewsDue: boolean;
  readonly reviewMission: ReviewMission | null;
  readonly reviewedConceptCount: number;
  readonly weakConceptCount: number;
  readonly reviewSummary: ReviewSummary;
}
```

### Specialist Objects Used

| Object              | Responsibility                                 | Module    |
| ------------------- | ---------------------------------------------- | --------- |
| `ReviewRepository`  | Load due reviews, save review sessions         | reviews   |
| `ReviewPrioritizer` | Sort by urgency, weakness, learning value      | reviews   |
| `WeaknessDetector`  | Identify concepts below mastery threshold      | mastery   |
| `QuestionProvider`  | Source appropriate questions for each concept  | questions |
| `MissionFactory`    | Create a review mission from selected concepts | missions  |

### Scheduling Algorithm (Delegated to ReviewPrioritizer)

The `ReviewPrioritizer` sorts concepts by a composite score:

```
priority = (decay_urgency × 0.4) +
           (weakness_penalty × 0.3) +
           (prerequisite_weight × 0.2) +
           (freshness_penalty × 0.1)
```

Where:

- `decay_urgency`: How overdue the review is (exponential based on scheduled vs. current time).
- `weakness_penalty`: How low the mastery score is (higher priority for weaker concepts).
- `prerequisite_weight`: Concepts that block other concepts get higher priority.
- `freshness_penalty`: Concepts seen very recently get lower priority (prevents over-review).

---

## 5. How Orchestration Stays Clean

### 5.1 Delegation to Specialist Objects

Each use case composes 4–7 specialist objects. The use case:

- **Loads state** from repositories (interfaces in domain layer).
- **Calls specialists** to make decisions.
- **Persists results** through repositories.
- **Returns a result** — never renders anything.

### 5.2 What Specialists Are (and Are Not)

| Specialist          | Is                                              | Is Not                   |
| ------------------- | ----------------------------------------------- | ------------------------ |
| `MissionSelector`   | A domain service that applies selection rules   | A database query         |
| `AnswerEvaluator`   | A domain service typed per question type        | A giant switch statement |
| `MasteryCalculator` | A pure function of (currentMastery, evaluation) | An AI prompt             |
| `ReviewScheduler`   | An algorithm applying spaced-repetition logic   | A random selection       |

### 5.3 Testing Benefits

Because orchestration is delegated:

- `MasteryCalculator` can be unit-tested in isolation with no database, no React, no AI.
- `ReviewScheduler` can be tested with deterministic fixture data.
- Use cases can be integration-tested with mocked repositories.
- Specialist objects can be swapped (fake implementations for testing).

### 5.4 What Breaks Readable Orchestration

These patterns are prohibited:

- **Giant switch statements on type**: Use polymorphism (specialist implementations) instead.
- **Repository method doing business logic**: Repositories load and save — they don't calculate.
- **Use case calling AI directly**: Use cases call `QuestionProvider` which may use AI — the use case doesn't know.
- **Use case containing rendering logic**: Presentation belongs in view models and components.
- **Mixed concerns**: A use case for starting a mission should not also handle answer evaluation.

---

## 6. Common Patterns Across Use Cases

### 6.1 Request-Result Pattern

Every use case has an explicit request type and result type, each in its own file alongside the use case.

```
use-case-name/
├── my-use-case.use-case.ts
├── my-use-case.request.ts
└── my-use-case.result.ts
```

### 6.2 Error Handling Pattern

Domain errors are thrown from domain services and caught in the use case boundary. The use case may wrap them or let them propagate to an error handler.

```typescript
// Domain error (domain layer)
export class PlayerNotFoundError extends Error {
  constructor(playerId: string) {
    super(`Player not found: ${playerId}`);
    this.name = "PlayerNotFoundError";
  }
}
```

### 6.3 Transaction Boundary

The use case marks the transaction boundary. All repository operations within a single `execute()` call should succeed or fail together.

### 6.4 Logging

Use cases may accept a logger interface for structured logging:

```typescript
constructor(
    private readonly logger: Logger,
    // ...repositories and services
) {}
```

---

**Related Documents**:

- [System Overview](./system-overview.md) — High-level architecture
- [Module Boundaries](./module-boundaries.md) — Module responsibilities and rules
- [Extension Points](./extension-points.md) — How to add new types and providers
- [Testing Strategy](../testing/testing-strategy.md) — How these flows are tested

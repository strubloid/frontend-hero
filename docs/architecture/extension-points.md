# Extension Points

> Documented contracts for extending Frontend Realms with new subjects, question types, mission types, AI providers, reward types, progression rules, evaluation strategies, game-world regions, review algorithms, storage implementations, and visual themes.

---

## Table of Contents

1. [Extension Philosophy](#1-extension-philosophy)
2. [Extension Point 1: New Subjects](#2-extension-point-1-new-subjects)
3. [Extension Point 2: New Question Types](#3-extension-point-2-new-question-types)
4. [Extension Point 3: New Mission Types](#4-extension-point-3-new-mission-types)
5. [Extension Point 4: New AI Providers](#5-extension-point-4-new-ai-providers)
6. [Extension Point 5: New Reward Types](#6-extension-point-5-new-reward-types)
7. [Extension Point 6: New Progression Rules](#7-extension-point-6-new-progression-rules)
8. [Extension Point 7: New Evaluation Strategies](#8-extension-point-7-new-evaluation-strategies)
9. [Extension Point 8: New Game-World Regions](#9-extension-point-8-new-game-world-regions)
10. [Extension Point 9: New Review Algorithms](#10-extension-point-9-new-review-algorithms)
11. [Extension Point 10: New Storage Implementations](#11-extension-point-10-new-storage-implementations)
12. [Extension Point 11: New Visual Themes](#12-extension-point-11-new-visual-themes)
13. [QuestionTypeModule Interface — Detailed Example](#13-questiontypemodule-interface--detailed-example)

---

## 1. Extension Philosophy

Frontend Realms is designed to be extended without modifying existing core code. The pattern is always:

```
1. Define a contract (interface or abstract base) in the domain layer.
2. Implement the contract in a new file or module.
3. Register the implementation with a registry or dependency injection.
4. Test the implementation.
5. Update documentation.
```

**Rule of thumb**: If adding something new requires editing more than 3 existing files, the extension design is wrong. The ideal extension requires:

- 1 new file (the implementation)
- 1 registration line
- 1 test file
- 0 edits to existing domain logic

### What Never Changes

These core engine files must never be edited to support extensions:

- `MasteryCalculator`
- `ReviewScheduler.algorithm`
- `MissionSelector.selectionLogic`
- `ProgressionEngine`
- `AnswerEvaluator` core dispatch
- Core use cases (`StartMissionUseCase`, `SubmitAnswerUseCase`)

---

## 2. Extension Point 1: New Subjects

### Contract

Subjects are loaded from Markdown files under `subjects/`. The format is defined by the subject schema:

```typescript
// src/modules/subjects/domain/entities/subject-file.ts
export interface SubjectFileSchema {
  readonly id: string;
  readonly title: string;
  readonly version: number;
  readonly schemaVersion: number;
  readonly description: string;
  readonly minimumGameVersion: string;
  readonly domains: SubjectDomain[];
}

export interface SubjectDomain {
  readonly name: string;
  readonly concepts: SubjectConcept[];
}

export interface SubjectConcept {
  readonly id: string;
  readonly level: string; // 'foundation' | 'intermediate' | 'advanced' | 'senior'
  readonly difficulty: number; // 1-10
  readonly prerequisites: string[];
  readonly tags: string[];
  readonly outcomes: string[];
  readonly knowledge: string;
  readonly misconceptions: string[];
  readonly questions: QuestionSeed[];
}
```

### Steps to Add a Subject

1. Create a new Markdown file in `subjects/` (e.g., `subjects/react.md`).
2. Follow the subject file schema with frontmatter, domains, concepts, and question seeds.
3. No code changes required — the `SubjectImportService` parses the file automatically.
4. Run `npm run test:unit` to validate parsing.

### What You Do NOT Need to Do

- ❌ Do not modify any TypeScript files.
- ❌ Do not add imports or register the subject anywhere.
- ❌ Do not create database migrations for the subject content.

### Validation

The `SubjectSchemaValidator` checks:

- Required frontmatter fields.
- Valid concept identifiers (format: `subject.concept-name`).
- All prerequisite references resolve to existing concepts.
- Difficulty within 1–10 range.
- No duplicate concept IDs.
- Content type requirements per schema version.

---

## 3. Extension Point 2: New Question Types

### Contract: QuestionTypeModule

```typescript
// src/modules/questions/domain/interfaces/question-type-module.ts
export interface QuestionTypeModule {
  /** Returns the unique question type identifier */
  getType(): QuestionType;

  /** Creates an evaluator for this question type */
  createEvaluator(): QuestionEvaluator;

  /** Creates a validator for this question type's content */
  createValidator(): QuestionValidator;

  /** Creates a renderer configuration for the presentation layer */
  createRendererConfig(): QuestionRendererConfig;
}

// Supporting interfaces
export interface QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult;
  getExpectedAnswerFormat(): AnswerFormat;
}

export interface QuestionValidator {
  validate(question: Question): ValidationResult;
  validateSeed(seed: QuestionSeed): ValidationResult;
}

export interface QuestionRendererConfig {
  readonly componentName: string;
  readonly inputType: "selection" | "text" | "code" | "order" | "explanation";
  readonly supportsHints: boolean;
  readonly supportsPartialCredit: boolean;
}
```

### Steps to Add a Question Type

1. Create a new directory under the questions module (e.g., `questions/presentation/components/drag-and-drop-question/`).
2. Implement `QuestionTypeModule` interface.
3. Create `QuestionEvaluator` implementation with type-specific logic.
4. Create `QuestionValidator` implementation.
5. Create React component(s) for rendering.
6. Register in the question type registry.
7. Add the new `QuestionType` enum value.
8. Write tests for the evaluator, validator, and component.

### Registration

```typescript
// src/modules/questions/infrastructure/configuration/question-type-registry.ts
export class QuestionTypeRegistry {
  private readonly modules = new Map<QuestionType, QuestionTypeModule>();

  register(module: QuestionTypeModule): void {
    const type = module.getType();
    if (this.modules.has(type)) {
      throw new DuplicateQuestionTypeRegistrationError(type);
    }
    this.modules.set(type, module);
  }

  getModule(type: QuestionType): QuestionTypeModule {
    const module = this.modules.get(type);
    if (!module) {
      throw new UnsupportedQuestionTypeError(type);
    }
    return module;
  }

  getAllTypes(): QuestionType[] {
    return Array.from(this.modules.keys());
  }
}
```

### Existing Question Types

| Type                    | Evaluator                 | Validator                 | Component                |
| ----------------------- | ------------------------- | ------------------------- | ------------------------ |
| `multiple-choice`       | `MultipleChoiceEvaluator` | `MultipleChoiceValidator` | `MultipleChoiceQuestion` |
| `multiple-select`       | `MultipleSelectEvaluator` | `MultipleSelectValidator` | `MultipleSelectQuestion` |
| `true-false`            | `TrueFalseEvaluator`      | `TrueFalseValidator`      | `TrueFalseQuestion`      |
| `code-prediction`       | `CodePredictionEvaluator` | `CodePredictionValidator` | `CodePredictionQuestion` |
| `bug-hunt`              | `BugHuntEvaluator`        | `BugHuntValidator`        | `BugHuntQuestion`        |
| `refactoring`           | `RefactoringEvaluator`    | `RefactoringValidator`    | `RefactoringQuestion`    |
| `architecture-decision` | `ArchitectureEvaluator`   | `ArchitectureValidator`   | `ArchitectureQuestion`   |
| `explain-it`            | `ExplainItEvaluator`      | `ExplainItValidator`      | `ExplainItQuestion`      |
| `fill-in-blank`         | `FillInBlankEvaluator`    | `FillInBlankValidator`    | `FillInBlankQuestion`    |
| `order-steps`           | `OrderStepsEvaluator`     | `OrderStepsValidator`     | `OrderStepsQuestion`     |

---

## 4. Extension Point 3: New Mission Types

### Contract

```typescript
// src/modules/missions/domain/interfaces/mission-type-module.ts
export interface MissionTypeModule {
  getType(): MissionType;
  createSelector(): MissionSelectorStrategy;
  createFactory(): MissionFactoryStrategy;
  createProgressTracker(): MissionProgressTracker;
}
```

### Steps to Add a Mission Type

1. Implement `MissionTypeModule` with selector, factory, and progress tracker.
2. Register in the mission type registry.
3. Create any new domain services needed for the mission flow.
4. Add presentation components if the mission type has unique UI needs.
5. Write tests.

### Existing Mission Types

| Type         | Description                  | Selection Strategy        |
| ------------ | ---------------------------- | ------------------------- |
| `learning`   | Standard concept learning    | `ConceptBasedSelection`   |
| `review`     | Concept review from schedule | `ReviewPrioritySelection` |
| `boss`       | Multi-phase boss battle      | `BossSelection`           |
| `daily`      | Daily quick session          | `DailyChallengeSelection` |
| `free`       | Free-form practice           | `FreePracticeSelection`   |
| `diagnostic` | Initial skill assessment     | `DiagnosticSelection`     |

---

## 5. Extension Point 4: New AI Providers

### Contract

```typescript
// src/modules/artificial-intelligence/domain/interfaces/artificial-intelligence-gateway.ts
export interface ArtificialIntelligenceGateway {
  generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult>;
  evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResult>;
  generateExplanation(request: GenerateExplanationRequest): Promise<GenerateExplanationResult>;
  generateHint(request: GenerateHintRequest): Promise<GenerateHintResult>;
  generateMission(request: GenerateMissionRequest): Promise<GenerateMissionResult>;
  isAvailable(): boolean;
  getProviderName(): string;
}
```

### Steps to Add a Provider

1. Create a new directory under `artificial-intelligence/infrastructure/` (e.g., `openai/`).
2. Implement `ArtificialIntelligenceGateway` interface.
3. Create configuration types for the new provider.
4. Create request builder, response parser, response validator.
5. Create retry policy and error mapper.
6. Register in the gateway factory.
7. Update environment configuration to support the new provider.
8. Write tests including fallback scenarios.

### Registration

```typescript
// src/modules/artificial-intelligence/infrastructure/gateway-factory.ts
export class ArtificialIntelligenceGatewayFactory {
  constructor(
    private readonly environment: ServerEnvironment,
    private readonly logger: Logger,
  ) {}

  create(): ArtificialIntelligenceGateway {
    const provider = this.environment.get("AI_PROVIDER");

    switch (provider) {
      case "big-pickle":
        return new BigPickle(
          new BigPickleClient(this.environment, this.logger),
          new BigPickleResponseValidator(),
          new BigPickleRetryPolicy(this.environment),
          this.logger,
        );
      case "openai":
      // Future: return new OpenAIProvider(...);
      case "anthropic":
      // Future: return new AnthropicProvider(...);
      default:
        throw new UnsupportedAiProviderError(provider);
    }
  }
}
```

### Provider-Neutral Design Rules

- No feature may call a provider directly — always through `ArtificialIntelligenceGateway`.
- No provider-switch conditionals throughout the application (only in the factory).
- Every provider must handle unavailability gracefully.
- Every provider must validate responses before consuming them.
- Provider configuration is in environment variables, never hardcoded.

---

## 6. Extension Point 5: New Reward Types

### Contract

```typescript
// src/modules/rewards/domain/interfaces/reward-type-module.ts
export interface RewardTypeModule {
  getType(): RewardType;
  createDeliverer(): RewardDeliverer;
  createConditionChecker(): RewardConditionChecker;
  getDisplayConfig(): RewardDisplayConfig;
}

export interface RewardDeliverer {
  deliver(player: Player, reward: Reward): Promise<DeliveryResult>;
}

export interface RewardConditionChecker {
  check(player: Player, achievement: Achievement): ConditionResult;
}
```

### Steps to Add a Reward Type

1. Implement `RewardTypeModule`.
2. Create deliverer logic.
3. Create condition checker (if achievement-based).
4. Register in reward type registry.
5. Add presentation components.
6. Write tests.

### Existing Reward Types

| Type              | Description         | Example                 |
| ----------------- | ------------------- | ----------------------- |
| `xp`              | Experience points   | +500 XP                 |
| `achievement`     | Achievement badge   | "First Bug Hunt"        |
| `title`           | Player title        | "Bug Squasher"          |
| `cosmetic`        | Visual cosmetic     | Dark theme              |
| `region-unlock`   | World region access | Unlocks "Next.js Nexus" |
| `cosmetic-effect` | Visual effect       | Code trail animation    |

---

## 7. Extension Point 6: New Progression Rules

### Contract

```typescript
// src/modules/progression/domain/interfaces/progression-rule-module.ts
export interface ProgressionRuleModule {
  getRuleId(): string;
  evaluate(player: Player, context: ProgressionContext): RuleEvaluationResult;
  getAffectedActions(): ProgressionAction[];
}
```

### Steps to Add a Progression Rule

1. Implement `ProgressionRuleModule`.
2. Register in the progression rule registry.
3. Write tests with deterministic inputs and expected outputs.

### Existing Progression Rules

| Rule                 | Description                         |
| -------------------- | ----------------------------------- |
| `mastery-gate`       | Requires minimum mastery to proceed |
| `prerequisite-chain` | All prerequisites must be met       |
| `level-gate`         | Minimum player level required       |
| `region-completion`  | Previous region must be completed   |
| `streak-milestone`   | Streak-based unlock                 |
| `total-xp-threshold` | Cumulative XP required              |

---

## 8. Extension Point 7: New Evaluation Strategies

### Contract

```typescript
// src/modules/questions/domain/interfaces/evaluation-strategy.ts
export interface EvaluationStrategy {
  getStrategyName(): string;
  evaluate(question: Question, answer: PlayerAnswer, context?: EvaluationContext): EvaluationResult;
  supportsQuestionType(type: QuestionType): boolean;
}
```

### Steps to Add an Evaluation Strategy

1. Implement `EvaluationStrategy`.
2. Register in the evaluation strategy registry.
3. Write tests.

### Existing Strategies

| Strategy              | Description                          | Used For                    |
| --------------------- | ------------------------------------ | --------------------------- |
| `exact-match`         | Exact string comparison              | Multiple choice, true/false |
| `semantic-similarity` | AI-assisted semantic evaluation      | Explain-it questions        |
| `code-match`          | Code output comparison               | Code prediction             |
| `partial-credit`      | Partial credit for partially correct | Multiple select             |
| `order-match`         | Correct ordering check               | Order steps                 |
| `pattern-match`       | Regex or pattern matching            | Fill in blank               |

---

## 9. Extension Point 8: New Game-World Regions

### Contract

Regions are defined in configuration, not hardcoded:

```typescript
// src/modules/game-world/domain/entities/region.ts
export interface Region {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly position: WorldPosition;
  readonly prerequisites: RegionPrerequisite[];
  readonly subjectIds: string[];
  readonly missionTypes: MissionType[];
  readonly rewards: RegionReward[];
  readonly narrativeIntro: string;
  readonly visualTheme: string;
}
```

### Steps to Add a Region

1. Add region configuration (can be a data file or database seed).
2. No domain logic changes required.
3. Create narrative content for the region.
4. Define gate prerequisites.
5. Write integration tests.

### Existing Regions (13 Realms)

| Region                     | Subject          | Difficulty |
| -------------------------- | ---------------- | ---------- |
| The JavaScript Foundations | JavaScript       | 1          |
| The TypeScript Citadel     | TypeScript       | 2          |
| The React Reactor          | React            | 3          |
| The Rendering Frontier     | Rendering        | 4          |
| The Next.js Nexus          | Next.js          | 5          |
| The State Labyrinth        | State Management | 4          |
| The Network Depths         | Network          | 5          |
| The Testing Grounds        | Testing          | 5          |
| The Performance Wastes     | Performance      | 6          |
| The Security Fortress      | Security         | 6          |
| The Architecture Council   | Architecture     | 7          |
| The Production Abyss       | Production       | 8          |
| The Senior Engineer Summit | Senior           | 9          |

---

## 10. Extension Point 9: New Review Algorithms

### Contract

```typescript
// src/modules/reviews/domain/interfaces/review-algorithm.ts
export interface ReviewAlgorithm {
  getAlgorithmName(): string;
  calculateNextReview(
    currentSchedule: ReviewSchedule,
    evaluation: EvaluationResult,
  ): NextReviewResult;
  calculateInitialInterval(difficulty: number, performance: EvaluationResult): number; // in days
}
```

### Steps to Add a Review Algorithm

1. Implement `ReviewAlgorithm`.
2. Register in the review algorithm registry.
3. Write algorithm tests with known inputs/outputs.

### Existing Algorithms

| Algorithm             | Description                    |
| --------------------- | ------------------------------ |
| `sm-2-variant`        | Adapted SM-2 spaced repetition |
| `difficulty-weighted` | Difficulty-adjusted scheduling |
| `confidence-based`    | Confidence-scaled intervals    |

---

## 11. Extension Point 10: New Storage Implementations

### Contract

Every repository in the domain layer is an interface. Infrastructure implementations must satisfy these interfaces.

```typescript
// Example: PlayerRepository contract
export interface PlayerRepository {
  getById(id: string): Promise<Player | null>;
  getByEmail(email: string): Promise<Player | null>;
  save(player: Player): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
```

### Steps to Add a Storage Implementation

1. Implement the repository interface in `infrastructure/persistence/`.
2. Configure the binding in the dependency injection container or factory.
3. Write tests using the same test suite as other implementations.
4. Implement migrations if using a new database.

### Existing Storage Implementations

| Implementation              | Used For   | Database   |
| --------------------------- | ---------- | ---------- |
| `PostgresPlayerRepository`  | Production | PostgreSQL |
| `SqlitePlayerRepository`    | Dev/Test   | SQLite     |
| `InMemoryPlayerRepository`  | Unit Tests | Memory     |
| `PostgresMissionRepository` | Production | PostgreSQL |
| `SqliteMissionRepository`   | Dev/Test   | SQLite     |
| `InMemoryMissionRepository` | Unit Tests | Memory     |

---

## 12. Extension Point 11: New Visual Themes

### Contract

Themes are defined using design tokens and CSS custom properties:

```typescript
// src/shared/presentation/tokens/theme.ts
export interface VisualTheme {
  readonly id: string;
  readonly name: string;
  readonly tokens: ThemeTokens;
  readonly assets: ThemeAssets;
  readonly isDefault: boolean;
}

export interface ThemeTokens {
  readonly colors: Record<string, string>;
  readonly typography: Record<string, string>;
  readonly spacing: Record<string, string>;
  readonly elevation: Record<string, string>;
  readonly motion: Record<string, string>;
  readonly borders: Record<string, string>;
  readonly breakpoints: Record<string, string>;
}
```

### Steps to Add a Theme

1. Define theme token values in a SCSS/CSS module or configuration.
2. Add theme assets (images, icons, sounds) in `public/themes/`.
3. Register the theme in the theme registry.
4. Implement the theme switcher UI if applicable.
5. Test accessibility contrast ratios.
6. Test reduced-motion support.

### Existing Themes

| Theme         | Default? | Description                            |
| ------------- | -------- | -------------------------------------- |
| `dark-realm`  | Yes      | Dark atmospheric base theme            |
| `light-realm` | No       | Light theme (unlocked via achievement) |

---

## 13. QuestionTypeModule Interface — Detailed Example

Here is a complete example of implementing a new question type. This is the canonical reference for `QuestionTypeModule`.

### Step 1: Define the Question Type Enum Value

```typescript
// src/modules/questions/domain/enums/question-type.ts
export enum QuestionType {
  MultipleChoice = "multiple-choice",
  MultipleSelect = "multiple-select",
  TrueFalse = "true-false",
  CodePrediction = "code-prediction",
  BugHunt = "bug-hunt",
  Refactoring = "refactoring",
  ArchitectureDecision = "architecture-decision",
  ExplainIt = "explain-it",
  FillInBlank = "fill-in-blank",
  OrderSteps = "order-steps",
  // Add new type:
  DragAndDrop = "drag-and-drop", // <-- NEW
}
```

### Step 2: Implement QuestionTypeModule

```typescript
// src/modules/questions/infrastructure/question-types/drag-and-drop/drag-and-drop-question-type-module.ts
import { QuestionTypeModule } from "../../../domain/interfaces/question-type-module";
import { QuestionType } from "../../../domain/enums/question-type";
import { QuestionEvaluator } from "../../../domain/interfaces/question-evaluator";
import { QuestionValidator } from "../../../domain/interfaces/question-validator";
import { QuestionRendererConfig } from "../../../domain/interfaces/question-renderer-config";
import { DragAndDropEvaluator } from "./drag-and-drop-evaluator";
import { DragAndDropValidator } from "./drag-and-drop-validator";
import { DragAndDropRendererConfig } from "./drag-and-drop-renderer-config";

export class DragAndDropQuestionTypeModule implements QuestionTypeModule {
  getType(): QuestionType {
    return QuestionType.DragAndDrop;
  }

  createEvaluator(): QuestionEvaluator {
    return new DragAndDropEvaluator();
  }

  createValidator(): QuestionValidator {
    return new DragAndDropValidator();
  }

  createRendererConfig(): QuestionRendererConfig {
    return new DragAndDropRendererConfig();
  }
}
```

### Step 3: Implement the Evaluator

```typescript
// src/modules/questions/infrastructure/question-types/drag-and-drop/drag-and-drop-evaluator.ts
import { QuestionEvaluator } from "../../../domain/interfaces/question-evaluator";
import { Question } from "../../../domain/entities/question";
import { PlayerAnswer } from "../../../domain/value-objects/player-answer";
import { EvaluationResult } from "../../../domain/value-objects/evaluation-result";
import { AnswerFormat } from "../../../domain/enums/answer-format";

export class DragAndDropEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const correctOrder = question.correctAnswer as string[];
    const playerOrder = answer.value as string[];

    // Calculate positional accuracy
    let correctPositions = 0;
    for (let i = 0; i < correctOrder.length; i++) {
      if (playerOrder[i] === correctOrder[i]) {
        correctPositions++;
      }
    }

    const accuracy = correctPositions / correctOrder.length;
    const isCorrect = accuracy >= 0.8; // 80% threshold for "correct"

    return new EvaluationResult({
      isCorrect,
      score: accuracy,
      feedback: this.generateFeedback(accuracy, correctOrder, playerOrder),
    });
  }

  getExpectedAnswerFormat(): AnswerFormat {
    return AnswerFormat.OrderedList;
  }

  private generateFeedback(
    accuracy: number,
    correctOrder: string[],
    playerOrder: string[],
  ): string {
    // Type-specific feedback generation
    if (accuracy === 1) {
      return "All items placed in the correct order.";
    }
    const misplaced = correctOrder.filter((item, i) => playerOrder[i] !== item);
    return `You placed ${Math.round(accuracy * 100)}% correctly. Review the following items: ${misplaced.join(", ")}.`;
  }
}
```

### Step 4: Implement the Validator

```typescript
// src/modules/questions/infrastructure/question-types/drag-and-drop/drag-and-drop-validator.ts
import { QuestionValidator } from "../../../domain/interfaces/question-validator";
import { Question } from "../../../domain/entities/question";
import { QuestionSeed } from "../../../domain/entities/question-seed";
import { ValidationResult } from "../../../domain/value-objects/validation-result";

export class DragAndDropValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];

    if (!question.correctAnswer || !Array.isArray(question.correctAnswer)) {
      errors.push("Correct answer must be an ordered array for drag-and-drop questions.");
    }

    if (question.options && !Array.isArray(question.options)) {
      errors.push("Options must be an array for drag-and-drop questions.");
    }

    if (question.correctAnswer && question.correctAnswer.length < 2) {
      errors.push("Drag-and-drop questions require at least 2 items.");
    }

    return new ValidationResult({
      isValid: errors.length === 0,
      errors,
    });
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    // Validate a seed/question template
    const errors: string[] = [];
    if (!seed.dragItems || seed.dragItems.length < 2) {
      errors.push("Drag-and-drop seeds require at least 2 drag items.");
    }
    return new ValidationResult({
      isValid: errors.length === 0,
      errors,
    });
  }
}
```

### Step 5: Register the Module

```typescript
// In the question type registry initialization:
const registry = new QuestionTypeRegistry();
registry.register(new MultipleChoiceQuestionTypeModule());
registry.register(new DragAndDropQuestionTypeModule()); // <-- NEW
```

### Step 6: Create the Presentation Component

```typescript
// src/modules/questions/presentation/components/drag-and-drop-question/drag-and-drop-question.tsx
// (React component using drag-and-drop UI)
```

### What You Modify

| File                        | Change                                  |
| --------------------------- | --------------------------------------- |
| `question-type.ts`          | Add enum value                          |
| `question-type-registry.ts` | Add registration call                   |
| New files (4+)              | Module, evaluator, validator, component |

### What You Do NOT Modify

- `AnswerEvaluator` core dispatch — the registry handles dispatch.
- `MasteryCalculator` — remains unchanged.
- `ReviewScheduler` — remains unchanged.
- Any use case — all support new question types automatically.

---

**Related Documents**:

- [System Overview](./system-overview.md) — Architecture context
- [Module Boundaries](./module-boundaries.md) — Module responsibilities
- [Main Flows](./main-flows.md) — How use cases use these extensions
- [Testing Strategy](../testing/testing-strategy.md) — Testing extension points

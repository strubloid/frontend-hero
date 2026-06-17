# Module Boundaries

> Defines every module's responsibility, key types, and explicit constraints — what each module owns and what it must never do.

---

## Table of Contents

1. [Module Boundary Rules](#1-module-boundary-rules)
2. [players](#2-players)
3. [missions](#3-missions)
4. [questions](#4-questions)
5. [curriculum](#5-curriculum)
6. [mastery](#6-mastery)
7. [reviews](#7-reviews)
8. [rewards](#8-rewards)
9. [progression](#9-progression)
10. [game-world](#10-game-world)
11. [subjects](#11-subjects)
12. [artificial-intelligence](#12-artificial-intelligence)
13. [authentication](#13-authentication)
14. [testing-support](#14-testing-support)
15. [shared](#15-shared)
16. [SOLID Rules Applied to Modules](#16-solid-rules-applied-to-modules)

---

## 1. Module Boundary Rules

### Universal Rules

1. **Every module has four layers**: `application/`, `domain/`, `infrastructure/`, `presentation/`.
2. **Dependency direction**: `presentation → application → domain ← infrastructure`. Domain is innermost with zero framework dependencies.
3. **Module A may depend on Module B's domain layer** (interfaces, entities, value objects) but **never on Module B's infrastructure** or **presentation**.
4. **Cross-module communication** occurs through:
   - Domain events (published/subscribed via an event bus).
   - Repository interfaces defined in one module and implemented in another.
   - Shared domain types in `src/shared/domain/`.
5. **No circular dependencies** between modules. If module A depends on module B, module B must not depend on module A.
6. **One class/interface/enum per file**. No barrel files, no giant types files.
7. **Each module owns its data**. No module writes directly to another module's database tables.

---

## 2. players

### Purpose

Manage player identity, profile, authentication state, preferences, and base-level player data.

### Owns

- `Player` entity — player identity, authentication, profile data.
- `PlayerProfile` — display name, avatar, bio, preferences.
- `PlayerPreferences` — learning preferences, notification settings, theme.
- `PlayerSession` — active session tracking.
- `PlayerRepository` — interface for player data persistence.

### Key Types

| Type                       | Kind                 | Description                             |
| -------------------------- | -------------------- | --------------------------------------- |
| `Player`                   | Entity               | Core player identity and aggregate root |
| `PlayerProfile`            | Entity               | Player profile information              |
| `PlayerPreferences`        | Value Object         | Player settings and preferences         |
| `PlayerSession`            | Entity               | Authentication session                  |
| `PlayerRepository`         | Repository Interface | Contract for persistence                |
| `PlayerNotFoundError`      | Domain Error         | Player lookup failure                   |
| `PlayerAlreadyExistsError` | Domain Error         | Duplicate player registration           |

### Must NOT Do

- ❌ **Must not** calculate mastery, XP, or progression. Those belong to mastery, rewards, and progression modules.
- ❌ **Must not** contain mission or question logic.
- ❌ **Must not** access the curriculum or subject databases.
- ❌ **Must not** call the AI provider.
- ❌ **Must not** define question or mission types.

---

## 3. missions

### Purpose

Own the mission lifecycle — creation, execution, completion, and attempt tracking.

### Owns

- `Mission` entity — the aggregate root for a gameplay session.
- `MissionType` — enum of available mission types (learning, review, boss, daily, etc.).
- `MissionPlan` — the blueprint for a mission before questions are assigned.
- `MissionAttempt` — record of a player's answers within a mission.
- `MissionSelector` — domain service for determining what mission to create.
- `MissionFactory` — creates missions from plans.
- `MissionRepository` — interface for mission persistence.

### Key Types

| Type                       | Kind                 | Description                                   |
| -------------------------- | -------------------- | --------------------------------------------- |
| `Mission`                  | Entity               | Mission aggregate root                        |
| `MissionType`              | Enum                 | `learning`, `review`, `boss`, `daily`, `free` |
| `MissionPlan`              | Value Object         | Blueprint before question assignment          |
| `MissionAttempt`           | Entity               | Record per answer within a mission            |
| `MissionSelector`          | Domain Service       | Determines appropriate mission                |
| `MissionFactory`           | Domain Service       | Constructs missions from plans                |
| `MissionRepository`        | Repository Interface | Persistence contract                          |
| `MissionProgress`          | Value Object         | Completion status                             |
| `MissionExpiredError`      | Domain Error         | Mission beyond time limit                     |
| `NoAvailableMissionsError` | Domain Error         | No mission can be created                     |

### Must NOT Do

- ❌ **Must not** persist player data. That belongs to players module.
- ❌ **Must not** calculate mastery or XP. Delegates to mastery and rewards modules.
- ❌ **Must not** evaluate answers. Delegates to questions module.
- ❌ **Must not** schedule reviews. Delegates to reviews module.
- ❌ **Must not** generate questions. Delegates to questions module.
- ❌ **Must not** define subject or concept structures.
- ❌ **Must not** render UI.

---

## 4. questions

### Purpose

Own the question model, question types, validation, evaluation, deduplication, and sourcing.

### Owns

- `Question` entity — a question with its type, prompt, options, and correct answer.
- `QuestionType` — enum of question types (multiple-choice, code-prediction, bug-hunt, etc.).
- `QuestionSeed` — a template or seed for generating questions.
- `QuestionFingerprint` — semantic fingerprint for deduplication.
- `AnswerEvaluator` — domain service for evaluating correctness per question type.
- `QuestionValidator` — validates question content, options, and structure.
- `QuestionProvider` — domain service for sourcing questions (stored or generated).
- `QuestionRepository` — interface for question persistence.
- `QuestionTypeModule` — extension interface for new question types.

### Key Types

| Type                     | Kind                 | Description                                                                                                                                                             |
| ------------------------ | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Question`               | Entity               | Question aggregate root                                                                                                                                                 |
| `QuestionType`           | Enum                 | `multiple-choice`, `multiple-select`, `true-false`, `code-prediction`, `bug-hunt`, `refactoring`, `architecture-decision`, `explain-it`, `fill-in-blank`, `order-steps` |
| `QuestionSeed`           | Value Object         | Template for question generation                                                                                                                                        |
| `QuestionFingerprint`    | Value Object         | Deduplication fingerprint                                                                                                                                               |
| `AnswerEvaluator`        | Domain Service       | Evaluates answers per type                                                                                                                                              |
| `QuestionValidator`      | Domain Service       | Validates question structure                                                                                                                                            |
| `QuestionProvider`       | Domain Service       | Sources questions                                                                                                                                                       |
| `QuestionRepository`     | Repository Interface | Persistence contract                                                                                                                                                    |
| `QuestionTypeModule`     | Extension Interface  | Plugin interface for new types                                                                                                                                          |
| `DuplicateQuestionError` | Domain Error         | Near-duplicate detected                                                                                                                                                 |

### Must NOT Do

- ❌ **Must not** call the AI provider directly. Uses `QuestionProvider` which delegates to `ArtificialIntelligenceGateway` via infrastructure.
- ❌ **Must not** define mission structure or lifecycle.
- ❌ **Must not** calculate mastery or progression impact.
- ❌ **Must not** persist player answers to missions. That belongs to missions module.
- ❌ **Must not** render UI components.

---

## 5. curriculum

### Purpose

Own the curriculum model — subject parsing, concept graph, prerequisites, and learning outcomes.

### Owns

- `Subject` entity — a top-level subject (e.g., "Next.js", "TypeScript").
- `Domain` entity — a domain area within a subject (e.g., "JavaScript Foundations").
- `Concept` entity — individual concept (e.g., "Event Loop").
- `PrerequisiteGraph` — the graph of concept prerequisites.
- `LearningOutcome` — measurable outcome for a concept.
- `KnowledgeEntry` — knowledge content for a concept.
- `CurriculumRepository` — interface for curriculum access.

### Key Types

| Type                   | Kind                 | Description             |
| ---------------------- | -------------------- | ----------------------- |
| `Subject`              | Entity               | Top-level subject       |
| `Domain`               | Entity               | Domain within a subject |
| `Concept`              | Entity               | Individual concept      |
| `Prerequisite`         | Value Object         | Link between concepts   |
| `PrerequisiteGraph`    | Domain Service       | Graph operations        |
| `LearningOutcome`      | Value Object         | Measurable outcome      |
| `KnowledgeEntry`       | Value Object         | Knowledge content       |
| `CurriculumRepository` | Repository Interface | Persistence contract    |
| `SubjectNotFoundError` | Domain Error         | Subject lookup failure  |
| `ConceptNotFoundError` | Domain Error         | Concept lookup failure  |

### Must NOT Do

- ❌ **Must not** call the AI provider. Curriculum is parsed from subject files, not AI-generated.
- ❌ **Must not** generate questions. Questions module owns question creation.
- ❌ **Must not** calculate mastery or progression.
- ❌ **Must not** define mission types or game world regions.
- ❌ **Must not** render UI.

---

## 6. mastery

### Purpose

Own the mastery model — calculation, confidence scoring, retention estimation, and weakness detection.

### Owns

- `ConceptMastery` — mastery state for a single concept.
- `MasteryScore` — value object for mastery score (0–1).
- `ConfidenceLevel` — value object for confidence.
- `RetentionScore` — value object for retention estimate.
- `MasteryCalculator` — domain service for updating mastery.
- `WeaknessDetector` — domain service for finding weak concepts.
- `MasteryRepository` — interface for mastery persistence.

### Key Types

| Type                | Kind                 | Description                     |
| ------------------- | -------------------- | ------------------------------- |
| `ConceptMastery`    | Entity               | Mastery per concept             |
| `MasteryScore`      | Value Object         | Score normalized 0–1            |
| `ConfidenceLevel`   | Value Object         | `low`, `medium`, `high`         |
| `RetentionScore`    | Value Object         | Retention estimate              |
| `MasteryCalculator` | Domain Service       | Updates mastery from evaluation |
| `WeaknessDetector`  | Domain Service       | Identifies weak concepts        |
| `MasteryRepository` | Repository Interface | Persistence contract            |

### Must NOT Do

- ❌ **Must not** generate or evaluate questions.
- ❌ **Must not** schedule reviews. Delegates to reviews module.
- ❌ **Must not** award XP or rewards.
- ❌ **Must not** define mission types or game world.
- ❌ **Must not** call AI provider.
- ❌ **Must not** render UI.

---

## 7. reviews

### Purpose

Own the review scheduling system — spaced repetition algorithms, review prioritization, and review session management.

### Owns

- `ReviewSchedule` — schedule entry for a concept review.
- `ReviewEntry` — a single review record.
- `ReviewAlgorithm` — the spaced-repetition algorithm (e.g., SM-2 variant).
- `ReviewPrioritizer` — domain service for sorting due reviews.
- `ReviewRepository` — interface for review persistence.

### Key Types

| Type                | Kind                 | Description              |
| ------------------- | -------------------- | ------------------------ |
| `ReviewSchedule`    | Entity               | Schedule for a concept   |
| `ReviewEntry`       | Entity               | Single review record     |
| `ReviewAlgorithm`   | Domain Service       | Spaced repetition logic  |
| `ReviewPrioritizer` | Domain Service       | Prioritizes review queue |
| `ReviewRepository`  | Repository Interface | Persistence contract     |

### Must NOT Do

- ❌ **Must not** generate questions. Sources from questions module.
- ❌ **Must not** calculate mastery. Delegates to mastery module.
- ❌ **Must not** award XP or rewards.
- ❌ **Must not** define mission types.
- ❌ **Must not** render UI.

---

## 8. rewards

### Purpose

Own the rewards system — XP calculation, achievements, badges, titles, cosmetics, and reward delivery.

### Owns

- `XpAward` — value object for XP changes.
- `Achievement` — entity for an achievement definition.
- `PlayerAchievement` — record of player earning an achievement.
- `PlayerReward` — record of reward delivery.
- `XpCalculator` — domain service for calculating XP.
- `AchievementChecker` — domain service for checking achievement conditions.
- `RewardRepository` — interface for reward persistence.

### Key Types

| Type                 | Kind                 | Description                   |
| -------------------- | -------------------- | ----------------------------- |
| `XpAward`            | Value Object         | XP amount and reason          |
| `Achievement`        | Entity               | Achievement definition        |
| `PlayerAchievement`  | Entity               | Player's earned achievements  |
| `PlayerReward`       | Entity               | Delivered reward              |
| `XpCalculator`       | Domain Service       | Calculates XP from evaluation |
| `AchievementChecker` | Domain Service       | Evaluates conditions          |
| `RewardRepository`   | Repository Interface | Persistence contract          |
| `XpMultiplier`       | Value Object         | Multiplier for XP calculation |

### Must NOT Do

- ❌ **Must not** calculate mastery or progression.
- ❌ **Must not** define game world regions or mission types.
- ❌ **Must not** call AI provider.
- ❌ **Must not** render UI.

---

## 9. progression

### Purpose

Own the progression system — levels, gates, unlocks, difficulty scaling, and adaptation rules.

### Owns

- `ProgressionRule` — entity for a progression rule.
- `RegionGate` — requirement for unlocking a region.
- `LevelThreshold` — XP thresholds per level.
- `DifficultyAdaptationRule` — rules for adjusting difficulty.
- `ProgressionEngine` — domain service for evaluating progression.
- `GateChecker` — domain service for checking unlock gates.
- `ProgressionRepository` — interface for progression persistence.

### Key Types

| Type                       | Kind                 | Description                |
| -------------------------- | -------------------- | -------------------------- |
| `ProgressionRule`          | Entity               | Rule for progression       |
| `RegionGate`               | Value Object         | Unlock requirement         |
| `LevelThreshold`           | Value Object         | XP-to-level mapping        |
| `DifficultyAdaptationRule` | Value Object         | Difficulty adjustment rule |
| `ProgressionEngine`        | Domain Service       | Evaluates progression      |
| `GateChecker`              | Domain Service       | Checks unlock conditions   |
| `ProgressionRepository`    | Repository Interface | Persistence contract       |

### Must NOT Do

- ❌ **Must not** calculate mastery or XP. Reads from mastery and rewards modules.
- ❌ **Must not** define mission content or question types.
- ❌ **Must not** generate or evaluate questions.
- ❌ **Must not** call AI provider.
- ❌ **Must not** render UI.

---

## 10. game-world

### Purpose

Own the game world — regions, world map, narrative, and world state.

### Owns

- `Region` — entity for a game-world region (e.g., "The TypeScript Citadel").
- `WorldMap` — entity representing the full world map.
- `WorldState` — value object for current world state.
- `NarrativeEvent` — entity for a narrative beat.
- `PlayerRegionState` — a player's progress in a region.
- `WorldRepository` — interface for world persistence.

### Key Types

| Type                | Kind                 | Description              |
| ------------------- | -------------------- | ------------------------ |
| `Region`            | Entity               | World region             |
| `RegionId`          | Value Object         | Region identifier        |
| `WorldMap`          | Entity               | Full world map structure |
| `WorldState`        | Value Object         | Current world status     |
| `NarrativeEvent`    | Entity               | Story event              |
| `PlayerRegionState` | Entity               | Player's region progress |
| `WorldRepository`   | Repository Interface | Persistence contract     |

### Must NOT Do

- ❌ **Must not** define mastery, XP, or progression rules.
- ❌ **Must not** define mission types or generate missions.
- ❌ **Must not** generate or evaluate questions.
- ❌ **Must not** call AI provider.
- ❌ **Must not** render UI.

---

## 11. subjects

### Purpose

Own the subject file system — reading, parsing, validating, versioning, and importing subject Markdown files.

### Owns

- `SubjectFile` — entity for a parsed subject file.
- `SubjectVersion` — value object for version tracking.
- `SubjectImportRecord` — entity for import audit trail.
- `SubjectFileReader` — reads subject files from disk.
- `SubjectFrontmatterParser` — parses YAML frontmatter.
- `SubjectSectionParser` — parses subject sections.
- `ConceptParser` — parses individual concept entries.
- `PrerequisiteGraphBuilder` — builds prerequisite graph from parsed data.
- `SubjectSchemaValidator` — validates subject file against schema.
- `SubjectImportService` — orchestrates subject import.
- `SubjectVersionMigrationService` — handles schema migrations.
- `SubjectRepository` — interface for subject persistence.

### Key Types

| Type                       | Kind                 | Description                 |
| -------------------------- | -------------------- | --------------------------- |
| `SubjectFile`              | Value Object         | Parsed subject file content |
| `SubjectVersion`           | Value Object         | Version tracking            |
| `SubjectImportRecord`      | Entity               | Import audit record         |
| `SubjectFileReader`        | Domain Service       | File system access          |
| `SubjectSchemaValidator`   | Domain Service       | Schema validation           |
| `SubjectImportService`     | Domain Service       | Import orchestration        |
| `PrerequisiteGraphBuilder` | Domain Service       | Graph construction          |
| `SubjectRepository`        | Repository Interface | Persistence contract        |
| `SubjectParseError`        | Domain Error         | Parse failure               |
| `SubjectValidationError`   | Domain Error         | Validation failure          |

### Must NOT Do

- ❌ **Must not** call the AI provider. Subjects are parsed deterministically.
- ❌ **Must not** generate questions or missions.
- ❌ **Must not** calculate mastery or progression.
- ❌ **Must not** define game world or reward structures.
- ❌ **Must not** render UI.

---

## 12. artificial-intelligence

### Purpose

Own the AI integration boundary — gateway interface, Big Pickle implementation, configuration, request building, response parsing, validation, and fallback.

### Owns

- `ArtificialIntelligenceGateway` — interface for all AI operations.
- `BigPickle` — implementation of the gateway for Big Pickle provider.
- `BigPickleClient` — HTTP client for Big Pickle API.
- `BigPickleConfig` — configuration for Big Pickle.
- `BigPickleRequestBuilder` — constructs requests.
- `BigPickleResponseParser` — parses responses.
- `BigPickleResponseValidator` — validates responses.
- `BigPickleRetryPolicy` — retry logic.
- `BigPickleErrorMapper` — maps errors to domain errors.
- `GenerationContext` — context for a generation request.
- `GeneratedContentStatus` — status tracking.
- `ArtificialIntelligenceError` — base error class.
- `ArtificialIntelligenceGatewayFactory` — factory for configured provider.

### Key Types

| Type                            | Kind         | Description                                  |
| ------------------------------- | ------------ | -------------------------------------------- |
| `ArtificialIntelligenceGateway` | Interface    | AI operations contract                       |
| `BigPickle`                     | Class        | Gateway implementation                       |
| `GenerationContext`             | Value Object | Generation metadata                          |
| `GeneratedContentStatus`        | Enum         | `pending`, `validated`, `rejected`, `failed` |
| `ArtificialIntelligenceError`   | Domain Error | Base AI error                                |
| `GenerateQuestionRequest`       | Value Object | Question generation params                   |
| `GenerateQuestionResult`        | Value Object | Generated content                            |
| `EvaluateAnswerRequest`         | Value Object | Answer evaluation params                     |
| `EvaluateAnswerResult`          | Value Object | Evaluation result                            |

### Must NOT Do

- ❌ **Must not** define mission, question, or game-world structures.
- ❌ **Must not** calculate mastery or XP.
- ❌ **Must not** persist data beyond generation records.
- ❌ **Must not** expose credentials to the browser.
- ❌ **Must not** execute generated code automatically.
- ❌ **Must not** make the game unusable when AI is unavailable (must have fallback).
- ❌ **Must not** call AI from client-side code.

---

## 13. authentication

### Purpose

Own authentication and authorization — session management, credential validation, and access control.

### Owns

- `Session` — entity for an authenticated session.
- `Credentials` — value object for authentication credentials.
- `AuthProvider` — interface for auth provider.
- `SessionRepository` — interface for session persistence.
- `AuthorizationService` — domain service for access control.

### Key Types

| Type                   | Kind                 | Description            |
| ---------------------- | -------------------- | ---------------------- |
| `Session`              | Entity               | Auth session           |
| `Credentials`          | Value Object         | Auth credentials       |
| `AuthProvider`         | Interface            | Auth provider contract |
| `SessionRepository`    | Repository Interface | Session persistence    |
| `AuthorizationService` | Domain Service       | Access control         |
| `AuthenticationError`  | Domain Error         | Auth failure           |

### Must NOT Do

- ❌ **Must not** define player profiles or preferences.
- ❌ **Must not** calculate mastery, XP, or progression.
- ❌ **Must not** generate or evaluate questions.
- ❌ **Must not** render UI.

---

## 14. testing-support

### Purpose

Provide test fixtures, factories, mock implementations, and testing utilities for all other modules.

### Owns

- `TestFixture` — base fixture utilities.
- `MockRepository` — generic mock repository factory.
- `FakeAiGateway` — fake implementation of `ArtificialIntelligenceGateway`.
- `InMemoryPlayerRepository` — in-memory repository for tests.
- `InMemoryMissionRepository` — in-memory repository for tests.
- `InMemoryQuestionRepository` — in-memory repository for tests.
- `TestDataFactory` — creates test domain objects.
- `UseCaseTestHarness` — helper for testing use cases.

### Key Types

| Type                 | Kind       | Description              |
| -------------------- | ---------- | ------------------------ |
| `FakeAiGateway`      | Class      | Fake AI for tests        |
| `InMemoryRepository` | Base Class | In-memory persistence    |
| `TestDataFactory`    | Class      | Factory for test data    |
| `UseCaseTestHarness` | Class      | Use case testing utility |

### Must NOT Do

- ❌ **Must not** contain any production domain logic.
- ❌ **Must not** be imported by production code (only test files).
- ❌ **Must not** depend on real databases or external services.
- ❌ **Must not** define production business rules.

---

## 15. shared

### Purpose

Provide shared infrastructure, domain primitives, and cross-cutting utilities used by all modules.

### Layers

| Subdirectory             | Purpose                  | Examples                                                       |
| ------------------------ | ------------------------ | -------------------------------------------------------------- |
| `shared/application/`    | Shared use case patterns | `UseCase`, `Query`, `Command`                                  |
| `shared/domain/`         | Shared domain primitives | `Entity`, `ValueObject`, `DomainEvent`, `AggregateRoot`        |
| `shared/infrastructure/` | Shared infrastructure    | `Logger`, `EventBus`, `Clock`, `EnvironmentLoader`, `Database` |
| `shared/presentation/`   | Shared UI primitives     | `BaseLayout`, `ErrorBoundary`, `LoadingState`                  |

### Must NOT Do

- ❌ **Must not** contain module-specific business logic.
- ❌ **Must not** define module-specific entities or value objects.

---

## 16. SOLID Rules Applied to Modules

### Single Responsibility

Each module has exactly one area of concern:

- `mastery` calculates mastery and nothing else.
- `reviews` schedules reviews and nothing else.
- `rewards` handles rewards and XP and nothing else.

**Violation examples**: A module that both schedules reviews AND generates questions. A module that both persists players AND calculates progression.

### Open/Closed

Modules are open for extension but closed for modification:

- New question types are added by implementing `QuestionTypeModule`, not by editing `AnswerEvaluator` switch statements.
- New reward types are added by implementing a reward interface, not by editing `XpCalculator`.
- New AI providers are added by implementing `ArtificialIntelligenceGateway`, not by editing use cases.

### Liskov Substitution

Implementations of shared contracts must behave consistently:

- Any `QuestionEvaluator` must handle all valid question states identically.
- Any `ReviewAlgorithm` must produce deterministic schedules for the same inputs.
- Any `ArtificialIntelligenceGateway` implementation must handle the full request/response contract.

### Interface Segregation

Focused interfaces per module:

- `MasteryCalculator` interface has one method: `calculate()`.
- `AnswerEvaluator` interface has one method: `evaluate()`.
- No module is forced to depend on methods it does not use.

**Violation examples**: A `PlayerRepository` that also exposes mission query methods. A `GameService` interface with 20 unrelated methods.

### Dependency Inversion

Domain and application layers depend on abstractions:

- `StartMissionUseCase` depends on `PlayerRepository` (interface), not `PostgresPlayerRepository`.
- `MasteryCalculator` depends on `MasteryRepository` (interface), not on SQL queries.
- Infrastructure implements interfaces defined in the domain layer.

**Violation examples**: A use case importing a concrete database client. A domain entity calling infrastructure directly.

---

**Related Documents**:

- [System Overview](./system-overview.md) — High-level architecture
- [Main Flows](./main-flows.md) — Use case orchestration
- [Extension Points](./extension-points.md) — Adding new types and providers

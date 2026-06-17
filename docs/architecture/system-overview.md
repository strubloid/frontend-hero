# System Overview

> High-level architecture of the Frontend Realms platform — a gamified learning platform that takes developers from foundational frontend knowledge to senior-level Next.js engineering.

---

## Table of Contents

1. [Architecture Philosophy](#1-architecture-philosophy)
2. [Modular Monolith Architecture](#2-modular-monolith-architecture)
3. [Layer Separation](#3-layer-separation)
4. [Module Map](#4-module-map)
5. [Dependency Direction](#5-dependency-direction)
6. [Key Architectural Decisions](#6-key-architectural-decisions)
7. [Data Flow Overview](#7-data-flow-overview)
8. [Technology Stack](#8-technology-stack)
9. [Deployment Architecture](#9-deployment-architecture)

---

## 1. Architecture Philosophy

The Frontend Realms project is architected as a **modular monolith** with strict layer separation and domain-driven module boundaries. The guiding principles are:

- **Single Responsibility**: Every object has one reason to change. No giant services, managers, or utils.
- **Domain-Centric**: Business logic lives in the domain layer, free from framework concerns.
- **Readable Orchestration**: Use cases read as sequences of business actions, delegating details to specialist objects.
- **Testability**: The learning engine, mastery engine, progression system, and curriculum model must be testable without React components or a real database.
- **Open for Extension**: New subjects, question types, mission types, AI providers, and reward types can be added without modifying core engine code.

---

## 2. Modular Monolith Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION (Monolith)                    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     PRESENTATION LAYER                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │   │
│  │  │ App      │ │ React    │ │ View     │ │ Route        │   │   │
│  │  │ Router   │ │ Components│ │ Models   │ │ Handlers     │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    APPLICATION LAYER                          │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐     │   │
│  │  │ Use      │ │ Commands │ │ Queries  │ │ DTOs /     │     │   │
│  │  │ Cases    │ │          │ │          │ │ Requests   │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      DOMAIN LAYER (Innermost)                 │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐     │   │
│  │  │ Entities │ │ Value    │ │ Services │ │ Repository  │     │   │
│  │  │          │ │ Objects  │ │          │ │ Interfaces  │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘     │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐                    │   │
│  │  │ Domain   │ │ Events   │ │ Errors   │                    │   │
│  │  │ Models   │ │          │ │          │                    │   │
│  │  └──────────┘ └──────────┘ └──────────┘                    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                              │                                      │
│                              ▼                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                  INFRASTRUCTURE LAYER                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐     │   │
│  │  │ Database │ │ AI       │ │ External │ │ Config     │     │   │
│  │  │ Access   │ │ Providers│ │ APIs     │ │ Loading    │     │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────┘     │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                        MODULES                                │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │   │
│  │  │players   │ │missions  │ │questions │ │curriculum      │ │   │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├────────────────┤ │   │
│  │  │mastery   │ │reviews   │ │rewards   │ │progression     │ │   │
│  │  ├──────────┤ ├──────────┤ ├──────────┤ ├────────────────┤ │   │
│  │  │game-world│ │subjects  │ │artificial│ │authentication  │ │   │
│  │  │          │ │          │ │-intell.  │ │                │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────┐    │   │
│  │  │testing-support                              │    │   │
│  │  └─────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                                 │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐ │
│  │  PostgreSQL DB     │  │  Big Pickle       │  │  Fly.io        │ │
│  │  (Managed Service) │  │  (AI Provider)    │  │  (Deploy)      │ │
│  └───────────────────┘  └───────────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Layer Separation

### 3.1 Presentation Layer

**Responsibility**: Render UI, handle user interactions, manage client state, route requests.

- **App Router**: Next.js App Router for page routing, layouts, loading states, error boundaries.
- **React Components**: Pure presentation components with minimal logic. Server Components by default, Client Components only where interactivity is required.
- **View Models**: Transform domain data for display. No business logic.
- **Route Handlers**: Next.js Route Handlers and Server Actions as thin entry points that delegate to use cases.
- **SCSS / CSS Modules**: Styling using design tokens. Feature-specific styles co-located with components.

**Rules**:

- Components never call the database or AI provider directly.
- Server Actions delegate to use cases — they do not contain business logic.
- View models are simple data transformers; they never mutate domain objects.

### 3.2 Application Layer

**Responsibility**: Orchestrate business workflows, coordinate domain objects, handle transactions.

- **Use Cases**: One class per use case (e.g., `StartMissionUseCase`, `SubmitAnswerUseCase`). Each reads like a sequence of delegated business actions.
- **Commands**: Write operations that trigger domain logic (e.g., `CreatePlayerCommand`).
- **Queries**: Read operations that retrieve and project data (e.g., `GetPlayerProgressionQuery`).
- **DTOs / Requests**: Explicit request and result types for each use case.

**Rules**:

- Use cases delegate to domain services and repository interfaces — they do not contain domain logic.
- Use cases depend on abstractions (interfaces), not concrete implementations.
- Use cases handle cross-cutting concerns like logging and transaction boundaries.

### 3.3 Domain Layer (Innermost)

**Responsibility**: Business rules, entities, value objects, domain services, repository interfaces.

- **Entities**: Objects with identity and lifecycle (e.g., `Player`, `Mission`, `Question`).
- **Value Objects**: Immutable objects defined by their attributes (e.g., `MasteryScore`, `ConfidenceLevel`, `SubjectId`).
- **Domain Services**: Stateless operations that involve multiple entities (e.g., `MasteryCalculator`, `ReviewScheduler`).
- **Repository Interfaces**: Contracts for data access, implemented in infrastructure.
- **Domain Events**: Significant occurrences that other modules may respond to (e.g., `MissionCompleted`, `SubjectUnlocked`).
- **Domain Errors**: Typed error classes for business rule violations.

**Rules**:

- The domain layer has zero dependencies on frameworks, databases, or UI.
- Domain objects are pure TypeScript — no decorators, no ORM annotations, no React imports.
- Repository interfaces are defined in the domain; implementations are in infrastructure.

### 3.4 Infrastructure Layer

**Responsibility**: Implement interfaces defined by the domain and application layers.

- **Persistence**: Database repositories, migrations, query builders.
- **AI Providers**: Big Pickle client, request builder, response parser, retry policy, fallback logic.
- **External APIs**: Any third-party integrations.
- **Configuration**: Environment loading, validation, typed schemas.

**Rules**:

- Infrastructure implements interfaces — it does not define them.
- Infrastructure knows about frameworks (Next.js, Drizzle/Prisma, fetch) but domain code never does.
- AI provider calls are wrapped behind `ArtificialIntelligenceGateway` — no direct provider usage.

---

## 4. Module Map

Each module follows the internal structure: `application/`, `domain/`, `infrastructure/`, `presentation/`.

| Module                      | Purpose                                                | Key Domain Objects                                                       |
| --------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| **players**                 | Player identity, profile, authentication, preferences  | `Player`, `PlayerProfile`, `PlayerPreferences`                           |
| **missions**                | Mission lifecycle, mission types, attempt tracking     | `Mission`, `MissionAttempt`, `MissionPlan`, `MissionType`                |
| **questions**               | Question model, types, validation, deduplication       | `Question`, `QuestionSeed`, `QuestionFingerprint`, `QuestionType`        |
| **curriculum**              | Subject parsing, concept graph, prerequisites          | `Subject`, `Concept`, `Domain`, `PrerequisiteGraph`                      |
| **mastery**                 | Mastery calculation, confidence scoring, retention     | `ConceptMastery`, `MasteryScore`, `ConfidenceLevel`                      |
| **reviews**                 | Review scheduling, spaced repetition algorithms        | `ReviewSchedule`, `ReviewEntry`, `ReviewAlgorithm`                       |
| **rewards**                 | XP, achievements, cosmetics, unlocks                   | `Reward`, `Achievement`, `XpAward`, `PlayerReward`                       |
| **progression**             | Leveling, unlocks, region gates, difficulty adaptation | `ProgressionRule`, `RegionGate`, `LevelThreshold`                        |
| **game-world**              | Regions, world map, narrative, world state             | `Region`, `WorldMap`, `NarrativeEvent`, `WorldState`                     |
| **subjects**                | Subject file handling, version management              | `SubjectFile`, `SubjectVersion`, `SubjectImportRecord`                   |
| **artificial-intelligence** | AI gateway, Big Pickle client, generation, evaluation  | `ArtificialIntelligenceGateway`, `GenerationContext`, `GeneratedContent` |
| **authentication**          | Authentication, session management, authorization      | `Session`, `Credentials`, `AuthProvider`                                 |
| **testing-support**         | Test fixtures, factories, mocks, helpers               | `TestFixture`, `MockRepository`, `FakeAiGateway`                         |

---

## 5. Dependency Direction

```
Presentation ──────► Application ──────► Domain
     │                                        ▲
     │                                        │
     └──────────► Infrastructure ─────────────┘
```

**Rules**:

1. **Domain** has zero dependencies. It imports only standard TypeScript.
2. **Application** depends only on the Domain layer (abstractions, entities).
3. **Infrastructure** depends on Domain (implementing interfaces) and may depend on Application.
4. **Presentation** depends on Application (use cases, DTOs) and Domain (view models).
5. **No layer may depend on a layer above it.**
6. **Cross-module communication** happens through:
   - Domain events published by one module and consumed by another.
   - Repository interfaces defined in one module's domain and implemented elsewhere.
   - Application use cases that compose multiple modules.
7. **Circular dependencies are forbidden** between modules.

---

## 6. Key Architectural Decisions

### Decision 1: No Separate Backend

Next.js provides both frontend rendering and server-side API functionality (Route Handlers, Server Actions, Server Components). A separate Node.js backend would add deployment complexity, require inter-service communication, and increase latency without proportional benefit at this stage.

**Exception**: If async workers (e.g., question generation) become a performance bottleneck, a separate worker process can be introduced behind a durable queue.

### Decision 2: Modular Monolith over Microservices

All functionality lives in a single deployable unit. Modules are logically separated by TypeScript module boundaries, not network boundaries. This avoids premature distributed-system complexity while preserving the ability to extract modules later.

### Decision 3: Database — PostgreSQL (Production), SQLite (Dev/Test)

PostgreSQL is used in production for concurrent access, transactional guarantees, and managed hosting. SQLite is acceptable for local development and test runs to avoid requiring a database server for every developer.

### Decision 4: AI Provider Abstraction via ArtificialIntelligenceGateway

Every AI interaction goes through a single interface. The `BigPickle` class is one implementation. This prevents provider lock-in, enables testing with fake providers, and allows deterministic fallback when AI is unavailable.

### Decision 5: Subject Files as Data Source

Curriculum content lives in versioned Markdown files under `subjects/`. A parser transforms these into domain objects. Adding a subject requires only a new file — no code changes.

### Decision 6: Separate Mastery from XP

- **XP** (Experience Points): Rewards engagement and activity completion.
- **Mastery**: Measures demonstrated understanding over time, across multiple sessions, with varied question formats.
- Unlocking advanced content requires mastery, not just XP.

### Decision 7: Readable Orchestration

Use cases are kept thin and readable. They sequence calls to specialist domain objects rather than containing domain logic. Example: `StartMissionUseCase` delegates player loading to `PlayerRepository`, curriculum loading to `CurriculumRepository`, mission selection to `MissionSelector`, and question provision to `QuestionProvider`.

### Decision 8: One Class/Interface/Enum Per File

Every public type gets its own file. No barrel files, no giant `types.ts`, no `utils.ts`. This makes imports explicit, prevents circular dependencies, and simplifies code review.

---

## 7. Data Flow Overview

### 7.1 Mission Play Flow

```
Player clicks "Start Mission"
    │
    ▼
Server Action ──► StartMissionUseCase
    │                              │
    │                 ┌────────────┴────────────┐
    │                 │                         │
    │           PlayerRepository          CurriculumRepository
    │                 │                         │
    │                 ▼                         ▼
    │              Player                    Curriculum
    │                 │                         │
    │                 └──────────┬──────────────┘
    │                            ▼
    │                     MissionSelector
    │                            │
    │                            ▼
    │                      MissionPlan
    │                            │
    │                     QuestionProvider
    │                            │
    │                            ▼
    │                        Mission
    │                            │
    │                     MissionRepository.save()
    │                            │
    ◄────────────────────────────┘
    │
    ▼
Player sees mission in UI
```

### 7.2 Answer Submission Flow

```
Player submits answer
    │
    ▼
Server Action ──► SubmitAnswerUseCase
    │                              │
    │                    ┌─────────┴──────────┐
    │                    │                    │
    │              MissionRepository    PlayerRepository
    │                    │                    │
    │                    ▼                    ▼
    │                 Mission              Player
    │                    │                    │
    │                    └────────┬───────────┘
    │                             ▼
    │                     AnswerEvaluator
    │                             │
    │                             ▼
    │                      EvaluationResult
    │                             │
    │                    ┌────────┴────────┐
    │                    │                 │
    │               MasteryCalculator  XpCalculator
    │                    │                 │
    │                    ▼                 ▼
    │              ConceptMastery      XpAward
    │                    │                 │
    │              ReviewScheduler         │
    │                    │                 │
    │                    ▼                 │
    │             ReviewEntry              │
    │                    │                 │
    │                    └────────┬────────┘
    │                             ▼
    │                  MissionAttempt saved
    │                             │
    ◄─────────────────────────────┘
    │
    ▼
Player sees feedback, updated mastery, XP
```

---

## 8. Technology Stack

| Layer           | Technology                         | Purpose                         |
| --------------- | ---------------------------------- | ------------------------------- |
| Framework       | Next.js 16.2.9 App Router          | Full-stack framework            |
| Language        | TypeScript (strict mode)           | Type safety                     |
| UI              | React 19                           | Component model                 |
| Styling         | SCSS + CSS Modules                 | Component styling               |
| Linting         | ESLint (Next.js config + Prettier) | Code quality                    |
| Formatting      | Prettier                           | Consistent style                |
| Database (prod) | PostgreSQL (managed)               | Production persistence          |
| Database (dev)  | SQLite                             | Local development               |
| AI Provider     | Big Pickle (OpenCode Zen)          | Question generation, evaluation |
| Deployment      | Docker → Fly.io                    | Containerized deployment        |
| CI/CD           | GitHub Actions                     | Automated pipeline              |

---

## 9. Deployment Architecture

```
Initial (simple):
┌─────┐    ┌──────────────────┐    ┌──────────────────┐    ┌────────────┐
│Users│───►│ Fly.io Proxy     │───►│ Next.js Web      │───►│ PostgreSQL │
└─────┘    └──────────────────┘    │ Machine(s)       │    └────────────┘
                                    │                  │    ┌──────────────────┐
                                    │ BigPickle Gateway│───►│ OpenCode Zen     │
                                    │                  │    │ (Big Pickle)     │
                                    └──────────────────┘    └──────────────────┘
```

Future (when async workload justifies it):

```
┌─────┐    ┌──────────────┐    ┌──────────────────────┐    ┌────────────┐
│Users│───►│ Fly Machines │───►│ Web (Next.js)        │───►│ PostgreSQL │
└─────┘    └──────────────┘    └──────────┬───────────┘    └────────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Durable Queue │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────────────┐
                                    │ Question-Generation   │
                                    │ Worker Machines       │───► Big Pickle
                                    └──────────────────────┘
```

---

## 10. Cross-Cutting Concerns

### Environment Validation

At startup, validate all required environment variables. Fail fast and clearly when mandatory configuration is missing. Separate public (browser-safe) and server-only configuration.

### Error Handling

- Domain errors: typed error classes in each module's `domain/errors/`.
- Application errors: caught in use cases, wrapped in result types.
- Infrastructure errors: caught and mapped to domain errors at the boundary.

### Observability

- Structured logging with correlation IDs.
- Metrics for AI request latency, failure rates, fallback usage, database latency.
- No secrets in logs.

### Graceful Shutdown

1. Stop accepting new work.
2. Complete or cancel in-flight operations.
3. Close database connections.
4. Exit within configured shutdown timeout.

---

_This document is the authoritative reference for Frontend Realms system architecture. All implementation agents must read this before making architectural decisions._

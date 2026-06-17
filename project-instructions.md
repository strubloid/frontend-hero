# Frontend Realms — Project Instructions

> Consolidated product vision, architecture, gameplay design, technical stack, deployment strategy, and implementation plan.
> Source: Master Agent Prompt (gamified senior Next.js learning platform) + Fly.io deployment & containerization requirements.

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Product Concept & World](#2-product-concept--world)
3. [Research Phase](#3-research-phase)
4. [Gameplay Systems](#4-gameplay-systems)
5. [Gamification Principles](#5-gamification-principles)
6. [Adaptive Learning Engine](#6-adaptive-learning-engine)
7. [Curriculum Design](#7-curriculum-design)
8. [Subject File System](#8-subject-file-system)
9. [Question Library & Repetition Control](#9-question-library--repetition-control)
10. [AI Integration (Big Pickle / OpenCode Zen)](#10-ai-integration-big-pickle--opencode-zen)
11. [Technical Stack](#11-technical-stack)
12. [Architectural Principles](#12-architectural-principles)
13. [File Organization Rules](#13-file-organization-rules)
14. [Modular Structure](#14-modular-structure)
15. [Visual & Experience Direction](#15-visual--experience-direction)
16. [Player Onboarding & Diagnostic](#16-player-onboarding--diagnostic)
17. [Feedback Design](#17-feedback-design)
18. [Database & Persistence](#18-database--persistence)
19. [Security & AI Safety](#19-security--ai-safety)
20. [Testing Strategy](#20-testing-strategy)
21. [Fly.io Deployment & Containerization](#21-flyio-deployment--containerization)
22. [CI/CD Pipeline](#22-cicd-pipeline)
23. [Required OpenCode Skills](#23-required-opencode-skills)
24. [Agent Handoff Documentation](#24-agent-handoff-documentation)
25. [Architecture Decision Records](#25-architecture-decision-records)
26. [Incremental Delivery Plan](#26-incremental-delivery-plan)
27. [Definition of Done](#27-definition-of-done)
28. [Implementation Behaviour](#28-implementation-behaviour)
29. [Project Name & Folder](#29-project-name--folder)

---

## 1. Product Vision

Build a game-like learning platform that takes a developer from foundational frontend knowledge to senior-level Next.js engineering. The experience must feel closer to a progression-based adventure, strategy game, or RPG than a traditional learning dashboard.

The player should:

- Enter a living software-development world
- Select missions
- Solve questions and coding challenges
- Unlock regions of a skill map
- Fight conceptual "bosses"
- Repair fictional production systems
- Investigate bugs
- Make architectural decisions
- Defend systems from security and performance failures
- Build a fictional application over time
- Receive useful rewards and visible progression
- Revisit weak concepts through intelligent review
- Prepare for real senior frontend interviews

### Core Principle

The game must make studying enjoyable **without weakening the technical depth**. The game must never reward only clicking, guessing, or repeating easy questions. Progression must represent **demonstrated knowledge**.

### Non-Goal

This is **not** a basic quiz application with points added afterward. It must be a genuinely enjoyable game whose core gameplay teaches modern frontend engineering.

---

## 2. Product Concept & World

### Game Title (Provisional)

**The Frontend Realms**

### Setting

The player is restoring a broken digital world composed of frontend systems. Each region represents a major engineering domain.

### World Regions

```
The JavaScript Foundations
The TypeScript Citadel
The React Reactor
The Rendering Frontier
The Next.js Nexus
The State Labyrinth
The Network Depths
The Testing Grounds
The Performance Wastes
The Security Fortress
The Architecture Council
The Production Abyss
The Senior Engineer Summit
```

### Progression Model

For the initial release, the world focuses on Next.js while including prerequisite frontend knowledge. A player cannot enter an advanced region without demonstrating sufficient mastery of its prerequisites.

Combine multiple progression types:

- Guided critical path
- Optional side missions
- Weakness-recovery missions
- Daily short sessions
- Long-form project missions
- Boss encounters
- Random challenge events
- Review missions
- Interview simulations
- Production-incident simulations

The critical path must always be readable and understandable. The player should always know:

- Where they are
- What they are learning
- Why it matters
- What unlocks next
- Which weaknesses are blocking progression
- What they have mastered
- What needs review

---

## 3. Research Phase

### Deliverables (Phase 0)

Before writing any implementation code, produce:

```
docs/research/gamified-learning-market.md
docs/research/learning-science.md
docs/research/coding-platform-analysis.md
docs/research/game-design-analysis.md
docs/research/nextjs-current-state.md
docs/research/product-differentiation.md
docs/product/product-vision.md
docs/product/personas.md
docs/product/core-experience.md
docs/game-design/core-loop.md
docs/game-design/progression.md
docs/architecture/system-overview.md
docs/architecture/main-flows.md
docs/architecture/module-boundaries.md
docs/architecture/extension-points.md
docs/testing/testing-strategy.md
docs/project-status.md
AGENTS.md
```

### Products to Research

Research current products and patterns from these categories:

- Gamified learning applications
- Coding challenge platforms
- Interactive learning platforms
- Habit-building applications
- RPG progression systems
- Roguelite progression systems
- Strategy-game progression
- Skill-tree systems
- Adaptive learning platforms
- Interview-preparation platforms
- AI tutoring systems

### Specific Products to Evaluate

- Duolingo
- Brilliant
- Codecademy
- DataCamp
- LeetCode
- Exercism
- Codewars
- Frontend Mentor
- Mimo
- Kahoot
- Quizizz
- Habitica
- Anki
- Chess learning applications
- Modern RPG and roguelite progression systems

### Documentation Format for Mechanics

For every important mechanic, document:

```
Mechanic
Why it works
What problem it solves
How it may become annoying
How this project will improve it
Whether it supports real learning or only engagement
```

### Learning Methods to Research

- Active recall
- Retrieval practice
- Spaced repetition
- Interleaving
- Mastery learning
- Deliberate practice
- Immediate explanatory feedback
- Progressive difficulty
- Confidence-based assessment
- Error-based learning
- Scenario-based learning
- Project-based learning
- Metacognition
- Knowledge decay
- Transfer of learning

### Required Distinctions

The research must clearly distinguish between:

```
Engagement mechanics
Learning mechanics
Retention mechanics
Assessment mechanics
Game mechanics
```

### Product Differentiation

Do not copy any product directly. Produce a clear product hypothesis explaining why this game will be more enjoyable and educationally useful than a standard quiz application.

### Technology Verification

Before making architectural decisions:

1. Verify the latest stable Next.js and React recommendations from official documentation
2. Verify current OpenCode Zen and Big Pickle integration details (availability, pricing, limits, identifiers, authentication, API behaviour)
3. Never assume framework APIs or best practices are unchanged
4. Big Pickle configuration must be **configuration-driven**, never treated as permanently guaranteed

---

## 4. Gameplay Systems

### Core Gameplay Loop

```
Choose mission
    ↓
Receive narrative and engineering objective
    ↓
Inspect the problem
    ↓
Answer, debug, design, predict, or implement
    ↓
Receive immediate technical feedback
    ↓
Make a correction when necessary
    ↓
Earn mastery progress and game resources
    ↓
Update the player's knowledge model
    ↓
Unlock or schedule the next relevant challenge
```

### Required Mission Types

#### 4.1 Knowledge Encounters

Short questions assessing precise concepts:

- Multiple choice
- Multiple selection
- True or false with justification
- Fill in the missing concept
- Match related concepts
- Order lifecycle or execution steps
- Identify the incorrect statement

#### 4.2 Code Forensics

The player inspects code and determines:

- What happens
- Why it happens
- What is broken
- Which output is produced
- Which performance problem exists
- Which security problem exists
- Which architectural principle is violated

#### 4.3 Bug Hunts

Present realistic Next.js defects such as:

- Hydration mismatches
- Incorrect server/client boundaries
- Stale caching
- Request waterfalls
- Improper data mutation
- Incorrect effect dependencies
- Race conditions
- State synchronization problems
- Invalid environment-variable exposure
- Authentication mistakes
- Route handling errors
- Accessibility failures
- Test instability

#### 4.4 Refactoring Missions

The player improves weak code while preserving behaviour. Assess:

- Naming
- Cohesion
- Coupling
- SOLID principles
- Separation of concerns
- Testability
- Composition
- Dependency direction
- Error handling
- Performance
- Accessibility

#### 4.5 Architecture Council

Present several valid-looking designs and ask the player to select or construct the most appropriate one. The player must explain trade-offs involving:

- Server Components
- Client Components
- Rendering strategy
- Caching
- State ownership
- Data boundaries
- API design
- Authentication
- Authorization
- Observability
- Scalability
- Testing
- Deployment
- Failure recovery

#### 4.6 Production Incidents

Simulate a production incident with:

- Symptoms
- Logs
- Metrics
- Recent deployment changes
- User reports
- Code fragments
- Network traces
- Performance data

The player must diagnose and resolve the incident in stages.

#### 4.7 Boss Battles

A boss tests several connected concepts, not one memorized answer.

Examples:

- The Hydration Hydra
- The Cache Phantom
- The Bundle Behemoth
- The Race Condition Wraith
- The Authentication Mimic
- The Accessibility Golem
- The Rendering Architect
- The Production Outage

Phases:

```
Phase 1: Recognize the symptoms
Phase 2: Identify the cause
Phase 3: Choose a repair
Phase 4: Explain the trade-off
Phase 5: Prevent regression with tests
```

#### 4.8 Build Quests

The player gradually constructs real features inside a controlled project. Examples:

- Typed search interface
- Server-rendered product page
- Authentication
- Route protection
- Optimistic updates
- Streaming content
- Real-time dashboard
- Accessible forms
- Error boundaries
- Observability
- Performance profiling
- End-to-end tests

#### 4.9 Interview Arenas

Simulate senior frontend interviews:

- Concise verbal questions
- Follow-up questions
- Architecture discussions
- Code reviews
- Behavioural engineering scenarios
- Explain-this-concept challenges
- System-design challenges
- Time-limited rounds where appropriate

Evaluate more than keyword matching. Assess:

- Accuracy
- Completeness
- Clarity
- Senior judgment
- Trade-off awareness
- Practical examples
- Communication quality

#### 4.10 Prediction Challenges

Show code and ask the player to predict:

- Render behaviour
- Execution order
- Event-loop order
- Cache behaviour
- Network behaviour
- State transitions
- Error propagation
- Server/client execution boundaries

#### 4.11 Explain-It Challenges

Ask the player to explain a concept simply, as they would in an interview. Evaluate whether the response is:

- Technically correct
- Clear
- Properly scoped
- Supported by an example
- Free from unnecessary complexity

---

## 5. Gamification Principles

### Required Systems

- Experience points
- Mastery points (separate from XP)
- Player level
- Subject level
- Skill levels
- Unlockable regions
- Achievements
- Mission chains
- Daily quests
- Weekly challenges
- Boss battles
- Optional side quests
- Collections
- Cosmetic rewards
- Streaks with humane recovery
- Personal records
- Knowledge maps
- Narrative progression
- Surprise challenge encounters
- Seasonal or campaign structures (that do not delete learning progress)

### Patterns to Avoid

- Meaningless points
- Random rewards disconnected from learning
- Excessive animations after every click
- Punishing the user for missing one day
- Artificial energy limits
- Pay-to-progress mechanics
- Constant easy questions to preserve streaks
- Leaderboards that discourage slower learners
- Rewards for guessing
- Progress based only on completed screens
- Repeating identical questions excessively
- Dark patterns
- Forced daily engagement

### Mastery-Based Progression

**XP and mastery are different.**

- XP = engagement and completed activity
- Mastery = demonstrated understanding over time

Unlock advanced content primarily through mastery. A concept should not be marked mastered after one correct answer.

Evidence required for mastery:

- Correct answers over multiple sessions
- Confidence level
- Time since last review
- Performance under varied wording
- Practical application
- Related-concept transfer
- Ability to explain the concept
- Ability to debug the concept
- Ability to use it in architecture decisions

### Humane Streaks

Support:

- Grace days
- Streak recovery missions
- Weekly consistency goals
- Flexible study schedules
- "Return bonuses" after an absence
- No shaming messages

### Reward Design

Rewards should include:

- New world areas
- New mission types
- Character or workspace cosmetics
- Story fragments
- Architecture cards
- Debugging tools
- Titles
- Achievement badges
- Optional themes
- New challenge modifiers
- Visible improvements to the player's game environment

Do **not** give gameplay advantages that allow the player to bypass learning.

---

## 6. Adaptive Learning Engine

### Player Knowledge Model

Track each concept independently:

```ts
export interface ConceptMastery {
  conceptId: string;
  subjectId: string;
  masteryScore: number;
  confidenceScore: number;
  retentionScore: number;
  difficultyRating: number;
  correctAttempts: number;
  incorrectAttempts: number;
  consecutiveCorrectAnswers: number;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
  demonstratedContexts: DemonstratedContext[];
  commonMistakes: string[];
}
```

### Decision Engine

The engine must decide whether to:

- Introduce a prerequisite
- Teach a new concept
- Review a decaying concept
- Increase difficulty
- Change question format
- Generate a practical challenge
- Ask for an explanation
- Trigger a recovery mission
- Unlock a boss
- Recommend a project exercise

The selection process must be **explainable and testable**. Do not hide all logic inside an AI prompt. The application must own deterministic learning rules. AI should assist content generation and evaluation, not control the entire product unpredictably.

### Question Selection Pipeline

```
Load player state
    ↓
Load curriculum graph
    ↓
Find available concepts
    ↓
Prioritize overdue reviews
    ↓
Prioritize weak prerequisites
    ↓
Apply mission constraints
    ↓
Check recent-question history
    ↓
Select challenge type
    ↓
Use stored question or request generation
    ↓
Validate generated question
    ↓
Present mission
```

---

## 7. Curriculum Design

### Foundation Areas

#### HTML & CSS

- Semantic HTML
- Accessibility (WCAG)
- CSS fundamentals
- Responsive design
- SCSS architecture

#### JavaScript Fundamentals

- Scope
- Closures
- Objects
- Prototypes
- Modules
- Immutability
- Functional concepts
- Error handling

#### Asynchronous JavaScript

- Event loop
- Call stack
- Microtasks and macrotasks
- Promises
- Async/await

#### Browser & Web

- Browser APIs
- HTTP
- REST
- Cookies
- Storage
- Security fundamentals

#### TypeScript

- Fundamentals
- Generics
- Unions
- Narrowing
- Utility types
- Type design

### React Areas

- Component composition
- Props
- State
- Controlled inputs
- Hooks
- Rendering
- Reconciliation
- Effects
- Derived state
- State ownership
- Context
- Reducers
- Memoization
- Suspense
- Error boundaries
- Server/client mental models
- Form handling
- Accessibility
- Testing
- Performance
- Component API design

### Next.js Areas (verify against current docs)

- App Router
- Routing
- Nested layouts
- Dynamic segments
- Route groups
- Loading states
- Error handling
- Not-found handling
- Server Components
- Client Components
- Server and client boundaries
- Data fetching
- Streaming
- Suspense
- Mutations
- Server Functions (or current equivalent)
- Route Handlers
- Middleware (or current equivalent)
- Caching
- Revalidation
- Static rendering
- Dynamic rendering
- Partial rendering approaches
- Metadata
- Images
- Fonts
- Environment configuration
- Authentication
- Authorization
- Security
- Internationalization
- Accessibility
- Testing
- Instrumentation
- Logging
- Observability
- Performance
- Bundle analysis
- Deployment
- Runtime choices
- Edge vs server runtime trade-offs
- Database integration
- API integration
- Error recovery
- Production operations
- Upgrades and migrations

### Senior Frontend Areas

- Frontend system design
- State-management strategy
- Real-time dashboards
- WebSockets / Server-Sent Events / Polling
- Streaming data
- Optimistic interfaces
- Concurrency
- Race conditions
- Design systems
- Component libraries
- Accessibility governance
- Performance budgets
- Monitoring
- Error reporting
- Analytics
- Feature flags
- Experimentation
- Security reviews
- Dependency security
- CI/CD
- Testing strategy
- Code review
- Technical debt
- Migration strategy
- Mentoring
- Trade-off communication
- Incident response
- Production debugging
- Architectural decision records

### Known Study Weaknesses to Address

- Explaining frontend systems clearly
- JavaScript execution order
- Event loop
- Promises
- Microtasks and macrotasks
- Reactive UI architecture
- State management
- Real-time dashboards
- Streaming-data handling
- Component architecture
- Performance
- Testing
- Senior frontend judgment
- Explaining trade-offs during interviews

---

## 8. Subject File System

### File Location

```
subjects/
├── nextjs.md
├── angular.md
├── react.md
├── typescript.md
├── nodejs.md
├── system-design.md
└── testing.md
```

### File Format

Use a machine-readable markdown format with frontmatter and structured sections:

```md
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

...

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

### Parser Components

Create specialist components (not one giant parser class):

```
SubjectFileReader
SubjectFrontmatterParser
SubjectSectionParser
ConceptParser
PrerequisiteGraphBuilder
SubjectSchemaValidator
SubjectImportService
SubjectVersionMigrationService
```

### Domain Objects

A subject must be converted into these domain objects:

```
Subject
Domain
Concept
LearningOutcome
Prerequisite
KnowledgeEntry
Misconception
Example
QuestionSeed
ChallengeSeed
InterviewPrompt
ValidationRule
```

### Key Constraint

Adding another subject must **not** require changes to the Next.js implementation. The flow must be:

```
Subject file
    ↓
Subject parser
    ↓
Schema validation
    ↓
Domain model
    ↓
Curriculum graph
    ↓
Question and mission engine
```

---

## 9. Question Library & Repetition Control

### Storage Requirements

Store for each question:

- Generated question text
- Normalized concept
- Challenge type
- Difficulty
- Correct answer
- Explanation
- Distractors
- Source section
- Validation status
- Generation model
- Generation prompt version
- Semantic fingerprint
- Times shown
- Last shown
- Player result history
- Quality rating

### Selection Flow

Before presenting or generating a question:

1. Search the local repository
2. Check whether an appropriate approved question exists
3. Check how recently it was shown
4. Check how many similar questions appeared recently
5. Select an existing question when suitable
6. Generate a new question only when additional variety is needed
7. Validate the generated question
8. Reject duplicates or near-duplicates
9. Store accepted questions

### Repetition Policy

- Repetition is allowed when educationally useful (especially for spaced review)
- Wording, context, or challenge form should vary across repetitions
- Implement semantic deduplication using:
  - Normalized text hashes
  - Concept identifiers
  - Question structure fingerprints
  - Answer fingerprints
  - Similarity comparison
  - Recent-history rules

Provide a **deterministic baseline that works locally** — do not depend exclusively on an external embedding service.

---

## 10. AI Integration (Big Pickle / OpenCode Zen)

### Architecture

Create a central class named `BigPickle` implementing the `ArtificialIntelligenceGateway` interface. No feature may call the Big Pickle provider directly.

```ts
export interface ArtificialIntelligenceGateway {
  generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult>;
  evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResult>;
  generateExplanation(request: GenerateExplanationRequest): Promise<GenerateExplanationResult>;
  generateHint(request: GenerateHintRequest): Promise<GenerateHintResult>;
  generateMission(request: GenerateMissionRequest): Promise<GenerateMissionResult>;
}
```

### File Structure

```
src/modules/artificial-intelligence/
├── application/
│   ├── generate-question/
│   │   ├── generate-question.use-case.ts
│   │   ├── generate-question.request.ts
│   │   └── generate-question.result.ts
│   ├── evaluate-answer/
│   ├── generate-explanation/
│   ├── generate-hint/
│   └── generate-mission/
├── domain/
│   ├── artificial-intelligence-gateway.ts
│   ├── artificial-intelligence-error.ts
│   ├── generation-context.ts
│   └── generated-content-status.ts
└── infrastructure/
    └── big-pickle/
        ├── big-pickle.ts
        ├── big-pickle-client.ts
        ├── big-pickle-config.ts
        ├── big-pickle-request-builder.ts
        ├── big-pickle-response-parser.ts
        ├── big-pickle-response-validator.ts
        ├── big-pickle-retry-policy.ts
        └── big-pickle-error-mapper.ts
```

### Rules

- Read credentials and provider configuration from environment variables
- Never expose credentials to the browser
- Make calls only from trusted server-side code
- Validate every response
- Require structured output
- Apply timeouts
- Apply bounded retries
- Apply rate limiting
- Record token and request usage where available
- Log failures without logging secrets
- Cache safe reusable results
- Support cancellation
- Prevent prompt injection from subject-file content
- Treat model output as untrusted input
- Never execute generated code automatically
- Never store an incorrect question as approved
- Support provider unavailability
- Support a deterministic local fallback using approved stored questions
- Do not make the game unusable when Big Pickle is unavailable

### Provider-Neutral Design

Use a factory or dependency-injection registration so another AI provider can be added later by implementing the same interface:

```
ArtificialIntelligenceGatewayFactory
    ↓
Configured provider
    ↓
BigPickle
```

No provider-switch conditionals throughout the application.

### Subject Context Retrieval

Never send the entire large subject file when only one concept is needed. Use a subject-context retrieval service.

### Output Validation

Validate every generated question for:

- Required fields
- Correct-answer consistency
- Duplicate options
- Empty explanations
- Unsupported question types
- Invalid concept identifiers
- Difficulty boundaries
- Unsafe content
- Near-duplicate content
- Contradictory explanations

### Deployment Configuration

```
AI_PROVIDER=big-pickle
BIG_PICKLE_MODEL=big-pickle
BIG_PICKLE_BASE_URL=...
BIG_PICKLE_API_KEY=...
BIG_PICKLE_REQUEST_TIMEOUT_MS=...
BIG_PICKLE_MAX_RETRIES=...
```

Use the real configuration names required by the verified OpenCode integration — these example names are not guaranteed official.

The application must boot even when Big Pickle is unavailable, provided approved stored questions are available.

---

## 11. Technical Stack

### Required

| Layer                 | Technology                                                         |
| --------------------- | ------------------------------------------------------------------ |
| Framework             | Latest stable Next.js (verify against official docs)               |
| Router                | App Router (unless current official recommendations say otherwise) |
| Language              | TypeScript with strict mode                                        |
| UI                    | React                                                              |
| Styling               | SCSS + CSS Modules where appropriate                               |
| Backend               | Next.js server-side functionality                                  |
| Database              | Relational database with ORM / typed database layer                |
| Schema validation     | Dedicated validation library                                       |
| Unit testing          | Standard framework                                                 |
| Integration testing   | Standard framework                                                 |
| Component testing     | Standard framework                                                 |
| E2E testing           | Standard framework                                                 |
| Linting               | ESLint                                                             |
| Formatting            | Prettier                                                           |
| Accessibility testing | axe or equivalent                                                  |
| CI                    | GitHub Actions or equivalent                                       |

### Architecture Layers

Maintain clear separation:

```
Presentation
Application
Domain
Infrastructure
```

### Constraint

Do **not** split the application into an unnecessary separate Node backend during the initial architecture. Next.js should provide both frontend and server-side application boundary.

### Testability Requirement

The learning engine, mastery engine, progression engine, mission engine, and subject model must remain testable without rendering React components or connecting to a real database.

---

## 12. Architectural Principles

### Single Responsibility

Every object must have one clear reason to change. Avoid classes such as:

```
GameService
QuestionManager
AppUtils
LearningHelper
AiEverythingService
```

Use specialist objects with precise responsibilities.

### Open/Closed

New behaviour should normally be introduced by adding a specialist implementation rather than editing a large central conditional.

Example:

```
QuestionEvaluator
├── MultipleChoiceQuestionEvaluator
├── CodePredictionQuestionEvaluator
├── ExplanationQuestionEvaluator
├── ArchitectureQuestionEvaluator
└── DebuggingQuestionEvaluator
```

Adding a new question type requires:

- A new question type object
- A new evaluator
- A new renderer
- Tests
- Registration

It should **not** require rewriting the complete question engine.

### Liskov Substitution

Implementations of shared contracts must behave consistently.

### Interface Segregation

Use focused interfaces. Do not force classes to implement methods they do not need.

### Dependency Inversion

Domain and application code depend on abstractions. Infrastructure implements those abstractions.

### Readable Orchestration

A use case should read like a sequence of business actions:

```ts
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

Detailed work belongs in specialist objects. Do not place parsing, database queries, AI prompts, scoring rules, and presentation transformations in the same use case.

---

## 13. File Organization Rules

### Mandatory Rules

- One main class per file
- One main interface per file
- One main enum per file
- Parent class in its own file
- Child class in its own file
- Request type in its own file
- Result type in its own file
- Domain error in its own file
- Repository interface separate from implementation
- React components separate from domain objects
- Tests placed next to the relevant implementation or in a consistent mirrored structure

### Prohibited Patterns

- No giant general-purpose `types.ts`
- No giant `utils.ts`
- No barrel file that creates circular dependencies
- No business logic inside route handlers
- No database logic inside React components
- No AI provider logic inside use cases
- No SCSS containing unrelated application areas

### Naming

Use meaningful names. Avoid:

```
data
item
obj
temp
util
helper
manager
thing
x
i
j
```

...except where a tiny local mathematical context makes the meaning unambiguous.

---

## 14. Modular Structure

### Top-Level Structure

```
frontend-realms/
├── .opencode/
│   ├── agents/
│   ├── commands/
│   └── skills/
├── docs/
│   ├── architecture/
│   ├── decisions/
│   ├── game-design/
│   ├── research/
│   ├── testing/
│   ├── product/
│   └── deployment/
├── subjects/
│   └── nextjs.md
├── scripts/
├── src/
│   ├── app/
│   ├── modules/
│   │   ├── artificial-intelligence/
│   │   ├── authentication/
│   │   ├── curriculum/
│   │   ├── game-world/
│   │   ├── mastery/
│   │   ├── missions/
│   │   ├── players/
│   │   ├── progression/
│   │   ├── questions/
│   │   ├── reviews/
│   │   ├── rewards/
│   │   ├── subjects/
│   │   └── testing-support/
│   ├── shared/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── styles/
├── tests/
│   ├── architecture/
│   ├── integration/
│   ├── end-to-end/
│   └── fixtures/
├── Dockerfile
├── .dockerignore
├── fly.toml
├── docker-compose.yml
├── docker-compose.test.yml
└── README.md
```

### Module Internal Structure

Each module follows:

```
module-name/
├── application/
│   ├── commands/
│   ├── queries/
│   └── use-cases/
├── domain/
│   ├── entities/
│   ├── value-objects/
│   ├── services/
│   ├── events/
│   ├── errors/
│   └── repositories/
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

### Rule

Do not create empty architectural folders without a real need. Add folders incrementally as features are implemented.

### Modular Extension System

Design extension points for:

- New subjects
- New question types
- New mission types
- New AI providers
- New reward types
- New progression rules
- New evaluation strategies
- New game-world regions
- New review algorithms
- New storage implementations
- New visual themes

Use registries or dependency injection where appropriate:

```ts
export interface QuestionTypeModule {
  getType(): QuestionType;
  createEvaluator(): QuestionEvaluator;
  createValidator(): QuestionValidator;
}
```

Do not over-engineer with a plugin runtime before it is needed. Establish clean contracts first. Document every official extension point in `docs/architecture/extension-points.md`.

---

## 15. Visual & Experience Direction

### Design Philosophy

The application must look and feel like a premium game interface. **Do not create:**

- A white dashboard with cards
- A generic admin template
- A basic quiz page
- A Bootstrap-like layout
- A page full of independent rounded rectangles
- Excessive glassmorphism without hierarchy
- Decorative animation with no purpose
- A childish classroom interface

### Visual Direction

Create a coherent visual world:

- Futuristic digital-realm environment
- Dark atmospheric base
- Layered depth
- Animated map
- Mission paths
- Subtle environmental motion
- Interactive skill constellation
- Code-terminal effects
- Production-system visualizations
- Boss presentation
- Reward-reveal sequences
- Accessible contrast
- Responsive design
- Reduced-motion support

The design must remain professional enough for an experienced developer while still feeling playful.

### Main Screens

- Opening sequence
- Player onboarding
- Knowledge diagnostic
- World map
- Mission selection
- Active mission
- Code challenge
- Boss battle
- Skill tree
- Knowledge map
- Review chamber
- Project workshop
- Interview arena
- Player profile
- Achievements
- Settings
- Subject selection
- Progress analytics

### Animation Principles

Use animation to clarify:

- Correct reasoning
- Incorrect reasoning
- Region unlocking
- Mastery growth
- Boss phase transitions
- Mission completion
- Knowledge decay
- Review readiness

Animations must not delay the user unnecessarily. Provide:

- Reduced motion mode
- Keyboard navigation
- Screen-reader labels
- Focus states
- Sufficient contrast
- No information represented only by colour

### SCSS Architecture

```
styles/
├── abstracts/
├── base/
├── themes/
├── utilities/
└── tokens/
```

Feature-specific SCSS stays near the feature. Use design tokens for:

- Spacing
- Typography
- Elevation
- Motion
- Borders
- Layout
- Breakpoints
- Semantic colours

Do not hard-code arbitrary values throughout the application.

---

## 16. Player Onboarding & Diagnostic

### First Session

The first session must not assume the player is a complete beginner. Create an engaging diagnostic campaign assessing:

- JavaScript
- TypeScript
- React
- Browser fundamentals
- Next.js
- Testing
- Performance
- Accessibility
- Architecture
- Security
- Communication

### Adaptive Diagnostic

The diagnostic must be adaptive:

- Do not make the user answer hundreds of questions before playing
- Use confidence and follow-up questions to estimate initial mastery

### Diagnostic Output

The diagnostic should produce:

- Skill map
- Strong areas
- Weak areas
- Missing prerequisites
- Recommended starting region
- Suggested daily session size
- First mission chain

Allow the user to challenge the placement by attempting a region gate.

---

## 17. Feedback Design

### Feedback Quality

Never respond only with "Correct" / "Incorrect". Feedback should explain:

- Why the answer is correct or incorrect
- What concept was being tested
- Why the mistake is common
- How to reason about it next time
- A concise example
- A link to the relevant internal knowledge section
- Whether the concept will return for review

### Progressive Hints

```
Hint 1: Direction
Hint 2: Relevant concept
Hint 3: Partial reasoning
Hint 4: Worked guidance
```

Using hints may reduce immediate mission rewards but must not prevent learning progress.

### Repair Actions

After an incorrect answer, allow a repair action:

- Try again with a smaller hint
- Explain the correction
- Solve a related example
- Compare two approaches
- Rebuild the answer

Reward successful correction.

---

## 18. Database & Persistence

### Required Entities

- Player
- PlayerProfile
- Subject
- SubjectVersion
- Domain
- Concept
- ConceptPrerequisite
- LearningOutcome
- Question
- QuestionVersion
- QuestionFingerprint
- Mission
- MissionAttempt
- QuestionAttempt
- ConceptMastery
- ReviewSchedule
- Achievement
- PlayerAchievement
- Reward
- PlayerReward
- Campaign
- Region
- PlayerRegion
- GenerationRecord
- EvaluationRecord
- StudySession

### Implementation Requirements

- Use migrations
- Use repositories behind interfaces
- Do not couple domain entities directly to ORM-specific behaviour
- Store enough information to reproduce and audit AI-generated content

### Production Database

Prefer a managed PostgreSQL-compatible database or another explicitly selected durable database. Do not use SQLite as the default production database when multiple Fly Machines may run concurrently. SQLite may be supported for local development or testing only.

---

## 19. Security & AI Safety

### Required Measures

- Server-only AI credentials
- Environment validation at startup
- Authentication
- Authorization
- Input validation
- Output validation
- Rate limiting
- Request-size limits
- Secure headers
- CSRF protection where relevant
- Safe cookie configuration
- Protection against prompt injection
- Protection against stored malicious Markdown
- Safe rendering of generated content
- No arbitrary generated-code execution
- Audit records for AI content
- Dependency vulnerability checks
- Secret scanning
- Logging redaction

Treat subject files, AI output, player answers, and imported Markdown as **untrusted data**.

---

## 20. Testing Strategy

### Testing Pyramid

- Domain unit tests
- Application use-case tests
- Parser tests
- Algorithm tests
- Integration tests
- Database tests
- API / server-action tests
- Component tests
- Accessibility tests
- End-to-end tests
- Architecture tests

### Required Algorithm Tests

- Mastery calculation
- Review scheduling
- Prerequisite unlocking
- Mission selection
- Difficulty adaptation
- Repetition control
- Semantic fingerprinting
- Reward calculation
- Streak recovery
- Question validation
- Big Pickle response parsing
- Big Pickle failure fallback
- Subject parsing
- Subject-version migration

### Required End-to-End Flows

```
New player → diagnostic → first mission → answer → feedback → progress saved
Returning player → overdue review → successful recall → mastery updated
Player → boss battle → multi-phase completion → region unlocked
Stored question unavailable → Big Pickle generation → validation → presentation
Big Pickle unavailable → approved stored content used → game remains playable
New subject imported → validated → appears in subject selection → missions generated
```

### Single Verification Command

```bash
npm run verify
```

Must run in fail-fast order:

1. Environment validation
2. Formatting check
3. Lint
4. Type checking
5. Architecture validation
6. Unit tests
7. Integration tests
8. Component tests
9. Build
10. End-to-end smoke tests

Provide `npm run verify:full` for exhaustive checks (includes full E2E, Docker build, container verification). The agent must never claim a task is complete unless `npm run verify` passes.

### Testing Integrity

Do not fix tests by:

- Deleting them
- Weakening assertions
- Adding broad skips
- Changing expected behaviour without documenting why

---

## 21. Fly.io Deployment & Containerization

### Deployment Model

```
Next.js application
    ↓
Production Docker image
    ↓
Fly.io application configuration
    ↓
Fly Machines
```

**No Kubernetes.** Kubernetes is unnecessary — Fly.io already provides application orchestration, health management, regional deployment, scaling, networking, secrets, and machine lifecycle management.

### Required Deployment Files

```
frontend-realms/
├── Dockerfile
├── .dockerignore
├── fly.toml
├── docker-compose.yml           (local dev only)
├── docker-compose.test.yml      (local test only)
├── scripts/
│   ├── docker-entrypoint.sh
│   ├── fly-deploy.sh
│   ├── fly-release.sh
│   └── fly-health-check.sh
└── docs/
    └── deployment/
        ├── docker.md
        ├── fly-io.md
        ├── environment-variables.md
        ├── database-migrations.md
        ├── rollback.md
        └── troubleshooting.md
```

### Docker Requirements

Multi-stage Dockerfile with clear separation:

```
Dependencies
    ↓
Build
    ↓
Production runtime
```

Requirements:

- Use a supported Node.js LTS image (alpine variant preferred)
- Run as a non-root user
- Deterministic package installation (`npm ci`)
- Only production runtime files in final image
- Exclude: source-control, tests, caches, secrets, dev artefacts
- Expose the application port, listen on `0.0.0.0`
- Use production environment settings
- Support graceful shutdown
- Keep image reasonably small
- Avoid unnecessary OS packages
- Avoid copying `.env` files into the image
- Include OCI image metadata where useful

Next.js config for standalone output (verify against current docs):

```ts
const nextConfig = {
  output: "standalone",
};
```

The production server must use `PORT` from the environment — never assume port 3000.

### Fly.io Configuration (`fly.toml`)

Must configure:

- Application name (via deployment config)
- Primary region
- Internal application port
- HTTPS enforcement
- Health checks
- Machine sizing
- Min/max machine behaviour
- Auto start/stop where appropriate
- Environment variables safe to declare in config
- Release commands (for migrations)
- Process groups (if workers are needed later)
- Concurrency limits
- Graceful shutdown signals and timeout
- Persistent volumes (only when truly required)

**Do not store secrets in `fly.toml`.** Use `fly secrets set` for:

- Database URLs
- Authentication secrets
- Big Pickle / OpenCode credentials
- Encryption keys
- External service credentials
- Private API keys

### Health Checks

Implement dedicated health endpoints:

| Endpoint            | Purpose             | Dependencies                                |
| ------------------- | ------------------- | ------------------------------------------- |
| `/api/health/live`  | Process is running  | None (must not depend on external services) |
| `/api/health/ready` | Can receive traffic | Database, config, subjects (NOT Big Pickle) |

Response format:

```json
{
  "status": "healthy",
  "checks": {
    "application": "healthy",
    "database": "healthy",
    "subjects": "healthy"
  }
}
```

Requirements:

- JSON responses
- Appropriate HTTP status codes
- No secrets or internal stack traces exposed
- Fast execution
- Automated tests

### Database Deployment

- No durable data inside Docker container filesystem
- Containers and Fly Machines may be replaced
- Persistent data uses an external managed service
- Prefer managed PostgreSQL-compatible database
- Migrations run via release command before traffic is accepted
- Migrations must be idempotent, fail-safe, and backward-compatible where possible

### Process Separation

Start with one web process. Do not introduce separate workers until asynchronous workload requires it.

Potential future process groups:

```
web
question-generation-worker
review-scheduler
content-validation-worker
```

When workers are introduced:

- Use Fly.io process groups, separate Fly applications, or Machines
- Keep every process narrowly responsible
- Use a durable queue, idempotent jobs, retry limits, dead-letter handling
- Record job status
- Avoid running long AI-generation work inside user-facing HTTP requests

### Build-Time vs Runtime Environment Variables

- Never expose server secrets through `NEXT_PUBLIC_` prefix
- Only public browser-safe configuration may use `NEXT_PUBLIC_`
- Centralized environment validation structure:

```
src/shared/infrastructure/environment/
├── environment-schema.ts
├── environment-loader.ts
├── public-environment.ts
├── server-environment.ts
└── environment-validation-error.ts
```

Startup must fail clearly when mandatory production configuration is missing. Error messages must identify the missing variable without exposing secret values.

### Graceful Shutdown

On shutdown:

1. Stop accepting new work
2. Complete or cancel in-flight operations safely
3. Close database connections
4. Stop queue consumers
5. Flush critical telemetry where practical
6. Release resources
7. Exit within configured shutdown timeout

Long-running AI requests must support cancellation. Do not allow shutdown to leave question-generation records permanently marked as active.

### Deployment Verification Commands

```json
{
  "scripts": {
    "docker:build": "docker build -t frontend-realms .",
    "docker:run": "docker run --rm -p 3000:3000 frontend-realms",
    "docker:verify": "node scripts/verify-docker-image.mjs",
    "fly:validate": "fly config validate",
    "fly:deploy": "fly deploy",
    "fly:status": "fly status",
    "fly:logs": "fly logs"
  }
}
```

Integrate container validation into `npm run verify:full`:

```
Application tests
    ↓
Production build
    ↓
Docker image build
    ↓
Container startup
    ↓
Liveness check
    ↓
Readiness check
```

---

## 22. CI/CD Pipeline

### Deployment Pipeline

1. Install dependencies deterministically
2. Run `npm run verify`
3. Run `npm run verify:full` on protected deployment branches
4. Build the Docker image
5. Scan dependencies and image for known vulnerabilities
6. Authenticate to Fly.io using protected CI secret
7. Validate `fly.toml`
8. Deploy
9. Run post-deployment smoke tests
10. Report deployment failure clearly

Production deployment must not occur when tests fail. Do not store Fly.io API token in the repository.

### Rollback Strategy

Document how to:

- Inspect releases
- Inspect Machine status
- View logs
- Roll back to a previous known-good image
- Restore database compatibility
- Disable a faulty feature through a feature flag
- Recover from a failed migration

Application changes and database migrations should support rollback whenever practical. A deployment is not production-ready until rollback instructions exist.

### Observability

Prepare for production diagnosis:

- Structured logs
- Request correlation identifiers
- Error reporting
- Health metrics
- Deployment version reporting
- AI request metrics
- AI failure and fallback metrics
- Database latency metrics
- Mission-generation timing
- Question-validation rejection metrics

Logs must include useful context but **exclude**:

- Passwords
- Access tokens
- Session tokens
- Authentication secrets
- AI provider secrets
- Complete sensitive player answers (where unnecessary)
- Private environment values

### Architecture Principle

Initial production architecture (simple):

```
Users → Fly.io proxy → Next.js web Machines → PostgreSQL database
Next.js server → BigPickle gateway → OpenCode Zen model
```

Future async architecture (only when justified by workload):

```
Next.js web Machines → Durable job queue → Question-generation worker Machines → BigPickle
```

### Deployment Definition of Done

Fly.io preparation is complete only when:

- [ ] Production Docker image builds successfully
- [ ] Container runs as a non-root user
- [ ] Application listens on configured host and port
- [ ] `fly.toml` passes validation
- [ ] Secrets remain outside the repository and image
- [ ] Database migrations have a controlled deployment path
- [ ] Liveness and readiness checks pass
- [ ] Production image passes smoke tests
- [ ] Graceful shutdown is tested
- [ ] Big Pickle failure does not make core gameplay unavailable
- [ ] Persistent data survives Machine replacement
- [ ] Rollback instructions exist
- [ ] Deployment documentation is current
- [ ] `npm run verify:full` passes
- [ ] A test deployment to Fly.io succeeds

---

## 23. Required OpenCode Skills

Create persistent project skills in `.opencode/skills/`:

```
.opencode/skills/project-architecture/
.opencode/skills/testing/
.opencode/skills/subject-authoring/
.opencode/skills/game-design/
.opencode/skills/big-pickle/
.opencode/skills/change-validation/
```

### Project Architecture Skill

Instruct every agent to:

- Preserve module boundaries
- Follow SOLID
- Keep readable orchestration flows
- Add specialist objects instead of growing large classes
- Keep one principal type per file
- Separate parent and child classes
- Depend on abstractions
- Avoid framework logic in the domain
- Avoid giant services
- Avoid unrelated refactors
- Add architecture tests when introducing new boundaries

### Testing Skill

Instruct every agent to:

1. Identify affected behaviour
2. Add or update tests before or with the implementation
3. Run focused tests during development
4. Run `npm run verify`
5. Run `npm run verify:full` for changes affecting critical flows
6. Report commands run and results
7. Never hide failures
8. Never remove valid tests merely to pass CI
9. Add a regression test for every fixed bug

### Subject Authoring Skill

Explain:

- Subject schema
- Concept identifiers
- Prerequisite rules
- Learning outcomes
- Question seeds
- Challenge seeds
- Validation
- Versioning
- Duplication checks
- How to add a new subject without modifying the game engine

### Game Design Skill

Enforce:

- Meaningful progression
- Variety
- Learning-first rewards
- No dark patterns
- No punitive streaks
- No meaningless point inflation
- Clear feedback
- Accessible interaction
- Narrative consistency

### Big Pickle Skill

Enforce:

- Calls through `BigPickle`
- Server-only credentials
- Structured output
- Validation
- Retry limits
- Timeouts
- Logging redaction
- Fallback behaviour
- Duplicate prevention
- No automatic execution of generated code

### Change Validation Skill

Before completing any change, review:

```
Does the change preserve the readable main flow?
Did a class gain more than one responsibility?
Could the behaviour be introduced through a specialist object?
Are types and classes properly separated?
Were tests added?
Did npm run verify pass?
Were documentation and decisions updated?
Did the change introduce repetition?
Did the change preserve accessibility?
Did the change preserve subject independence?
```

---

## 24. Agent Handoff Documentation

### AGENTS.md

The primary entry point for any future AI agent. Must explain:

- Product purpose
- Current implementation phase
- Architecture
- Module boundaries
- Main flows
- Testing commands
- Big Pickle integration
- Subject-file format
- Extension points
- Current limitations
- Recent architectural decisions
- How to safely make a change
- What must never be done

### Required Docs

```
docs/project-status.md
docs/architecture/system-overview.md
docs/architecture/main-flows.md
docs/architecture/module-boundaries.md
docs/architecture/extension-points.md
docs/testing/testing-strategy.md
docs/game-design/core-loop.md
docs/game-design/progression.md
docs/deployment/docker.md
docs/deployment/fly-io.md
docs/deployment/environment-variables.md
docs/deployment/database-migrations.md
docs/deployment/rollback.md
docs/deployment/troubleshooting.md
```

After every meaningful implementation phase, update `docs/project-status.md`. A future agent should understand the project without reading the complete Git history.

---

## 25. Architecture Decision Records

Use ADRs for significant decisions:

```
docs/decisions/
├── 0001-modular-monolith.md
├── 0002-subject-file-schema.md
├── 0003-ai-provider-boundary.md
├── 0004-mastery-model.md
└── 0005-question-deduplication.md
```

Each ADR includes:

- Context
- Decision
- Alternatives considered
- Consequences
- Status

Do not create an ADR for trivial implementation details.

---

## 26. Incremental Delivery Plan

### Phase 0 — Research and Product Definition

Deliver:

- Market analysis
- Learning-science analysis
- Differentiated product concept
- Core gameplay loop
- Initial curriculum map
- Architecture proposal
- Risk register
- Delivery roadmap

No large UI implementation yet.

### Phase 1 — Walking Skeleton

Build the smallest complete vertical flow:

```
Load Next.js subject
    ↓
Parse one concept
    ↓
Create one stored question
    ↓
Start one mission
    ↓
Submit one answer
    ↓
Evaluate deterministically
    ↓
Save one attempt
    ↓
Display feedback
```

Include authentication only when required for persistence. Include tests.

### Phase 2 — Subject Engine

Implement:

- Subject schema
- Parser
- Validator
- Concept graph
- Prerequisite graph
- Subject import
- Version handling
- Tests

### Phase 3 — Learning Engine

Implement:

- Mastery
- Confidence
- Review scheduling
- Difficulty adaptation
- Mission selection
- Repetition control
- Tests

### Phase 4 — Game Foundation

Implement:

- World map
- Regions
- Missions
- XP
- Mastery
- Unlocks
- Rewards
- Player progression
- Initial narrative

### Phase 5 — Big Pickle Integration

Implement:

- `BigPickle` class and `ArtificialIntelligenceGateway` interface
- Configuration
- Structured requests and responses
- Validation
- Storage
- Deduplication
- Fallback
- Tests

### Phase 6 — Challenge Variety

Add challenge types one at a time:

1. Knowledge encounter
2. Code prediction
3. Bug hunt
4. Refactoring
5. Explain-it
6. Architecture decision
7. Production incident
8. Boss battle

Each requires: domain model, evaluator, renderer, validation, tests, registration.

### Phase 7 — Advanced Game Experience

Add:

- Animated world
- Story progression
- Collections
- Achievements
- Daily quests
- Weekly challenges
- Boss presentation
- Project workshop
- Interview arena

### Phase 8 — Production Readiness

Add:

- Security review
- Performance profiling
- Accessibility audit
- Observability
- Error reporting
- CI
- Deployment
- Backups
- Migration documentation

### Phase-End Checklist

At the end of each phase:

1. Run focused tests
2. Run `npm run verify`
3. Run relevant end-to-end scenarios
4. Update documentation
5. Record unresolved risks
6. Preserve all working behaviour

---

## 27. Definition of Done

A feature is complete **only when**:

- [ ] Its behaviour is implemented
- [ ] Its responsibilities are correctly located
- [ ] Its public types are explicit
- [ ] Its tests pass
- [ ] Relevant integration paths pass
- [ ] `npm run verify` passes
- [ ] Accessibility is preserved
- [ ] Error states are handled
- [ ] Loading states are handled
- [ ] Documentation is updated
- [ ] No secrets are exposed
- [ ] No invalid AI content is trusted
- [ ] No unnecessary duplication was introduced
- [ ] The readable main flow remains clear
- [ ] A future agent can understand the change

The product itself is successful when the player feels they are playing an engaging progression game while steadily developing demonstrable senior-level frontend and Next.js knowledge.

---

## 28. Implementation Behaviour

For every requested change:

1. Read `AGENTS.md`
2. Read the relevant skill files
3. Read `docs/project-status.md`
4. Inspect the existing architecture
5. Identify the module that owns the behaviour
6. Identify existing extension points
7. Avoid duplicating existing logic
8. Define or update tests
9. Implement the smallest coherent change
10. Run focused validation
11. Run `npm run verify`
12. Update documentation when behaviour or architecture changes
13. Report precisely what changed and what passed

### Prohibited Actions

- Rewriting working modules without a concrete reason
- Creating duplicate abstractions
- Putting all logic in route handlers
- Adding large conditional dispatchers
- Creating circular dependencies
- Coupling game logic to Next.js
- Making Big Pickle mandatory for basic gameplay
- Generating content without validation
- Claiming tests passed without running them
- Leaving placeholder implementations described as complete
- Replacing strong typing with `any`
- Silencing TypeScript errors
- Ignoring lint rules without justification
- Disabling accessibility checks
- Adding packages without documenting why

---

## 29. Project Name & Folder

| Field              | Value                                                                                         |
| ------------------ | --------------------------------------------------------------------------------------------- |
| Project name       | `frontend-realms` (provisional; may evolve)                                                   |
| Project folder     | `frontend-hero/` (current working directory — may be renamed to match project name)           |
| Initial subject    | `subjects/nextjs.md`                                                                          |
| Initial region set | The Frontend Realms (13 regions listed in section 2)                                          |
| AI provider        | Big Pickle via OpenCode Zen (configuration-driven)                                            |
| Deployment         | Fly.io via Docker (no Kubernetes)                                                             |
| Database           | PostgreSQL-compatible managed service (production); SQLite acceptable for local dev/test only |

---

_End of project instructions. This document is the single source of truth for all implementation agents. When in doubt, revisit this file before making architectural decisions._

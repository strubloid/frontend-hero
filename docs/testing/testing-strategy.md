# Testing Strategy

> The comprehensive testing approach for Frontend Realms — pyramid structure, required algorithm tests, end-to-end flows, architecture tests, and the `npm run verify` specification.

---

## Table of Contents

1. [Testing Philosophy](#1-testing-philosophy)
2. [Testing Pyramid](#2-testing-pyramid)
3. [Domain Unit Tests](#3-domain-unit-tests)
4. [Use-Case Tests](#4-use-case-tests)
5. [Parser Tests](#5-parser-tests)
6. [Algorithm Tests](#6-algorithm-tests)
7. [Integration Tests](#7-integration-tests)
8. [Database Tests](#8-database-tests)
9. [API / Server-Action Tests](#9-api--server-action-tests)
10. [Component Tests](#10-component-tests)
11. [Accessibility Tests](#11-accessibility-tests)
12. [End-to-End Tests](#12-end-to-end-tests)
13. [Architecture Tests](#13-architecture-tests)
14. [npm run verify Specification](#14-npm-run-verify-specification)
15. [Required Algorithm Tests — Detailed](#15-required-algorithm-tests--detailed)
16. [Required E2E Flows — Detailed](#16-required-e2e-flows--detailed)
17. [Test Fixtures and Factories](#17-test-fixtures-and-factories)
18. [Testing Do's and Don'ts](#18-testing-dos-and-donts)

---

## 1. Testing Philosophy

- **Test behaviour, not implementation.** Tests should validate that the system works correctly, not that specific internal methods were called in a specific order.
- **Deterministic tests only.** No flaky tests. Tests that depend on AI output, random values, or wall-clock timing must use controlled fixtures or fakes.
- **Isolation where possible, integration where necessary.** Unit tests are fast and targeted. Integration tests verify that components work together.
- **No deleting tests to pass CI.** Tests are not removed because they are inconvenient. Weak assertions are not weakened. Broad skips are not added.
- **Architecture tests enforce boundaries.** Automated architecture tests prevent dependency violations and circular imports.
- **Regression tests for every fixed bug.** Every bug fix includes a test that would have caught it.

### Test File Location

Tests live alongside their implementation:

```
src/modules/missions/domain/services/mission-selector.ts
src/modules/missions/domain/services/__tests__/mission-selector.test.ts
```

Or in the top-level `tests/` directory for integration, E2E, and architecture tests:

```
tests/
├── architecture/
├── integration/
├── end-to-end/
└── fixtures/
```

---

## 2. Testing Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E╲
                 ╱______╲
                ╱        ╲
               ╱Integration╲
              ╱____________╲
             ╱   Component  ╲
            ╱________________╲
           ╱  API / Server    ╲
          ╱    Action Tests    ╲
         ╱______________________╲
        ╱  Database / Repository ╲
       ╱__________________________╲
      ╱   Algorithm / Parser      ╲
     ╱______________________________╲
    ╱   Use-Case (Application)       ╲
   ╱__________________________________╲
  ╱      Domain Unit Tests             ╲
 ╱______________________________________╲
╱      Architecture Tests               ╲
╱________________________________________╲
```

### Pyramid Levels (Bottom to Top)

| Level                     | Count (Target) | Speed       | Dependencies           |
| ------------------------- | -------------- | ----------- | ---------------------- |
| Architecture Tests        | ~10–15         | Instant     | Static analysis        |
| Domain Unit Tests         | ~200+          | <10ms each  | None (pure logic)      |
| Use-Case Tests            | ~50+           | <100ms each | Mocked repositories    |
| Algorithm / Parser Tests  | ~30+           | <50ms each  | Input files            |
| Database Tests            | ~20+           | <500ms each | Test database (SQLite) |
| API / Server Action Tests | ~20+           | <1s each    | Test database          |
| Component Tests           | ~40+           | <1s each    | RTL / Vitest           |
| Integration Tests         | ~15+           | <5s each    | Test database          |
| E2E Tests                 | ~6+            | <30s each   | Full application       |

---

## 3. Domain Unit Tests

### What They Test

Domain entities, value objects, and domain services in isolation — no database, no React, no AI, no HTTP.

### Structure

```
src/modules/<module>/domain/
├── entities/
│   ├── player.ts
│   └── __tests__/
│       └── player.test.ts
├── value-objects/
│   ├── mastery-score.ts
│   └── __tests__/
│       └── mastery-score.test.ts
└── services/
    ├── mastery-calculator.ts
    └── __tests__/
        └── mastery-calculator.test.ts
```

### What to Test

| Object             | Test Cases                                                              |
| ------------------ | ----------------------------------------------------------------------- |
| `Player`           | Construction validation, mastery update, XP addition, level calculation |
| `Mission`          | State transitions (created → active → completed), progress tracking     |
| `Question`         | Type validation, correct answer storage, fingerprint calculation        |
| `ConceptMastery`   | Score bounds (0–1), confidence calculation, retention decay             |
| `MasteryScore`     | Normalization, comparison, threshold checks                             |
| `XpAward`          | Calculation from evaluation, multiplier application                     |
| `EvaluationResult` | Construction from answer comparison                                     |
| `MissionPlan`      | State before/after question assignment                                  |

### Example

```typescript
// src/modules/mastery/domain/services/__tests__/mastery-calculator.test.ts
import { describe, it, expect } from "vitest";
import { MasteryCalculator } from "../mastery-calculator";

describe("MasteryCalculator", () => {
  describe("calculate", () => {
    it("should increase mastery on correct answer", () => {
      const calculator = new MasteryCalculator();
      const currentMastery = { score: 0.5, confidence: "medium", attempts: 5 };

      const result = calculator.calculate({
        currentMastery,
        evaluation: { isCorrect: true, score: 1.0 },
        answerTimeMs: 5000,
      });

      expect(result.score).toBeGreaterThan(0.5);
      expect(result.score).toBeLessThanOrEqual(1.0);
    });

    it("should decrease mastery on incorrect answer", () => {
      const calculator = new MasteryCalculator();
      const currentMastery = { score: 0.7, confidence: "high", attempts: 10 };

      const result = calculator.calculate({
        currentMastery,
        evaluation: { isCorrect: false, score: 0.0 },
        answerTimeMs: 30000,
      });

      expect(result.score).toBeLessThan(0.7);
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it("should never return a score outside 0-1 bounds", () => {
      const calculator = new MasteryCalculator();

      const edgeCases = [
        { score: 0.0, attempts: 1 },
        { score: 0.99, attempts: 100 },
        { score: 0.5, attempts: 50 },
      ];

      for (const current of edgeCases) {
        const result = calculator.calculate({
          currentMastery: { ...current, confidence: "medium" },
          evaluation: { isCorrect: true, score: 1.0 },
          answerTimeMs: 1000,
        });
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1.0);
      }
    });
  });
});
```

---

## 4. Use-Case Tests

### What They Test

Application use cases with mocked repositories and domain services. Tests verify correct orchestration, error handling, and result construction.

### Structure

```
src/modules/missions/application/use-cases/start-mission/
├── start-mission.use-case.ts
├── start-mission.request.ts
├── start-mission.result.ts
└── __tests__/
    └── start-mission.use-case.test.ts
```

### What to Test

| Use Case                   | Test Cases                                                                           |
| -------------------------- | ------------------------------------------------------------------------------------ |
| `StartMissionUseCase`      | Valid request creates mission, player not found, no available missions               |
| `SubmitAnswerUseCase`      | Correct answer flow, incorrect answer flow, question not found, duplicate submission |
| `RunReviewScheduleUseCase` | Due reviews found, no reviews due, weak concept inclusion                            |
| `ImportSubjectUseCase`     | Valid file imported, invalid file rejected, duplicate import                         |

### Example

```typescript
// src/modules/missions/application/use-cases/start-mission/__tests__/start-mission.use-case.test.ts
import { describe, it, expect, vi } from "vitest";
import { StartMissionUseCase } from "../start-mission.use-case";
import { createMockPlayerRepository } from "@/modules/players/infrastructure/__mocks__/player-repository.mock";
// ... other mocks

describe("StartMissionUseCase", () => {
  it("should create a mission when player and curriculum exist", async () => {
    const playerRepo = createMockPlayerRepository({ exists: true });
    const curriculumRepo = createMockCurriculumRepository({ exists: true });
    const missionSelector = createMockMissionSelector({ returnsPlan: true });
    const questionProvider = createMockQuestionProvider({ returnsQuestions: true });
    const missionRepo = createMockMissionRepository();

    const useCase = new StartMissionUseCase(
      playerRepo,
      curriculumRepo,
      missionSelector,
      questionProvider,
      missionRepo,
    );

    const result = await useCase.execute({
      playerId: "player-1",
      subjectId: "nextjs",
      mode: "learning",
    });

    expect(result.missionId).toBeDefined();
    expect(result.questionCount).toBeGreaterThan(0);
    expect(missionRepo.save).toHaveBeenCalledOnce();
  });

  it("should throw PlayerNotFoundError when player does not exist", async () => {
    const playerRepo = createMockPlayerRepository({ exists: false });
    // ... other mocks

    const useCase = new StartMissionUseCase(playerRepo /* ... */);

    await expect(
      useCase.execute({
        playerId: "nonexistent",
        subjectId: "nextjs",
        mode: "learning",
      }),
    ).rejects.toThrow("PlayerNotFoundError");
  });
});
```

---

## 5. Parser Tests

### What They Test

Subject file parsers, frontmatter parsers, concept parsers, and prerequisite graph builders.

### What to Test

| Parser                     | Test Cases                                                               |
| -------------------------- | ------------------------------------------------------------------------ |
| `SubjectFileReader`        | File exists, file not found, permission error                            |
| `SubjectFrontmatterParser` | Valid frontmatter, missing fields, malformed YAML, version migration     |
| `SubjectSectionParser`     | All section types, missing sections, extra whitespace                    |
| `ConceptParser`            | Valid concept, missing required fields, invalid prerequisites reference  |
| `PrerequisiteGraphBuilder` | Linear graph, diamond graph, circular dependency detection, missing node |
| `SubjectSchemaValidator`   | Valid subject, missing id, invalid difficulty, duplicate concept IDs     |

### Example

```typescript
describe("PrerequisiteGraphBuilder", () => {
  it("should detect circular dependencies", () => {
    const concepts = [
      { id: "a", prerequisites: ["b"] },
      { id: "b", prerequisites: ["c"] },
      { id: "c", prerequisites: ["a"] }, // circular
    ];

    expect(() => graphBuilder.build(concepts)).toThrow("CircularDependencyError");
  });

  it("should build a valid graph from linear prerequisites", () => {
    const concepts = [
      { id: "a", prerequisites: [] },
      { id: "b", prerequisites: ["a"] },
      { id: "c", prerequisites: ["b"] },
    ];

    const graph = graphBuilder.build(concepts);

    expect(graph.getPrerequisites("c")).toEqual(["b", "a"]);
    expect(graph.getDependents("a")).toEqual(["b", "c"]);
  });
});
```

---

## 6. Algorithm Tests

See [Section 15: Required Algorithm Tests — Detailed](#15-required-algorithm-tests--detailed) for the complete list.

---

## 7. Integration Tests

### What They Test

Multiple components working together — use case with real (or test-double) repositories, parser with real subject files, `QuestionProvider` with stored question fallback.

### What to Test

| Integration                              | Description              |
| ---------------------------------------- | ------------------------ |
| Subject file → Parser → Domain model     | Full import pipeline     |
| Domain model → Repository → Retrieval    | Save and load round-trip |
| Use case → Repository → Domain service   | End-to-end business flow |
| AI Gateway → Response parser → Validator | AI response handling     |

### Example

```typescript
describe("Subject Import Integration", () => {
  it("should import a valid subject file and make it available", async () => {
    const repository = new SqliteSubjectRepository(testDb);
    const reader = new SubjectFileReader();
    const validator = new SubjectSchemaValidator();
    const importService = new SubjectImportService(repository, reader, validator);

    await importService.importFromFile("subjects/nextjs.md");

    const subject = await repository.getById("nextjs");
    expect(subject).toBeDefined();
    expect(subject.concepts.length).toBeGreaterThan(0);

    const eventLoop = subject.getConcept("javascript.event-loop");
    expect(eventLoop).toBeDefined();
    expect(eventLoop.prerequisites).toContain("javascript.promises");
  });
});
```

---

## 8. Database Tests

### What They Test

Repository implementations against a real database (SQLite for test, PostgreSQL for production verification).

### What to Test

| Repository                 | Test Cases                                                |
| -------------------------- | --------------------------------------------------------- |
| `SqlitePlayerRepository`   | Create, read, update, delete; constraints; transactions   |
| `PostgresPlayerRepository` | Same set, run against test PostgreSQL                     |
| `InMemoryPlayerRepository` | Same set (verifies contract correctness)                  |
| All repositories           | Edge cases: not found, duplicate, null fields, large data |

### Database Test Pattern

```typescript
describe("SqlitePlayerRepository", () => {
  let db: Database;
  let repository: SqlitePlayerRepository;

  beforeEach(async () => {
    db = await createTestDatabase(); // in-memory SQLite
    await runMigrations(db);
    repository = new SqlitePlayerRepository(db);
  });

  afterEach(async () => {
    await db.close();
  });

  it("should persist and retrieve a player", async () => {
    const player = Player.create({ id: "test-1", email: "test@example.com" });
    await repository.save(player);

    const retrieved = await repository.getById("test-1");
    expect(retrieved).toEqual(player);
  });

  it("should return null for nonexistent player", async () => {
    const result = await repository.getById("nonexistent");
    expect(result).toBeNull();
  });
});
```

---

## 9. API / Server-Action Tests

### What They Test

Next.js Route Handlers and Server Actions — request parsing, validation, authentication, response formatting.

### What to Test

| Endpoint                           | Test Cases                                                     |
| ---------------------------------- | -------------------------------------------------------------- |
| `POST /api/missions/start`         | Valid request starts mission, invalid subject, unauthenticated |
| `POST /api/missions/submit-answer` | Valid answer, duplicate submission, expired mission            |
| `GET /api/health/live`             | Returns healthy                                                |
| `GET /api/health/ready`            | Healthy when DB connected, unhealthy when DB down              |

### Example

```typescript
describe("POST /api/missions/start", () => {
  it("should return 200 with mission data for valid request", async () => {
    const response = await fetch("/api/missions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: "player-1",
        subjectId: "nextjs",
        mode: "learning",
      }),
    });

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.missionId).toBeDefined();
    expect(body.questionCount).toBeGreaterThan(0);
  });

  it("should return 400 for missing playerId", async () => {
    const response = await fetch("/api/missions/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectId: "nextjs", mode: "learning" }),
    });

    expect(response.status).toBe(400);
  });
});
```

---

## 10. Component Tests

### What They Test

React components — rendering, user interactions, loading states, error states, accessibility.

### What to Test

| Component       | Test Cases                                                     |
| --------------- | -------------------------------------------------------------- |
| `MissionCard`   | Renders title, description, progress bar; click starts mission |
| `QuestionView`  | Renders question prompt, options; selection triggers callback  |
| `FeedbackPanel` | Shows correct/incorrect feedback; displays explanation         |
| `ProgressBar`   | Renders at correct percentage; handles edge values (0%, 100%)  |

### Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { MissionCard } from './mission-card';

describe('MissionCard', () => {
    it('should render mission title and description', () => {
        render(
            <MissionCard
                title="Event Loop Basics"
                description="Master the JavaScript event loop"
                progress={0.3}
                onStart={vi.fn()}
            />
        );

        expect(screen.getByText('Event Loop Basics')).toBeDefined();
        expect(screen.getByText('Master the JavaScript event loop')).toBeDefined();
    });

    it('should show progress correctly', () => {
        render(<MissionCard title="Test" description="Desc" progress={0.75} onStart={vi.fn()} />);

        const progressBar = screen.getByRole('progressbar');
        expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });
});
```

---

## 11. Accessibility Tests

### What They Test

Automated accessibility checks using `axe-core` or equivalent — run as part of component tests and E2E tests.

### What to Check

- All images have alt text.
- All interactive elements have accessible names.
- Color contrast meets WCAG AA standards.
- Focus indicators are visible.
- ARIA roles are correct.
- Reduced-motion media query is respected.
- Keyboard navigation works.

### Integration

```typescript
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
    const { container } = render(<MissionCard title="Test" description="Desc" progress={0.5} onStart={vi.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
});
```

---

## 12. End-to-End Tests

See [Section 16: Required E2E Flows — Detailed](#16-required-e2e-flows--detailed) for the complete list.

---

## 13. Architecture Tests

### What They Test

Structural and dependency rules using static analysis (e.g., dependency-cruiser or custom lint rules).

### Rules to Enforce

```typescript
// tests/architecture/module-boundaries.test.ts

describe("Module Boundaries", () => {
  // 1. Domain must not depend on infrastructure
  it("domain should not import from infrastructure", () => {
    // Verify no imports from '../../infrastructure/' in domain files
  });

  // 2. Presentation must not depend on infrastructure directly
  it("presentation should not import infrastructure directly", () => {
    // Verify no infrastructure imports from presentation
  });

  // 3. No circular dependencies between modules
  it("should have no circular dependencies between modules", () => {
    // Run dependency-cruiser
  });

  // 4. One class per file rule
  it("each file should export at most one class/interface/enum", () => {
    // Scan all source files
  });

  // 5. No barrel files
  it("should have no barrel index.ts files in src/", () => {
    // Verify no index.ts re-exports in src/modules/
  });

  // 6. No giant utils/types files
  it("should have no files named utils.ts or types.ts", () => {
    // Verify no such filenames exist
  });
});
```

### Architecture Test Configuration

```json
// .dependency-cruiser.config.js
{
  "forbidden": [
    {
      "name": "domain-not-depend-on-infrastructure",
      "severity": "error",
      "from": { "path": "src/modules/.*/domain/" },
      "to": { "path": "src/modules/.*/infrastructure/" }
    },
    {
      "name": "no-circular-dependencies",
      "severity": "error",
      "from": {},
      "to": { "circular": true }
    },
    {
      "name": "presentation-no-infrastructure",
      "severity": "error",
      "from": { "path": "src/modules/.*/presentation/" },
      "to": { "path": "src/modules/.*/infrastructure/" }
    },
    {
      "name": "no-barrel-files",
      "severity": "warn",
      "from": {},
      "to": { "path": ["src/modules/.*/index\\.ts$"] }
    }
  ]
}
```

---

## 14. npm run verify Specification

### Command

```bash
npm run verify
```

### Fail-Fast Order

Each step runs to completion or fails. If a step fails, subsequent steps are **not** executed (the command exits immediately with the failure).

```
Step  1: Environment Validation
         → Check Node version, required env vars, required files exist.
         Command: node scripts/verify-environment.mjs

Step  2: Formatting Check
         → Verify all files match Prettier formatting.
         Command: npm run format:check

Step  3: Lint
         → Run ESLint across the entire project.
         Command: npm run lint

Step  4: Type Checking
         → Run TypeScript compiler with --noEmit.
         Command: npm run type-check

Step  5: Architecture Validation
         → Run dependency-cruiser, check module boundaries.
         Command: npx depcruise src --config .dependency-cruiser.config.js

Step  6: Unit Tests
         → Run all unit tests (domain + use-case + algorithm + parser).
         Command: npx vitest run src/modules --reporter verbose

Step  7: Integration Tests
         → Run all integration tests (database + API + cross-module).
         Command: npx vitest run tests/integration --reporter verbose

Step  8: Component Tests
         → Run all React component tests.
         Command: npx vitest run src --include "**/*.component.test.*" --reporter verbose

Step  9: Build
         → Build the Next.js production application.
         Command: npm run build

Step 10: End-to-End Smoke Tests
         → Run core E2E flows against the built application.
         Command: npx playwright test tests/end-to-end/smoke/ --reporter list
```

### Full Verification

```bash
npm run verify:full
```

Includes everything in `npm run verify` plus:

```
Step 11: Full E2E Tests
         → Run all E2E test suites.
         Command: npx playwright test tests/end-to-end/

Step 12: Docker Build
         → Build production Docker image.
         Command: npm run docker:build

Step 13: Container Verification
         → Start container, run health checks.
         Command: npm run docker:verify
```

### Script Definitions (package.json)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "verify": "node scripts/verify-environment.mjs && npm run format:check && npm run lint && npm run type-check && npx depcruise src --config .dependency-cruiser.config.js && npx vitest run src/modules && npx vitest run tests/integration && npx vitest run src --include '**/*.component.test.*' && npm run build && npx playwright test tests/end-to-end/smoke/",
    "verify:full": "npm run verify && npx playwright test tests/end-to-end/ && npm run docker:build && npm run docker:verify"
  }
}
```

### CI/CD Integration

```yaml
# .github/workflows/verify.yml
name: Verify
on: [push, pull_request]

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
      - run: npm run verify
```

---

## 15. Required Algorithm Tests — Detailed

Each algorithm must be tested with known-input/expected-output pairs. Tests must cover normal operation, edge cases, and error conditions.

### 15.1 Mastery Calculation

```typescript
describe("MasteryCalculator", () => {
  // Normal cases
  it("correct answer increases mastery proportionally to current level");
  it("incorrect answer decreases mastery but never below 0");
  it("fast correct answer increases more than slow correct answer");
  it("consecutive correct answers provide diminishing returns");
  it("consecutive incorrect answers increase penalty");

  // Edge cases
  it("mastery at 0 remains 0 on incorrect answer");
  it("mastery at 1.0 remains 1.0 on correct answer");
  it("single attempt from 0 to first score is reasonable");
  it("handles very long answer times without negative score");

  // Boundary
  it("output is always between 0 and 1 inclusive");
  it("mastery changes are monotonic within a session");
  it("different question difficulties affect score change rate");
});
```

### 15.2 Review Scheduling

```typescript
describe("ReviewScheduler", () => {
  // Normal cases
  it("correct answer increases interval");
  it("incorrect answer decreases interval");
  it("consecutive correct answers produce longer intervals");
  it("generates a date in the future after scheduling");

  // Edge cases
  it("first review has minimum interval");
  it("perfect streak produces maximum capped interval");
  it("lapsed review resets to shorter interval");
  it("handles skipped reviews gracefully");

  // Boundary
  it("interval never exceeds maximum configured interval");
  it("interval never goes below minimum configured interval");
  it("multiple schedules for same concept are handled correctly");
});
```

### 15.3 Prerequisite Unlocking

```typescript
describe("PrerequisiteGraphBuilder", () => {
  it("concept is locked when prerequisite not mastered");
  it("concept is unlocked when all prerequisites met");
  it("chain prerequisites resolve recursively");
  it("diamond prerequisites resolve correctly");
  it("detects circular dependencies");
  it("detects missing prerequisite references");
  it("handles concepts with no prerequisites");
  it("handles orphan concepts");
});
```

### 15.4 Mission Selection

```typescript
describe("MissionSelector", () => {
  // Normal cases
  it("selects learning mission when player has weak concepts");
  it("selects review mission when reviews are due");
  it("selects boss mission when all prerequisites met");
  it("selects daily mission for quick session mode");

  // Edge cases
  it("returns null when no mission is available");
  it("selects appropriate difficulty for player level");
  it("avoids selecting recently completed mission");
  it("prefers weaker concepts over stronger ones");

  // Constraint
  it("respects maximum question count");
  it("respects subject filter");
  it("maintains concept diversity");
});
```

### 15.5 Difficulty Adaptation

```typescript
describe("DifficultyAdapter", () => {
  it("increases difficulty after consecutive correct answers");
  it("decreases difficulty after consecutive incorrect answers");
  it("maintains difficulty with mixed performance");
  it("never exceeds configured max difficulty");
  it("never goes below configured min difficulty");
  it("adapts per concept, not globally");
  it("considers answer time in adaptation");
});
```

### 15.6 Repetition Control

```typescript
describe("RepetitionController", () => {
  it("allows repetition when educationally useful");
  it("blocks near-duplicate questions in same session");
  it("allows same concept with different wording");
  it("enforces minimum gap between identical questions");
  it("recognizes semantically similar questions");
  it("clears repetition block after concept review");
});
```

### 15.7 Semantic Fingerprinting

```typescript
describe("SemanticFingerprinter", () => {
  it("generates consistent fingerprint for identical content");
  it("generates different fingerprint for different content");
  it("normalizes whitespace and formatting");
  it("handles code content correctly");
  it("fingerprints are deterministic");
  it("fingerprint length is within limits");
});
```

### 15.8 Reward Calculation

```typescript
describe("XpCalculator", () => {
  it("awards base XP for correct answer");
  it("awards bonus XP for fast answer");
  it("awards bonus XP for streak");
  it("awards minimal XP for incorrect answer");
  it("applies difficulty multiplier");
  it("applies level multiplier");
  it("never awards negative XP");
  it("handles maximum XP cap");
});
```

### 15.9 Streak Recovery

```typescript
describe("StreakManager", () => {
  it("tracks consecutive days");
  it("offers streak recovery after missed day");
  it("resets streak after grace period expires");
  it("provides grace days");
  it("recovery mission restores partial streak");
  it("multiple consecutive misses exhaust recovery options");
});
```

### 15.10 Question Validation

```typescript
describe("QuestionValidator", () => {
  it("rejects missing question text");
  it("rejects missing options for multiple-choice");
  it("rejects duplicate option text");
  it("rejects missing correct answer");
  it("rejects options with excessive length");
  it("rejects questions without concept reference");
  it("accepts valid questions of each type");
  it("rejects negative difficulty values");
  it("rejects difficulty > 10");
});
```

### 15.11 Big Pickle Response Parsing

```typescript
describe("BigPickleResponseParser", () => {
  it("parses valid JSON response");
  it("extracts question fields correctly");
  it("extracts evaluation fields correctly");
  it("handles optional fields with defaults");
  it("throws on malformed JSON");
  it("throws on missing required fields");
  it("throws on incorrect types");
  it("sanitizes HTML/script content");
});
```

### 15.12 Big Pickle Failure Fallback

```typescript
describe("BigPickleFailover", () => {
  it("uses stored questions when AI unavailable");
  it("logs failure for monitoring");
  it("attempts retry before fallback");
  it("respects retry limit");
  it("returns valid question from fallback");
  it("does not use fallback when AI response is valid");
  it("handles timeout gracefully");
  it("game remains playable during outage");
});
```

### 15.13 Subject Parsing

```typescript
describe("SubjectParser", () => {
  it("parses valid subject file with all sections");
  it("parses frontmatter correctly");
  it("extracts all concepts");
  it("handles prerequisite references");
  it("parses question seeds");
  it("handles empty optional sections");
  it("preserves markdown content");
});
```

### 15.14 Subject-Version Migration

```typescript
describe("SubjectVersionMigration", () => {
  it("migrates from schema v0 to v1");
  it("handles already-current version");
  it("throws on unsupported version");
  it("preserves existing content after migration");
  it("migration is idempotent");
});
```

---

## 16. Required E2E Flows — Detailed

### Flow 1: New Player Journey

```
Pre-condition: No player exists with this identity.

Steps:
1. Player creates an account or starts as guest
2. Diagnostic mission is automatically triggered
3. Player answers 5 diagnostic questions
4. Player receives initial skill assessment
5. First learning mission is recommended
6. Player starts the mission
7. Player sees first question
8. Player submits an answer
9. Player receives feedback (explanation, mastery update, XP)
10. Progress is saved and displayed

Assertions:
- Player is created
- Assessment is generated
- Mission is created with appropriate questions
- Answer evaluation is correct
- Mastery is updated
- XP is awarded
- Progress persists after page reload
```

### Flow 2: Returning Player Review

```
Pre-condition: Player has completed at least one mission in the past.

Steps:
1. Player logs in
2. Due reviews are detected
3. Review notification is displayed
4. Player opens review session
5. Overdue concept questions are presented
6. Player recalls the information correctly
7. Mastery increases, review interval extends
8. Session ends with updated schedule

Assertions:
- Overdue reviews are identified
- Review questions target decaying concepts
- Correct recall extends the interval
- Mastery reflects the successful recall
```

### Flow 3: Boss Battle Completion

```
Pre-condition: Player has mastered all prerequisite concepts.

Steps:
1. Boss mission becomes available
2. Player starts boss mission
3. Phase 1: Recognize symptoms (multiple choice)
4. Player answers correctly → Phase 2
5. Phase 2: Identify the cause (code analysis)
6. Player answers correctly → Phase 3
7. Phase 3: Choose a repair (architecture decision)
8. Player selects correct approach → Phase 4
9. Phase 4: Explain trade-off (explain-it)
10. Player explains adequately
11. Boss defeated! Region unlocked
12. Reward presented

Assertions:
- Boss mission only appears when prerequisites met
- Each phase requires different question type
- Phases progress only on correct answers
- On failure, player can retry from current phase
- Region unlock is persisted
- Appropriate XP and rewards are granted
```

### Flow 4: AI Question Generation

```
Pre-condition: Stored question pool for this concept is empty.

Steps:
1. Mission requires a question for concept X
2. QuestionProvider finds no stored question
3. QuestionProvider calls ArtificialIntelligenceGateway
4. Big Pickle generates a question
5. ResponseParser extracts the question
6. QuestionValidator validates the generated content
7. Question passes validation
8. Question is stored in the question repository
9. Question is presented to the player
10. Player answers the generated question

Assertions:
- Generation is only triggered when stored pool is insufficient
- Request includes correct concept context
- Validation passes or question is rejected
- Rejected questions trigger regeneration (with limit)
- Valid questions are stored for reuse
- Player sees a properly formatted question
```

### Flow 5: AI Unavailable Fallback

```
Pre-condition: Big Pickle is unavailable (network error, timeout, 503).

Steps:
1. Mission requires a question for concept X
2. QuestionProvider calls ArtificialIntelligenceGateway
3. Big Pickle fails (timeout after configured limit)
4. Fallback mechanism activates
5. Stored questions for similar concepts are retrieved
6. Approved question is presented
7. Player answers successfully
8. Game continues without interruption
9. Failure is logged (without secrets)

Assertions:
- Game does not crash or hang
- Fallback produces a valid question
- Player cannot distinguish fallback from normal flow
- Failure is recorded for monitoring
- Next generation attempt may succeed
```

### Flow 6: New Subject Import

```
Pre-condition: Subject file does not exist in database.

Steps:
1. Subject file is placed in subjects/ directory
2. Import script or server action is triggered
3. SubjectFileReader reads the file
4. SubjectSchemaValidator validates the content
5. SubjectFrontmatterParser extracts metadata
6. SubjectSectionParser extracts domains and concepts
7. PrerequisiteGraphBuilder builds the graph
8. SubjectImportService persists the subject
9. Subject appears in available subjects
10. Missions can be created for the new subject

Assertions:
- Invalid files are rejected with clear errors
- Valid files parse completely
- Prerequisites are validated and built
- Duplicate imports are detected
- Subject is available for mission creation
- No code changes are required
```

---

## 17. Test Fixtures and Factories

### In-Memory Repositories

Every repository interface has an in-memory implementation for testing:

```typescript
// src/modules/players/infrastructure/__mocks__/in-memory-player-repository.ts
export class InMemoryPlayerRepository implements PlayerRepository {
  private players = new Map<string, Player>();

  async getById(id: string): Promise<Player | null> {
    return this.players.get(id) ?? null;
  }

  async save(player: Player): Promise<void> {
    this.players.set(player.id, player);
  }

  // ...
}
```

### Fake AI Gateway

```typescript
// src/modules/testing-support/fakes/fake-ai-gateway.ts
export class FakeAiGateway implements ArtificialIntelligenceGateway {
  constructor(private readonly controlledResponses: Map<string, unknown>) {}

  async generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult> {
    const key = `${request.conceptId}:${request.questionType}`;
    const response = this.controlledResponses.get(key);
    if (!response) {
      throw new AiProviderUnavailableError("No controlled response configured");
    }
    return response as GenerateQuestionResult;
  }

  isAvailable(): boolean {
    return true;
  }
  // ... other methods
}
```

### Test Data Factory

```typescript
// src/modules/testing-support/factories/test-data-factory.ts
export class TestDataFactory {
  static createPlayer(overrides?: Partial<PlayerProps>): Player {
    return Player.create({
      id: uuid(),
      email: "test@example.com",
      displayName: "Test Player",
      level: 1,
      xp: 0,
      ...overrides,
    });
  }

  static createQuestion(overrides?: Partial<QuestionProps>): Question {
    return Question.create({
      id: uuid(),
      conceptId: "javascript.event-loop",
      type: QuestionType.MultipleChoice,
      prompt: "What is the event loop?",
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      difficulty: 3,
      ...overrides,
    });
  }

  static createConceptMastery(overrides?: Partial<ConceptMasteryProps>): ConceptMastery {
    return ConceptMastery.create({
      conceptId: "javascript.event-loop",
      playerId: "test-player",
      score: 0.5,
      confidence: "medium",
      attempts: 10,
      ...overrides,
    });
  }
}
```

---

## 18. Testing Do's and Don'ts

### Do

- ✅ Write tests before or alongside implementation code.
- ✅ Use descriptive test names that describe behaviour, not implementation.
- ✅ Test edge cases: empty states, null values, maximum values, boundary conditions.
- ✅ Use in-memory repositories and fake AI gateways for unit tests.
- ✅ Run focused tests during development, full suite before commit.
- ✅ Add a regression test for every fixed bug.
- ✅ Ensure tests are deterministic — no random values, no time-dependent logic without control.
- ✅ Keep tests fast — slow tests discourage running them.
- ✅ Use factories for test data to reduce setup duplication.

### Don't

- ❌ Do not delete tests to pass CI. If a test is wrong, fix it or document why it must be removed.
- ❌ Do not weaken assertions (e.g., changing `toEqual` to `toMatchObject` without reason).
- ❌ Do not add broad test skips (`describe.skip`, `it.skip`) as a way to hide failures.
- ❌ Do not write tests that depend on external services being available (network, AI, etc.).
- ❌ Do not write tests that depend on specific wall-clock times.
- ❌ Do not test private methods — test the public behaviour.
- ❌ Do not test framework behaviour (Next.js routing, React rendering internals).
- ❌ Do not commit tests that do not run (stale `it.todo` is acceptable, `it.skip` is not).

---

**Related Documents**:

- [Main Flows](../architecture/main-flows.md) — What the use case tests verify
- [System Overview](../architecture/system-overview.md) — Architecture context for integration tests
- [Module Boundaries](../architecture/module-boundaries.md) — Rules enforced by architecture tests

# Phase 15 — Challenge Type Expansion & Variety

> **Goal:** Implement 3 new question types (`fill-blank`, `matching`, `ordering`) that exist in the `QuestionType` union but have no evaluator, validator, module, or React component registered.

**Why these 3?** The extension-points.md doc lists 10 question types. 6 are already wired (multiple-choice, true-false, code-prediction, bug-hunt, explain-it, multiple-select). 3 more exist in the `QuestionType` type union but have zero implementation: `fill-blank`, `matching`, `ordering`. (The doc also mentions `refactoring` and `architecture-decision` but those aren't even in the union type yet — out of scope.)

**Architecture approach:** All 3 types work within the existing `Question` model (`options: string[]`, `correctIndex: number`) and `AnswerEvaluator` pipeline (`selectedIndex === correctIndex`). The differentiation comes from:

- **Component UX** — each renders differently (text-input-looking for fill-blank, sequence for ordering, match-columns for matching)
- **Validator** — validates type-specific structural constraints
- **Renderer config** — reports different `inputType` for extensibility

**No pipeline changes needed.** The `SubmitAnswerInput`, `AnswerEvaluator`, `SubmitAnswerUseCase`, and API routes all remain untouched because these types still use `selectedIndex` selection under the hood.

**Tech stack:** TypeScript, React 19, inline styles (matching existing question renderers), Vitest

---

## Task Plan

### Task 1: Create `fill-blank` question type module

**Objective:** Implement evaluator, validator, module, and component for `fill-blank` questions — a fill-in-the-blank style where the stem shows a `___` marker and options are possible word/phrase fills.

**Files:**

- Create: `src/modules/questions/infrastructure/question-types/fill-blank-evaluator.ts`
- Create: `src/modules/questions/infrastructure/question-types/fill-blank-validator.ts`
- Create: `src/modules/questions/infrastructure/question-types/fill-blank-module.ts`
- Create: `src/modules/questions/presentation/components/question-renderers/fill-blank-question.tsx`
- Modify: `src/modules/questions/infrastructure/question-types/create-default-registry.ts` (add import + register)
- Modify: `src/modules/questions/presentation/components/question-renderers/question-renderer-router.tsx` (add route entry)

**1a: Create evaluator** — `fill-blank-evaluator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class FillBlankEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const isCorrect = answer.selectedIndex === question.correctIndex;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? `Correct! "${question.options[question.correctIndex]}" — ${question.explanation}`
        : `The correct answer is "${question.options[question.correctIndex]}". ${question.explanation}`,
      correctIndex: question.correctIndex,
    };
  }

  getExpectedInputType(): "selection" {
    return "selection";
  }
}
```

**1b: Create validator** — `fill-blank-validator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class FillBlankValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length < 2) {
      errors.push("Fill-blank questions require at least 2 options as possible answers.");
    }
    if (question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
      errors.push("Correct index must be within valid option range.");
    }
    if (!question.stem.includes("___") && !question.stem.includes("_")) {
      errors.push("Fill-blank questions should contain a blank indicator (___) in the stem.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length < 2) {
      errors.push("Fill-blank seeds require at least 2 options.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
```

**1c: Create module** — `fill-blank-module.ts`

```typescript
import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { FillBlankEvaluator } from "./fill-blank-evaluator";
import { FillBlankValidator } from "./fill-blank-validator";

export class FillBlankQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new FillBlankEvaluator();
  private readonly validator = new FillBlankValidator();

  getType(): QuestionType {
    return "fill-blank";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "FillBlankQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}
```

**1d: Create React component** — `fill-blank-question.tsx`

A component that renders the stem with the `___` blank highlighted, shows a small text-area UX that hints at fill-in behavior, but under the hood uses `onSelect(index)` when the user clicks an option button.

```typescript
import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function FillBlankQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  // Highlight ___ blank in the stem
  const parts = stem.split(/(___|_{3,})/g);

  return (
    <div>
      <div
        style={{
          background: "rgba(74, 158, 255, 0.08)",
          border: "1px solid rgba(74, 158, 255, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#4a9eff", fontWeight: 700, fontSize: "0.85rem" }}>
          ✏️ Fill in the Blank
        </span>
      </div>
      <p
        style={{
          color: "#fff",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          marginBottom: "1.25rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {parts.map((part, i) => {
          if (/^_{3,}$/.test(part)) {
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  minWidth: "5rem",
                  borderBottom: "2px solid #4a9eff",
                  margin: "0 0.25rem",
                  color: "#4a9eff",
                  fontWeight: 700,
                }}
              >
                {selectedIndex !== null ? options[selectedIndex] : " ___ "}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        Choose the correct word or phrase:
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#4a9eff" }}>
              {labelLetters[idx]}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**1e: Register in registry**

In `create-default-registry.ts`:

```typescript
import { FillBlankQuestionTypeModule } from "@/modules/questions/infrastructure/question-types/fill-blank-module";
// ...
registry.register(new FillBlankQuestionTypeModule());
```

**1f: Wire in router**

In `question-renderer-router.tsx`:

```typescript
import { FillBlankQuestion } from "./fill-blank-question";
// ...
const typeComponentMap: Record<string, React.FC<QuestionRendererProps>> = {
  // ...existing
  "fill-blank": FillBlankQuestion,
};
```

---

### Task 2: Create `ordering` question type module

**Objective:** Implement evaluator, validator, module, and component for `ordering` questions — presented as "What comes next?" sequence questions. Options contain possible next steps; user picks the correct one.

**Files:**

- Create: `src/modules/questions/infrastructure/question-types/ordering-evaluator.ts`
- Create: `src/modules/questions/infrastructure/question-types/ordering-validator.ts`
- Create: `src/modules/questions/infrastructure/question-types/ordering-module.ts`
- Create: `src/modules/questions/presentation/components/question-renderers/ordering-question.tsx`
- Modify: `create-default-registry.ts` (add import + register)
- Modify: `question-renderer-router.tsx` (add route entry)

**2a: Create evaluator** — `ordering-evaluator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class OrderingEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const isCorrect = answer.selectedIndex === question.correctIndex;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? `Correct order! ${question.explanation}`
        : `The correct next step is "${question.options[question.correctIndex]}". ${question.explanation}`,
      correctIndex: question.correctIndex,
    };
  }

  getExpectedInputType(): "order" {
    return "order";
  }
}
```

**2b: Create validator** — `ordering-validator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class OrderingValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length < 2) {
      errors.push("Ordering questions require at least 2 options as possible next steps.");
    }
    if (question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
      errors.push("Correct index must be within valid option range.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length < 2) {
      errors.push("Ordering seeds require at least 2 options.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
```

**2c: Create module** — `ordering-module.ts`

```typescript
import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { OrderingEvaluator } from "./ordering-evaluator";
import { OrderingValidator } from "./ordering-validator";

export class OrderingQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new OrderingEvaluator();
  private readonly validator = new OrderingValidator();

  getType(): QuestionType {
    return "ordering";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "OrderingQuestion",
      inputType: "order",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}
```

**2d: Create React component** — `ordering-question.tsx`

Shows items 1-N with a sequenced look, highlighting that steps come in order, but the user selects the next step via option buttons.

```typescript
import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

const numberIcons = ["①", "②", "③", "④", "⑤", "⑥"];

export function OrderingQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div>
      <div
        style={{
          background: "rgba(250, 204, 21, 0.08)",
          border: "1px solid rgba(250, 204, 21, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#eab308", fontWeight: 700, fontSize: "0.85rem" }}>
          🔄 Order the Steps
        </span>
      </div>
      <p
        style={{
          color: "#fff",
          fontSize: "1.15rem",
          lineHeight: 1.5,
          marginBottom: "1.25rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {stem}
      </p>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        What comes next?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#eab308" }}>
              {numberIcons[idx]}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**2e: Register in registry + wire in router** (same pattern as Task 1)

---

### Task 3: Create `matching` question type module

**Objective:** Implement evaluator, validator, module, and component for `matching` questions — presented as "Which item matches?" where the stem describes a reference item and options are possible matches.

**Files:**

- Create: `src/modules/questions/infrastructure/question-types/matching-evaluator.ts`
- Create: `src/modules/questions/infrastructure/question-types/matching-validator.ts`
- Create: `src/modules/questions/infrastructure/question-types/matching-module.ts`
- Create: `src/modules/questions/presentation/components/question-renderers/matching-question.tsx`
- Modify: `create-default-registry.ts` (add import + register)
- Modify: `question-renderer-router.tsx` (add route entry)

**3a: Create evaluator** — `matching-evaluator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type {
  QuestionEvaluator,
  EvaluationResult,
  PlayerAnswer,
} from "@/modules/questions/domain/interfaces/question-evaluator";

export class MatchingEvaluator implements QuestionEvaluator {
  evaluate(question: Question, answer: PlayerAnswer): EvaluationResult {
    const isCorrect = answer.selectedIndex === question.correctIndex;
    return {
      isCorrect,
      score: isCorrect ? 1 : 0,
      feedback: isCorrect
        ? `Correct match! ${question.explanation}`
        : `The correct match is "${question.options[question.correctIndex]}". ${question.explanation}`,
      correctIndex: question.correctIndex,
    };
  }

  getExpectedInputType(): "selection" {
    return "selection";
  }
}
```

**3b: Create validator** — `matching-validator.ts`

```typescript
import type { Question } from "@/modules/questions/domain/question";
import type { QuestionSeed } from "@/modules/subjects/domain/subject";
import type {
  QuestionValidator,
  ValidationResult,
} from "@/modules/questions/domain/interfaces/question-validator";

export class MatchingValidator implements QuestionValidator {
  validate(question: Question): ValidationResult {
    const errors: string[] = [];
    if (!question.options || question.options.length < 2) {
      errors.push("Matching questions require at least 2 options as possible matches.");
    }
    if (question.correctIndex < 0 || question.correctIndex >= (question.options?.length ?? 0)) {
      errors.push("Correct index must be within valid option range.");
    }
    return { isValid: errors.length === 0, errors };
  }

  validateSeed(seed: QuestionSeed): ValidationResult {
    const errors: string[] = [];
    if (!seed.options || seed.options.length < 2) {
      errors.push("Matching seeds require at least 2 options.");
    }
    return { isValid: errors.length === 0, errors };
  }
}
```

**3c: Create module** — `matching-module.ts`

```typescript
import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { MatchingEvaluator } from "./matching-evaluator";
import { MatchingValidator } from "./matching-validator";

export class MatchingQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new MatchingEvaluator();
  private readonly validator = new MatchingValidator();

  getType(): QuestionType {
    return "matching";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "MatchingQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}
```

**3d: Create React component** — `matching-question.tsx`

Shows the stem as a reference item with a "match" badge, options as possible matches.

```typescript
import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function MatchingQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div>
      <div
        style={{
          background: "rgba(168, 85, 247, 0.08)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>
          🔗 Match the Concept
        </span>
      </div>
      <div
        style={{
          background: "rgba(168, 85, 247, 0.05)",
          border: "1px dashed rgba(168, 85, 247, 0.3)",
          borderRadius: 6,
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>
          Reference:{'  '}
        </span>
        <span style={{ color: "#fff", fontSize: "1rem" }}>{stem}</span>
      </div>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        Which option matches?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#a855f7" }}>
              {labelLetters[idx]}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**3e: Register in registry + wire in router** (same pattern)

---

### Task 4: Test and verify

**Objective:** Run `npm run verify:full` to ensure all 3 new types are properly registered, linted, type-checked, and built without breaking existing tests.

**Note:** These question types all use the same `selectedIndex === correctIndex` evaluation as `multiple-choice` does at the pipeline level. The AnswerEvaluator already delegates to per-type evaluators when a registry is present. The existing `submit-answer.use-case.test.ts` and `answer-evaluator.test.ts` already cover the evaluation pipeline generically. The validator is tested via the existing `question-validator` tests.

No new dedicated test files are needed at this time because:

- The evaluators delegate to the same exact-index-match logic
- The validators check the same structural invariants as existing validators
- The components are pure presentation with no state logic
- The registry already has tests for registration/deduplication/retrieval

**Command:**

```bash
cd /home/strubloid/apps/frontend-hero && npm run verify:full
```

Expected: 380+ tests passing, build clean, 0 depcruise errors.

---

### Task 5: Update documentation

**Objective:** Update AGENTS.md to mark Phase 15 limitations resolved for challenge type variety, and update `docs/project-status.md` to reflect Phase 15 status.

**Files:**

- Modify: `AGENTS.md` — Limitations item #1: update from "not yet implemented. Planned for Phase 15" to "now implemented: fill-blank, ordering, and matching types"
- Modify: `docs/project-status.md` — Add Phase 15 entry to timeline

---

## Risks and Open Questions

1. **Subject files don't contain any `fill-blank`/`matching`/`ordering` questions yet** — after this phase, authors can start writing those question types in subject `.md` files. A follow-up can add sample questions to existing subjects.
2. **The current `Question` model only stores `options: string[]` and `correctIndex: number`** — this limits these types to selection-based UX. A future enhancement could add a `value` field to `SubmitAnswerInput` and `PlayerAnswer` for true text-input evaluation.
3. **No new tests for type-specific evaluators** — the evaluators are thin wrappers around exact-index-match. Since the AnswerEvaluator pipeline is already tested, adding dedicated evaluator tests is low-value. Validator logic mirrors existing patterns.
4. **The extension-points.md doc mentions `refactoring` and `architecture-decision` types** — those aren't in the `QuestionType` union type. They're deferred to a future phase if needed.

## Verification Checklist

- [ ] `fill-blank` evaluator, validator, module, component all created
- [ ] `ordering` evaluator, validator, module, component all created
- [ ] `matching` evaluator, validator, module, component all created
- [ ] All 3 registered in `create-default-registry.ts`
- [ ] All 3 wired in `question-renderer-router.tsx`
- [ ] `npm run verify:full` passes (format, lint, type-check, depcruise, build, tests)
- [ ] AGENTS.md limitation #1 updated
- [ ] `docs/project-status.md` Phase 15 timeline added

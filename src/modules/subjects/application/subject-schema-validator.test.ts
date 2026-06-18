import { describe, it, expect } from "vitest";
import { SubjectSchemaValidator, formatValidationFailures } from "./subject-schema-validator";
import type { Subject, Concept, QuestionSeed } from "@/modules/subjects/domain/subject";
import type { SubjectProgression } from "@/modules/subjects/domain/subject-level";

function makeSubject(overrides?: Partial<Subject>): Subject {
  return {
    id: "test",
    title: "Test Subject",
    description: "A test subject",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
    domains: [],
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
    ...overrides,
    progression: {
      minimumLevel: 1,
      maximumLevel: 10,
      estimatedDaysPerLevel: 7,
      bossRequired: true,
      levels: [
        {
          level: 1,
          title: "Foundations",
          description: "Core concepts",
          difficultyRange: { minimum: 1, maximum: 2 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 20,
          requiredReviewEncounters: 5,
          concepts: [],
          allowedChallengeTypes: ["multiple-choice", "code-prediction"],
        },
      ],
    },
  };
}

function makeConcept(id: string, overrides?: Partial<Concept>): Concept {
  return {
    id,
    name: id.replace(/\./g, " "),
    domainName: "Test Domain",
    subjectId: "test",
    level: "foundation",
    difficulty: 2,
    prerequisites: [],
    tags: [],
    outcomes: ["Understand " + id],
    knowledge: "Knowledge content for " + id,
    commonMisconceptions: [],
    examples: [],
    questionSeeds: [],
    practicalChallenges: [],
    interviewPrompts: [],
    ...overrides,
  };
}

function makeSeed(overrides?: Partial<QuestionSeed>): QuestionSeed {
  return {
    seedId: "seed-001",
    type: "multiple-choice",
    difficulty: 2,
    stem: "What is X?",
    options: ["A", "B", "C"],
    correctIndex: 0,
    explanation: "Because...",
    ...overrides,
  };
}

describe("SubjectSchemaValidator", () => {
  const validator = new SubjectSchemaValidator();

  describe("subject-level validation", () => {
    it("passes for a valid minimal subject", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Foundations",
            concepts: [makeConcept("js.basics")],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("rejects when subject id is missing", () => {
      const subject = makeSubject({
        id: "",
        domains: [
          {
            name: "Foundations",
            concepts: [makeConcept("js.basics")],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("id"))).toBe(true);
    });

    it("warns when subject title is missing", () => {
      const subject = makeSubject({
        title: "",
        domains: [
          {
            name: "Foundations",
            concepts: [makeConcept("js.basics")],
          },
        ],
      });
      const result = validator.validate(subject);
      // Title missing is a warning, not an error
      expect(result.warnings.some((w) => w.includes("title"))).toBe(true);
    });

    it("rejects schemaVersion < 1", () => {
      const subject = makeSubject({
        schemaVersion: 0,
        domains: [
          {
            name: "Foundations",
            concepts: [makeConcept("js.basics")],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("schemaVersion"))).toBe(true);
    });

    it("warns when subject has no domains", () => {
      const subject = makeSubject();
      const result = validator.validate(subject);
      expect(result.warnings.some((w) => w.includes("no domains"))).toBe(true);
    });
  });

  describe("domain-level validation", () => {
    it("rejects duplicate domain names", () => {
      const subject = makeSubject({
        domains: [
          { name: "Duplicate", concepts: [makeConcept("a")] },
          { name: "Duplicate", concepts: [makeConcept("b")] },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Duplicate domain"))).toBe(true);
    });

    it("warns when a domain has no concepts", () => {
      const subject = makeSubject({
        domains: [{ name: "Empty", concepts: [] }],
      });
      const result = validator.validate(subject);
      expect(result.warnings.some((w) => w.includes("no concepts"))).toBe(true);
    });
  });

  describe("concept-level validation", () => {
    it("rejects duplicate concept IDs", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "A",
            concepts: [makeConcept("dup"), makeConcept("dup")],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Duplicate concept"))).toBe(true);
    });

    it("rejects invalid concept level", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("bad-level", { level: "expert" as any })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid level"))).toBe(true);
    });

    it("accepts all valid concept levels", () => {
      for (const level of ["foundation", "intermediate", "advanced", "senior"] as const) {
        const subject = makeSubject({
          domains: [
            {
              name: "Test",
              concepts: [makeConcept("concept." + level, { level })],
            },
          ],
        });
        const result = validator.validate(subject);
        expect(result.valid).toBe(true);
      }
    });

    it("rejects difficulty below minimum", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("low", { difficulty: 0 })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("difficulty"))).toBe(true);
    });

    it("rejects difficulty above maximum", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("high", { difficulty: 6 })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("difficulty"))).toBe(true);
    });

    it("accepts boundary difficulty values (1 and 5)", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [
              makeConcept("min", { difficulty: 1 }),
              makeConcept("max", { difficulty: 5 }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
    });

    it("warns about unknown prerequisite", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("a", { prerequisites: ["nonexistent"] })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.warnings.some((w) => w.includes("unknown prerequisite"))).toBe(true);
    });

    it("rejects self-referencing prerequisite", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("self-loop", { prerequisites: ["self-loop"] })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("itself as a prerequisite"))).toBe(true);
    });

    it("warns when concept has empty knowledge", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("empty-knowledge", { knowledge: "" })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.warnings.some((w) => w.includes("no knowledge"))).toBe(true);
    });

    it("allows known prerequisites from the same subject", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("a"), makeConcept("b", { prerequisites: ["a"] })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });

    it("allows forward prerequisite references from the same subject", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [makeConcept("b", { prerequisites: ["a"] }), makeConcept("a")],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
      expect(result.warnings).toEqual([]);
    });
  });

  describe("question seed validation", () => {
    it("rejects invalid question type", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [
              makeConcept("c", {
                questionSeeds: [makeSeed({ type: "essay" as any })],
              }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("Invalid question type"))).toBe(true);
    });

    it("rejects insufficient options for multiple-choice", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [
              makeConcept("c", {
                questionSeeds: [
                  makeSeed({ type: "multiple-choice", options: ["A"], correctIndex: 0 }),
                ],
              }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("at least 2 options"))).toBe(true);
    });

    it("rejects missing correctIndex", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [
              makeConcept("c", {
                questionSeeds: [makeSeed({ correctIndex: undefined as any })],
              }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("correctIndex"))).toBe(true);
    });

    it("rejects correctIndex out of range", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: [
              makeConcept("c", {
                questionSeeds: [makeSeed({ options: ["A", "B", "C"], correctIndex: 5 })],
              }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes("correctIndex"))).toBe(true);
    });

    it("accepts all valid question types", () => {
      const types = [
        "multiple-choice",
        "multiple-select",
        "true-false",
        "fill-blank",
        "code-prediction",
        "matching",
        "ordering",
      ] as const;
      const subject = makeSubject({
        domains: [
          {
            name: "Test",
            concepts: types.map((type, i) =>
              makeConcept(`c${i}`, {
                questionSeeds: [makeSeed({ type, seedId: `seed-${i}` })],
              }),
            ),
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
    });
  });

  describe("validateDetailed — line number annotation", () => {
    it("returns no parse errors for a valid subject", () => {
      const subject = makeSubject({
        domains: [
          {
            name: "Foundations",
            concepts: [makeConcept("js.basics")],
          },
        ],
      });
      const detail = validator.validateDetailed(subject, "---\nid: test\n---\n");
      expect(detail.valid).toBe(true);
      expect(detail.errors).toEqual([]);
      expect(detail.parseErrors).toEqual([]);
    });

    it("adds line numbers when parse errors include a matching rawFragment", () => {
      const rawText = "---\nid: test\n---\n# Domain\n## Concept\n";
      const withLines = validator.annotateWithLineNumbers(
        [
          {
            message: "Bad concept",
            severity: "error",
            code: "TEST_ERROR",
            rawFragment: "## Concept",
          },
        ],
        rawText,
      );
      expect(withLines).toEqual([
        {
          message: "Bad concept",
          severity: "error",
          code: "TEST_ERROR",
          rawFragment: "## Concept",
          line: 5,
        },
      ]);
    });
  });

  describe("formatValidationFailures", () => {
    it("returns success message when valid with no warnings", () => {
      const result = { valid: true, errors: [], warnings: [] };
      const output = formatValidationFailures(result);
      expect(output).toContain("passed");
    });

    it("includes error count when invalid", () => {
      const result = {
        valid: false,
        errors: ["Something went wrong"],
        warnings: [],
      };
      const output = formatValidationFailures(result);
      expect(output).toContain("FAILED");
      expect(output).toContain("1 error");
    });

    it("includes warnings when present", () => {
      const result = {
        valid: true,
        errors: [],
        warnings: ["Check this"],
      };
      const output = formatValidationFailures(result);
      expect(output).toContain("WARN");
      expect(output).toContain("Check this");
    });
  });

  describe("cross-domain prerequisite references", () => {
    it("allows prerequisite in a different domain within same subject", () => {
      const subject = makeSubject({
        domains: [
          { name: "JS", concepts: [makeConcept("js.basics")] },
          {
            name: "React",
            concepts: [makeConcept("react.core", { prerequisites: ["js.basics"] })],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
    });
  });

  describe("minimal valid subjects", () => {
    it("accepts subject with all fields properly set", () => {
      const subject = makeSubject({
        id: "nextjs",
        title: "Next.js",
        description: "Learning path",
        version: 2,
        schemaVersion: 2,
        minimumGameVersion: "1.0.0",
        domains: [
          {
            name: "Foundations",
            concepts: [
              makeConcept("js.event-loop", {
                level: "intermediate" as const,
                difficulty: 3,
                prerequisites: ["js.call-stack", "js.promises"],
                tags: ["javascript", "async"],
                outcomes: ["Explain event loop", "Use async/await"],
                knowledge: "## The Event Loop\n\nThe event loop...",
                commonMisconceptions: ["setTimeout is guaranteed to run after N ms"],
                examples: ["```js\nconsole.log('hi')\n```"],
                questionSeeds: [
                  makeSeed({
                    seedId: "el-001",
                    type: "multiple-choice",
                    difficulty: 2,
                    stem: "What runs first?",
                    options: ["Microtask", "Macrotask", "Render", "Callback"],
                    correctIndex: 0,
                    explanation: "Microtasks run before macrotasks.",
                  }),
                ],
              }),
            ],
          },
        ],
      });
      const result = validator.validate(subject);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
});

import { describe, it, expect, beforeEach } from "vitest";
import { SubjectFileReader } from "./subject-file-reader";
import { SubjectFrontmatterParser } from "./subject-frontmatter-parser";
import { SubjectSectionParser } from "./subject-section-parser";
import { ConceptParser } from "./concept-parser";
import { SubjectSchemaValidator } from "./subject-schema-validator";
import { PrerequisiteGraphBuilder } from "./prerequisite-graph-builder";
import { SubjectImportService } from "./subject-import-service";
import { Subject } from "@/modules/subjects/domain/subject";
import type { SubjectProgression } from "@/modules/subjects/domain/subject-level";

/* ------------------------------------------------------------------ */
/*  Helpers for building test subjects                                  */
/* ------------------------------------------------------------------ */

function buildMinimalValidSubject(): Subject {
  return {
    id: "test-subject",
    title: "Test Subject",
    description: "A test subject",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
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
    domains: [
      {
        name: "Domain A",
        concepts: [
          {
            id: "concept.one",
            name: "Concept One",
            domainName: "Domain A",
            subjectId: "test-subject",
            level: "foundation",
            difficulty: 2,
            prerequisites: [],
            tags: ["tag1"],
            outcomes: ["Outcome 1"],
            knowledge: "Some knowledge",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [
              {
                seedId: "seed-001",
                type: "multiple-choice",
                difficulty: 1,
                stem: "What is 2+2?",
                options: ["3", "4", "5"],
                correctIndex: 1,
                explanation: "2+2=4",
              },
            ],
            practicalChallenges: [],
            interviewPrompts: [],
          },
          {
            id: "concept.two",
            name: "Concept Two",
            domainName: "Domain A",
            subjectId: "test-subject",
            level: "intermediate",
            difficulty: 3,
            prerequisites: ["concept.one"],
            tags: [],
            outcomes: ["Outcome 2"],
            knowledge: "More knowledge",
            commonMisconceptions: [],
            examples: [],
            questionSeeds: [],
            practicalChallenges: [],
            interviewPrompts: [],
          },
        ],
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

/* ------------------------------------------------------------------ */
/*  SubjectFileReader Tests                                             */
/* ------------------------------------------------------------------ */

describe("SubjectFileReader", () => {
  it("reads a file and returns its content as a string", async () => {
    const reader = new SubjectFileReader("subjects");
    const content = await reader.read("nextjs");
    expect(content).toBeTruthy();
    expect(typeof content).toBe("string");
    expect(content.length).toBeGreaterThan(100);
    expect(content).toContain("id: nextjs");
  });

  it("throws when the subject file does not exist", async () => {
    const reader = new SubjectFileReader("subjects");
    await expect(reader.read("nonexistent-subject")).rejects.toThrow(/Subject file not found/);
  });
});

/* ------------------------------------------------------------------ */
/*  SubjectFrontmatterParser Tests                                      */
/* ------------------------------------------------------------------ */

describe("SubjectFrontmatterParser", () => {
  const parser = new SubjectFrontmatterParser();

  it("parses frontmatter from valid markdown", () => {
    const content = `---
id: nextjs
title: Next.js
version: 1
schemaVersion: 1
description: A description
minimumGameVersion: 1.0.0
---

# Body
`;
    const result = parser.parse(content);
    expect(result.id).toBe("nextjs");
    expect(result.title).toBe("Next.js");
    expect(result.version).toBe(1);
    expect(result.schemaVersion).toBe(1);
    expect(result.description).toBe("A description");
    expect(result.minimumGameVersion).toBe("1.0.0");
  });

  it("extracts body content after frontmatter", () => {
    const content = `---
id: test
---

# Domain: Test Domain

Some content
`;
    const body = parser.extractBody(content);
    expect(body).toContain("# Domain: Test Domain");
    expect(body).toContain("Some content");
    expect(body).not.toContain("id: test");
  });

  it("returns entire content as body if no frontmatter", () => {
    const content = "# Just a heading\n\nSome text";
    expect(parser.parse(content)).toEqual({});
    expect(parser.extractBody(content)).toBe(content);
  });

  it("handles boolean and numeric conversion", () => {
    const content = `---
active: true
count: 42
rate: 3.5
---

Body
`;
    const result = parser.parse(content);
    expect(result.active).toBe(true);
    expect(result.count).toBe(42);
    expect(result.rate).toBe(3.5);
  });

  it("handles quoted string values", () => {
    const content = `---
title: "My Subject"
---

Body
`;
    const result = parser.parse(content);
    expect(result.title).toBe("My Subject");
  });
});

/* ------------------------------------------------------------------ */
/*  SubjectSectionParser Tests                                          */
/* ------------------------------------------------------------------ */

describe("SubjectSectionParser", () => {
  const parser = new SubjectSectionParser();

  it("parses domains and concepts from body", () => {
    const body = `# Domain: JavaScript Foundations

## Concept: Event Loop

### Metadata

- id: javascript.event-loop

### Knowledge

Some knowledge here

## Concept: Promises

### Metadata

- id: javascript.promises
`;

    const result = parser.parse(body);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("JavaScript Foundations");
    expect(result[0].concepts).toHaveLength(2);
    expect(result[0].concepts[0].name).toBe("Event Loop");
    expect(result[0].concepts[1].name).toBe("Promises");
  });

  it("parses multiple domains", () => {
    const body = `# Domain: JavaScript

## Concept: Closures

### Metadata

- id: javascript.closures

# Domain: React

## Concept: Hooks

### Metadata

- id: react.hooks
`;

    const result = parser.parse(body);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("JavaScript");
    expect(result[1].name).toBe("React");
  });

  it("captures subsection content", () => {
    const body = `# Domain: Test

## Concept: Test Concept

### Knowledge

Line one
Line two

### Examples

\`\`\`javascript
console.log("hello");
\`\`\`
`;

    const result = parser.parse(body);
    expect(result[0].concepts[0].subsections).toHaveLength(2);
    expect(result[0].concepts[0].subsections[0].title).toBe("Knowledge");
    expect(result[0].concepts[0].subsections[0].content).toContain("Line one");
    expect(result[0].concepts[0].subsections[1].title).toBe("Examples");
  });
});

/* ------------------------------------------------------------------ */
/*  ConceptParser Tests                                                 */
/* ------------------------------------------------------------------ */

describe("ConceptParser", () => {
  const parser = new ConceptParser();

  it("builds a Concept from parsed sections", () => {
    const parsedConcept = {
      name: "Event Loop",
      subsections: [
        {
          title: "Metadata",
          content: `- id: javascript.event-loop
- level: foundation
- difficulty: 2
- prerequisites:
  - javascript.call-stack
- tags:
  - javascript
  - async
- outcomes:
  - Explain the call stack`,
        },
        {
          title: "Knowledge",
          content: "The event loop is a mechanism that handles async operations.",
        },
        {
          title: "Common Misconceptions",
          content:
            "- setTimeout(cb, 0) does not execute immediately\n- Promises are not synchronous",
        },
        {
          title: "Examples",
          content: '```javascript\nconsole.log("hi");\n```',
        },
      ],
    };

    const concept = parser.parse(parsedConcept, "nextjs", "JavaScript Foundations");
    expect(concept.id).toBe("javascript.event-loop");
    expect(concept.name).toBe("Event Loop");
    expect(concept.domainName).toBe("JavaScript Foundations");
    expect(concept.subjectId).toBe("nextjs");
    expect(concept.level).toBe("foundation");
    expect(concept.difficulty).toBe(2);
    expect(concept.prerequisites).toEqual(["javascript.call-stack"]);
    expect(concept.tags).toEqual(["javascript", "async"]);
    expect(concept.outcomes).toEqual(["Explain the call stack"]);
    expect(concept.knowledge).toContain("event loop");
    expect(concept.commonMisconceptions).toHaveLength(2);
    expect(concept.examples).toHaveLength(1);
    expect(concept.examples[0]).toContain("console.log");
  });

  it("parses question seeds from a subsection", () => {
    const parsedConcept = {
      name: "Event Loop",
      subsections: [
        {
          title: "Metadata",
          content: "- id: javascript.event-loop\n- level: foundation\n- difficulty: 2",
        },
        {
          title: "Question Seeds",
          content: `**seed-001**:
- type: multiple-choice
- difficulty: 1
- stem: "What is the output?"
- options: ["a", "b", "c", "d"]
- correctIndex: 1
- explanation: "Explanation text"

**seed-002**:
- type: multiple-choice
- difficulty: 2
- stem: "Second question?"
- options: ["x", "y", "z"]
- correctIndex: 0
- explanation: "Second explanation"`,
        },
      ],
    };

    const concept = parser.parse(parsedConcept, "nextjs", "JS");
    expect(concept.questionSeeds).toHaveLength(2);
    expect(concept.questionSeeds[0].seedId).toBe("seed-001");
    expect(concept.questionSeeds[0].type).toBe("multiple-choice");
    expect(concept.questionSeeds[0].difficulty).toBe(1);
    expect(concept.questionSeeds[0].options).toEqual(["a", "b", "c", "d"]);
    expect(concept.questionSeeds[0].correctIndex).toBe(1);
    expect(concept.questionSeeds[1].seedId).toBe("seed-002");
    expect(concept.questionSeeds[1].options).toEqual(["x", "y", "z"]);
    expect(concept.questionSeeds[1].correctIndex).toBe(0);
  });

  it("parses practical challenges", () => {
    const parsedConcept = {
      name: "Event Loop",
      subsections: [
        {
          title: "Metadata",
          content: "- id: javascript.event-loop\n- level: foundation\n- difficulty: 2",
        },
        {
          title: "Practical Challenges",
          content: `**challenge-001**:
- type: code-prediction
- difficulty: 2
- prompt: "Predict the output"
- solution: "The answer"`,
        },
      ],
    };

    const concept = parser.parse(parsedConcept, "nextjs", "JS");
    expect(concept.practicalChallenges).toHaveLength(1);
    expect(concept.practicalChallenges[0].challengeId).toBe("challenge-001");
    expect(concept.practicalChallenges[0].prompt).toBe("Predict the output");
  });

  it("parses interview prompts", () => {
    const parsedConcept = {
      name: "Event Loop",
      subsections: [
        {
          title: "Metadata",
          content: "- id: javascript.event-loop\n- level: foundation\n- difficulty: 2",
        },
        {
          title: "Interview Prompts",
          content: `**interview-001**:
- prompt: "Explain event loop"
- evaluationCriteria: ["Accuracy", "Clarity"]`,
        },
      ],
    };

    const concept = parser.parse(parsedConcept, "nextjs", "JS");
    expect(concept.interviewPrompts).toHaveLength(1);
    expect(concept.interviewPrompts[0].promptId).toBe("interview-001");
    expect(concept.interviewPrompts[0].prompt).toBe("Explain event loop");
    expect(concept.interviewPrompts[0].evaluationCriteria).toEqual(["Accuracy", "Clarity"]);
  });

  it("defaults missing fields gracefully", () => {
    const parsedConcept = {
      name: "Minimal",
      subsections: [
        {
          title: "Metadata",
          content: "- id: minimal.concept\n- level: unknown\n- difficulty: 99",
        },
      ],
    };

    const concept = parser.parse(parsedConcept, "test", "Test");
    expect(concept.id).toBe("minimal.concept");
    expect(concept.level).toBe("foundation"); // falls back to foundation
    expect(concept.difficulty).toBe(5); // clamped to max 5
    expect(concept.prerequisites).toEqual([]);
    expect(concept.tags).toEqual([]);
    expect(concept.outcomes).toEqual([]);
    expect(concept.knowledge).toBe("");
    expect(concept.commonMisconceptions).toEqual([]);
    expect(concept.examples).toEqual([]);
    expect(concept.questionSeeds).toEqual([]);
    expect(concept.practicalChallenges).toEqual([]);
    expect(concept.interviewPrompts).toEqual([]);
  });
});

/* ------------------------------------------------------------------ */
/*  SubjectSchemaValidator Tests                                        */
/* ------------------------------------------------------------------ */

describe("SubjectSchemaValidator", () => {
  const validator = new SubjectSchemaValidator();

  it("passes a valid subject", () => {
    const subject = buildMinimalValidSubject();
    const result = validator.validate(subject);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects missing id on subject", () => {
    const subject = buildMinimalValidSubject();
    subject.id = "";
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("id"))).toBe(true);
  });

  it("rejects difficulty outside 1-5 range", () => {
    const subject = buildMinimalValidSubject();
    subject.domains[0].concepts[0].difficulty = 0;
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("difficulty"))).toBe(true);
  });

  it("rejects difficulty above 5", () => {
    const subject = buildMinimalValidSubject();
    subject.domains[0].concepts[0].difficulty = 6;
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("difficulty"))).toBe(true);
  });

  it("rejects invalid level", () => {
    const subject = buildMinimalValidSubject();
    (subject.domains[0].concepts[0].level as string) = "expert";
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("level"))).toBe(true);
  });

  it("warns about non-existent prerequisites", () => {
    const subject = buildMinimalValidSubject();
    subject.domains[0].concepts[0].prerequisites = ["nonexistent.concept"];
    const result = validator.validate(subject);
    // Should still be valid (warnings only)
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes("nonexistent.concept"))).toBe(true);
  });

  it("rejects invalid question seed type", () => {
    const subject = buildMinimalValidSubject();
    // Cast to 'any' to override the type
    (subject.domains[0].concepts[0].questionSeeds[0] as any).type = "essay";
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("type"))).toBe(true);
  });

  it("rejects question seed with too few options", () => {
    const subject = buildMinimalValidSubject();
    subject.domains[0].concepts[0].questionSeeds[0].options = ["only one"];
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("options"))).toBe(true);
  });

  it("rejects question seed with invalid correctIndex", () => {
    const subject = buildMinimalValidSubject();
    subject.domains[0].concepts[0].questionSeeds[0].correctIndex = 99;
    const result = validator.validate(subject);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("correctIndex"))).toBe(true);
  });
});

/* ------------------------------------------------------------------ */
/*  PrerequisiteGraphBuilder Tests                                      */
/* ------------------------------------------------------------------ */

describe("PrerequisiteGraphBuilder", () => {
  const builder = new PrerequisiteGraphBuilder();

  it("returns prerequisites for a concept", () => {
    const concept = buildMinimalValidSubject().domains[0].concepts[1];
    const graph = builder.build(buildMinimalValidSubject().domains[0].concepts);
    expect(graph.getPrerequisites("concept.two")).toEqual(["concept.one"]);
    expect(graph.getPrerequisites("concept.one")).toEqual([]);
  });

  it("returns dependents for a concept", () => {
    const graph = builder.build(buildMinimalValidSubject().domains[0].concepts);
    expect(graph.getDependents("concept.one")).toContain("concept.two");
    expect(graph.getDependents("concept.two")).toEqual([]);
  });

  it("returns available concepts given mastered IDs", () => {
    const graph = builder.build(buildMinimalValidSubject().domains[0].concepts);
    // Nothing mastered — only concepts with no prerequisites available
    const available = graph.getAvailableConcepts(new Set());
    expect(available).toContain("concept.one");
    expect(available).not.toContain("concept.two");

    // Master concept.one — concept.two becomes available
    const available2 = graph.getAvailableConcepts(new Set(["concept.one"]));
    expect(available2).toContain("concept.two");
  });

  it("returns all concept IDs", () => {
    const graph = builder.build(buildMinimalValidSubject().domains[0].concepts);
    expect(graph.getAllConceptIds()).toEqual(["concept.one", "concept.two"]);
  });
});

/* ------------------------------------------------------------------ */
/*  SubjectImportService Integration Tests                              */
/* ------------------------------------------------------------------ */

describe("SubjectImportService (integration)", () => {
  const reader = new SubjectFileReader("subjects");
  const frontmatterParser = new SubjectFrontmatterParser();
  const sectionParser = new SubjectSectionParser();
  const conceptParser = new ConceptParser();
  const validator = new SubjectSchemaValidator();
  const graphBuilder = new PrerequisiteGraphBuilder();

  const importService = new SubjectImportService(
    reader,
    frontmatterParser,
    sectionParser,
    conceptParser,
    validator,
    graphBuilder,
  );

  it("parses subjects/nextjs.md end-to-end", async () => {
    const result = await importService.import("nextjs");

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.subject.id).toBe("nextjs");
    expect(result.subject.title).toBe("Next.js");
    expect(result.subject.version).toBe(3);
    expect(result.subject.schemaVersion).toBe(1);
    expect(result.subject.progression?.levels).toHaveLength(10);

    const progressionConceptIds = new Set(
      result.subject.progression?.levels.flatMap((level) => level.concepts) ?? [],
    );
    const bodyConcepts = result.subject.domains.flatMap((domain) => domain.concepts);
    const bodyConceptIds = new Set(bodyConcepts.map((concept) => concept.id));

    expect(result.subject.domains).toHaveLength(10);
    expect(progressionConceptIds.size).toBe(33);
    expect(bodyConcepts).toHaveLength(33);

    for (const conceptId of progressionConceptIds) {
      expect(bodyConceptIds.has(conceptId), `missing body for ${conceptId}`).toBe(true);
    }

    for (const concept of bodyConcepts) {
      expect(progressionConceptIds.has(concept.id), `${concept.id} is not in progression`).toBe(
        true,
      );
      expect(
        concept.questionSeeds.length,
        `${concept.id} needs at least 3 seeds`,
      ).toBeGreaterThanOrEqual(3);
      expect(
        concept.practicalChallenges.length,
        `${concept.id} needs a practical challenge`,
      ).toBeGreaterThanOrEqual(1);
    }

    expect(result.graph.getAllConceptIds()).toHaveLength(33);
  });
});

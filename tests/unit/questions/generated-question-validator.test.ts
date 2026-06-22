import { describe, it, expect } from "vitest";
import { GeneratedQuestionValidator } from "@/modules/questions/application/generated-question-validator";
import { GeneratedQuestionDeduper } from "@/modules/questions/application/generated-question-deduper";
import type { QuestionItem } from "@/modules/artificial-intelligence/domain/generate-question-result";
import type { Question } from "@/modules/questions/domain/question";

// ── Validator tests ──────────────────────────────────────────────────────────

describe("GeneratedQuestionValidator", () => {
  const validator = new GeneratedQuestionValidator();

  const validQuestion: QuestionItem = {
    type: "multiple-choice",
    stem: "What is the correct way to fetch data in a Next.js server component?",
    options: ["using useEffect", "using async/await directly", "using useQuery", "using SWR"],
    correctIndex: 1,
    explanation: "Server components support async/await directly without hooks.",
    difficulty: 2,
  };

  it("accepts a fully valid question", () => {
    const errors = validator.validate(validQuestion, 0);
    expect(errors).toHaveLength(0);
  });

  it("rejects empty stem", () => {
    const errors = validator.validate({ ...validQuestion, stem: "" }, 0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].message).toMatch(/stem/i);
  });

  it("rejects missing options", () => {
    const errors = validator.validate({ ...validQuestion, options: [] }, 0);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.message.includes("Options"))).toBe(true);
  });

  it("rejects correctIndex out of bounds", () => {
    const errors = validator.validate({ ...validQuestion, correctIndex: 99 }, 0);
    expect(errors.some((e) => e.message.includes("correctIndex"))).toBe(true);
  });

  it("rejects empty explanation", () => {
    const errors = validator.validate({ ...validQuestion, explanation: "   " }, 0);
    expect(errors.some((e) => e.message.includes("Explanation"))).toBe(true);
  });

  it("rejects invalid difficulty", () => {
    const errors = validator.validate({ ...validQuestion, difficulty: 0 }, 0);
    expect(errors.some((e) => e.message.includes("Difficulty"))).toBe(true);
  });

  it("rejects invalid type", () => {
    const errors = validator.validate({ ...validQuestion, type: "essay" }, 0);
    expect(errors.some((e) => e.message.includes("Type"))).toBe(true);
  });

  it("rejects duplicate options (case-insensitive)", () => {
    const errors = validator.validate(
      { ...validQuestion, options: ["using useEffect", "using useEffect", "option3", "option4"] },
      0,
    );
    expect(errors.some((e) => e.message.includes("duplicate"))).toBe(true);
  });

  it("validateMany collects errors for all questions", () => {
    const items: QuestionItem[] = [
      validQuestion,
      { ...validQuestion, stem: "   ", type: "invalid-type" },
      { ...validQuestion, stem: "" },
    ];
    const errors = validator.validateMany(items);
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});

// ── Deduper tests ───────────────────────────────────────────────────────────────

describe("GeneratedQuestionDeduper", () => {
  const deduper = new GeneratedQuestionDeduper();

  const existing: Question[] = [
    {
      id: "q1",
      seedId: "seed-1",
      subjectId: "nextjs",
      conceptId: "nextjs.app-router",
      type: "multiple-choice",
      difficulty: 1,
      stem: "What is the App Router in Next.js?",
      options: ["A routing system", "A styling library", "A database", "A testing tool"],
      correctIndex: 0,
      explanation: "The App Router is the routing system introduced in Next.js 13.",
      timesShown: 5,
      lastShownAt: new Date(),
      qualityRating: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it("builds fingerprint set from existing questions", () => {
    const fps = deduper.buildFingerprintSet(existing);
    expect(fps.size).toBe(1);
    expect(fps.has("what is the app router in next.js?")).toBe(true);
  });

  it("detects duplicate by stem", () => {
    const fps = deduper.buildFingerprintSet(existing);
    const dup = deduper.isDuplicate(
      "What is the App Router in Next.js?",
      "nextjs.app-router",
      existing[0].options,
      existing[0].correctIndex,
      fps,
    );
    expect(dup).toBe(true);
  });

  it("allows unique stem", () => {
    const fps = deduper.buildFingerprintSet(existing);
    const dup = deduper.isDuplicate(
      "What are Server Components?",
      "nextjs.app-router",
      ["option A", "option B", "option C", "option D"],
      0,
      fps,
    );
    expect(dup).toBe(false);
  });

  it("filterDuplicates returns kept and duplicate counts", () => {
    const fps = deduper.buildFingerprintSet(existing);
    const stems = ["What is the App Router in Next.js?", "What are Server Components?"];
    const opts = [existing[0].options, ["option A", "option B", "option C", "option D"]];
    const correctIndices = [0, 0];

    const result = deduper.filterDuplicates(stems, "nextjs.app-router", opts, correctIndices, fps);
    expect(result.duplicateCount).toBe(1);
    expect(result.keptIndices).toEqual([1]);
  });

  it("handles normalization (case, whitespace) for dedup", () => {
    const fps = deduper.buildFingerprintSet(existing);
    const dup = deduper.isDuplicate(
      "  WHAT IS   THE APP ROUTER IN NEXT.JS?  ",
      "nextjs.app-router",
      existing[0].options,
      existing[0].correctIndex,
      fps,
    );
    expect(dup).toBe(true);
  });
});

// ── Integrated validation + dedup pipeline test ──────────────────────────────

describe("Validation + dedup pipeline", () => {
  const validator = new GeneratedQuestionValidator();
  const deduper = new GeneratedQuestionDeduper();

  it("rejects invalid questions even if they would pass dedup", () => {
    const badQuestion: QuestionItem = {
      type: "multiple-choice",
      stem: "",
      options: ["opt1", "opt2"],
      correctIndex: 0,
      explanation: "",
      difficulty: 99,
    };
    const errors = validator.validate(badQuestion, 0);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it("dedup catches a duplicate that passes validation", () => {
    const existing: Question[] = [
      {
        id: "q1",
        seedId: "seed-1",
        subjectId: "nextjs",
        conceptId: "nextjs.app-router",
        type: "multiple-choice",
        difficulty: 1,
        stem: "Duplicate stem here",
        options: ["opt1", "opt2", "opt3", "opt4"],
        correctIndex: 0,
        explanation: "Some explanation",
        timesShown: 1,
        lastShownAt: new Date(),
        qualityRating: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    const fps = deduper.buildFingerprintSet(existing);
    const isDup = deduper.isDuplicate(
      "DUPLICATE STEM HERE",
      "nextjs.app-router",
      ["opt1", "opt2", "opt3", "opt4"],
      0,
      fps,
    );
    expect(isDup).toBe(true);
  });
});

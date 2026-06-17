import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { createTables } from "../../fixtures/create-tables";
import { DrizzleQuestionRepository } from "@/modules/questions/infrastructure/drizzle-question-repository";
import type { Question } from "@/modules/questions/domain/question";

describe("DrizzleQuestionRepository", () => {
  let sqlite: Database.Database;
  let repository: DrizzleQuestionRepository;

  beforeEach(() => {
    sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    drizzle(sqlite, { schema });
    createTables(sqlite);
    repository = new DrizzleQuestionRepository(sqlite);
  });

  const createSampleQuestion = (overrides: Partial<Question> = {}): Question => ({
    id: "q-1",
    subjectId: "nextjs",
    conceptId: "nextjs.routing",
    seedId: "nextjs-seed-1",
    type: "multiple-choice",
    difficulty: 3,
    stem: "What is the purpose of getStaticProps in Next.js?",
    options: [
      "Server-side rendering",
      "Static site generation",
      "Client-side rendering",
      "Incremental static regeneration",
    ],
    correctIndex: 1,
    explanation: "getStaticProps is used for static site generation in Next.js.",
    timesShown: 0,
    lastShownAt: null,
    qualityRating: 5,
    createdAt: new Date("2025-01-15T10:00:00Z"),
    updatedAt: new Date("2025-01-15T10:00:00Z"),
    ...overrides,
  });

  describe("create", () => {
    it("inserts a question and returns it", async () => {
      const question = createSampleQuestion();
      const result = await repository.create(question);

      expect(result).toEqual(question);
    });

    it("stores options as JSON text", async () => {
      await repository.create(createSampleQuestion({ id: "q-json-test" }));

      const rows = sqlite
        .prepare("SELECT options FROM questions WHERE id = ?")
        .all("q-json-test") as { options: string }[];
      expect(rows).toHaveLength(1);
      expect(JSON.parse(rows[0].options)).toEqual([
        "Server-side rendering",
        "Static site generation",
        "Client-side rendering",
        "Incremental static regeneration",
      ]);
    });
  });

  describe("getById", () => {
    it("retrieves a question by ID with JSON fields parsed", async () => {
      await repository.create(createSampleQuestion());

      const result = await repository.getById("q-1");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("q-1");
      expect(result!.subjectId).toBe("nextjs");
      expect(result!.conceptId).toBe("nextjs.routing");
      expect(result!.seedId).toBe("nextjs-seed-1");
      expect(result!.type).toBe("multiple-choice");
      expect(result!.difficulty).toBe(3);
      expect(result!.stem).toContain("getStaticProps");
      expect(result!.options).toHaveLength(4);
      expect(result!.options[1]).toBe("Static site generation");
      expect(result!.correctIndex).toBe(1);
      expect(result!.timesShown).toBe(0);
      expect(result!.lastShownAt).toBeNull();
      expect(result!.qualityRating).toBe(5);
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
    });

    it("returns null for non-existent ID", async () => {
      const result = await repository.getById("non-existent");
      expect(result).toBeNull();
    });
  });

  describe("getBySeedAndSubject", () => {
    it("retrieves a question by seedId and subjectId", async () => {
      await repository.create(createSampleQuestion());

      const result = await repository.getBySeedAndSubject("nextjs-seed-1", "nextjs");

      expect(result).not.toBeNull();
      expect(result!.id).toBe("q-1");
      expect(result!.seedId).toBe("nextjs-seed-1");
      expect(result!.subjectId).toBe("nextjs");
    });

    it("returns null when seedId does not match", async () => {
      await repository.create(createSampleQuestion());

      const result = await repository.getBySeedAndSubject("wrong-seed", "nextjs");
      expect(result).toBeNull();
    });

    it("returns null when subjectId does not match", async () => {
      await repository.create(createSampleQuestion());

      const result = await repository.getBySeedAndSubject("nextjs-seed-1", "react");
      expect(result).toBeNull();
    });
  });

  describe("getByConceptId", () => {
    it("retrieves all questions for a concept", async () => {
      await repository.create(
        createSampleQuestion({ id: "q-concept-1", conceptId: "nextjs.routing" }),
      );
      await repository.create(
        createSampleQuestion({ id: "q-concept-2", conceptId: "nextjs.routing", seedId: "seed-2" }),
      );
      await repository.create(
        createSampleQuestion({
          id: "q-other",
          conceptId: "nextjs.data-fetching",
          seedId: "seed-3",
        }),
      );

      const results = await repository.getByConceptId("nextjs.routing");

      expect(results).toHaveLength(2);
      expect(results.map((r) => r.id).sort()).toEqual(["q-concept-1", "q-concept-2"]);
    });

    it("returns empty array for concept with no questions", async () => {
      const results = await repository.getByConceptId("non-existent");
      expect(results).toEqual([]);
    });
  });

  describe("getRandomBySubjectId", () => {
    it("returns up to the requested number of random questions for a subject", async () => {
      for (let i = 0; i < 5; i++) {
        await repository.create(
          createSampleQuestion({
            id: `q-react-${i}`,
            subjectId: "react",
            seedId: `seed-react-${i}`,
            conceptId: "react.concepts",
          }),
        );
      }

      const results = await repository.getRandomBySubjectId("react", 3);

      expect(results).toHaveLength(3);
      results.forEach((r) => {
        expect(r.subjectId).toBe("react");
        expect(r.options).toBeInstanceOf(Array);
      });
    });

    it("returns all questions if limit exceeds count", async () => {
      await repository.create(
        createSampleQuestion({
          id: "q-single",
          subjectId: "css",
          seedId: "css-seed",
          conceptId: "css.layout",
        }),
      );

      const results = await repository.getRandomBySubjectId("css", 10);

      expect(results).toHaveLength(1);
      expect(results[0].subjectId).toBe("css");
    });

    it("returns empty array for subject with no questions", async () => {
      const results = await repository.getRandomBySubjectId("empty-subject", 5);
      expect(results).toEqual([]);
    });
  });
});

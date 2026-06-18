import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { Subject } from "@/modules/subjects/domain/subject";
import { createTables } from "../../fixtures/create-tables";

function makeSubject(id: string, overrides?: Partial<Subject>): Subject {
  return {
    id,
    title: overrides?.title ?? `Subject ${id}`,
    description: overrides?.description ?? "Test subject for unit tests",
    version: overrides?.version ?? 1,
    schemaVersion: overrides?.schemaVersion ?? 1,
    minimumGameVersion: overrides?.minimumGameVersion ?? "1.0.0",
    domains: overrides?.domains ?? [],
    createdAt: overrides?.createdAt ?? new Date("2025-01-01"),
    updatedAt: overrides?.updatedAt ?? new Date("2025-01-01"),
  };
}

function makeSubjectWithConcept(id: string): Subject {
  return makeSubject(id, {
    domains: [
      {
        name: "Routing",
        concepts: [
          {
            id: `${id}.routing`,
            subjectId: id,
            name: "Routing Fundamentals",
            domainName: "Routing",
            level: "foundation",
            difficulty: 2,
            prerequisites: ["javascript.modules"],
            tags: ["routing", "app-router"],
            outcomes: ["Explain route segments"],
            knowledge: "Routes map URLs to UI.",
            commonMisconceptions: ["Routes always require client code"],
            examples: ["app/dashboard/page.tsx"],
            questionSeeds: [
              {
                seedId: `${id}.routing.q1`,
                type: "multiple-choice",
                difficulty: 2,
                stem: "Which file defines a route UI?",
                options: ["page.tsx", "route.ts", "layout.css", "next.config.ts"],
                correctIndex: 0,
                explanation: "A page file renders route UI.",
              },
            ],
            practicalChallenges: [
              {
                challengeId: `${id}.routing.challenge`,
                type: "implementation",
                difficulty: 2,
                prompt: "Create a dashboard route.",
                solution: "Add app/dashboard/page.tsx.",
              },
            ],
            interviewPrompts: [
              {
                promptId: `${id}.routing.interview`,
                prompt: "Explain nested layouts.",
                evaluationCriteria: ["Mentions layout nesting"],
              },
            ],
          },
        ],
      },
    ],
  });
}

describe("InMemorySubjectRepository", () => {
  let repo: InMemorySubjectRepository;

  beforeEach(() => {
    repo = new InMemorySubjectRepository();
  });

  describe("getById", () => {
    it("returns null for unknown id", async () => {
      await expect(repo.getById("nonexistent")).resolves.toBeNull();
    });

    it("returns the subject when found", async () => {
      const subject = makeSubject("nextjs");
      await repo.create(subject);
      const result = await repo.getById("nextjs");
      expect(result).not.toBeNull();
      expect(result!.id).toBe("nextjs");
    });
  });

  describe("findAll", () => {
    it("returns empty array when no subjects exist", async () => {
      const results = await repo.findAll();
      expect(results).toEqual([]);
    });

    it("returns all created subjects", async () => {
      await repo.create(makeSubject("nextjs"));
      await repo.create(makeSubject("react"));
      const results = await repo.findAll();
      expect(results).toHaveLength(2);
    });
  });

  describe("create", () => {
    it("adds a new subject", async () => {
      const subject = makeSubject("typescript");
      await repo.create(subject);
      const result = await repo.getById("typescript");
      expect(result).toEqual(subject);
    });

    it("throws if the subject already exists", async () => {
      await repo.create(makeSubject("nextjs"));
      await expect(repo.create(makeSubject("nextjs"))).rejects.toThrow(/already exists/i);
    });
  });

  describe("save", () => {
    it("updates an existing subject", async () => {
      await repo.create(makeSubject("nextjs"));
      const updated = makeSubject("nextjs", { title: "Updated Next.js" });
      await repo.save(updated);
      const result = await repo.getById("nextjs");
      expect(result!.title).toBe("Updated Next.js");
      expect(result!.updatedAt).toBeInstanceOf(Date);
    });

    it("creates if not exists (upsert)", async () => {
      await repo.save(makeSubject("new-subject"));
      const result = await repo.getById("new-subject");
      expect(result).not.toBeNull();
    });
  });

  describe("delete", () => {
    it("removes a subject", async () => {
      await repo.create(makeSubject("nextjs"));
      await repo.delete("nextjs");
      const result = await repo.getById("nextjs");
      expect(result).toBeNull();
    });

    it("does not throw when deleting nonexistent id", async () => {
      await expect(repo.delete("nonexistent")).resolves.not.toThrow();
    });
  });

  describe("exists", () => {
    it("returns true for existing subject", async () => {
      await repo.create(makeSubject("nextjs"));
      await expect(repo.exists("nextjs")).resolves.toBe(true);
    });

    it("returns false for nonexistent subject", async () => {
      await expect(repo.exists("nonexistent")).resolves.toBe(false);
    });
  });

  describe("set", () => {
    it("adds or overwrites without checking existence", async () => {
      repo.set(makeSubject("nextjs"));
      expect(await repo.exists("nextjs")).toBe(true);
      // Does not throw on re-set
      repo.set(makeSubject("nextjs"));
      expect(repo.count).toBe(1);
    });
  });

  describe("constructor with initial subjects", () => {
    it("seeds the store with provided subjects", () => {
      const preloaded = new InMemorySubjectRepository([makeSubject("a"), makeSubject("b")]);
      expect(preloaded.count).toBe(2);
    });
  });
});

describe("DrizzleSubjectRepository", () => {
  let db: ReturnType<typeof drizzle<typeof schema>>;
  let repo: DrizzleSubjectRepository;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = createTables(sqlite);
    repo = new DrizzleSubjectRepository(sqlite);
  });

  it("creates and retrieves a subject with full concept content", async () => {
    const subject = makeSubjectWithConcept("nextjs");

    await repo.create(subject);
    const result = await repo.getById("nextjs");

    expect(result).not.toBeNull();
    expect(result!.domains).toHaveLength(1);
    expect(result!.domains[0].concepts).toHaveLength(1);
    expect(result!.domains[0].concepts[0].questionSeeds[0].stem).toBe(
      "Which file defines a route UI?",
    );
    expect(result!.domains[0].concepts[0].practicalChallenges[0].prompt).toBe(
      "Create a dashboard route.",
    );
    expect(result!.domains[0].concepts[0].interviewPrompts[0].prompt).toBe(
      "Explain nested layouts.",
    );
  });

  it("finds all subjects and preserves empty-domain subjects", async () => {
    await repo.create(makeSubject("react"));
    await repo.create(makeSubjectWithConcept("nextjs"));

    const results = await repo.findAll();

    expect(results.map((subject) => subject.id)).toEqual(["nextjs", "react"]);
    expect(results.find((subject) => subject.id === "react")!.domains).toEqual([]);
  });

  it("throws on duplicate create", async () => {
    await repo.create(makeSubject("nextjs"));

    await expect(repo.create(makeSubject("nextjs"))).rejects.toThrow(/already exists/i);
  });

  it("saves an existing subject and replaces concepts", async () => {
    await repo.create(makeSubjectWithConcept("nextjs"));
    const updated = makeSubject("nextjs", { title: "Updated Next.js" });

    await repo.save(updated);
    const result = await repo.getById("nextjs");
    const conceptRows = db.select().from(schema.concepts).all();

    expect(result!.title).toBe("Updated Next.js");
    expect(result!.domains).toEqual([]);
    expect(conceptRows).toEqual([]);
  });

  it("creates on save when subject does not exist", async () => {
    await repo.save(makeSubject("typescript"));

    await expect(repo.exists("typescript")).resolves.toBe(true);
  });

  it("deletes subject and concepts", async () => {
    await repo.create(makeSubjectWithConcept("nextjs"));

    await repo.delete("nextjs");

    await expect(repo.getById("nextjs")).resolves.toBeNull();
    expect(db.select().from(schema.concepts).all()).toEqual([]);
  });
});

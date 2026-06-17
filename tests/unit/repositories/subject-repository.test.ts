import { describe, it, expect, beforeEach } from "vitest";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import { Subject } from "@/modules/subjects/domain/subject";

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

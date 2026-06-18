import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "@/shared/infrastructure/database/schema";
import type { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";
import { DrizzleMasteryRepository } from "@/modules/mastery/infrastructure/drizzle-mastery-repository";
import type { ReviewSchedule } from "@/modules/reviews/domain/review-schedule";
import { DrizzleReviewRepository } from "@/modules/reviews/infrastructure/drizzle-review-repository";
import { createTables } from "../../fixtures/create-tables";

type Db = ReturnType<typeof drizzle<typeof schema>>;

function makeMastery(overrides: Partial<ConceptMastery> = {}): ConceptMastery {
  return {
    id: "mastery-1",
    playerId: "player-1",
    conceptId: "nextjs.routing",
    subjectId: "nextjs",
    masteryScore: 0.65,
    confidenceScore: 0.7,
    retentionScore: 0.8,
    correctAttempts: 3,
    incorrectAttempts: 1,
    consecutiveCorrectAnswers: 2,
    lastAttemptedAt: new Date("2026-01-02T03:04:05.000Z"),
    nextReviewAt: new Date("2026-01-03T03:04:05.000Z"),
    demonstratedContexts: [
      {
        missionType: "single-concept",
        demonstratedAt: new Date("2026-01-02T03:04:05.000Z"),
        wasCorrect: true,
      },
    ],
    commonMistakes: ["confused-route-handlers"],
    ...overrides,
  };
}

function makeSchedule(overrides: Partial<ReviewSchedule> = {}): ReviewSchedule {
  return {
    id: "review-1",
    playerId: "player-1",
    conceptId: "nextjs.routing",
    subjectId: "nextjs",
    easinessFactor: 2.4,
    intervalDays: 6,
    repetitions: 2,
    lastReviewedAt: new Date("2026-01-02T00:00:00.000Z"),
    nextReviewAt: new Date("2026-01-03T00:00:00.000Z"),
    qualityScore: 4,
    totalReviews: 3,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
    ...overrides,
  };
}

describe("DrizzleMasteryRepository", () => {
  let db: Db;
  let repo: DrizzleMasteryRepository;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = createTables(sqlite);
    repo = new DrizzleMasteryRepository(sqlite);
  });

  it("saves and retrieves mastery with nested context and mistakes", async () => {
    const mastery = makeMastery();

    await repo.save(mastery);
    const result = await repo.getByPlayerAndConcept("player-1", "nextjs.routing");

    expect(result).toEqual(mastery);
    const rows = db.select().from(schema.conceptMastery).all();
    expect(rows).toHaveLength(1);
    expect(JSON.parse(rows[0].demonstratedContexts)).toHaveLength(1);
  });

  it("upserts by mastery id", async () => {
    await repo.save(makeMastery({ masteryScore: 0.25 }));
    await repo.save(makeMastery({ masteryScore: 0.9, correctAttempts: 8 }));

    const result = await repo.getByPlayerAndConcept("player-1", "nextjs.routing");

    expect(result!.masteryScore).toBe(0.9);
    expect(result!.correctAttempts).toBe(8);
    expect(db.select().from(schema.conceptMastery).all()).toHaveLength(1);
  });

  it("filters by player and subject", async () => {
    await repo.save(
      makeMastery({ id: "a", playerId: "player-1", conceptId: "a", subjectId: "nextjs" }),
    );
    await repo.save(
      makeMastery({ id: "b", playerId: "player-1", conceptId: "b", subjectId: "react" }),
    );
    await repo.save(
      makeMastery({ id: "c", playerId: "player-2", conceptId: "c", subjectId: "nextjs" }),
    );

    const bySubject = await repo.getByPlayerAndSubject("player-1", "nextjs");
    const byPlayer = await repo.getByPlayer("player-1");

    expect(bySubject.map((m) => m.id)).toEqual(["a"]);
    expect(byPlayer.map((m) => m.id).sort()).toEqual(["a", "b"]);
  });

  it("deletes by player and concept", async () => {
    await repo.save(makeMastery());

    await repo.delete("player-1", "nextjs.routing");

    await expect(repo.getByPlayerAndConcept("player-1", "nextjs.routing")).resolves.toBeNull();
  });
});

describe("DrizzleReviewRepository", () => {
  let db: Db;
  let repo: DrizzleReviewRepository;

  beforeEach(() => {
    const sqlite = new Database(":memory:");
    sqlite.pragma("foreign_keys = ON");
    db = createTables(sqlite);
    repo = new DrizzleReviewRepository(sqlite);
  });

  it("saves and retrieves a review schedule", async () => {
    const schedule = makeSchedule();

    await repo.save(schedule);
    const result = await repo.getByPlayerAndConcept("player-1", "nextjs.routing");

    expect(result).toEqual(schedule);
    expect(db.select().from(schema.reviewSchedules).all()).toHaveLength(1);
  });

  it("upserts by schedule id", async () => {
    await repo.save(makeSchedule({ intervalDays: 1, repetitions: 1 }));
    await repo.save(makeSchedule({ intervalDays: 14, repetitions: 4 }));

    const result = await repo.getByPlayerAndConcept("player-1", "nextjs.routing");

    expect(result!.intervalDays).toBe(14);
    expect(result!.repetitions).toBe(4);
    expect(db.select().from(schema.reviewSchedules).all()).toHaveLength(1);
  });

  it("filters by player and subject", async () => {
    await repo.save(
      makeSchedule({ id: "a", playerId: "player-1", conceptId: "a", subjectId: "nextjs" }),
    );
    await repo.save(
      makeSchedule({ id: "b", playerId: "player-1", conceptId: "b", subjectId: "react" }),
    );
    await repo.save(
      makeSchedule({ id: "c", playerId: "player-2", conceptId: "c", subjectId: "nextjs" }),
    );

    const results = await repo.getByPlayerAndSubject("player-1", "nextjs");

    expect(results.map((schedule) => schedule.id)).toEqual(["a"]);
  });

  it("returns overdue and due review schedules with in-memory-compatible windows", async () => {
    const now = new Date("2026-01-10T00:00:00.000Z");
    await repo.save(
      makeSchedule({
        id: "old",
        conceptId: "old",
        nextReviewAt: new Date("2026-01-08T23:59:59.000Z"),
      }),
    );
    await repo.save(
      makeSchedule({
        id: "due",
        conceptId: "due",
        nextReviewAt: new Date("2026-01-09T12:00:00.000Z"),
      }),
    );
    await repo.save(
      makeSchedule({
        id: "future",
        conceptId: "future",
        nextReviewAt: new Date("2026-01-10T00:00:01.000Z"),
      }),
    );
    await repo.save(
      makeSchedule({ id: "unscheduled", conceptId: "unscheduled", nextReviewAt: null }),
    );

    const overdue = await repo.getOverdueReviews("player-1", now);
    const due = await repo.getDueReviews("player-1", now);

    expect(overdue.map((schedule) => schedule.id).sort()).toEqual(["due", "old"]);
    expect(due.map((schedule) => schedule.id)).toEqual(["due"]);
  });

  it("deletes by player and concept", async () => {
    await repo.save(makeSchedule());

    await repo.delete("player-1", "nextjs.routing");

    await expect(repo.getByPlayerAndConcept("player-1", "nextjs.routing")).resolves.toBeNull();
  });
});

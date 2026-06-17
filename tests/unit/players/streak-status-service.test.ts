import { describe, expect, it } from "vitest";
import { StreakStatusService } from "@/modules/players/application/streak-status.service";

describe("StreakStatusService", () => {
  it("counts a calendar-day streak from completed missions on consecutive days", () => {
    const service = new StreakStatusService();
    const now = new Date("2026-06-20T12:00:00Z");

    const streak = service.calculate(
      [
        new Date("2026-06-18T08:00:00Z"),
        new Date("2026-06-19T09:15:00Z"),
        new Date("2026-06-20T07:45:00Z"),
      ],
      now,
    );

    expect(streak.currentStreakDays).toBe(3);
    expect(streak.graceDaysUsed).toBe(0);
    expect(streak.graceDaysRemaining).toBe(3);
    expect(streak.streakBroken).toBe(false);
  });

  it("consumes a grace day for a single missed calendar day without breaking the streak", () => {
    const service = new StreakStatusService();
    const now = new Date("2026-06-20T12:00:00Z");

    const streak = service.calculate(
      [
        new Date("2026-06-17T10:00:00Z"),
        new Date("2026-06-18T11:00:00Z"),
        new Date("2026-06-20T09:00:00Z"),
      ],
      now,
    );

    expect(streak.currentStreakDays).toBe(4);
    expect(streak.graceDaysUsed).toBe(1);
    expect(streak.graceDaysRemaining).toBe(2);
    expect(streak.streakBroken).toBe(false);
  });

  it("tracks weekly consistency and offers recovery when a streak breaks after grace days are exhausted", () => {
    const service = new StreakStatusService();
    const now = new Date("2026-06-20T12:00:00Z");

    const streak = service.calculate(
      [
        new Date("2026-06-10T10:00:00Z"),
        new Date("2026-06-11T10:00:00Z"),
        new Date("2026-06-12T10:00:00Z"),
        new Date("2026-06-13T10:00:00Z"),
        new Date("2026-06-14T10:00:00Z"),
        new Date("2026-06-15T10:00:00Z"),
        new Date("2026-06-16T10:00:00Z"),
      ],
      now,
    );

    expect(streak.streakBroken).toBe(true);
    expect(streak.recoveryMissionAvailable).toBe(true);
    expect(streak.weeklyConsistencyDays).toBe(3);
    expect(streak.weeklyConsistencyTarget).toBe(5);
    expect(streak.returnBonusEligible).toBe(false);
  });

  it("marks the player eligible for a return bonus after 7 days away", () => {
    const service = new StreakStatusService();
    const now = new Date("2026-06-20T12:00:00Z");

    const streak = service.calculate([new Date("2026-06-10T10:00:00Z")], now);

    expect(streak.returnBonusEligible).toBe(true);
    expect(streak.returnBonusMultiplier).toBe(1.5);
    expect(streak.welcomeBackMessage).toContain("Welcome back");
  });
});

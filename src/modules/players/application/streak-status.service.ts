export interface StreakStatus {
  currentStreakDays: number;
  graceDaysUsed: number;
  graceDaysRemaining: number;
  streakBroken: boolean;
  weeklyConsistencyDays: number;
  weeklyConsistencyTarget: number;
  recoveryMissionAvailable: boolean;
  returnBonusEligible: boolean;
  returnBonusMultiplier: number;
  welcomeBackMessage: string | null;
}

const GRACE_DAYS_PER_30_DAYS = 3;
const WEEKLY_CONSISTENCY_TARGET = 5;
const RETURN_BONUS_MULTIPLIER = 1.5;
const RETURN_BONUS_ABSENCE_DAYS = 7;

export class StreakStatusService {
  calculate(completedMissionDates: Date[], now = new Date()): StreakStatus {
    const uniqueDays = this.uniqueUtcDayKeys(completedMissionDates);
    const today = this.startOfUtcDay(now);

    if (uniqueDays.length === 0) {
      return {
        currentStreakDays: 0,
        graceDaysUsed: 0,
        graceDaysRemaining: GRACE_DAYS_PER_30_DAYS,
        streakBroken: false,
        weeklyConsistencyDays: 0,
        weeklyConsistencyTarget: WEEKLY_CONSISTENCY_TARGET,
        recoveryMissionAvailable: false,
        returnBonusEligible: false,
        returnBonusMultiplier: 1,
        welcomeBackMessage: null,
      };
    }

    const daySet = new Set(uniqueDays);
    const oldest = this.parseDayKey(uniqueDays[0]);

    let cursor = today;
    let currentStreakDays = 0;
    let graceDaysUsed = 0;
    let streakBroken = false;

    while (cursor.getTime() >= oldest.getTime()) {
      const key = this.dayKey(cursor);
      if (daySet.has(key)) {
        currentStreakDays += 1;
      } else if (graceDaysUsed < GRACE_DAYS_PER_30_DAYS) {
        currentStreakDays += 1;
        graceDaysUsed += 1;
      } else {
        streakBroken = true;
        break;
      }

      cursor = this.shiftDays(cursor, -1);
    }

    const weeklyConsistencyDays = this.countDaysInWindow(uniqueDays, today, 7);
    const mostRecentDay = this.parseDayKey(uniqueDays[uniqueDays.length - 1]);
    const absenceDays = this.daysBetween(mostRecentDay, today);
    const returnBonusEligible = absenceDays >= RETURN_BONUS_ABSENCE_DAYS;

    return {
      currentStreakDays,
      graceDaysUsed,
      graceDaysRemaining: Math.max(0, GRACE_DAYS_PER_30_DAYS - graceDaysUsed),
      streakBroken,
      weeklyConsistencyDays,
      weeklyConsistencyTarget: WEEKLY_CONSISTENCY_TARGET,
      recoveryMissionAvailable: streakBroken && currentStreakDays >= 3,
      returnBonusEligible,
      returnBonusMultiplier: returnBonusEligible ? RETURN_BONUS_MULTIPLIER : 1,
      welcomeBackMessage: returnBonusEligible
        ? "Welcome back, Architect. The realms held. Here is your return bonus."
        : null,
    };
  }

  private uniqueUtcDayKeys(dates: Date[]): string[] {
    return Array.from(
      new Set(
        dates
          .filter((date): date is Date => date instanceof Date && !Number.isNaN(date.getTime()))
          .map((date) => this.dayKey(date)),
      ),
    ).sort();
  }

  private countDaysInWindow(dayKeys: string[], end: Date, windowDays: number): number {
    const start = this.shiftDays(this.startOfUtcDay(end), -(windowDays - 1));
    return dayKeys.filter((key) => {
      const date = this.parseDayKey(key);
      return date.getTime() >= start.getTime() && date.getTime() <= end.getTime();
    }).length;
  }

  private startOfUtcDay(date: Date): Date {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  private shiftDays(date: Date, delta: number): Date {
    const shifted = new Date(date);
    shifted.setUTCDate(shifted.getUTCDate() + delta);
    return shifted;
  }

  private daysBetween(older: Date, newer: Date): number {
    return Math.floor(
      (this.startOfUtcDay(newer).getTime() - this.startOfUtcDay(older).getTime()) / 86400000,
    );
  }

  private parseDayKey(dayKey: string): Date {
    return new Date(`${dayKey}T00:00:00.000Z`);
  }

  private dayKey(date: Date): string {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
}

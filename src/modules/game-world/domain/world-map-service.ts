import { Region } from "./region";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

/**
 * Evaluates whether regions should be unlocked based on player mastery.
 * Pure domain logic — no dependencies on infrastructure or repositories.
 */
export class WorldMapService {
  /**
   * Check which regions the player is eligible to unlock.
   * Returns updated regions with their new unlock status.
   */
  checkUnlocks(regions: Region[], masteries: Map<string, ConceptMastery>): Region[] {
    return regions.map((region) => {
      if (region.unlocked) return region;

      const blockedBy: string[] = [];

      for (const conceptId of region.requiredConceptIds) {
        const mastery = masteries.get(conceptId);
        const score = mastery?.masteryScore ?? 0;
        if (score < region.requiredMastery) {
          blockedBy.push(conceptId);
        }
      }

      return { ...region, unlocked: blockedBy.length === 0 };
    });
  }

  /**
   * Get detailed unlock information for a specific region.
   */
  getUnlockDetails(
    region: Region,
    masteries: Map<string, ConceptMastery>,
  ): {
    unlocked: boolean;
    blockedBy: Array<{ conceptId: string; currentScore: number; requiredScore: number }>;
  } {
    const blockedBy: Array<{ conceptId: string; currentScore: number; requiredScore: number }> = [];

    for (const conceptId of region.requiredConceptIds) {
      const mastery = masteries.get(conceptId);
      const currentScore = mastery?.masteryScore ?? 0;
      if (currentScore < region.requiredMastery) {
        blockedBy.push({ conceptId, currentScore, requiredScore: region.requiredMastery });
      }
    }

    return { unlocked: blockedBy.length === 0, blockedBy };
  }

  /**
   * Get overall progress through the world map.
   */
  getProgress(regions: Region[]): {
    totalRegions: number;
    unlockedRegions: number;
    completedRegions: number;
    currentRegion: string | null;
    nextRegion: string | null;
  } {
    const sorted = [...regions].sort((a, b) => a.order - b.order);
    const totalRegions = sorted.length;
    const unlockedRegions = sorted.filter((r) => r.unlocked).length;
    const completedRegions = sorted.filter((r) => r.bossDefeated).length;

    let currentRegion: string | null = null;
    let nextRegion: string | null = null;

    for (const region of sorted) {
      if (region.unlocked && !region.bossDefeated) {
        currentRegion = region.id;
        break;
      }
    }

    // Next locked region after the current one
    if (currentRegion) {
      const currentIdx = sorted.findIndex((r) => r.id === currentRegion);
      if (currentIdx >= 0 && currentIdx < sorted.length - 1) {
        nextRegion = sorted[currentIdx + 1].id;
      }
    } else {
      nextRegion = sorted[0]?.id ?? null;
    }

    return { totalRegions, unlockedRegions, completedRegions, currentRegion, nextRegion };
  }
}

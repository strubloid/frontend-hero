/**
 * Specialist evaluators for subject-level gate requirements.
 *
 * Each requirement type has its own evaluator class.
 * The main evaluator orchestrates them for a readable main flow.
 */

import {
  SubjectLevelRequirements,
  LevelReadinessResult,
  LevelRequirementResult,
  SubjectLevelDefinition,
  PlayerSubjectProgress,
} from "./subject-level";
import { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";

// ---------------------------------------------------------------------------
// Requirement evaluator interface
// ---------------------------------------------------------------------------

export interface LevelRequirementEvaluator {
  readonly name: string;
  evaluate(
    progress: PlayerSubjectProgress,
    levelDef: SubjectLevelDefinition,
    masteries: ConceptMastery[],
  ): LevelRequirementResult;
}

// ---------------------------------------------------------------------------
// Specialist evaluators
// ---------------------------------------------------------------------------

export class EncounterCountRequirementEvaluator implements LevelRequirementEvaluator {
  readonly name = "Successful Encounters";

  evaluate(
    progress: PlayerSubjectProgress,
    levelDef: SubjectLevelDefinition,
  ): LevelRequirementResult {
    const required = levelDef.requiredSuccessfulEncounters;
    const current = progress.successfulEncounterCount;
    return {
      name: this.name,
      met: current >= required,
      current,
      required,
      details: `${current} / ${required} encounters completed`,
    };
  }
}

export class ConceptCoverageRequirementEvaluator implements LevelRequirementEvaluator {
  readonly name = "Concept Coverage";

  evaluate(
    progress: PlayerSubjectProgress,
    levelDef: SubjectLevelDefinition,
    masteries: ConceptMastery[],
  ): LevelRequirementResult {
    const requiredConcepts = levelDef.concepts;
    const masteredCount = requiredConcepts.filter((cid) => {
      const m = masteries.find((cm) => cm.conceptId === cid);
      return m && m.masteryScore > 0;
    }).length;
    const total = requiredConcepts.length;
    const percentage = total > 0 ? (masteredCount / total) * 100 : 100;

    return {
      name: this.name,
      met: percentage >= 80, // 80% concept coverage
      current: Math.round(percentage),
      required: 80,
      details: `${masteredCount} / ${total} concepts attempted`,
    };
  }
}

export class MasteryRequirementEvaluator implements LevelRequirementEvaluator {
  readonly name = "Mastery Score";

  evaluate(progress: PlayerSubjectProgress): LevelRequirementResult {
    const required = 70; // default: 70% average mastery
    const current = Math.round(progress.masteryScore * 100);
    return {
      name: this.name,
      met: current >= required,
      current,
      required,
      details: `Current average mastery: ${current}%`,
    };
  }
}

export class ReviewRequirementEvaluator implements LevelRequirementEvaluator {
  readonly name = "Review Encounters";

  evaluate(
    progress: PlayerSubjectProgress,
    levelDef: SubjectLevelDefinition,
  ): LevelRequirementResult {
    const required = levelDef.requiredReviewEncounters;
    const current = progress.reviewEncounterCount;
    return {
      name: this.name,
      met: current >= required,
      current,
      required,
      details: `${current} / ${required} review encounters completed`,
    };
  }
}

export class SessionRequirementEvaluator implements LevelRequirementEvaluator {
  readonly name = "Study Sessions";

  evaluate(progress: PlayerSubjectProgress): LevelRequirementResult {
    const required = 3; // at least 3 distinct study sessions
    const current = progress.distinctStudySessionCount;
    return {
      name: this.name,
      met: current >= required,
      current,
      required,
      details: `${current} / ${required} study sessions`,
    };
  }
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------

export class SubjectLevelRequirementEvaluator {
  private readonly evaluators: LevelRequirementEvaluator[];

  constructor(evaluators?: LevelRequirementEvaluator[]) {
    this.evaluators = evaluators ?? [
      new EncounterCountRequirementEvaluator(),
      new ConceptCoverageRequirementEvaluator(),
      new MasteryRequirementEvaluator(),
      new ReviewRequirementEvaluator(),
      new SessionRequirementEvaluator(),
    ];
  }

  /**
   * Evaluate whether the player is ready to advance from the given level.
   */
  evaluate(
    progress: PlayerSubjectProgress,
    levelDef: SubjectLevelDefinition,
    masteries: ConceptMastery[],
  ): LevelReadinessResult {
    const results: LevelRequirementResult[] = this.evaluators.map((e) =>
      e.evaluate(progress, levelDef, masteries),
    );

    const isReady = results.every((r) => r.met);

    const conceptMasteryValues = masteries
      .filter((m) => levelDef.concepts.includes(m.conceptId))
      .map((m) => m.masteryScore);

    const overallMasteryScore =
      conceptMasteryValues.length > 0
        ? conceptMasteryValues.reduce((a, b) => a + b, 0) / conceptMasteryValues.length
        : 0;

    const retentionValues = masteries
      .filter((m) => levelDef.concepts.includes(m.conceptId))
      .map((m) => m.retentionScore);

    const overallRetentionScore =
      retentionValues.length > 0
        ? retentionValues.reduce((a, b) => a + b, 0) / retentionValues.length
        : 0;

    const totalConceptsInLevel = levelDef.concepts.length;
    const conceptsWithMastery = masteries.filter(
      (m) => levelDef.concepts.includes(m.conceptId) && m.masteryScore > 0,
    ).length;

    const conceptCoveragePercentage =
      totalConceptsInLevel > 0 ? (conceptsWithMastery / totalConceptsInLevel) * 100 : 0;

    return {
      level: levelDef.level,
      isReady,
      requirements: results,
      overallMasteryScore,
      overallRetentionScore,
      conceptCoveragePercentage,
      totalEncountersCompleted: progress.successfulEncounterCount,
      totalReviewsCompleted: progress.reviewEncounterCount,
    };
  }
}

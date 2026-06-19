import type {
  SubjectProgression,
  PlayerSubjectProgress,
  SubjectLevelDefinition,
} from "@/modules/subjects/domain/subject-level";
import type { ConceptMastery } from "@/modules/mastery/domain/concept-mastery";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { PlayerSubjectProgressRepository } from "@/modules/subjects/domain/player-subject-progress-repository";
import type { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { SubjectLevelRequirementEvaluator } from "@/modules/subjects/domain/level-requirements";
import {
  advanceSubjectLevel,
  unlockSubjectBoss,
} from "@/modules/subjects/domain/player-subject-progress";
import { getLevelDefinition } from "@/modules/subjects/domain/subject-level";
import type { AdvanceSubjectLevelRequest } from "./advance-subject-level.request";
import { AdvanceSubjectLevelResult } from "./advance-subject-level.result";

/**
 * Evaluates whether a player meets the requirements to advance to the next
 * subject level and performs the advancement if all requirements are met.
 */
export class AdvanceSubjectLevelUseCase {
  constructor(
    private readonly subjectRepo: SubjectRepository,
    private readonly subjectProgressRepo: PlayerSubjectProgressRepository,
    private readonly masteryRepo: MasteryRepository,
    private readonly evaluator: SubjectLevelRequirementEvaluator,
  ) {}

  async execute(request: AdvanceSubjectLevelRequest): Promise<AdvanceSubjectLevelResult> {
    const progress = await this.subjectProgressRepo.findByPlayerAndSubject(
      request.playerId,
      request.subjectId,
    );
    if (!progress) {
      return new AdvanceSubjectLevelResult(
        false,
        "Subject progress not found",
        false,
        null,
        [],
        null,
      );
    }

    const subject = await this.subjectRepo.getById(request.subjectId);
    if (!subject?.progression) {
      return new AdvanceSubjectLevelResult(
        false,
        "Subject progression not found",
        false,
        null,
        [],
        null,
      );
    }

    const { progression } = subject;

    // Get the definition of the current level (the one we're trying to pass)
    const currentLevelDef = getLevelDefinition(progression, progress.currentLevel);
    if (!currentLevelDef) {
      return new AdvanceSubjectLevelResult(
        false,
        "Current level definition not found",
        false,
        null,
        [],
        null,
      );
    }

    // Get concept masteries for all concepts in the current level
    const conceptMasteries: ConceptMastery[] = [];
    for (const conceptId of currentLevelDef.concepts) {
      const mastery = await this.masteryRepo.getByPlayerAndConcept(request.playerId, conceptId);
      if (mastery) {
        conceptMasteries.push(mastery);
      }
    }

    // Evaluate readiness
    const readiness = this.evaluator.evaluate(progress, currentLevelDef, conceptMasteries);

    if (!readiness.isReady) {
      return new AdvanceSubjectLevelResult(
        false,
        "Requirements not met",
        false,
        null,
        readiness.requirements,
        progress,
      );
    }

    // All requirements met — advance the level

    // Check boss unlock before advancing (at second-to-last level)
    const shouldUnlockBoss =
      progress.currentLevel === progression.maximumLevel - 1 && progression.bossRequired;

    let updatedProgress = advanceSubjectLevel(progress);

    if (shouldUnlockBoss) {
      updatedProgress = unlockSubjectBoss(updatedProgress);
    }

    await this.subjectProgressRepo.save(updatedProgress);

    return new AdvanceSubjectLevelResult(
      true,
      null,
      true,
      updatedProgress.currentLevel,
      readiness.requirements,
      updatedProgress,
    );
  }
}

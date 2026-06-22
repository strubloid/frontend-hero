import type { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import type { Mission } from "@/modules/missions/domain/mission";
import { AdvanceSubjectLevelUseCase } from "@/modules/subjects/application/advance-subject-level/advance-subject-level.use-case";
import type { PlayerSubjectProgressRepository } from "@/modules/subjects/domain/player-subject-progress-repository";
import {
  recordReviewEncounter,
  recordSuccessfulEncounter,
  updateSubjectMasteryScore,
} from "@/modules/subjects/domain/player-subject-progress";
import { SubjectLevelRequirementEvaluator } from "@/modules/subjects/domain/level-requirements";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";

export interface RecordSubjectEncounterResult {
  readonly recorded: boolean;
  readonly levelAdvanced: boolean;
  readonly newLevel: number | null;
  readonly bossUnlocked: boolean;
}

export class RecordSubjectEncounterUseCase {
  constructor(
    private readonly subjectRepository: SubjectRepository,
    private readonly subjectProgressRepository: PlayerSubjectProgressRepository,
    private readonly masteryRepository: MasteryRepository,
  ) {}

  async execute(
    missionBefore: Mission,
    missionAfter: Mission,
  ): Promise<RecordSubjectEncounterResult> {
    if (missionBefore.status === "completed" || missionAfter.status !== "completed") {
      return this.emptyResult(false);
    }

    const progress = await this.subjectProgressRepository.findByPlayerAndSubject(
      missionAfter.playerId,
      missionAfter.subjectId,
    );
    if (!progress) {
      return this.emptyResult(false);
    }

    const masteries = await this.masteryRepository.getByPlayerAndSubject(
      missionAfter.playerId,
      missionAfter.subjectId,
    );
    const withMastery = updateSubjectMasteryScore(progress, masteries);
    const withEncounter =
      missionAfter.type === "review"
        ? recordReviewEncounter(withMastery)
        : recordSuccessfulEncounter(withMastery);
    await this.subjectProgressRepository.save(withEncounter);

    const advance = new AdvanceSubjectLevelUseCase(
      this.subjectRepository,
      this.subjectProgressRepository,
      this.masteryRepository,
      new SubjectLevelRequirementEvaluator(),
    );
    const advanceResult = await advance.execute({
      playerId: missionAfter.playerId,
      subjectId: missionAfter.subjectId,
    });

    return {
      recorded: true,
      levelAdvanced: advanceResult.advanced,
      newLevel: advanceResult.newLevel,
      bossUnlocked: advanceResult.progress?.bossStatus === "available",
    };
  }

  private emptyResult(recorded: boolean): RecordSubjectEncounterResult {
    return {
      recorded,
      levelAdvanced: false,
      newLevel: null,
      bossUnlocked: false,
    };
  }
}

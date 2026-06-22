import { v4 as uuid } from "uuid";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { MissionRepository } from "@/modules/missions/domain/mission-repository";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { MissionSelector, MissionPlan } from "./mission-selector";
import { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { ReviewRepository } from "@/modules/reviews/domain/review-repository";
import { PrerequisiteGraphBuilder } from "@/modules/subjects/application/prerequisite-graph-builder";
import { StartMissionInput, Mission } from "@/modules/missions/domain/mission";
import type { QuestionInventoryService } from "@/modules/questions/domain/question-inventory-service";
import type { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { getLevelDefinition, SubjectProgression } from "@/modules/subjects/domain/subject-level";

export type StartMissionResult =
  | { readonly success: true; readonly mission: Mission }
  | {
      readonly success: false;
      readonly reason: "insufficient_question_supply";
      readonly level: number;
      readonly levelTitle: string;
      readonly totalApproved: number;
      readonly missingConcepts: string[];
    };

export class StartMissionUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly missionRepository: MissionRepository,
    private readonly missionSelector: MissionSelector,
    private readonly questionProvider: QuestionProvider,
    private readonly graphBuilder: PrerequisiteGraphBuilder,
    private readonly masteryRepository?: MasteryRepository,
    private readonly reviewRepository?: ReviewRepository,
    private readonly inventoryService?: QuestionInventoryService,
    private readonly questionRepository?: QuestionRepository,
  ) {}

  async execute(input: StartMissionInput): Promise<StartMissionResult> {
    const player = await this.playerRepository.getById(input.playerId);
    if (!player) {
      throw new Error(`Player not found: ${input.playerId}`);
    }

    const subject = await this.subjectRepository.getById(input.subjectId);
    if (!subject) {
      throw new Error(`Subject not found: ${input.subjectId}`);
    }

    // Load mastery data if repository is available
    const masteries = this.masteryRepository
      ? await this.masteryRepository.getByPlayerAndSubject(input.playerId, input.subjectId)
      : [];

    // Load review schedules if repository is available
    const schedules = this.reviewRepository
      ? await this.reviewRepository.getByPlayerAndSubject(input.playerId, input.subjectId)
      : [];

    // Build prerequisite graph to determine which concepts are available
    const allConcepts = subject.domains.flatMap((d) => d.concepts);
    const graph = this.graphBuilder.build(allConcepts);
    const masteredConceptIds = new Set(
      masteries.filter((m) => m.masteryScore >= 0.5).map((m) => m.conceptId),
    );
    const availableConceptIds = graph.getAvailableConcepts(masteredConceptIds);
    const recentQuestionIds = await this.getRecentQuestionIds(input.playerId);
    const recentConceptIds = await this.getRecentConceptIds(input.playerId);

    const missionPlan: MissionPlan = this.missionSelector.select({
      subject,
      masteries,
      schedules,
      recentConceptIds,
      availableConceptIds,
    });

    // ── Inventory health gate ──────────────────────────────────────────────
    // Check whether the selected mission plan's concept has enough questions.
    // If the level is empty, return a typed failure so the UI can redirect
    // to Encounter Forge instead of silently producing a stub mission.
    if (this.inventoryService && subject.progression) {
      const levelDef = getLevelDefinition(subject.progression, subject.progression.minimumLevel);
      // Use the minimum level definition; for multi-concept levels check all
      const relevantLevel = levelDef ?? subject.progression.levels[0];
      const levelConcepts = [...relevantLevel.concepts];
      const levelStatus = await this.inventoryService.getInventoryStatusByLevel(
        input.subjectId,
        relevantLevel.level,
        relevantLevel.title,
        levelConcepts,
      );

      if (levelStatus.health === "EMPTY") {
        return {
          success: false,
          reason: "insufficient_question_supply" as const,
          level: relevantLevel.level,
          levelTitle: relevantLevel.title,
          totalApproved: 0,
          missingConcepts: levelConcepts,
        };
      }

      // Check the specific concept — if the concept is empty but others aren't,
      // report it so the system can generate targeted questions
      const conceptStatus = levelStatus.byConcept.find(
        (c) => c.conceptId === missionPlan.conceptId,
      );
      if (conceptStatus && conceptStatus.health === "EMPTY") {
        return {
          success: false,
          reason: "insufficient_question_supply" as const,
          level: relevantLevel.level,
          levelTitle: relevantLevel.title,
          totalApproved: levelStatus.totalApproved,
          missingConcepts: [missionPlan.conceptId],
        };
      }
    }

    const questions = await this.questionProvider.provideFor(missionPlan, subject, {
      recentQuestionIds,
    });

    const now = new Date();
    const mission: Mission = {
      id: uuid(),
      playerId: input.playerId,
      subjectId: input.subjectId,
      type: missionPlan.type,
      status: "active",
      questionIds: questions.map((q) => q.id),
      currentQuestionIndex: 0,
      score: 0,
      maxScore: questions.length,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.missionRepository.create(mission);
    await this.questionProvider.markShown(saved.questionIds, now);
    return { success: true as const, mission: saved };
  }

  private async getRecentQuestionIds(playerId: string): Promise<string[]> {
    const attemptedQuestionIds = await this.questionProvider.getRecentlyShownByPlayer(playerId, 30);
    const recentMissions = (await this.missionRepository.getCompletedByPlayer(playerId)).slice(-5);
    const missionQuestionIds = recentMissions.flatMap((mission) => mission.questionIds);

    return [...new Set([...attemptedQuestionIds, ...missionQuestionIds])];
  }

  private async getRecentConceptIds(playerId: string): Promise<string[]> {
    const recentMissions = (await this.missionRepository.getCompletedByPlayer(playerId)).slice(-3);
    const questionIds = recentMissions.flatMap((mission) => mission.questionIds);
    if (questionIds.length === 0 || !this.questionRepository) return [];

    const questions = await this.questionRepository.getByIds(questionIds);
    const conceptIds = [...new Set(questions.map((q) => q.conceptId).filter(Boolean))];
    return conceptIds;
  }
}

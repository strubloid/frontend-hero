import { v4 as uuid } from "uuid";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { MasteryCalculator, MasteryUpdateInput } from "@/modules/mastery/domain/mastery-calculator";
import { ReviewRepository } from "@/modules/reviews/domain/review-repository";
import { ReviewAlgorithm, ReviewInput } from "@/modules/reviews/domain/review-algorithm";
import { AnswerEvaluator } from "./answer-evaluator";
import { calculateAnswerXp, xpToLevel } from "@/modules/progression/domain/player-progression";
import { SubmitAnswerInput, MissionAttempt, Mission } from "@/modules/missions/domain/mission";
import { QuestService } from "./quest-service";
import type { RecordSubjectEncounterUseCase } from "@/modules/subjects/application/record-subject-encounter/record-subject-encounter.use-case";
import type { RecordSubjectEncounterResult } from "@/modules/subjects/application/record-subject-encounter/record-subject-encounter.use-case";

export interface QuestProgressEntry {
  questId: string;
  name: string;
  completedCount: number;
  requiredCount: number;
  completed: boolean;
  rewarded: boolean;
}

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  xpAwarded: number;
  returnBonusApplied: boolean;
  returnBonusXp: number;
  welcomeBackMessage: string | null;
  updatedMastery: number;
  score: number;
  maxScore: number;
  subjectProgress: RecordSubjectEncounterResult | null;
  questProgress: QuestProgressEntry[];
}

const RETURN_BONUS_MULTIPLIER = 1.5;
const RETURN_BONUS_ABSENCE_MS = 7 * 24 * 60 * 60 * 1000;

export class SubmitAnswerUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly missionRepository: MissionRepository,
    private readonly missionAttemptRepository: MissionAttemptRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly masteryRepository: MasteryRepository,
    private readonly reviewRepository: ReviewRepository,
    private readonly answerEvaluator: AnswerEvaluator,
    private readonly masteryCalculator: MasteryCalculator = new MasteryCalculator(),
    private readonly reviewAlgorithm: ReviewAlgorithm = new ReviewAlgorithm(),
    private readonly recordSubjectEncounterUseCase?: RecordSubjectEncounterUseCase,
    private readonly questService?: QuestService,
  ) {}

  async execute(input: SubmitAnswerInput): Promise<SubmitAnswerResult> {
    const mission = await this.missionRepository.getById(input.missionId);
    if (!mission) {
      throw new Error(`Mission not found: ${input.missionId}`);
    }

    const question = await this.questionRepository.getById(input.questionId);
    if (!question) {
      throw new Error(`Question not found: ${input.questionId}`);
    }

    const player = await this.playerRepository.getById(input.playerId);
    if (!player) {
      throw new Error(`Player not found: ${input.playerId}`);
    }

    // --- Phase 1: Evaluate the answer ---
    const evaluation = this.answerEvaluator.evaluate(
      input.selectedIndex,
      question.correctIndex,
      question.explanation,
      question.type,
    );

    // --- Phase 2: Create and persist mission attempt ---
    const attempt: MissionAttempt = {
      id: uuid(),
      missionId: input.missionId,
      playerId: input.playerId,
      questionId: input.questionId,
      selectedIndex: input.selectedIndex,
      isCorrect: evaluation.isCorrect,
      timeSpentSeconds: input.timeSpentSeconds,
      hintsUsed: 0,
      attemptedAt: new Date(),
    };
    await this.missionAttemptRepository.create(attempt);

    // --- Phase 3: Update mission score and completion ---
    const updatedMission: Mission = {
      ...mission,
      score: evaluation.isCorrect ? mission.score + 1 : mission.score,
      currentQuestionIndex: mission.currentQuestionIndex + 1,
      updatedAt: new Date(),
    };
    if (updatedMission.currentQuestionIndex >= mission.questionIds.length) {
      updatedMission.status = "completed";
      updatedMission.completedAt = new Date();
    }
    await this.missionRepository.save(updatedMission);

    // --- Phase 3b: Record quest progress when mission is completed ---
    const wasJustCompleted =
      mission.status !== "completed" && updatedMission.status === "completed";
    let questProgressResult: QuestProgressEntry[] = [];
    if (wasJustCompleted && this.questService) {
      const quests = await this.questService.getPlayerQuests(input.playerId);
      const matchingQuests = quests.filter((q) => q.missionType === mission.type && !q.completed);
      for (const quest of matchingQuests) {
        await this.questService.recordProgress(input.playerId, quest.id, 1);
      }
      // Re-fetch to get updated state after recording progress
      const updatedQuests = await this.questService.getPlayerQuests(input.playerId);
      questProgressResult = updatedQuests
        .filter((q) => q.missionType === mission.type)
        .map((q) => ({
          questId: q.id,
          name: q.name,
          completedCount: q.completedCount,
          requiredCount: q.requiredCount,
          completed: q.completed,
          rewarded: q.rewarded,
        }));
    }

    // --- Phase 4: Award XP using new formula ---
    const existingMastery = await this.masteryRepository.getByPlayerAndConcept(
      input.playerId,
      question.conceptId,
    );
    const consecutiveCorrect = existingMastery?.consecutiveCorrectAnswers ?? 0;

    const baseXpAwarded = calculateAnswerXp(
      evaluation.isCorrect,
      question.difficulty,
      consecutiveCorrect,
      0, // hintsUsed (not yet tracked in submissions)
      input.timeSpentSeconds * 1000, // convert to ms for consistency
    );

    const now = new Date();
    const returnBonusApplied =
      !!player.lastActiveAt &&
      now.getTime() - player.lastActiveAt.getTime() >= RETURN_BONUS_ABSENCE_MS;
    const xpAwarded = returnBonusApplied
      ? Math.round(baseXpAwarded * RETURN_BONUS_MULTIPLIER)
      : baseXpAwarded;
    const returnBonusXp = xpAwarded - baseXpAwarded;

    const newTotalXp = player.experiencePoints + xpAwarded;
    const { level: newLevel } = xpToLevel(newTotalXp);

    const updatedPlayer = {
      ...player,
      experiencePoints: newTotalXp,
      level: newLevel,
      lastActiveAt: now,
      lastReturnBonusClaimedAt: returnBonusApplied ? now : player.lastReturnBonusClaimedAt,
      updatedAt: now,
    };
    await this.playerRepository.save(updatedPlayer);

    // --- Phase 5: Update concept mastery using new MasteryCalculator ---
    const masteryInput: MasteryUpdateInput = {
      playerId: input.playerId,
      conceptId: question.conceptId,
      subjectId: question.subjectId,
      missionType: mission.type,
      isCorrect: evaluation.isCorrect,
      difficulty: question.difficulty,
      responseTimeMs: input.timeSpentSeconds * 1000,
      currentMastery: existingMastery ?? null,
    };
    const updatedMasteryResult = this.masteryCalculator.update(masteryInput);
    await this.masteryRepository.save(updatedMasteryResult.mastery);

    // --- Phase 6: Update review schedule using SM-2 algorithm ---
    const existingSchedule = await this.reviewRepository.getByPlayerAndConcept(
      input.playerId,
      question.conceptId,
    );
    const reviewInput: ReviewInput = {
      playerId: input.playerId,
      conceptId: question.conceptId,
      subjectId: question.subjectId,
      isCorrect: evaluation.isCorrect,
      masteryScore: updatedMasteryResult.mastery.masteryScore,
      currentSchedule: existingSchedule ?? null,
    };
    const updatedSchedule = this.reviewAlgorithm.apply(reviewInput);
    await this.reviewRepository.save(updatedSchedule.schedule);

    const subjectProgress = this.recordSubjectEncounterUseCase
      ? await this.recordSubjectEncounterUseCase.execute(mission, updatedMission)
      : null;

    return {
      isCorrect: evaluation.isCorrect,
      correctIndex: evaluation.correctIndex,
      explanation: evaluation.explanation,
      xpAwarded,
      returnBonusApplied,
      returnBonusXp,
      welcomeBackMessage: returnBonusApplied
        ? "Welcome back, Architect. The realms held. Here is your return bonus."
        : null,
      updatedMastery: updatedMasteryResult.mastery.masteryScore,
      score: updatedMission.score,
      maxScore: updatedMission.maxScore,
      subjectProgress,
      questProgress: questProgressResult,
    };
  }
}

import { v4 as uuid } from "uuid";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import {
  MissionRepository,
  MissionAttemptRepository,
} from "@/modules/missions/domain/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { ConceptMasteryRepository } from "@/modules/progression/domain/concept-mastery-repository";
import { AnswerEvaluator } from "./answer-evaluator";
import { XpCalculator } from "@/modules/progression/domain/xp-calculator";
import { MasteryCalculator } from "@/modules/progression/domain/mastery-calculator";
import { SubmitAnswerInput, MissionAttempt, Mission } from "@/modules/missions/domain/mission";

export interface SubmitAnswerResult {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  xpAwarded: number;
  updatedMastery: number;
  score: number;
  maxScore: number;
}

export class SubmitAnswerUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly missionRepository: MissionRepository,
    private readonly missionAttemptRepository: MissionAttemptRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly conceptMasteryRepository: ConceptMasteryRepository,
    private readonly answerEvaluator: AnswerEvaluator,
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

    // Evaluate the answer
    const evaluation = this.answerEvaluator.evaluate(
      input.selectedIndex,
      question.correctIndex,
      question.explanation,
    );

    // Create and persist mission attempt
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

    // Update mission score and check completion
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

    // Calculate and award XP
    const xpAwarded = XpCalculator.calculate(evaluation.isCorrect, question.difficulty, 0);
    const updatedPlayer = {
      ...player,
      experiencePoints: player.experiencePoints + xpAwarded,
      updatedAt: new Date(),
    };
    await this.playerRepository.save(updatedPlayer);

    // Calculate and update concept mastery
    const existingMastery = await this.conceptMasteryRepository.getByPlayerAndConcept(
      input.playerId,
      question.conceptId,
    );
    const currentMasteryValue = existingMastery?.masteryScore ?? 0;
    const updatedMasteryValue = MasteryCalculator.calculate(
      currentMasteryValue,
      evaluation.isCorrect,
      question.difficulty,
    );

    const now = new Date();
    const updatedMastery = {
      id: existingMastery?.id ?? uuid(),
      playerId: input.playerId,
      conceptId: question.conceptId,
      subjectId: question.subjectId,
      masteryScore: updatedMasteryValue,
      confidenceScore: existingMastery?.confidenceScore ?? 0,
      retentionScore: existingMastery?.retentionScore ?? 0,
      correctAttempts: (existingMastery?.correctAttempts ?? 0) + (evaluation.isCorrect ? 1 : 0),
      incorrectAttempts: (existingMastery?.incorrectAttempts ?? 0) + (evaluation.isCorrect ? 0 : 1),
      consecutiveCorrectAnswers: evaluation.isCorrect
        ? (existingMastery?.consecutiveCorrectAnswers ?? 0) + 1
        : 0,
      lastAttemptedAt: now,
      nextReviewAt: existingMastery?.nextReviewAt ?? null,
    };
    await this.conceptMasteryRepository.save(updatedMastery);

    return {
      isCorrect: evaluation.isCorrect,
      correctIndex: evaluation.correctIndex,
      explanation: evaluation.explanation,
      xpAwarded,
      updatedMastery: updatedMasteryValue,
      score: updatedMission.score,
      maxScore: updatedMission.maxScore,
    };
  }
}

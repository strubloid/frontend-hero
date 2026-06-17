import { v4 as uuid } from "uuid";
import { BossEncounter, PlayerBossProgress } from "../domain/boss-encounter";
import { BossEncounterRepository, BossProgressRepository } from "../domain/boss-repository";
import { BossEncounterService } from "./boss-encounter.service";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { PlayerRepository } from "@/modules/players/domain/player-repository";

export interface BossStateResponse {
  bossId: string;
  name: string;
  title: string;
  narrativeIntro: string;
  totalPhases: number;
  currentPhaseIndex: number;
  completedPhaseIds: string[];
  phaseName: string;
  phasePrompt: string;
  phaseDifficulty: number;
  question: {
    questionId: string;
    stem: string;
    options: string[];
    type: string;
  } | null;
  status: "active" | "defeated" | "retreat" | "victory";
  bossDefeated: boolean;
}

export class BossService {
  constructor(
    private readonly bossRepository: BossEncounterRepository,
    private readonly bossProgressRepository: BossProgressRepository,
    private readonly bossEncounterService: BossEncounterService,
    private readonly questionRepository: QuestionRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  async getState(playerId: string, regionId: string): Promise<BossStateResponse> {
    const boss = await this.bossRepository.getByRegion(regionId);
    if (!boss) throw new Error(`No boss encounter found for region: ${regionId}`);

    const progress = await this.bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);

    if (progress?.status === "retreat") {
      return {
        bossId: boss.id,
        name: boss.name,
        title: boss.title,
        narrativeIntro: boss.defeatMessage,
        totalPhases: boss.phases.length,
        currentPhaseIndex: progress.currentPhaseIndex,
        completedPhaseIds: progress.completedPhaseIds,
        phaseName: "",
        phasePrompt: "",
        phaseDifficulty: 0,
        question: null,
        status: "retreat",
        bossDefeated: false,
      };
    }

    if (progress?.status === "defeated" || progress?.completedAt) {
      return {
        bossId: boss.id,
        name: boss.name,
        title: boss.title,
        narrativeIntro: boss.narrativeVictory,
        totalPhases: boss.phases.length,
        currentPhaseIndex: 0,
        completedPhaseIds: boss.phases.map((p) => p.id),
        phaseName: "",
        phasePrompt: "",
        phaseDifficulty: 0,
        question: null,
        status: "victory",
        bossDefeated: true,
      };
    }

    const currentIdx = progress?.currentPhaseIndex ?? 0;
    const currentPhase = boss.phases[currentIdx];
    if (!currentPhase) {
      return {
        bossId: boss.id,
        name: boss.name,
        title: boss.title,
        narrativeIntro: boss.narrativeIntro,
        totalPhases: boss.phases.length,
        currentPhaseIndex: 0,
        completedPhaseIds: [],
        phaseName: "",
        phasePrompt: "",
        phaseDifficulty: 0,
        question: null,
        status: "active",
        bossDefeated: false,
      };
    }

    // Load the first question for the current phase
    const questions = await this.questionRepository.getByConceptId(
      currentPhase.conceptIds[0] ?? "",
    );
    const currentQuestion = questions[0] ?? null;

    return {
      bossId: boss.id,
      name: boss.name,
      title: boss.title,
      narrativeIntro: boss.narrativeIntro,
      totalPhases: boss.phases.length,
      currentPhaseIndex: currentIdx,
      completedPhaseIds: progress?.completedPhaseIds ?? [],
      phaseName: currentPhase.type.replace(/-/g, " "),
      phasePrompt: currentPhase.prompt,
      phaseDifficulty: currentPhase.difficulty,
      question: currentQuestion
        ? {
            questionId: currentQuestion.id,
            stem: currentQuestion.stem,
            options: currentQuestion.options,
            type: currentQuestion.type,
          }
        : null,
      status: "active",
      bossDefeated: false,
    };
  }

  async startBoss(playerId: string, regionId: string): Promise<BossStateResponse> {
    const boss = await this.bossRepository.getByRegion(regionId);
    if (!boss) throw new Error(`No boss encounter found for region: ${regionId}`);

    const { mission, bossProgress } = await this.bossEncounterService.startBossEncounter(
      playerId,
      boss,
    );

    await this.bossProgressRepository.save(bossProgress);

    return this.getState(playerId, regionId);
  }

  async submitAnswer(
    playerId: string,
    regionId: string,
    questionId: string,
    selectedIndex: number,
  ): Promise<{
    isCorrect: boolean;
    explanation: string;
    xpAwarded: number;
    bossState: BossStateResponse;
    newBossHealth: number;
    newPlayerHealth: number;
    score: number;
  }> {
    const boss = await this.bossRepository.getByRegion(regionId);
    if (!boss) throw new Error(`No boss encounter found for region: ${regionId}`);

    const progress = await this.bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);
    if (!progress) throw new Error("No active boss encounter. Start one first.");

    const { attackResult, isCorrect } = await this.bossEncounterService.submitAttack(
      progress.id,
      playerId,
      boss,
      questionId,
      selectedIndex,
      0,
    );

    const question = await this.questionRepository.getById(questionId);
    const explanation =
      question?.explanation ??
      (isCorrect ? "Correct!" : "Incorrect. Review the concept and try again.");

    // Update boss progress repository
    const updatedProgress: PlayerBossProgress = {
      ...progress,
      currentPhaseIndex: attackResult.nextPhaseIndex ?? progress.currentPhaseIndex,
      completedPhaseIds: attackResult.allPhasesComplete
        ? boss.phases.map((p) => p.id)
        : attackResult.phasePassed
          ? [...progress.completedPhaseIds, attackResult.phaseId]
          : progress.completedPhaseIds,
      status: attackResult.bossDefeated ? "defeated" : "active",
      completedAt: attackResult.bossDefeated ? new Date() : null,
    };
    await this.bossProgressRepository.save(updatedProgress);

    // Calculate healths
    const totalPhases = boss.phases.length;
    const completedPhases = updatedProgress.completedPhaseIds.length;
    const bossHealth = attackResult.bossDefeated
      ? 0
      : Math.max(0, 100 - (completedPhases / totalPhases) * 100 + (isCorrect ? 10 : -5));
    const playerHealth = attackResult.bossDefeated
      ? 100
      : Math.max(10, 100 - (attackResult.attemptNumber / attackResult.totalAnswered) * 20);
    const xpAwarded = isCorrect ? 15 : 0;

    const bossState = await this.getState(playerId, regionId);
    bossState.status = attackResult.bossDefeated ? "victory" : "active";
    bossState.bossDefeated = attackResult.bossDefeated;

    return {
      isCorrect,
      explanation,
      xpAwarded,
      bossState,
      newBossHealth: bossHealth,
      newPlayerHealth: playerHealth,
      score: attackResult.allPhasesComplete ? 100 : 0,
    };
  }

  async retreat(playerId: string, regionId: string): Promise<void> {
    const boss = await this.bossRepository.getByRegion(regionId);
    if (!boss) throw new Error(`No boss encounter found for region: ${regionId}`);

    const progress = await this.bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);
    if (!progress) return;

    progress.status = "retreat";
    await this.bossProgressRepository.save(progress);
  }
}

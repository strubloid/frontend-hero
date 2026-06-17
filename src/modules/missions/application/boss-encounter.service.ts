import { v4 as uuid } from "uuid";
import {
  BossEncounter,
  PlayerBossProgress,
  BossPhaseAttempt,
  BossPhase,
} from "../domain/boss-encounter";
import { Mission, MissionAttempt } from "../domain/mission";
import { MissionRepository, MissionAttemptRepository } from "../domain/mission-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { PlayerRepository } from "@/modules/players/domain/player-repository";

export interface BossAttackResult {
  phaseId: string;
  phaseName: string;
  attemptNumber: number;
  correctCount: number;
  totalAnswered: number;
  phasePassed: boolean;
  allPhasesComplete: boolean;
  bossDefeated: boolean;
  nextPhaseIndex: number | null;
  bossId: string;
}

/**
 * Service that manages boss encounter battles — multi-phase challenges
 * where the player must answer a minimum number of questions per phase.
 */
export class BossEncounterService {
  constructor(
    private readonly missionRepository: MissionRepository,
    private readonly missionAttemptRepository: MissionAttemptRepository,
    private readonly questionRepository: QuestionRepository,
    private readonly playerRepository: PlayerRepository,
  ) {}

  /**
   * Start a boss encounter mission.
   * Returns the initial boss state and questions for phase 1.
   */
  async startBossEncounter(
    playerId: string,
    boss: BossEncounter,
  ): Promise<{ mission: Mission; bossProgress: PlayerBossProgress }> {
    // Check existing active boss
    const existing = await this.missionRepository.getActiveByPlayer(playerId);
    if (existing && existing.type === "boss") {
      // Resume existing boss — fetch or reconstruct progress
      const attempts = await this.missionAttemptRepository.getByMission(existing.id);
      const completedPhaseIds = this.extractCompletedPhases(attempts, boss.phases);
      const currentPhaseIndex = boss.phases.findIndex((p) => !completedPhaseIds.includes(p.id));

      const bossProgress: PlayerBossProgress = {
        id: existing.id,
        playerId,
        bossId: boss.id,
        currentPhaseIndex: currentPhaseIndex >= 0 ? currentPhaseIndex : 0,
        completedPhaseIds,
        phaseAttempts: this.buildPhaseAttempts(attempts, boss.phases),
        status: currentPhaseIndex === -1 ? "defeated" : "active",
        startedAt: existing.startedAt,
        completedAt: existing.completedAt,
      };

      return { mission: existing, bossProgress };
    }

    // Create new mission
    const questionIds = await this.collectPhaseQuestions(playerId, boss.phases[0]);
    if (questionIds.length === 0) {
      throw new Error(
        `No questions available for phase 1 of boss "${boss.name}": ${boss.phases[0].conceptIds.join(", ")}`,
      );
    }

    const mission: Mission = {
      id: uuid(),
      playerId,
      subjectId: boss.subjectId,
      type: "boss",
      status: "active",
      questionIds,
      currentQuestionIndex: 0,
      score: 0,
      maxScore: questionIds.length,
      startedAt: new Date(),
      completedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.missionRepository.create(mission);

    const bossProgress: PlayerBossProgress = {
      id: mission.id,
      playerId,
      bossId: boss.id,
      currentPhaseIndex: 0,
      completedPhaseIds: [],
      phaseAttempts: boss.phases.map((p) => ({
        phaseId: p.id,
        attempts: 0,
        correctAnswers: 0,
        totalQuestions: 0,
        passed: false,
        completedAt: null,
      })),
      status: "active",
      startedAt: mission.startedAt,
      completedAt: null,
    };

    return { mission, bossProgress };
  }

  /**
   * Submit an answer during a boss encounter and evaluate phase status.
   * Call this after each question is answered inside a boss mission.
   */
  async submitAttack(
    missionId: string,
    playerId: string,
    boss: BossEncounter,
    questionId: string,
    selectedIndex: number,
    timeSpentSeconds: number,
  ): Promise<{
    attackResult: BossAttackResult;
    isCorrect: boolean;
  }> {
    const mission = await this.missionRepository.getById(missionId);
    if (!mission || mission.playerId !== playerId) {
      throw new Error("Mission not found or access denied");
    }

    // Record the attempt
    const attempt: MissionAttempt = {
      id: uuid(),
      missionId,
      playerId,
      questionId,
      selectedIndex,
      isCorrect: false, // will be set after checking
      timeSpentSeconds,
      hintsUsed: 0,
      attemptedAt: new Date(),
    };

    // Determine correctness
    const question = await this.questionRepository.getById(questionId);
    if (question) {
      attempt.isCorrect = selectedIndex === question.correctIndex;
    } else {
      // Fallback: fetch the seed
      attempt.isCorrect = false;
    }

    await this.missionAttemptRepository.create(attempt);

    // Get all attempts for this boss
    const allAttempts = await this.missionAttemptRepository.getByMission(missionId);

    // Determine current phase based on completed phases
    const completedPhaseIds = this.extractCompletedPhases(allAttempts, boss.phases);

    // Find current active phase
    const phaseIndex = completedPhaseIds.length;
    const currentPhase = boss.phases[phaseIndex];
    if (!currentPhase) {
      // All phases done
      const phaseAttempts = this.buildPhaseAttempts(allAttempts, boss.phases);
      const lastPhase = phaseAttempts[phaseAttempts.length - 1];

      // Mark boss as completed
      mission.status = "completed";
      mission.completedAt = new Date();
      mission.updatedAt = new Date();
      await this.missionRepository.save(mission);

      // Award XP
      await this.awardBossXp(playerId, mission, allAttempts);

      return {
        attackResult: {
          phaseId: "final",
          phaseName: "Final Phase",
          attemptNumber: lastPhase?.attempts ?? 1,
          correctCount: lastPhase?.correctAnswers ?? 0,
          totalAnswered: lastPhase?.totalQuestions ?? 0,
          phasePassed: true,
          allPhasesComplete: true,
          bossDefeated: true,
          nextPhaseIndex: null,
          bossId: boss.id,
        },
        isCorrect: attempt.isCorrect,
      };
    }

    // Count attempts in current phase
    const phaseAttemptsInPhase = allAttempts.filter(
      (a) =>
        !completedPhaseIds.some(
          (cid) => currentPhase.conceptIds.some((cc) => cc === a.questionId) || false,
        ),
    );

    const correctInPhase = phaseAttemptsInPhase.filter((a) => a.isCorrect).length;
    const totalInPhase = phaseAttemptsInPhase.length;

    const phasePassed =
      totalInPhase >= currentPhase.minCorrectCount &&
      correctInPhase >= currentPhase.minCorrectCount;

    const phaseFailed = totalInPhase >= currentPhase.maxAttempts && !phasePassed;

    let missionComplete = false;

    if (phasePassed) {
      // Move to next phase
      completedPhaseIds.push(currentPhase.id);
      const nextPhaseIndex = completedPhaseIds.length;

      if (nextPhaseIndex >= boss.phases.length) {
        // ALL phases complete — boss defeated!
        mission.status = "completed";
        mission.completedAt = new Date();
        mission.updatedAt = new Date();
        await this.missionRepository.save(mission);
        await this.awardBossXp(playerId, mission, allAttempts);
        missionComplete = true;
      } else {
        // Load questions for next phase
        const nextPhase = boss.phases[nextPhaseIndex];
        const nextQuestions = await this.collectPhaseQuestions(playerId, nextPhase);
        mission.questionIds = nextQuestions;
        mission.currentQuestionIndex = 0;
        mission.updatedAt = new Date();
        await this.missionRepository.save(mission);
      }
    }

    const bossProgress = this.buildPhaseAttempts(allAttempts, boss.phases);
    const currentPhaseProgress = bossProgress[phaseIndex] ?? {
      phaseId: currentPhase.id,
      attempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      passed: false,
      completedAt: null,
    };

    const totalPhases = boss.phases.length;
    const completedPhases = completedPhaseIds.length;

    return {
      attackResult: {
        phaseId: currentPhase.id,
        phaseName: currentPhase.type.replace(/-/g, " "),
        attemptNumber: totalInPhase,
        correctCount: correctInPhase,
        totalAnswered: totalInPhase,
        phasePassed,
        allPhasesComplete: missionComplete,
        bossDefeated: missionComplete,
        nextPhaseIndex: missionComplete ? null : phaseIndex + (phasePassed ? 1 : 0),
        bossId: boss.id,
      },
      isCorrect: attempt.isCorrect,
    };
  }

  /**
   * Retreat from a boss encounter. The mission is marked as failed,
   * and the player can retry after the cooldown.
   */
  async retreat(missionId: string, playerId: string): Promise<void> {
    const mission = await this.missionRepository.getById(missionId);
    if (!mission || mission.playerId !== playerId) {
      throw new Error("Mission not found or access denied");
    }
    mission.status = "failed";
    mission.updatedAt = new Date();
    await this.missionRepository.save(mission);
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private async collectPhaseQuestions(playerId: string, phase: BossPhase): Promise<string[]> {
    // Collect questions for each concept in the phase
    const allQuestions: string[] = [];
    for (const conceptId of phase.conceptIds) {
      const questions = await this.questionRepository.getByConceptId(conceptId);
      for (const q of questions) {
        allQuestions.push(q.id);
      }
    }
    // Shuffle and slice to a reasonable number
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.max(phase.minCorrectCount * 2, 10));
  }

  private extractCompletedPhases(attempts: MissionAttempt[], phases: BossPhase[]): string[] {
    const completed: string[] = [];
    for (const phase of phases) {
      const phaseAttempts = attempts.filter((a) =>
        phase.conceptIds.some((cid) => a.questionId.startsWith(cid.split(".")[0])),
      );
      if (
        phaseAttempts.length >= phase.minCorrectCount &&
        phaseAttempts.filter((a) => a.isCorrect).length >= phase.minCorrectCount
      ) {
        completed.push(phase.id);
      }
    }
    return completed;
  }

  private buildPhaseAttempts(attempts: MissionAttempt[], phases: BossPhase[]): BossPhaseAttempt[] {
    return phases.map((phase) => {
      const phaseAttempts = attempts.filter((a) =>
        phase.conceptIds.some((cid) => a.questionId.startsWith(cid.split(".")[0])),
      );
      return {
        phaseId: phase.id,
        attempts: phaseAttempts.length,
        correctAnswers: phaseAttempts.filter((a) => a.isCorrect).length,
        totalQuestions: phaseAttempts.length,
        passed: phaseAttempts.filter((a) => a.isCorrect).length >= phase.minCorrectCount,
        completedAt:
          phaseAttempts.length > 0 ? phaseAttempts[phaseAttempts.length - 1].attemptedAt : null,
      };
    });
  }

  private async awardBossXp(
    playerId: string,
    mission: Mission,
    attempts: MissionAttempt[],
  ): Promise<void> {
    const player = await this.playerRepository.getById(playerId);
    if (!player) return;

    const correctCount = attempts.filter((a) => a.isCorrect).length;
    const baseXp = 50;
    const correctBonus = correctCount * 10;
    const totalXp = baseXp + correctBonus;

    player.experiencePoints += totalXp;

    // Level-up check
    const xpNeeded = player.level * 100;
    if (player.experiencePoints >= xpNeeded) {
      player.experiencePoints -= xpNeeded;
      player.level += 1;
    }

    await this.playerRepository.save(player);
  }
}

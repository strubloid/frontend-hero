/**
 * A boss encounter is a multi-phase challenge that tests multiple
 * connected concepts at once. Each phase represents a distinct
 * challenge type, and the player must pass all phases to defeat the boss.
 */

export type BossPhaseType =
  | "recognize-symptoms"
  | "identify-cause"
  | "choose-repair"
  | "explain-tradeoff"
  | "prevent-regression";

export interface BossEncounter {
  id: string;
  subjectId: string;
  name: string;
  title: string;
  regionId: string;
  description: string;
  narrativeIntro: string;
  narrativeVictory: string;
  defeatMessage: string;
  phases: BossPhase[];
  requiredDifficulty: number;
  requiredConceptIds: string[];
  rewardTitle: string | null;
  rewardAchievementId: string | null;
  cooldownDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BossPhase {
  id: string;
  bossId: string;
  order: number;
  type: BossPhaseType;
  conceptIds: string[];
  prompt: string;
  context: string | null;
  difficulty: number;
  minCorrectCount: number;
  maxAttempts: number;
}

export interface PlayerBossProgress {
  id: string;
  playerId: string;
  bossId: string;
  currentPhaseIndex: number;
  completedPhaseIds: string[];
  phaseAttempts: BossPhaseAttempt[];
  status: "active" | "defeated" | "retreat";
  startedAt: Date;
  completedAt: Date | null;
}

export interface BossPhaseAttempt {
  phaseId: string;
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  completedAt: Date | null;
}

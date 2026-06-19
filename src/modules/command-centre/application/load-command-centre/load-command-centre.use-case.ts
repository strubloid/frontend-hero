import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { ProgressionRepository } from "@/modules/progression/domain/progression-repository";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { PlayerSubjectProgressRepository } from "@/modules/subjects/domain/player-subject-progress-repository";
import type { QuestRepository } from "@/modules/missions/domain/quest-repository";
import type { PlayerQuestProgress } from "@/modules/missions/domain/quest";
import { CommandCentreAssembler } from "../command-centre-assembler";
import type { CommandCentreViewModel } from "../../domain/view-models/command-centre-view-model";
import type { CurrentQuestViewModel } from "../../domain/view-models/current-quest-view-model";
import type { WorldNodeViewModel } from "../../domain/view-models/world-node-view-model";
import type { WorldNodeState } from "../../domain/view-models/world-node-state";
import type { WorldNodeType } from "../../domain/view-models/world-node-type";
import type { QuestCategory } from "../../domain/view-models/quest-category";
import type { QuestDifficulty } from "../../domain/view-models/quest-difficulty";
import type { UnlockRequirementViewModel } from "../../domain/view-models/unlock-requirement-view-model";
import type { LoadCommandCentreRequest } from "./load-command-centre.request";
import { LoadCommandCentreResult } from "./load-command-centre.result";
import type { SubjectProgression } from "@/modules/subjects/domain/subject-level";
import type { Subject } from "@/modules/subjects/domain/subject";
import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";

/** Difficulty thresholds map to the enum names used in view models. */
const XP_THRESHOLDS = [
  0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5200, 6600, 8200, 10000, 12000,
];

export class LoadCommandCentreUseCase {
  constructor(
    private readonly playerRepo: PlayerRepository,
    private readonly progressionRepo: ProgressionRepository,
    private readonly subjectRepo: SubjectRepository,
    private readonly subjectProgressRepo: PlayerSubjectProgressRepository,
    private readonly questRepo: QuestRepository,
    private readonly assembler: CommandCentreAssembler,
  ) {}

  async execute(request: LoadCommandCentreRequest): Promise<LoadCommandCentreResult> {
    const player = await this.playerRepo.getById(request.playerId);
    if (!player) {
      return new LoadCommandCentreResult(null, "Player not found");
    }

    const progression = await this.progressionRepo.getByPlayerId(player.id);
    const activeSubjectId = player.currentSubjectId;

    let playerSubjectProgress: PlayerSubjectProgress | null = null;
    let subject: Subject | null = null;

    if (activeSubjectId) {
      subject = await this.subjectRepo.getById(activeSubjectId);
      playerSubjectProgress = await this.subjectProgressRepo.findByPlayerAndSubject(
        player.id,
        activeSubjectId,
      );
    }

    // Build world nodes with calculated positions
    const worldNodes = this.buildWorldNodes(subject, playerSubjectProgress);

    // Build current quest VM
    const currentQuest = await this.buildCurrentQuest(subject, playerSubjectProgress);

    // Build recent progress summary
    const recentProgress = this.buildRecentProgress(playerSubjectProgress);

    // Default progression fallback for new players
    const defaultProgression = progression ?? {
      id: `${player.id}-progress`,
      playerId: player.id,
      level: 1,
      currentXp: 0,
      xpToNextLevel: 100,
      totalXpEarned: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const vm = this.assembler.assemble({
      player,
      progression: defaultProgression,
      playerSubjectProgress,
      subject,
      currentQuest,
      worldNodes,
      recentProgress,
    });

    return new LoadCommandCentreResult(vm, null);
  }

  // ---------------------------------------------------------------------------
  // World node builders
  // ---------------------------------------------------------------------------

  private buildWorldNodes(
    subject: Subject | null,
    progress: PlayerSubjectProgress | null,
  ): WorldNodeViewModel[] {
    if (!subject?.progression) {
      return [];
    }

    const { progression } = subject;
    const { minimumLevel, maximumLevel, bossRequired } = progression;
    const nodes: WorldNodeViewModel[] = [];
    const totalLevels = maximumLevel - minimumLevel + 1;
    const bossNode = bossRequired;

    for (let i = 0; i < totalLevels; i++) {
      const level = minimumLevel + i;
      const levelDef = progression.levels.find((l) => l.level === level);
      const isBoss = bossNode && level === maximumLevel;

      const state = this.determineNodeState(level, progress, isBoss, minimumLevel);
      const position = this.calculateNodePosition(i, totalLevels, isBoss);
      const completion = this.calculateNodeCompletion(levelDef, progress, state);

      nodes.push({
        nodeId: `${subject.id}-level-${level}`,
        title: levelDef?.title ?? `Level ${level}`,
        subtitle: levelDef?.description ?? "",
        state,
        nodeType: (isBoss ? "BOSS" : "CAMPAIGN") as WorldNodeType,
        position,
        completion,
        masteryContribution: levelDef?.requiredMastery ?? 0,
        unlockRequirements: this.buildUnlockRequirements(level, levelDef, progress, isBoss),
      });
    }

    return nodes;
  }

  private determineNodeState(
    level: number,
    progress: PlayerSubjectProgress | null,
    isBoss: boolean,
    _minLevel: number,
  ): WorldNodeState {
    if (!progress) {
      return (level === 1 ? "AVAILABLE" : "LOCKED") as WorldNodeState;
    }

    if (isBoss) {
      if (progress.bossStatus === "defeated") return "COMPLETED" as WorldNodeState;
      if (progress.bossStatus === "available" || progress.bossStatus === "active")
        return "CURRENT" as WorldNodeState;
    }

    if (level < progress.currentLevel) return "COMPLETED" as WorldNodeState;
    if (level === progress.currentLevel) {
      if (isBoss) return "CURRENT" as WorldNodeState;
      // Check if this level needs review
      if (progress.retentionScore < 0.5) return "REVIEW_REQUIRED" as WorldNodeState;
      return "CURRENT" as WorldNodeState;
    }
    if (level === progress.currentLevel + 1) return "AVAILABLE" as WorldNodeState;
    return "LOCKED" as WorldNodeState;
  }

  private calculateNodePosition(
    index: number,
    totalLevels: number,
    isBoss: boolean,
  ): { x: number; y: number } {
    if (isBoss) {
      return { x: 50, y: 92 };
    }

    const isLeft = index % 2 === 0;
    const yStart = 8;
    const yEnd = 82;
    const yRange = yEnd - yStart;
    const y = yStart + Math.round((index * yRange) / (totalLevels - 1));

    return { x: isLeft ? 18 : 82, y };
  }

  private calculateNodeCompletion(
    levelDef: { requiredSuccessfulEncounters: number } | undefined,
    progress: PlayerSubjectProgress | null,
    state: WorldNodeState,
  ): number {
    if (state === "COMPLETED") return 100;
    if (state === "CURRENT" && progress) {
      if (levelDef && levelDef.requiredSuccessfulEncounters > 0) {
        return Math.min(
          100,
          Math.round(
            (progress.successfulEncounterCount / levelDef.requiredSuccessfulEncounters) * 100,
          ),
        );
      }
      return 0;
    }
    return 0;
  }

  private buildUnlockRequirements(
    level: number,
    levelDef:
      | {
          requiredMastery?: number;
          requiredSuccessfulEncounters?: number;
          requiredReviewEncounters?: number;
        }
      | undefined,
    progress: PlayerSubjectProgress | null,
    isBoss: boolean,
  ): UnlockRequirementViewModel[] {
    const requirements: UnlockRequirementViewModel[] = [];

    if (!progress) {
      // No progress yet — all requirements unmet
      requirements.push({
        description: `Complete Level ${level} prerequisites`,
        met: false,
        current: 0,
        required: 1,
      });
      return requirements;
    }

    if (level < progress.currentLevel) {
      // Completed level — all met
      return [];
    }

    if (level === progress.currentLevel && !isBoss) {
      // Current level — everything is met
      return [];
    }

    if (level === progress.currentLevel && isBoss) {
      // Boss — show encounter completion requirements
      if (levelDef?.requiredSuccessfulEncounters) {
        requirements.push({
          description: "Successful encounters completed",
          met: progress.successfulEncounterCount >= levelDef.requiredSuccessfulEncounters,
          current: progress.successfulEncounterCount,
          required: levelDef.requiredSuccessfulEncounters,
        });
      }
      if (levelDef?.requiredReviewEncounters) {
        requirements.push({
          description: "Review encounters completed",
          met: progress.reviewEncounterCount >= levelDef.requiredReviewEncounters,
          current: progress.reviewEncounterCount,
          required: levelDef.requiredReviewEncounters,
        });
      }
      if (levelDef?.requiredMastery) {
        requirements.push({
          description: `Mastery threshold ≥ ${levelDef.requiredMastery}%`,
          met: Math.round(progress.masteryScore * 100) >= levelDef.requiredMastery,
          current: Math.round(progress.masteryScore * 100),
          required: levelDef.requiredMastery,
        });
      }

      if (requirements.length === 0) {
        requirements.push({
          description: `Complete Level ${level} encounters to challenge the boss`,
          met: false,
          current: progress.successfulEncounterCount,
          required: Math.max(1, Math.round(level * 8)),
        });
      }

      return requirements;
    }

    // Locked level — show gate requirements
    const prevLevel = level - 1;
    requirements.push({
      description: `Complete Level ${prevLevel}`,
      met: false,
      current: 0,
      required: 1,
    });

    if (levelDef?.requiredMastery) {
      requirements.push({
        description: `Achieve ${levelDef.requiredMastery}% mastery`,
        met: false,
        current: Math.round((progress?.masteryScore ?? 0) * 100),
        required: levelDef.requiredMastery,
      });
    }

    return requirements;
  }

  // ---------------------------------------------------------------------------
  // Current quest builder
  // ---------------------------------------------------------------------------

  private async buildCurrentQuest(
    subject: Subject | null,
    progress: PlayerSubjectProgress | null,
  ): Promise<CurrentQuestViewModel | null> {
    // Try to find an active daily/weekly quest with progress
    const activeQuests = await this.questRepo.getActiveQuests();
    const allProgress = progress?.playerId
      ? await this.questRepo.getAllPlayerProgress(progress.playerId)
      : [];

    // Find an incomplete quest with progress made
    for (const qp of allProgress) {
      if (!qp.completed) {
        const quest = activeQuests.find((q) => q.id === qp.questId);
        if (quest) {
          return this.questProgressToVm(quest, qp);
        }
        // Quest may have expired — use subject fallback
      }
    }

    // No active quest progress — build from subject progression
    if (subject && progress) {
      return this.subjectLevelToQuest(subject, progress);
    }

    // Subject available but no progress — start new player quest
    if (subject && !progress) {
      return {
        questId: `${subject.id}-intro`,
        category: "MAIN_QUEST" as QuestCategory,
        title: `Begin ${subject.title}`,
        narrative: `Your journey into ${subject.title} awaits. Complete your first encounters to unlock the path ahead.`,
        objective: "Complete 3 encounters to begin your campaign",
        estimatedDuration: "10 min",
        difficulty: "BEGINNER" as QuestDifficulty,
        progress: { current: 0, max: 3, percent: 0, label: "0 / 3 encounters" },
        rewards: [
          { type: "xp" as const, amount: 100, label: "100 XP" },
          { type: "knowledge_shards" as const, amount: 5, label: "5 Knowledge Shards" },
        ],
        primaryAction: {
          label: "Begin Quest",
          destination: "/play",
          disabled: false,
          disabledReason: null,
          primary: true,
        },
      };
    }

    // No subject at all — generic fallback
    return {
      questId: "welcome",
      category: "MAIN_QUEST" as QuestCategory,
      title: "Welcome to Frontend Realms",
      narrative:
        "Select a subject from the campaign rail to begin your journey. Each subject is a complete campaign with levels, encounters, and bosses.",
      objective: "Select a subject to start learning",
      estimatedDuration: "—",
      difficulty: "BEGINNER" as QuestDifficulty,
      progress: { current: 0, max: 1, percent: 0, label: "0 / 1 subject selected" },
      rewards: [{ type: "xp" as const, amount: 50, label: "50 Starting XP" }],
      primaryAction: {
        label: "Choose Subject",
        destination: "/subjects",
        disabled: false,
        disabledReason: null,
        primary: true,
      },
    };
  }

  private questProgressToVm(
    quest: { name: string; description: string; requiredCount: number; rewardXp: number },
    qp: PlayerQuestProgress,
  ): CurrentQuestViewModel {
    const percent =
      qp.requiredCount > 0
        ? Math.min(100, Math.round((qp.completedCount / qp.requiredCount) * 100))
        : 0;

    const diff =
      quest.requiredCount <= 3
        ? "BEGINNER"
        : quest.requiredCount <= 10
          ? "ADVENTURER"
          : ("EXPERT" as QuestDifficulty);

    return {
      questId: qp.questId,
      category: "MAIN_QUEST" as QuestCategory,
      title: quest.name,
      narrative: quest.description,
      objective: `Complete ${qp.requiredCount} ${quest.description.toLowerCase()}`,
      estimatedDuration: `${Math.ceil(qp.requiredCount * 3)} min`,
      difficulty: diff as QuestDifficulty,
      progress: {
        current: qp.completedCount,
        max: qp.requiredCount,
        percent,
        label: `${qp.completedCount} / ${qp.requiredCount} completed`,
      },
      rewards: [{ type: "xp" as const, amount: quest.rewardXp, label: `${quest.rewardXp} XP` }],
      primaryAction: {
        label: "Continue Quest",
        destination: "/play",
        disabled: false,
        disabledReason: null,
        primary: true,
      },
    };
  }

  private subjectLevelToQuest(
    subject: Subject,
    progress: PlayerSubjectProgress,
  ): CurrentQuestViewModel {
    const currentLevelDef = this.findLevelDef(subject.progression, progress.currentLevel);
    const title = currentLevelDef?.title ?? `Level ${progress.currentLevel}`;
    const narrative =
      currentLevelDef?.introduction ??
      currentLevelDef?.description ??
      `Progress through ${title} in the ${subject.title} campaign.`;
    const objective = currentLevelDef?.description ?? "Complete encounters to advance";
    const requiredEncounters = currentLevelDef?.requiredSuccessfulEncounters ?? 20;
    const requiredReviews = currentLevelDef?.requiredReviewEncounters ?? 5;
    const totalRequired = requiredEncounters + requiredReviews;
    const totalProgress = progress.successfulEncounterCount + progress.reviewEncounterCount;
    const percent =
      totalRequired > 0 ? Math.min(100, Math.round((totalProgress / totalRequired) * 100)) : 0;

    // Map difficulty range to enum
    const maxDiff = currentLevelDef?.difficultyRange?.maximum ?? 3;
    const difficulty =
      maxDiff <= 2
        ? ("BEGINNER" as QuestDifficulty)
        : maxDiff <= 4
          ? ("ADVENTURER" as QuestDifficulty)
          : maxDiff <= 6
            ? ("EXPERT" as QuestDifficulty)
            : maxDiff <= 8
              ? ("MASTER" as QuestDifficulty)
              : ("LEGENDARY" as QuestDifficulty);

    // Estimate remaining duration
    const remaining = Math.max(0, totalRequired - totalProgress);
    const estimatedMin = Math.ceil(remaining * 2);

    return {
      questId: `${subject.id}-level-${progress.currentLevel}`,
      category: "MAIN_QUEST" as QuestCategory,
      title: `${subject.title} — ${title}`,
      narrative,
      objective,
      estimatedDuration: estimatedMin > 0 ? `${estimatedMin} min` : "Almost complete",
      difficulty,
      progress: {
        current: totalProgress,
        max: totalRequired,
        percent,
        label: `${totalProgress} / ${totalRequired} progress`,
      },
      rewards: [
        {
          type: "xp" as const,
          amount: 100 + progress.currentLevel * 20,
          label: `${100 + progress.currentLevel * 20} XP`,
        },
        {
          type: "knowledge_shards" as const,
          amount: 10 + progress.currentLevel * 2,
          label: `${10 + progress.currentLevel * 2} Knowledge Shards`,
        },
      ],
      primaryAction: {
        label: progress.currentLevel > 1 && percent === 0 ? "Review Level" : "Continue Quest",
        destination: "/play",
        disabled: false,
        disabledReason: null,
        primary: true,
      },
    };
  }

  private findLevelDef(progression: SubjectProgression | null | undefined, level: number) {
    return progression?.levels?.find((l) => l.level === level);
  }

  // ---------------------------------------------------------------------------
  // Recent progress builder
  // ---------------------------------------------------------------------------

  private buildRecentProgress(progress: PlayerSubjectProgress | null): {
    xpGained: number;
    masteryChange: number | null;
    missionsCompleted: number;
    conceptsMastered: number;
    lastAction: string;
  } {
    if (!progress) {
      return {
        xpGained: 0,
        masteryChange: null,
        missionsCompleted: 0,
        conceptsMastered: 0,
        lastAction: "Welcome to Frontend Realms!",
      };
    }

    return {
      xpGained: progress.successfulEncounterCount * 25,
      masteryChange: Math.round(progress.masteryScore * 100),
      missionsCompleted: progress.successfulEncounterCount + progress.reviewEncounterCount,
      conceptsMastered: progress.distinctStudySessionCount,
      lastAction: progress.completedAt
        ? `${progress.currentLevel > 1 ? `Level ${progress.currentLevel}` : "Campaign"} in progress`
        : `Level ${progress.currentLevel} — continuing campaign`,
    };
  }
}

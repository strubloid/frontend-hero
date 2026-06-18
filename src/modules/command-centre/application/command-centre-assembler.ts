import type { Player } from "@/modules/players/domain/player";
import type { PlayerProgression } from "@/modules/progression/domain/player-progression";
import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";
import type { Subject } from "@/modules/subjects/domain/subject";
import type { CommandCentreViewModel } from "../presentation/view-models/command-centre-view-model";
import type { CommandCentrePlayerState } from "../presentation/view-models/command-centre-player-state";
import type { QuestCategory } from "../presentation/view-models/quest-category";
import type { QuestDifficulty } from "../presentation/view-models/quest-difficulty";
import type { WorldNodeState } from "../presentation/view-models/world-node-state";
import type { WorldNodeType } from "../presentation/view-models/world-node-type";
import type { WorldNodeViewModel } from "../presentation/view-models/world-node-view-model";
import type { CampaignLevelViewModel } from "../presentation/view-models/campaign-rail-view-model";
import { buildDefaultCommandCentre } from "../development/development-fixtures";

/**
 * Maps domain objects into a CommandCentreViewModel.
 *
 * When real repositories are not yet wired, use the static `default()`
 * method which returns a richly populated fixture VM.
 */
export class CommandCentreAssembler {
  assemble(args: {
    player: Player;
    progression: PlayerProgression;
    playerSubjectProgress: PlayerSubjectProgress | null;
    subject: Subject | null;
    currentQuest: unknown;
    worldNodes: WorldNodeViewModel[];
    recentProgress: { xpGained: number; masteryChange: number | null; missionsCompleted: number; conceptsMastered: number; lastAction: string };
  }): CommandCentreViewModel {
    const { player, progression, playerSubjectProgress, subject, currentQuest, worldNodes, recentProgress } = args;

    // -- HUD --
    const playerIdentity = {
      displayName: player.name ?? player.email ?? "Adventurer",
      avatarUrl: player.image,
      title: player.selectedTitle ?? "Novice",
      level: player.level,
    };

    const xpToNextLevel = progression.level >= 15 ? 0 : progression.xpToNextLevel;
    const xpInThisLevel = progression.totalXpEarned - this.getXpForLevel(progression.level);
    const nextLevelThreshold = this.getXpForLevel(progression.level + 1);
    const currentLevelThreshold = this.getXpForLevel(progression.level);
    const range = nextLevelThreshold - currentLevelThreshold;
    const progressPercent = range > 0 ? Math.round((xpInThisLevel / range) * 100) : 100;

    const levelVm = {
      level: progression.level,
      currentXp: progression.currentXp,
      xpToNextLevel,
      progressPercent: Math.min(100, Math.max(0, progressPercent)),
    };

    const activeSubject = subject && playerSubjectProgress
      ? {
          subjectId: subject.id,
          subjectTitle: subject.title,
          currentLevel: playerSubjectProgress.currentLevel,
          maximumLevel: playerSubjectProgress.maximumLevel,
          masteryScore: Math.round(playerSubjectProgress.masteryScore * 100),
          levelTitle: this.getLevelTitle(subject, playerSubjectProgress.currentLevel),
        }
      : null;

    const hud = {
      player: playerIdentity,
      level: levelVm,
      activeSubject,
      currencies: [
        { id: "xp", label: "XP", amount: progression.totalXpEarned, icon: "⚡", tooltip: "Experience points earned" },
        { id: "mastery", label: "Mastery", amount: activeSubject ? activeSubject.masteryScore : 0, icon: "⭐", tooltip: "Overall mastery score" },
      ],
      notifications: [],
    };

    // -- Player state --
    const playerState = this.determinePlayerState(playerSubjectProgress, currentQuest);

    // -- Current quest --
    const currentQuestVm = currentQuest
      ? {
          questId: (currentQuest as Record<string, unknown>).questId as string ?? "quest-1",
          category: "MAIN_QUEST" as QuestCategory,
          title: (currentQuest as Record<string, unknown>).title as string ?? "Continue Your Journey",
          narrative: (currentQuest as Record<string, unknown>).narrative as string ?? "Master the next concept in your subject.",
          objective: (currentQuest as Record<string, unknown>).objective as string ?? "Complete 3 encounters",
          estimatedDuration: "15 min",
          difficulty: "BEGINNER" as QuestDifficulty,
          progress: { current: 1, max: 3, percent: 33, label: "1 / 3 encounters" },
          rewards: [{ type: "xp" as const, amount: 100, label: "100 XP" }],
          primaryAction: { label: "Continue", destination: "/missions/active", disabled: false, disabledReason: null, primary: true },
        }
      : null;

    // -- Campaign rail --
    const levels: CampaignLevelViewModel[] =
      subject?.progression?.levels.map((lvl) => ({
        level: lvl.level,
        title: lvl.title,
        state: this.determineLevelState(lvl.level, playerSubjectProgress),
      })) ?? [];

    const campaign = {
      subjectId: subject?.id ?? "unknown",
      subjectTitle: subject?.title ?? "No Subject Selected",
      levels,
    };

    // -- World map --
    const connections = worldNodes
      .filter((n) => n.nodeId !== worldNodes[0]?.nodeId)
      .map((n) => ({
        fromNodeId: worldNodes[0]?.nodeId ?? "",
        toNodeId: n.nodeId,
        state: n.state === "LOCKED" ? ("inactive" as const) : ("active" as const),
      }));

    const world = { nodes: worldNodes, connections };

    // -- Recent progress --
    const recentProgressVm = {
      xpGained: recentProgress.xpGained,
      masteryChange: recentProgress.masteryChange,
      missionsCompleted: recentProgress.missionsCompleted,
      conceptsMastered: recentProgress.conceptsMastered,
      lastAction: recentProgress.lastAction,
    };

    // -- Recommended actions --
    const recommendedActions = [
      { id: "continue", label: "Continue Learning", description: "Pick up where you left off", primary: true, destination: "/missions/active", icon: "play" },
      { id: "review", label: "Review", description: "Strengthen weaker concepts", primary: false, destination: "/reviews", icon: "book" },
    ];

    return {
      hud,
      currentQuest: currentQuestVm,
      campaign,
      world,
      recentProgress: recentProgressVm,
      recommendedActions,
      playerState,
    };
  }

  /**
   * Returns a fully-populated development fixture VM.
   */
  static default(): CommandCentreViewModel {
    return buildDefaultCommandCentre();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private determinePlayerState(
    progress: PlayerSubjectProgress | null,
    _currentQuest: unknown,
  ): CommandCentrePlayerState {
    if (!progress) return "NEW_PLAYER" as CommandCentrePlayerState;
    if (progress.completedAt) return "SUBJECT_COMPLETED" as CommandCentrePlayerState;
    if (progress.bossStatus === "available" || progress.bossStatus === "active") return "BOSS_AVAILABLE" as CommandCentrePlayerState;
    return "ACTIVE_QUEST" as CommandCentrePlayerState;
  }

  private determineLevelState(
    level: number,
    progress: PlayerSubjectProgress | null,
  ): WorldNodeState {
    if (!progress) return "LOCKED" as WorldNodeState;
    if (level < progress.currentLevel) return "COMPLETED" as WorldNodeState;
    if (level === progress.currentLevel) return "CURRENT" as WorldNodeState;
    return "LOCKED" as WorldNodeState;
  }

  private getLevelTitle(subject: Subject, level: number): string {
    return subject.progression?.levels.find((l) => l.level === level)?.title ?? `Level ${level}`;
  }

  private getXpForLevel(level: number): number {
    const thresholds = [0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5200, 6600, 8200, 10000, 12000];
    return thresholds[level - 1] ?? thresholds[thresholds.length - 1] ?? 0;
  }
}

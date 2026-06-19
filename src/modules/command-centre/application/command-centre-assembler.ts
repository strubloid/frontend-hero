import type { Player } from "@/modules/players/domain/player";
import type { PlayerProgression } from "@/modules/progression/domain/player-progression";
import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";
import type { Subject } from "@/modules/subjects/domain/subject";
import type { CommandCentreViewModel } from "../domain/view-models/command-centre-view-model";
import type { CommandCentrePlayerState } from "../domain/view-models/command-centre-player-state";
import type { CurrentQuestViewModel } from "../domain/view-models/current-quest-view-model";
import type { WorldNodeState } from "../domain/view-models/world-node-state";
import type { WorldNodeViewModel } from "../domain/view-models/world-node-view-model";
import type { CampaignLevelViewModel } from "../domain/view-models/campaign-rail-view-model";
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
    currentQuest: CurrentQuestViewModel | null;
    worldNodes: WorldNodeViewModel[];
    recentProgress: {
      xpGained: number;
      masteryChange: number | null;
      missionsCompleted: number;
      conceptsMastered: number;
      lastAction: string;
    };
  }): CommandCentreViewModel {
    const {
      player,
      progression,
      playerSubjectProgress,
      subject,
      currentQuest,
      worldNodes,
      recentProgress,
    } = args;

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

    const activeSubject =
      subject && playerSubjectProgress
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
        {
          id: "xp",
          label: "XP",
          amount: progression.totalXpEarned,
          icon: "⚡",
          tooltip: "Experience points earned",
        },
        {
          id: "mastery",
          label: "Mastery",
          amount: activeSubject ? activeSubject.masteryScore : 0,
          icon: "⭐",
          tooltip: "Overall mastery score",
        },
      ],
      notifications: [],
    };

    // -- Player state --
    const playerState = this.determinePlayerState(playerSubjectProgress, currentQuest);

    // -- Current quest (pre-built by use case) --
    const currentQuestVm = currentQuest;

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

    // -- World map connections (sequential path) --
    const sortedNodes = [...worldNodes];
    const connections = sortedNodes.slice(0, -1).map((node, i) => {
      const nextNode = sortedNodes[i + 1];
      const isLocked = node.state === "LOCKED" || nextNode.state === "LOCKED";
      const isCompleted = node.state === "COMPLETED" && nextNode.state === "COMPLETED";
      return {
        fromNodeId: node.nodeId,
        toNodeId: nextNode.nodeId,
        state: (isCompleted ? "completed" : isLocked ? "inactive" : "active") as
          | "active"
          | "inactive"
          | "completed",
      };
    });

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
      {
        id: "continue",
        label: "Continue Quest",
        description: "Resume your current mission",
        primary: true,
        destination: "/play",
        icon: "play",
      },
      {
        id: "review",
        label: "Review",
        description: "Strengthen weaker concepts",
        primary: false,
        destination: "/reviews",
        icon: "book",
      },
      {
        id: "forge",
        label: "Encounter Forge",
        description: "Generate and monitor encounter supply",
        primary: false,
        destination: "/encounter-forge",
        icon: "star",
      },
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
    _currentQuest: CurrentQuestViewModel | null,
  ): CommandCentrePlayerState {
    if (!progress) return "NEW_PLAYER" as CommandCentrePlayerState;
    if (progress.completedAt) return "SUBJECT_COMPLETED" as CommandCentrePlayerState;
    if (progress.bossStatus === "available" || progress.bossStatus === "active")
      return "BOSS_AVAILABLE" as CommandCentrePlayerState;
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
    const thresholds = [
      0, 100, 250, 500, 800, 1200, 1700, 2300, 3000, 4000, 5200, 6600, 8200, 10000, 12000,
    ];
    return thresholds[level - 1] ?? thresholds[thresholds.length - 1] ?? 0;
  }
}

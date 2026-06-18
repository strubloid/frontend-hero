import type { CommandCentreViewModel } from "../presentation/view-models/command-centre-view-model";
import type { CommandCentrePlayerState } from "../presentation/view-models/command-centre-player-state";
import type { QuestCategory } from "../presentation/view-models/quest-category";
import type { QuestDifficulty } from "../presentation/view-models/quest-difficulty";
import type { WorldNodeState } from "../presentation/view-models/world-node-state";
import type { WorldNodeType } from "../presentation/view-models/world-node-type";

/**
 * Builds a fully-populated, hardcoded CommandCentreViewModel for development
 * use when no real player data or repositories are available.
 */
export function buildDefaultCommandCentre(): CommandCentreViewModel {
  return {
    hud: {
      player: {
        displayName: "Alex the Curious",
        avatarUrl: null,
        title: "Apprentice Scholar",
        level: 5,
      },
      level: {
        level: 5,
        currentXp: 640,
        xpToNextLevel: 160,
        progressPercent: 53,
      },
      activeSubject: {
        subjectId: "nextjs",
        subjectTitle: "Next.js",
        currentLevel: 3,
        maximumLevel: 10,
        masteryScore: 47,
        levelTitle: "Component Boundaries",
      },
      currencies: [
        { id: "xp", label: "XP", amount: 12450, icon: "⚡", tooltip: "Total experience points earned" },
        { id: "knowledge_shards", label: "Shards", amount: 340, icon: "💎", tooltip: "Knowledge shards for unlocking content" },
      ],
      notifications: [
        { type: "daily_available", label: "Daily quests available!", priority: "normal", destination: "/quests/daily" },
      ],
    },

    currentQuest: {
      questId: "quest-nextjs-3",
      category: "MAIN_QUEST" as QuestCategory,
      title: "Master Component Boundaries",
      narrative: "The realm of Next.js requires you to understand how components communicate across boundaries. Complete three encounters to advance.",
      objective: "Complete 3 encounters on component patterns",
      estimatedDuration: "15 min",
      difficulty: "ADVENTURER" as QuestDifficulty,
      progress: { current: 1, max: 3, percent: 33, label: "1 / 3 encounters" },
      rewards: [
        { type: "xp", amount: 250, label: "250 XP" },
        { type: "mastery", amount: 5, label: "+5% Mastery" },
      ],
      primaryAction: {
        label: "Continue Quest",
        destination: "/missions/active",
        disabled: false,
        disabledReason: null,
        primary: true,
      },
    },

    campaign: {
      subjectId: "nextjs",
      subjectTitle: "Next.js",
      levels: [
        { level: 1, title: "Foundations", state: "COMPLETED" as WorldNodeState },
        { level: 2, title: "Routing & Navigation", state: "COMPLETED" as WorldNodeState },
        { level: 3, title: "Component Boundaries", state: "CURRENT" as WorldNodeState },
        { level: 4, title: "Data Fetching", state: "LOCKED" as WorldNodeState },
        { level: 5, title: "Server Actions", state: "LOCKED" as WorldNodeState },
        { level: 6, title: "Middleware & Edge", state: "LOCKED" as WorldNodeState },
        { level: 7, title: "Advanced Patterns", state: "LOCKED" as WorldNodeState },
        { level: 8, title: "Performance", state: "LOCKED" as WorldNodeState },
        { level: 9, title: "Full-Stack Integration", state: "LOCKED" as WorldNodeState },
        { level: 10, title: "Production Mastery", state: "LOCKED" as WorldNodeState },
      ],
    },

    world: {
      nodes: [
        {
          nodeId: "node-foundations",
          title: "Foundations",
          subtitle: "Core concepts",
          state: "COMPLETED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 20, y: 70 },
          completion: 100,
          masteryContribution: 85,
          unlockRequirements: [],
        },
        {
          nodeId: "node-routing",
          title: "Routing & Navigation",
          subtitle: "Pages and navigation",
          state: "COMPLETED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 35, y: 50 },
          completion: 100,
          masteryContribution: 72,
          unlockRequirements: [],
        },
        {
          nodeId: "node-component-boundaries",
          title: "Component Boundaries",
          subtitle: "Client vs Server",
          state: "CURRENT" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 50, y: 35 },
          completion: 33,
          masteryContribution: 47,
          unlockRequirements: [],
        },
        {
          nodeId: "node-data-fetching",
          title: "Data Fetching",
          subtitle: "SSR, SSG, ISR",
          state: "LOCKED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 65, y: 45 },
          completion: 0,
          masteryContribution: 0,
          unlockRequirements: [
            { description: "Complete Component Boundaries", met: false, current: 1, required: 3 },
          ],
        },
        {
          nodeId: "node-boss-level-3",
          title: "Level 3 Boss",
          subtitle: "Component Challenge",
          state: "LOCKED" as WorldNodeState,
          nodeType: "BOSS" as WorldNodeType,
          position: { x: 50, y: 15 },
          completion: 0,
          masteryContribution: 0,
          unlockRequirements: [
            { description: "Master 3 encounters first", met: false, current: 1, required: 3 },
          ],
        },
        {
          nodeId: "node-review",
          title: "Review Hub",
          subtitle: "Strengthen your knowledge",
          state: "AVAILABLE" as WorldNodeState,
          nodeType: "REVIEW" as WorldNodeType,
          position: { x: 20, y: 25 },
          completion: 0,
          masteryContribution: 0,
          unlockRequirements: [],
        },
      ],
      connections: [
        { fromNodeId: "node-foundations", toNodeId: "node-routing", state: "completed" },
        { fromNodeId: "node-routing", toNodeId: "node-component-boundaries", state: "active" },
        { fromNodeId: "node-component-boundaries", toNodeId: "node-data-fetching", state: "inactive" },
        { fromNodeId: "node-component-boundaries", toNodeId: "node-boss-level-3", state: "inactive" },
        { fromNodeId: "node-foundations", toNodeId: "node-review", state: "active" },
      ],
    },

    recentProgress: {
      xpGained: 120,
      masteryChange: 3,
      missionsCompleted: 1,
      conceptsMastered: 0,
      lastAction: "Completed a routing encounter",
    },

    recommendedActions: [
      {
        id: "continue-quest",
        label: "Continue Quest",
        description: "Complete your current quest on Component Boundaries",
        primary: true,
        destination: "/missions/active",
        icon: "play",
      },
      {
        id: "review-session",
        label: "Quick Review",
        description: "Strengthen your understanding of routing fundamentals",
        primary: false,
        destination: "/reviews",
        icon: "book",
      },
      {
        id: "daily-quests",
        label: "Daily Quests",
        description: "Check today's challenges for bonus XP",
        primary: false,
        destination: "/quests/daily",
        icon: "calendar",
      },
    ],

    playerState: "ACTIVE_QUEST" as CommandCentrePlayerState,
  };
}

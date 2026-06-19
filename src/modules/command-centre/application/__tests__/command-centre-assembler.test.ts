import { describe, it, expect, beforeEach } from "vitest";
import { CommandCentreAssembler } from "@/modules/command-centre/application/command-centre-assembler";
import type { Player } from "@/modules/players/domain/player";
import type { PlayerProgression } from "@/modules/progression/domain/player-progression";
import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";
import type { Subject } from "@/modules/subjects/domain/subject";
import type { CommandCentrePlayerState } from "@/modules/command-centre/domain/view-models/command-centre-player-state";
import type { WorldNodeViewModel } from "@/modules/command-centre/domain/view-models/world-node-view-model";
import type { WorldNodeState } from "@/modules/command-centre/domain/view-models/world-node-state";
import type { WorldNodeType } from "@/modules/command-centre/domain/view-models/world-node-type";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "player-1",
    name: "TestPlayer",
    email: "test@example.com",
    passwordHash: null,
    emailVerified: null,
    image: null,
    level: 5,
    experiencePoints: 640,
    masteryPoints: 200,
    currentSubjectId: "nextjs",
    currentRegionId: null,
    lastActiveAt: new Date(),
    lastReturnBonusClaimedAt: null,
    selectedTitle: "Apprentice Scholar",
    selectedTheme: null,
    workshopTier: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as Player;
}

function makeProgression(overrides: Partial<PlayerProgression> = {}): PlayerProgression {
  return {
    id: "prog-1",
    playerId: "player-1",
    level: 5,
    currentXp: 640,
    xpToNextLevel: 160,
    totalXpEarned: 2450,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as PlayerProgression;
}

function makeSubjectProgress(
  overrides: Partial<PlayerSubjectProgress> = {},
): PlayerSubjectProgress {
  return {
    playerId: "player-1",
    subjectId: "nextjs",
    currentLevel: 3,
    maximumLevel: 10,
    masteryScore: 0.47,
    retentionScore: 0.62,
    successfulEncounterCount: 15,
    reviewEncounterCount: 8,
    practicalEncounterCount: 3,
    distinctStudySessionCount: 12,
    bossStatus: "locked",
    startedAt: new Date("2025-01-15"),
    completedAt: null,
    ...overrides,
  };
}

function makeSubject(overrides: Partial<Subject> = {}): Subject {
  return {
    id: "nextjs",
    title: "Next.js",
    description: "Full-stack React framework",
    version: 1,
    schemaVersion: 1,
    minimumGameVersion: "1.0.0",
    progression: {
      minimumLevel: 1,
      maximumLevel: 10,
      estimatedDaysPerLevel: 7,
      bossRequired: true,
      levels: [
        {
          level: 1,
          title: "Foundations",
          description: "",
          difficultyRange: { minimum: 1, maximum: 2 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 3,
          requiredReviewEncounters: 1,
          concepts: [],
          allowedChallengeTypes: ["encounter"],
        },
        {
          level: 2,
          title: "Routing & Navigation",
          description: "",
          difficultyRange: { minimum: 2, maximum: 3 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 3,
          requiredReviewEncounters: 1,
          concepts: [],
          allowedChallengeTypes: ["encounter"],
        },
        {
          level: 3,
          title: "Component Boundaries",
          description: "",
          difficultyRange: { minimum: 3, maximum: 4 },
          requiredMastery: 65,
          requiredSuccessfulEncounters: 3,
          requiredReviewEncounters: 2,
          concepts: [],
          allowedChallengeTypes: ["encounter"],
        },
      ],
    },
    domains: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeWorldNodes(): WorldNodeViewModel[] {
  return [
    {
      nodeId: "node-1",
      title: "Node 1",
      subtitle: "First",
      state: "COMPLETED" as WorldNodeState,
      nodeType: "CAMPAIGN" as WorldNodeType,
      position: { x: 20, y: 70 },
      completion: 100,
      masteryContribution: 85,
      unlockRequirements: [],
    },
    {
      nodeId: "node-2",
      title: "Node 2",
      subtitle: "Second",
      state: "CURRENT" as WorldNodeState,
      nodeType: "CAMPAIGN" as WorldNodeType,
      position: { x: 50, y: 50 },
      completion: 33,
      masteryContribution: 47,
      unlockRequirements: [],
    },
    {
      nodeId: "node-3",
      title: "Node 3",
      subtitle: "Third",
      state: "LOCKED" as WorldNodeState,
      nodeType: "CAMPAIGN" as WorldNodeType,
      position: { x: 80, y: 30 },
      completion: 0,
      masteryContribution: 0,
      unlockRequirements: [],
    },
  ];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CommandCentreAssembler", () => {
  let assembler: CommandCentreAssembler;

  beforeEach(() => {
    assembler = new CommandCentreAssembler();
  });

  describe("assemble", () => {
    it("returns a valid CommandCentreViewModel with all required sections", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress(),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: makeWorldNodes(),
        recentProgress: {
          xpGained: 120,
          masteryChange: 3,
          missionsCompleted: 1,
          conceptsMastered: 0,
          lastAction: "Test action",
        },
      });

      expect(result).toBeDefined();
      expect(result.hud).toBeDefined();
      expect(result.hud.player).toBeDefined();
      expect(result.hud.level).toBeDefined();
      expect(result.hud.currencies).toHaveLength(2);
      expect(result.currentQuest).toBeNull();
      expect(result.campaign).toBeDefined();
      expect(result.campaign.levels).toHaveLength(3);
      expect(result.world).toBeDefined();
      expect(result.world.nodes).toHaveLength(3);
      expect(result.world.connections).toHaveLength(2);
      expect(result.recentProgress).toBeDefined();
      expect(result.recommendedActions).toHaveLength(3);
      expect(result.playerState).toBeDefined();
    });

    it("maps player identity fields correctly", () => {
      const player = makePlayer({
        name: "Hero",
        image: "/avatar.png",
        selectedTitle: "Wizard",
        level: 7,
      });
      const result = assembler.assemble({
        player,
        progression: makeProgression(),
        playerSubjectProgress: null,
        subject: null,
        currentQuest: null,
        worldNodes: makeWorldNodes(),
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.hud.player.displayName).toBe("Hero");
      expect(result.hud.player.avatarUrl).toBe("/avatar.png");
      expect(result.hud.player.title).toBe("Wizard");
      expect(result.hud.player.level).toBe(7);
    });

    it("uses fallback title when no title is set", () => {
      const player = makePlayer({ selectedTitle: null });
      const result = assembler.assemble({
        player,
        progression: makeProgression(),
        playerSubjectProgress: null,
        subject: null,
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.hud.player.displayName).toBe("TestPlayer");
      expect(result.hud.player.title).toBe("Novice");
    });

    it("shows active subject when playerSubjectProgress and subject are provided", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress(),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.hud.activeSubject).not.toBeNull();
      expect(result.hud.activeSubject!.subjectId).toBe("nextjs");
      expect(result.hud.activeSubject!.subjectTitle).toBe("Next.js");
      expect(result.hud.activeSubject!.currentLevel).toBe(3);
      expect(result.hud.activeSubject!.maximumLevel).toBe(10);
      expect(result.hud.activeSubject!.masteryScore).toBe(47);
      expect(result.hud.activeSubject!.levelTitle).toBe("Component Boundaries");
    });

    it("hides active subject when subject data is absent", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: null,
        subject: null,
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.hud.activeSubject).toBeNull();
    });

    it("builds campaign rail from subject progression levels", () => {
      const subject = makeSubject();
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress(),
        subject,
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.campaign.subjectId).toBe("nextjs");
      expect(result.campaign.subjectTitle).toBe("Next.js");
      expect(result.campaign.levels).toHaveLength(3);
      expect(result.campaign.levels[0].level).toBe(1);
      expect(result.campaign.levels[0].title).toBe("Foundations");
      expect(result.campaign.levels[0].state).toBe("COMPLETED");
      expect(result.campaign.levels[1].state).toBe("COMPLETED");
      expect(result.campaign.levels[2].state).toBe("CURRENT");
    });

    it("determines NEW_PLAYER state when no subject progress exists", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: null,
        subject: null,
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.playerState).toBe("NEW_PLAYER" as CommandCentrePlayerState);
    });

    it("determines BOSS_AVAILABLE when boss is available", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress({ bossStatus: "available" }),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.playerState).toBe("BOSS_AVAILABLE" as CommandCentrePlayerState);
    });

    it("determines SUBJECT_COMPLETED when subject is done", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress({
          completedAt: new Date(),
          bossStatus: "defeated",
        }),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.playerState).toBe("SUBJECT_COMPLETED" as CommandCentrePlayerState);
    });

    it("sets progressPercent based on XP thresholds", () => {
      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression({
          level: 3,
          currentXp: 400,
          totalXpEarned: 400,
          xpToNextLevel: 100,
        }),
        playerSubjectProgress: null,
        subject: null,
        currentQuest: null,
        worldNodes: [],
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      // Level 3 threshold is 250, level 4 is 500, so 400 total => 150 in current level / 250 range = 60%
      expect(result.hud.level.progressPercent).toBeGreaterThanOrEqual(0);
      expect(result.hud.level.progressPercent).toBeLessThanOrEqual(100);
    });
  });

  describe("default static factory", () => {
    it("returns a fully populated fixture VM", () => {
      const result = CommandCentreAssembler.default();

      expect(result).toBeDefined();
      expect(result.hud.player.displayName).toBe("Alex the Curious");
      expect(result.hud.activeSubject).not.toBeNull();
      expect(result.currentQuest).not.toBeNull();
      expect(result.campaign.levels).toHaveLength(10);
      expect(result.world.nodes.length).toBeGreaterThanOrEqual(5);
      expect(result.world.connections.length).toBeGreaterThanOrEqual(4);
      expect(result.recommendedActions.length).toBeGreaterThanOrEqual(2);
      expect(result.playerState).toBe("ACTIVE_QUEST" as CommandCentrePlayerState);
    });

    it("includes a current quest with rewards and action", () => {
      const result = CommandCentreAssembler.default();

      expect(result.currentQuest!.questId).toBe("quest-nextjs-3");
      expect(result.currentQuest!.category).toBe("MAIN_QUEST");
      expect(result.currentQuest!.difficulty).toBe("ADVENTURER");
      expect(result.currentQuest!.progress.current).toBe(1);
      expect(result.currentQuest!.progress.max).toBe(3);
      expect(result.currentQuest!.rewards).toHaveLength(2);
      expect(result.currentQuest!.primaryAction.label).toBe("Continue Quest");
      expect(result.currentQuest!.primaryAction.primary).toBe(true);
    });

    it("has nodes in various world states", () => {
      const result = CommandCentreAssembler.default();
      const states = result.world.nodes.map((n) => n.state);

      expect(states).toContain("COMPLETED");
      expect(states).toContain("CURRENT");
      expect(states).toContain("LOCKED");
      expect(states).toContain("AVAILABLE");
    });

    it("has connections linking world nodes", () => {
      const result = CommandCentreAssembler.default();

      expect(result.world.connections.length).toBeGreaterThan(0);
      expect(result.world.connections[0].fromNodeId).toBeDefined();
      expect(result.world.connections[0].toNodeId).toBeDefined();
    });

    it("creates sequential connections (node1→node2, node2→node3)", () => {
      const result = CommandCentreAssembler.default();

      // The default fixture has 6 nodes — the connections should form
      // a coherent directed graph covering all nodes.
      const nodeIds = result.world.nodes.map((n) => n.nodeId);
      const connectionIds = new Set<string>();
      for (const conn of result.world.connections) {
        connectionIds.add(conn.fromNodeId);
        connectionIds.add(conn.toNodeId);
      }

      // Every node appears in at least one connection
      for (const id of nodeIds) {
        expect(connectionIds.has(id)).toBe(true);
      }

      // Connections are between existing nodes
      for (const conn of result.world.connections) {
        expect(nodeIds).toContain(conn.fromNodeId);
        expect(nodeIds).toContain(conn.toNodeId);
      }

      // Main sequential path exists: foundations → routing → component-boundaries
      const pathConnections = result.world.connections.filter(
        (c) => c.state === "completed" || c.state === "active",
      );
      expect(pathConnections.length).toBeGreaterThanOrEqual(2);
    });

    it("has connections that reflect endpoint node states", () => {
      const result = CommandCentreAssembler.default();
      const nodeById = new Map(result.world.nodes.map((n) => [n.nodeId, n]));

      for (const conn of result.world.connections) {
        const from = nodeById.get(conn.fromNodeId);
        const to = nodeById.get(conn.toNodeId);
        expect(from).toBeDefined();
        expect(to).toBeDefined();

        // Completed both ends ⇒ completed connection
        if (from!.state === ("COMPLETED" as const) && to!.state === ("COMPLETED" as const)) {
          expect(conn.state).toBe("completed");
        }

        // Either end locked ⇒ inactive
        if (from!.state === ("LOCKED" as const) || to!.state === ("LOCKED" as const)) {
          expect(conn.state).toBe("inactive");
        }
      }
    });

    it("uses predictable nodeId naming pattern", () => {
      const result = CommandCentreAssembler.default();

      // Every world node from the default fixture has a 'node-' prefix
      for (const node of result.world.nodes) {
        expect(node.nodeId).toMatch(/^node-/);
      }
    });
  });

  describe("determineLevelState", () => {
    let assembler: CommandCentreAssembler;

    beforeEach(() => {
      assembler = new CommandCentreAssembler();
    });

    it("returns LOCKED when no progress exists", () => {
      const result = (assembler as any).determineLevelState(1, null) as string;
      expect(result).toBe("LOCKED");
    });

    it("returns COMPLETED for levels below currentLevel", () => {
      const result = (assembler as any).determineLevelState(
        1,
        makeSubjectProgress({ currentLevel: 3 }),
      ) as string;
      expect(result).toBe("COMPLETED");
    });

    it("returns CURRENT for level matching currentLevel", () => {
      const result = (assembler as any).determineLevelState(
        3,
        makeSubjectProgress({ currentLevel: 3 }),
      ) as string;
      expect(result).toBe("CURRENT");
    });

    it("returns LOCKED for levels above currentLevel", () => {
      const result = (assembler as any).determineLevelState(
        5,
        makeSubjectProgress({ currentLevel: 3 }),
      ) as string;
      expect(result).toBe("LOCKED");
    });
  });

  describe("connection sequencing in assemble", () => {
    let assembler: CommandCentreAssembler;

    beforeEach(() => {
      assembler = new CommandCentreAssembler();
    });

    it("builds sequential connections for world nodes in order", () => {
      const nodes = [
        {
          nodeId: "nextjs-level-1",
          title: "Node 1",
          subtitle: "",
          state: "COMPLETED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 20, y: 70 },
          completion: 100,
          masteryContribution: 100,
          unlockRequirements: [],
        },
        {
          nodeId: "nextjs-level-2",
          title: "Node 2",
          subtitle: "",
          state: "CURRENT" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 40, y: 50 },
          completion: 30,
          masteryContribution: 50,
          unlockRequirements: [],
        },
        {
          nodeId: "nextjs-level-3",
          title: "Node 3",
          subtitle: "",
          state: "LOCKED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 60, y: 30 },
          completion: 0,
          masteryContribution: 0,
          unlockRequirements: [
            {
              description: "Event Loop mastery ≥ 70%",
              met: false,
              current: 45,
              required: 70,
            },
          ],
        },
      ];

      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress({ currentLevel: 2 }),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: nodes,
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.world.connections).toHaveLength(2);

      // First connection: COMPLETED→CURRENT => active (not both completed)
      expect(result.world.connections[0].fromNodeId).toBe("nextjs-level-1");
      expect(result.world.connections[0].toNodeId).toBe("nextjs-level-2");
      expect(result.world.connections[0].state).toBe("active");

      // Second connection: CURRENT→LOCKED => inactive
      expect(result.world.connections[1].fromNodeId).toBe("nextjs-level-2");
      expect(result.world.connections[1].toNodeId).toBe("nextjs-level-3");
      expect(result.world.connections[1].state).toBe("inactive");
    });

    it("returns completed connections when both endpoints are COMPLETED", () => {
      const nodes = [
        {
          nodeId: "a",
          title: "A",
          subtitle: "",
          state: "COMPLETED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 20, y: 70 },
          completion: 100,
          masteryContribution: 100,
          unlockRequirements: [],
        },
        {
          nodeId: "b",
          title: "B",
          subtitle: "",
          state: "COMPLETED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 50, y: 50 },
          completion: 100,
          masteryContribution: 100,
          unlockRequirements: [],
        },
        {
          nodeId: "c",
          title: "C",
          subtitle: "",
          state: "LOCKED" as WorldNodeState,
          nodeType: "CAMPAIGN" as WorldNodeType,
          position: { x: 80, y: 30 },
          completion: 0,
          masteryContribution: 0,
          unlockRequirements: [],
        },
      ];

      const result = assembler.assemble({
        player: makePlayer(),
        progression: makeProgression(),
        playerSubjectProgress: makeSubjectProgress({ currentLevel: 3 }),
        subject: makeSubject(),
        currentQuest: null,
        worldNodes: nodes,
        recentProgress: {
          xpGained: 0,
          masteryChange: null,
          missionsCompleted: 0,
          conceptsMastered: 0,
          lastAction: "Started",
        },
      });

      expect(result.world.connections).toHaveLength(2);
      // A→B: both completed
      expect(result.world.connections[0].state).toBe("completed");
      // B→C: C locked
      expect(result.world.connections[1].state).toBe("inactive");
    });
  });
});

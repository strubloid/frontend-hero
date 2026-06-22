import type { Subject, Concept } from "@/modules/subjects/domain/subject";
import type {
  SubjectProgression,
  SubjectLevelDefinition,
} from "@/modules/subjects/domain/subject-level";
import type {
  WorldRegion,
  RegionTask,
  RegionAdjacency,
  PlayerRegionProgress,
} from "../domain/world-region";

/**
 * Domain name → visual mapping for world map regions.
 */
const DOMAIN_REGION_MAP: Record<string, { icon: string; narrative: string }> = {
  "JavaScript Foundations": {
    icon: "⚡",
    narrative:
      "The air crackles with raw energy. Before you lies the foundation of all frontend power — the JavaScript realm.",
  },
  "TypeScript Citadel": {
    icon: "🛡",
    narrative:
      "A fortress of stone and code rises before you. The TypeScript Citadel demands precision and discipline.",
  },
  "React Reactor": {
    icon: "⚛",
    narrative:
      "The reactor hums with component energy. Each hook and render cycle powers the machine.",
  },
  "Rendering Frontier": {
    icon: "🌐",
    narrative:
      "Beyond the React Reactor lies the vast Rendering Frontier — a land of streaming data and suspended boundaries.",
  },
  "Next.js Nexus": {
    icon: "▲",
    narrative:
      "The nexus pulses with server and client threads intertwined. This is the heart of modern frontend engineering.",
  },
  "State Labyrinth": {
    icon: "🌀",
    narrative:
      "Twisting corridors of state ownership and mutation. Only the disciplined navigate these halls.",
  },
  "Network Depths": {
    icon: "🔗",
    narrative:
      "Beneath the surface, data flows through dark network channels. WebSockets and streams weave through the depths.",
  },
  "Testing Grounds": {
    icon: "🧪",
    narrative:
      "A proving ground where every claim is verified. Tests are your shield against regression.",
  },
  "Performance Wastes": {
    icon: "📊",
    narrative: "A barren landscape of bundle bloat and slow renders. Only the optimized survive.",
  },
  "Security Fortress": {
    icon: "🔒",
    narrative:
      "The fortress walls are high. Every gate is guarded by authentication and authorization layers.",
  },
  "Architecture Council": {
    icon: "🏛",
    narrative:
      "In these halls, architectural decisions echo through the ages. Choose wisely, for each trade-off shapes the future.",
  },
  "Production Abyss": {
    icon: "🌋",
    narrative:
      "The abyss stares back. Incidents flare like volcanic fire, and observability is your only light.",
  },
  "Senior Summit": {
    icon: "🏔",
    narrative:
      "Above the clouds, the Senior Summit. Only those who have mastered every realm may ascend.",
  },
};

const DEFAULT_REGION_MAP: { icon: string; narrative: string } = {
  icon: "📘",
  narrative: "A new region awaits. Knowledge and challenges lie within.",
};

/**
 * Builds regions and tasks from a subject's domain and concept data.
 *
 * Each domain becomes a region on the world map. Each region gets 10 tasks
 * drawn from its domain's concepts, distributed across difficulty and level.
 * Adjacent regions are linked with bidirectional adjacency at 80% threshold.
 */
export class RegionFactory {
  private readonly tasksPerRegion = 10;
  private readonly defaultUnlockThreshold = 80;

  /**
   * Create regions from a subject's domain structure.
   */
  createRegions(subject: Subject): WorldRegion[] {
    const now = new Date();
    const { domains } = subject;

    return domains.map((domain, index) => {
      const mapping = DOMAIN_REGION_MAP[domain.name] ?? DEFAULT_REGION_MAP;
      const regionId = this.domainToRegionId(domain.name);

      // Determine if this region has a boss (last region that has concepts)
      const hasBoss =
        index < domains.length - 1 // all but the last region
          ? false
          : true; // last region is the boss region

      // Find the boss encounter
      // For the last region, check if there's a boss defined
      // Actually, let's make every region have a boss for the final level
      // The "last level" of a region is the boss level
      const isLastRegion = index === domains.length - 1;

      return {
        id: regionId,
        subjectId: subject.id,
        name: domain.name,
        description: `Master ${domain.name} concepts to progress through this region.`,
        narrative: mapping.narrative,
        domainName: domain.name,
        icon: mapping.icon,
        order: index + 1,
        totalTasks: this.tasksPerRegion,
        unlockThresholdPercent: this.defaultUnlockThreshold,
        hasBoss: true, // every region has a boss
        bossEncounterId: null, // linked later by boss service
        createdAt: now,
        updatedAt: now,
      };
    });
  }

  /**
   * Create 10 tasks for a region from its domain concepts.
   * Distributes concepts across tasks, pulling from the concept pool.
   */
  createTasks(
    region: WorldRegion,
    concepts: Concept[],
    subjectLevels: SubjectLevelDefinition[],
  ): RegionTask[] {
    const now = new Date();
    const tasks: RegionTask[] = [];

    // Filter concepts belonging to this region's domain
    const domainConcepts = concepts.filter((c) => c.domainName === region.domainName);

    if (domainConcepts.length === 0) {
      // Fallback: create generic tasks
      for (let i = 0; i < this.tasksPerRegion; i++) {
        const level = Math.min(i + 1, 5);
        tasks.push({
          id: `${region.id}-task-${i + 1}`,
          regionId: region.id,
          order: i + 1,
          conceptId: `${region.subjectId}.generic-${i + 1}`,
          title: `${region.name} — Task ${i + 1}`,
          description: `Complete this encounter to progress through ${region.name}.`,
          difficulty: Math.max(1, Math.min(10, level + 1)),
          xpReward: 25 + level * 5,
          required: true,
          subjectLevel: level,
          createdAt: now,
          updatedAt: now,
        });
      }
      return tasks;
    }

    // Distribute concepts evenly across 10 tasks
    for (let i = 0; i < this.tasksPerRegion; i++) {
      const conceptIndex = i % domainConcepts.length;
      const concept = domainConcepts[conceptIndex];

      // Calculate difficulty based on concept difficulty and task index
      const baseDifficulty = concept.difficulty;
      const difficulty = Math.max(
        1,
        Math.min(10, baseDifficulty + Math.floor(i / domainConcepts.length)),
      );

      // Estimate subject level from difficulty
      const estimatedLevel = Math.max(1, Math.min(10, Math.ceil(difficulty / 2)));

      tasks.push({
        id: `${region.id}-task-${i + 1}`,
        regionId: region.id,
        order: i + 1,
        conceptId: concept.id,
        title: taskTitleForConcept(concept, i + 1),
        description: taskDescriptionForConcept(concept, i + 1),
        difficulty,
        xpReward: 25 + difficulty * 5,
        required: true,
        subjectLevel: estimatedLevel,
        createdAt: now,
        updatedAt: now,
      });
    }

    return tasks;
  }

  /**
   * Create adjacency links between sequential regions.
   * Regions form a path: region1 ↔ region2 ↔ region3 ↔ ...
   * Each adjacency requires 80% progress in the source region.
   */
  createAdjacencies(regions: WorldRegion[]): RegionAdjacency[] {
    const adjacencies: RegionAdjacency[] = [];

    for (let i = 0; i < regions.length - 1; i++) {
      const from = regions[i];
      const to = regions[i + 1];

      // Forward adjacency
      adjacencies.push({
        id: `${from.id}→${to.id}`,
        fromRegionId: from.id,
        toRegionId: to.id,
        bidirectional: false,
        requiredProgressPercent: from.unlockThresholdPercent,
      });

      // Backward adjacency (you can always return to previous regions)
      adjacencies.push({
        id: `${to.id}→${from.id}`,
        fromRegionId: to.id,
        toRegionId: from.id,
        bidirectional: false,
        requiredProgressPercent: 0, // no requirement to go back
      });
    }

    return adjacencies;
  }

  /**
   * Create initial player progress for all regions of a subject.
   * First region is unlocked, rest are locked.
   */
  createPlayerProgress(playerId: string, regions: WorldRegion[]): PlayerRegionProgress[] {
    const now = new Date();

    return regions.map((region, index) => {
      const isFirstRegion = index === 0;
      return {
        id: `${playerId}-${region.id}`,
        playerId,
        regionId: region.id,
        completedTaskCount: 0,
        totalTaskCount: region.totalTasks,
        completedTaskIds: [],
        bossDefeated: false,
        unlocked: isFirstRegion,
        completed: false,
        enteredAt: isFirstRegion ? now : null,
        updatedAt: now,
      };
    });
  }

  /**
   * Convert a domain name to a region ID.
   */
  domainToRegionId(domainName: string): string {
    return domainName.toLowerCase().replace(/\s+/g, "-");
  }
}

/**
 * Generate a task title from a concept and task number.
 */
function taskTitleForConcept(concept: Concept, taskNumber: number): string {
  const titles = [
    `Explore ${concept.name}`,
    `Practice ${concept.name}`,
    `Deep Dive: ${concept.name}`,
    `${concept.name} Challenge`,
    `Master ${concept.name}`,
    `${concept.name} — Applied`,
    `${concept.name} — Advanced`,
    `${concept.name} — Expert`,
    `${concept.name} — Interview Prep`,
    `${concept.name} — Final Challenge`,
  ];
  return titles[(taskNumber - 1) % titles.length];
}

/**
 * Generate a task description from a concept and task number.
 */
function taskDescriptionForConcept(concept: Concept, taskNumber: number): string {
  const outcomes = concept.outcomes;
  if (outcomes.length > 0) {
    const outcomeIndex = (taskNumber - 1) % outcomes.length;
    return `Demonstrate: ${outcomes[outcomeIndex]}`;
  }
  return `Complete encounters related to ${concept.name} to build mastery.`;
}

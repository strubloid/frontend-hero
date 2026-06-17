import {
  MissionChain,
  MissionChainStep,
  PlayerMissionChainProgress,
} from "../domain/mission-chain";
import { MissionChainRepository } from "../domain/mission-chain-repository";

const CHAIN_DEFINITIONS: MissionChain[] = [
  {
    id: "chain-javascript-foundations",
    subjectId: "nextjs",
    name: "JavaScript Foundations",
    description: "Master the core mechanisms that power every framework",
    narrativePrologue:
      "Every realm has a foundation — the unseen laws that shape reality itself. In the Frontend Realms, that foundation is JavaScript. Before you can wield the great frameworks, you must understand the engine that drives them.",
    narrativeEpilogue:
      "You have walked the invisible paths of JavaScript's inner workings. The event loop, promises, and closures are now your allies. The deeper realms of React and Next.js await.",
    steps: createSteps("chain-javascript-foundations", [
      {
        concepts: ["javascript.event-loop"],
        missions: 2,
        beat: "The cycle of time — the event loop revealed",
      },
      {
        concepts: ["javascript.call-stack", "javascript.promises"],
        missions: 2,
        beat: "The microtask frontier",
      },
      { concepts: ["javascript.closures"], missions: 2, beat: "The sealed scrolls of closure" },
      { concepts: ["javascript.async-await"], missions: 2, beat: "The async incantations" },
    ]),
    regionId: "javascript",
    requiredLevel: 1,
    rewardTitle: "JS Apprentice",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
  },
  {
    id: "chain-react-essentials",
    subjectId: "nextjs",
    name: "React Essentials",
    description: "Build interactive UIs with confidence — components, state, and data flow",
    narrativePrologue:
      "With the foundations secure, you stand at the gates of the Interactive Realms. Here, components are citizens, state is currency, and the flow of data is the lifeline of every application. Enter the world of React.",
    narrativeEpilogue:
      "Components, state, effects — you have mastered the triad of React development. The path to the full framework lies ahead.",
    steps: createSteps("chain-react-essentials", [
      { concepts: ["react.components", "react.jsx"], missions: 2, beat: "The component forge" },
      { concepts: ["react.state", "react.useState"], missions: 2, beat: "The state ritual" },
      {
        concepts: ["react.effects", "react.useEffect"],
        missions: 2,
        beat: "The side-effect covenant",
      },
      { concepts: ["react.props", "react.data-flow"], missions: 2, beat: "The data rivers" },
    ]),
    regionId: "react",
    requiredLevel: 2,
    rewardTitle: "React Squire",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
  },
  {
    id: "chain-routing-deep",
    subjectId: "nextjs",
    name: "Routing Mastery",
    description: "Navigate the App Router — from layouts to data fetching",
    narrativePrologue:
      "Beyond the component realm lies the Router's Domain. Here, every URL is a portal, every layout a chamber, and every data-fetching strategy a key. Tread carefully — the paths are many, but the way is singular.",
    narrativeEpilogue:
      "The App Router bends to your will. Pages, layouts, parallel routes — all are yours to command. The server components await.",
    steps: createSteps("chain-routing-deep", [
      {
        concepts: ["nextjs.app-router", "nextjs.file-conventions"],
        missions: 2,
        beat: "The file-convention sigils",
      },
      {
        concepts: ["nextjs.layouts", "nextjs.templates"],
        missions: 2,
        beat: "The layout architecture",
      },
      {
        concepts: ["nextjs.loading-ui", "nextjs.error-handling"],
        missions: 2,
        beat: "The loading and error wards",
      },
      {
        concepts: ["nextjs.parallel-routes", "nextjs.intercepting-routes"],
        missions: 2,
        beat: "The parallel paths",
      },
    ]),
    regionId: "nextjs",
    requiredLevel: 3,
    rewardTitle: "Router Knight",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
  },
  {
    id: "chain-server-components",
    subjectId: "nextjs",
    name: "Server Components & Data",
    description: "Embrace the server — React Server Components, streaming, and caching",
    narrativePrologue:
      "A new frontier stretches before you — the Server Realm. Here, components render before they reach the browser, streams carry data like rivers, and caching preserves ancient knowledge. The architecture of the future awaits.",
    narrativeEpilogue:
      "Server Components flow through your veins. You understand when to render on the server, when to hydrate on the client, and how to cache for performance.",
    steps: createSteps("chain-server-components", [
      {
        concepts: ["nextjs.server-components", "nextjs.client-components"],
        missions: 2,
        beat: "The server-client divide",
      },
      {
        concepts: ["nextjs.data-fetching", "nextjs.caching"],
        missions: 2,
        beat: "The data sanctum",
      },
      {
        concepts: ["nextjs.streaming", "nextjs.suspense"],
        missions: 2,
        beat: "The streaming currents",
      },
      {
        concepts: ["nextjs.server-actions", "nextjs.mutations"],
        missions: 2,
        beat: "The action rituals",
      },
    ]),
    regionId: "nextjs",
    requiredLevel: 4,
    rewardTitle: "Server Sage",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
  },
  {
    id: "chain-performance-secrets",
    subjectId: "nextjs",
    name: "Performance Secrets",
    description: "Optimize, lazy-load, and measure — become a performance wizard",
    narrativePrologue:
      "Power comes with responsibility. The Performance Forge is where sluggish apps are reforged into blazing-fast experiences. Are you ready to wield the profiler and the bundle analyzer?",
    narrativeEpilogue:
      "Your apps are now lean and fast. Images lazy-load, bundles are split, and every byte earns its place. The Realms run smoothly under your watch.",
    steps: createSteps("chain-performance-secrets", [
      {
        concepts: ["nextjs.image-optimization", "nextjs.fonts"],
        missions: 2,
        beat: "The image and font shrines",
      },
      {
        concepts: ["nextjs.lazy-loading", "nextjs.dynamic-imports"],
        missions: 2,
        beat: "The lazy-load grove",
      },
      { concepts: ["nextjs.metadata", "nextjs.seo"], missions: 2, beat: "The metadata council" },
      {
        concepts: ["nextjs.analytics", "nextjs.monitoring"],
        missions: 2,
        beat: "The measurement tower",
      },
    ]),
    regionId: "performance",
    requiredLevel: 5,
    rewardTitle: "Performance Wizard",
    createdAt: new Date("2026-06-01"),
    updatedAt: new Date("2026-06-01"),
  },
];

function createSteps(
  chainId: string,
  entries: { concepts: string[]; missions: number; beat: string | null }[],
): MissionChainStep[] {
  return entries.map((entry, i) => ({
    id: `${chainId}-step-${i + 1}`,
    chainId,
    order: i + 1,
    missionType: "encounter",
    conceptIds: entry.concepts,
    minDifficulty: 1 + i,
    maxDifficulty: 3 + i,
    objective: entry.beat ?? `Complete ${entry.missions} missions`,
    narrativeBeat: entry.beat,
    requiredCount: entry.missions,
  }));
}

export class InMemoryMissionChainRepository implements MissionChainRepository {
  private chains: Map<string, MissionChain>;
  private progress: Map<string, PlayerMissionChainProgress[]>;

  constructor() {
    this.chains = new Map();
    this.progress = new Map();
    for (const chain of CHAIN_DEFINITIONS) {
      this.chains.set(chain.id, chain);
    }
  }

  async getById(id: string): Promise<MissionChain | null> {
    return this.chains.get(id) ?? null;
  }

  async getAll(): Promise<MissionChain[]> {
    return Array.from(this.chains.values());
  }

  async getBySubject(subjectId: string): Promise<MissionChain[]> {
    return Array.from(this.chains.values()).filter((c) => c.subjectId === subjectId);
  }

  async saveChain(chain: MissionChain): Promise<MissionChain> {
    this.chains.set(chain.id, chain);
    return chain;
  }

  async getPlayerProgress(
    playerId: string,
    chainId: string,
  ): Promise<PlayerMissionChainProgress | null> {
    const list = this.progress.get(playerId) ?? [];
    return list.find((p) => p.chainId === chainId) ?? null;
  }

  async getAllPlayerProgress(playerId: string): Promise<PlayerMissionChainProgress[]> {
    return this.progress.get(playerId) ?? [];
  }

  async saveProgress(progress: PlayerMissionChainProgress): Promise<PlayerMissionChainProgress> {
    const list = this.progress.get(progress.playerId) ?? [];
    const idx = list.findIndex((p) => p.id === progress.id);
    if (idx >= 0) {
      list[idx] = progress;
    } else {
      list.push(progress);
    }
    this.progress.set(progress.playerId, list);
    return progress;
  }
}

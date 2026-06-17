"use server";

import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { InMemorySubjectRepository } from "@/modules/subjects/infrastructure/in-memory-subject-repository";
import { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { InMemoryMasteryRepository } from "@/modules/mastery/infrastructure/in-memory-mastery-repository";
import { WorldMapService } from "@/modules/game-world/domain/world-map-service";
import { Region } from "@/modules/game-world/domain/region";
import { WorldMapProgress } from "@/modules/game-world/domain/world-map";

// ---------------------------------------------------------------------------
// Domain → Region mapping for the Frontend Realms
// Each subject domain maps to a world region with narrative flavor.
// ---------------------------------------------------------------------------

const DOMAIN_REGION_MAP: Record<string, { icon: string; flavor: string }> = {
  "JavaScript Foundations": {
    icon: "⚡",
    flavor:
      "The air crackles with raw energy. Before you lies the foundation of all frontend power — the JavaScript realm.",
  },
  "TypeScript Citadel": {
    icon: "🛡",
    flavor:
      "A fortress of stone and code rises before you. The TypeScript Citadel demands precision and discipline.",
  },
  "React Reactor": {
    icon: "⚛",
    flavor:
      "The reactor hums with component energy. Each hook and render cycle powers the machine.",
  },
  "Rendering Frontier": {
    icon: "🌐",
    flavor:
      "Beyond the React Reactor lies the vast Rendering Frontier — a land of streaming data and suspended boundaries.",
  },
  "Next.js Nexus": {
    icon: "▲",
    flavor:
      "The nexus pulses with server and client threads intertwined. This is the heart of modern frontend engineering.",
  },
  "State Labyrinth": {
    icon: "🌀",
    flavor:
      "Twisting corridors of state ownership and mutation. Only the disciplined navigate these halls.",
  },
  "Network Depths": {
    icon: "🔗",
    flavor:
      "Beneath the surface, data flows through dark network channels. WebSockets and streams weave through the depths.",
  },
  "Testing Grounds": {
    icon: "🧪",
    flavor:
      "A proving ground where every claim is verified. Tests are your shield against regression.",
  },
  "Performance Wastes": {
    icon: "📊",
    flavor: "A barren landscape of bundle bloat and slow renders. Only the optimized survive.",
  },
  "Security Fortress": {
    icon: "🔒",
    flavor:
      "The fortress walls are high. Every gate is guarded by authentication and authorization layers.",
  },
  "Architecture Council": {
    icon: "🏛",
    flavor:
      "In these halls, architectural decisions echo through the ages. Choose wisely, for each trade-off shapes the future.",
  },
  "Production Abyss": {
    icon: "🌋",
    flavor:
      "The abyss stares back. Incidents flare like volcanic fire, and observability is your only light.",
  },
  "Senior Summit": {
    icon: "🏔",
    flavor:
      "Above the clouds, the Senior Summit. Only those who have mastered every realm may ascend.",
  },
};

// ---------------------------------------------------------------------------
// Singleton instances
// ---------------------------------------------------------------------------

const subjectRepository = new InMemorySubjectRepository();
const masteryRepository = new InMemoryMasteryRepository();
const worldMapService = new WorldMapService();

async function ensureSubjectLoaded(): Promise<void> {
  const existing = await subjectRepository.getById("nextjs");
  if (existing) return;

  const { SubjectImportService } =
    await import("@/modules/subjects/application/subject-import-service");
  const { SubjectFileReader } = await import("@/modules/subjects/application/subject-file-reader");
  const { SubjectFrontmatterParser } =
    await import("@/modules/subjects/application/subject-frontmatter-parser");
  const { SubjectSectionParser } =
    await import("@/modules/subjects/application/subject-section-parser");
  const { ConceptParser } = await import("@/modules/subjects/application/concept-parser");
  const { PrerequisiteGraphBuilder } =
    await import("@/modules/subjects/application/prerequisite-graph-builder");
  const { SubjectSchemaValidator } =
    await import("@/modules/subjects/application/subject-schema-validator");

  const subjectImportService = new SubjectImportService(
    new SubjectFileReader("subjects"),
    new SubjectFrontmatterParser(),
    new SubjectSectionParser(),
    new ConceptParser(),
    new SubjectSchemaValidator(),
    new PrerequisiteGraphBuilder(),
  );

  const result = await subjectImportService.import("nextjs");
  subjectRepository.set(result.subject);
}

// ---------------------------------------------------------------------------
// Exported server actions
// ---------------------------------------------------------------------------

export interface RegionDisplay {
  id: string;
  name: string;
  icon: string;
  description: string;
  flavor: string;
  status: "locked" | "available" | "in-progress" | "completed";
  progress: number;
  conceptCount: number;
  order: number;
  bossConceptId: string | null;
}

export interface WorldMapData {
  regions: RegionDisplay[];
  progress: {
    totalRegions: number;
    unlockedRegions: number;
    completedRegions: number;
    currentRegionId: string | null;
    nextRegionId: string | null;
  };
}

export async function getWorldMap(
  playerId: string,
  subjectId: string = "nextjs",
): Promise<WorldMapData> {
  await ensureSubjectLoaded();

  const subject = await subjectRepository.getById(subjectId);
  if (!subject) {
    throw new Error(`Subject not found: ${subjectId}`);
  }

  const masteries = await masteryRepository.getByPlayerAndSubject(playerId, subjectId);

  // Build conceptId → mastery score map for unlock checking
  const masteryMap = new Map(masteries.map((m) => [m.conceptId, m]));

  // Build regions from subject domains
  const allConcepts = subject.domains.flatMap((d) => d.concepts);

  const regions: Region[] = subject.domains.map((domain) => {
    const domainConcepts = allConcepts.filter((c) => c.domainName === domain.name);
    const mapping = DOMAIN_REGION_MAP[domain.name] ?? { icon: "📘", flavor: "A region awaits." };

    return {
      id: domain.name.toLowerCase().replace(/\s+/g, "-"),
      name: domain.name,
      description: domainConcepts.map((c) => c.name).join(", "),
      unlockFlavor: mapping.flavor,
      order: subject.domains.indexOf(domain) + 1,
      requiredConceptIds: domainConcepts.map((c) => c.id),
      requiredMastery: 0.4,
      bossConceptId: domainConcepts[domainConcepts.length - 1]?.id ?? null,
      bossDefeated: false,
      unlocked: false,
      subjectId,
    };
  });

  // Evaluate unlocks
  const updatedRegions = worldMapService.checkUnlocks(regions, masteryMap);

  // Determine boss-defeated status and progress per region
  const regionDisplays: RegionDisplay[] = updatedRegions.map((region) => {
    const domain = subject.domains.find(
      (d) => d.name.toLowerCase().replace(/\s+/g, "-") === region.id,
    );
    const domainConcepts = domain ? allConcepts.filter((c) => c.domainName === domain.name) : [];

    // Calculate progress: % of concepts with mastery >= 0.4
    let progress = 0;
    if (domainConcepts.length > 0) {
      const masteredCount = domainConcepts.filter(
        (c) => (masteryMap.get(c.id)?.masteryScore ?? 0) >= 0.4,
      ).length;
      progress = Math.round((masteredCount / domainConcepts.length) * 100);
    }

    let status: "locked" | "available" | "in-progress" | "completed";
    if (!region.unlocked) {
      status = "locked";
    } else if (region.bossDefeated || progress >= 100) {
      status = "completed";
    } else if (progress > 0) {
      status = "in-progress";
    } else {
      status = "available";
    }

    const mapping = DOMAIN_REGION_MAP[domain?.name ?? ""] ?? { icon: "📘" };

    return {
      id: region.id,
      name: region.name,
      icon: mapping.icon,
      description:
        domainConcepts.length > 0
          ? `${domainConcepts.length} concept${domainConcepts.length !== 1 ? "s" : ""} to master`
          : "No concepts defined",
      flavor: region.unlockFlavor,
      status,
      progress,
      conceptCount: domainConcepts.length,
      order: region.order,
      bossConceptId: region.bossConceptId,
    };
  });

  const rawProgress = worldMapService.getProgress(updatedRegions);

  return {
    regions: regionDisplays,
    progress: {
      totalRegions: rawProgress.totalRegions,
      unlockedRegions: rawProgress.unlockedRegions,
      completedRegions: rawProgress.completedRegions,
      currentRegionId: rawProgress.currentRegion,
      nextRegionId: rawProgress.nextRegion,
    },
  };
}

export async function getWorldMapProgress(
  playerId: string,
  subjectId: string = "nextjs",
): Promise<WorldMapProgress | null> {
  const data = await getWorldMap(playerId, subjectId);
  return data.progress;
}

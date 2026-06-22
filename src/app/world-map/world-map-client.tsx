"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PixelWorldMap from "@/modules/game-world/presentation/components/pixel-world-map/pixel-world-map";
import type { WorldMapDisplay } from "@/modules/game-world/application/world-map-application-service";

interface WorldMapClientProps {
  worldMap: WorldMapDisplay;
  playerLevel: number;
  playerXp: number;
  playerXpToNext: number;
}

export default function WorldMapClient({
  worldMap,
  playerLevel,
  playerXp,
  playerXpToNext,
}: WorldMapClientProps) {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const router = useRouter();

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegionId(regionId === selectedRegionId ? null : regionId);
  };

  const handleEnterRegion = (regionId: string) => {
    // Navigate to play page with the subject context from this world map
    const subjectId = worldMap?.progress?.totalRegions > 0 ? "nextjs" : "nextjs";
    router.push(
      `/play?subject=${encodeURIComponent(subjectId)}&region=${encodeURIComponent(regionId)}`,
    );
  };

  return (
    <PixelWorldMap
      worldMap={worldMap}
      playerLevel={playerLevel}
      playerXp={playerXp}
      playerXpToNext={playerXpToNext}
      onRegionSelect={handleRegionSelect}
      selectedRegionId={selectedRegionId}
      onEnterRegion={handleEnterRegion}
    />
  );
}

"use server";

import { getDefaultPlayerId } from "@/app/actions/missions";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import type { Player } from "@/modules/players/domain/player";

export interface PlayerApiDto {
  readonly id: string;
  readonly name: string;
  readonly email: string | null;
  readonly level: number;
  readonly experiencePoints: number;
  readonly masteryPoints: number;
  readonly currentSubjectId: string | null;
  readonly currentRegionId: string | null;
  readonly lastActiveAt: string | null;
  readonly lastReturnBonusClaimedAt: string | null;
  readonly selectedTitle: string | null;
  readonly selectedTheme: string | null;
  readonly workshopTier: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

function serializePlayer(player: Player): PlayerApiDto {
  return {
    id: player.id,
    name: player.name,
    email: player.email,
    level: player.level,
    experiencePoints: player.experiencePoints,
    masteryPoints: player.masteryPoints,
    currentSubjectId: player.currentSubjectId,
    currentRegionId: player.currentRegionId,
    lastActiveAt: player.lastActiveAt?.toISOString() ?? null,
    lastReturnBonusClaimedAt: player.lastReturnBonusClaimedAt?.toISOString() ?? null,
    selectedTitle: player.selectedTitle,
    selectedTheme: player.selectedTheme,
    workshopTier: player.workshopTier,
    createdAt: player.createdAt.toISOString(),
    updatedAt: player.updatedAt.toISOString(),
  };
}

export async function getPlayerForApi(playerId: string): Promise<PlayerApiDto | null> {
  if (playerId === "default-player") {
    await getDefaultPlayerId();
  }

  const playerRepository = new DrizzlePlayerRepository(getSqliteConnection());
  const player = await playerRepository.getById(playerId);

  return player ? serializePlayer(player) : null;
}

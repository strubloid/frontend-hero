import { BossEncounter, PlayerBossProgress, BossPhaseAttempt } from "../domain/boss-encounter";

export interface BossEncounterRepository {
  getById(id: string): Promise<BossEncounter | null>;
  getByRegion(regionId: string): Promise<BossEncounter | null>;
  getAll(): Promise<BossEncounter[]>;
  save(encounter: BossEncounter): Promise<void>;
}

export interface BossProgressRepository {
  getByPlayerAndBoss(playerId: string, bossId: string): Promise<PlayerBossProgress | null>;
  save(progress: PlayerBossProgress): Promise<void>;
}

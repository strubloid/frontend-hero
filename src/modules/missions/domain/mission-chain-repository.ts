import { MissionChain, PlayerMissionChainProgress } from "../domain/mission-chain";

export interface MissionChainRepository {
  getById(id: string): Promise<MissionChain | null>;
  getAll(): Promise<MissionChain[]>;
  getBySubject(subjectId: string): Promise<MissionChain[]>;
  saveChain(chain: MissionChain): Promise<MissionChain>;
  getPlayerProgress(playerId: string, chainId: string): Promise<PlayerMissionChainProgress | null>;
  getAllPlayerProgress(playerId: string): Promise<PlayerMissionChainProgress[]>;
  saveProgress(progress: PlayerMissionChainProgress): Promise<PlayerMissionChainProgress>;
}

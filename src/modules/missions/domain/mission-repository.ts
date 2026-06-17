import { Mission, MissionAttempt } from "./mission";

export interface MissionRepository {
  getById(id: string): Promise<Mission | null>;
  create(mission: Mission): Promise<Mission>;
  save(mission: Mission): Promise<Mission>;
  getActiveByPlayer(playerId: string): Promise<Mission | null>;
}

export interface MissionAttemptRepository {
  create(attempt: MissionAttempt): Promise<MissionAttempt>;
  getByMission(missionId: string): Promise<MissionAttempt[]>;
}

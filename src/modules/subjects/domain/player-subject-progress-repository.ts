import type { PlayerSubjectProgressEntity } from "./player-subject-progress";

export interface PlayerSubjectProgressRepository {
  findByPlayerAndSubject(
    playerId: string,
    subjectId: string,
  ): Promise<PlayerSubjectProgressEntity | null>;
  findByPlayerId(playerId: string): Promise<PlayerSubjectProgressEntity[]>;
  save(progress: PlayerSubjectProgressEntity): Promise<PlayerSubjectProgressEntity>;
}

import type { PlayerRepository } from "@/modules/players/domain/player-repository";
import type { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import type { PlayerSubjectProgressRepository } from "@/modules/subjects/domain/player-subject-progress-repository";
import { createPlayerSubjectProgress } from "@/modules/subjects/domain/player-subject-progress";
import type { SelectSubjectRequest } from "./select-subject.request";
import { SelectSubjectResult } from "./select-subject.result";

/**
 * Allows a player to select (and start) a subject campaign.
 *
 * Creates a PlayerSubjectProgress record for the new subject,
 * then updates the player's currentSubjectId so the Command Centre
 * picks up the new campaign.
 */
export class SelectSubjectUseCase {
  constructor(
    private readonly playerRepo: PlayerRepository,
    private readonly subjectRepo: SubjectRepository,
    private readonly subjectProgressRepo: PlayerSubjectProgressRepository,
  ) {}

  async execute(request: SelectSubjectRequest): Promise<SelectSubjectResult> {
    const player = await this.playerRepo.getById(request.playerId);
    if (!player) {
      return new SelectSubjectResult(false, "Player not found", null);
    }

    const subject = await this.subjectRepo.getById(request.subjectId);
    if (!subject) {
      return new SelectSubjectResult(false, "Subject not found", null);
    }

    // Check if already have progress for this subject
    const existing = await this.subjectProgressRepo.findByPlayerAndSubject(
      request.playerId,
      request.subjectId,
    );
    if (existing) {
      // Already started — just update player's currentSubjectId
      player.currentSubjectId = request.subjectId;
      player.updatedAt = new Date();
      await this.playerRepo.save(player);
      return new SelectSubjectResult(true, null, existing.id);
    }

    // Create fresh progress record
    const progress = createPlayerSubjectProgress(request.playerId, subject);
    const saved = await this.subjectProgressRepo.save(progress);

    // Update player's active subject
    player.currentSubjectId = request.subjectId;
    player.updatedAt = new Date();
    await this.playerRepo.save(player);

    return new SelectSubjectResult(true, null, saved.id);
  }
}

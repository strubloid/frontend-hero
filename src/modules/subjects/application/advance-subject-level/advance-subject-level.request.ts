import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";

export interface AdvanceSubjectLevelRequest {
  readonly playerId: string;
  readonly subjectId: string;
}

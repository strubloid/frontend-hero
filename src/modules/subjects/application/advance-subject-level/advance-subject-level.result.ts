import type { PlayerSubjectProgress } from "@/modules/subjects/domain/subject-level";

export class AdvanceSubjectLevelResult {
  constructor(
    public readonly success: boolean,
    public readonly error: string | null,
    public readonly advanced: boolean,
    public readonly newLevel: number | null,
    public readonly requirements: ReadonlyArray<{
      readonly name: string;
      readonly met: boolean;
      readonly current: number;
      readonly required: number;
    }>,
    public readonly progress: PlayerSubjectProgress | null,
  ) {}
}

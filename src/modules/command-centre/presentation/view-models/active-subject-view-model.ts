/**
 * Active subject being studied, shown in the HUD.
 * null when no subject is selected.
 */
export interface ActiveSubjectViewModel {
  readonly subjectId: string;
  readonly subjectTitle: string;
  readonly currentLevel: number;
  readonly maximumLevel: number;
  readonly masteryScore: number; // 0-100
  readonly levelTitle: string;
}

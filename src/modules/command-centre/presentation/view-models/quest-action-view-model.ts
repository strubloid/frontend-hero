/**
 * Primary or secondary action button attached to a quest.
 */
export interface QuestActionViewModel {
  readonly label: string;
  readonly destination: string;
  readonly disabled: boolean;
  readonly disabledReason: string | null;
  readonly primary: boolean;
}

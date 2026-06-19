/**
 * A contextual action suggested to the player.
 */
export interface RecommendedActionViewModel {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly primary: boolean;
  readonly destination: string;
  readonly icon: string;
}

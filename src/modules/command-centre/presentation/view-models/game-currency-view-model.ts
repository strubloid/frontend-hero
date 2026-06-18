/**
 * A currency or resource shown in the HUD (knowledge shards, gems, etc.).
 */
export interface GameCurrencyViewModel {
  readonly id: string;
  readonly label: string;
  readonly amount: number;
  readonly icon: string; // emoji or icon identifier
  readonly tooltip: string;
}

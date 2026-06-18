import type { PlayerIdentityViewModel } from "./player-identity-view-model";
import type { PlayerLevelViewModel } from "./player-level-view-model";
import type { ActiveSubjectViewModel } from "./active-subject-view-model";
import type { GameCurrencyViewModel } from "./game-currency-view-model";
import type { HudNotificationViewModel } from "./hud-notification-view-model";

/**
 * The persistent HUD bar at the top of the command centre.
 */
export interface GameHudViewModel {
  readonly player: PlayerIdentityViewModel;
  readonly level: PlayerLevelViewModel;
  readonly activeSubject: ActiveSubjectViewModel | null;
  readonly currencies: GameCurrencyViewModel[];
  readonly notifications: HudNotificationViewModel[];
}

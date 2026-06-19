import type { GameHudViewModel } from "./game-hud-view-model";
import type { CurrentQuestViewModel } from "./current-quest-view-model";
import type { CampaignRailViewModel } from "./campaign-rail-view-model";
import type { WorldMapViewModel } from "./world-map-view-model";
import type { RecentProgressViewModel } from "./recent-progress-view-model";
import type { RecommendedActionViewModel } from "./recommended-action-view-model";
import type { CommandCentrePlayerState } from "./command-centre-player-state";

/**
 * Top-level view model for the entire Command Centre page.
 */
export interface CommandCentreViewModel {
  readonly hud: GameHudViewModel;
  readonly currentQuest: CurrentQuestViewModel | null;
  readonly campaign: CampaignRailViewModel;
  readonly world: WorldMapViewModel;
  readonly recentProgress: RecentProgressViewModel;
  readonly recommendedActions: RecommendedActionViewModel[];
  readonly playerState: CommandCentrePlayerState;
}

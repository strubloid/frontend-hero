/**
 * Type of notification displayed in the HUD.
 */
export type HudNotificationType =
  | "review_due"
  | "reward_unclaimed"
  | "region_unlocked"
  | "daily_available"
  | "generation_complete";

/**
 * A single notification bell entry in the HUD.
 */
export interface HudNotificationViewModel {
  readonly type: HudNotificationType;
  readonly label: string;
  readonly priority: "low" | "normal" | "high";
  readonly destination: string; // route
}

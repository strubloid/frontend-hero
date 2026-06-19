/**
 * Identity block shown in the HUD — avatar, display name, player title.
 */
export interface PlayerIdentityViewModel {
  readonly displayName: string;
  readonly avatarUrl: string | null;
  readonly title: string;
  readonly level: number;
}

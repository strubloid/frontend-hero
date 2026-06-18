/**
 * Possible states the command centre can present to the player.
 */
export const enum CommandCentrePlayerState {
  NEW_PLAYER = "NEW_PLAYER",
  ACTIVE_QUEST = "ACTIVE_QUEST",
  REVIEWS_OVERDUE = "REVIEWS_OVERDUE",
  QUEST_COMPLETED = "QUEST_COMPLETED",
  BOSS_AVAILABLE = "BOSS_AVAILABLE",
  SUBJECT_COMPLETED = "SUBJECT_COMPLETED",
}

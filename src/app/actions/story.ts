"use server";

import { getPlayerProfile } from "@/app/actions/profile";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryEventData {
  type: "level-up" | "boss-defeat" | "region-unlock" | "achievement" | "streak-milestone";
  label: string;
  timestamp: string;
}

export interface StoryEventsResult {
  events: StoryEventData[];
}

// ---------------------------------------------------------------------------
// Server action
// ---------------------------------------------------------------------------

export async function getRecentStoryEvents(playerId: string): Promise<StoryEventsResult> {
  const profile = await getPlayerProfile(playerId);
  const events: StoryEventData[] = [];

  for (const activity of profile.recentActivity) {
    if (activity.type === "level-up") {
      events.push({
        type: "level-up",
        label: activity.label,
        timestamp: activity.timestamp,
      });
    }
  }

  // Newly-earned achievements (isNew flag)
  const newAchievements = profile.achievements.filter((a) => a.isNew);
  for (const ach of newAchievements) {
    events.push({
      type: "achievement",
      label: `Unlocked: ${ach.name} — ${ach.description}`,
      timestamp: ach.earnedAt ?? new Date().toISOString(),
    });
  }

  // Sort newest first, take top 5
  events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return { events: events.slice(0, 5) };
}

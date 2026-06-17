"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StoryEvent {
  type: "level-up" | "boss-defeat" | "region-unlock" | "achievement" | "streak-milestone";
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface StoryBannerProps {
  events: StoryEvent[];
  onDismiss?: (index: number) => void;
  autoDismissMs?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StoryBanner({ events, onDismiss, autoDismissMs = 6000 }: StoryBannerProps) {
  const [visible, setVisible] = useState<Set<number>>(new Set());
  const [exiting, setExiting] = useState<Set<number>>(new Set());

  // Show events when they arrive, with staggered delay
  useEffect(() => {
    if (events.length === 0) return;
    const idx = events.length - 1;
    const t = setTimeout(() => setVisible((prev) => new Set(prev).add(idx)), 100);
    return () => clearTimeout(t);
  }, [events.length]);

  // Auto-dismiss
  useEffect(() => {
    if (events.length === 0 || !autoDismissMs) return;
    const t = setTimeout(() => {
      for (let i = 0; i < events.length; i++) {
        setExiting((prev) => new Set(prev).add(i));
      }
    }, autoDismissMs);
    return () => clearTimeout(t);
  }, [events.length, autoDismissMs]);

  const dismiss = useCallback(
    (idx: number) => {
      setExiting((prev) => new Set(prev).add(idx));
      setTimeout(() => {
        setVisible((prev) => {
          const next = new Set(prev);
          next.delete(idx);
          return next;
        });
        onDismiss?.(idx);
      }, 400);
    },
    [onDismiss],
  );

  if (events.length === 0) return null;

  return (
    <div className="story-banner-container">
      {events.map((event, idx) => {
        if (!visible.has(idx) && !exiting.has(idx)) return null;
        return (
          <div
            key={idx}
            className={`story-banner ${exiting.has(idx) ? "exiting" : "entering"}`}
            style={{ borderLeftColor: event.color }}
          >
            <button className="story-banner-close" onClick={() => dismiss(idx)}>
              ✕
            </button>
            <div className="story-banner-icon">{event.icon}</div>
            <div className="story-banner-content">
              <h3 className="story-banner-title" style={{ color: event.color }}>
                {event.title}
              </h3>
              <p className="story-banner-desc">{event.description}</p>
            </div>
          </div>
        );
      })}

      <style>{storyBannerStyles}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Fun factory: build story events from profile data
// ---------------------------------------------------------------------------

export function buildStoryEvents(
  recentActivity: Array<{
    type: string;
    label: string;
    timestamp: string;
  }>,
  isNewAchievement: boolean,
): StoryEvent[] {
  const events: StoryEvent[] = [];

  // Level-up events
  for (const activity of recentActivity) {
    if (activity.type === "level-up") {
      events.push({
        type: "level-up",
        title: "Level Up!",
        description: activity.label,
        icon: "⭐",
        color: "#f59e0b",
      });
    }
  }

  // New achievement unlocked (from profile)
  if (isNewAchievement) {
    events.push({
      type: "achievement",
      title: "Achievement Unlocked!",
      description: "You earned a new achievement.",
      icon: "🏆",
      color: "#22c55e",
    });
  }

  // Take only the first 3 to avoid overwhelming
  return events.slice(0, 3);
}

// ---------------------------------------------------------------------------
// Story progression check: returns events the player hasn't seen yet
// ---------------------------------------------------------------------------

import { getRecentStoryEvents } from "@/app/actions/story";

export function StoryProgression({ playerId }: { playerId: string }) {
  const [events, setEvents] = useState<StoryEvent[]>([]);
  const [dismissed, setDismissed] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function check() {
      try {
        const data = await getRecentStoryEvents(playerId);
        const storyEvents: StoryEvent[] = [];

        for (const event of data.events) {
          if (event.type === "level-up") {
            storyEvents.push({
              type: "level-up",
              title: "Level Up!",
              description: event.label,
              icon: "⭐",
              color: "#f59e0b",
            });
          }
        }

        setEvents(storyEvents);
      } catch {
        // silent
      }
    }
    check();
  }, [playerId]);

  const filtered = events.filter((_, idx) => !dismissed.has(idx));
  if (filtered.length === 0) return null;

  return (
    <StoryBanner
      events={filtered}
      onDismiss={(idx) => setDismissed((prev) => new Set(prev).add(idx))}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const storyBannerStyles = `
  .story-banner-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 200;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    pointer-events: none;
  }
  .story-banner {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 0.75rem 1rem 0.75rem 1rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-left: 4px solid #f59e0b;
    border-radius: 10px;
    max-width: 380px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
    pointer-events: auto;
    position: relative;
  }
  .story-banner.entering {
    animation: bannerIn 0.4s ease-out both;
  }
  .story-banner.exiting {
    animation: bannerOut 0.4s ease-in both;
  }
  @keyframes bannerIn {
    0%   { opacity: 0; transform: translateX(40px) scale(0.95); }
    100% { opacity: 1; transform: translateX(0) scale(1); }
  }
  @keyframes bannerOut {
    0%   { opacity: 1; transform: translateX(0) scale(1); }
    100% { opacity: 0; transform: translateX(40px) scale(0.95); }
  }
  .story-banner-close {
    position: absolute;
    top: 4px;
    right: 4px;
    background: none;
    border: none;
    color: #64748b;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 2px 4px;
    line-height: 1;
  }
  .story-banner-close:hover {
    color: #e2e8f0;
  }
  .story-banner-icon {
    font-size: 1.6rem;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .story-banner-content {
    flex: 1;
    min-width: 0;
  }
  .story-banner-title {
    margin: 0 0 0.15rem;
    font-size: 0.9rem;
    font-weight: 700;
  }
  .story-banner-desc {
    margin: 0;
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.4;
  }

  @media (max-width: 600px) {
    .story-banner-container {
      top: 0.5rem;
      right: 0.5rem;
      left: 0.5rem;
    }
    .story-banner {
      max-width: 100%;
    }
  }
`;

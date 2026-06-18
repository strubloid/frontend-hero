"use client";

import type { CampaignRailViewModel } from "@/modules/command-centre/presentation/view-models/campaign-rail-view-model";
import styles from "./campaign-rail.module.scss";

interface CampaignRailProps {
  campaign: CampaignRailViewModel;
  selectedLevel: number | null;
  onSelectLevel: (level: number) => void;
}

function getStateIndicator(state: string): { icon: string; className: string } {
  switch (state) {
    case "COMPLETED":
    case "MASTERED":
      return { icon: "✓", className: "stateCompleted" };
    case "CURRENT":
      return { icon: "◉", className: "stateCurrent" };
    case "AVAILABLE":
      return { icon: "○", className: "stateAvailable" };
    case "LOCKED":
      return { icon: "🔒", className: "stateLocked" };
    case "REVIEW_REQUIRED":
      return { icon: "⚠", className: "stateReview" };
    default:
      return { icon: "○", className: "stateAvailable" };
  }
}

export default function CampaignRail({
  campaign,
  selectedLevel,
  onSelectLevel,
}: CampaignRailProps) {
  return (
    <aside className={styles.campaignRail}>
      <div className={styles.railHeader}>
        <h2 className={styles.subjectTitle}>{campaign.subjectTitle}</h2>
        <span className={styles.levelsCount}>{campaign.levels.length} levels</span>
      </div>

      <nav className={styles.levelsList} aria-label="Campaign levels">
        {campaign.levels.map((level) => {
          const { icon, className } = getStateIndicator(level.state);
          const isSelected = selectedLevel === level.level;
          const stateClass = className as keyof typeof styles;

          return (
            <button
              key={level.level}
              className={`${styles.levelItem} ${styles[stateClass] ?? ""} ${isSelected ? styles.selected : ""}`}
              onClick={() => onSelectLevel(level.level)}
              disabled={level.state === "LOCKED"}
              title={`Level ${level.level}: ${level.title}`}
            >
              <span className={styles.levelNumber}>Lv.{level.level}</span>
              <span className={styles.levelIcon}>{icon}</span>
              <span className={styles.levelTitle}>{level.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

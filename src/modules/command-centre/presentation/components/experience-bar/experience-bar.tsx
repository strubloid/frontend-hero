"use client";

import styles from "./experience-bar.module.scss";

interface ExperienceBarProps {
  currentXp: number;
  xpToNextLevel: number;
  progressPercent: number;
}

export default function ExperienceBar({
  currentXp,
  xpToNextLevel,
  progressPercent,
}: ExperienceBarProps) {
  return (
    <div className={styles.experienceBar}>
      <div className={styles.barTrack}>
        <div
          className={styles.barFill}
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          role="progressbar"
          aria-valuenow={progressPercent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Experience progress"
        />
      </div>
      <span className={styles.label}>
        {currentXp.toLocaleString()} / {xpToNextLevel.toLocaleString()} XP
      </span>
    </div>
  );
}

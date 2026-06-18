"use client";

import styles from "./mastery-indicator.module.scss";

interface MasteryIndicatorProps {
  percentage: number; // 0-100
  size?: number; // px, default 36
}

export default function MasteryIndicator({ percentage, size = 36 }: MasteryIndicatorProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const circumference = 2 * Math.PI * 14; // r=14
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className={styles.masteryIndicator} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 32 32" className={styles.svg}>
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="var(--cc-surface-elevated)"
          strokeWidth="3"
        />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="var(--cc-gold)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90, 16, 16)"
          className={styles.ring}
        />
      </svg>
      <span className={styles.label}>{clamped}%</span>
    </div>
  );
}

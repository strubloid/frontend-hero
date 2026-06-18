"use client";

import type { RecommendedActionViewModel } from "@/modules/command-centre/presentation/view-models/recommended-action-view-model";
import styles from "./contextual-action-dock.module.scss";

interface ContextualActionDockProps {
  actions: RecommendedActionViewModel[];
}

function getActionIcon(icon: string): string {
  const iconMap: Record<string, string> = {
    play: "▶",
    book: "📖",
    calendar: "📅",
    map: "🗺",
    sword: "⚔",
    star: "⭐",
  };
  return iconMap[icon] ?? "•";
}

export default function ContextualActionDock({ actions }: ContextualActionDockProps) {
  const primaryAction = actions.find((a) => a.primary);
  const secondaryActions = actions.filter((a) => !a.primary);

  return (
    <div className={styles.dock}>
      <div className={styles.dockInner}>
        {primaryAction && (
          <button className={styles.primaryAction} title={primaryAction.description}>
            <span className={styles.actionIcon}>{getActionIcon(primaryAction.icon)}</span>
            <span className={styles.actionLabel}>{primaryAction.label}</span>
          </button>
        )}

        <div className={styles.secondaryActions}>
          {secondaryActions.map((action) => (
            <button key={action.id} className={styles.secondaryAction} title={action.description}>
              <span className={styles.actionIcon}>{getActionIcon(action.icon)}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

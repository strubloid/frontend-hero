"use client";

import Link from "next/link";
import type { RecommendedActionViewModel } from "@/modules/command-centre/domain/view-models/recommended-action-view-model";
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
          <Link
            className={styles.primaryAction}
            href={primaryAction.destination}
            title={primaryAction.description}
          >
            <span className={styles.actionIcon}>{getActionIcon(primaryAction.icon)}</span>
            <span className={styles.actionLabel}>{primaryAction.label}</span>
          </Link>
        )}

        <div className={styles.secondaryActions}>
          {secondaryActions.map((action) => (
            <Link
              key={action.id}
              className={styles.secondaryAction}
              href={action.destination}
              title={action.description}
            >
              <span className={styles.actionIcon}>{getActionIcon(action.icon)}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

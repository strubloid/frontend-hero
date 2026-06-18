"use client";

import type { WorldNodeViewModel } from "@/modules/command-centre/presentation/view-models/world-node-view-model";
import type { CurrentQuestViewModel } from "@/modules/command-centre/presentation/view-models/current-quest-view-model";
import type { RecentProgressViewModel } from "@/modules/command-centre/presentation/view-models/recent-progress-view-model";
import styles from "./quest-inspector.module.scss";

interface QuestInspectorProps {
  selectedNode: WorldNodeViewModel | null;
  currentQuest: CurrentQuestViewModel | null;
  recentProgress: RecentProgressViewModel;
  hoveredNodeId: string | null;
  nodes: WorldNodeViewModel[];
}

function getNodeStateDescription(state: string): string {
  switch (state) {
    case "COMPLETED":
      return "Completed";
    case "MASTERED":
      return "Mastered";
    case "CURRENT":
      return "In Progress";
    case "AVAILABLE":
      return "Available";
    case "LOCKED":
      return "Locked";
    case "REVIEW_REQUIRED":
      return "Needs Review";
    default:
      return state;
  }
}

export default function QuestInspector({
  selectedNode,
  currentQuest,
  recentProgress,
  hoveredNodeId,
  nodes,
}: QuestInspectorProps) {
  // Determine what to show
  const nodeToShow =
    selectedNode ??
    (hoveredNodeId ? (nodes.find((n) => n.nodeId === hoveredNodeId) ?? null) : null);

  return (
    <aside className={styles.questInspector}>
      {nodeToShow ? (
        <div className={styles.inspectorContent}>
          <h3 className={styles.inspectorTitle}>{nodeToShow.title}</h3>
          {nodeToShow.subtitle && <p className={styles.inspectorSubtitle}>{nodeToShow.subtitle}</p>}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Status</span>
            <span className={styles.detailValue}>{getNodeStateDescription(nodeToShow.state)}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Type</span>
            <span className={styles.detailValue}>{nodeToShow.nodeType}</span>
          </div>

          {nodeToShow.completion > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Completion</span>
              <span className={styles.detailValue}>{nodeToShow.completion}%</span>
            </div>
          )}

          {nodeToShow.masteryContribution > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mastery</span>
              <span className={styles.detailValue}>+{nodeToShow.masteryContribution}%</span>
            </div>
          )}

          {nodeToShow.unlockRequirements.length > 0 && (
            <div className={styles.requirementsBlock}>
              <h4 className={styles.blockTitle}>Requirements</h4>
              {nodeToShow.unlockRequirements.map((req, i) => (
                <div
                  key={i}
                  className={`${styles.requirementItem} ${req.met ? styles.met : styles.unmet}`}
                >
                  <span className={styles.requirementIcon}>{req.met ? "✓" : "○"}</span>
                  <span className={styles.requirementText}>
                    {req.description}
                    {!req.met && (
                      <span className={styles.requirementProgress}>
                        {" "}
                        ({req.current}/{req.required})
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : currentQuest ? (
        <div className={styles.inspectorContent}>
          <h3 className={styles.inspectorTitle}>Current Quest</h3>
          <p className={styles.questSummary}>{currentQuest.title}</p>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Progress</span>
            <span className={styles.detailValue}>{currentQuest.progress.label}</span>
          </div>

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Difficulty</span>
            <span className={styles.detailValue}>{currentQuest.difficulty}</span>
          </div>

          <div className={styles.recentProgressBlock}>
            <h4 className={styles.blockTitle}>Recent Progress</h4>
            <div className={styles.recentRow}>
              <span className={styles.recentIcon}>⚡</span>
              <span className={styles.recentText}>+{recentProgress.xpGained} XP</span>
            </div>
            {recentProgress.masteryChange != null && (
              <div className={styles.recentRow}>
                <span className={styles.recentIcon}>⭐</span>
                <span className={styles.recentText}>+{recentProgress.masteryChange}% Mastery</span>
              </div>
            )}
            <div className={styles.recentRow}>
              <span className={styles.recentIcon}>✓</span>
              <span className={styles.recentText}>
                {recentProgress.missionsCompleted} mission(s) completed
              </span>
            </div>
            <p className={styles.lastAction}>Last: {recentProgress.lastAction}</p>
          </div>

          <div className={styles.recommendation}>
            <h4 className={styles.blockTitle}>Recommended Next</h4>
            <p className={styles.recommendationText}>
              {recentProgress.conceptsMastered > 0
                ? "Great progress! Consider reviewing weaker concepts to solidify gains."
                : "Continue with your current quest to advance through the campaign."}
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.inspectorEmpty}>
          <span className={styles.emptyIcon}>🗺</span>
          <p className={styles.emptyText}>Select a node or quest to see details</p>
        </div>
      )}
    </aside>
  );
}

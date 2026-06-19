"use client";

import Link from "next/link";
import type { WorldNodeViewModel } from "@/modules/command-centre/domain/view-models/world-node-view-model";
import type { CurrentQuestViewModel } from "@/modules/command-centre/domain/view-models/current-quest-view-model";
import type { RecentProgressViewModel } from "@/modules/command-centre/domain/view-models/recent-progress-view-model";
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

function getStateIcon(state: string): string {
  switch (state) {
    case "COMPLETED":
    case "MASTERED":
      return "✓";
    case "CURRENT":
      return "●";
    case "AVAILABLE":
      return "○";
    case "LOCKED":
      return "🔒";
    case "REVIEW_REQUIRED":
      return "⚠";
    default:
      return "○";
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

  // Use the node-derived quest (passed from parent) or the default current quest
  const questToShow = selectedNode ? currentQuest : null;

  return (
    <aside className={styles.questInspector} aria-label="Quest inspector">
      {nodeToShow ? (
        <div className={styles.inspectorContent}>
          <div className={styles.inspectorHeader}>
            <span className={styles.nodeStateBadge}>
              {getStateIcon(nodeToShow.state as string)} {getNodeStateDescription(nodeToShow.state)}
            </span>
            {nodeToShow.nodeType === "BOSS" && <span className={styles.nodeTypeBadge}>Boss</span>}
          </div>

          <h3 className={styles.inspectorTitle}>{nodeToShow.title}</h3>
          {nodeToShow.subtitle && <p className={styles.inspectorSubtitle}>{nodeToShow.subtitle}</p>}

          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Completion</span>
            <span className={styles.detailValue}>
              {nodeToShow.completion > 0 ? `${nodeToShow.completion}%` : "—"}
            </span>
          </div>

          {nodeToShow.masteryContribution > 0 && (
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Mastery Contribution</span>
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

          {questToShow && (
            <>
              {questToShow.rewards.length > 0 && (
                <div className={styles.rewardsBlock}>
                  <h4 className={styles.blockTitle}>Rewards</h4>
                  <div className={styles.rewardsList}>
                    {questToShow.rewards.map((reward, i) => (
                      <span key={i} className={styles.rewardItem}>
                        {reward.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {questToShow.primaryAction && !questToShow.primaryAction.disabled && (
                <Link
                  className={styles.actionButton}
                  href={questToShow.primaryAction.destination}
                  title={
                    questToShow.primaryAction.disabledReason ?? questToShow.primaryAction.label
                  }
                >
                  {questToShow.primaryAction.label}
                </Link>
              )}
            </>
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

          {currentQuest.rewards.length > 0 && (
            <div className={styles.rewardsBlock}>
              <h4 className={styles.blockTitle}>Rewards</h4>
              <div className={styles.rewardsList}>
                {currentQuest.rewards.map((reward, i) => (
                  <span key={i} className={styles.rewardItem}>
                    {reward.label}
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentQuest.primaryAction && !currentQuest.primaryAction.disabled && (
            <Link className={styles.actionButton} href={currentQuest.primaryAction.destination}>
              {currentQuest.primaryAction.label}
            </Link>
          )}

          <div className={styles.recentProgressBlock}>
            <h4 className={styles.blockTitle}>Recent Progress</h4>
            <div className={styles.recentRow}>
              <span className={styles.recentIcon}>⚡</span>
              <span className={styles.recentText}>+{recentProgress.xpGained} XP</span>
            </div>
            {recentProgress.masteryChange != null && (
              <div className={styles.recentRow}>
                <span className={styles.recentIcon}>⭐</span>
                <span className={styles.recentText}>{recentProgress.masteryChange}% Mastery</span>
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
          <p className={styles.emptyText}>Select a campaign level or quest to see details</p>
        </div>
      )}
    </aside>
  );
}

"use client";

import Link from "next/link";
import type { CurrentQuestViewModel } from "@/modules/command-centre/domain/view-models/current-quest-view-model";
import styles from "./current-quest-panel.module.scss";

interface CurrentQuestPanelProps {
  quest: CurrentQuestViewModel;
}

function getCategoryLabel(category: string): string {
  switch (category) {
    case "MAIN_QUEST":
      return "Main Quest";
    case "SIDE_QUEST":
      return "Side Quest";
    case "REVIEW":
      return "Review";
    case "BOSS":
      return "Boss Encounter";
    case "DAILY":
      return "Daily";
    default:
      return category;
  }
}

function getDifficultyBadge(difficulty: string): string {
  switch (difficulty) {
    case "BEGINNER":
      return "Beginner";
    case "ADVENTURER":
      return "Adventurer";
    case "EXPERT":
      return "Expert";
    case "MASTER":
      return "Master";
    case "LEGENDARY":
      return "Legendary";
    default:
      return difficulty;
  }
}

function getDifficultyClass(difficulty: string): string {
  const map: Record<string, string> = {
    BEGINNER: "diffBeginner",
    ADVENTURER: "diffAdventurer",
    EXPERT: "diffExpert",
    MASTER: "diffMaster",
    LEGENDARY: "diffLegendary",
  };
  return map[difficulty] ?? "diffBeginner";
}

function getRewardIcon(type: string): string {
  switch (type) {
    case "xp":
      return "⚡";
    case "knowledge_shards":
      return "💎";
    case "mastery":
      return "⭐";
    case "unlock":
      return "🔓";
    case "item":
      return "🎁";
    default:
      return "✦";
  }
}

export default function CurrentQuestPanel({ quest }: CurrentQuestPanelProps) {
  const diffClass = getDifficultyClass(quest.difficulty) as keyof typeof styles;

  return (
    <section className={styles.currentQuestPanel}>
      <div className={styles.questHeader}>
        <span className={`${styles.categoryBadge} ${styles[`cat${quest.category}`] ?? ""}`}>
          {getCategoryLabel(quest.category)}
        </span>
        <span className={`${styles.difficultyBadge} ${styles[diffClass] ?? ""}`}>
          {getDifficultyBadge(quest.difficulty)}
        </span>
      </div>

      <h2 className={styles.questTitle}>{quest.title}</h2>

      <p className={styles.questNarrative}>{quest.narrative}</p>

      <div className={styles.objectiveBlock}>
        <h3 className={styles.objectiveLabel}>Objective</h3>
        <p className={styles.objectiveText}>{quest.objective}</p>
      </div>

      <div className={styles.progressBlock}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${quest.progress.percent}%` }}
            role="progressbar"
            aria-valuenow={quest.progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
        <span className={styles.progressLabel}>{quest.progress.label}</span>
      </div>

      <div className={styles.rewardsBlock}>
        <span className={styles.rewardsLabel}>Rewards</span>
        <div className={styles.rewardsList}>
          {quest.rewards.map((reward, i) => (
            <span key={i} className={styles.rewardItem} title={reward.label}>
              <span className={styles.rewardIcon}>{getRewardIcon(reward.type)}</span>
              <span className={styles.rewardAmount}>{reward.label}</span>
            </span>
          ))}
        </div>
      </div>

      {quest.primaryAction.disabled ? (
        <button
          className={styles.actionButton}
          disabled
          title={quest.primaryAction.disabledReason ?? quest.primaryAction.label}
        >
          {quest.primaryAction.label}
        </button>
      ) : (
        <Link
          className={styles.actionButton}
          href={quest.primaryAction.destination}
          title={quest.primaryAction.disabledReason ?? quest.primaryAction.label}
        >
          {quest.primaryAction.label}
        </Link>
      )}
    </section>
  );
}

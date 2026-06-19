"use client";

import styles from "./reward-result-screen.module.scss";

interface RewardResultScreenProps {
  readonly score: number;
  readonly maxScore: number;
  readonly onNewMission: () => void;
  readonly onReturnToCommandCentre: () => void;
}

export default function RewardResultScreen({
  score,
  maxScore,
  onNewMission,
  onReturnToCommandCentre,
}: RewardResultScreenProps) {
  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const xpAwarded = Math.max(25, score * 25);
  const masteryLabel = scorePercent >= 80 ? "Mastery advanced" : "Practice logged";

  return (
    <section className={styles.rewardResultScreen} aria-labelledby="reward-result-title">
      <div className={styles.badge}>Encounter Complete</div>
      <h2 id="reward-result-title" className={styles.title}>
        Rewards Secured
      </h2>
      <p className={styles.summary}>
        You stabilised this encounter with a {scorePercent}% score. Claim your rewards and choose
        the next step from the Command Centre.
      </p>

      <div className={styles.scorePanel}>
        <span className={styles.scoreLabel}>Final Score</span>
        <strong className={styles.scoreValue}>
          {score}/{maxScore}
        </strong>
      </div>

      <div className={styles.rewardGrid}>
        <div className={styles.rewardCard}>
          <span className={styles.rewardIcon}>⚡</span>
          <span className={styles.rewardLabel}>Experience</span>
          <strong className={styles.rewardValue}>+{xpAwarded} XP</strong>
        </div>
        <div className={styles.rewardCard}>
          <span className={styles.rewardIcon}>⭐</span>
          <span className={styles.rewardLabel}>Mastery</span>
          <strong className={styles.rewardValue}>{masteryLabel}</strong>
        </div>
        <div className={styles.rewardCard}>
          <span className={styles.rewardIcon}>🧭</span>
          <span className={styles.rewardLabel}>Guidance</span>
          <strong className={styles.rewardValue}>Next quest updated</strong>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.primaryAction} onClick={onNewMission} type="button">
          Start New Mission
        </button>
        <button className={styles.secondaryAction} onClick={onReturnToCommandCentre} type="button">
          Return to Command Centre
        </button>
      </div>
    </section>
  );
}

"use client";

import styles from "./reward-result-screen.module.scss";

interface QuestProgressDisplay {
  questId: string;
  name: string;
  completedCount: number;
  requiredCount: number;
  completed: boolean;
  rewarded: boolean;
}

interface SubjectProgressDisplay {
  recorded: boolean;
  levelAdvanced: boolean;
  newLevel: number | null;
  bossUnlocked: boolean;
}

interface RewardResultScreenProps {
  readonly score: number;
  readonly maxScore: number;
  readonly xpAwarded?: number;
  readonly masteryGained?: number;
  readonly subjectProgress?: SubjectProgressDisplay | null;
  readonly questProgress?: QuestProgressDisplay[];
  readonly onNewMission: () => void;
  readonly onReturnToCommandCentre: () => void;
}

export default function RewardResultScreen({
  score,
  maxScore,
  xpAwarded,
  masteryGained,
  subjectProgress,
  questProgress,
  onNewMission,
  onReturnToCommandCentre,
}: RewardResultScreenProps) {
  const scorePercent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  const displayXp = xpAwarded ?? Math.max(25, score * 25);
  const displayMastery =
    masteryGained !== undefined
      ? `${Math.round(masteryGained * 100)}%`
      : scorePercent >= 80
        ? "Mastery advanced"
        : "Practice logged";

  const hasSubjectProgress = subjectProgress?.recorded ?? false;
  const hasQuests = questProgress && questProgress.length > 0;

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
          <strong className={styles.rewardValue}>+{displayXp} XP</strong>
        </div>
        <div className={styles.rewardCard}>
          <span className={styles.rewardIcon}>⭐</span>
          <span className={styles.rewardLabel}>Mastery</span>
          <strong className={styles.rewardValue}>{displayMastery}</strong>
        </div>
        <div className={styles.rewardCard}>
          <span className={styles.rewardIcon}>🧭</span>
          <span className={styles.rewardLabel}>Guidance</span>
          <strong className={styles.rewardValue}>
            {hasSubjectProgress && subjectProgress?.levelAdvanced
              ? `Level ${subjectProgress.newLevel} unlocked!`
              : hasSubjectProgress && subjectProgress?.bossUnlocked
                ? "Boss challenge available!"
                : hasQuests
                  ? `${questProgress!.filter((q) => !q.completed).length} active quests`
                  : "Continuing your journey"}
          </strong>
        </div>
      </div>

      {/* Quest progress section */}
      {hasQuests && (
        <div className={styles.questSummary}>
          <h3 className={styles.questTitle}>Quest Progress</h3>
          {questProgress!.map((q) => (
            <div key={q.questId} className={styles.questRow}>
              <span className={styles.questName}>{q.name}</span>
              <span className={styles.questBar}>
                <span
                  className={styles.questFill}
                  style={{
                    width: `${Math.min(100, Math.round((q.completedCount / q.requiredCount) * 100))}%`,
                  }}
                />
              </span>
              <span className={styles.questCount}>
                {q.completedCount}/{q.requiredCount}
              </span>
              {q.completed && <span className={styles.questComplete}>✓</span>}
            </div>
          ))}
        </div>
      )}

      {/* Subject progress section */}
      {hasSubjectProgress && subjectProgress?.levelAdvanced && (
        <div className={styles.levelUpNotice}>
          Level up! You&apos;ve advanced to level {subjectProgress.newLevel}. New challenges await.
        </div>
      )}
      {hasSubjectProgress && subjectProgress?.bossUnlocked && (
        <div className={styles.bossUnlockNotice}>
          The final challenge is within reach — prepare for the boss encounter!
        </div>
      )}

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

"use client";

import Link from "next/link";
import type { GameHudViewModel } from "@/modules/command-centre/domain/view-models/game-hud-view-model";
import type { HudNotificationViewModel } from "@/modules/command-centre/domain/view-models/hud-notification-view-model";
import PlayerIdentity from "@/modules/command-centre/presentation/components/player-identity/player-identity";
import ExperienceBar from "@/modules/command-centre/presentation/components/experience-bar/experience-bar";
import MasteryIndicator from "@/modules/command-centre/presentation/components/mastery-indicator/mastery-indicator";
import ResourceDisplay from "@/modules/command-centre/presentation/components/resource-display/resource-display";
import styles from "./game-hud.module.scss";

interface GameHudProps {
  hud: GameHudViewModel;
}

function NotificationBell({ notification }: { notification: HudNotificationViewModel }) {
  return (
    <span
      className={styles.notificationBell}
      title={notification.label}
      data-priority={notification.priority}
    >
      🔔
    </span>
  );
}

export default function GameHud({ hud }: GameHudProps) {
  return (
    <header className={styles.gameHud}>
      {/* Left: Player Identity */}
      <div className={styles.hudLeft}>
        <PlayerIdentity player={hud.player} />
      </div>

      {/* Center: XP Bar + Mastery */}
      <div className={styles.hudCenter}>
        <ExperienceBar
          currentXp={hud.level.currentXp}
          xpToNextLevel={hud.level.xpToNextLevel}
          progressPercent={hud.level.progressPercent}
        />
        {hud.activeSubject && (
          <div className={styles.activeSubject}>
            <span className={styles.subjectLabel}>{hud.activeSubject.subjectTitle}</span>
            <MasteryIndicator percentage={hud.activeSubject.masteryScore} size={32} />
          </div>
        )}
      </div>

      {/* Right: Currencies + Icon Buttons */}
      <div className={styles.hudRight}>
        <div className={styles.currencies}>
          {hud.currencies.map((currency) => (
            <ResourceDisplay key={currency.id} currency={currency} />
          ))}
        </div>

        <div className={styles.notifications}>
          {hud.notifications.map((n, i) => (
            <NotificationBell key={i} notification={n} />
          ))}
        </div>

        <div className={styles.iconButtons}>
          <Link href="/world-map" className={styles.iconBtn} title="Map">
            🗺
          </Link>
          <Link href="/subjects" className={styles.iconBtn} title="Journal">
            📖
          </Link>
          <Link href="/profile" className={styles.iconBtn} title="Profile">
            👤
          </Link>
          <Link href="/settings" className={styles.iconBtn} title="Settings">
            ⚙
          </Link>
        </div>
      </div>
    </header>
  );
}

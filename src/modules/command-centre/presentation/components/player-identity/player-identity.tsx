"use client";

import Image from "next/image";
import type { PlayerIdentityViewModel } from "@/modules/command-centre/domain/view-models/player-identity-view-model";
import styles from "./player-identity.module.scss";

interface PlayerIdentityProps {
  player: PlayerIdentityViewModel;
}

export default function PlayerIdentity({ player }: PlayerIdentityProps) {
  const initial = player.displayName.charAt(0).toUpperCase();

  return (
    <div className={styles.playerIdentity}>
      <div className={styles.avatar}>
        {player.avatarUrl ? (
          <Image
            src={player.avatarUrl}
            alt={player.displayName}
            className={styles.avatarImage}
            width={32}
            height={32}
          />
        ) : (
          <span className={styles.avatarInitial}>{initial}</span>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.displayName}>{player.displayName}</span>
        <span className={styles.titleBadge}>
          Lv.{player.level} {player.title}
        </span>
      </div>
    </div>
  );
}

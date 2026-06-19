"use client";

import type { GameCurrencyViewModel } from "@/modules/command-centre/domain/view-models/game-currency-view-model";
import styles from "./resource-display.module.scss";

interface ResourceDisplayProps {
  currency: GameCurrencyViewModel;
}

export default function ResourceDisplay({ currency }: ResourceDisplayProps) {
  return (
    <div className={styles.resourceDisplay} title={currency.tooltip}>
      <span className={styles.icon}>{currency.icon}</span>
      <span className={styles.amount}>{currency.amount.toLocaleString()}</span>
    </div>
  );
}

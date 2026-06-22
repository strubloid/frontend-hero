import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./ordering-question.module.scss";

const numberIcons = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465"];

export function OrderingQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div className={styles.container}>
      <div className={styles.typeBadge}>
        <span className={styles.typeLabel}>{"\uD83D\uDD04"} Order the Steps</span>
      </div>
      <p className={styles.stem}>{stem}</p>
      <p className={styles.instruction}>What comes next?</p>
      <div className={styles.options}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            className={`${styles.optionButton} ${selectedIndex === idx ? styles.optionSelected : ""}`}
          >
            <span className={styles.optionLabel}>{numberIcons[idx]}</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

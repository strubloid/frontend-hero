import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./matching-question.module.scss";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function MatchingQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div className={styles.container}>
      <div className={styles.typeBadge}>
        <span className={styles.typeLabel}>{"\uD83D\uDD17"} Match the Concept</span>
      </div>
      <div className={styles.referenceBox}>
        <span className={styles.referenceLabel}>Reference:{"  "}</span>
        <span className={styles.referenceValue}>{stem}</span>
      </div>
      <p className={styles.instruction}>Which option matches?</p>
      <div className={styles.options}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            className={`${styles.optionButton} ${selectedIndex === idx ? styles.optionSelected : ""}`}
          >
            <span className={styles.optionLabel}>{labelLetters[idx]}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

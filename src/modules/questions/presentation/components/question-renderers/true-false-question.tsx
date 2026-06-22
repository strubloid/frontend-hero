import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./true-false-question.module.scss";

export function TrueFalseQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div>
      <p className={styles.stem}>{stem}</p>
      <div className={styles.optionsList}>
        {options.map((opt, idx) => {
          let selectedClass = "";
          if (selectedIndex === idx) {
            selectedClass = idx === 0 ? styles.optionSelectedTrue : styles.optionSelectedFalse;
          }
          return (
            <button
              key={idx}
              onClick={() => onSelect(idx)}
              disabled={disabled}
              className={`${styles.optionButton} ${selectedClass}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./multiple-choice-question.module.scss";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function MultipleChoiceQuestion({
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
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            className={`${styles.optionButton} ${selectedIndex === idx ? styles.optionSelected : ""}`}
          >
            <span className={styles.optionLetter}>{labelLetters[idx]}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

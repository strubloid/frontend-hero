import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./fill-blank-question.module.scss";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function FillBlankQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  // Split stem on ___ or other blank indicators
  const parts = stem.split(/(___)/g);

  return (
    <div className={styles.container}>
      <div className={styles.typeBadge}>
        <span className={styles.typeLabel}>✏️ Fill in the Blank</span>
      </div>
      <p className={styles.stem}>
        {parts.map((part, i) => {
          if (part === "___") {
            const filledWord = selectedIndex !== null ? options[selectedIndex] : null;
            return (
              <span key={i} className={`${styles.blank} ${filledWord ? styles.blankFilled : ""}`}>
                {filledWord ?? " ___ "}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      <p className={styles.instruction}>Choose the correct word or phrase:</p>
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

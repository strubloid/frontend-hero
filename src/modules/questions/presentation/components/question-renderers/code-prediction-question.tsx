import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./code-prediction-question.module.scss";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function CodePredictionQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  // Split stem on ```code blocks and render them in <pre> tags
  const parts = stem.split(/(```[\s\S]*?```)/g);

  return (
    <div>
      <div className={styles.stem}>
        {parts.map((part, i) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const code = part.slice(3, -3).replace(/^[a-z]*\n/, ""); // strip language hint
            return (
              <pre key={i} className={styles.codeBlock}>
                <code>{code}</code>
              </pre>
            );
          }
          return (
            <span key={i} className={styles.inlineText}>
              {part}
            </span>
          );
        })}
      </div>
      <p className={styles.prompt}>What is the expected output?</p>
      <div className={styles.optionsList}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            className={`${styles.optionButton} ${selectedIndex === idx ? styles.optionSelected : ""}`}
          >
            <span className={styles.optionLetter}>{labelLetters[idx]}.</span>
            <code className={styles.optionCode}>{opt}</code>
          </button>
        ))}
      </div>
    </div>
  );
}

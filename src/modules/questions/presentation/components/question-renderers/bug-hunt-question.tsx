import type React from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./bug-hunt-question.module.scss";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function BugHuntQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  // Split stem on ```code blocks
  const parts = stem.split(/(```[\s\S]*?```)/g);

  return (
    <div>
      <div className={styles.typeBadge}>
        <span className={styles.typeBadgeText}>🐛 Find the Bug</span>
      </div>
      <div className={styles.stem}>
        {parts.map((part, i) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const code = part.slice(3, -3).replace(/^[a-z]*\n/, "");
            return (
              <pre key={i} className={styles.codeBlock}>
                <code>{code}</code>
              </pre>
            );
          }
          return (
            <span key={i} className={styles.stemText}>
              {part}
            </span>
          );
        })}
      </div>
      <p className={styles.prompt}>Where is the bug?</p>
      <div className={styles.optionsList}>
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

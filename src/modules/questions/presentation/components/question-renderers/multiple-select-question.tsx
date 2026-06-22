"use client";

import type React from "react";
import { useState } from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./multiple-select-question.module.scss";

export function MultipleSelectQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  const [selections, setSelections] = useState<Set<number>>(new Set());
  const isSubmitted = selectedIndex !== null;

  const toggleOption = (index: number) => {
    if (isSubmitted) return;
    setSelections((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (selections.size > 0) {
      onSelect(Math.min(...selections));
    }
  };

  return (
    <div className={styles.container}>
      <p className={styles.prompt}>{stem}</p>
      <p className={styles.instructions}>Select all that apply:</p>
      {options.map((option: string, idx: number) => (
        <div
          key={idx}
          onClick={() => toggleOption(idx)}
          className={`${styles.optionButton}${selections.has(idx) ? " " + styles.optionSelected : ""}`}
          role="checkbox"
          aria-checked={selections.has(idx)}
        >
          <div
            className={`${styles.checkbox}${selections.has(idx) ? " " + styles.checkboxChecked : ""}`}
          >
            {selections.has(idx) ? "✓" : ""}
          </div>
          <span className={styles.optionText}>{option}</span>
        </div>
      ))}
      <div className={styles.actions}>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={selections.size === 0 || isSubmitted}
        >
          {isSubmitted ? "Submitted" : "Submit Answer"}
        </button>
      </div>
      {isSubmitted && <p className={styles.feedbackMsg}>✓ Answer recorded</p>}
    </div>
  );
}

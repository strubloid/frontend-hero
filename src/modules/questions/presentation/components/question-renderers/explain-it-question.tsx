"use client";

import type React from "react";
import { useState } from "react";
import type { QuestionRendererProps } from "./shared";
import styles from "./explain-it-question.module.scss";

export function ExplainItQuestion({
  stem,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  const [text, setText] = useState("");
  const isSubmitted = selectedIndex !== null;

  return (
    <div className={styles.container}>
      <p className={styles.prompt}>{stem}</p>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your explanation here…"
        disabled={disabled || isSubmitted}
      />
      {isSubmitted && <p className={styles.feedbackMsg}>✓ Ready to submit your explanation.</p>}
      {!isSubmitted && (
        <button
          onClick={() => onSelect(0)}
          disabled={text.trim().length < 5}
          className={styles.submitButton}
        >
          Explain
        </button>
      )}
    </div>
  );
}

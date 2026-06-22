import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

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
      <p
        style={{
          color: "#fff",
          fontSize: "1.15rem",
          lineHeight: 1.5,
          marginBottom: "1.25rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {stem}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#4a9eff" }}>
              {labelLetters[idx]}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

export function TrueFalseQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div>
      <p style={{ color: "#fff", fontSize: "1.15rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
        {stem}
      </p>
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={{
              ...getOptionStyle(idx, selectedIndex, true),
              flex: 1,
              maxWidth: 200,
              padding: "1.25rem 1rem",
              fontSize: "1.1rem",
            }}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

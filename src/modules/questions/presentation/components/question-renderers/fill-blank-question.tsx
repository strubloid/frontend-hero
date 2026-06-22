import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

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
    <div>
      <div
        style={{
          background: "rgba(74, 158, 255, 0.08)",
          border: "1px solid rgba(74, 158, 255, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#4a9eff", fontWeight: 700, fontSize: "0.85rem" }}>
          ✏️ Fill in the Blank
        </span>
      </div>
      <p
        style={{
          color: "#fff",
          fontSize: "1.15rem",
          lineHeight: 1.6,
          marginBottom: "1.25rem",
          whiteSpace: "pre-wrap",
        }}
      >
        {parts.map((part, i) => {
          if (part === "___") {
            const filledWord = selectedIndex !== null ? options[selectedIndex] : null;
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  minWidth: "5rem",
                  borderBottom: `2px solid ${filledWord ? "#4a9eff" : "#666"}`,
                  margin: "0 0.25rem",
                  color: filledWord ? "#4a9eff" : "#666",
                  fontWeight: 700,
                  padding: "0 0.25rem",
                }}
              >
                {filledWord ?? " ___ "}
              </span>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        Choose the correct word or phrase:
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

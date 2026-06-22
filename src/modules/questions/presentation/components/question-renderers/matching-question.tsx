import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

const labelLetters = ["A", "B", "C", "D", "E", "F"];

export function MatchingQuestion({
  stem,
  options,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  return (
    <div>
      <div
        style={{
          background: "rgba(168, 85, 247, 0.08)",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>
          {"\uD83D\uDD17"} Match the Concept
        </span>
      </div>
      <div
        style={{
          background: "rgba(168, 85, 247, 0.05)",
          border: "1px dashed rgba(168, 85, 247, 0.3)",
          borderRadius: 6,
          padding: "0.75rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#a855f7", fontWeight: 700, fontSize: "0.85rem" }}>
          Reference:{"  "}
        </span>
        <span style={{ color: "#fff", fontSize: "1rem" }}>{stem}</span>
      </div>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        Which option matches?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#a855f7" }}>
              {labelLetters[idx]}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

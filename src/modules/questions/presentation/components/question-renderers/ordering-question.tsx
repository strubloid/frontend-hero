import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

const numberIcons = ["\u2460", "\u2461", "\u2462", "\u2463", "\u2464", "\u2465"];

export function OrderingQuestion({
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
          background: "rgba(250, 204, 21, 0.08)",
          border: "1px solid rgba(250, 204, 21, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#eab308", fontWeight: 700, fontSize: "0.85rem" }}>
          {"\uD83D\uDD04"} Order the Steps
        </span>
      </div>
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
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        What comes next?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#eab308" }}>
              {numberIcons[idx]}
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

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
      <div
        style={{
          background: "rgba(255, 107, 53, 0.08)",
          border: "1px solid rgba(255, 107, 53, 0.3)",
          borderRadius: 6,
          padding: "0.5rem 1rem",
          marginBottom: "1rem",
        }}
      >
        <span style={{ color: "#ff6b35", fontWeight: 700, fontSize: "0.85rem" }}>
          🐛 Find the Bug
        </span>
      </div>
      <div style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
        {parts.map((part, i) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const code = part.slice(3, -3).replace(/^[a-z]*\n/, "");
            return (
              <pre
                key={i}
                style={{
                  background: "#1a0e0a",
                  color: "#ffb08e",
                  padding: "1rem",
                  borderRadius: 6,
                  overflowX: "auto",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  border: "1px solid rgba(255, 107, 53, 0.2)",
                  margin: "0.75rem 0",
                }}
              >
                <code>{code}</code>
              </pre>
            );
          }
          return (
            <span key={i} style={{ color: "#fff" }}>
              {part}
            </span>
          );
        })}
      </div>
      <p style={{ color: "#aaa", fontSize: "0.85rem", marginBottom: "0.75rem", fontWeight: 600 }}>
        Where is the bug?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#ff6b35" }}>
              {labelLetters[idx]}.
            </span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

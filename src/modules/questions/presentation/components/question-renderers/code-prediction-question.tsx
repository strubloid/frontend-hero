import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { getOptionStyle } from "./shared";

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
      <div style={{ marginBottom: "1rem", lineHeight: 1.6 }}>
        {parts.map((part, i) => {
          if (part.startsWith("```") && part.endsWith("```")) {
            const code = part.slice(3, -3).replace(/^[a-z]*\n/, ""); // strip language hint
            return (
              <pre
                key={i}
                style={{
                  background: "#0d1117",
                  color: "#c9d1d9",
                  padding: "1rem",
                  borderRadius: 6,
                  overflowX: "auto",
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                  border: "1px solid #30363d",
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
        What is the expected output?
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            disabled={disabled}
            style={getOptionStyle(idx, selectedIndex, false)}
          >
            <span style={{ fontWeight: 700, marginRight: "0.5rem", color: "#c084fc" }}>
              {labelLetters[idx]}.
            </span>
            <code
              style={{
                background: "rgba(255,255,255,0.05)",
                padding: "0.1rem 0.3rem",
                borderRadius: 3,
              }}
            >
              {opt}
            </code>
          </button>
        ))}
      </div>
    </div>
  );
}

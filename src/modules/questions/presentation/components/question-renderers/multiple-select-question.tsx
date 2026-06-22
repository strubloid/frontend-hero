"use client";

import type React from "react";
import { useState } from "react";
import type { QuestionRendererProps } from "./shared";

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

  const containerStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: 12,
    padding: "1.5rem",
    background: "rgba(255,255,255,0.02)",
    maxWidth: 700,
  };

  const optionStyle = (index: number): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "0.75rem 1rem",
    margin: "0.5rem 0",
    borderRadius: 8,
    background: selections.has(index) ? "rgba(102, 126, 234, 0.15)" : "rgba(255,255,255,0.04)",
    border: selections.has(index) ? "1px solid #667eea" : "1px solid #333",
    cursor: isSubmitted ? "default" : "pointer",
    transition: "all 0.15s ease",
  });

  const checkboxStyle = (index: number): React.CSSProperties => ({
    width: 20,
    height: 20,
    borderRadius: 4,
    border: `2px solid ${selections.has(index) ? "#667eea" : "#555"}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: selections.has(index) ? "#667eea" : "transparent",
    color: "#fff",
    fontSize: "0.75rem",
    fontWeight: 700,
    flexShrink: 0,
  });

  const buttonStyle: React.CSSProperties = {
    padding: "0.6rem 1.5rem",
    borderRadius: 8,
    border: "none",
    background:
      selections.size === 0 || isSubmitted
        ? "#444"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#fff",
    fontSize: "0.9rem",
    fontWeight: 600,
    cursor: selections.size === 0 || isSubmitted ? "not-allowed" : "pointer",
    marginTop: "0.75rem",
  };

  return (
    <div style={containerStyle}>
      <p style={{ margin: "0 0 1rem 0", color: "#e0e0e0", lineHeight: 1.6 }}>{stem}</p>
      <p
        style={{
          color: "#888",
          fontSize: "0.8rem",
          marginBottom: "0.5rem",
        }}
      >
        Select all that apply:
      </p>
      {options.map((option: string, idx: number) => (
        <div
          key={idx}
          style={optionStyle(idx)}
          onClick={() => toggleOption(idx)}
          role="checkbox"
          aria-checked={selections.has(idx)}
        >
          <div style={checkboxStyle(idx)}>{selections.has(idx) ? "✓" : ""}</div>
          <span style={{ color: "#e0e0e0" }}>{option}</span>
        </div>
      ))}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          style={buttonStyle}
          onClick={handleSubmit}
          disabled={selections.size === 0 || isSubmitted}
        >
          {isSubmitted ? "Submitted" : "Submit Answer"}
        </button>
      </div>
      {isSubmitted && (
        <p
          style={{
            color: "#86efac",
            fontSize: "0.85rem",
            marginTop: "0.5rem",
          }}
        >
          ✓ Answer recorded
        </p>
      )}
    </div>
  );
}

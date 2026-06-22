"use client";

import type React from "react";
import { useState } from "react";
import type { QuestionRendererProps } from "./shared";

export function ExplainItQuestion({
  stem,
  selectedIndex,
  disabled,
  onSelect,
}: QuestionRendererProps) {
  const [text, setText] = useState("");
  const isSubmitted = selectedIndex !== null;

  const containerStyle: React.CSSProperties = {
    border: "1px solid #333",
    borderRadius: 12,
    padding: "1.5rem",
    background: "rgba(255,255,255,0.02)",
    maxWidth: 700,
  };

  const textareaStyle: React.CSSProperties = {
    width: "100%",
    minHeight: 120,
    padding: "0.75rem",
    background: "#1a1a2e",
    border: "1px solid #444",
    borderRadius: 8,
    color: "#e0e0e0",
    fontSize: "0.95rem",
    resize: "vertical",
    marginTop: "0.75rem",
    fontFamily: "inherit",
  };

  return (
    <div style={containerStyle}>
      <p style={{ color: "#e0e0e0", lineHeight: 1.6, margin: 0 }}>{stem}</p>
      <textarea
        style={textareaStyle}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your explanation here…"
        disabled={disabled || isSubmitted}
      />
      {isSubmitted && (
        <p style={{ color: "#86efac", fontSize: "0.85rem" }}>✓ Ready to submit your explanation.</p>
      )}
      {!isSubmitted && (
        <button
          onClick={() => onSelect(0)}
          disabled={text.trim().length < 5}
          style={{
            padding: "0.4rem 1rem",
            borderRadius: 6,
            border: "none",
            background:
              text.trim().length < 5 ? "#444" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            fontSize: "0.85rem",
            cursor: text.trim().length < 5 ? "not-allowed" : "pointer",
            marginTop: "0.5rem",
          }}
        >
          Explain
        </button>
      )}
    </div>
  );
}

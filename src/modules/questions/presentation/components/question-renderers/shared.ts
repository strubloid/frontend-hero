import type React from "react";

export interface QuestionRendererProps {
  stem: string;
  options: string[];
  selectedIndex: number | null;
  disabled: boolean;
  onSelect: (index: number) => void;
}

const sharedButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  textAlign: "left",
  borderRadius: 6,
  cursor: "pointer",
  color: "#e0e0e0",
  transition: "border 0.15s, background 0.15s",
  width: "100%",
  border: "2px solid #333",
  background: "#1e1e1e",
};

export function getOptionStyle(
  index: number,
  selectedIndex: number | null,
  isTrueFalse: boolean,
): React.CSSProperties {
  const isSelected = selectedIndex === index;
  return {
    ...sharedButtonStyle,
    border: isSelected
      ? `2px solid ${isTrueFalse ? (index === 0 ? "#22c55e" : "#ef4444") : "#4a9eff"}`
      : "2px solid #333",
    background: isSelected
      ? isTrueFalse
        ? index === 0
          ? "rgba(34, 197, 94, 0.2)"
          : "rgba(239, 68, 68, 0.2)"
        : "#1a2a40"
      : "#1e1e1e",
    fontWeight: isTrueFalse ? 700 : 400,
    textAlign: isTrueFalse ? "center" : "left",
    cursor: "pointer",
    color: "#e0e0e0",
    padding: "0.75rem 1rem",
    fontSize: isTrueFalse ? "1.1rem" : "0.95rem",
    borderRadius: 6,
    transition: "border 0.15s, background 0.15s",
    width: "100%",
  };
}

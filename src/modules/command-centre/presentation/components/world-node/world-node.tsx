"use client";

import type { WorldNodeViewModel } from "@/modules/command-centre/presentation/view-models/world-node-view-model";
import styles from "./world-node.module.scss";

interface WorldNodeProps {
  node: WorldNodeViewModel;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string | null) => void;
}

function getStateIcon(state: string): string {
  switch (state) {
    case "COMPLETED":
    case "MASTERED":
      return "✓";
    case "CURRENT":
      return "●";
    case "LOCKED":
      return "🔒";
    case "AVAILABLE":
      return "○";
    case "REVIEW_REQUIRED":
      return "⚠";
    case "BOSS":
      return "♛";
    default:
      return "○";
  }
}

export default function WorldNode({ node, isSelected, onSelect, onHover }: WorldNodeProps) {
  const isBoss = node.nodeType === "BOSS";
  const stateClass = `state${node.state}` as keyof typeof styles;

  return (
    <g
      className={`${styles.worldNode} ${styles[stateClass] ?? ""} ${isSelected ? styles.selected : ""} ${isBoss ? styles.boss : ""}`}
      onClick={() => onSelect(node.nodeId)}
      onMouseEnter={() => onHover(node.nodeId)}
      onMouseLeave={() => onHover(null)}
      style={{ cursor: "pointer" }}
    >
      {isBoss ? (
        <>
          <polygon
            points="0,-14 12,-7 12,7 0,14 -12,7 -12,-7"
            className={styles.nodeShape}
            transform={`translate(${node.position.x}, ${node.position.y})`}
          />
          <text
            x={node.position.x}
            y={node.position.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.nodeIcon}
            fontSize="14"
          >
            ♛
          </text>
        </>
      ) : (
        <>
          <circle cx={node.position.x} cy={node.position.y} r="12" className={styles.nodeShape} />
          <text
            x={node.position.x}
            y={node.position.y}
            textAnchor="middle"
            dominantBaseline="central"
            className={styles.nodeIcon}
            fontSize="12"
          >
            {getStateIcon(node.state)}
          </text>
        </>
      )}

      {/* Completion ring for current nodes */}
      {(node.state === "CURRENT" || node.state === "AVAILABLE") && node.completion > 0 && (
        <circle
          cx={node.position.x}
          cy={node.position.y}
          r="14"
          fill="none"
          stroke="var(--cc-primary)"
          strokeWidth="2"
          strokeDasharray={`${(node.completion / 100) * 88} 88`}
          transform={`rotate(-90, ${node.position.x}, ${node.position.y})`}
          opacity="0.6"
        />
      )}

      {/* Title below node */}
      <text
        x={node.position.x}
        y={node.position.y + 22}
        textAnchor="middle"
        className={styles.nodeTitle}
      >
        {node.title}
      </text>
    </g>
  );
}

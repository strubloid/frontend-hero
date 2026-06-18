"use client";

import type {
  WorldMapViewModel,
  WorldConnection,
} from "@/modules/command-centre/presentation/view-models/world-map-view-model";
import WorldNode from "@/modules/command-centre/presentation/components/world-node/world-node";
import styles from "./world-path.module.scss";

interface WorldPathProps {
  world: WorldMapViewModel;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

function getConnectionClass(state: WorldConnection["state"]): string {
  switch (state) {
    case "completed":
      return "connectionCompleted";
    case "active":
      return "connectionActive";
    case "inactive":
      return "connectionInactive";
    default:
      return "connectionInactive";
  }
}

export default function WorldPath({
  world,
  selectedNodeId,
  onNodeSelect,
  onNodeHover,
}: WorldPathProps) {
  const nodeMap = new Map(world.nodes.map((n) => [n.nodeId, n]));

  return (
    <svg className={styles.worldPath} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
      {/* Background grid pattern */}
      <defs>
        <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="5" cy="5" r="0.5" fill="var(--cc-border)" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="100" height="100" fill="url(#grid)" />

      {/* Connection lines */}
      {world.connections.map((conn) => {
        const fromNode = nodeMap.get(conn.fromNodeId);
        const toNode = nodeMap.get(conn.toNodeId);
        if (!fromNode || !toNode) return null;

        const connClass = getConnectionClass(conn.state) as keyof typeof styles;

        return (
          <line
            key={`${conn.fromNodeId}-${conn.toNodeId}`}
            x1={fromNode.position.x}
            y1={fromNode.position.y}
            x2={toNode.position.x}
            y2={toNode.position.y}
            className={`${styles.connection} ${styles[connClass] ?? ""}`}
          />
        );
      })}

      {/* Nodes */}
      {world.nodes.map((node) => (
        <WorldNode
          key={node.nodeId}
          node={node}
          isSelected={selectedNodeId === node.nodeId}
          onSelect={onNodeSelect}
          onHover={onNodeHover}
        />
      ))}
    </svg>
  );
}

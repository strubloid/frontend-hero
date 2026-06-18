"use client";

import WorldPath from "@/modules/command-centre/presentation/components/world-path/world-path";
import type { WorldMapViewModel } from "@/modules/command-centre/presentation/view-models/world-map-view-model";
import styles from "./world-stage.module.scss";

interface WorldStageProps {
  world: WorldMapViewModel;
  selectedNodeId: string | null;
  onNodeSelect: (nodeId: string) => void;
  onNodeHover: (nodeId: string | null) => void;
}

export default function WorldStage({
  world,
  selectedNodeId,
  onNodeSelect,
  onNodeHover,
}: WorldStageProps) {
  return (
    <div className={styles.worldStage}>
      <div className={styles.worldCanvas}>
        <WorldPath
          world={world}
          selectedNodeId={selectedNodeId}
          onNodeSelect={onNodeSelect}
          onNodeHover={onNodeHover}
        />
      </div>
    </div>
  );
}

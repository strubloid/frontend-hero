"use client";

import { useMemo, useState } from "react";
import { CommandCentreAssembler } from "@/modules/command-centre/application/command-centre-assembler";
import type { CommandCentreViewModel } from "@/modules/command-centre/presentation/view-models/command-centre-view-model";
import type { WorldNodeViewModel } from "@/modules/command-centre/presentation/view-models/world-node-view-model";
import GameHud from "@/modules/command-centre/presentation/components/game-hud/game-hud";
import CampaignRail from "@/modules/command-centre/presentation/components/campaign-rail/campaign-rail";
import WorldStage from "@/modules/command-centre/presentation/components/world-stage/world-stage";
import CurrentQuestPanel from "@/modules/command-centre/presentation/components/current-quest-panel/current-quest-panel";
import QuestInspector from "@/modules/command-centre/presentation/components/quest-inspector/quest-inspector";
import ContextualActionDock from "@/modules/command-centre/presentation/components/contextual-action-dock/contextual-action-dock";
import "@/modules/command-centre/presentation/styles/command-centre-variables.css";
import styles from "./command-centre-page.module.scss";

interface CommandCentrePageProps {
  vm?: CommandCentreViewModel;
}

export default function CommandCentrePage({ vm: externalVm }: CommandCentrePageProps) {
  // Get VM from assembler default fixture if not provided externally
  const vm = useMemo<CommandCentreViewModel>(
    () => externalVm ?? CommandCentreAssembler.default(),
    [externalVm],
  );

  // Interaction state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Find the selected node object
  const selectedNode: WorldNodeViewModel | null = selectedNodeId
    ? (vm.world.nodes.find((n) => n.nodeId === selectedNodeId) ?? null)
    : null;

  return (
    <div className={styles.commandCentre}>
      <GameHud hud={vm.hud} />

      <div className={styles.layout}>
        <CampaignRail
          campaign={vm.campaign}
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
        />

        <main className={styles.mainArea}>
          <WorldStage
            world={vm.world}
            selectedNodeId={selectedNodeId}
            onNodeSelect={setSelectedNodeId}
            onNodeHover={setHoveredNodeId}
          />

          {vm.currentQuest && (
            <div className={styles.questSection}>
              <CurrentQuestPanel quest={vm.currentQuest} />
            </div>
          )}
        </main>

        <QuestInspector
          selectedNode={selectedNode}
          currentQuest={vm.currentQuest}
          recentProgress={vm.recentProgress}
          hoveredNodeId={hoveredNodeId}
          nodes={vm.world.nodes}
        />
      </div>

      <ContextualActionDock actions={vm.recommendedActions} />
    </div>
  );
}

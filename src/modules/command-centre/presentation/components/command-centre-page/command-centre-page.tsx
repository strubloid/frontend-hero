"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { CommandCentreAssembler } from "@/modules/command-centre/application/command-centre-assembler";
import type { CommandCentreViewModel } from "@/modules/command-centre/domain/view-models/command-centre-view-model";
import type { WorldNodeViewModel } from "@/modules/command-centre/domain/view-models/world-node-view-model";
import type { CurrentQuestViewModel } from "@/modules/command-centre/domain/view-models/current-quest-view-model";
import type { QuestDifficulty } from "@/modules/command-centre/domain/view-models/quest-difficulty";
import type { QuestCategory } from "@/modules/command-centre/domain/view-models/quest-category";
import type { QuestActionViewModel } from "@/modules/command-centre/domain/view-models/quest-action-view-model";
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

interface QuestRewardDisplay {
  type: "xp" | "knowledge_shards" | "mastery" | "unlock" | "item";
  amount: number;
  label: string;
}

/** Parse level number from a world nodeId like "nextjs-level-3" */
function extractLevelFromNodeId(nodeId: string): number | null {
  const match = nodeId.match(/-level-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

/** Build a nodeId from subject ID and level number */
function buildNodeId(subjectId: string, level: number): string {
  return `${subjectId}-level-${level}`;
}

export default function CommandCentrePage({ vm: externalVm }: CommandCentrePageProps) {
  const vm = useMemo<CommandCentreViewModel>(
    () => externalVm ?? CommandCentreAssembler.default(),
    [externalVm],
  );

  // Ordered nodes for keyboard nav
  const orderedNodes = useMemo(
    () => (vm.world.nodes.length > 0 ? [...vm.world.nodes] : []),
    [vm.world.nodes],
  );

  const initialNodeId = useMemo(() => {
    const target =
      orderedNodes.find((node) => {
        const state = node.state as string;
        return state === "CURRENT" || state === "AVAILABLE";
      }) ?? orderedNodes[0];
    return target?.nodeId ?? null;
  }, [orderedNodes]);

  // Selection state
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(initialNodeId);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(
    initialNodeId ? extractLevelFromNodeId(initialNodeId) : null,
  );
  const stageRef = useRef<HTMLDivElement>(null);

  // Find selected node object
  const selectedNode: WorldNodeViewModel | null = useMemo(
    () =>
      selectedNodeId ? (vm.world.nodes.find((n) => n.nodeId === selectedNodeId) ?? null) : null,
    [selectedNodeId, vm.world.nodes],
  );

  // Compute a current-quest-like VM from the selected node
  const nodeDerivedQuest = useMemo<CurrentQuestViewModel | null>(() => {
    if (!selectedNode) return null;

    const stateStr = selectedNode.state as string;
    const isLocked = stateStr === "LOCKED";
    const isCompleted = stateStr === "COMPLETED";

    // Difficulty based on position
    const level = extractLevelFromNodeId(selectedNode.nodeId);
    const diff: QuestDifficulty =
      level !== null && level >= 8
        ? ("LEGENDARY" as QuestDifficulty)
        : level !== null && level >= 5
          ? ("EXPERT" as QuestDifficulty)
          : level !== null && level >= 3
            ? ("ADVENTURER" as QuestDifficulty)
            : ("BEGINNER" as QuestDifficulty);

    const isBoss = selectedNode.nodeType === "BOSS";

    const rewards: QuestRewardDisplay[] = [];
    if (isCompleted) {
      rewards.push({ type: "xp" as const, amount: 0, label: "Completed" });
    } else if (isLocked) {
      rewards.push({ type: "xp" as const, amount: 0, label: "Complete prerequisites" });
    } else {
      const xp = (level ?? 1) * 50;
      rewards.push({ type: "xp" as const, amount: xp, label: `${xp} XP` });
      if (isBoss) {
        rewards.push({
          type: "knowledge_shards" as const,
          amount: 25,
          label: "25 Knowledge Shards",
        });
      }
    }

    // Extract subject ID from nodeId (e.g. "nextjs-level-10" → "nextjs")
    const subjectIdFromNode = selectedNode.nodeId.replace(/-level-\d+$/, "");

    const action: QuestActionViewModel = isCompleted
      ? {
          label: "Completed",
          destination: "#",
          disabled: true,
          disabledReason: "This level has been completed",
          primary: false,
        }
      : isLocked
        ? {
            label: "Locked",
            destination: "#",
            disabled: true,
            disabledReason:
              selectedNode.unlockRequirements.length > 0
                ? `${selectedNode.unlockRequirements.filter((r) => !r.met).length} requirement(s) not met`
                : "Prerequisites not completed",
            primary: false,
          }
        : {
            label: isBoss
              ? selectedNode.completion > 0
                ? "Continue Battle"
                : "Challenge Boss"
              : selectedNode.completion > 0
                ? "Continue Quest"
                : "Start Quest",
            destination: isBoss ? `/boss-encounter?region=${subjectIdFromNode}` : "/play",
            disabled: false,
            disabledReason: null,
            primary: true,
          };

    return {
      questId: selectedNode.nodeId,
      category: (isBoss ? "BOSS" : "MAIN_QUEST") as QuestCategory,
      title: selectedNode.title,
      narrative: selectedNode.subtitle || "Continue your campaign journey.",
      objective: isCompleted
        ? "Level completed"
        : isLocked
          ? "Complete prerequisites to unlock"
          : "Complete encounters to progress through this level",
      estimatedDuration: isLocked || isCompleted ? "—" : "15 min",
      difficulty: diff,
      progress: {
        current: selectedNode.completion,
        max: 100,
        percent: selectedNode.completion,
        label: isCompleted
          ? "Complete"
          : isLocked
            ? "Locked"
            : selectedNode.completion > 0
              ? `${selectedNode.completion}% complete`
              : "Not started",
      },
      rewards,
      primaryAction: action,
    };
  }, [selectedNode]);

  // Bridge: campaign level selection → world node
  const handleLevelSelect = useCallback(
    (level: number) => {
      setSelectedLevel(level);
      const subjectId = vm.campaign.subjectId;
      if (subjectId && subjectId !== "unknown") {
        const nodeId = buildNodeId(subjectId, level);
        if (vm.world.nodes.some((n) => n.nodeId === nodeId)) {
          setSelectedNodeId(nodeId);
          return;
        }
      }
      // Fallback: use node order
      const nodeIndex = level - 1;
      const node = orderedNodes[nodeIndex];
      if (node) {
        setSelectedNodeId(node.nodeId);
        const extractedLevel = extractLevelFromNodeId(node.nodeId);
        if (extractedLevel !== null) setSelectedLevel(extractedLevel);
      }
    },
    [vm.campaign.subjectId, vm.world.nodes, orderedNodes],
  );

  // Bridge: world node selection → campaign level
  const handleNodeSelect = useCallback((nodeId: string) => {
    setSelectedNodeId(nodeId);
    const level = extractLevelFromNodeId(nodeId);
    if (level !== null) {
      setSelectedLevel(level);
    }
  }, []);

  // Keyboard navigation through world nodes
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (orderedNodes.length === 0) return;

      const currentIndex = selectedNodeId
        ? orderedNodes.findIndex((n) => n.nodeId === selectedNodeId)
        : -1;

      let nextIndex = currentIndex;

      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, orderedNodes.length - 1);
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case "Home":
          e.preventDefault();
          nextIndex = 0;
          break;
        case "End":
          e.preventDefault();
          nextIndex = orderedNodes.length - 1;
          break;
        default:
          return;
      }

      if (nextIndex >= 0 && nextIndex < orderedNodes.length && nextIndex !== currentIndex) {
        handleNodeSelect(orderedNodes[nextIndex].nodeId);
      }
    },
    [orderedNodes, selectedNodeId, handleNodeSelect],
  );

  return (
    <div className={styles.commandCentre} onKeyDown={handleKeyDown} ref={stageRef} tabIndex={-1}>
      <GameHud hud={vm.hud} />

      <div className={styles.layout}>
        <CampaignRail
          campaign={vm.campaign}
          selectedLevel={selectedLevel}
          onSelectLevel={handleLevelSelect}
        />

        <main className={styles.mainArea}>
          <WorldStage
            world={vm.world}
            selectedNodeId={selectedNodeId}
            onNodeSelect={handleNodeSelect}
            onNodeHover={setHoveredNodeId}
          />

          {(nodeDerivedQuest ?? vm.currentQuest) && (
            <div className={styles.questSection}>
              <CurrentQuestPanel quest={nodeDerivedQuest ?? vm.currentQuest!} />
            </div>
          )}
        </main>

        <QuestInspector
          selectedNode={selectedNode}
          currentQuest={nodeDerivedQuest ?? vm.currentQuest}
          recentProgress={vm.recentProgress}
          hoveredNodeId={hoveredNodeId}
          nodes={vm.world.nodes}
        />
      </div>

      <ContextualActionDock actions={vm.recommendedActions} />
    </div>
  );
}

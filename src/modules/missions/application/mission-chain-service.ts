import { MissionChain, PlayerMissionChainProgress } from "../domain/mission-chain";
import { MissionChainRepository } from "../domain/mission-chain-repository";

export interface ChainDisplay {
  id: string;
  name: string;
  description: string;
  narrativePrologue: string;
  narrativeEpilogue: string | null;
  regionId: string | null;
  requiredLevel: number;
  totalSteps: number;
  currentStepIndex: number;
  completedStepIds: string[];
  completed: boolean;
  rewardTitle: string | null;
}

export class MissionChainService {
  constructor(private readonly chainRepository: MissionChainRepository) {}

  async getPlayerChains(playerId: string, playerLevel: number): Promise<ChainDisplay[]> {
    const allChains = await this.chainRepository.getAll();
    const allProgress = await this.chainRepository.getAllPlayerProgress(playerId);

    return allChains
      .filter((c) => playerLevel >= c.requiredLevel || this.hasStarted(allProgress, c.id))
      .map((chain) => {
        const progress = allProgress.find((p) => p.chainId === chain.id);
        return {
          id: chain.id,
          name: chain.name,
          description: chain.description,
          narrativePrologue: chain.narrativePrologue,
          narrativeEpilogue: chain.narrativeEpilogue,
          regionId: chain.regionId,
          requiredLevel: chain.requiredLevel,
          totalSteps: chain.steps.length,
          currentStepIndex: progress?.currentStepIndex ?? 0,
          completedStepIds: progress?.completedStepIds ?? [],
          completed: (progress?.completedStepIds.length ?? 0) >= chain.steps.length,
          rewardTitle: chain.rewardTitle,
        };
      });
  }

  async advanceStep(playerId: string, chainId: string): Promise<void> {
    const chain = await this.chainRepository.getById(chainId);
    if (!chain) return;

    const now = new Date();
    const existing = await this.chainRepository.getPlayerProgress(playerId, chainId);
    const progress: PlayerMissionChainProgress = existing ?? {
      id: `${chainId}-${playerId}-${Date.now()}`,
      playerId,
      chainId,
      currentStepIndex: 0,
      completedStepIds: [],
      startedAt: now,
      completedAt: null,
      updatedAt: now,
      isActive: true,
    };

    const currentStep = chain.steps[progress.currentStepIndex];
    if (!currentStep || progress.completedStepIds.includes(currentStep.id)) return;

    // Mark current step as completed
    if (!progress.completedStepIds.includes(currentStep.id)) {
      progress.completedStepIds = [...progress.completedStepIds, currentStep.id];
    }

    // Advance to next step or complete the chain
    if (progress.currentStepIndex + 1 < chain.steps.length) {
      progress.currentStepIndex++;
    } else {
      progress.completedAt = now;
    }

    progress.updatedAt = now;
    await this.chainRepository.saveProgress(progress);
  }

  private hasStarted(allProgress: PlayerMissionChainProgress[], chainId: string): boolean {
    return allProgress.some((p) => p.chainId === chainId);
  }
}

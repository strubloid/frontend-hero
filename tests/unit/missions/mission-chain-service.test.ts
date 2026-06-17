import { describe, it, expect } from "vitest";
import { MissionChainService } from "@/modules/missions/application/mission-chain-service";
import { InMemoryMissionChainRepository } from "@/modules/missions/infrastructure/in-memory-mission-chain-repository";

describe("MissionChainService", () => {
  it("deactivates progress when the final step is completed", async () => {
    const repository = new InMemoryMissionChainRepository();
    const service = new MissionChainService(repository);
    const playerId = "player-1";
    const chainId = "chain-javascript-foundations";

    // Complete all 4 steps in the chain
    await service.advanceStep(playerId, chainId);
    await service.advanceStep(playerId, chainId);
    await service.advanceStep(playerId, chainId);
    await service.advanceStep(playerId, chainId);

    const progress = await repository.getPlayerProgress(playerId, chainId);

    expect(progress).not.toBeNull();
    expect(progress?.completedStepIds).toHaveLength(4);
    expect(progress?.completedAt).toBeInstanceOf(Date);
    expect(progress?.isActive).toBe(false);
  });
});

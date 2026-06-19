"use server";

import { auth } from "@/modules/authentication/infrastructure/auth.config";
import { CommandCentreAssembler } from "@/modules/command-centre/application/command-centre-assembler";
import { LoadCommandCentreUseCase } from "@/modules/command-centre/application/load-command-centre/load-command-centre.use-case";
import type { CommandCentreViewModel } from "@/modules/command-centre/domain/view-models/command-centre-view-model";
import { DrizzleQuestRepository } from "@/modules/missions/infrastructure/drizzle-quest-repository";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import { DrizzleProgressionRepository } from "@/modules/progression/infrastructure/drizzle-progression-repository";
import { DrizzlePlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/drizzle-player-subject-progress-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";

export async function loadCommandCentreForCurrentUser(): Promise<CommandCentreViewModel | undefined> {
  const session = await auth();

  if (!session?.user?.id) {
    return undefined;
  }

  try {
    const sqlite = getSqliteConnection();
    const useCase = new LoadCommandCentreUseCase(
      new DrizzlePlayerRepository(sqlite),
      new DrizzleProgressionRepository(sqlite),
      new DrizzleSubjectRepository(sqlite),
      new DrizzlePlayerSubjectProgressRepository(sqlite),
      new DrizzleQuestRepository(sqlite),
      new CommandCentreAssembler(),
    );

    const result = await useCase.execute({ playerId: session.user.id });
    return result.isSuccess ? (result.vm ?? undefined) : undefined;
  } catch (err) {
    console.error("Failed to load command centre:", err);
    return undefined;
  }
}

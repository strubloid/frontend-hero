import { auth } from "@/modules/authentication/infrastructure/auth.config";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import { DrizzleProgressionRepository } from "@/modules/progression/infrastructure/drizzle-progression-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { DrizzlePlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/drizzle-player-subject-progress-repository";
import { DrizzleQuestRepository } from "@/modules/missions/infrastructure/drizzle-quest-repository";
import { CommandCentreAssembler } from "@/modules/command-centre/application/command-centre-assembler";
import { LoadCommandCentreUseCase } from "@/modules/command-centre/application/load-command-centre/load-command-centre.use-case";
import type { CommandCentreViewModel } from "@/modules/command-centre/presentation/view-models/command-centre-view-model";
import CommandCentrePage from "@/modules/command-centre/presentation/components/command-centre-page/command-centre-page";

export default async function HomePage() {
  const session = await auth();
  let commandCentre: CommandCentreViewModel | undefined = undefined;

  if (session?.user?.id) {
    try {
      const sqlite = getSqliteConnection();
      const playerRepo = new DrizzlePlayerRepository(sqlite);
      const progressionRepo = new DrizzleProgressionRepository(sqlite);
      const subjectRepo = new DrizzleSubjectRepository(sqlite);
      const subjectProgressRepo = new DrizzlePlayerSubjectProgressRepository(sqlite);
      const questRepo = new DrizzleQuestRepository(sqlite);
      const assembler = new CommandCentreAssembler();
      const useCase = new LoadCommandCentreUseCase(
        playerRepo,
        progressionRepo,
        subjectRepo,
        subjectProgressRepo,
        questRepo,
        assembler,
      );

      const result = await useCase.execute({ playerId: session.user.id });
      if (result.isSuccess) {
        commandCentre = result.vm ?? undefined;
      }
    } catch (err) {
      console.error("Failed to load command centre:", err);
      // Falls through to fixture data
    }
  }

  return <CommandCentrePage vm={commandCentre} />;
}

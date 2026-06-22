"use server";

import { getAvailableSubjects } from "@/app/actions/subjects";
import { auth } from "@/modules/authentication/infrastructure/auth.config";
import { DrizzlePlayerRepository } from "@/modules/players/infrastructure/drizzle-player-repository";
import { SelectSubjectUseCase } from "@/modules/subjects/application/select-subject/select-subject.use-case";
import { DrizzlePlayerSubjectProgressRepository } from "@/modules/subjects/infrastructure/drizzle-player-subject-progress-repository";
import { DrizzleSubjectRepository } from "@/modules/subjects/infrastructure/drizzle-subject-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";

export interface SelectCurrentUserSubjectResult {
  readonly success: boolean;
  readonly error: string | null;
  readonly subjectId: string | null;
  readonly progressId: string | null;
}

export interface CurrentUserSubjectResult {
  readonly playerId: string;
  readonly subjectId: string | null;
}

export async function selectSubjectForCurrentUser(
  subjectId: string,
): Promise<SelectCurrentUserSubjectResult> {
  const session = await auth();
  const playerId = session?.user?.id;
  if (!playerId) {
    return {
      success: false,
      error: "You must sign in before selecting a subject.",
      subjectId: null,
      progressId: null,
    };
  }

  await getAvailableSubjects();

  const sqlite = getSqliteConnection();
  const useCase = new SelectSubjectUseCase(
    new DrizzlePlayerRepository(sqlite),
    new DrizzleSubjectRepository(sqlite),
    new DrizzlePlayerSubjectProgressRepository(sqlite),
  );
  const result = await useCase.execute({ playerId, subjectId });

  return {
    success: result.success,
    error: result.error,
    subjectId: result.success ? subjectId : null,
    progressId: result.subjectProgressId,
  };
}

export async function getCurrentUserSubject(): Promise<CurrentUserSubjectResult | null> {
  const session = await auth();
  const playerId = session?.user?.id;
  if (!playerId) return null;

  const player = await new DrizzlePlayerRepository(getSqliteConnection()).getById(playerId);
  if (!player) return null;

  return {
    playerId,
    subjectId: player.currentSubjectId,
  };
}

import { v4 as uuid } from "uuid";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { MissionRepository } from "@/modules/missions/domain/mission-repository";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { MissionSelector } from "./mission-selector";
import { StartMissionInput, Mission } from "@/modules/missions/domain/mission";

export interface StartMissionResult {
  mission: Mission;
}

export class StartMissionUseCase {
  constructor(
    private readonly playerRepository: PlayerRepository,
    private readonly subjectRepository: SubjectRepository,
    private readonly missionRepository: MissionRepository,
    private readonly missionSelector: MissionSelector,
    private readonly questionProvider: QuestionProvider,
  ) {}

  async execute(input: StartMissionInput): Promise<StartMissionResult> {
    const player = await this.playerRepository.getById(input.playerId);
    if (!player) {
      throw new Error(`Player not found: ${input.playerId}`);
    }

    const subject = await this.subjectRepository.getById(input.subjectId);
    if (!subject) {
      throw new Error(`Subject not found: ${input.subjectId}`);
    }

    const missionPlan = this.missionSelector.select(subject, [], []);
    const questions = await this.questionProvider.provideFor(missionPlan, subject);

    const now = new Date();
    const mission: Mission = {
      id: uuid(),
      playerId: input.playerId,
      subjectId: input.subjectId,
      type: input.type,
      status: "active",
      questionIds: questions.map((q) => q.id),
      currentQuestionIndex: 0,
      score: 0,
      maxScore: questions.length,
      startedAt: now,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    const saved = await this.missionRepository.create(mission);
    return { mission: saved };
  }
}

import { v4 as uuid } from "uuid";
import { PlayerRepository } from "@/modules/players/domain/player-repository";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";
import { MissionRepository } from "@/modules/missions/domain/mission-repository";
import { QuestionProvider } from "@/modules/questions/application/question-provider";
import { MissionSelector, MissionPlan } from "./mission-selector";
import { MasteryRepository } from "@/modules/mastery/domain/mastery-repository";
import { ReviewRepository } from "@/modules/reviews/domain/review-repository";
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
    private readonly masteryRepository?: MasteryRepository,
    private readonly reviewRepository?: ReviewRepository,
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

    // Load mastery and review data if repositories are available
    const masteries = this.masteryRepository
      ? await this.masteryRepository.getByPlayerAndSubject(input.playerId, input.subjectId)
      : [];
    const schedules = this.reviewRepository
      ? await this.reviewRepository.getByPlayerAndSubject(input.playerId, input.subjectId)
      : [];

    // All concept IDs in the subject (prerequisite-unlocked filtering comes later)
    const allConceptIds = subject.domains.flatMap((d) => d.concepts.map((c) => c.id));

    const missionPlan: MissionPlan = this.missionSelector.select({
      subject,
      masteries,
      schedules,
      recentConceptIds: [], // will be populated from session history in future
      availableConceptIds: allConceptIds,
    });

    const questions = await this.questionProvider.provideFor(missionPlan, subject);

    const now = new Date();
    const mission: Mission = {
      id: uuid(),
      playerId: input.playerId,
      subjectId: input.subjectId,
      type: missionPlan.type,
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

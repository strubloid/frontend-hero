import { v4 as uuidv4 } from "uuid";
import { Question } from "@/modules/questions/domain/question";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { Concept, Subject } from "@/modules/subjects/domain/subject";
import { MissionPlan } from "@/modules/missions/application/mission-selector";

/**
 * Converts QuestionSeeds embedded in a Concept into domain Question objects,
 * checking the QuestionRepository for existing questions by seedId+subjectId
 * to avoid duplicates.
 */
export class QuestionProvider {
  constructor(private readonly questionRepository: QuestionRepository) {}

  async provideFor(missionPlan: MissionPlan, subject: Subject): Promise<Question[]> {
    // Locate the concept targeted by this mission
    const concept = this.findConcept(missionPlan, subject);
    return this.provideForConcept(concept, subject.id);
  }

  async provideForConcept(concept: Concept, subjectId: string): Promise<Question[]> {
    const questions: Question[] = [];

    for (const seed of concept.questionSeeds) {
      // Check if question already exists
      const existing = await this.questionRepository.getBySeedAndSubject(seed.seedId, subjectId);

      if (existing) {
        questions.push(existing);
      } else {
        const question = this.createFromSeed(seed, concept, subjectId);
        const saved = await this.questionRepository.create(question);
        questions.push(saved);
      }
    }

    return questions;
  }

  private findConcept(missionPlan: MissionPlan, subject: Subject): Concept {
    for (const domain of subject.domains) {
      for (const concept of domain.concepts) {
        if (concept.id === missionPlan.conceptId) {
          return concept;
        }
      }
    }
    throw new Error(`Concept "${missionPlan.conceptId}" not found in subject "${subject.id}"`);
  }

  private createFromSeed(
    seed: Concept["questionSeeds"][0],
    concept: Concept,
    subjectId: string,
  ): Question {
    return {
      id: uuidv4(),
      subjectId,
      conceptId: concept.id,
      seedId: seed.seedId,
      type: seed.type,
      difficulty: seed.difficulty,
      stem: seed.stem,
      options: seed.options,
      correctIndex: seed.correctIndex,
      explanation: seed.explanation,
      timesShown: 0,
      lastShownAt: null,
      qualityRating: 5,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

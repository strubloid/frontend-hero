import { v4 as uuidv4 } from "uuid";
import { Question } from "@/modules/questions/domain/question";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { Concept, Subject, QuestionSeed } from "@/modules/subjects/domain/subject";
import { MissionPlan } from "@/modules/missions/application/mission-selector";

/**
 * Player context for question selection.
 * Used to adapt difficulty and avoid repetition.
 */
export interface QuestionProviderContext {
  recentQuestionIds: string[];
  conceptMastery?: Map<string, number>; // conceptId → mastery score 0-1
  preferredDifficulty?: number; // 1-5 the player is currently targeting
}

/**
 * Selects and adapts questions from a concept's seeds, applying:
 *
 * 1. Difficulty adaptation — prefer seeds near the player's mastery-adjusted level
 * 2. Repetition control — skip questions shown recently or too many times
 * 3. Variety enforcement — no repeats within the recent N questions
 * 4. Forge fallback — supplement with forge-generated questions in the DB when
 *    seed-based questions are insufficient or depleted
 */
export class QuestionProvider {
  constructor(
    private readonly questionRepository: QuestionRepository,
    private readonly maxQuestionsPerMission: number = 3,
    private readonly recentQuestionWindow: number = 10,
  ) {}

  async provideFor(
    missionPlan: MissionPlan,
    subject: Subject,
    context?: QuestionProviderContext,
  ): Promise<Question[]> {
    const concept = this.findConcept(missionPlan, subject);
    return this.provideForConcept(concept, subject.id, context);
  }

  async provideForConcept(
    concept: Concept,
    subjectId: string,
    context?: QuestionProviderContext,
  ): Promise<Question[]> {
    const ctx = context ?? { recentQuestionIds: [] };
    const avoidedIds = new Set(ctx.recentQuestionIds);

    // Determine target difficulty from player mastery
    const conceptMastery = ctx.conceptMastery?.get(concept.id) ?? 0;
    const targetDifficulty = this.computeTargetDifficulty(conceptMastery, concept.difficulty);

    // Get existing persisted questions for this concept
    const existingQuestions = await this.questionRepository.getByConceptId(concept.id);

    // Index persisted questions by seedId for fast lookup
    const bySeedId = new Map<string, Question>();
    for (const q of existingQuestions) {
      bySeedId.set(q.seedId, q);
    }

    // Fast set of known seed IDs to identify forge-generated questions later
    const seedIds = new Set(concept.questionSeeds.map((s) => s.seedId));

    // Score each seed by suitability, then pick the best ones
    const seededScores: Array<{ seed: QuestionSeed; score: number }> = [];

    for (const seed of concept.questionSeeds) {
      const existing = bySeedId.get(seed.seedId);

      // Repetition control: skip if recently shown and not the only option
      if (existing && avoidedIds.has(existing.id) && concept.questionSeeds.length > 1) {
        continue;
      }

      // Repetition control: skip if shown too many times (>3)
      if (existing && existing.timesShown >= 4 && concept.questionSeeds.length > 1) {
        continue;
      }

      const score = this.scoreSeed(seed, targetDifficulty, existing);
      seededScores.push({ seed, score });
    }

    // Sort by score descending (best match first)
    seededScores.sort((a, b) => b.score - a.score);

    // Take the best seeds
    const selected = seededScores.slice(0, this.maxQuestionsPerMission);

    // Convert selected seeds to Question objects
    const questions: Question[] = [];
    const usedIds = new Set<string>();

    for (const { seed } of selected) {
      const existing = bySeedId.get(seed.seedId);
      if (existing) {
        questions.push(existing);
        usedIds.add(existing.id);
      } else {
        const question = this.createFromSeed(seed, concept, subjectId);
        const saved = await this.questionRepository.create(question);
        questions.push(saved);
        usedIds.add(saved.id);
      }
    }

    // ── Supplement with forge-generated questions ───────────────────────────
    // If seed-based questions are insufficient, fall back to forge-generated
    // questions already persisted in the DB (their seedId doesn't match any
    // seed in the subject domain model).
    if (questions.length < this.maxQuestionsPerMission) {
      const nonSeedQuestions = existingQuestions.filter(
        (q) => !seedIds.has(q.seedId) && !usedIds.has(q.id) && !avoidedIds.has(q.id),
      );

      const scoredNonSeed = nonSeedQuestions.map((q) => ({
        question: q,
        score: this.scoreNonSeed(q, targetDifficulty),
      }));

      scoredNonSeed.sort((a, b) => b.score - a.score);

      const needed = this.maxQuestionsPerMission - questions.length;
      for (const { question } of scoredNonSeed.slice(0, needed)) {
        questions.push(question);
        usedIds.add(question.id);
      }
    }

    return questions;
  }

  /**
   * Score a seed from 0 (worst) to 100 (best) based on:
   * - Difficulty match: closer to target = higher score
   * - Freshness: not yet seen = bonus
   * - Shown count penalty: fewer times shown = better
   */
  private scoreSeed(
    seed: QuestionSeed,
    targetDifficulty: number,
    existing?: Question | null,
  ): number {
    let score = 0;

    // Difficulty match (0-40 points)
    const diffDiff = Math.abs(seed.difficulty - targetDifficulty);
    score += Math.max(0, 40 - diffDiff * 15);

    // Freshness bonus (0-30 points)
    if (!existing) {
      score += 30;
    } else {
      score += Math.max(0, 30 - existing.timesShown * 8);

      // Additional bonus if not recently shown
      if (existing.lastShownAt) {
        const daysSinceShown =
          (Date.now() - existing.lastShownAt.getTime()) / (24 * 60 * 60 * 1000);
        if (daysSinceShown < 1)
          score -= 20; // shown today: penalty
        else if (daysSinceShown < 3)
          score -= 5; // shown recently: slight penalty
        else score += Math.min(15, daysSinceShown); // older = better
      } else {
        score += 15; // never shown: bonus
      }
    }

    return score;
  }

  /**
   * Score a forge-generated (non-seed) question for suitability.
   *
   * Same difficulty-match and freshness scoring as seed questions,
   * minus the seed-specific logic (no "never existed" bonus since
   * these questions are always persisted).
   */
  private scoreNonSeed(question: Question, targetDifficulty: number): number {
    let score = 0;

    // Difficulty match (0-40 points)
    const diffDiff = Math.abs(question.difficulty - targetDifficulty);
    score += Math.max(0, 40 - diffDiff * 15);

    // Freshness score (0-30 points) — fewer times shown = better
    score += Math.max(0, 30 - question.timesShown * 8);

    // Additional bonus based on last shown recency
    if (question.lastShownAt) {
      const daysSinceShown = (Date.now() - question.lastShownAt.getTime()) / (24 * 60 * 60 * 1000);
      if (daysSinceShown < 1)
        score -= 20; // shown today: penalty
      else if (daysSinceShown < 3)
        score -= 5; // shown recently: slight penalty
      else score += Math.min(15, daysSinceShown); // older = better
    } else {
      score += 15; // never shown: bonus
    }

    return score;
  }

  /**
   * Compute the ideal difficulty for a player based on their mastery.
   *
   * Rules:
   * - mastery < 0.2: play at concept's base difficulty - 1 (min 1)
   * - mastery 0.2-0.5: play at base difficulty
   * - mastery 0.5-0.8: play at base difficulty + 1 (challenge)
   * - mastery > 0.8: play at base difficulty + 2 (max 5)
   */
  private computeTargetDifficulty(conceptMastery: number, baseDifficulty: number): number {
    let target: number;
    if (conceptMastery < 0.2) {
      target = baseDifficulty - 1;
    } else if (conceptMastery < 0.5) {
      target = baseDifficulty;
    } else if (conceptMastery < 0.8) {
      target = baseDifficulty + 1;
    } else {
      target = baseDifficulty + 2;
    }
    return Math.max(1, Math.min(5, target));
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

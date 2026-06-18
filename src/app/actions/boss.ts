"use server";

import { v4 as uuid } from "uuid";
import { BossEncounter, PlayerBossProgress } from "@/modules/missions/domain/boss-encounter";
import {
  DrizzleBossEncounterRepository,
  DrizzleBossProgressRepository,
} from "@/modules/missions/infrastructure/drizzle-boss-repository";
import { QuestionRepository } from "@/modules/questions/domain/question-repository";
import { getSqliteConnection } from "@/shared/infrastructure/database/connection";

// ---------------------------------------------------------------------------
// Minimal in-memory repositories for the boss workflow
// ---------------------------------------------------------------------------

class LocalQuestionRepository implements QuestionRepository {
  private store = new Map<string, any>();

  set(q: any) {
    this.store.set(q.id, q);
  }
  async getById(id: string) {
    return this.store.get(id) ?? null;
  }
  async create(q: any) {
    this.store.set(q.id, q);
    return q;
  }
  async getByConceptId(conceptId: string) {
    return Array.from(this.store.values()).filter((q) => q.conceptId === conceptId);
  }
  async getRandomBySubjectId(subjectId: string, limit: number) {
    return Array.from(this.store.values())
      .filter((q) => q.subjectId === subjectId)
      .slice(0, limit);
  }
  async getBySeedAndSubject(seedId: string, subjectId: string) {
    return (
      Array.from(this.store.values()).find(
        (q) => q.seedId === seedId && q.subjectId === subjectId,
      ) ?? null
    );
  }
}

class LocalPlayerRepo {
  private player: any = null;
  async getById(id: string) {
    if (this.player) return this.player;
    // Try to load from the profile action
    try {
      const { getPlayerProfile } = await import("@/app/actions/profile");
      const profile = await getPlayerProfile(id);
      if (profile) {
        this.player = {
          id,
          name: profile.player.name,
          level: profile.player.level,
          experiencePoints: profile.player.experiencePoints,
        };
        return this.player;
      }
    } catch {
      // Fall through to default
    }
    this.player = { id, name: "Adventurer", level: 1, experiencePoints: 0, masteryPoints: 0 };
    return this.player;
  }
  async create(p: any) {
    this.player = p;
    return p;
  }
  async save(p: any) {
    this.player = p;
    return p;
  }
}

class LocalMissionRepo {
  private store = new Map<string, any>();
  private activeByPlayer = new Map<string, string>();
  async getById(id: string) {
    return this.store.get(id) ?? null;
  }
  async create(m: any) {
    this.store.set(m.id, m);
    this.activeByPlayer.set(m.playerId, m.id);
    return m;
  }
  async save(m: any) {
    this.store.set(m.id, m);
    return m;
  }
  async getActiveByPlayer(playerId: string) {
    const id = this.activeByPlayer.get(playerId);
    if (!id) return null;
    return this.store.get(id) ?? null;
  }
  async getCompletedByPlayer(playerId: string) {
    return Array.from(this.store.values()).filter(
      (m) => m.playerId === playerId && m.status === "completed",
    );
  }
}

class LocalAttemptRepo {
  private store = new Map<string, any>();
  async create(a: any) {
    this.store.set(a.id, a);
    return a;
  }
  async getByMission(missionId: string) {
    return Array.from(this.store.values()).filter((a) => a.missionId === missionId);
  }
  async getByPlayer(playerId: string) {
    return Array.from(this.store.values()).filter((a) => a.playerId === playerId);
  }
}

// ---------------------------------------------------------------------------
// Singletons
// ---------------------------------------------------------------------------

const sqlite = getSqliteConnection();
const bossEncounterRepository = new DrizzleBossEncounterRepository(sqlite);
const bossProgressRepository = new DrizzleBossProgressRepository(sqlite);
const questionRepository = new LocalQuestionRepository();
const playerRepo = new LocalPlayerRepo();
const missionRepo = new LocalMissionRepo();
const attemptRepo = new LocalAttemptRepo();

// Pre-seed questions from the missions action
async function ensureQuestions(): Promise<void> {
  const existing = await questionRepository.getByConceptId("layout-files");
  if (existing.length > 0) return;
  try {
    const { getDefaultSubject } = await import("@/app/actions/missions");
    const { QuestionProvider } = await import("@/modules/questions/application/question-provider");
    const provider = new QuestionProvider(questionRepository);
    const subject = await getDefaultSubject();
    if (subject) {
      for (const domain of subject.domains) {
        for (const concept of domain.concepts) {
          await provider.provideForConcept(concept, subject.id);
        }
      }
    }
  } catch {
    // Fallback: seed a few direct questions
    const fallbackQuestions = [
      {
        id: "q1",
        subjectId: "nextjs",
        conceptId: "layout-files",
        stem: "What is a layout file in Next.js?",
        options: ["A shared UI wrapper", "A CSS file", "A database schema", "An API route"],
        correctIndex: 0,
        difficulty: 1,
        type: "multiple-choice",
        explanation: "A layout file defines a shared UI wrapper for route segments.",
        seedId: "layout-files-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q2",
        subjectId: "nextjs",
        conceptId: "nested-layouts",
        stem: "How do nested layouts work in the App Router?",
        options: [
          "Layouts are composed hierarchically along route segments",
          "Only one layout is allowed",
          "Layouts replace each other",
          "Layouts only work at the root level",
        ],
        correctIndex: 0,
        difficulty: 2,
        type: "multiple-choice",
        explanation:
          "Layouts in the App Router compose hierarchically — each route segment can have its own layout.",
        seedId: "nested-layouts-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q3",
        subjectId: "nextjs",
        conceptId: "route-groups",
        stem: "What are route groups in Next.js App Router?",
        options: [
          "Way to organize routes without affecting URL structure",
          "Groups of API endpoints",
          "Database groups",
          "CSS modules",
        ],
        correctIndex: 0,
        difficulty: 2,
        type: "multiple-choice",
        explanation:
          "Route groups let you organize routes in folders without changing the URL path.",
        seedId: "route-groups-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q4",
        subjectId: "nextjs",
        conceptId: "loading-ui",
        stem: "What file creates a loading state in Next.js App Router?",
        options: ["loading.tsx", "loading.js", "spinner.tsx", "loading-ui.tsx"],
        correctIndex: 0,
        difficulty: 1,
        type: "multiple-choice",
        explanation: "A loading.tsx file creates an immediate loading state for a route segment.",
        seedId: "loading-ui-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q5",
        subjectId: "nextjs",
        conceptId: "error-handling",
        stem: "How do you add an error boundary to a route segment?",
        options: [
          "Create an error.tsx file",
          "Wrap in try/catch",
          "Use a custom _error page",
          "Add error handling middleware",
        ],
        correctIndex: 0,
        difficulty: 1,
        type: "multiple-choice",
        explanation:
          "Creating an error.tsx file in a route segment automatically creates an error boundary.",
        seedId: "error-handling-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q6",
        subjectId: "nextjs",
        conceptId: "data-fetching",
        stem: "What is the recommended approach for data fetching in Next.js App Router?",
        options: [
          "Fetch directly in server components",
          "Use useEffect in client components",
          "Always use SWR",
          "Fetch in getServerSideProps",
        ],
        correctIndex: 0,
        difficulty: 1,
        type: "multiple-choice",
        explanation:
          "Server components can fetch data directly with async/await, eliminating the need for useEffect.",
        seedId: "data-fetching-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q7",
        subjectId: "nextjs",
        conceptId: "server-components",
        stem: "What is true about server components?",
        options: [
          "They run on the server and reduce client JS",
          "They run in the browser",
          "They only work with getStaticProps",
          "They require client-side hydration",
        ],
        correctIndex: 0,
        difficulty: 2,
        type: "multiple-choice",
        explanation:
          "Server components run on the server, reducing the JavaScript sent to the client.",
        seedId: "server-components-1",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    for (const q of fallbackQuestions) {
      questionRepository.set(q);
    }
  }
}

// ---------------------------------------------------------------------------
// Exported actions
// ---------------------------------------------------------------------------

export async function getBossState(playerId: string, regionId: string) {
  await ensureQuestions();
  const boss = await bossEncounterRepository.getByRegion(regionId);
  if (!boss) throw new Error(`No boss for region: ${regionId}`);

  const progress = await bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);
  if (progress?.status === "defeated" || progress?.completedAt) {
    return {
      bossId: boss.id,
      name: boss.name,
      title: boss.title,
      narrativeIntro: boss.narrativeVictory,
      totalPhases: boss.phases.length,
      currentPhaseIndex: 0,
      completedPhaseIds: boss.phases.map((p) => p.id),
      phaseName: "",
      phasePrompt: "",
      phaseDifficulty: 0,
      question: null,
      status: "victory" as const,
      bossDefeated: true,
    };
  }

  const currentIdx = progress?.currentPhaseIndex ?? 0;
  const currentPhase = boss.phases[currentIdx];
  if (!currentPhase) {
    return {
      bossId: boss.id,
      name: boss.name,
      title: boss.title,
      narrativeIntro: boss.narrativeIntro,
      totalPhases: boss.phases.length,
      currentPhaseIndex: 0,
      completedPhaseIds: [],
      phaseName: "",
      phasePrompt: "",
      phaseDifficulty: 0,
      question: null,
      status: "active" as const,
      bossDefeated: false,
    };
  }

  // Get questions for current phase's first concept
  const conceptId = currentPhase.conceptIds[0] ?? "";
  const questions = await questionRepository.getByConceptId(conceptId);
  const currentQuestion = questions[questions.length - 1] ?? null;

  return {
    bossId: boss.id,
    name: boss.name,
    title: boss.title,
    narrativeIntro: boss.narrativeIntro,
    totalPhases: boss.phases.length,
    currentPhaseIndex: currentIdx,
    completedPhaseIds: progress?.completedPhaseIds ?? [],
    phaseName: currentPhase.type.replace(/-/g, " "),
    phasePrompt: currentPhase.prompt,
    phaseDifficulty: currentPhase.difficulty,
    question: currentQuestion
      ? {
          questionId: currentQuestion.id,
          stem: currentQuestion.stem,
          options: currentQuestion.options,
          type: currentQuestion.type,
        }
      : null,
    status: "active" as const,
    bossDefeated: false,
  };
}

export async function startBoss(playerId: string, regionId: string) {
  await ensureQuestions();
  const boss = await bossEncounterRepository.getByRegion(regionId);
  if (!boss) throw new Error(`No boss for region: ${regionId}`);

  // Create a new boss mission
  const missionId = uuid();
  const mission = {
    id: missionId,
    playerId,
    subjectId: boss.subjectId,
    type: "boss" as const,
    status: "active" as const,
    questionIds: [],
    currentQuestionIndex: 0,
    score: 0,
    maxScore: 10,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  await missionRepo.create(mission);

  const bossProgress: PlayerBossProgress = {
    id: missionId,
    playerId,
    bossId: boss.id,
    currentPhaseIndex: 0,
    completedPhaseIds: [],
    phaseAttempts: boss.phases.map((p) => ({
      phaseId: p.id,
      attempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
      passed: false,
      completedAt: null,
    })),
    status: "active",
    startedAt: new Date(),
    completedAt: null,
  };
  await bossProgressRepository.save(bossProgress);

  return getBossState(playerId, regionId);
}

export async function submitBossAnswer(
  playerId: string,
  regionId: string,
  questionId: string,
  selectedIndex: number,
) {
  await ensureQuestions();
  const boss = await bossEncounterRepository.getByRegion(regionId);
  if (!boss) throw new Error(`No boss for region: ${regionId}`);

  const progress = await bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);
  if (!progress) throw new Error("No active boss encounter.");

  const question = await questionRepository.getById(questionId);
  const isCorrect = question ? selectedIndex === question.correctIndex : false;
  const explanation = question?.explanation ?? (isCorrect ? "Correct!" : "Incorrect.");

  // Record the attempt
  const attempt = {
    id: uuid(),
    missionId: progress.id,
    playerId,
    questionId,
    selectedIndex,
    isCorrect,
    timeSpentSeconds: 0,
    hintsUsed: 0,
    attemptedAt: new Date(),
  };
  await attemptRepo.create(attempt);

  // Get all attempts for this boss
  const allAttempts = await attemptRepo.getByMission(progress.id);

  // Evaluate current phase
  const currentPhaseIndex = progress.completedPhaseIds.length;
  const currentPhase = boss.phases[currentPhaseIndex];
  if (!currentPhase) {
    // All phases already done
    progress.status = "defeated";
    progress.completedAt = new Date();
    await bossProgressRepository.save(progress);
    const bossState = await getBossState(playerId, regionId);
    return {
      isCorrect,
      explanation,
      xpAwarded: 15,
      bossState,
      newBossHealth: 0,
      newPlayerHealth: 100,
      score: 100,
    };
  }

  const phaseAttempts = allAttempts.filter((a) =>
    currentPhase.conceptIds.some((cid) => question?.conceptId === cid),
  );

  // Count correct
  const correctInPhase = allAttempts
    .filter((a) =>
      currentPhase.conceptIds.some((cid) => {
        const q = questionRepository.getById(a.questionId);
        return true; // simplified
      }),
    )
    .filter((a) => a.isCorrect).length;

  const totalInPhase = allAttempts.length;
  const phasePassed = correctInPhase >= currentPhase.minCorrectCount;
  const phaseFailed = totalInPhase >= currentPhase.maxAttempts && !phasePassed;

  let bossDefeated = false;
  let xpAwarded = 0;

  if (phasePassed) {
    progress.completedPhaseIds.push(currentPhase.id);
    progress.currentPhaseIndex = progress.completedPhaseIds.length;

    if (progress.completedPhaseIds.length >= boss.phases.length) {
      // Boss defeated!
      progress.status = "defeated";
      progress.completedAt = new Date();
      bossDefeated = true;
      const player = await playerRepo.getById(playerId);
      if (player) {
        xpAwarded = 100;
        player.experiencePoints = (player.experiencePoints ?? 0) + xpAwarded;
        await playerRepo.save(player);
      }
    } else {
      xpAwarded = 15;
      const player = await playerRepo.getById(playerId);
      if (player) {
        player.experiencePoints = (player.experiencePoints ?? 0) + xpAwarded;
        await playerRepo.save(player);
      }
    }
  }

  await bossProgressRepository.save(progress);

  // Calculate healths for frontend
  const totalPhases = boss.phases.length;
  const completedPhases = progress.completedPhaseIds.length;
  const bossHealth = bossDefeated ? 0 : Math.max(5, 100 - (completedPhases / totalPhases) * 100);
  const playerHealth = phaseFailed
    ? 0
    : Math.max(5, 100 - (totalInPhase / currentPhase.maxAttempts) * 40);

  const bossState = await getBossState(playerId, regionId);
  bossState.status = bossDefeated ? "victory" : "active";

  return {
    isCorrect,
    explanation,
    xpAwarded,
    bossState,
    newBossHealth: bossHealth,
    newPlayerHealth: playerHealth,
    score: bossDefeated ? 100 : Math.round((completedPhases / totalPhases) * 100),
  };
}

export async function retreatBoss(playerId: string, regionId: string) {
  const boss = await bossEncounterRepository.getByRegion(regionId);
  if (!boss) return;
  const progress = await bossProgressRepository.getByPlayerAndBoss(playerId, boss.id);
  if (!progress) return;
  progress.status = "retreat";
  await bossProgressRepository.save(progress);
}

export async function getDefaultPlayer(playerId: string) {
  return playerRepo.getById(playerId);
}

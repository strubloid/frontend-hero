import type { ArtificialIntelligenceGateway } from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type {
  EvaluateAnswerRequest,
  EvaluateAnswerResult,
} from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type {
  GenerateExplanationRequest,
  GenerateExplanationResult,
} from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type {
  GenerateHintRequest,
  GenerateHintResult,
} from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type {
  GenerateMissionRequest,
  GenerateMissionResult,
} from "@/modules/artificial-intelligence/domain/artificial-intelligence-gateway";
import type { GenerateQuestionRequest } from "@/modules/artificial-intelligence/domain/generate-question-request";
import type {
  GenerateQuestionResult,
  QuestionItem,
} from "@/modules/artificial-intelligence/domain/generate-question-result";
import type { GenerateQuestionBatchRequest } from "@/modules/artificial-intelligence/domain/generate-question-batch-request";
import type { GenerateQuestionBatchResult } from "@/modules/artificial-intelligence/domain/generate-question-batch-result";

interface QuestionTemplate {
  readonly stemPattern: string;
  readonly options: readonly string[];
  readonly correctIndex: number;
  readonly explanationPattern: string;
  readonly type: string;
  readonly difficulty: number;
}

/**
 * Pool of question templates covering various Next.js concepts.
 * Each template uses [concept] as a placeholder that gets replaced
 * with the actual concept name at generation time.
 */
const TEMPLATE_POOL: readonly QuestionTemplate[] = Object.freeze([
  {
    stemPattern: "What is the primary purpose of [concept] in Next.js?",
    options: Object.freeze([
      "To optimise page rendering and improve developer experience",
      "To replace CSS-in-JS solutions entirely",
      "To handle database migrations automatically",
      "To manage user authentication out of the box",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] is a built-in Next.js feature designed to improve performance and streamline development. It follows React and Next.js conventions to minimise boilerplate and maximise efficiency.",
    type: "multiple-choice",
    difficulty: 1,
  },
  {
    stemPattern: "Which of the following best describes how [concept] works in Next.js?",
    options: Object.freeze([
      "It follows a convention-over-configuration approach integrated with the framework",
      "It is an external library that must be added via npm",
      "It only works in development mode",
      "It is deprecated in favour of a third-party alternative",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] leverages Next.js conventions to provide a seamless developer experience. It is built directly into the framework, requiring no additional setup beyond following the documented patterns.",
    type: "multiple-choice",
    difficulty: 2,
  },
  {
    stemPattern: "When should a developer choose to use [concept] in a Next.js application?",
    options: Object.freeze([
      "When they need the specific behaviour or optimisation that [concept] provides",
      "Only when building enterprise-scale applications",
      "Whenever they are unsure which approach to pick",
      "Only when working with TypeScript",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] is designed to solve a particular set of challenges in Next.js applications. Developers reach for it when those challenges align with their project requirements, not based on arbitrary scale or language constraints.",
    type: "multiple-choice",
    difficulty: 3,
  },
  {
    stemPattern: "How does [concept] integrate with the Next.js routing system?",
    options: Object.freeze([
      "It is natively supported by the file-system based router",
      "It requires a separate routing configuration file",
      "It bypasses the router entirely",
      "It only works with the pages router, not the app router",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js provides first-class support for [concept] within its file-system routing model. The integration is seamless — no extra routing configuration is needed beyond standard Next.js conventions.",
    type: "multiple-choice",
    difficulty: 2,
  },
  {
    stemPattern: "What is a common pitfall when using [concept] in Next.js?",
    options: Object.freeze([
      "Misunderstanding when [concept] runs (client vs. server)",
      "Using [concept] with too many files",
      "Forgetting to install the required npm package",
      "Calling [concept] inside a loop",
    ]),
    correctIndex: 0,
    explanationPattern:
      "The most frequent mistake with [concept] is not understanding its execution context. Because Next.js blurs the line between client and server code, developers must be clear about where [concept] runs to avoid unexpected behaviour.",
    type: "multiple-choice",
    difficulty: 3,
  },
  {
    stemPattern: "Which statement about [concept] performance in Next.js is true?",
    options: Object.freeze([
      "[concept] is optimised for both development and production builds",
      "[concept] significantly increases bundle size in all scenarios",
      "[concept] only performs well with the pages router",
      "[concept] adds unavoidable runtime overhead",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js invests heavily in ensuring [concept] is performant across both dev and production modes. Tree-shaking, code splitting, and compiler-level optimisations help keep bundle impact minimal.",
    type: "multiple-choice",
    difficulty: 2,
  },
  {
    stemPattern: "In a Next.js project, what is the recommended way to configure [concept]?",
    options: Object.freeze([
      "Follow the convention-over-configuration approach documented by Next.js",
      "Create a custom configuration file at the project root",
      "Add environment variables only",
      "Modify the webpack config directly",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js promotes convention-over-configuration. The recommended approach for [concept] is to use the standard Next.js APIs and file conventions. Custom webpack overrides should be a last resort.",
    type: "multiple-choice",
    difficulty: 1,
  },
  {
    stemPattern: "How does [concept] interact with React Server Components in Next.js?",
    options: Object.freeze([
      "It is designed to work with both server and client components where applicable",
      "It cannot be used with React Server Components at all",
      "It forces all components to be client components",
      "It only works with class components",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] is compatible with the React Server Components model. It respects the server/client boundary — some aspects run exclusively on the server, others are designed for client-side interactivity.",
    type: "multiple-choice",
    difficulty: 4,
  },
  {
    stemPattern: "What dependency or import is required to start using [concept] in a Next.js app?",
    options: Object.freeze([
      "No extra dependency — it comes built into Next.js",
      "A separate package from npm must be installed",
      "A polyfill for older browsers",
      "A specific version of React",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] is part of the Next.js core library. There is no additional package to install. Simply follow the Next.js documentation to import and use it in your project.",
    type: "multiple-choice",
    difficulty: 1,
  },
  {
    stemPattern: "Which Next.js version first introduced support for [concept]?",
    options: Object.freeze([
      "It was introduced in a stable Next.js release and documented in the changelog",
      "It has been available since Next.js 9",
      "It is still in the experimental phase",
      "It was removed and re-added in a later version",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] was shipped in a specific stable release of Next.js. The official changelog and upgrade guide document the exact version. Checking the Next.js release notes is the best way to verify version requirements.",
    type: "multiple-choice",
    difficulty: 4,
  },
  {
    stemPattern: "What is the best practice for testing [concept] in a Next.js application?",
    options: Object.freeze([
      "Use the testing utilities recommended in the Next.js documentation",
      "Skip unit tests and rely solely on end-to-end tests",
      "Mock [concept] entirely to avoid test complexity",
      "Write tests in a separate non-Next.js project",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js provides guidance on testing, and [concept] can be tested using the recommended tools like Vitest or Jest with the right configuration. Following the official docs ensures tests run reliably in the Next.js environment.",
    type: "multiple-choice",
    difficulty: 3,
  },
  {
    stemPattern: "How does [concept] handle data fetching in Next.js?",
    options: Object.freeze([
      "It integrates with the Next.js data fetching patterns (server fetch, route handlers, etc.)",
      "It only works with getServerSideProps",
      "It requires a separate data fetching library",
      "It does not support data fetching at all",
    ]),
    correctIndex: 0,
    explanationPattern:
      "[concept] works alongside Next.js data fetching strategies, including server-side fetch with caching, route handlers, and Server Actions. It is not tied to any single data fetching approach.",
    type: "multiple-choice",
    difficulty: 2,
  },
  {
    stemPattern: "What is the impact of [concept] on the Next.js build output?",
    options: Object.freeze([
      "It produces optimised output that works with static and dynamic rendering",
      "It only works with fully static exports",
      "It breaks the build if middleware is present",
      "It doubles the build time regardless of project size",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js optimises [concept] for both static generation (SSG) and server-side rendering (SSR). The build output adapts to the rendering strategy chosen for each route, ensuring compatibility across deployment models.",
    type: "multiple-choice",
    difficulty: 3,
  },
  {
    stemPattern:
      "Can [concept] be used alongside other Next.js features like Middleware or Route Handlers?",
    options: Object.freeze([
      "Yes, it is designed to compose with the full Next.js feature set",
      "No, it conflicts with Middleware",
      "Only if Middleware is disabled",
      "It depends on the specific version of Next.js",
    ]),
    correctIndex: 0,
    explanationPattern:
      "Next.js features are designed to be composable. [concept] can be used together with Middleware, Route Handlers, and other built-in features. The documentation covers common composition patterns.",
    type: "multiple-choice",
    difficulty: 2,
  },
  {
    stemPattern:
      "What should a developer do if [concept] is not behaving as expected in a Next.js app?",
    options: Object.freeze([
      "Check the Next.js documentation and verify the implementation follows the convention",
      "Immediately downgrade to an older version of Next.js",
      "Wrap everything in a try-catch block",
      "Switch to Create React App",
    ]),
    correctIndex: 0,
    explanationPattern:
      "When [concept] behaves unexpectedly, the first step is to review the official Next.js documentation for the correct usage pattern. Most issues stem from deviating from the documented conventions.",
    type: "multiple-choice",
    difficulty: 1,
  },
]);

/**
 * Deterministically pick a subset of templates based on a seed string.
 * Returns `count` templates, cycling through the pool if needed.
 */
function pickTemplates(seed: string, count: number): QuestionTemplate[] {
  const hash = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const result: QuestionTemplate[] = [];
  for (let i = 0; i < count; i++) {
    const index = (hash + i * 7 + i * i * 13) % TEMPLATE_POOL.length;
    result.push(TEMPLATE_POOL[index]);
  }
  return result;
}

/**
 * Convert a concept ID like "nextjs.server-components" into a human-readable name.
 */
function formatConceptName(conceptId: string): string {
  return conceptId
    .replace(/^[^.]+\./, "") // strip subject prefix (e.g. "nextjs.")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Fill a template's placeholders with the actual concept name.
 */
function fillTemplate(template: QuestionTemplate, conceptName: string): QuestionItem {
  return {
    stem: template.stemPattern.replace(/\[concept\]/g, conceptName),
    options: template.options.map((opt) => opt.replace(/\[concept\]/g, conceptName)),
    correctIndex: template.correctIndex,
    explanation: template.explanationPattern.replace(/\[concept\]/g, conceptName),
    type: template.type,
    difficulty: template.difficulty,
  };
}

function generateQuestions(conceptId: string, count: number): QuestionItem[] {
  const conceptName = formatConceptName(conceptId);
  const templates = pickTemplates(conceptId, Math.min(count, 5));
  return templates.map((t) => fillTemplate(t, conceptName));
}

// ── Big Pickle (Demo) Gateway ────────────────────────────────────────────────

/**
 * Demo/stub implementation of the ArtificialIntelligenceGateway.
 *
 * Generates placeholder questions from a built-in pool of templates,
 * all relating to Next.js concepts. Use this during development before
 * connecting a real AI provider.
 *
 * @remarks `isAvailable()` returns `false` by default. Set `isAvailable`
 * to `true` to indicate the provider is ready, or override in a subclass.
 */
export class BigPickleGateway implements ArtificialIntelligenceGateway {
  /** Toggle to control availability reporting. */
  public isAvailableFlag: boolean = false;

  // ── Required interface fields ───────────────────────────────────────────

  isAvailable(): boolean {
    return this.isAvailableFlag;
  }

  getProviderName(): string {
    return "Big Pickle (Demo Mode)";
  }

  // ── Question Generation ─────────────────────────────────────────────────

  async generateQuestion(request: GenerateQuestionRequest): Promise<GenerateQuestionResult> {
    const { conceptId, count } = request;
    const questions = generateQuestions(conceptId, count);
    return {
      questions,
      success: true,
    };
  }

  async generateQuestionBatch(
    request: GenerateQuestionBatchRequest,
  ): Promise<GenerateQuestionBatchResult> {
    const startTime = Date.now();
    const { subjectId, conceptIds, countPerConcept } = request;

    const concepts = conceptIds ?? [subjectId];
    const allQuestions: QuestionItem[] = [];
    const errors: { conceptId: string; errorMessage: string }[] = [];
    let totalFailed = 0;

    for (const conceptId of concepts) {
      try {
        const result = await this.generateQuestion({
          subjectId,
          conceptId,
          difficulty: request.difficultyRange.min,
          questionType: request.questionTypes[0] ?? "multiple-choice",
          count: countPerConcept,
        });
        allQuestions.push(...result.questions);
      } catch (error) {
        totalFailed++;
        errors.push({
          conceptId,
          errorMessage: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      questions: allQuestions,
      summary: {
        totalGenerated: allQuestions.length,
        totalFailed,
        conceptsCovered: concepts.length,
        durationMs,
      },
      errors,
    };
  }

  // ── Answer Evaluation ───────────────────────────────────────────────────

  async evaluateAnswer(request: EvaluateAnswerRequest): Promise<EvaluateAnswerResult> {
    const { correctIndex, selectedIndex } = request;
    const isCorrect = selectedIndex === correctIndex;

    return {
      isCorrect,
      correctIndex,
      explanation: isCorrect
        ? "Correct! Well done."
        : `The correct answer was option ${correctIndex}. Review the concept and try again.`,
      score: isCorrect ? 1 : 0,
    };
  }

  // ── Explanation Generation ──────────────────────────────────────────────

  async generateExplanation(
    request: GenerateExplanationRequest,
  ): Promise<GenerateExplanationResult> {
    const conceptName = formatConceptName(request.conceptId);

    return {
      explanation: `${conceptName} is a key concept in Next.js. ${request.correctAnswer}`,
      keyPoints: [
        `${conceptName} integrates natively with the Next.js framework.`,
        "Follow the convention-over-configuration principle for best results.",
        "Refer to the official Next.js documentation for detailed usage.",
      ],
      relatedConcepts: ["nextjs.routing", "nextjs.rendering", "nextjs.data-fetching"],
    };
  }

  // ── Hint Generation ─────────────────────────────────────────────────────

  async generateHint(request: GenerateHintRequest): Promise<GenerateHintResult> {
    const { hintLevel } = request;

    const hints: Record<number, string> = {
      1: "Think carefully about the role this plays within the Next.js architecture.",
      2: "Review the options that describe built-in behaviour vs. external dependencies. The correct answer involves a core framework feature.",
      3: `The correct option is index ${request.correctIndex}. Remember that Next.js follows a convention-over-configuration approach.`,
    };

    return {
      hint: hints[hintLevel] ?? hints[1],
      hintLevel,
    };
  }

  // ── Mission Generation ──────────────────────────────────────────────────

  async generateMission(request: GenerateMissionRequest): Promise<GenerateMissionResult> {
    const { subjectId, conceptIds, difficulty, questionCount } = request;

    const concepts = conceptIds ?? [`${subjectId}.core-concept`];
    const allQuestions: QuestionItem[] = [];

    const questionsPerConcept = Math.max(1, Math.ceil(questionCount / concepts.length));
    let remaining = questionCount;

    for (const conceptId of concepts) {
      if (remaining <= 0) break;
      const count = Math.min(questionsPerConcept, remaining);
      const questions = generateQuestions(conceptId, count);
      allQuestions.push(...questions);
      remaining -= questions.length;
    }

    return {
      questions: allQuestions.slice(0, questionCount),
      success: true,
    };
  }
}

import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionEvaluator } from "./question-evaluator";
import type { QuestionValidator } from "./question-validator";
import type { QuestionRendererConfig } from "./question-renderer-config";

export interface QuestionTypeModule {
  getType(): QuestionType;
  createEvaluator(): QuestionEvaluator;
  createValidator(): QuestionValidator;
  createRendererConfig(): QuestionRendererConfig;
}

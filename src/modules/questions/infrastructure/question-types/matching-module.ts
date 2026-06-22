import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { MatchingEvaluator } from "./matching-evaluator";
import { MatchingValidator } from "./matching-validator";

export class MatchingQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new MatchingEvaluator();
  private readonly validator = new MatchingValidator();

  getType(): QuestionType {
    return "matching";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "MatchingQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

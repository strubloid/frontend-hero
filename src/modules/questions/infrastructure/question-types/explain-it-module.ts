import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { ExplainItEvaluator } from "./explain-it-evaluator";
import { ExplainItValidator } from "./explain-it-validator";

export class ExplainItQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new ExplainItEvaluator();
  private readonly validator = new ExplainItValidator();

  getType(): QuestionType {
    return "explain-it";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "ExplainItQuestion",
      inputType: "explanation",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

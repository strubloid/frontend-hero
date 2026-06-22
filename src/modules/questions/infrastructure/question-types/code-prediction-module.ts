import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { CodePredictionEvaluator } from "./code-prediction-evaluator";
import { CodePredictionValidator } from "./code-prediction-validator";

export class CodePredictionQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new CodePredictionEvaluator();
  private readonly validator = new CodePredictionValidator();

  getType(): QuestionType {
    return "code-prediction";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "CodePredictionQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

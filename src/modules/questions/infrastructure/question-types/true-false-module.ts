import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { TrueFalseEvaluator } from "./true-false-evaluator";
import { TrueFalseValidator } from "./true-false-validator";

export class TrueFalseQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new TrueFalseEvaluator();
  private readonly validator = new TrueFalseValidator();

  getType(): QuestionType {
    return "true-false";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "TrueFalseQuestion",
      inputType: "selection",
      supportsHints: false,
      supportsPartialCredit: false,
    };
  }
}

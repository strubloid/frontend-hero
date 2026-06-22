import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { FillBlankEvaluator } from "./fill-blank-evaluator";
import { FillBlankValidator } from "./fill-blank-validator";

export class FillBlankQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new FillBlankEvaluator();
  private readonly validator = new FillBlankValidator();

  getType(): QuestionType {
    return "fill-blank";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "FillBlankQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { MultipleChoiceEvaluator } from "./multiple-choice-evaluator";
import { MultipleChoiceValidator } from "./multiple-choice-validator";

export class MultipleChoiceQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new MultipleChoiceEvaluator();
  private readonly validator = new MultipleChoiceValidator();

  getType(): QuestionType {
    return "multiple-choice";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "MultipleChoiceQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

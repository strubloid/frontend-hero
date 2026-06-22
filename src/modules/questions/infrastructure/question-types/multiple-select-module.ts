import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { MultipleSelectEvaluator } from "./multiple-select-evaluator";
import { MultipleSelectValidator } from "./multiple-select-validator";

export class MultipleSelectQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new MultipleSelectEvaluator();
  private readonly validator = new MultipleSelectValidator();

  getType(): QuestionType {
    return "multiple-select";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "MultipleSelectQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: true,
    };
  }
}

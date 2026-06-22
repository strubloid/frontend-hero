import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { OrderingEvaluator } from "./ordering-evaluator";
import { OrderingValidator } from "./ordering-validator";

export class OrderingQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new OrderingEvaluator();
  private readonly validator = new OrderingValidator();

  getType(): QuestionType {
    return "ordering";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "OrderingQuestion",
      inputType: "order",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

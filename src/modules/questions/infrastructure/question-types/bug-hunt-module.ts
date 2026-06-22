import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionEvaluator } from "@/modules/questions/domain/interfaces/question-evaluator";
import type { QuestionValidator } from "@/modules/questions/domain/interfaces/question-validator";
import type { QuestionRendererConfig } from "@/modules/questions/domain/interfaces/question-renderer-config";
import { BugHuntEvaluator } from "./bug-hunt-evaluator";
import { BugHuntValidator } from "./bug-hunt-validator";

export class BugHuntQuestionTypeModule implements QuestionTypeModule {
  private readonly evaluator = new BugHuntEvaluator();
  private readonly validator = new BugHuntValidator();

  getType(): QuestionType {
    return "bug-hunt";
  }

  createEvaluator(): QuestionEvaluator {
    return this.evaluator;
  }

  createValidator(): QuestionValidator {
    return this.validator;
  }

  createRendererConfig(): QuestionRendererConfig {
    return {
      componentName: "BugHuntQuestion",
      inputType: "selection",
      supportsHints: true,
      supportsPartialCredit: false,
    };
  }
}

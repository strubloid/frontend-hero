import { QuestionTypeRegistry } from "@/modules/questions/infrastructure/question-type-registry";
import { MultipleChoiceQuestionTypeModule } from "@/modules/questions/infrastructure/question-types/multiple-choice-module";
import { TrueFalseQuestionTypeModule } from "@/modules/questions/infrastructure/question-types/true-false-module";
import { CodePredictionQuestionTypeModule } from "@/modules/questions/infrastructure/question-types/code-prediction-module";
import { BugHuntQuestionTypeModule } from "@/modules/questions/infrastructure/question-types/bug-hunt-module";

/**
 * Create a QuestionTypeRegistry with all default question type modules registered.
 */
export function createDefaultQuestionTypeRegistry(): QuestionTypeRegistry {
  const registry = new QuestionTypeRegistry();
  registry.register(new MultipleChoiceQuestionTypeModule());
  registry.register(new TrueFalseQuestionTypeModule());
  registry.register(new CodePredictionQuestionTypeModule());
  registry.register(new BugHuntQuestionTypeModule());
  return registry;
}

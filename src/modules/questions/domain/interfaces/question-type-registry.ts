import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "./question-type-module";

export interface QuestionTypeRegistry {
  hasModule(type: string): type is QuestionType;
  getModule(type: QuestionType): QuestionTypeModule;
  getAllTypes(): QuestionType[];
}

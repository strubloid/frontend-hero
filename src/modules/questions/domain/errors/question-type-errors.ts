import type { QuestionType } from "@/modules/subjects/domain/subject";

export class DuplicateQuestionTypeRegistrationError extends Error {
  constructor(type: QuestionType) {
    super(`Question type "${type}" is already registered`);
    this.name = "DuplicateQuestionTypeRegistrationError";
  }
}

export class UnsupportedQuestionTypeError extends Error {
  constructor(type: string) {
    super(`Unsupported question type: "${type}"`);
    this.name = "UnsupportedQuestionTypeError";
  }
}

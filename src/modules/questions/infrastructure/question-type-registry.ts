import type { QuestionType } from "@/modules/subjects/domain/subject";
import type { QuestionTypeModule } from "@/modules/questions/domain/interfaces/question-type-module";
import type { QuestionTypeRegistry as QuestionTypeRegistryInterface } from "@/modules/questions/domain/interfaces/question-type-registry";
import {
  DuplicateQuestionTypeRegistrationError,
  UnsupportedQuestionTypeError,
} from "@/modules/questions/domain/errors/question-type-errors";

export class QuestionTypeRegistry implements QuestionTypeRegistryInterface {
  private readonly modules = new Map<QuestionType, QuestionTypeModule>();

  register(module: QuestionTypeModule): void {
    const type = module.getType();
    if (this.modules.has(type)) {
      throw new DuplicateQuestionTypeRegistrationError(type);
    }
    this.modules.set(type, module);
  }

  getModule(type: QuestionType): QuestionTypeModule {
    const mod = this.modules.get(type);
    if (!mod) {
      throw new UnsupportedQuestionTypeError(type);
    }
    return mod;
  }

  getAllTypes(): QuestionType[] {
    return Array.from(this.modules.keys());
  }

  hasModule(type: string): type is QuestionType {
    return this.modules.has(type as QuestionType);
  }
}

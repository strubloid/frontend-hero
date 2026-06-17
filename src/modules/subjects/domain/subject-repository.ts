import { Subject } from "./subject";

export interface SubjectRepository {
  getById(id: string): Promise<Subject | null>;
}

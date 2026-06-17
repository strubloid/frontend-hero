import { Subject } from "./subject";

export interface SubjectRepository {
  getById(id: string): Promise<Subject | null>;
  findAll(): Promise<Subject[]>;
  save(subject: Subject): Promise<void>;
  create(subject: Subject): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}

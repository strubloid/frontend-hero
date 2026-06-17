import { Subject } from "@/modules/subjects/domain/subject";
import { SubjectRepository } from "@/modules/subjects/domain/subject-repository";

/**
 * In-memory implementation of SubjectRepository.
 *
 * Stores subjects in a Map for testing and development.
 */
export class InMemorySubjectRepository implements SubjectRepository {
  private store = new Map<string, Subject>();

  constructor(subjects?: Subject[]) {
    if (subjects) {
      for (const subject of subjects) {
        this.store.set(subject.id, subject);
      }
    }
  }

  /** Convenience setter alias (used by seed code). */
  set(subject: Subject): void {
    this.store.set(subject.id, subject);
  }

  async getById(id: string): Promise<Subject | null> {
    return this.store.get(id) ?? null;
  }

  async findAll(): Promise<Subject[]> {
    return Array.from(this.store.values());
  }

  async save(subject: Subject): Promise<void> {
    this.store.set(subject.id, {
      ...subject,
      updatedAt: new Date(),
    });
  }

  async create(subject: Subject): Promise<void> {
    const existing = this.store.get(subject.id);
    if (existing) {
      throw new Error(`Subject already exists: ${subject.id}`);
    }
    this.store.set(subject.id, subject);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.store.has(id);
  }

  /** Get raw count (for assertions). */
  get count(): number {
    return this.store.size;
  }
}

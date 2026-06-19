import { GenerationJob } from "./generation-job";

export interface GenerationJobRepository {
  getById(id: string): Promise<GenerationJob | null>;
  findBySubjectId(subjectId: string): Promise<GenerationJob[]>;
  findByPlayerId(playerId: string): Promise<GenerationJob[]>;
  getActiveJobs(limit?: number): Promise<GenerationJob[]>;
  create(job: GenerationJob): Promise<GenerationJob>;
  update(job: GenerationJob): Promise<GenerationJob>;
  delete(id: string): Promise<void>;
}

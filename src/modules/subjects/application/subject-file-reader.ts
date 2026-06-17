import { readFile } from "fs/promises";
import { join } from "path";

export class SubjectFileReader {
  constructor(private readonly subjectsDir: string) {}

  async read(subjectId: string): Promise<string> {
    const filePath = join(this.subjectsDir, `${subjectId}.md`);
    try {
      return await readFile(filePath, "utf-8");
    } catch (err) {
      throw new Error(`Subject file not found: ${subjectId} (${filePath})`);
    }
  }
}

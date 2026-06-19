export class SelectSubjectResult {
  constructor(
    public readonly success: boolean,
    public readonly error: string | null,
    public readonly subjectProgressId: string | null,
  ) {}
}

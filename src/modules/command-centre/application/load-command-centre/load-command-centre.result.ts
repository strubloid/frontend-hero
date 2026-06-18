import type { CommandCentreViewModel } from "../../presentation/view-models/command-centre-view-model";

export class LoadCommandCentreResult {
  constructor(
    public readonly vm: CommandCentreViewModel | null,
    public readonly error: string | null,
  ) {}

  get isSuccess(): boolean {
    return this.vm !== null && this.error === null;
  }
}

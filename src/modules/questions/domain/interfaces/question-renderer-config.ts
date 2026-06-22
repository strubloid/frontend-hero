export interface QuestionRendererConfig {
  readonly componentName: string;
  readonly inputType: "selection" | "text" | "code" | "order" | "explanation";
  readonly supportsHints: boolean;
  readonly supportsPartialCredit: boolean;
}

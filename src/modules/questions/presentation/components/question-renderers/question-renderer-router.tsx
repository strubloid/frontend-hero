import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { CodePredictionQuestion } from "./code-prediction-question";
import { BugHuntQuestion } from "./bug-hunt-question";

interface QuestionRendererRouterProps extends QuestionRendererProps {
  type: string;
}

const typeComponentMap: Record<string, React.FC<QuestionRendererProps>> = {
  "multiple-choice": MultipleChoiceQuestion,
  "true-false": TrueFalseQuestion,
  "code-prediction": CodePredictionQuestion,
  "bug-hunt": BugHuntQuestion,
};

export function QuestionRendererRouter(props: QuestionRendererRouterProps) {
  const Component = typeComponentMap[props.type] ?? MultipleChoiceQuestion;
  return <Component {...props} />;
}

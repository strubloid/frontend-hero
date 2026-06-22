import type React from "react";
import type { QuestionRendererProps } from "./shared";
import { MultipleChoiceQuestion } from "./multiple-choice-question";
import { TrueFalseQuestion } from "./true-false-question";
import { CodePredictionQuestion } from "./code-prediction-question";
import { BugHuntQuestion } from "./bug-hunt-question";
import { ExplainItQuestion } from "./explain-it-question";
import { MultipleSelectQuestion } from "./multiple-select-question";
import { FillBlankQuestion } from "./fill-blank-question";
import { OrderingQuestion } from "./ordering-question";
import { MatchingQuestion } from "./matching-question";

interface QuestionRendererRouterProps extends QuestionRendererProps {
  type: string;
}

const typeComponentMap: Record<string, React.FC<QuestionRendererProps>> = {
  "multiple-choice": MultipleChoiceQuestion,
  "true-false": TrueFalseQuestion,
  "code-prediction": CodePredictionQuestion,
  "bug-hunt": BugHuntQuestion,
  "explain-it": ExplainItQuestion,
  "multiple-select": MultipleSelectQuestion,
  "fill-blank": FillBlankQuestion,
  ordering: OrderingQuestion,
  matching: MatchingQuestion,
};

export function QuestionRendererRouter(props: QuestionRendererRouterProps) {
  const Component = typeComponentMap[props.type] ?? MultipleChoiceQuestion;
  return <Component {...props} />;
}

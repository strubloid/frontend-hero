"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCurrentPlayerId,
  startMission as startMissionAction,
  submitAnswer as submitAnswerAction,
} from "@/app/actions/missions";
import { getCurrentUserSubject } from "@/app/actions/player-subject";
import RewardResultScreen from "@/modules/missions/presentation/components/reward-result-screen/reward-result-screen";
import { QuestionRendererRouter } from "@/modules/questions/presentation/components/question-renderers/question-renderer-router";
import type { SubmitAnswerResult } from "@/modules/missions/application/submit-answer.use-case";
import { useToast } from "@/components/toast-provider";
import styles from "./play.module.scss";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionDisplay {
  index: number;
  total: number;
  questionId: string;
  stem: string;
  options: string[];
  type: string;
  difficulty: number;
}

interface AnswerFeedback {
  isCorrect: boolean;
  correctIndex: number;
  explanation: string;
  xpAwarded: number;
  updatedMastery: number;
  score: number;
  maxScore: number;
}

type Phase =
  | { state: "loading" }
  | { state: "idle" }
  | { state: "question"; question: QuestionDisplay; missionId: string }
  | { state: "submitting" }
  | {
      state: "feedback";
      feedback: AnswerFeedback;
      question: QuestionDisplay;
      missionId: string;
    }
  | { state: "completed"; score: number; maxScore: number; result: SubmitAnswerResult | null }
  | { state: "error"; message: string };

// ---------------------------------------------------------------------------
// Wrapper with Suspense boundary
// ---------------------------------------------------------------------------

export default function PlayPage() {
  return (
    <Suspense fallback={<div className="play-loading">Loading game…</div>}>
      <PlayPageInner />
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// Inner Component
// ---------------------------------------------------------------------------

function PlayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSubjectId = searchParams.get("subject");
  const [subjectId, setSubjectId] = useState<string | null>(requestedSubjectId);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>({ state: "loading" });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { addToast } = useToast();
  const xpToastRef = useRef(false);
  const lastSubmitResultRef = useRef<SubmitAnswerResult | null>(null);

  // On mount: check for active mission
  const checkActiveMission = useCallback(async () => {
    try {
      const currentPlayerId = await getCurrentPlayerId();
      setPlayerId(currentPlayerId);

      if (!subjectId) {
        const currentSubject = await getCurrentUserSubject();
        if (!currentSubject?.subjectId) {
          router.push("/subjects");
          return;
        }
        setSubjectId(currentSubject.subjectId);
      }

      const res = await fetch(`/api/missions/current`);
      if (!res.ok) {
        setPhase({ state: "error", message: "Failed to reach server" });
        return;
      }
      const data = await res.json();

      if (data.hasActiveMission && data.currentQuestion?.stem && data.mission?.id) {
        setPhase({
          state: "question",
          question: data.currentQuestion,
          missionId: data.mission.id,
        });
      } else {
        setPhase({ state: "idle" });
      }
    } catch {
      setPhase({ state: "error", message: "Connection error" });
    }
  }, [router, subjectId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkActiveMission();
  }, [checkActiveMission]);

  // Toast for XP feedback
  useEffect(() => {
    if (phase.state === "feedback" && phase.feedback.xpAwarded > 0 && !xpToastRef.current) {
      xpToastRef.current = true;
      addToast({
        type: phase.feedback.isCorrect ? "info" : "error",
        title: phase.feedback.isCorrect ? `+${phase.feedback.xpAwarded} XP` : "Incorrect",
        description: phase.feedback.isCorrect
          ? `Mastery: ${Math.round(phase.feedback.updatedMastery * 100)}%`
          : "Review the explanation and try again.",
        duration: 2500,
      });
    } else if (phase.state !== "feedback") {
      xpToastRef.current = false;
    }
  }, [phase, addToast]);

  // Start a new mission
  const handleStart = async () => {
    setPhase({ state: "loading" });
    try {
      const currentPlayerId = playerId ?? (await getCurrentPlayerId());
      setPlayerId(currentPlayerId);

      if (!subjectId) {
        setPhase({
          state: "error",
          message: "Select a subject before starting a mission.",
        });
        return;
      }

      const result = await startMissionAction({
        playerId: currentPlayerId,
        subjectId,
        type: "encounter",
      });

      // Fetch the next question
      const res = await fetch(`/api/missions/current`);
      const data = await res.json();

      if (result.success) {
        // result is narrowed to the success variant
        if (data.currentQuestion?.stem && (data.mission?.id || result.mission.id)) {
          const missionId = data.mission?.id ?? result.mission.id;
          setPhase({
            state: "question",
            question: data.currentQuestion,
            missionId,
          });
        } else {
          setPhase({
            state: "error",
            message: "Mission started but no question available.",
          });
        }
      } else {
        setPhase({
          state: "error",
          message: `Cannot start: ${result.reason} (level ${result.level}: ${result.levelTitle} has ${result.totalApproved} questions)`,
        });
      }
    } catch (error) {
      setPhase({
        state: "error",
        message: error instanceof Error ? error.message : "Failed to start",
      });
    }
  };

  // Submit an answer
  const handleAnswer = async () => {
    if (phase.state !== "question" || selectedIndex === null) return;

    const { missionId, question } = phase;
    setPhase({ state: "submitting" });
    try {
      const currentPlayerId = playerId ?? (await getCurrentPlayerId());
      setPlayerId(currentPlayerId);

      const result = await submitAnswerAction({
        missionId,
        playerId: currentPlayerId,
        questionId: question.questionId,
        selectedIndex,
        timeSpentSeconds: 0,
      });

      setPhase({
        state: "feedback",
        feedback: result,
        question,
        missionId,
      });
    } catch (error) {
      setPhase({
        state: "error",
        message: error instanceof Error ? error.message : "Failed to submit",
      });
    }
  };

  // Continue to next question
  const handleContinue = async () => {
    setPhase({ state: "loading" });
    try {
      const currentPlayerId = playerId ?? (await getCurrentPlayerId());
      setPlayerId(currentPlayerId);

      const res = await fetch(`/api/missions/current`);
      const data = await res.json();

      if (data.mission?.status === "completed") {
        setPhase({
          state: "completed",
          score: data.mission.score,
          maxScore: data.mission.maxScore,
          result: lastSubmitResultRef.current,
        });
      } else if (data.currentQuestion?.stem && data.mission?.id) {
        setSelectedIndex(null);
        setPhase({
          state: "question",
          question: data.currentQuestion,
          missionId: data.mission.id,
        });
      } else {
        setPhase({ state: "idle" });
      }
    } catch {
      setPhase({ state: "idle" });
    }
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <main className={styles.page}>
      <div className={styles.headerBar}>
        <button
          onClick={() => router.push("/subjects")}
          className={styles.backButton}
          aria-label="Back to subjects"
        >
          &larr; Subjects
        </button>
        <h1 className={styles.subjectTitle}>{subjectId === "nextjs" ? "Next.js" : subjectId}</h1>
      </div>

      <PhaseRenderer
        phase={phase}
        selectedIndex={selectedIndex}
        onSelect={setSelectedIndex}
        onStart={handleStart}
        onSubmit={handleAnswer}
        onContinue={handleContinue}
        onReturnToCommandCentre={() => router.push("/")}
      />
    </main>
  );
}

// ---------------------------------------------------------------------------
// Phase renderer
// ---------------------------------------------------------------------------

function PhaseRenderer(props: {
  phase: Phase;
  selectedIndex: number | null;
  onSelect: (i: number) => void;
  onStart: () => void;
  onSubmit: () => void;
  onContinue: () => void;
  onReturnToCommandCentre: () => void;
}) {
  const { phase } = props;

  switch (phase.state) {
    case "loading":
      return <p className={styles.loadingText}>Loading…</p>;

    case "idle":
      return (
        <div>
          <p className={styles.idleDescription}>
            No active mission. Start a new challenge to begin.
          </p>
          <button onClick={props.onStart} className={styles.button}>
            Start Mission
          </button>
        </div>
      );

    case "question": {
      const q = phase.question;
      const typeLabel =
        q.type === "code-prediction"
          ? "⧩ Predict the Output"
          : q.type === "bug-hunt"
            ? "🐛 Find the Bug"
            : q.type === "true-false"
              ? "☑ True or False"
              : q.type === "explain-it"
                ? "✍ Explain It"
                : q.type?.replace("multiple-choice", "Multiple Choice");

      const typeColors: Record<string, { bg: string; color: string }> = {
        "code-prediction": { bg: "rgba(147, 51, 234, 0.2)", color: "#c084fc" },
        "true-false": { bg: "rgba(59, 130, 246, 0.2)", color: "#93c5fd" },
        "bug-hunt": { bg: "rgba(255, 107, 53, 0.2)", color: "#ff6b35" },
        "explain-it": { bg: "rgba(34, 197, 94, 0.12)", color: "#86efac" },
      };
      const typeColor = typeColors[q.type] ?? { bg: "rgba(34, 197, 94, 0.12)", color: "#86efac" };

      return (
        <div>
          <div className={styles.questionInfo}>
            <span>
              Question {q.index + 1} of {q.total}
            </span>
            <span className={styles.badgeRow}>
              <span
                className={styles.typeBadge}
                style={{ background: typeColor.bg, color: typeColor.color }}
              >
                {typeLabel}
              </span>
              <span>Difficulty: {q.difficulty}/5</span>
            </span>
          </div>

          <QuestionRendererRouter
            type={q.type}
            stem={q.stem}
            options={q.options}
            selectedIndex={props.selectedIndex}
            disabled={false}
            onSelect={props.onSelect}
          />

          <button
            onClick={props.onSubmit}
            disabled={props.selectedIndex === null}
            className={`${styles.submitButton} ${props.selectedIndex === null ? styles.submitButtonDisabled : ""}`}
          >
            Submit Answer
          </button>
        </div>
      );
    }

    case "submitting":
      return <p className={styles.submittingText}>Evaluating…</p>;

    case "feedback": {
      const { feedback, question } = phase;
      return (
        <div>
          <div
            className={`${styles.feedbackBox} ${feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackIncorrect}`}
          >
            <p
              className={`${styles.feedbackHeader} ${feedback.isCorrect ? styles.feedbackHeaderCorrect : styles.feedbackHeaderIncorrect}`}
            >
              {feedback.isCorrect ? " Correct!" : " Incorrect"}
            </p>
            <p className={styles.feedbackExplanation}>{feedback.explanation}</p>
          </div>

          <div className={styles.correctAnswerRow}>
            <p className={styles.correctAnswerLabel}>
              Correct answer:{" "}
              <span className={styles.correctAnswerValue}>
                {question.options[feedback.correctIndex]}
              </span>
            </p>
          </div>

          <div className={styles.statsBar}>
            <span className={styles.statsItem}>
              XP: <span className={styles.statsValue}>+{feedback.xpAwarded}</span>
            </span>
            <span className={styles.statsItem}>
              Score: {feedback.score}/{feedback.maxScore}
            </span>
            <span className={styles.statsItem}>
              Mastery: {Math.round(feedback.updatedMastery * 100)}%
            </span>
          </div>

          <button onClick={props.onContinue} className={styles.button}>
            Continue
          </button>
        </div>
      );
    }

    case "completed":
      return (
        <RewardResultScreen
          score={phase.score}
          maxScore={phase.maxScore}
          xpAwarded={phase.result?.xpAwarded}
          masteryGained={phase.result?.updatedMastery}
          subjectProgress={phase.result?.subjectProgress ?? null}
          questProgress={phase.result?.questProgress ?? []}
          onNewMission={props.onStart}
          onReturnToCommandCentre={props.onReturnToCommandCentre}
        />
      );

    case "error":
      return (
        <div>
          <p className={styles.errorText}>Error: {phase.message}</p>
          <button onClick={() => window.location.reload()} className={styles.button}>
            Retry
          </button>
        </div>
      );
  }
}

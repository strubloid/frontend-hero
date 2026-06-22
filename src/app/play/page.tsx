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

      const res = await fetch(
        `/api/missions/current?playerId=${encodeURIComponent(currentPlayerId)}`,
      );
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
      const res = await fetch(
        `/api/missions/current?playerId=${encodeURIComponent(currentPlayerId)}`,
      );
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

      const res = await fetch(
        `/api/missions/current?playerId=${encodeURIComponent(currentPlayerId)}`,
      );
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
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "clamp(1.25rem, 4vw, 3rem) clamp(0.75rem, 3vw, 1rem)",
        fontFamily: "system-ui, sans-serif",
        color: "#e0e0e0",
        background: "#121212",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => router.push("/subjects")}
          style={{
            background: "none",
            border: "1px solid #333",
            color: "#888",
            padding: "0.3rem 0.7rem",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: "0.8rem",
          }}
          aria-label="Back to subjects"
        >
          &larr; Subjects
        </button>
        <h1 style={{ fontSize: "1.75rem", color: "#fff", margin: 0 }}>
          {subjectId === "nextjs" ? "Next.js" : subjectId}
        </h1>
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
      return <p style={{ color: "#888" }}>Loading…</p>;

    case "idle":
      return (
        <div>
          <p style={{ marginBottom: "1rem", color: "#aaa" }}>
            No active mission. Start a new challenge to begin.
          </p>
          <button onClick={props.onStart} style={buttonStyle}>
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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.35rem 0.75rem",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            <span>
              Question {q.index + 1} of {q.total}
            </span>
            <span style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 6,
                  background: typeColor.bg,
                  color: typeColor.color,
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
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
            style={{
              ...buttonStyle,
              marginTop: "1.25rem",
              opacity: props.selectedIndex === null ? 0.4 : 1,
            }}
          >
            Submit Answer
          </button>
        </div>
      );
    }

    case "submitting":
      return <p style={{ color: "#888" }}>Evaluating…</p>;

    case "feedback": {
      const { feedback, question } = phase;
      return (
        <div>
          <div
            style={{
              padding: "1rem",
              borderRadius: 8,
              background: feedback.isCorrect ? "#0d2818" : "#2a0d0d",
              border: `1px solid ${feedback.isCorrect ? "#2ecc71" : "#e74c3c"}`,
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: feedback.isCorrect ? "#2ecc71" : "#e74c3c",
                marginBottom: "0.5rem",
              }}
            >
              {feedback.isCorrect ? " Correct!" : " Incorrect"}
            </p>
            <p style={{ color: "#ccc", lineHeight: 1.5 }}>{feedback.explanation}</p>
          </div>

          <div style={{ marginBottom: "1rem" }}>
            <p style={{ color: "#aaa", fontSize: "0.9rem" }}>
              Correct answer:{" "}
              <span style={{ color: "#2ecc71", fontWeight: 600 }}>
                {question.options[feedback.correctIndex]}
              </span>
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "1.5rem",
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              background: "#1a1a1a",
              borderRadius: 6,
            }}
          >
            <span style={{ color: "#aaa" }}>
              XP: <span style={{ color: "#f1c40f" }}>+{feedback.xpAwarded}</span>
            </span>
            <span style={{ color: "#aaa" }}>
              Score: {feedback.score}/{feedback.maxScore}
            </span>
            <span style={{ color: "#aaa" }}>
              Mastery: {Math.round(feedback.updatedMastery * 100)}%
            </span>
          </div>

          <button onClick={props.onContinue} style={buttonStyle}>
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
          <p style={{ color: "#e74c3c", marginBottom: "1rem" }}>Error: {phase.message}</p>
          <button onClick={() => window.location.reload()} style={buttonStyle}>
            Retry
          </button>
        </div>
      );
  }
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const buttonStyle: React.CSSProperties = {
  padding: "0.65rem 1.5rem",
  fontSize: "1rem",
  fontWeight: 500,
  border: "none",
  borderRadius: 6,
  cursor: "pointer",
  background: "#4a9eff",
  color: "#fff",
  transition: "opacity 0.15s",
  width: "100%",
};

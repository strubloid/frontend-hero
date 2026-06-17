"use client";

import { Suspense } from "react";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  startMission as startMissionAction,
  submitAnswer as submitAnswerAction,
} from "@/app/actions/missions";

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
  | { state: "completed"; score: number; maxScore: number }
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
  const subjectId = searchParams.get("subject") ?? "nextjs";
  const [phase, setPhase] = useState<Phase>({ state: "loading" });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // On mount: check for active mission
  const checkActiveMission = useCallback(async () => {
    try {
      const res = await fetch("/api/missions/current");
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
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    checkActiveMission();
  }, [checkActiveMission]);

  // Start a new mission
  const handleStart = async () => {
    setPhase({ state: "loading" });
    try {
      const result = await startMissionAction({
        playerId: "default-player",
        subjectId,
        type: "encounter",
      });

      // Fetch the next question
      const res = await fetch("/api/missions/current");
      const data = await res.json();

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
      const result = await submitAnswerAction({
        missionId,
        playerId: "default-player",
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
      const res = await fetch("/api/missions/current");
      const data = await res.json();

      if (data.mission?.status === "completed") {
        setPhase({
          state: "completed",
          score: data.mission.score,
          maxScore: data.mission.maxScore,
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
        padding: "3rem 1rem",
        fontFamily: "system-ui, sans-serif",
        color: "#e0e0e0",
        background: "#121212",
        minHeight: "100vh",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
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
      return (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#888",
              fontSize: "0.85rem",
              marginBottom: "0.5rem",
            }}
          >
            <span>
              Question {q.index + 1} of {q.total}
            </span>
            <span>Difficulty: {q.difficulty}/5</span>
          </div>
          <h2
            style={{
              fontSize: "1.15rem",
              marginBottom: "1.25rem",
              lineHeight: 1.5,
              color: "#fff",
            }}
          >
            {q.stem}
          </h2>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => props.onSelect(idx)}
                style={{
                  ...optionButtonStyle,
                  border: props.selectedIndex === idx ? "2px solid #4a9eff" : "2px solid #333",
                  background: props.selectedIndex === idx ? "#1a2a40" : "#1e1e1e",
                }}
              >
                {opt}
              </button>
            ))}
          </div>
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
        <div>
          <h2 style={{ color: "#2ecc71", marginBottom: "1rem" }}>Mission Complete!</h2>
          <p style={{ color: "#aaa" }}>
            Final score: {phase.score}/{phase.maxScore}
          </p>
          <button onClick={props.onStart} style={{ ...buttonStyle, marginTop: "1rem" }}>
            New Mission
          </button>
        </div>
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
};

const optionButtonStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.95rem",
  textAlign: "left",
  borderRadius: 6,
  cursor: "pointer",
  color: "#e0e0e0",
  transition: "border 0.15s, background 0.15s",
};

"use client";

import { useState } from "react";

interface OnboardingFlowProps {
  hasStarted: boolean;
  onDismiss: () => void;
}

type Step = "welcome" | "map-intro" | "first-mission" | "done";

const STEPS: Step[] = ["welcome", "map-intro", "first-mission", "done"];

export function OnboardingFlow({ hasStarted, onDismiss }: OnboardingFlowProps) {
  const [step, setStep] = useState<number>(0);

  // Check inline instead of in an effect
  const dismissed =
    hasStarted || typeof window !== "undefined"
      ? localStorage.getItem("hermes-onboarding-dismissed") === "true"
      : false;

  const handleNext = () => {
    if (step + 1 >= STEPS.length) {
      localStorage.setItem("hermes-onboarding-dismissed", "true");
      onDismiss();
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hermes-onboarding-dismissed", "true");
    onDismiss();
  };

  if (dismissed) return null;

  const content = CONTENTS[step];

  return (
    <div className="onboarding-overlay">
      <div className="onboarding-backdrop" />
      <div className="onboarding-card">
        <span className="onboarding-icon">{content.icon}</span>
        <h2 className="onboarding-title">{content.title}</h2>
        <p className="onboarding-body">{content.body}</p>
        <div className="onboarding-actions">
          <button className="onboarding-btn" onClick={handleNext}>
            {step >= STEPS.length - 1 ? "Begin!" : "Next"}
          </button>
          <button className="onboarding-skip" onClick={handleSkip}>
            Skip intro
          </button>
        </div>
        <div className="onboarding-dots">
          {STEPS.slice(0, -1).map((_, i) => (
            <span key={i} className={`onboarding-dot ${i === step ? "active" : ""}`} />
          ))}
        </div>
      </div>
      <style>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .onboarding-backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.7);
        }
        .onboarding-card {
          position: relative;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 2.5rem;
          max-width: 440px;
          text-align: center;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }
        .onboarding-icon { font-size: 3.5rem; }
        .onboarding-title {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
          color: #e2e8f0;
        }
        .onboarding-body {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.6;
        }
        .onboarding-actions {
          display: flex;
          gap: 0.75rem;
          margin-top: 0.5rem;
        }
        .onboarding-btn {
          padding: 0.6rem 1.5rem;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
        }
        .onboarding-btn:hover { background: #2563eb; }
        .onboarding-skip {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          cursor: pointer;
          padding: 0.6rem 1rem;
        }
        .onboarding-skip:hover { color: #94a3b8; }
        .onboarding-dots {
          display: flex;
          gap: 0.4rem;
        }
        .onboarding-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #334155;
        }
        .onboarding-dot.active { background: #3b82f6; }
      `}</style>
    </div>
  );
}

const CONTENTS: Record<number, { icon: string; title: string; body: string }> = {
  0: {
    icon: "🏰",
    title: "Welcome to the Frontend Realms",
    body: "You stand at the threshold of a vast frontier — a world built from code and imagination. Here, every concept is a territory, every framework a kingdom, and every mission a step toward mastery.",
  },
  1: {
    icon: "🗺",
    title: "The World Map",
    body: "Each region on the map represents a domain of knowledge — JavaScript, React, Next.js, and more. Click a region to see what lies within, then venture forth to conquer its concepts.",
  },
  2: {
    icon: "⚔",
    title: "Your First Mission",
    body: "Start with the first available region. Complete encounters, answer questions, and earn XP. As you learn, new regions unlock. Before long, the entire map will be yours.",
  },
};

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useToast } from "@/components/toast-provider";
import styles from "./boss-encounter.module.scss";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

interface BossState {
  bossId: string;
  name: string;
  title: string;
  narrativeIntro: string;
  totalPhases: number;
  currentPhaseIndex: number;
  completedPhaseIds: string[];
  phaseName: string;
  phasePrompt: string;
  phaseDifficulty: number;
  question: QuestionDisplay | null;
  status: "active" | "defeated" | "retreat" | "victory";
  bossDefeated: boolean;
}

interface QuestionDisplay {
  questionId: string;
  stem: string;
  options: string[];
  type: string;
}

type Phase =
  | { state: "loading" }
  | { state: "intro"; boss: BossState }
  | { state: "question"; boss: BossState }
  | {
      state: "feedback";
      boss: BossState;
      isCorrect: boolean;
      explanation: string;
      xpAwarded: number;
    }
  | { state: "victory"; boss: BossState; score: number }
  | { state: "defeat"; boss: BossState }
  | { state: "error"; message: string };

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------

export default function BossEncounterPage() {
  return (
    <Suspense fallback={<div className="boss-loading">Loading boss encounter…</div>}>
      <BossEncounterInner />
    </Suspense>
  );
}

function BossEncounterInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const regionId = searchParams.get("region") ?? "nextjs";
  const { addToast } = useToast();
  const toastShown = useRef(false);

  const [phase, setPhase] = useState<Phase>({ state: "loading" });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [bossHealth, setBossHealth] = useState(100);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/boss/state?region=${encodeURIComponent(regionId)}`);
        if (!res.ok) {
          setPhase({ state: "error", message: "No boss encounter available for this region." });
          return;
        }
        const data: BossState = await res.json();
        if (data.status === "defeated" || data.status === "victory") {
          setPhase({ state: "defeat", boss: data });
          return;
        }
        if (data.status === "retreat") {
          setPhase({ state: "victory", boss: data, score: 0 });
          return;
        }
        if (data.question) {
          setPhase({ state: "question", boss: data });
        } else {
          setPhase({ state: "intro", boss: data });
        }
      } catch {
        setPhase({ state: "error", message: "Failed to load boss encounter." });
      }
    }
    load();
  }, [regionId]);

  const handleStart = async () => {
    setPhase({ state: "loading" });
    try {
      const res = await fetch(`/api/boss/start?region=${encodeURIComponent(regionId)}`, {
        method: "POST",
      });
      const data: BossState = await res.json();
      if (data.question) {
        setPhase({ state: "question", boss: data });
      } else {
        setPhase({ state: "intro", boss: data });
      }
    } catch {
      setPhase({ state: "error", message: "Failed to start boss encounter." });
    }
  };

  const handleAnswer = async () => {
    if (phase.state !== "question" || selectedIndex === null) return;
    const { boss, state } = phase;
    setPhase({ state: "loading" });
    try {
      const res = await fetch("/api/boss/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bossId: boss.bossId,
          questionId: boss.question?.questionId,
          selectedIndex,
          regionId,
        }),
      });
      const result = await res.json();

      setBossHealth(result.newBossHealth ?? bossHealth);
      setPlayerHealth(result.newPlayerHealth ?? playerHealth);

      setPhase({
        state: "feedback",
        boss: result.bossState,
        isCorrect: result.isCorrect,
        explanation: result.explanation,
        xpAwarded: result.xpAwarded ?? 0,
      });

      if (!toastShown.current && result.xpAwarded > 0) {
        toastShown.current = true;
        addToast({
          type: result.isCorrect ? "info" : "error",
          title: result.isCorrect ? `+${result.xpAwarded} XP` : "Boss strikes back!",
          duration: 2000,
        });
      }

      if (result.bossState?.status === "victory") {
        setTimeout(
          () => setPhase({ state: "victory", boss: result.bossState, score: result.score ?? 0 }),
          800,
        );
        if (!toastShown.current) {
          toastShown.current = true;
          addToast({
            type: "boss-defeat",
            title: "Boss Defeated!",
            description: "Congratulations, champion!",
          });
        }
      } else if (result.bossState?.status === "defeated") {
        setTimeout(() => setPhase({ state: "defeat", boss: result.bossState }), 800);
      } else if (result.bossState?.question) {
        setTimeout(() => {
          setSelectedIndex(null);
          setPhase({ state: "question", boss: result.bossState });
        }, 1500);
      }
    } catch {
      setPhase({ state: "error", message: "Failed to submit answer." });
    }
  };

  const handleRetreat = async () => {
    try {
      await fetch(`/api/boss/retreat?region=${encodeURIComponent(regionId)}`, { method: "POST" });
      router.push("/world-map");
    } catch {
      router.push("/world-map");
    }
  };

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  const bossBarColor = bossHealth > 50 ? "#e74c3c" : bossHealth > 25 ? "#e67e22" : "#c0392b";
  const playerBarColor = playerHealth > 50 ? "#2ecc71" : playerHealth > 25 ? "#f39c12" : "#e74c3c";

  return (
    <main className="boss-page">
      {phase.state === "loading" && <p className={styles.loadingText}>Loading boss encounter…</p>}

      {phase.state === "intro" && (
        <>
          <BossHeader regionId={regionId} />
          <div className="boss-intro-card">
            <div className="boss-intro-icon">🐉</div>
            <h2 className={styles.bossName}>{phase.boss.name}</h2>
            <p className={styles.bossSubtitle}>{phase.boss.title}</p>
            <p className="boss-intro-narrative">{phase.boss.narrativeIntro}</p>
            <p className={styles.phaseCount}>{phase.boss.totalPhases} phases</p>
            <button className="boss-btn primary" onClick={handleStart}>
              Begin Battle
            </button>
            <button className={`boss-btn danger ${styles.retreatOutline}`} onClick={handleRetreat}>
              Retreat
            </button>
          </div>
        </>
      )}

      {phase.state === "question" && (
        <>
          <BossHeader regionId={regionId} />
          <HealthBars bossHealth={bossHealth} playerHealth={playerHealth} />
          <PhaseIndicators
            total={phase.boss.totalPhases}
            current={phase.boss.currentPhaseIndex}
            completed={phase.boss.completedPhaseIds}
          />
          <div className="boss-phase-prompt">
            <strong>Phase {phase.boss.currentPhaseIndex + 1}:</strong> {phase.boss.phasePrompt}
          </div>
          {phase.boss.question && (
            <div className="boss-question-card">
              <p className="boss-question-stem">{phase.boss.question.stem}</p>
              {phase.boss.question.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`boss-option ${selectedIndex === idx ? "selected" : ""}`}
                  onClick={() => setSelectedIndex(idx)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
          <div className="boss-actions">
            <button
              className="boss-btn primary"
              onClick={handleAnswer}
              disabled={selectedIndex === null}
            >
              Strike!
            </button>
            <button className="boss-btn danger" onClick={handleRetreat}>
              Retreat
            </button>
          </div>
        </>
      )}

      {phase.state === "feedback" && (
        <>
          <BossHeader regionId={regionId} />
          <HealthBars bossHealth={bossHealth} playerHealth={playerHealth} />
          <div className={`boss-feedback-card ${phase.isCorrect ? "correct" : "wrong"}`}>
            <p
              className="boss-feedback-label"
              style={{ color: phase.isCorrect ? "#2ecc71" : "#e74c3c" }}
            >
              {phase.isCorrect ? "⚔ Hit!" : "💥 Boss counters!"}
            </p>
            <p className="boss-feedback-text">{phase.explanation}</p>
          </div>
        </>
      )}

      {phase.state === "victory" && (
        <>
          <BossHeader regionId={regionId} />
          <div className="boss-result-card victory">
            <div className="boss-result-icon">👑</div>
            <h2 className="boss-result-title victory">Boss Defeated!</h2>
            <p className="boss-result-desc">{phase.boss.narrativeIntro}</p>
            <p className={styles.victoryScore}>Score: {phase.score}</p>
            <button className="boss-btn success" onClick={() => router.push("/world-map")}>
              Return to Map
            </button>
          </div>
        </>
      )}

      {phase.state === "defeat" && (
        <>
          <BossHeader regionId={regionId} />
          <div className="boss-result-card defeat">
            <div className="boss-result-icon">💀</div>
            <h2 className="boss-result-title defeat">Defeated</h2>
            <p className="boss-result-desc">
              The boss was too strong. Level up your mastery and try again.
            </p>
            <button className="boss-btn primary" onClick={handleStart}>
              Try Again
            </button>
            <button className="boss-btn danger" onClick={handleRetreat}>
              Retreat
            </button>
          </div>
        </>
      )}

      {phase.state === "error" && (
        <div className={styles.errorContainer}>
          <p className={styles.errorMessage}>{phase.message}</p>
          <button className="boss-btn primary" onClick={() => router.push("/world-map")}>
            Back to Map
          </button>
        </div>
      )}
    </main>
  );
}

// -----------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------

function BossHeader({ regionId }: { regionId: string }) {
  const router = useRouter();
  return (
    <div className="boss-header">
      <button className="boss-back-btn" onClick={() => router.push("/world-map")}>
        ← Map
      </button>
      <h1 className="boss-title">Boss: {regionId}</h1>
    </div>
  );
}

function HealthBars({ bossHealth, playerHealth }: { bossHealth: number; playerHealth: number }) {
  const bossColor = bossHealth > 50 ? "#e74c3c" : bossHealth > 25 ? "#e67e22" : "#c0392b";
  const playerColor = playerHealth > 50 ? "#2ecc71" : playerHealth > 25 ? "#f39c12" : "#e74c3c";

  return (
    <div className="health-section">
      <div className="health-row">
        <span className="health-label">Boss</span>
        <div className="health-bar-bg">
          <div
            className={`health-bar-fill ${bossHealth <= 25 ? "healthCritical" : ""}`}
            style={{ width: `${bossHealth}%`, background: bossColor }}
          />
        </div>
        <span className="health-text">{Math.round(bossHealth)}%</span>
      </div>
      <div className="health-row">
        <span className="health-label">You</span>
        <div className="health-bar-bg">
          <div
            className="health-bar-fill"
            style={{ width: `${playerHealth}%`, background: playerColor }}
          />
        </div>
        <span className="health-text">{Math.round(playerHealth)}%</span>
      </div>
    </div>
  );
}

function PhaseIndicators({
  total,
  current,
  completed,
}: {
  total: number;
  current: number;
  completed: string[];
}) {
  return (
    <div className="phase-indicators">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`phase-dot ${completed.length > i ? "done" : i === current ? "active" : ""}`}
        >
          {i + 1}
        </div>
      ))}
    </div>
  );
}

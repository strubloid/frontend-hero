"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useToast } from "@/components/toast-provider";

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
  | { state: "feedback"; boss: BossState; isCorrect: boolean; explanation: string; xpAwarded: number }
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
        setTimeout(() => setPhase({ state: "victory", boss: result.bossState, score: result.score ?? 0 }), 800);
        if (!toastShown.current) {
          toastShown.current = true;
          addToast({ type: "boss-defeat", title: "Boss Defeated!", description: "Congratulations, champion!" });
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
      <style>{`
        .boss-page {
          max-width: 720px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: system-ui, sans-serif;
          color: #e0e0e0;
          background: #121212;
          min-height: 100vh;
        }
        .boss-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
        .boss-back-btn {
          background: none; border: 1px solid #333; color: #888;
          padding: 0.3rem 0.7rem; border-radius: 4px; cursor: pointer;
          font-size: 0.8rem;
        }
        .boss-back-btn:hover { border-color: #555; color: #ccc; }
        .boss-title { font-size: 1.5rem; font-weight: 700; color: #fff; margin: 0; }

        /* Health bars */
        .health-section { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem; }
        .health-row { display: flex; align-items: center; gap: 0.75rem; }
        .health-label { width: 60px; font-size: 0.8rem; font-weight: 600; color: #94a3b8; text-align: right; }
        .health-bar-bg {
          flex: 1; height: 20px; background: #1e1e1e; border-radius: 10px;
          overflow: hidden; position: relative;
        }
        .health-bar-fill {
          height: 100%; border-radius: 10px; transition: width 0.5s ease;
        }
        .health-text { font-size: 0.75rem; color: #94a3b8; min-width: 40px; text-align: center; }

        /* Phase indicators */
        .phase-indicators { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; justify-content: center; }
        .phase-dot {
          width: 32px; height: 32px; border-radius: 50%; display: flex;
          align-items: center; justify-content: center; font-size: 0.7rem;
          font-weight: 600; border: 2px solid #333; background: #1e1e1e; color: #64748b;
          transition: all 0.3s;
        }
        .phase-dot.done { border-color: #2ecc71; background: #0d2818; color: #2ecc71; }
        .phase-dot.active { border-color: #4a9eff; background: #1a2a40; color: #4a9eff; transform: scale(1.15); }

        /* Intro card */
        .boss-intro-card {
          background: #1e293b; border: 1px solid #334155; border-radius: 16px;
          padding: 2rem; text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 1rem;
        }
        .boss-intro-icon { font-size: 4rem; }
        .boss-intro-narrative { color: #94a3b8; font-size: 0.9rem; line-height: 1.6; max-width: 480px; }
        .boss-phase-prompt {
          background: #1a1a2e; border: 1px solid #333; border-radius: 12px;
          padding: 1.25rem; margin-bottom: 1rem; color: #cbd5e1; font-size: 0.95rem;
          line-height: 1.5;
        }
        .boss-phase-prompt strong { color: #e2e8f0; }

        /* Question */
        .boss-question-card {
          background: #1a1a2e; border: 1px solid #333; border-radius: 12px;
          padding: 1.5rem; margin-bottom: 1rem;
        }
        .boss-question-stem { font-size: 1.05rem; color: #fff; line-height: 1.5; margin-bottom: 1rem; }
        .boss-option {
          display: block; width: 100%; padding: 0.75rem 1rem; margin-bottom: 0.5rem;
          background: #1e1e1e; border: 2px solid #333; border-radius: 8px;
          color: #e0e0e0; font-size: 0.9rem; text-align: left; cursor: pointer;
          transition: border 0.15s, background 0.15s;
        }
        .boss-option:hover { border-color: #555; }
        .boss-option.selected { border-color: #4a9eff; background: #1a2a40; }

        /* Feedback */
        .boss-feedback-card {
          padding: 1.25rem; border-radius: 12px; margin-bottom: 1rem;
        }
        .boss-feedback-card.correct { background: #0d2818; border: 1px solid #2ecc71; }
        .boss-feedback-card.wrong { background: #2a0d0d; border: 1px solid #e74c3c; }
        .boss-feedback-label { font-weight: 700; font-size: 1rem; margin-bottom: 0.5rem; }
        .boss-feedback-text { color: #cbd5e1; line-height: 1.5; font-size: 0.9rem; }

        /* Victory / Defeat */
        .boss-result-card {
          text-align: center; padding: 3rem 2rem; border-radius: 20px;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
        }
        .boss-result-card.victory { background: #0d2818; border: 2px solid #2ecc71; }
        .boss-result-card.defeat { background: #2a0d0d; border: 2px solid #e74c3c; }
        .boss-result-icon { font-size: 4rem; }
        .boss-result-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .boss-result-title.victory { color: #2ecc71; }
        .boss-result-title.defeat { color: #e74c3c; }
        .boss-result-desc { color: #94a3b8; max-width: 400px; line-height: 1.6; }

        /* Buttons */
        .boss-btn {
          padding: 0.65rem 1.5rem; font-size: 0.9rem; font-weight: 600;
          border: none; border-radius: 8px; cursor: pointer; color: #fff;
          transition: opacity 0.15s;
        }
        .boss-btn.primary { background: #4a9eff; }
        .boss-btn.primary:hover { opacity: 0.85; }
        .boss-btn.danger { background: #e74c3c; }
        .boss-btn.danger:hover { opacity: 0.85; }
        .boss-btn.success { background: #2ecc71; }
        .boss-btn.success:hover { opacity: 0.85; }
        .boss-btn:disabled { opacity: 0.4; cursor: default; }
        .boss-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
      `}</style>

      {phase.state === "loading" && (
        <p style={{ color: "#888", textAlign: "center", marginTop: "3rem" }}>Loading boss encounter…</p>
      )}

      {phase.state === "intro" && (
        <>
          <BossHeader regionId={regionId} />
          <div className="boss-intro-card">
            <div className="boss-intro-icon">🐉</div>
            <h2 style={{ color: "#e2e8f0", margin: 0, fontSize: "1.3rem" }}>{phase.boss.name}</h2>
            <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.85rem" }}>{phase.boss.title}</p>
            <p className="boss-intro-narrative">{phase.boss.narrativeIntro}</p>
            <p style={{ color: "#64748b", fontSize: "0.8rem" }}>
              {phase.boss.totalPhases} phases
            </p>
            <button className="boss-btn primary" onClick={handleStart}>
              Begin Battle
            </button>
            <button className="boss-btn danger" onClick={handleRetreat} style={{ background: "transparent", border: "1px solid #555", color: "#888" }}>
              Retreat
            </button>
          </div>
        </>
      )}

      {phase.state === "question" && (
        <>
          <BossHeader regionId={regionId} />
          <HealthBars bossHealth={bossHealth} playerHealth={playerHealth} />
          <PhaseIndicators total={phase.boss.totalPhases} current={phase.boss.currentPhaseIndex} completed={phase.boss.completedPhaseIds} />
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
            <button className="boss-btn primary" onClick={handleAnswer} disabled={selectedIndex === null}>
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
            <p className="boss-feedback-label" style={{ color: phase.isCorrect ? "#2ecc71" : "#e74c3c" }}>
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
            <p style={{ color: "#f1c40f", fontSize: "0.9rem" }}>Score: {phase.score}</p>
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
            <p className="boss-result-desc">The boss was too strong. Level up your mastery and try again.</p>
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
        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <p style={{ color: "#e74c3c", marginBottom: "1rem" }}>{phase.message}</p>
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
          <div className="health-bar-fill" style={{ width: `${bossHealth}%`, background: bossColor }} />
        </div>
        <span className="health-text">{Math.round(bossHealth)}%</span>
      </div>
      <div className="health-row">
        <span className="health-label">You</span>
        <div className="health-bar-bg">
          <div className="health-bar-fill" style={{ width: `${playerHealth}%`, background: playerColor }} />
        </div>
        <span className="health-text">{Math.round(playerHealth)}%</span>
      </div>
    </div>
  );
}

function PhaseIndicators({ total, current, completed }: { total: number; current: number; completed: string[] }) {
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

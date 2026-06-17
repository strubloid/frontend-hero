"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";

// -----------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------

type Theme = "dark" | "light";
type Difficulty = "easy" | "normal" | "hard";

interface Settings {
  theme: Theme;
  soundEnabled: boolean;
  difficulty: Difficulty;
}

const DEFAULT_SETTINGS: Settings = {
  theme: "dark",
  soundEnabled: true,
  difficulty: "normal",
};

// -----------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);
  const { addToast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hermes-settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch {
      // Use defaults
    }
    setMounted(true);
  }, []);

  // Apply theme
  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme, mounted]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("hermes-settings", JSON.stringify(next));
    addToast({ type: "info", title: "Setting updated", duration: 1500 });
  };

  if (!mounted) {
    return (
      <main className="settings-page">
        <div style={{ padding: "3rem 1rem", maxWidth: 600, margin: "0 auto" }}>
          <p style={{ color: "#888" }}>Loading settings…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="settings-page">
      <style>{`
        .settings-page {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: system-ui, sans-serif;
          min-height: 100vh;
          background: var(--bg, #121212);
          color: var(--text, #e0e0e0);
        }
        [data-theme="light"] .settings-page {
          --bg: #f8fafc;
          --text: #1e293b;
          --card-bg: #ffffff;
          --border: #e2e8f0;
          --muted: #64748b;
        }
        [data-theme="dark"] .settings-page {
          --bg: #121212;
          --text: #e0e0e0;
          --card-bg: #1e1e1e;
          --border: #333;
          --muted: #94a3b8;
        }
        .settings-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .settings-back {
          background: none;
          border: 1px solid var(--border, #333);
          color: var(--muted, #888);
          padding: 0.3rem 0.7rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
          text-decoration: none;
        }
        .settings-back:hover {
          border-color: #555;
          color: var(--text, #ccc);
        }
        .settings-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text, #fff);
          margin: 0;
        }
        .settings-section {
          margin-bottom: 2rem;
        }
        .settings-section-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--muted, #94a3b8);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.75rem;
        }
        .settings-card {
          background: var(--card-bg, #1e1e1e);
          border: 1px solid var(--border, #333);
          border-radius: 12px;
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .settings-card + .settings-card {
          margin-top: 0.5rem;
        }
        .settings-label {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--text, #e0e0e0);
        }
        .settings-desc {
          font-size: 0.75rem;
          color: var(--muted, #94a3b8);
          margin-top: 0.15rem;
        }

        /* Toggle switch */
        .toggle {
          width: 44px;
          height: 24px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .toggle.on { background: #4a9eff; }
        .toggle.off { background: #555; }
        .toggle::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #fff;
          transition: transform 0.2s;
        }
        .toggle.on::after { transform: translateX(20px); }

        /* Radio buttons */
        .difficulty-group {
          display: flex;
          gap: 0.5rem;
        }
        .difficulty-btn {
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 2px solid var(--border, #333);
          background: transparent;
          color: var(--muted, #94a3b8);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .difficulty-btn.active {
          border-color: #4a9eff;
          background: #1a2a40;
          color: #4a9eff;
        }
        .difficulty-btn:hover:not(.active) {
          border-color: #555;
        }
      `}</style>

      <div className="settings-header">
        <Link href="/" className="settings-back">
          ← Home
        </Link>
        <h1 className="settings-title">Settings</h1>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <p className="settings-section-title">Appearance</p>
        <div className="settings-card">
          <div>
            <p className="settings-label">Dark Mode</p>
            <p className="settings-desc">Toggle dark/light theme</p>
          </div>
          <button
            className={`toggle ${settings.theme === "dark" ? "on" : "off"}`}
            onClick={() => updateSetting("theme", settings.theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      {/* Gameplay */}
      <div className="settings-section">
        <p className="settings-section-title">Gameplay</p>
        <div className="settings-card">
          <div>
            <p className="settings-label">Sound Effects</p>
            <p className="settings-desc">Play sounds for correct/incorrect answers</p>
          </div>
          <button
            className={`toggle ${settings.soundEnabled ? "on" : "off"}`}
            onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
            aria-label="Toggle sound effects"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div className="settings-section">
        <p className="settings-section-title">Difficulty</p>
        <div className="settings-card">
          <div>
            <p className="settings-label">Question Difficulty</p>
            <p className="settings-desc">Controls the difficulty of generated questions</p>
          </div>
          <div className="difficulty-group">
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`difficulty-btn ${settings.difficulty === d ? "active" : ""}`}
                onClick={() => updateSetting("difficulty", d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <p className="settings-section-title">About</p>
        <div className="settings-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: "0.25rem" }}>
          <p className="settings-label">Frontend Realms</p>
          <p className="settings-desc" style={{ whiteSpace: "normal" }}>
            A gamified learning platform for mastering frontend development.
            Build mastery through missions, boss encounters, and quests.
            Version 1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}

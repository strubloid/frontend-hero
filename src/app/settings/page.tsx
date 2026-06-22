"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useToast } from "@/components/toast-provider";
import styles from "./settings.module.scss";

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
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_SETTINGS;
    }

    try {
      const saved = window.localStorage.getItem("hermes-settings");
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const { addToast } = useToast();

  // Apply theme
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    localStorage.setItem("hermes-settings", JSON.stringify(next));
    addToast({ type: "info", title: "Setting updated", duration: 1500 });
  };

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <Link href="/" className={styles.back}>
          ← Home
        </Link>
        <h1 className={styles.title}>Settings</h1>
      </div>

      {/* Appearance */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Appearance</p>
        <div className={styles.card}>
          <div>
            <p className={styles.label}>Dark Mode</p>
            <p className={styles.desc}>Toggle dark/light theme</p>
          </div>
          <button
            className={`${styles.toggle} ${settings.theme === "dark" ? styles.toggleOn : styles.toggleOff}`}
            onClick={() => updateSetting("theme", settings.theme === "dark" ? "light" : "dark")}
            aria-label="Toggle dark mode"
          />
        </div>
      </div>

      {/* Gameplay */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Gameplay</p>
        <div className={styles.card}>
          <div>
            <p className={styles.label}>Sound Effects</p>
            <p className={styles.desc}>Play sounds for correct/incorrect answers</p>
          </div>
          <button
            className={`${styles.toggle} ${settings.soundEnabled ? styles.toggleOn : styles.toggleOff}`}
            onClick={() => updateSetting("soundEnabled", !settings.soundEnabled)}
            aria-label="Toggle sound effects"
          />
        </div>
      </div>

      {/* Difficulty */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Difficulty</p>
        <div className={styles.card}>
          <div>
            <p className={styles.label}>Question Difficulty</p>
            <p className={styles.desc}>Controls the difficulty of generated questions</p>
          </div>
          <div className={styles.difficultyGroup}>
            {(["easy", "normal", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                className={`${styles.difficultyBtn} ${settings.difficulty === d ? styles.difficultyBtnActive : ""}`}
                onClick={() => updateSetting("difficulty", d)}
              >
                {d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>About</p>
        <div className={`${styles.card} ${styles.aboutCard}`}>
          <p className={styles.label}>Frontend Realms</p>
          <p className={`${styles.desc} ${styles.aboutDesc}`}>
            A gamified learning platform for mastering frontend development. Build mastery through
            missions, boss encounters, and quests. Version 1.0.0
          </p>
        </div>
      </div>
    </main>
  );
}

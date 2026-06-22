"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { equipTitle, getPlayerProfile, setTheme } from "@/app/actions/profile";
import type { PlayerProfileData } from "@/app/actions/profile";
import { useToast } from "@/components/toast-provider";
import styles from "./profile.module.scss";

const TYPE_ICONS: Record<string, string> = {
  mission: "✓",
  achievement: "★",
  "level-up": "⬆",
};

const THEME_OPTIONS = [
  { id: "default", name: "Default Realm", icon: "🏰", description: "Classic dark theme" },
  { id: "forest", name: "Enchanted Forest", icon: "🌲", description: "Green-tinted accents" },
  { id: "volcano", name: "Fire Peak", icon: "🌋", description: "Warm orange/red glow" },
  { id: "frost", name: "Frost Valley", icon: "❄", description: "Cool blue tones" },
  { id: "cosmic", name: "Cosmic Void", icon: "🌌", description: "Deep purple galaxy" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<PlayerProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const notifiedRef = useRef(false);

  // Detect new achievements and level-ups on first load
  useEffect(() => {
    if (!profile || notifiedRef.current) return;
    const lastSeen =
      typeof window !== "undefined" ? sessionStorage.getItem("hermes-last-profile") : null;
    notifiedRef.current = true;

    const prev = lastSeen ? JSON.parse(lastSeen) : null;

    // Level-up detection
    if (prev && prev.level < profile.player.level) {
      addToast({
        type: "level-up",
        title: `Level ${profile.player.level}!`,
        description: `You advanced from level ${prev.level}. Keep it up!`,
      });
    }

    // Achievement detection
    if (profile.achievements && profile.achievements.length > 0) {
      const prevCount = prev?.achievementCount ?? 0;
      const newAchievements = profile.achievements.filter(
        (_, i) => i >= prevCount && i < profile.achievements!.length,
      );
      if (prev && newAchievements.length > 0) {
        for (const a of newAchievements.slice(0, 3)) {
          addToast({
            type: "achievement",
            title: `Achievement: ${a.name}`,
            description: a.description,
            icon: a.icon ?? undefined,
          });
        }
      }
    }

    // Save current state for next visit
    sessionStorage.setItem(
      "hermes-last-profile",
      JSON.stringify({
        level: profile.player.level,
        achievementCount: profile.achievements?.length ?? 0,
      }),
    );
  }, [profile, addToast]);

  useEffect(() => {
    async function load() {
      try {
        const data = await getPlayerProfile("player-1");
        setProfile(data);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <main className="profile-page">
        <nav className="profile-nav">
          <Link href="/" className="nav-link">
            ← Home
          </Link>
        </nav>
        <div className="profile-skeleton">
          <div className="skeleton-header-row">
            <div className="skeleton-avatar pulse" />
            <div className="skeleton-header-text">
              <div className="skeleton-line skeleton-name pulse" />
              <div className="skeleton-line skeleton-title pulse" />
            </div>
          </div>
          <div className="skeleton-stats-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-stat-box pulse" />
            ))}
          </div>
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-section-title pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton-mastery-row">
                <div className="skeleton-line skeleton-label pulse" />
                <div className="skeleton-bar pulse" />
                <div className="skeleton-line skeleton-pct pulse" />
              </div>
            ))}
          </div>
          <div className="skeleton-card">
            <div className="skeleton-line skeleton-section-title pulse" />
            <div className="skeleton-achievements-grid">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton-achievement-card pulse" />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="profile-page">
        <nav className="profile-nav">
          <Link href="/" className="nav-link">
            ← Home
          </Link>
          <Link href="/world-map" className="nav-link">
            World Map
          </Link>
        </nav>
        <div className="profile-loading">
          <p>Could not load profile.</p>
        </div>
      </main>
    );
  }

  const currentProfile = profile;
  const { player, stats, achievements, masteryByDomain, recentActivity, progression } =
    currentProfile;
  const accuracy =
    stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;

  async function handleTitleSelect(title: string) {
    const previous = currentProfile;
    setProfile({
      ...currentProfile,
      player: { ...currentProfile.player, title },
      progression: { ...currentProfile.progression, equippedTitle: title },
    });
    try {
      await equipTitle(player.id, title);
      addToast({
        type: "info",
        title: "Title equipped",
        description: `Now displaying “${title}”.`,
      });
    } catch {
      setProfile(previous);
      addToast({
        type: "error",
        title: "Could not equip title",
        description: "Please try again.",
      });
    }
  }

  async function handleThemeSelect(theme: string) {
    const previous = currentProfile;
    setProfile({
      ...currentProfile,
      progression: { ...currentProfile.progression, selectedTheme: theme },
    });
    try {
      await setTheme(player.id, theme);
      addToast({
        type: "info",
        title: "Theme selected",
        description: `${theme} is now active on your profile.`,
      });
    } catch {
      setProfile(previous);
      addToast({
        type: "error",
        title: "Could not select theme",
        description: "Please try again.",
      });
    }
  }

  return (
    <main className="profile-page">
      <nav className="profile-nav">
        <Link href="/" className="nav-link">
          ← Home
        </Link>
        <Link href="/world-map" className="nav-link">
          World Map
        </Link>
        <Link href="/subjects" className="nav-link">
          Subjects
        </Link>
        <Link href="/collections" className="nav-link">
          Collections
        </Link>
      </nav>

      {/* Player Stats Card */}
      <div className="profile-card stats-card">
        <div className="player-header">
          <div className="player-avatar">⚔</div>
          <div className="player-info">
            <h1 className="player-name">{player.name}</h1>
            <p className="player-title">
              {player.title} — Level {player.level}
            </p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">{stats.level}</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{stats.totalXp.toLocaleString()}</span>
            <span className="stat-label">Total XP</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{stats.missionsCompleted}</span>
            <span className="stat-label">Missions</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">{accuracy}%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        <div className="xp-section">
          <div className="xp-label">
            <span>Next Level — {player.title}</span>
            <span>
              {player.experiencePoints} / {player.experienceToNextLevel} XP
            </span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: `${player.experienceProgress}%` }} />
          </div>
        </div>

        <div className="detail-stats-grid">
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.conceptsMastered}</span>
            <span className="detail-stat-label">Concepts Mastered</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.correctAnswers}</span>
            <span className="detail-stat-label">Correct Answers</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.currentStreak}</span>
            <span className="detail-stat-label">Current Day Streak</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.longestStreak}</span>
            <span className="detail-stat-label">Best Answer Streak</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.graceDaysRemaining}</span>
            <span className="detail-stat-label">Grace Days Left</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.speedDemonAnswers}</span>
            <span className="detail-stat-label">Speed Demons</span>
          </div>
        </div>
      </div>

      {/* Title & Cosmetic Selection */}
      <div className="profile-card cosmetics-card">
        <h2 className="section-title">Title & Cosmetics</h2>
        <p className="cosmetics-help">
          Choose how your adventurer appears across the realms. Titles unlock from level, streak,
          and achievement milestones.
        </p>

        <div className="cosmetics-section">
          <div className="cosmetics-section-header">
            <span className="cosmetics-icon">🎖</span>
            <div>
              <h3 className="cosmetics-heading">Display Title</h3>
              <p className="cosmetics-subtext">Current: {progression.equippedTitle}</p>
            </div>
          </div>
          <div className="title-options">
            {progression.unlockedTitles.map((title) => (
              <button
                key={title}
                className={`title-chip ${title === progression.equippedTitle ? "selected" : ""}`}
                onClick={() => handleTitleSelect(title)}
                disabled={title === progression.equippedTitle}
              >
                {title === progression.equippedTitle ? "✓ " : ""}
                {title}
              </button>
            ))}
          </div>
        </div>

        <div className="cosmetics-section">
          <div className="cosmetics-section-header">
            <span className="cosmetics-icon">🎨</span>
            <div>
              <h3 className="cosmetics-heading">Realm Theme</h3>
              <p className="cosmetics-subtext">Current: {progression.selectedTheme}</p>
            </div>
          </div>
          <div className="theme-options">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.id}
                className={`theme-card ${theme.name === progression.selectedTheme ? "selected" : ""}`}
                onClick={() => handleThemeSelect(theme.name)}
                disabled={theme.name === progression.selectedTheme}
              >
                <span className="theme-icon">{theme.icon}</span>
                <span className="theme-name">{theme.name}</span>
                <span className="theme-desc">{theme.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="next-cosmetic-unlock">
          <span>Next unlock</span>
          <strong>{progression.nextCosmeticUnlock}</strong>
        </div>
      </div>

      {/* Mastery Overview */}
      <div className="profile-card">
        <h2 className="section-title">Mastery Overview</h2>
        {masteryByDomain.length === 0 ? (
          <p className="empty-text">No concepts mastered yet. Start your first mission!</p>
        ) : (
          <div className="mastery-grid">
            {masteryByDomain.map((domain) => (
              <div key={domain.name} className="mastery-item">
                <span className="mastery-icon">{domain.icon}</span>
                <span className="mastery-domain">{domain.name}</span>
                <div className="mastery-bar-bg">
                  <div
                    className="mastery-bar-fill"
                    style={{
                      width: `${Math.round(domain.averageMastery * 100)}%`,
                      background:
                        domain.averageMastery >= 0.7
                          ? "#22c55e"
                          : domain.averageMastery >= 0.4
                            ? "#f59e0b"
                            : "#3b82f6",
                    }}
                  />
                </div>
                <span className="mastery-pct">{Math.round(domain.averageMastery * 100)}%</span>
                <span className="mastery-count">
                  {domain.masteredCount}/{domain.conceptsCount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="profile-card">
        <h2 className="section-title">
          Achievements ({achievements.filter((a) => a.earnedAt).length}/{achievements.length})
        </h2>
        {achievements.length === 0 ? (
          <p className="empty-text">No achievements earned yet. Keep learning!</p>
        ) : (
          <div className="achievements-grid">
            {achievements.map((ach) => (
              <div
                key={ach.id}
                className={`achievement-badge ${ach.earnedAt ? "unlocked" : "locked"} ${ach.isNew ? "new-achievement" : ""}`}
              >
                <span className="achievement-icon">{ach.icon}</span>
                <div className="achievement-info">
                  <span className="achievement-name">{ach.name}</span>
                  <span className="achievement-desc">
                    {ach.earnedAt
                      ? `Earned ${new Date(ach.earnedAt).toLocaleDateString()}`
                      : ach.description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
        <Link href="/collections" className={styles.collectionsLink}>
          View all collections →
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="profile-card">
        <h2 className="section-title">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="empty-text">No activity yet. Begin your journey on the world map!</p>
        ) : (
          <div className="activity-list">
            {recentActivity.map((act) => (
              <div key={act.id} className="activity-item">
                <span className="activity-icon">{TYPE_ICONS[act.type] ?? "•"}</span>
                <span className="activity-text">{act.label}</span>
                <span className="activity-time">
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

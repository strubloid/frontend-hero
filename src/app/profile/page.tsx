"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getPlayerProfile } from "@/app/actions/profile";
import type { PlayerProfileData } from "@/app/actions/profile";
import { useToast } from "@/components/toast-provider";

const TYPE_ICONS: Record<string, string> = {
  mission: "✓",
  achievement: "★",
  "level-up": "⬆",
};

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
        <style>{profileStyles}</style>
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
        <style>{profileStyles}</style>
      </main>
    );
  }

  const { player, stats, achievements, masteryByDomain, recentActivity } = profile;
  const accuracy =
    stats.totalAttempts > 0 ? Math.round((stats.correctAnswers / stats.totalAttempts) * 100) : 0;

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
            <span className="detail-stat-value">{stats.longestStreak}</span>
            <span className="detail-stat-label">Longest Streak</span>
          </div>
          <div className="detail-stat">
            <span className="detail-stat-value">{stats.speedDemonAnswers}</span>
            <span className="detail-stat-label">Speed Demons</span>
          </div>
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
          <p className="empty-text">No achievements defined yet.</p>
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

      <style>{profileStyles}</style>
    </main>
  );
}

const profileStyles = `
  .profile-page {
    min-height: 100vh;
    padding: 2rem;
    max-width: 720px;
    margin: 0 auto;
  }
  .profile-nav {
    display: flex;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  .nav-link {
    color: #94a3b8;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.15s;
  }
  .nav-link:hover {
    color: #e2e8f0;
  }
  .profile-loading {
    text-align: center;
    padding: 4rem 2rem;
    color: #94a3b8;
  }
  .loading-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #334155;
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin: 0 auto 1rem;
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  .profile-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }
  .player-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .player-avatar {
    font-size: 2.5rem;
    width: 64px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    border-radius: 50%;
    border: 2px solid #334155;
  }
  .player-info h1 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }
  .player-title {
    margin: 0.2rem 0 0;
    color: #94a3b8;
    font-size: 0.9rem;
  }
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .stat-box {
    background: #0f172a;
    border-radius: 8px;
    padding: 0.75rem;
    text-align: center;
  }
  .stat-value {
    display: block;
    font-size: 1.2rem;
    font-weight: 700;
    color: #e2e8f0;
  }
  .stat-label {
    display: block;
    font-size: 0.7rem;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.2rem;
  }
  .xp-section {
    margin-top: 0.5rem;
  }
  .xp-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #94a3b8;
    margin-bottom: 0.4rem;
  }
  .xp-bar {
    height: 8px;
    background: #0f172a;
    border-radius: 4px;
    overflow: hidden;
  }
  .xp-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
    transition: width 0.3s;
  }
  .detail-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-top: 1rem;
  }
  .detail-stat {
    text-align: center;
  }
  .detail-stat-value {
    display: block;
    font-size: 1rem;
    font-weight: 700;
    color: #94a3b8;
  }
  .detail-stat-label {
    display: block;
    font-size: 0.65rem;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    margin-top: 0.15rem;
  }
  .empty-text {
    color: #64748b;
    font-size: 0.9rem;
    text-align: center;
    padding: 1.5rem 0;
    margin: 0;
  }
  .section-title {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 0 0 1rem;
  }
  .mastery-grid {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .mastery-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .mastery-icon {
    font-size: 1rem;
  }
  .mastery-domain {
    width: 140px;
    font-size: 0.8rem;
    color: #cbd5e1;
    flex-shrink: 0;
  }
  .mastery-bar-bg {
    flex: 1;
    height: 6px;
    background: #0f172a;
    border-radius: 3px;
    overflow: hidden;
  }
  .mastery-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.3s;
  }
  .mastery-pct {
    width: 40px;
    text-align: right;
    font-size: 0.8rem;
    color: #94a3b8;
    font-variant-numeric: tabular-nums;
  }
  .mastery-count {
    width: 50px;
    text-align: right;
    font-size: 0.7rem;
    color: #475569;
    font-variant-numeric: tabular-nums;
  }
  .achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 0.75rem;
  }
  .achievement-badge {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 8px;
    background: #0f172a;
  }
  .achievement-badge.locked {
    opacity: 0.4;
  }
  .achievement-badge.new-achievement {
    border: 1px solid #f59e0b;
    animation: pulse-glow 2s ease-in-out infinite;
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 4px #f59e0b44; }
    50% { box-shadow: 0 0 12px #f59e0b88; }
  }
  .achievement-icon {
    font-size: 1.3rem;
  }
  .achievement-info {
    display: flex;
    flex-direction: column;
  }
  .achievement-name {
    font-size: 0.85rem;
    font-weight: 600;
    color: #e2e8f0;
  }
  .achievement-desc {
    font-size: 0.75rem;
    color: #64748b;
  }
  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
  }
  .activity-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.85rem;
    color: #cbd5e1;
  }
  .activity-icon {
    width: 24px;
    text-align: center;
    color: #64748b;
  }
  .activity-time {
    margin-left: auto;
    font-size: 0.75rem;
    color: #475569;
    white-space: nowrap;
  }

  /* Skeleton loading */
  .profile-skeleton {
    max-width: 720px;
    margin: 0 auto;
  }
  .skeleton-header-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1.25rem;
  }
  .skeleton-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: #334155;
  }
  .skeleton-header-text {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .skeleton-line {
    background: #334155;
    border-radius: 4px;
    height: 14px;
  }
  .skeleton-name {
    width: 180px;
    height: 18px;
  }
  .skeleton-title {
    width: 120px;
  }
  .skeleton-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .skeleton-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }
  .skeleton-stat-box {
    height: 64px;
    background: #334155;
    border-radius: 8px;
  }
  .skeleton-section-title {
    width: 160px;
    height: 18px;
    margin-bottom: 0.25rem;
  }
  .skeleton-mastery-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  .skeleton-label {
    width: 100px;
  }
  .skeleton-bar {
    flex: 1;
    height: 6px;
    background: #334155;
    border-radius: 3px;
  }
  .skeleton-pct {
    width: 32px;
  }
  .skeleton-achievements-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 0.75rem;
  }
  .skeleton-achievement-card {
    height: 56px;
    background: #334155;
    border-radius: 8px;
  }
  .pulse {
    animation: sk-pulse 1.5s ease-in-out infinite;
  }
  @keyframes sk-pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.7; }
  }
  @media (max-width: 768px) {
    .profile-page {
      padding: 1.25rem 0.9rem 2rem;
    }
    .profile-nav {
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .profile-card,
    .skeleton-card {
      padding: 1.1rem;
    }
    .player-header,
    .skeleton-header-row {
      align-items: flex-start;
    }
    .stats-grid,
    .detail-stats-grid,
    .skeleton-stats-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .mastery-item,
    .activity-item,
    .skeleton-mastery-row {
      flex-wrap: wrap;
      align-items: flex-start;
    }
    .mastery-domain {
      width: 100%;
    }
    .mastery-pct,
    .mastery-count,
    .activity-time {
      margin-left: 0;
      width: auto;
      text-align: left;
    }
    .achievements-grid,
    .skeleton-achievements-grid {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 480px) {
    .profile-page {
      padding-inline: 0.75rem;
    }
    .player-header {
      flex-direction: column;
      gap: 0.75rem;
    }
    .stats-grid,
    .detail-stats-grid,
    .skeleton-stats-grid {
      grid-template-columns: 1fr;
    }
    .achievement-badge {
      align-items: flex-start;
    }
    .activity-item {
      gap: 0.5rem;
    }
  }
`;

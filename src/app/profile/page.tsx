"use client";

import Link from "next/link";

interface AchievementDisplay {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const SAMPLE_ACHIEVEMENTS: AchievementDisplay[] = [
  {
    id: "first-mission",
    name: "First Steps",
    description: "Complete your first mission",
    icon: "🌱",
    unlocked: true,
  },
  {
    id: "perfect-score",
    name: "Flawless",
    description: "Complete a mission with 100% accuracy",
    icon: "💎",
    unlocked: true,
  },
  {
    id: "speed-demon",
    name: "Speed Demon",
    description: "Answer 5 questions correctly in under 30 seconds",
    icon: "⚡",
    unlocked: true,
  },
  {
    id: "region-master",
    name: "Region Master",
    description: "Achieve 100% mastery in one region",
    icon: "👑",
    unlocked: true,
  },
  {
    id: "bug-hunter",
    name: "Bug Hunter",
    description: "Solve 10 debugging challenges",
    icon: "🔍",
    unlocked: false,
  },
  {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Defeat your first boss encounter",
    icon: "🗡",
    unlocked: false,
  },
  {
    id: "architect",
    name: "Architect",
    description: "Pass 5 architecture challenges",
    icon: "🏛",
    unlocked: false,
  },
  {
    id: "streak-warrior",
    name: "Streak Warrior",
    description: "Maintain a 7-day streak",
    icon: "🔥",
    unlocked: false,
  },
  {
    id: "interview-ready",
    name: "Interview Ready",
    description: "Complete all interview simulations",
    icon: "🎯",
    unlocked: false,
  },
  {
    id: "realms-explorer",
    name: "Realms Explorer",
    description: "Enter every region",
    icon: "🗺",
    unlocked: false,
  },
];

export default function ProfilePage() {
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
            <h1 className="player-name">Apprentice Engineer</h1>
            <p className="player-title">Level 5 Explorer</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-box">
            <span className="stat-value">5</span>
            <span className="stat-label">Level</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">1,247</span>
            <span className="stat-label">Total XP</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">42</span>
            <span className="stat-label">Missions</span>
          </div>
          <div className="stat-box">
            <span className="stat-value">78%</span>
            <span className="stat-label">Accuracy</span>
          </div>
        </div>

        <div className="xp-section">
          <div className="xp-label">
            <span>Next Level</span>
            <span>247 / 500 XP</span>
          </div>
          <div className="xp-bar">
            <div className="xp-bar-fill" style={{ width: "49%" }} />
          </div>
        </div>
      </div>

      {/* Mastery Summary */}
      <div className="profile-card">
        <h2 className="section-title">Mastery Overview</h2>
        <div className="mastery-grid">
          <div className="mastery-item">
            <span className="mastery-domain">JavaScript</span>
            <div className="mastery-bar-bg">
              <div className="mastery-bar-fill" style={{ width: "95%", background: "#22c55e" }} />
            </div>
            <span className="mastery-pct">95%</span>
          </div>
          <div className="mastery-item">
            <span className="mastery-domain">TypeScript</span>
            <div className="mastery-bar-bg">
              <div className="mastery-bar-fill" style={{ width: "82%", background: "#22c55e" }} />
            </div>
            <span className="mastery-pct">82%</span>
          </div>
          <div className="mastery-item">
            <span className="mastery-domain">React</span>
            <div className="mastery-bar-bg">
              <div className="mastery-bar-fill" style={{ width: "70%", background: "#f59e0b" }} />
            </div>
            <span className="mastery-pct">70%</span>
          </div>
          <div className="mastery-item">
            <span className="mastery-domain">Next.js</span>
            <div className="mastery-bar-bg">
              <div className="mastery-bar-fill" style={{ width: "45%", background: "#f59e0b" }} />
            </div>
            <span className="mastery-pct">45%</span>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="profile-card">
        <h2 className="section-title">Achievements</h2>
        <div className="achievements-grid">
          {SAMPLE_ACHIEVEMENTS.map((ach) => (
            <div
              key={ach.id}
              className={`achievement-badge ${ach.unlocked ? "unlocked" : "locked"}`}
            >
              <span className="achievement-icon">{ach.icon}</span>
              <div className="achievement-info">
                <span className="achievement-name">{ach.name}</span>
                <span className="achievement-desc">{ach.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="profile-card">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-icon">✓</span>
            <span className="activity-text">
              Completed Rendering Frontier — Event Loop Concepts
            </span>
            <span className="activity-time">2 hrs ago</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✓</span>
            <span className="activity-text">Mastered TypeScript Generics</span>
            <span className="activity-time">Yesterday</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">✗</span>
            <span className="activity-text">
              Failed Server Component vs Client Component challenge
            </span>
            <span className="activity-time">Yesterday</span>
          </div>
          <div className="activity-item">
            <span className="activity-icon">★</span>
            <span className="activity-text">Earned achievement: First Steps</span>
            <span className="activity-time">3 days ago</span>
          </div>
        </div>
      </div>

      <style>{`
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
        .mastery-domain {
          width: 100px;
          font-size: 0.85rem;
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
      `}</style>
    </main>
  );
}

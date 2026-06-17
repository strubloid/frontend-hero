import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <div className="landing-content">
        <div className="landing-logo">
          <span className="landing-icon">⚔</span>
        </div>
        <h1 className="landing-title">Frontend Realms</h1>
        <p className="landing-subtitle">
          A gamified journey to senior-level frontend engineering.
          <br />
          Master Next.js, React, TypeScript, and modern frontend architecture through challenges,
          battles, and real-world scenarios.
        </p>

        {/* Narrative intro */}
        <div className="landing-narrative">
          <p className="narrative-text">
            <em>
              &ldquo;The Frontend Realms stretch across thirteen domains of mastery. Each region
              holds ancient knowledge — from the spark of JavaScript to the heights of the Senior
              Summit. Forge your path, conquer boss encounters, and earn your place among the
              realm&rsquo;s architects.&rdquo;
            </em>
          </p>
        </div>

        <div className="landing-actions">
          <Link href="/world-map" className="landing-btn landing-btn-primary">
            Enter the Realms
          </Link>
          <Link href="/play" className="landing-btn landing-btn-accent">
            Continue Last Session
          </Link>
          <Link href="/profile" className="landing-btn landing-btn-secondary">
            Profile
          </Link>
          <Link href="/subjects" className="landing-btn landing-btn-secondary">
            Subjects
          </Link>
        </div>

        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">🗺</span>
            <h3>World Map</h3>
            <p>Thirteen regions, each unlocking the next through mastery</p>
          </div>
          <div className="feature">
            <span className="feature-icon">⚔</span>
            <h3>Boss Encounters</h3>
            <p>Multi-phase challenges that test connected concepts at once</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🧠</span>
            <h3>Spaced Repetition</h3>
            <p>SM-2 algorithm schedules reviews to lock in knowledge</p>
          </div>
          <div className="feature">
            <span className="feature-icon">📈</span>
            <h3>Adaptive Difficulty</h3>
            <p>Missions adjust to your mastery, never too easy or too hard</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <h3>Achievements</h3>
            <p>Earn badges, titles, and XP for every milestone</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🎯</span>
            <h3>Interview Prep</h3>
            <p>Senior-level scenarios, system design, and judgment calls</p>
          </div>
        </div>

        <p className="landing-version">v0.2.0 &middot; Game Foundation</p>
      </div>

      <style>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .landing-content {
          max-width: 720px;
          text-align: center;
        }
        .landing-logo {
          margin-bottom: 1.5rem;
        }
        .landing-icon {
          font-size: 3.5rem;
        }
        .landing-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.75rem;
          letter-spacing: -0.02em;
        }
        .landing-subtitle {
          color: #94a3b8;
          line-height: 1.7;
          margin: 0 auto 1.5rem;
          max-width: 520px;
          font-size: 1rem;
        }
        .landing-narrative {
          max-width: 520px;
          margin: 0 auto 1.5rem;
        }
        .narrative-text {
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.6;
          padding: 1rem 1.5rem;
          background: #1e293b;
          border-left: 3px solid #3b82f6;
          border-radius: 8px;
          margin: 0;
        }
        .landing-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .landing-btn {
          display: inline-flex;
          align-items: center;
          padding: 0.7rem 1.8rem;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, transform 0.1s;
        }
        .landing-btn-primary {
          background: #3b82f6;
          color: #fff;
        }
        .landing-btn-primary:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }
        .landing-btn-accent {
          background: #8b5cf6;
          color: #fff;
        }
        .landing-btn-accent:hover {
          background: #7c3aed;
          transform: translateY(-1px);
        }
        .landing-btn-secondary {
          background: #1e293b;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
        .landing-btn-secondary:hover {
          background: #334155;
          transform: translateY(-1px);
        }
        .landing-features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .feature {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem;
          text-align: center;
        }
        .feature-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 0.5rem;
        }
        .feature h3 {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0 0 0.3rem;
        }
        .feature p {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
        .landing-version {
          color: #475569;
          font-size: 0.8rem;
        }
        @media (max-width: 600px) {
          .landing-features {
            grid-template-columns: 1fr;
          }
          .landing-title {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </main>
  );
}

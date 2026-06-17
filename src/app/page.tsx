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

        <div className="landing-actions">
          <Link href="/subjects" className="landing-btn landing-btn-primary">
            Enter the Realms
          </Link>
          <Link href="/play" className="landing-btn landing-btn-secondary">
            Continue Last Session
          </Link>
        </div>

        <div className="landing-features">
          <div className="feature">
            <span className="feature-icon">&#9878;</span>
            <h3>Adaptive Missions</h3>
            <p>Challenges that adjust to your skill level</p>
          </div>
          <div className="feature">
            <span className="feature-icon">&#128214;</span>
            <h3>Structured Curriculum</h3>
            <p>From fundamentals to senior-level judgment</p>
          </div>
          <div className="feature">
            <span className="feature-icon">&#9889;</span>
            <h3>Spaced Repetition</h3>
            <p>Intelligent review to lock in knowledge</p>
          </div>
        </div>

        <p className="landing-version">v0.1.0 &middot; Walking Skeleton</p>
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
          max-width: 640px;
          text-align: center;
        }
        .landing-logo {
          margin-bottom: 1.5rem;
        }
        .landing-icon {
          font-size: 3rem;
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
          margin: 0 auto 2rem;
          max-width: 480px;
          font-size: 1rem;
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
          gap: 1.5rem;
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
          font-size: 0.9rem;
          font-weight: 600;
          margin: 0 0 0.3rem;
        }
        .feature p {
          font-size: 0.8rem;
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

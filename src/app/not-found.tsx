"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page">
      <div className="not-found-card">
        <span className="not-found-icon">🗺</span>
        <h1 className="not-found-title">Region Not Found</h1>
        <p className="not-found-message">
          This realm does not exist on the map.
          <br />
          Perhaps it was lost to the void — or never charted at all.
        </p>
        <Link href="/" className="not-found-link">
          Return to the Known Realms
        </Link>
      </div>
      <style>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .not-found-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 2.5rem;
          max-width: 420px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .not-found-icon { font-size: 3rem; }
        .not-found-title { font-size: 1.3rem; font-weight: 700; margin: 0; }
        .not-found-message { font-size: 0.9rem; color: #94a3b8; margin: 0; line-height: 1.6; }
        .not-found-link {
          margin-top: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: #3b82f6;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .not-found-link:hover { background: #2563eb; }
      `}</style>
    </main>
  );
}

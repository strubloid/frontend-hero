"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <main className="global-error-page">
          <div className="error-card">
            <span className="error-icon">⚔</span>
            <h1 className="error-title">The Realms Are Shaken</h1>
            <p className="error-message">
              A powerful force has disrupted the Frontend Realms.
              <br />
              Our engineers have been alerted.
            </p>
            <div className="error-actions">
              <button className="error-retry-btn" onClick={reset}>
                Retry
              </button>
              <Link href="/" className="error-home-link">
                Return Home
              </Link>
            </div>
          </div>
          <style>{`
            body { margin: 0; background: #0f172a; color: #e2e8f0; font-family: system-ui, sans-serif; }
            .global-error-page {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 2rem;
            }
            .error-card {
              background: #1e293b;
              border: 1px solid #7f1d1d;
              border-radius: 16px;
              padding: 2.5rem;
              max-width: 440px;
              text-align: center;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 0.75rem;
            }
            .error-icon { font-size: 3rem; }
            .error-title { font-size: 1.3rem; font-weight: 700; margin: 0; color: #fca5a5; }
            .error-message { font-size: 0.9rem; color: #94a3b8; margin: 0; line-height: 1.6; }
            .error-actions { display: flex; gap: 0.75rem; margin-top: 0.75rem; }
            .error-retry-btn {
              padding: 0.6rem 1.5rem;
              background: #3b82f6;
              color: #fff;
              border: none;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 600;
              cursor: pointer;
            }
            .error-retry-btn:hover { background: #2563eb; }
            .error-home-link {
              padding: 0.6rem 1.5rem;
              background: #1e293b;
              color: #e2e8f0;
              border: 1px solid #334155;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 600;
              text-decoration: none;
              display: inline-flex;
              align-items: center;
            }
            .error-home-link:hover { background: #334155; }
          `}</style>
        </main>
      </body>
    </html>
  );
}

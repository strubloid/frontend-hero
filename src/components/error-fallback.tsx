"use client";

interface ErrorFallbackProps {
  error?: Error;
  reset?: () => void;
  title?: string;
  message?: string;
}

export function ErrorFallback({
  error,
  reset,
  title = "Something went wrong",
  message,
}: ErrorFallbackProps) {
  const displayMessage =
    message ?? error?.message ?? "An unexpected error occurred. Please try again.";

  return (
    <div className="error-fallback">
      <div className="error-card">
        <span className="error-icon">⚠</span>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{displayMessage}</p>
        {reset && (
          <button className="error-retry-btn" onClick={reset}>
            Try Again
          </button>
        )}
      </div>
      <style>{`
        .error-fallback {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .error-card {
          background: #1e293b;
          border: 1px solid #7f1d1d;
          border-radius: 12px;
          padding: 2rem;
          max-width: 420px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .error-icon {
          font-size: 2.5rem;
        }
        .error-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: #fca5a5;
        }
        .error-message {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }
        .error-retry-btn {
          margin-top: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: #3b82f6;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .error-retry-btn:hover {
          background: #2563eb;
        }
      `}</style>
    </div>
  );
}

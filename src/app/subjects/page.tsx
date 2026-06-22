"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSubjectSummaries } from "@/app/actions/subjects";
import { selectSubjectForCurrentUser } from "@/app/actions/player-subject";
import type { SubjectSummary } from "@/app/actions/subjects";

export default function SubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<SubjectSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectingSubjectId, setSelectingSubjectId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSubjectSummaries()
      .then(setSubjects)
      .catch(() => setSubjects([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSelectSubject = async (subjectId: string) => {
    setSelectingSubjectId(subjectId);
    setError(null);
    const result = await selectSubjectForCurrentUser(subjectId);
    if (result.success) {
      router.push(`/play?subject=${subjectId}`);
      return;
    }

    setError(result.error ?? "Could not select subject.");
    setSelectingSubjectId(null);
  };

  if (loading) {
    return (
      <main className="subjects-page">
        <div className="loading-state">
          <p className="loading-text">Loading available subjects...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="subjects-page">
      <header className="subjects-header">
        <h1 className="subjects-title">Select Your Subject</h1>
        <p className="subjects-subtitle">
          Choose a discipline to begin your journey. Each subject contains domains, concepts, and
          challenges organized into a progression tree.
        </p>
      </header>

      {subjects.length === 0 ? (
        <div className="empty-state">
          <p>
            No subjects found. Add a <code>.md</code> file to the subjects/ directory.
          </p>
        </div>
      ) : (
        <div className="subjects-grid">
          {error ? <p className="subject-error">{error}</p> : null}
          {subjects.map((subject) => (
            <button
              key={subject.id}
              className="subject-card"
              onClick={() => handleSelectSubject(subject.id)}
              disabled={selectingSubjectId !== null}
              aria-label={`Study ${subject.title}`}
            >
              <div className="subject-card-header">
                <h2 className="subject-card-title">{subject.title}</h2>
                <span className="subject-card-badge">v{subject.version}</span>
              </div>
              <p className="subject-card-description">{subject.description}</p>
              <div className="subject-card-stats">
                <span className="stat">
                  <strong>{subject.domainCount}</strong> domains
                </span>
                <span className="stat-separator">&middot;</span>
                <span className="stat">
                  <strong>{subject.conceptCount}</strong> concepts
                </span>
                <span className="stat-separator">&middot;</span>
                <span className="stat">schema v{subject.schemaVersion}</span>
              </div>
              <div className="subject-card-action">
                <span className="start-button">
                  {selectingSubjectId === subject.id ? "Starting…" : "Begin Study"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      <footer className="subjects-footer">
        <button className="back-link" onClick={() => router.push("/")}>
          &larr; Back to Home
        </button>
      </footer>

      <style>{`
        .subjects-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 4rem 1.5rem;
          max-width: 900px;
          margin: 0 auto;
        }
        .subjects-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        .subjects-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }
        .subjects-subtitle {
          color: #94a3b8;
          max-width: 560px;
          margin: 0 auto;
          line-height: 1.6;
        }
        .loading-state,
        .empty-state {
          padding: 3rem 1.5rem;
          text-align: center;
          color: #64748b;
        }
        .loading-text {
          font-size: 1rem;
        }
        .subjects-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          width: 100%;
        }
        .subject-card {
          display: block;
          width: 100%;
          text-align: left;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.5rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.15s, transform 0.1s;
          color: inherit;
          font: inherit;
        }
        .subject-card:hover {
          border-color: #3b82f6;
          background: #1e293b;
          transform: translateY(-1px);
        }
        .subject-card:disabled {
          cursor: progress;
          opacity: 0.72;
        }
        .subject-error {
          color: #fecaca;
          background: rgba(127, 29, 29, 0.35);
          border: 1px solid rgba(248, 113, 113, 0.35);
          border-radius: 8px;
          padding: 0.75rem 1rem;
        }
        .subject-card:focus-visible {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }
        .subject-card-header {
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .subject-card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0;
        }
        .subject-card-badge {
          font-size: 0.7rem;
          background: #334155;
          color: #94a3b8;
          padding: 0.15rem 0.5rem;
          border-radius: 4px;
        }
        .subject-card-description {
          color: #94a3b8;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 0 0 0.75rem;
        }
        .subject-card-stats {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: #64748b;
          margin-bottom: 1rem;
        }
        .stat strong {
          color: #e2e8f0;
        }
        .stat-separator {
          color: #475569;
        }
        .subject-card-action {
          border-top: 1px solid #334155;
          padding-top: 0.75rem;
        }
        .start-button {
          display: inline-block;
          background: #3b82f6;
          color: #fff;
          padding: 0.4rem 1.2rem;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .subjects-footer {
          margin-top: 3rem;
        }
        .back-link {
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
        }
        .back-link:hover {
          color: #e2e8f0;
        }
        code {
          background: #1e293b;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-size: 0.85rem;
        }
      `}</style>
    </main>
  );
}

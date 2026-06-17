"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCollections } from "@/app/actions/profile";
import type { CollectionsData } from "@/app/actions/profile";

export default function CollectionsPage() {
  const [data, setData] = useState<CollectionsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getCollections("player-1");
        setData(result);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <main className="collections-page">
      <nav className="collections-nav">
        <Link href="/world-map" className="nav-link">
          ← World Map
        </Link>
        <Link href="/profile" className="nav-link">
          Profile
        </Link>
      </nav>

      {loading ? (
        <div className="collections-loading">
          <div className="loading-spinner" />
          <p>Loading collections…</p>
        </div>
      ) : !data ? (
        <div className="collections-error">
          <p>Failed to load collections.</p>
          <Link href="/world-map" className="nav-link">
            Return to World Map
          </Link>
        </div>
      ) : (
        <>
          <header className="collections-header">
            <h1 className="collections-title">Collections</h1>
            <p className="collections-subtitle">
              {data.earned} / {data.total} achievements collected
            </p>
            <div className="collections-progress-bar">
              <div
                className="collections-progress-fill"
                style={{ width: `${(data.earned / Math.max(data.total, 1)) * 100}%` }}
              />
            </div>
          </header>

          <div className="collections-summary">
            {data.categories.map((cat) => {
              const earned = cat.items.filter((i) => i.earned).length;
              return (
                <div key={cat.category} className="summary-card">
                  <span className="summary-count">
                    {earned}/{cat.items.length}
                  </span>
                  <span className="summary-label">{cat.label}</span>
                </div>
              );
            })}
          </div>

          {data.categories.map((cat) => (
            <section key={cat.category} className="collection-section">
              <h2 className="section-title">
                {cat.label}
                <span className="section-count">
                  {cat.items.filter((i) => i.earned).length}/{cat.items.length}
                </span>
              </h2>
              <div className="achievement-grid">
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className={`achievement-card ${item.earned ? "earned" : "locked"} ${item.hidden && !item.earned ? "hidden" : ""}`}
                  >
                    <div className="achievement-icon">
                      {item.hidden && !item.earned ? "?" : item.iconId}
                    </div>
                    <div className="achievement-info">
                      <h3 className="achievement-name">
                        {item.hidden && !item.earned ? "???" : item.name}
                      </h3>
                      <p className="achievement-desc">
                        {item.hidden && !item.earned
                          ? "Keep exploring to discover this secret."
                          : item.description}
                      </p>
                    </div>
                    {item.earned && (
                      <div
                        className="achievement-earned-badge"
                        title={`Earned ${item.earnedAt ? new Date(item.earnedAt).toLocaleDateString() : ""}`}
                      >
                        ✓
                      </div>
                    )}
                    {item.rewardType && item.earned && (
                      <div className="achievement-reward">{item.rewardValue}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}

      <style>{collectionsStyles}</style>
    </main>
  );
}

const collectionsStyles = `
  .collections-page {
    min-height: 100vh;
    padding: 2rem;
    max-width: 860px;
    margin: 0 auto;
    color: #e0e0e0;
    background: #121212;
    font-family: system-ui, sans-serif;
  }
  .collections-nav {
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
  .collections-loading,
  .collections-error {
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
  .collections-header {
    text-align: center;
    margin-bottom: 2rem;
  }
  .collections-title {
    font-size: 2rem;
    margin: 0 0 0.5rem;
    background: linear-gradient(135deg, #f59e0b, #f97316);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .collections-subtitle {
    color: #94a3b8;
    margin: 0 0 1rem;
    font-size: 0.95rem;
  }
  .collections-progress-bar {
    height: 8px;
    background: #1e293b;
    border-radius: 4px;
    overflow: hidden;
    max-width: 400px;
    margin: 0 auto;
  }
  .collections-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #f59e0b, #f97316);
    border-radius: 4px;
    transition: width 0.5s ease;
  }
  .collections-summary {
    display: flex;
    gap: 0.75rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }
  .summary-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.5rem 1rem;
    text-align: center;
    min-width: 100px;
  }
  .summary-count {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: #f59e0b;
  }
  .summary-label {
    font-size: 0.75rem;
    color: #94a3b8;
  }
  .collection-section {
    margin-bottom: 2rem;
  }
  .section-title {
    font-size: 1.2rem;
    margin: 0 0 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: #e2e8f0;
  }
  .section-count {
    font-size: 0.8rem;
    color: #64748b;
    font-weight: 400;
  }
  .achievement-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
  }
  .achievement-card {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    position: relative;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .achievement-card.earned {
    border-color: #2ecc71;
    background: linear-gradient(135deg, #1e293b, #0d2818);
  }
  .achievement-card.locked {
    opacity: 0.6;
  }
  .achievement-card.hidden {
    opacity: 0.4;
  }
  .achievement-card:hover {
    border-color: #475569;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  }
  .achievement-card.earned:hover {
    border-color: #2ecc71;
  }
  .achievement-icon {
    font-size: 1.5rem;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0f172a;
    border-radius: 8px;
    flex-shrink: 0;
  }
  .achievement-info {
    flex: 1;
    min-width: 0;
  }
  .achievement-name {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: #e2e8f0;
  }
  .achievement-card.earned .achievement-name {
    color: #2ecc71;
  }
  .achievement-desc {
    margin: 0.15rem 0 0;
    font-size: 0.78rem;
    color: #94a3b8;
    line-height: 1.3;
  }
  .achievement-earned-badge {
    width: 24px;
    height: 24px;
    background: #2ecc71;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    color: #0f172a;
    font-weight: 700;
    flex-shrink: 0;
  }
  .achievement-reward {
    position: absolute;
    top: -6px;
    right: -6px;
    background: #f59e0b;
    color: #0f172a;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.15rem 0.4rem;
    border-radius: 4px;
    white-space: nowrap;
  }

  @media (max-width: 600px) {
    .collections-page {
      padding: 1rem;
    }
    .achievement-grid {
      grid-template-columns: 1fr;
    }
    .collections-summary {
      gap: 0.5rem;
    }
    .summary-card {
      min-width: 80px;
      padding: 0.4rem 0.6rem;
    }
  }
`;

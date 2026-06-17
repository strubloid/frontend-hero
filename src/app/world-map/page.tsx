"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorldMap } from "@/app/actions/world-map";
import { OnboardingFlow } from "@/components/onboarding-flow";

interface RegionDisplay {
  id: string;
  name: string;
  icon: string;
  description: string;
  flavor: string;
  conceptCount: number;
  order: number;
  status: "locked" | "available" | "in-progress" | "completed";
  progress: number;
  bossConceptId: string | null;
}

const STATUS_LABELS: Record<string, string> = {
  locked: "Locked",
  available: "Available",
  "in-progress": "In Progress",
  completed: "Mastered",
};

const STATUS_COLORS: Record<string, string> = {
  locked: "#334155",
  available: "#2563eb",
  "in-progress": "#f59e0b",
  completed: "#22c55e",
};

export default function WorldMapPage() {
  const [regions, setRegions] = useState<RegionDisplay[]>([]);
  const [progress, setProgress] = useState<{
    totalRegions: number;
    unlockedRegions: number;
    completedRegions: number;
    currentRegionId: string | null;
    nextRegionId: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [onboardingDone, setOnboardingDone] = useState(false);

  const hasStarted = regions.some((r) => r.status === "in-progress" || r.status === "completed");
  const showOnboarding = !loading && !onboardingDone && !hasStarted;

  useEffect(() => {
    async function load() {
      try {
        const data = await getWorldMap("player-1", "nextjs");
        setRegions(data.regions);
        setProgress(data.progress);
      } catch {
        setRegions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const currentRegion = regions.find((r) => r.id === progress?.currentRegionId);

  return (
    <main className="world-map-page">
      {showOnboarding && (
        <OnboardingFlow hasStarted={hasStarted} onDismiss={() => setOnboardingDone(true)} />
      )}
      <nav className="world-map-nav">
        <Link href="/" className="nav-link">
          ← Home
        </Link>
        <Link href="/profile" className="nav-link">
          Profile
        </Link>
        <Link href="/subjects" className="nav-link">
          Subjects
        </Link>
      </nav>

      {loading ? (
        <div className="world-map-skeleton">
          <div className="skeleton-header">
            <div className="skeleton-line skeleton-title-wide pulse" />
            <div className="skeleton-line skeleton-subtitle pulse" />
          </div>
          <div className="skeleton-regions-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton-region-card pulse">
                <div className="skeleton-region-icon pulse" />
                <div className="skeleton-line skeleton-region-name pulse" />
                <div className="skeleton-bar pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <header className="world-map-header">
            <h1 className="world-map-title">The Frontend Realms</h1>
            <p className="world-map-subtitle">
              {progress
                ? `${progress.completedRegions}/${progress.totalRegions} regions mastered`
                : "Master each region to unlock the next"}
            </p>

            {currentRegion && regions.length > 0 && (
              <div className="world-map-hint">
                Continue from <strong>{currentRegion.name}</strong>
              </div>
            )}
          </header>

          {selectedRegion && (
            <div className="region-detail-panel">
              <div className="region-detail-backdrop" onClick={() => setSelectedRegion(null)} />
              <div className="region-detail-card">
                <button className="region-detail-close" onClick={() => setSelectedRegion(null)}>
                  ✕
                </button>
                {(() => {
                  const r = regions.find((x) => x.id === selectedRegion);
                  if (!r) return null;
                  return (
                    <>
                      <div className="region-detail-icon">{r.icon}</div>
                      <h2 className="region-detail-name">{r.name}</h2>
                      <p className="region-detail-flavor">
                        <em>{r.flavor}</em>
                      </p>
                      <p className="region-detail-desc">{r.description}</p>
                      <div className="region-detail-stats">
                        <span>{r.conceptCount} concepts</span>
                        <span className="region-status" style={{ color: STATUS_COLORS[r.status] }}>
                          {STATUS_LABELS[r.status]}
                        </span>
                      </div>
                      {r.progress > 0 && (
                        <div className="region-progress" style={{ width: "100%" }}>
                          <div
                            className="region-progress-fill"
                            style={{ width: `${r.progress}%` }}
                          />
                        </div>
                      )}
                      {r.status !== "locked" && (
                        <Link href={`/play?region=${r.id}`} className="region-play-btn">
                          Enter {r.name}
                        </Link>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="world-map-grid">
            {regions.map((region) => (
              <div
                key={region.id}
                className={`region-card region-${region.status}`}
                onClick={() => region.status !== "locked" && setSelectedRegion(region.id)}
                role={region.status !== "locked" ? "button" : undefined}
                tabIndex={region.status !== "locked" ? 0 : undefined}
              >
                <div className="region-icon">{region.icon}</div>
                <div className="region-info">
                  <h3 className="region-name">{region.name}</h3>
                  <p className="region-desc">{region.description}</p>
                </div>
                <div className="region-status-bar">
                  <div className="region-status-row">
                    <span className="region-status" style={{ color: STATUS_COLORS[region.status] }}>
                      {STATUS_LABELS[region.status]}
                    </span>
                    <span className="region-percent">{region.progress}%</span>
                  </div>
                  {region.progress > 0 && (
                    <div className="region-progress">
                      <div
                        className="region-progress-fill"
                        style={{
                          width: `${region.progress}%`,
                          background: STATUS_COLORS[region.status],
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <style>{`
        .world-map-page {
          min-height: 100vh;
          padding: 2rem;
          max-width: 960px;
          margin: 0 auto;
          position: relative;
        }
        .world-map-nav {
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
        .world-map-loading {
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
        .world-map-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }
        .world-map-title {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 0.5rem;
        }
        .world-map-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin: 0;
        }
        .world-map-hint {
          margin-top: 0.75rem;
          font-size: 0.85rem;
          color: #f59e0b;
        }
        .world-map-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
        }
        .region-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.15s, transform 0.1s;
        }
        .region-card[role="button"] {
          cursor: pointer;
        }
        .region-card:hover {
          transform: translateY(-2px);
        }
        .region-available {
          border-color: #2563eb44;
        }
        .region-available:hover {
          border-color: #2563eb;
        }
        .region-in-progress {
          border-color: #f59e0b44;
        }
        .region-in-progress:hover {
          border-color: #f59e0b;
        }
        .region-completed {
          border-color: #22c55e44;
        }
        .region-locked {
          opacity: 0.5;
          cursor: default !important;
        }
        .region-icon {
          font-size: 1.5rem;
        }
        .region-info h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem;
        }
        .region-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
          line-height: 1.4;
        }
        .region-status-bar {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
        }
        .region-status-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .region-status {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .region-percent {
          font-size: 0.75rem;
          color: #64748b;
        }
        .region-progress {
          height: 4px;
          background: #0f172a;
          border-radius: 2px;
          overflow: hidden;
        }
        .region-progress-fill {
          height: 100%;
          border-radius: 2px;
          transition: width 0.3s;
        }

        /* Detail panel */
        .region-detail-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 99;
        }
        .region-detail-card {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%,-50%);
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 2rem;
          max-width: 420px;
          width: 90vw;
          z-index: 100;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          text-align: center;
        }
        .region-detail-close {
          align-self: flex-end;
          background: none;
          border: none;
          color: #64748b;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0.25rem;
        }
        .region-detail-icon {
          font-size: 3rem;
        }
        .region-detail-name {
          font-size: 1.3rem;
          font-weight: 700;
          margin: 0;
        }
        .region-detail-flavor {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0;
          line-height: 1.5;
        }
        .region-detail-desc {
          font-size: 0.8rem;
          color: #64748b;
          margin: 0;
        }
        .region-detail-stats {
          display: flex;
          gap: 1rem;
          font-size: 0.8rem;
          color: #94a3b8;
        }
        .region-play-btn {
          display: inline-block;
          margin-top: 0.5rem;
          padding: 0.6rem 1.5rem;
          background: #2563eb;
          color: #fff;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: background 0.15s;
        }
        .region-play-btn:hover {
          background: #1d4ed8;
        }

        /* Skeleton loading */
        .world-map-skeleton {
          max-width: 720px;
          margin: 0 auto;
        }
        .skeleton-header {
          margin-bottom: 2rem;
        }
        .skeleton-regions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .skeleton-region-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }
        .skeleton-region-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #334155;
        }
        .pulse {
          animation: sk-pulse 1.5s ease-in-out infinite;
        }
        @keyframes sk-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @media (max-width: 768px) {
          .world-map-page {
            padding: 1.25rem 0.9rem 2rem;
          }
          .world-map-nav {
            flex-wrap: wrap;
            gap: 0.75rem;
            margin-bottom: 1.25rem;
          }
          .world-map-header {
            margin-bottom: 1.75rem;
          }
          .world-map-title {
            font-size: 1.55rem;
          }
          .world-map-grid,
          .skeleton-regions-grid {
            grid-template-columns: 1fr;
          }
          .region-card,
          .skeleton-region-card {
            padding: 1rem;
          }
          .region-detail-card {
            width: calc(100vw - 1.5rem);
            padding: 1.25rem;
          }
          .region-detail-stats {
            width: 100%;
            justify-content: space-between;
            gap: 0.75rem;
            flex-wrap: wrap;
          }
          .region-play-btn {
            width: 100%;
          }
        }
        @media (max-width: 480px) {
          .world-map-page {
            padding-inline: 0.75rem;
          }
          .world-map-title {
            font-size: 1.35rem;
          }
          .region-status-row {
            gap: 0.5rem;
          }
          .region-detail-icon {
            font-size: 2.4rem;
          }
        }
      `}</style>
    </main>
  );
}

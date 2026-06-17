"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface RegionDisplay {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: "locked" | "available" | "in-progress" | "completed";
  progress: number; // 0-100
}

const SAMPLE_REGIONS: RegionDisplay[] = [
  {
    id: "js-foundations",
    name: "JavaScript Foundations",
    icon: "⚡",
    description: "Scope, closures, promises, event loop",
    status: "completed",
    progress: 100,
  },
  {
    id: "ts-citadel",
    name: "TypeScript Citadel",
    icon: "🛡",
    description: "Generics, unions, narrowing, utility types",
    status: "completed",
    progress: 100,
  },
  {
    id: "react-reactor",
    name: "React Reactor",
    icon: "⚛",
    description: "Components, hooks, state, rendering",
    status: "completed",
    progress: 100,
  },
  {
    id: "rendering-frontier",
    name: "Rendering Frontier",
    icon: "🌐",
    description: "SSR, SSG, streaming, Suspense boundaries",
    status: "in-progress",
    progress: 45,
  },
  {
    id: "nexus",
    name: "Next.js Nexus",
    icon: "▲",
    description: "App Router, Server Components, caching",
    status: "available",
    progress: 0,
  },
  {
    id: "state-labyrinth",
    name: "State Labyrinth",
    icon: "🌀",
    description: "State ownership, context, reducers, mutations",
    status: "locked",
    progress: 0,
  },
  {
    id: "network-depths",
    name: "Network Depths",
    icon: "🔗",
    description: "Data fetching, real-time, WebSockets",
    status: "locked",
    progress: 0,
  },
  {
    id: "testing-grounds",
    name: "Testing Grounds",
    icon: "🧪",
    description: "Unit, integration, E2E, accessibility testing",
    status: "locked",
    progress: 0,
  },
  {
    id: "performance-wastes",
    name: "Performance Wastes",
    icon: "📊",
    description: "Bundle analysis, profiling, optimization",
    status: "locked",
    progress: 0,
  },
  {
    id: "security-fortress",
    name: "Security Fortress",
    icon: "🔒",
    description: "Auth, XSS, CSRF, dependency security",
    status: "locked",
    progress: 0,
  },
  {
    id: "architecture-council",
    name: "Architecture Council",
    icon: "🏛",
    description: "System design, trade-offs, ADRs",
    status: "locked",
    progress: 0,
  },
  {
    id: "production-abyss",
    name: "Production Abyss",
    icon: "🌋",
    description: "Incidents, debugging, observability",
    status: "locked",
    progress: 0,
  },
  {
    id: "senior-summit",
    name: "Senior Summit",
    icon: "🏔",
    description: "Mentoring, interviews, strategic decisions",
    status: "locked",
    progress: 0,
  },
];

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
  const [regions] = useState<RegionDisplay[]>(SAMPLE_REGIONS);

  return (
    <main className="world-map-page">
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

      <header className="world-map-header">
        <h1 className="world-map-title">The Frontend Realms</h1>
        <p className="world-map-subtitle">
          Master each region to unlock the next. Progress represents demonstrated knowledge.
        </p>
      </header>

      <div className="world-map-grid">
        {regions.map((region) => (
          <div key={region.id} className={`region-card region-${region.status}`}>
            <div className="region-icon">{region.icon}</div>
            <div className="region-info">
              <h3 className="region-name">{region.name}</h3>
              <p className="region-desc">{region.description}</p>
            </div>
            <div className="region-status-bar">
              <span className="region-status" style={{ color: STATUS_COLORS[region.status] }}>
                {STATUS_LABELS[region.status]}
              </span>
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

      <style>{`
        .world-map-page {
          min-height: 100vh;
          padding: 2rem;
          max-width: 960px;
          margin: 0 auto;
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
        .region-status {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
      `}</style>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { loadWorldMap } from "@/app/actions/world-map";
import WorldMapClient from "./world-map-client";
import type { WorldMapDisplay } from "@/modules/game-world/application/world-map-application-service";

export const dynamic = "force-dynamic";

export default async function WorldMapPage() {
  let worldMap: WorldMapDisplay | null = null;
  try {
    worldMap = await loadWorldMap("nextjs");
  } catch {
    // Fall through to empty state
  }

  if (worldMap === null) {
    redirect("/login");
  }

  return (
    <main className="world-map-page">
      <nav className="world-map-nav">
        <Link href="/" className="nav-link">
          ← Home
        </Link>
        <Link href="/play" className="nav-link">
          Play
        </Link>
        <Link href="/profile" className="nav-link">
          Profile
        </Link>
      </nav>

      <WorldMapClient worldMap={worldMap} playerLevel={1} playerXp={0} playerXpToNext={100} />

      <style>{`
        .world-map-page {
          min-height: 100vh;
          padding: 2rem;
          max-width: 960px;
          margin: 0 auto;
          background: #0a0e1a;
          color: #e5e7eb;
        }
        .world-map-nav {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .nav-link {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.15s;
        }
        .nav-link:hover { color: #e2e8f0; }
        @media (max-width: 640px) {
          .world-map-page { padding: 1rem; }
          .world-map-nav { flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1rem; }
        }
      `}</style>
    </main>
  );
}

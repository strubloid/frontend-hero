"use client";

import { useMemo } from "react";
import type {
  WorldMapDisplayRegion,
  WorldMapDisplay,
} from "@/modules/game-world/application/world-map-application-service";
import styles from "./pixel-world-map.module.scss";

interface PixelWorldMapProps {
  worldMap: WorldMapDisplay;
  playerLevel: number;
  playerXp: number;
  playerXpToNext: number;
  onRegionSelect?: (regionId: string) => void;
  selectedRegionId?: string | null;
  onEnterRegion?: (regionId: string) => void;
}

/**
 * Pixel-art themed world map showing regions as cards on a grid.
 *
 * Features:
 * - Region cards with pixel borders and retro styling
 * - Progress bars per region
 * - Status indicators (locked/available/in-progress/completed)
 * - Boss indicators
 * - Hover/select interaction
 * - Compact view suitable for both desktop and mobile
 */
export default function PixelWorldMap({
  worldMap,
  playerLevel,
  playerXp,
  playerXpToNext,
  onRegionSelect,
  selectedRegionId,
  onEnterRegion,
}: PixelWorldMapProps) {
  const sortedRegions = useMemo(
    () => [...worldMap.regions].sort((a, b) => a.order - b.order),
    [worldMap.regions],
  );

  const totalXpBar =
    playerLevel > 0 && playerXpToNext > 0
      ? Math.min(100, Math.round((playerXp / (playerXp + playerXpToNext)) * 100))
      : 0;

  return (
    <div className={styles.worldMap}>
      {/* Player HUD */}
      <div className={styles.playerHud}>
        <div className={styles.playerLevel}>
          <span className={styles.levelLabel}>LV</span>
          <span className={styles.levelValue}>{playerLevel}</span>
        </div>
        <div className={styles.xpBarContainer}>
          <div className={styles.xpBarTrack}>
            <div className={styles.xpBarFill} style={{ width: `${totalXpBar}%` }} />
          </div>
          <span className={styles.xpText}>
            {playerXp} / {playerXp + playerXpToNext} XP
          </span>
        </div>
        <div className={styles.progressSummary}>
          <span className={styles.progressStat}>
            <strong>{worldMap.progress.completedRegions}</strong>/{worldMap.progress.totalRegions}{" "}
            regions
          </span>
        </div>
      </div>

      {/* Subject Title */}
      <div className={styles.subjectTitle}>
        <span className={styles.titleIcon}>🗺</span>
        <span>{worldMap.subjectTitle}</span>
      </div>

      {/* Region Grid */}
      <div className={styles.regionGrid}>
        {sortedRegions.map((region, index) => (
          <RegionCard
            key={region.id}
            region={region}
            isFirst={index === 0}
            isLast={index === sortedRegions.length - 1}
            isSelected={selectedRegionId === region.id}
            onSelect={onRegionSelect}
            onEnterRegion={onEnterRegion}
          />
        ))}
      </div>

      {/* Map Legend */}
      <div className={styles.mapLegend}>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} data-status="unlocked" />
          <span>Unlocked</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} data-status="progress" />
          <span>In Progress</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} data-status="completed" />
          <span>Completed</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendDot} data-status="locked" />
          <span>Locked</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendBoss}>👑</span>
          <span>Boss Region</span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Region Card
// ---------------------------------------------------------------------------

interface RegionCardProps {
  region: WorldMapDisplayRegion;
  isFirst: boolean;
  isLast: boolean;
  isSelected: boolean;
  onSelect?: (regionId: string) => void;
  onEnterRegion?: (regionId: string) => void;
}

function RegionCard({
  region,
  isFirst,
  isLast,
  isSelected,
  onSelect,
  onEnterRegion,
}: RegionCardProps) {
  const statusClass = getStatusClass(region.status, region.bossDefeated);

  return (
    <button
      className={`${styles.regionCard} ${styles[statusClass]} ${isSelected ? styles.selected : ""}`}
      onClick={() => onSelect?.(region.id)}
      disabled={region.status === "locked"}
      aria-label={`${region.name} — ${region.status}`}
      type="button"
    >
      {/* Connection lines */}
      <div className={styles.connector}>{!isFirst && <div className={styles.connectorLine} />}</div>

      {/* Card content */}
      <div className={styles.cardBody}>
        {/* Region icon */}
        <div className={styles.cardIcon}>
          {region.hasBoss && region.unlocked && !region.bossDefeated ? (
            <span className={styles.bossIcon}>👑</span>
          ) : region.status === "completed" ? (
            <span className={styles.completedIcon}>⭐</span>
          ) : (
            <span>{region.icon}</span>
          )}
        </div>

        {/* Region info */}
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>
            {region.name}
            {region.status === "locked" && <span className={styles.lockIcon}>🔒</span>}
            {region.bossDefeated && <span className={styles.bossDefeatedIcon}>👑</span>}
          </div>
          <div className={styles.cardDescription}>
            {region.status === "locked"
              ? "Complete previous region to unlock"
              : `${region.completedTasks} / ${region.totalTasks} tasks`}
          </div>
        </div>

        {/* Progress bar */}
        <div className={styles.progressSection}>
          <div className={styles.progressBarTrack}>
            <div
              className={styles.progressBarFill}
              data-status={region.status}
              style={{
                width: `${region.progress}%`,
              }}
            />
          </div>
          <span className={styles.progressText}>{region.progress}%</span>
        </div>

        {/* Order badge */}
        <div className={styles.orderBadge}>{region.order}</div>

        {/* Enter button — shown when selected and unlocked */}
        {isSelected && region.status !== "locked" && (
          <button
            className={styles.enterBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEnterRegion?.(region.id);
            }}
            type="button"
          >
            Enter {region.name}
          </button>
        )}
      </div>

      {/* Bottom connector */}
      {!isLast && <div className={styles.connectorBottom} />}
    </button>
  );
}

function getStatusClass(status: WorldMapDisplayRegion["status"], bossDefeated: boolean): string {
  if (bossDefeated) return "statusCompleted";
  switch (status) {
    case "locked":
      return "statusLocked";
    case "available":
      return "statusAvailable";
    case "in-progress":
      return "statusInProgress";
    case "completed":
      return "statusCompleted";
    default:
      return "statusLocked";
  }
}

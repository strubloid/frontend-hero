"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getCollections } from "@/app/actions/profile";
import type { CollectionsData } from "@/app/actions/profile";
import styles from "./collections.module.scss";

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
    <main className={styles.collectionsPage}>
      <nav className={styles.collectionsNav}>
        <Link href="/world-map" className={styles.navLink}>
          ← World Map
        </Link>
        <Link href="/profile" className={styles.navLink}>
          Profile
        </Link>
      </nav>

      {loading ? (
        <div className={styles.collectionsLoading}>
          <div className={styles.loadingSpinner} />
          <p>Loading collections…</p>
        </div>
      ) : !data ? (
        <div className={styles.collectionsError}>
          <p>Failed to load collections.</p>
          <Link href="/world-map" className={styles.navLink}>
            Return to World Map
          </Link>
        </div>
      ) : (
        <>
          <header className={styles.collectionsHeader}>
            <h1 className={styles.collectionsTitle}>Collections</h1>
            <p className={styles.collectionsSubtitle}>
              {data.earned} / {data.total} achievements collected
            </p>
            <div className={styles.collectionsProgressBar}>
              <div
                className={styles.collectionsProgressFill}
                style={{ width: `${(data.earned / Math.max(data.total, 1)) * 100}%` }}
              />
            </div>
          </header>

          <div className={styles.collectionsSummary}>
            {data.categories.map((cat) => {
              const earned = cat.items.filter((i) => i.earned).length;
              return (
                <div key={cat.category} className={styles.summaryCard}>
                  <span className={styles.summaryCount}>
                    {earned}/{cat.items.length}
                  </span>
                  <span className={styles.summaryLabel}>{cat.label}</span>
                </div>
              );
            })}
          </div>

          {data.categories.map((cat) => (
            <section key={cat.category} className={styles.collectionSection}>
              <h2 className={styles.sectionTitle}>
                {cat.label}
                <span className={styles.sectionCount}>
                  {cat.items.filter((i) => i.earned).length}/{cat.items.length}
                </span>
              </h2>
              <div className={styles.achievementGrid}>
                {cat.items.map((item) => (
                  <div
                    key={item.id}
                    className={`${styles.achievementCard} ${item.earned ? styles.earned : styles.locked} ${item.hidden && !item.earned ? styles.hidden : ""}`}
                  >
                    <div className={styles.achievementIcon}>
                      {item.hidden && !item.earned ? "?" : item.iconId}
                    </div>
                    <div className={styles.achievementInfo}>
                      <h3 className={styles.achievementName}>
                        {item.hidden && !item.earned ? "???" : item.name}
                      </h3>
                      <p className={styles.achievementDesc}>
                        {item.hidden && !item.earned
                          ? "Keep exploring to discover this secret."
                          : item.description}
                      </p>
                    </div>
                    {item.earned && (
                      <div
                        className={styles.achievementEarnedBadge}
                        title={`Earned ${item.earnedAt ? new Date(item.earnedAt).toLocaleDateString() : ""}`}
                      >
                        ✓
                      </div>
                    )}
                    {item.rewardType && item.earned && (
                      <div className={styles.achievementReward}>{item.rewardValue}</div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </>
      )}
    </main>
  );
}

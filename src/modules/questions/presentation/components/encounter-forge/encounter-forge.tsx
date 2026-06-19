"use client";

import { useState, useTransition } from "react";
import {
  generateEncounterForgeQuestions,
  getEncounterForgeInventory,
} from "@/app/actions/encounter-forge";
import type {
  EncounterForgeGenerateResult,
  EncounterForgeInventoryDto,
} from "@/app/actions/encounter-forge";
import styles from "./encounter-forge.module.scss";

const DEFAULT_CONCEPTS = [
  "javascript.event-loop",
  "react.component-composition",
  "nextjs.app-router",
];

interface EncounterForgeProps {
  readonly initialInventory: EncounterForgeInventoryDto;
}

export default function EncounterForge({ initialInventory }: EncounterForgeProps) {
  const [inventory, setInventory] = useState(initialInventory);
  const [subjectId, setSubjectId] = useState(initialInventory.subjectId);
  const [conceptInput, setConceptInput] = useState(DEFAULT_CONCEPTS.join(", "));
  const [count, setCount] = useState(6);
  const [lastResult, setLastResult] = useState<EncounterForgeGenerateResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const concepts = conceptInput
    .split(",")
    .map((concept) => concept.trim())
    .filter(Boolean);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateEncounterForgeQuestions({
        subjectId,
        conceptIds: concepts,
        count,
      });
      setLastResult(result);
      const nextInventory = await getEncounterForgeInventory(subjectId);
      setInventory(nextInventory);
    });
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Encounter Forge</span>
        <h1 className={styles.title}>Generate and monitor question supply</h1>
        <p className={styles.description}>
          Forge new approved encounters for low-inventory concepts, review job progress, and keep
          the campaign question bank healthy before players run out of fresh missions.
        </p>
      </section>

      <section className={styles.panel} aria-labelledby="supply-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="supply-title">Encounter Supply</h2>
            <p>Last checked {new Date(inventory.lastCheckedAt).toLocaleString()}</p>
          </div>
          <span className={`${styles.healthBadge} ${styles[`health${inventory.health}`] ?? ""}`}>
            {inventory.health}
          </span>
        </div>

        <div className={styles.metricGrid}>
          <div className={styles.metricCard}>
            <span>Approved</span>
            <strong>{inventory.totalApproved}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Unseen</span>
            <strong>{inventory.totalUnseen}</strong>
          </div>
          <div className={styles.metricCard}>
            <span>Recently Seen</span>
            <strong>{inventory.totalRecentlySeen}</strong>
          </div>
        </div>

        <div className={styles.conceptList}>
          {inventory.byConcept.length > 0 ? (
            inventory.byConcept.map((concept) => (
              <div key={concept.conceptId} className={styles.conceptRow}>
                <span>{concept.conceptId}</span>
                <strong>{concept.approved} ready</strong>
                <em>{concept.health}</em>
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>No persisted questions yet for this subject.</p>
          )}
        </div>
      </section>

      <section className={styles.panel} aria-labelledby="controls-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="controls-title">Generation Controls</h2>
            <p>Demo Big Pickle gateway generates persisted multiple-choice questions.</p>
          </div>
        </div>

        <label className={styles.field}>
          <span>Subject ID</span>
          <input value={subjectId} onChange={(event) => setSubjectId(event.target.value)} />
        </label>

        <label className={styles.field}>
          <span>Concept IDs (comma-separated)</span>
          <textarea
            value={conceptInput}
            onChange={(event) => setConceptInput(event.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Questions to generate</span>
          <input
            min={1}
            max={30}
            type="number"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
          />
        </label>

        <button
          className={styles.generateButton}
          disabled={isPending || concepts.length === 0}
          onClick={handleGenerate}
          type="button"
        >
          {isPending ? "Forging encounters…" : "Forge Encounters"}
        </button>

        <div className={styles.jobProgress}>
          <span>Job Progress</span>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: isPending ? "62%" : "100%" }} />
          </div>
          <p>
            {isPending
              ? "Generation job is running through the demo gateway."
              : lastResult
                ? `Generated ${lastResult.generatedCount} question(s).`
                : "No active job."}
          </p>
          {lastResult?.errors.map((error, index) => (
            <p key={index} className={styles.errorText}>
              {error}
            </p>
          ))}
        </div>
      </section>
    </main>
  );
}

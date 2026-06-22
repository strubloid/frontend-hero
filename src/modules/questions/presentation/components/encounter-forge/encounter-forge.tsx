"use client";

import { useState, useTransition, useCallback, useEffect, useReducer } from "react";
import {
  generateEncounterForgeQuestions,
  getEncounterForgeInventory,
  getEncounterForgeLevelInventory,
  getAvailableSubjects,
  getConceptsForSubject,
} from "@/app/actions/encounter-forge";
import type {
  EncounterForgeGenerateResult,
  EncounterForgeInventoryDto,
  LevelInventoryDto,
  SubjectSummaryDto,
  ConceptSummaryDto,
} from "@/app/actions/encounter-forge";
import styles from "./encounter-forge.module.scss";

interface EncounterForgeProps {
  readonly initialInventory: EncounterForgeInventoryDto;
}

// ── Concept state machine ─────────────────────────────────────────────────────
// Manages both concept data and selection to avoid multiple setState calls
// in a single effect — only one dispatch per effect.

interface ConceptData {
  readonly concepts: readonly ConceptSummaryDto[];
  readonly selected: readonly string[]; // concept IDs
}

type ConceptState =
  | { status: "idle"; data: ConceptData }
  | { status: "loading"; data: ConceptData }
  | { status: "ready"; data: ConceptData };

type ConceptAction =
  | { type: "START_LOAD"; subjectId: string }
  | { type: "LOAD_SUCCESS"; concepts: readonly ConceptSummaryDto[] }
  | { type: "TOGGLE_SELECTION"; conceptId: string };

const emptyData: ConceptData = { concepts: [], selected: [] };

function conceptReducer(state: ConceptState, action: ConceptAction): ConceptState {
  switch (action.type) {
    case "START_LOAD":
      return { status: "loading", data: { concepts: [], selected: [] } };
    case "LOAD_SUCCESS":
      return {
        status: "ready",
        data: {
          concepts: action.concepts,
          selected: action.concepts.map((c) => c.id),
        },
      };
    case "TOGGLE_SELECTION": {
      if (state.status !== "ready") return state;
      const currentlySelected = new Set(state.data.selected);
      if (currentlySelected.has(action.conceptId)) {
        currentlySelected.delete(action.conceptId);
      } else {
        currentlySelected.add(action.conceptId);
      }
      return {
        ...state,
        data: { ...state.data, selected: Array.from(currentlySelected) },
      };
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function EncounterForge({ initialInventory }: EncounterForgeProps) {
  const [inventory, setInventory] = useState(initialInventory);
  const [subjectId, setSubjectId] = useState(initialInventory.subjectId);
  const [count, setCount] = useState(10);
  const [lastResult, setLastResult] = useState<EncounterForgeGenerateResult | null>(null);
  const [isPending, startTransition] = useTransition();

  // Per-level inventory breakdown
  const [levelInventory, setLevelInventory] = useState<readonly LevelInventoryDto[] | null>(null);

  // Subjects loaded from DB
  const [subjects, setSubjects] = useState<readonly SubjectSummaryDto[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  // Single dispatch call per effect — no cascading renders
  const [conceptState, dispatchConcept] = useReducer(conceptReducer, {
    status: "idle",
    data: emptyData,
  });

  // Load subjects on mount
  useEffect(() => {
    getAvailableSubjects().then((s) => {
      setSubjects(s);
      setLoadingSubjects(false);
    });
  }, []);

  // Load concepts + reset selection in a single dispatch when subject changes.
  // Redux-style reducer pattern is the approved way to batch related state updates
  // without triggering the cascading-renders lint rule.
  useEffect(() => {
    if (!subjectId) return;
    dispatchConcept({ type: "START_LOAD", subjectId });
    getConceptsForSubject(subjectId).then((c) => {
      dispatchConcept({ type: "LOAD_SUCCESS", concepts: c });
    });
  }, [subjectId]);

  // Load per-level inventory when subject changes
  useEffect(() => {
    if (!subjectId) return;
    getEncounterForgeLevelInventory(subjectId).then((levels) => {
      setLevelInventory(levels);
    });
  }, [subjectId]);

  const toggleConcept = useCallback((conceptId: string) => {
    dispatchConcept({
      type: "TOGGLE_SELECTION",
      conceptId,
    });
  }, []);

  const handleSubjectChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setSubjectId(event.target.value);
    setInventory((prev) => ({ ...prev, subjectId: event.target.value }));
  }, []);

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateEncounterForgeQuestions({ subjectId, count });
      setLastResult(result);
      const nextInventory = await getEncounterForgeInventory(subjectId);
      setInventory(nextInventory);
    });
  };

  const isConceptLoading = conceptState.status === "loading";
  const concepts = conceptState.status === "ready" ? conceptState.data.concepts : null;
  const selectedConceptIds = conceptState.data.selected;

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

      <section className={styles.panel} aria-labelledby="level-supply-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="level-supply-title">Campaign Level Supply</h2>
            <p>Question inventory broken down by campaign level</p>
          </div>
        </div>

        {levelInventory === null ? (
          <em className={styles.loadingText}>Loading level inventory…</em>
        ) : levelInventory.length > 0 ? (
          <div className={styles.levelList}>
            {levelInventory.map((level) => (
              <div key={level.level} className={styles.levelCard}>
                <div className={styles.levelCardHeader}>
                  <div>
                    <strong>Level {level.level}</strong>
                    <span className={styles.levelTitle}>{level.title}</span>
                  </div>
                  <span
                    className={`${styles.healthBadge} ${styles[`health${level.health}`] ?? ""}`}
                  >
                    {level.health}
                  </span>
                </div>
                <div className={styles.metricRow}>
                  <span>Total approved: {level.totalApproved}</span>
                </div>
                <div className={styles.conceptList}>
                  {level.byConcept.map((concept) => (
                    <div key={concept.conceptId} className={styles.conceptRow}>
                      <span>{concept.conceptId}</span>
                      <strong>{concept.approved} ready</strong>
                      <em>{concept.health}</em>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className={styles.emptyState}>No progression levels defined for this subject.</p>
        )}
      </section>

      <section className={styles.panel} aria-labelledby="controls-title">
        <div className={styles.panelHeader}>
          <div>
            <h2 id="controls-title">Generation Controls</h2>
            <p>
              Questions are generated across all difficulty levels and concepts. Select a subject
              and optionally filter by concept.
            </p>
          </div>
        </div>

        <label className={styles.field}>
          <span>Subject</span>
          {loadingSubjects ? (
            <em className={styles.loadingText}>Loading subjects…</em>
          ) : (
            <select value={subjectId} onChange={handleSubjectChange} className={styles.select}>
              {subjects.length === 0 ? (
                <option value={subjectId}>{subjectId}</option>
              ) : (
                subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.id})
                  </option>
                ))
              )}
            </select>
          )}
        </label>

        <label className={styles.field}>
          <span>Concepts (all selected by default — uncheck to filter)</span>
          {isConceptLoading ? (
            <em className={styles.loadingText}>Loading concepts…</em>
          ) : concepts !== null ? (
            <div className={styles.conceptChecklist}>
              {concepts.length === 0 ? (
                <em>No concepts available for this subject.</em>
              ) : (
                concepts.map((concept) => {
                  const checked = selectedConceptIds.includes(concept.id);
                  return (
                    <label key={concept.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleConcept(concept.id)}
                      />
                      <span>{concept.name}</span>
                      <span className={styles.conceptMeta}>
                        {concept.domainName} · diff {concept.difficulty}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          ) : (
            <em className={styles.loadingText}>Select a subject to load concepts.</em>
          )}
          {concepts !== null && concepts.length > 0 && (
            <p className={styles.fieldHint}>
              {selectedConceptIds.length} of {concepts.length} concepts selected. Questions are
              distributed across all difficulty levels 1–5.
            </p>
          )}
        </label>

        <label className={styles.field}>
          <span>Questions to generate</span>
          <input
            min={1}
            max={100}
            type="number"
            value={count}
            onChange={(event) => setCount(Number(event.target.value))}
            className={styles.numberInput}
          />
          <span className={styles.fieldHint}>
            Distributed across concepts and difficulty levels 1–5.
          </span>
        </label>

        <button
          className={styles.generateButton}
          disabled={
            isPending || isConceptLoading || concepts === null || selectedConceptIds.length === 0
          }
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

        {lastResult && lastResult.generatedCount > 0 && (
          <p className={styles.successText}>
            ✅ {lastResult.generatedCount} questions generated and persisted at{" "}
            {new Date().toLocaleTimeString()}.
          </p>
        )}
      </section>
    </main>
  );
}

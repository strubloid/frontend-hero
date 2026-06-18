# Question Supply Strategy

> **How Frontend Realms populates, maintains, and expands its question bank.**
> Documenting the relationship between subject versions, hand-written questions, and AI batch generation.

---

## 1. Core Principle: Subject-First Supply

Every subject defines its own initial question set. Questions are authored directly in the subject `.md` file as `QuestionSeed` entries within each concept.

```
subjects/
├── nextjs.md          ← v1: hand-written questions for every concept
├── typescript.md      ← v1: hand-written questions
└── react.md           ← v1: hand-written questions (future)
```

The author of a subject file is responsible for providing the first version of all questions needed to make that subject playable.

The system never ships a subject level with zero questions.

---

## 2. Two Supply Modes

| Mode                   | Source                                        | When Used                                                  |
| ---------------------- | --------------------------------------------- | ---------------------------------------------------------- |
| **Hand-written seeds** | Subject `.md` file `QuestionSeed` definitions | First version of a subject (v1)                            |
| **Batch-generated**    | Big Pickle AI via Encounter Forge             | Subject updates (v2+), new levels, low-inventory scenarios |

### Design philosophy (user direction)

> **First version = all questions hand-written.**
> Every subject ships with its complete initial question bank authored directly in the subject file.
> AI batch generation is not used to bootstrap a subject — it is used when the subject itself evolves.

This means:

1. **v1 of a subject** — The author writes every question seed by hand. No AI generation needed to make it playable. A subject at version 1 contains enough questions across all its levels and concepts for a complete learning campaign.

2. **v2+ of a subject** — When the subject is updated (new version, new concepts, revised level structure), the **Encounter Forge** generates new questions for the changed portions. The hand-written seeds are preserved as anchors; AI generation fills in coverage gaps for the expanded content.

3. **No perpetual AI dependency** — The game never calls Big Pickle during normal play. AI is only invoked explicitly (via the Encounter Forge UI or automated low-inventory trigger). The encounter a player answers was written by the subject author or previously approved from a batch — never fetched live from an AI provider.

4. **Content updates are deliberate** — Bumping a subject's version number signals real content changes. That's the moment to generate. Routine gameplay does not produce new questions.

### Hand-written seeds (v1)

Each concept in a subject file defines question seeds inline:

```yaml
concepts:
  - id: nextjs.app-router-introduction
    name: App Router Introduction
    difficulty: 1
    questionSeeds:
      - stem: "What is the App Router in Next.js?"
        type: multiple-choice
        options: [...]
        correctIndex: 0
        explanation: "..."
        difficulty: 1
      - stem: "Which file creates a route in the App Router?"
        type: multiple-choice
        options: [...]
        correctIndex: 2
        explanation: "..."
        difficulty: 1
```

The author ensures each concept has enough seeds for a basic playable experience:

- Minimum 3–5 seeds per concept (configurable)
- Distributed across at least 2 challenge types for intermediate concepts
- Covering all mandatory learning outcomes for that concept

### Batch-generated (v2+)

When a subject version is updated (v1 → v2, v2 → v3), the new content, new concepts, or increased level requirements trigger AI batch generation through the Encounter Forge.

Batch generation is also used when:

- Inventory for a subject level drops below the healthy threshold
- A new subject level unlocks and needs initial questions
- The player or administrator explicitly requests more questions

---

## 3. Subject Version Lifecycle

```
Subject v1
  │
  ├── Written by author with hand-crafted question seeds
  ├── Deployed as a complete playable campaign
  └── Every concept has 3+ question seeds
       │
       ▼
Player studies Subject v1
  │
  ├── Reaches level cap
  ├── Defeats boss
  └── Subject becomes "completed"
       │
       ▼
Subject v2 update published
  │
  ├── Subject file updated with new version number
  ├── New concepts added, old concepts refined
  ├── Some existing questions may be archived or adapted
  └── New levels, challenge types, or progression rules added
       │
       ▼
System detects version change
  │
  ├── Compares: v2 concepts ↔ v1 concepts
  ├── Identifies: new concepts, modified content, new levels
  ├── Checks: existing question inventory for v2 coverage
  └── If inventory insufficient → triggers generation
       │
       ▼
Encounter Forge batch generation
  │
  ├── Targets: new concepts, new levels, coverage gaps
  ├── Batch size: configurable (default 20)
  ├── Validates: schema, correctness, difficulty, duplicates
  └── Stores: approved questions alongside existing seeds
       │
       ▼
Subject v2 becomes playable
  │
  ├── Seed questions + generated questions combined
  ├── Seed questions are always preserved
  ├── Generated questions are validated independently
  └── Player sees a richer, more diverse question pool
```

---

## 4. Inventory Health Model

```
                ┌──────────────────┐
                │  Question Bank   │
                │  (per subject +  │
                │   per level)     │
                └────────┬─────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
    Approved        Pending         Rejected
    (playable)      (awaiting       (never playable)
                     review)
         │
    ┌────┴────┐
    ▼         ▼
  Unseen    Recently
  (fresh)   Seen
```

### Health thresholds (configurable per subject level)

| State       | Threshold                | Action                                         |
| ----------- | ------------------------ | ---------------------------------------------- |
| ✅ Healthy  | ≥ 40 approved questions  | Normal operation                               |
| ⚠️ Low      | 10–39 approved questions | Show supply warning in HUD; suggest generation |
| 🔴 Critical | 1–9 approved questions   | Auto-enqueue generation; prominent warning     |
| 🚫 Empty    | 0 approved questions     | Block new missions; force generation           |

### Coverage dimensions

Health is measured across multiple axes:

- **Quantity**: Total approved, unseen, recently seen counts
- **Challenge type distribution**: Are all configured challenge types represented?
- **Concept coverage**: Does every concept in the subject level have questions?
- **Difficulty spread**: Is the full difficulty range for the level covered?
- **Recency**: How many questions have been seen recently vs. fresh?

---

## 5. Subject Version Migration

When a subject file's `version` field increases (e.g., from 1 to 2), the system:

1. **Compares concept lists** — identifies new, removed, and modified concepts
2. **Checks question coverage** — verifies every concept has enough approved questions for its level
3. **Preserves existing questions** — seed questions remain unless explicitly replaced
4. **Generates only what's needed** — targets gaps rather than regenerating everything
5. **Updates subject metadata** — new level definitions, progression rules, boss config
6. **Notifies player** — "New content available in Next.js v2"

The migration does not reset player progress.

Player mastery from v1 carries forward and is mapped to v2 concepts where possible.

---

## 6. Generation vs. Seeds Priority

When selecting a question for a mission:

```
1. Prefer unseen approved questions (seed or generated)
2. Fall back to recently-seen questions (rotation)
3. Use review questions for spaced repetition
4. Generate on-demand in emergencies only
```

Seed questions are **never automatically deleted**.

Generation adds to the bank — it does not replace it.

If a generated question is a near-duplicate of an existing seed, the duplicate is rejected.

---

## 7. Cost and Rate Controls

| Control                               | Default              | Configurable |
| ------------------------------------- | -------------------- | ------------ |
| Max batches per day per subject       | 3                    | Yes          |
| Max active generation jobs per player | 1                    | Yes          |
| Max questions per batch               | 20                   | Yes (10–50)  |
| Max provider chunks per batch         | 3 (20×1, 20×1, 10×1) | Yes          |
| Retry limit per chunk                 | 3                    | Yes          |
| Provider rate limit (seconds)         | 5s between calls     | Yes          |
| Auto-generation on low inventory      | Off by default       | Yes          |

Automatic generation is always opt-in.

The player or administrator must explicitly enable it.

---

## 8. Player-Facing Terminology

| Term                  | Internal model        | Displayed as          |
| --------------------- | --------------------- | --------------------- |
| Hand-written question | `QuestionSeed`        | Hand-forged encounter |
| AI-generated question | `GeneratedQuestion`   | Forged encounter      |
| Batch generation      | `GenerationJob`       | Forging encounters    |
| Question inventory    | `InventoryStatus`     | Encounter supply      |
| Low inventory         | `InventoryHealth.Low` | Supply running low    |
| Encounter Forge       | `EncounterForgeUI`    | The Encounter Forge   |

---

## 9. Future Considerations

- **Player-authored questions**: Allow players to submit questions that enter a review queue
- **Community question packs**: Downloadable question sets for completed subjects
- **Automated seed generation**: AI writes suggested seeds that an author reviews and approves
- **Cross-subject questions**: Questions that span multiple subjects (integration encounters)
- **Difficulty calibration**: Player performance data adjusts generated question difficulty
- **Continuous generation**: Background generation maintains healthy inventory without manual triggers

These are deferred until the core batch generation pipeline is stable and verified.

---

_This document informs the Encounter Forge implementation (Phase 9K–9N) and extends the subject file schema for version-aware question management._

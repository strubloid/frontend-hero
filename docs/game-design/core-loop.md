# Frontend Realms — Core Gameplay Loop

## Overview

The core gameplay loop of Frontend Realms is the sequence of actions a player repeats throughout their entire journey. Unlike casual games where the loop is "see obstacle → react → proceed," Frontend Realms' loop is cognitive, reflective, and multi-layered — each iteration exercises genuine engineering judgement.

The loop is designed to maintain **flow state**: the challenge must be calibrated to the player's current mastery so that tasks are neither boringly easy nor frustratingly hard. Difficulty adapts in real time through the adaptive learning engine.

---

## The Core Loop (Visual)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   Choose Mission                                                │
│       ↓                                                         │
│   Receive Narrative & Engineering Objective                     │
│       ↓                                                         │
│   Inspect the Problem                                           │
│       ↓                                                         │
│   Answer / Debug / Design / Predict / Implement                 │
│       ↓                                                         │
│   Receive Immediate Technical Feedback                          │
│       ↓                                                         │
│   Make a Correction (if needed)                                 │
│       ↓                                                         │
│   Earn Mastery Progress & Game Resources                        │
│       ↓                                                         │
│   Update Player Knowledge Model                                  │
│       ↓                                                         │
│   Unlock or Schedule Next Relevant Challenge                    │
│       ↓                                                         │
│   (Return to Choose Mission)                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Detailed Stage Breakdown

### 1. Choose Mission

**What the player does**: Opens the world map or region view and selects a mission node. The available missions are determined by the adaptive engine based on:

- Current mastery levels across concepts
- Overdue review items (highest priority)
- Weak prerequisites blocking progression (next highest priority)
- Recently seen question types (variety requirement)
- Player's manually selected focus area (optional)

**What the player sees**: Mission Briefing screen (described in core-experience.md) with narrative context, concept tags, difficulty rating, and estimated duration.

**Player motivation**: Curiosity about the narrative, desire to unlock the next region, need to strengthen a known weakness, or simply the satisfaction of making progress visible.

**Design constraints**: The player must never feel overwhelmed by choice. At most 5–7 visible missions at a time. The system can recommend a "next best mission."

---

### 2. Receive Narrative & Engineering Objective

**What the player receives**: A contextual story blurb that frames the challenge as an engineering scenario within the world. Examples:

- _Knowledge Encounter_: "The JS Foundations core is destabilizing. Key concepts are being corrupted. Answer correctly to restore each node."
- _Bug Hunt_: "The user dashboard is rendering empty data. Our logs show the API responded normally. Something between the response and the screen is broken. Find it."
- _Production Incident_: "Pager duty alert at 2:34 AM. Users in EU region are seeing 503 errors on the product page. Deployment went out 15 minutes ago. Diagnose and resolve."

**Purpose**: The narrative provides emotional context and makes the abstract learning goal concrete. The engineering objective tells the player exactly what they need to accomplish in technical terms.

**Motivation driver**: The narrative makes the player feel like a real engineer solving real problems, not a student taking a test.

---

### 3. Inspect the Problem

**What the player does**: Reads, examines, and analyses the presented material. Depending on mission type, this may involve:

- Reading a code block and understanding what it does
- Inspecting an error stack trace
- Reviewing system logs and metrics
- Analysing a component architecture diagram
- Examining a PR diff
- Reading a user bug report
- Studying an API response and a rendering output

**Duration**: 30 seconds to 3 minutes, depending on complexity.

**Design principle**: The problem must be presented clearly but not simplified. The player should need to actively think, not passively read. Key information is visible; distractor information may be present as it would be in a real codebase.

---

### 4. Answer / Debug / Design / Predict / Implement

The action phase. The player interacts with the challenge through one of eleven mission types:

#### Mission Type 1: Knowledge Encounter

**Format**: Short, focused questions assessing precise concepts.
**Sub-types**: Multiple choice, multiple selection, true/false with justification, fill-in-the-missing-concept, match related concepts, order lifecycle steps, identify incorrect statement.
**Duration**: 1–3 minutes.
**Cognitive skill**: Recall, recognition, comprehension.
**When used**: Review sessions, concept introduction, quick warm-up missions.

#### Mission Type 2: Code Forensics

**Format**: The player is shown a block of code and asked to determine what happens, why it happens, what is broken, which output is produced, or which principle is violated.
**Duration**: 3–8 minutes.
**Cognitive skill**: Code reading, execution mental simulation, debugging intuition.
**When used**: After a concept is introduced, to test whether the player can recognise it in realistic code.
**Example**: Present a component with incorrect server/client boundary usage and ask the player to identify the hydration mismatch symptom.

#### Mission Type 3: Bug Hunts

**Format**: Present a realistic defect scenario with code, error messages, and expected vs actual behaviour. The player must locate the root cause and propose a fix.
**Sub-types**: Hydration mismatches, server/client boundary errors, stale caching, request waterfalls, improper data mutation, incorrect effect dependencies, race conditions, state synchronisation bugs, env variable exposure, auth mistakes, route handling errors, accessibility failures, test instability.
**Duration**: 5–15 minutes.
**Cognitive skill**: Systematic debugging, root cause analysis, code comprehension.
**When used**: Core learning activity after concept introduction.
**Feedback**: Shows the exact line/component causing the issue with explanation.

#### Mission Type 4: Refactoring Missions

**Format**: The player is shown working code that violates design principles and must improve it while preserving behaviour.
**Evaluation criteria**: Naming, cohesion, coupling, SOLID principles, separation of concerns, testability, composition, dependency direction, error handling, performance, accessibility.
**Duration**: 10–20 minutes.
**Cognitive skill**: Code quality assessment, design pattern application, trade-off reasoning.
**When used**: After the player understands basic mechanics, to deepen architectural thinking.
**Interaction**: The player can edit code in a mini-editor and see a diff of their changes.

#### Mission Type 5: Architecture Council

**Format**: Present several valid-looking designs or ask the player to construct the most appropriate one. The player must explain trade-offs.
**Topics**: Server Components vs Client Components, rendering strategy, caching, state ownership, data boundaries, API design, auth, observability, scalability, deployment, failure recovery.
**Duration**: 10–25 minutes.
**Cognitive skill**: Architectural reasoning, trade-off analysis, systems thinking.
**When used**: For senior-level progression. Typically offered after foundational missions in a region.
**Evaluation**: Assesses not just which option was chosen but the quality of reasoning.

#### Mission Type 6: Production Incidents

**Format**: A simulated incident with symptoms, logs, metrics, recent deployment changes, user reports, code fragments, network traces, and performance data. The player diagnoses and resolves in stages.
**Stages**:

1. **Triage**: Identify the severity and affected systems
2. **Diagnose**: Find the root cause from available evidence
3. **Mitigate**: Apply a temporary fix to restore service
4. **Resolve**: Implement a permanent correction
5. **Prevent**: Add tests, monitoring, or process improvements
   **Duration**: 15–30 minutes (multi-stage).
   **Cognitive skill**: Incident response, root cause analysis, systems thinking, prioritisation under pressure.
   **When used**: Advanced region content. Often a gate before a boss battle.

#### Mission Type 7: Boss Battles

**Format**: Multi-phase challenge testing several connected concepts. Each phase targets a different skill.
**Example Boss**: _The Hydration Hydra_

- Phase 1: Recognise hydration mismatch symptoms from a user report
- Phase 2: Identify the cause in the component tree
- Phase 3: Choose the correct repair (add `"use client"`, restructure, use `suppressHydrationWarning`)
- Phase 4: Explain the trade-off of the chosen repair
- Phase 5: Write a test that would catch this regression
  **Duration**: 15–30 minutes.
  **Cognitive skill**: Synthesis of multiple concepts, transfer of learning, multi-step reasoning.
  **When used**: Region capstone. Locked until prerequisite missions are completed.
  **Reward**: Unlocks next region, significant mastery gains, cosmetic unlock, story progression.

#### Mission Type 8: Build Quests

**Format**: The player constructs real features inside a controlled project over multiple sessions. Each quest is a multi-mission chain.
**Examples**: Typed search interface, server-rendered product page with SSR/ISR, full authentication flow, route protection, optimistic updates, streaming content, real-time dashboard, accessible form with validation, error boundaries, observability setup.
**Duration**: 3–8 sessions of 10–20 minutes each.
**Cognitive skill**: Implementation, composition, integration, testing.
**When used**: Interleaved with other mission types. Provides a sense of creation and accomplishment.

#### Mission Type 9: Interview Arenas

**Format**: Simulated senior frontend interview with timed questions, follow-ups, architecture discussions, code reviews, behavioural scenarios, and system design.
**Duration**: 20–40 minutes.
**Cognitive skill**: Communication, structured reasoning, recall under pressure, trade-off articulation.
**Evaluation criteria**: Accuracy, completeness, clarity, senior judgement, trade-off awareness, practical examples, communication quality.
**When used**: Optional, available to players who have reached mid-level progression. Can be used as assessment gates before senior-level content.

#### Mission Type 10: Prediction Challenges

**Format**: Show code and ask the player to predict behaviour: render output, execution order, event loop order, cache behaviour, network behaviour, state transitions, error propagation, server/client execution boundaries.
**Duration**: 2–5 minutes.
**Cognitive skill**: Mental model simulation, execution tracing.
**When used**: To test whether the player has an accurate internal model of how the framework or language works. Excellent for revealing misconceptions.

#### Mission Type 11: Explain-It Challenges

**Format**: The player explains a concept as they would in an interview. The system evaluates whether the response is technically correct, clear, properly scoped, supported by an example, and free of unnecessary complexity.
**Duration**: 3–8 minutes.
**Cognitive skill**: Explanation, metacognition, communication.
**When used**: To assess depth of understanding. Knowing and being able to explain are different skills.
**Interaction**: Multi-line text input. The system provides structured feedback on each evaluation criterion.

---

### 5. Receive Immediate Technical Feedback

**What the player receives**: Structured feedback as described in core-experience.md. Critical design points:

- **Immediate**: No delay. Feedback appears within 1 second of submission.
- **Specific**: References the player's exact answer, not a generic response.
- **Educational**: Explains the concept, not just whether the answer was right.
- **Normalising**: "This mistake is common because..." reduces shame and encourages continued effort.
- **Forward-looking**: "This concept will return for review in X days" sets expectations.

**Progressive hints** are available during the problem inspection phase:

| Hint Level | Content                                                                     |
| ---------- | --------------------------------------------------------------------------- |
| Hint 1     | Direction — which concept or area to focus on                               |
| Hint 2     | Relevant concept — name the specific principle                              |
| Hint 3     | Partial reasoning — walk through part of the logic                          |
| Hint 4     | Worked guidance — nearly the correct reasoning, missing only the final step |

Each hint used reduces the mastery gain for that mission by a small amount (not enough to make hints feel punishing, but enough to reward independent solving).

---

### 6. Make a Correction (If Needed)

**What the player does**: If their answer was incorrect or partially correct, they can attempt a repair action:

- **Try again** with a small hint
- **Explain the correction** in their own words
- **Solve a related example** (varied context)
- **Compare two approaches** (contrast with their original reasoning)
- **Rebuild the answer** from a partial hint

**Reward**: Partial mastery credit. A successful correction after learning from feedback is still valuable — it reinforces the correct mental model more deeply than a lucky first guess would.

**Design principle**: Wrong answers are learning opportunities, not failures. The system never punishes incorrect answers. There are no "lives", no "hearts", no "game overs" for getting something wrong.

---

### 7. Earn Mastery Progress & Game Resources

**What the player receives**:

| Resource                        | Purpose                                               | Earned By                                                               |
| ------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| **Mastery Score** (per concept) | Demonstrated understanding. Unlocks advanced content. | Correct answers across multiple sessions, varied contexts, explanations |
| **XP**                          | Player level, cosmetic unlocks, achievement progress  | Completing missions, streaks, first-time correct answers                |
| **Player Level**                | Broad progression indicator, some cosmetic thresholds | Total XP                                                                |
| **Achievement Progress**        | Badges, titles, cosmetic rewards                      | Specific milestone behaviours                                           |
| **Cosmetic Unlocks**            | Themes, frames, titles, terminal colour schemes       | Milestone achievements, boss defeats, region completions                |
| **Story Fragments**             | Narrative progression, lore discovery                 | Region milestones, boss defeats                                         |

**Critical distinction**: Mastery and XP are separate. XP can be earned through engagement (completing missions, maintaining streaks). Mastery can only be earned through demonstrated understanding. You can be high-level with low mastery — the system will continue to challenge you on weak concepts regardless of your level.

---

### 8. Update Player Knowledge Model

**What happens internally**: The adaptive learning engine updates the player's concept mastery records:

```ts
// Internal update — not visible to the player as raw data, but
// influences every subsequent decision the system makes
interface ConceptMastery {
  conceptId: string;
  subjectId: string;
  masteryScore: number; // 0–100
  confidenceScore: number; // 0–100
  retentionScore: number; // 0–100, decays over time
  difficultyRating: number; // 1–5, derived from concept and player history
  correctAttempts: number;
  incorrectAttempts: number;
  consecutiveCorrectAnswers: number;
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null;
  demonstratedContexts: DemonstratedContext[];
  commonMistakes: string[];
}
```

The update affects:

- **Mastery score**: Weighted combination of correct attempts, confidence, recency, context variety, and explanation quality
- **Confidence score**: How reliably the player answers correctly (streak of correct answers strengthens; incorrect answers reduce)
- **Retention score**: Decays over time if not reviewed. Triggers review scheduling
- **Next review**: Calculated based on mastery, confidence, retention, and spaced-repetition algorithm

---

### 9. Unlock or Schedule Next Relevant Challenge

**What the system does**: Based on the updated knowledge model, the engine determines the next best activity:

| Condition                                                        | Action                                                     |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| Player answered correctly and concept mastery is below threshold | Schedule harder variation of same concept                  |
| Player answered incorrectly                                      | Schedule easier review of same concept within 1–2 sessions |
| Player has not reviewed a mastered concept in 7+ days            | Schedule review                                            |
| Prerequisite concept is now mastered                             | Unlock the next concept in the curriculum graph            |
| All concepts in a region reach threshold mastery                 | Activate boss battle                                       |
| Boss battle completed                                            | Unlock adjacent region(s) and new mission types            |
| Overdue reviews exist                                            | Surface review chamber prompt                              |

**Transparency**: The system does not hide its scheduling. The player can see:

- Which concepts are due for review and when
- Which concepts have decayed
- Which regions will unlock when prerequisites are met
- Which achievements are in progress

---

## Player Motivation Throughout the Loop

| Stage                  | Primary Motivation               | Supporting Motivation |
| ---------------------- | -------------------------------- | --------------------- |
| Choose Mission         | Curiosity, progression desire    | Narrative investment  |
| Receive Narrative      | Emotional engagement             | Context for learning  |
| Inspect Problem        | Intellectual challenge           | Real-world relevance  |
| Answer/Action          | Demonstration of competence      | Overcoming challenge  |
| Receive Feedback       | Growth (I understand better now) | Closure, clarity      |
| Correction (if needed) | Mastery, completeness            | No loose ends         |
| Earn Rewards           | Visible progress, status         | Collecting, unlocking |
| Knowledge Update       | (Invisible — trust in system)    | —                     |
| Next Challenge         | Anticipation of next step        | Continuity            |

## Flow State Maintenance

The system maintains flow state by:

1. **Difficulty calibration**: The adaptive engine matches challenge difficulty to the player's current mastery. A player at 35% mastery on a concept gets easier questions (or more hints available); a player at 75% gets harder, more applied questions.
2. **Variety**: The system alternates mission types. Two Knowledge Encounters in a row are followed by a Code Forensics or Bug Hunt. The player never feels like they are doing the same thing repeatedly.
3. **Session length awareness**: The system tracks how long the player has been active. After ~30 minutes of continuous play, it may suggest a lower-effort mission type or signal that the Review Chamber is available for a quick session.
4. **Choice without overload**: The player can choose from a curated set of 5–7 mission options rather than an overwhelming list of 50.

## Difficulty Curve

```
Mastery
  ^
  |                                          Senior Summit
  |                                      ╱
  |                                  ╱
  |                              ╱   [Boss battles,
  |                          ╱       Production Incidents,
  |                      ╱           Architecture Council]
  |                  ╱
  |              ╱   [Bug Hunts, Refactoring,
  |          ╱       Build Quests, Prediction]
  |      ╱
  |  ╱   [Knowledge Encounters, Code Forensics,
  |      Explain-It, basic Interview Arenas]
  |
  └──────────────────────────────────────────► Time
```

The curve is not strictly linear — the player may encounter a challenging Production Incident early in one region while answering Knowledge Encounters in another. The overall trend, however, ensures that concepts are introduced, applied, debugged, and ultimately synthesised into architectural decisions.

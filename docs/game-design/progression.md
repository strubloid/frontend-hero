# Frontend Realms — Progression System Design

## Overview

Progression in Frontend Realms is **dual-track**: one track measures engagement and activity (XP, Player Level), while the other measures demonstrated understanding (Mastery, Skill Levels, Subject Levels). The game respects both, but **mastery is the true gate**. XP unlocks cosmetics and achievements; mastery unlocks content, regions, and narrative progression.

Every progression mechanic is designed according to these principles:

- **Progression must represent demonstrated knowledge**, not time spent or screens completed
- **Mastery must be earned across multiple sessions and varied contexts**, never from a single correct answer
- **The player should always know where they are, what they are learning, why it matters, and what unlocks next**
- **No progression can be accelerated by paying money.** Cosmetics are the only purchasable items
- **No progression path punishes the player for taking breaks.** Humane streaks and recovery are first-class systems

---

## XP vs Mastery: The Core Distinction

| Aspect                  | XP (Experience Points)                                                   | Mastery                                                                                    |
| ----------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| **What it measures**    | Engagement, activity, completion                                         | Demonstrated understanding, retention, transfer                                            |
| **Earned by**           | Completing missions, maintaining streaks, first-try bonuses, daily login | Correct answers across multiple sessions, varied contexts, explanations, debugging, design |
| **Spent on**            | Nothing — XP is a passive accumulation                                   | Nothing — mastery is an intrinsic measure                                                  |
| **Gates**               | Cosmetics, achievements, some story fragments                            | New concepts, harder mission types, region unlocks, boss battles                           |
| **Can it decay?**       | No                                                                       | Yes — mastery decays without review (spaced repetition)                                    |
| **Can it be inflated?** | Yes (grinding easy missions)                                             | No (system requires varied evidence)                                                       |
| **Primary purpose**     | Motivation, visible sense of progress, reward pacing                     | Accurate learning assessment, curriculum navigation                                        |

**The rule**: You can be a high-level player with low mastery in specific areas. The game will continue serving you content appropriate to your actual understanding, not your level.

---

## Player Level

Derived from total XP. Player level is a **broad progression indicator** that provides a sense of overall advancement and gates cosmetic rewards.

| Level | Title                 | XP Required | Notable Unlock                    |
| ----- | --------------------- | ----------- | --------------------------------- |
| 1     | Apprentice            | 0           | Start                             |
| 5     | Scripter              | 1,200       | Terminal colour scheme: "Neon"    |
| 10    | Builder               | 4,500       | World map hologram effect upgrade |
| 15    | Architect-in-Training | 10,000      | Custom mission marker style       |
| 20    | System Restorer       | 20,000      | Title: "System Restorer"          |
| 30    | Realm Walker          | 45,000      | Unique frame glow effect          |
| 40    | Nexus Engineer        | 85,000      | Custom code-terminal background   |
| 50    | Senior Architect      | 150,000     | Title: "Senior Architect"         |
| 75    | Council Member        | 350,000     | Full-immersion map mode           |
| 100   | Summit Lord           | 750,000     | Exclusive title and frame set     |

Levels beyond 100 exist but provide only cosmetic progression. No gameplay-relevant content is ever locked behind a player level gate.

**XP gain rates**:

- Knowledge Encounter: 10–25 XP
- Code Forensics: 20–40 XP
- Bug Hunt: 30–60 XP
- Refactoring: 40–80 XP
- Architecture Council: 50–100 XP
- Production Incident: 60–120 XP
- Boss Battle: 100–200 XP
- Build Quest (per session): 30–70 XP
- Interview Arena: 50–120 XP
- First correct answer of the day: +20 XP bonus
- Perfect session (all correct, no hints): +30 XP bonus
- Streak milestone (7, 30, 100 days): 200–1000 XP

---

## Subject Levels

Each subject (JavaScript, TypeScript, React, Next.js, etc.) has its own level, calculated from the average mastery of all concepts within that subject. Subject levels determine:

- Whether the player can enter a related region
- Whether the player can access harder mission types within that subject
- Visual indicators on the world map (how "restored" the subject's region looks)

| Subject Level | Meaning      | Visual State                                       |
| ------------- | ------------ | -------------------------------------------------- |
| 0             | Not started  | Region dark, no particles                          |
| 1–2           | Foundational | Dim glow, faint particles                          |
| 3–4           | Developing   | Moderate glow, active particles                    |
| 5–6           | Competent    | Bright region, steady particle flow                |
| 7–8           | Advanced     | Full restoration, rich particle effects            |
| 9             | Mastered     | Brilliant glow, unique ambient effects             |
| 10            | Transferred  | Mastery proven through application across contexts |

A subject reaches level 10 only when the player has demonstrated mastery through multiple evidence types (correct answers, explanations, debugging, architecture decisions, and application in another context). It is the hardest and most meaningful achievement.

---

## Skill Levels (Per Concept)

Every individual concept has its own skill level, more granular than subject level:

| Skill Level | Label        | Evidence Required                                                |
| ----------- | ------------ | ---------------------------------------------------------------- |
| 0           | Undiscovered | Never attempted                                                  |
| 1           | Exposed      | Attempted at least once                                          |
| 2           | Familiar     | 1 correct answer in a Knowledge Encounter                        |
| 3           | Practiced    | 2+ correct answers across 2+ sessions                            |
| 4           | Applied      | Correct answer in Code Forensics or Bug Hunt                     |
| 5           | Proficient   | Correct in varied contexts + explanation challenge               |
| 6           | Analysed     | Correct in debugging + architecture scenario                     |
| 7           | Synthesised  | Correct in multi-concept boss phase + explanation                |
| 8           | Mastered     | Consistent across all challenge types, >3 sessions >1 week apart |
| 9           | Retained     | Survives spaced repetition window of 30+ days with no decay      |
| 10          | Transferred  | Demonstrated in a novel context not directly taught              |

Skill levels 0–5 can be reached through most mission types. Levels 6–10 require varied evidence: debugging, architecture, explanation, and application across sessions.

---

## Region Unlock Model

The 13 regions are arranged in a prerequisite graph. The general flow:

```
JavaScript Foundations
    ├── TypeScript Citadel
    ├── React Reactor
    │       └── State Labyrinth
    │       └── Rendering Frontier
    │               └── Next.js Nexus
    │                       ├── Network Depths
    │                       ├── Testing Grounds
    │                       ├── Performance Wastes
    │                       └── Security Fortress
    │                               └── Production Abyss
    ├── Architecture Council (requires multiple regions)
    └── Senior Engineer Summit (requires all others)
```

**Region unlock requirements**:

```
Region A unlocks → requires Subject Level ≥ 4 in prerequisite subject(s)
                   AND ≥ 60% mastery on gateway concepts
                   AND defeat of previous region's boss (where applicable)
```

The player can always see the unlock requirements for any locked region. There is no mystery about what they need to learn.

---

## Achievement System

Achievements are organised into categories. Each achievement grants a title, cosmetic reward, or story fragment. Achievements never gate gameplay content.

### Learning Achievements

| Achievement        | Trigger                               | Reward                         |
| ------------------ | ------------------------------------- | ------------------------------ |
| First Light        | Complete first mission                | "Apprentice" title suffix      |
| Knowledge Seeker   | Master 10 concepts to skill level 4   | Concept node visual upgrade    |
| Deep Understanding | Master 5 concepts to skill level 8    | "Scholar" title prefix         |
| Jack of All Trades | Achieve subject level 5 in 6 subjects | Region map filter: all regions |
| The Full Stack     | Reach level 10 in any subject         | Unique terminal colour theme   |
| Concept Hunter     | Achieve skill level 10 on any concept | "Grandmaster" title prefix     |

### Challenge Achievements

| Achievement        | Trigger                                      | Reward                       |
| ------------------ | -------------------------------------------- | ---------------------------- |
| Bug Squasher       | Complete 25 Bug Hunts                        | Bug-themed decoration        |
| Incident Commander | Complete 10 Production Incidents             | Incident response badge      |
| The Architect      | Complete 15 Architecture Council missions    | Blueprint frame effect       |
| Debugger's Eye     | Complete 50 Code Forensics missions          | Forensics scan line theme    |
| Builder            | Complete 5 Build Quests (entire chain)       | Workshop environment upgrade |
| Arena Champion     | Complete 20 Interview Arenas with ≥80% score | Interview medal icon         |

### Boss Achievements

| Achievement      | Trigger                             | Reward                                    |
| ---------------- | ----------------------------------- | ----------------------------------------- |
| Hydra Slayer     | Defeat The Hydration Hydra          | Hydra trophy decoration                   |
| Phantom Exorcist | Defeat The Cache Phantom            | Cache node glimmer effect                 |
| Behemoth Tamer   | Defeat The Bundle Behemoth          | Bundle size compact theme                 |
| Speed Runner     | Defeat any boss in under 10 minutes | Lightning badge                           |
| Realm Liberator  | Restore all 13 regions              | "Liberator" title + full map illumination |

### Streak & Engagement Achievements

| Achievement | Trigger                                      | Reward                          |
| ----------- | -------------------------------------------- | ------------------------------- |
| Consistent  | 7-day streak                                 | Small particle effect on avatar |
| Dedicated   | 30-day streak                                | "Consistent" title suffix       |
| Unstoppable | 100-day streak                               | Unique avatar aura effect       |
| Phoenix     | Recover a streak of 30+ days after losing it | "Phoenix" title + flame effect  |
| The Return  | Complete a session after 14+ days away       | "Returning Architect" title     |

### Hidden Achievements

Some achievements are unlisted and discovered by the player through unexpected behaviour (e.g., completing a mission at exactly midnight, achieving perfect score on 5 consecutive Production Incidents, or finding a narrative Easter egg). These grant unique cosmetic effects and serve as delightful surprises.

---

## Streaks with Humane Recovery

**Design philosophy**: Streaks exist to encourage regular practice, not to create anxiety. A broken streak should not feel like a failure.

### Mechanics

- **Streak counter**: Consecutive calendar days with at least one completed mission
- **Grace days**: 3 grace days per 30-day rolling window. If the player misses a day, a grace day is consumed automatically. The streak counter does not reset.
- **Streak freeze**: After losing a streak (grace days exhausted), the player can restore it with a **Streak Recovery Mission** — a single focused session that, if completed successfully, restores the streak to its previous count.
- **Weekly consistency goal**: Alternative to the daily streak. The player aims to complete missions on 5 out of 7 days. Weekly goals reset cleanly without loss.
- **Return bonus**: After an absence of 7+ days, the player's first session back grants +50% XP (one-time). There is no shame or guilt messaging.
- **No shaming**: The app never says "You lost your streak!" or "Come back!" in a guilt-inducing way. On return: _"Welcome back, Architect. The realms held. Here is your return bonus."_

### What Streaks Unlock

Achievements (listed above) and a small XP bonus. Streaks never gate access to content or mastery progression.

---

## Reward Design Philosophy

### What Rewards Exist

- **New world areas** (regions, sub-regions)
- **New mission types** (unlocked as player progresses)
- **Cosmetic rewards**: Terminal colour schemes, frame effects, avatar decorations, map hologram styles, title prefixes and suffixes
- **Story fragments**: Narrative lore that deepens the world
- **Architecture cards**: Collectible cards summarising key design patterns and trade-offs (no gameplay effect — completionist content)
- **Debugging tools**: Visual enhancements for the code inspection screen (e.g., syntax highlighting themes, diff view styles)
- **Titles**: Displayed on the player profile and mission briefing ("Maya Chen — Scholar of the Nexus")
- **Achievement badges**: Visual trophies displayed in the achievement hall
- **Environment upgrades**: The player's personal workshop area gains visual improvements

### What Rewards Are NOT

- **No gameplay advantages**: No items that reduce difficulty, skip content, or inflate mastery
- **No pay-to-progress**: Nothing that speeds up learning or unlocks content with money
- **No consumable resources**: No "energy", "fuel", "gems", or anything that limits how much the player can learn per day
- **No random loot boxes**: Every reward is deterministic based on player actions

### What Never Gets Gated Behind Pay or Grind

- **Access to any concept or subject**: All educational content is available through demonstrated mastery
- **Access to any mission type**: All challenge formats are unlocked by progression, not purchase
- **Spaced repetition and review**: The Review Chamber is always available
- **Knowledge maps and progress analytics**: The player always knows their state
- **Any mechanic that affects learning outcomes**: No pay-to-learn, no pay-to-win
- **Achievement eligibility**: Achievements are earned, not bought
- **Future content updates**: New regions, subjects, and mission types are free additions

### Cosmetic-Only Monetisation (Future)

If monetisation is introduced, it will be strictly cosmetic: alternative theme packs, decorative frames, exclusive title styles, and supporter badges. None of these affect learning, mastery tracking, or content access.

---

## The Mastery Model

### Core Interface

```ts
export interface ConceptMastery {
  conceptId: string;
  subjectId: string;
  masteryScore: number; // 0–100 — overall demonstrated understanding
  confidenceScore: number; // 0–100 — how reliably the player answers correctly
  retentionScore: number; // 0–100 — decays over time without review
  difficultyRating: number; // 1–5 — derived from the concept definition and player history
  correctAttempts: number; // Total correct answers
  incorrectAttempts: number; // Total incorrect answers
  consecutiveCorrectAnswers: number; // Current streak of correct answers
  lastAttemptedAt: Date | null;
  nextReviewAt: Date | null; // When spaced repetition will surface this concept
  demonstratedContexts: DemonstratedContext[]; // Array of evidence types
  commonMistakes: string[]; // Tracked to identify persistent confusion
}

interface DemonstratedContext {
  missionType: MissionType; // KnowledgeEncounter, BugHunt, etc.
  context: string; // Brief description of the specific challenge
  success: boolean; // Was the answer correct?
  timestamp: Date;
  hintLevelUsed: number; // 0 = no hints, 1–4 = hint levels
}
```

### How Mastery Is Calculated

The mastery score is a weighted combination of multiple signals:

```ts
function calculateMastery(concept: ConceptMastery): number {
  const baseAccuracy =
    concept.correctAttempts / Math.max(1, concept.correctAttempts + concept.incorrectAttempts);

  // Confidence multiplier: consecutive correct answers increase weight
  const confidenceMultiplier = Math.min(1.5, 1 + concept.consecutiveCorrectAnswers * 0.05);

  // Context variety: mastery proven in 3+ challenge types is worth more
  const contextTypes = new Set(
    concept.demonstratedContexts.filter((c) => c.success).map((c) => c.missionType),
  ).size;
  const varietyBonus = Math.min(1.3, 1 + contextTypes * 0.05);

  // Hint penalty: using hints reduces mastery weight
  const avgHints =
    concept.demonstratedContexts
      .filter((c) => c.success)
      .reduce((sum, c) => sum + c.hintLevelUsed, 0) /
    Math.max(1, concept.demonstratedContexts.filter((c) => c.success).length);
  const hintPenalty = Math.max(0.7, 1 - avgHints * 0.08);

  // Freshness: recent demonstrations weigh more
  const now = new Date();
  const recentContexts = concept.demonstratedContexts.filter(
    (c) => c.timestamp > new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
  );
  const recentRatio = recentContexts.length / Math.max(1, concept.demonstratedContexts.length);

  const rawScore =
    baseAccuracy *
    100 *
    confidenceMultiplier *
    varietyBonus *
    hintPenalty *
    (0.6 + 0.4 * recentRatio);

  return Math.min(100, Math.round(rawScore));
}
```

This formula ensures that:

- A single lucky correct answer does not inflate mastery
- Using hints produces lower mastery than working independently
- Demonstrating understanding across multiple mission types is rewarded
- Recency matters — recent correct answers carry more weight than old ones
- Streaks of correct answers boost confidence weighting
- Inconsistent performance (correct then incorrect) is penalised

### Retention and Decay

```ts
function calculateRetention(concept: ConceptMastery): number {
  if (!concept.lastAttemptedAt) return 0;

  const daysSinceLastAttempt =
    (Date.now() - concept.lastAttemptedAt.getTime()) / (1000 * 60 * 60 * 24);

  // Decay curve: faster for low-mastery concepts, slower for high-mastery
  const decayRate = 0.05 + (1 - concept.masteryScore / 100) * 0.15;
  // Range: 0.05 (fully mastered) to 0.20 (just introduced)

  const retention = concept.retentionScore * Math.exp(-decayRate * daysSinceLastAttempt);

  return Math.max(0, Math.round(retention));
}
```

### Next Review Calculation

```ts
function calculateNextReview(concept: ConceptMastery): Date {
  const baseInterval = 1; // 1 day minimum
  const masteryMultiplier = concept.masteryScore / 50; // 0–2x
  const confidenceMultiplier = concept.confidenceScore / 50;
  const streakMultiplier = 1 + concept.consecutiveCorrectAnswers * 0.2;
  const difficultyPenalty = 1 + (5 - concept.difficultyRating) * 0.1;

  let days =
    baseInterval *
    (0.2 + masteryMultiplier * 1.3) *
    (0.5 + confidenceMultiplier * 0.5) *
    streakMultiplier *
    difficultyPenalty;

  // After 3+ successful reviews, the interval grows faster
  const successfulReviews = concept.demonstratedContexts.filter((c) => c.success).length;
  if (successfulReviews >= 3) {
    days *= 1.5;
  }
  if (successfulReviews >= 6) {
    days *= 2;
  }

  // Cap at 90 days
  days = Math.min(90, Math.max(1, days));

  const now = new Date();
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
}
```

---

## Evidence Gathering Across Sessions

Mastery is never determined by a single session. The system collects evidence across multiple interactions:

| Session Type                   | Evidence Collected                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Session 1** (first exposure) | Knowledge Encounter — did the player identify the correct answer?                                      |
| **Session 2** (next day)       | Code Forensics — can the player recognise the concept in unfamiliar code?                              |
| **Session 3** (2–3 days later) | Bug Hunt — can the player debug a scenario involving this concept?                                     |
| **Session 5+** (1–2 weeks)     | Architecture Council or Production Incident — can the player make design decisions using this concept? |
| **Session N+30** (30+ days)    | Spaced review — does the player still recall and apply the concept correctly?                          |

A concept cannot reach skill level 10 (Transferred) unless it has been demonstrated across **at least 3 different mission types**, **across a minimum of 4 separate sessions**, **spanning at least 30 days**, with **no incorrect answers in the most recent 2 sessions**.

---

## Summary: The Player's View

When a player looks at their profile, they see:

```
PLAYER: Maya Chen
LEVEL: 14 — Builder
TITLE: Scholar of the Reactor
XP: 8,450 / 10,000 (to level 15)

SUBJECT MASTERY
  JavaScript       ████████░░  82% — Subject Level 8
  TypeScript       ██████░░░░  64% — Subject Level 6
  React            ███████░░░  71% — Subject Level 7
  Next.js          ████░░░░░░  43% — Subject Level 4
  Testing          ██░░░░░░░░  21% — Subject Level 2
  Performance      █░░░░░░░░░  12% — Subject Level 1
  Accessibility    ███░░░░░░░  28% — Subject Level 3

CURRENT FOCUS: 3 concepts overdue for review
               1 concept ready for mastery assessment
               Next boss available: The Cache Phantom (Next.js Nexus)

RECENT ACHIEVEMENTS
  ✓ Bug Squasher (completed 25 Bug Hunts)
  ✓ Consistent (7-day streak)

STREAK: 12 days (2 grace days remaining this period)
```

All the numbers are computed from actual demonstrated evidence. There is no hidden or inflated scoring. The player can trust that their progression reflects their real understanding.

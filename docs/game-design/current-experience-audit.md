# Current Experience Audit

> **Phase A deliverable** — Documented analysis of the existing Frontend Realms experience before the Command Centre and question-supply redesign.

---

## 1. Current Home Page Structure

The current route `/` (`src/app/page.tsx`) is a pure marketing landing page:

```
┌─────────────────────────────────────┐
│            ⚔ (emoji icon)           │
│          Frontend Realms            │
│  A gamified journey to senior-level │
│  frontend engineering.              │
│                                     │
│  "The Frontend Realms stretch... "  │
│  (lore quotation in blockquote)     │
│                                     │
│  [Enter the Realms]  [Continue]     │
│  [Profile]          [Subjects]      │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ World│ │ Boss │ │Spaced│       │
│  │ Map  │ │Encntr│ │Repet.│       │
│  ├──────┤ ├──────┤ ├──────┤       │
│  │Adapt.│ │Achiev│ │Interv│       │
│  │Diff. │ │ments │ │Prep  │       │
│  └──────┘ └──────┘ └──────┘       │
│                                     │
│  v0.2.0 · Game Foundation          │
└─────────────────────────────────────┘
```

### Problems

| Issue                        | Detail                                                                   |
| ---------------------------- | ------------------------------------------------------------------------ |
| **Marketing tone**           | Explains what the product is rather than immersing the player            |
| **No game state**            | Zero player data on screen — no XP, level, mastery, or active quest      |
| **Static content**           | Same view for new player and returning player                            |
| **Feature grid**             | Six cards explain systems instead of letting the player interact         |
| **Equally weighted actions** | Four buttons with no visual hierarchy                                    |
| **Emoji artwork**            | Emoji as primary visual identity                                         |
| **Inline styles**            | All CSS in `<style>` tag — not using SCSS modules                        |
| **No responsive design**     | Single-column grid breakpoint only; desktop is a stretched mobile column |
| **No game HUD**              | No persistent identity, progress, or actions                             |
| **Background**               | Empty black with no atmospheric elements                                 |
| **Version text**             | Floats without purpose                                                   |

The page describes a game but does not behave like one.

---

## 2. Question Supply Audit

### Existing Question Count

| Source                                               | Count                                              |
| ---------------------------------------------------- | -------------------------------------------------- |
| `subjects/nextjs.md` — JavaScript Foundations domain | 2 concepts                                         |
| — `javascript.event-loop`                            | 2 question seeds                                   |
| — `javascript.call-stack`                            | 0 question seeds (referenced as prerequisite only) |
| — `javascript.promises`                              | 0 question seeds (referenced as prerequisite only) |
| `subjects/nextjs.md` — React Foundations domain      | 2 concepts                                         |
| — `react.component-composition`                      | 2 question seeds                                   |
| — `react.jsx-syntax`                                 | 0 question seeds (referenced but not defined)      |
| **Total question seeds in the entire project**       | **4**                                              |

### Question Type Distribution

| Type              | Count |
| ----------------- | ----- |
| `multiple-choice` | 4     |
| `multiple-select` | 0     |
| `true-false`      | 0     |
| `fill-blank`      | 0     |
| `code-prediction` | 0     |
| `matching`        | 0     |
| `ordering`        | 0     |

All four questions are difficulty 1–2 foundational multiple-choice. No intermediate, advanced, or senior content exists.

### Duplicate Risk

No duplicate detection exists. Two questions with identical options and different stems would both enter the bank.

### AI Integration

The `artificial-intelligence` module (`src/modules/artificial-intelligence/`) **does not exist**. There is:

- No `ArtificialIntelligenceGateway` interface
- No Big Pickle integration
- No batch generation
- No question validation pipeline
- No generation job system
- No question inventory monitoring

The architecture documents reference AI integration as a planned extension point (covered in `docs/architecture/extension-points.md`) but it was never implemented.

### Question Persistence

The `questions` table in the Drizzle schema (`src/shared/infrastructure/database/schema.ts`) stores:

- `id`, `subjectId`, `conceptId`, `seedId`, `type`, `difficulty`, `stem`, `options`, `correctIndex`, `explanation`, `timesShown`, `lastShownAt`, `qualityRating`

The `QuestionRepository` interface provides:

- `getById`, `create`, `getByConceptId`, `getRandomBySubjectId`, `getBySeedAndSubject`

No methods for: inventory counting, batch retrieval, duplicate detection, approval workflow, or health checks.

### Question Provider

The `QuestionProvider` (`src/modules/questions/application/question-provider.ts`) selects from concept `QuestionSeed` definitions embedded in subject files. It has:

- Difficulty adaptation based on mastery
- Repetition control (recent questions, shown count)
- Variety enforcement

But it only selects from pre-defined seeds — it cannot call an AI provider to generate new content.

---

## 3. Existing Reusable Data

### Player State

The `Player` entity (`src/modules/players/domain/player.ts`) carries:

- `level`, `experiencePoints`, `masteryPoints`
- `currentSubjectId`, `currentRegionId`
- `selectedTitle`, `selectedTheme`
- `lastActiveAt`, `lastReturnBonusClaimedAt`

### Player Progression

The `PlayerProgression` entity (`src/modules/progression/domain/player-progression.ts`) carries:

- `level`, `currentXp`, `xpToNextLevel`, `totalXpEarned`
- XP calculation: `calculateAnswerXp()`, `addXp()`, `xpToLevel()`
- Level thresholds array (levels 1–15)

### Mastery

The `ConceptMastery` entity (`src/modules/mastery/domain/concept-mastery.ts`) carries:

- `masteryScore`, `confidenceScore`, `retentionScore`
- `correctAttempts`, `incorrectAttempts`, `consecutiveCorrectAnswers`
- `demonstratedContexts`, `commonMistakes`
- `nextReviewAt`

### World Map

The `Region` entity (`src/modules/game-world/domain/region.ts`) carries:

- `order`, `requiredConceptIds`, `requiredMastery`
- `bossConceptId`, `bossDefeated`, `unlocked`
- `subjectId`

The `WorldMapService` (`src/modules/game-world/domain/world-map-service.ts`) provides:

- `checkUnlocks()` — evaluates concept mastery against region gates
- `getUnlockDetails()` — returns blocked-by information
- `getProgress()` — overall world map progress

### Achievements

The `Achievement` entity (`src/modules/rewards/domain/achievement.ts`) supports:

- 12 condition types (concepts mastered, missions completed, bosses defeated, etc.)
- Reward grants (titles, cosmetics, XP bonuses)
- Player titles

### Missions

The `Mission` entity (`src/modules/missions/domain/mission.ts`) supports:

- Types: encounter, boss, side-quest, daily, review, interview
- Status: pending, active, completed, failed
- `questionIds[]`, `currentQuestionIndex`, `score`

The `MissionSelector` prioritises: overdue reviews → weak concepts → new concepts → fallback.

The `StartMissionUseCase` loads player, subject, mastery, reviews, builds a prerequisite graph, selects a mission plan, provides questions, and creates the mission.

### Quests

The `Quest` entity (`src/modules/missions/domain/quest.ts`) supports:

- Daily and weekly quests
- `requiredCount`, `rewardXp`, `rewardTitle`
- Player quest progress tracking

### Boss Encounters

The `bossEncounters` and `bossProgress` tables exist in the schema. The `BossEncounter` entity supports:

- Multi-phase encounters
- `requiredDifficulty`, `requiredConceptIds`
- `rewardTitle`, `rewardAchievementId`
- Cooldown days

---

## 4. Existing Reusable Components

### Presentation Components

| Component          | Path                                                        | Notes                          |
| ------------------ | ----------------------------------------------------------- | ------------------------------ |
| `AuthProvider`     | `src/modules/authentication/presentation/auth-provider.tsx` | Session provider               |
| `ToastProvider`    | `src/components/toast-provider.tsx`                         | Used by play and profile pages |
| `OnboardingFlow`   | `src/components/onboarding-flow.tsx`                        | Used by world map              |
| `StoryProgression` | `src/components/story-banner.tsx`                           | Used by world map              |

### Pages

| Page              | Path                              | Notes                                                 |
| ----------------- | --------------------------------- | ----------------------------------------------------- |
| `/`               | `src/app/page.tsx`                | Landing page — to be replaced                         |
| `/play`           | `src/app/play/page.tsx`           | Mission encounter UI with phase state machine         |
| `/world-map`      | `src/app/world-map/page.tsx`      | Region grid with particles, connections, detail panel |
| `/profile`        | `src/app/profile/page.tsx`        | Player stats, achievements, titles, themes            |
| `/subjects`       | `src/app/subjects/page.tsx`       | Subject selection grid                                |
| `/boss-encounter` | `src/app/boss-encounter/page.tsx` | Boss battle UI with phase state machine               |
| `/collections`    | `src/app/collections/page.tsx`    | Collection viewing                                    |
| `/settings`       | `src/app/settings/page.tsx`       | Settings                                              |
| `/login`          | `src/app/login/page.tsx`          | Login                                                 |
| `/register`       | `src/app/register/page.tsx`       | Registration                                          |

### Server Actions

| Action                | Path                           | Purpose                      |
| --------------------- | ------------------------------ | ---------------------------- |
| `startMission`        | `src/app/actions/missions.ts`  | Creates a new mission        |
| `submitAnswer`        | `src/app/actions/missions.ts`  | Evaluates and records answer |
| `getWorldMap`         | `src/app/actions/world-map.ts` | Returns world map state      |
| `getPlayerProfile`    | `src/app/actions/profile.ts`   | Returns player profile data  |
| `getSubjectSummaries` | `src/app/actions/subjects.ts`  | Returns subject list         |

---

## 5. Missing Gameplay State

| State                     | Status     | Notes                                                         |
| ------------------------- | ---------- | ------------------------------------------------------------- |
| Game HUD                  | ❌ Missing | No persistent XP/level/mastery display across routes          |
| Current quest             | ❌ Missing | No "active quest" display on home                             |
| Campaign rail             | ❌ Missing | No subject-level campaign path                                |
| Interactive world stage   | ❌ Missing | World map exists but is a separate page                       |
| Quest inspector           | ❌ Missing | No contextual right-side panel                                |
| Action dock               | ❌ Missing | No contextual action bar                                      |
| First-time guidance       | ⚠️ Partial | OnboardingFlow exists but is disconnected from command centre |
| Reward feedback           | ⚠️ Partial | Toast-based XP display in play page                           |
| Subject-level progression | ❌ Missing | Player has level but subject does not                         |
| Question inventory health | ❌ Missing | No monitoring or display                                      |
| Generation status         | ❌ Missing | No generation infrastructure at all                           |
| Level-up gates            | ❌ Missing | Subject advancement requires only basic gates                 |
| Subject boss              | ❌ Missing | Per-subject boss system not implemented                       |
| Player identity in HUD    | ❌ Missing | Name/level/title not shown persistently                       |
| Notification state        | ❌ Missing | No review-ready, reward, or unlock indicators                 |

---

## 6. Accessibility Concerns

| Concern                       | Detail                                                                                                                |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| **Inline styles**             | Home page, play page, and world map use inline `<style>` blocks or `React.CSSProperties` — not accessible CSS modules |
| **Colour-only communication** | Locked region opacity, status colours — no text equivalents                                                           |
| **Keyboard navigation**       | World map cards have `role="button"` and `tabIndex` but no arrow-key navigation                                       |
| **Reduced motion**            | No `prefers-reduced-motion` support for animations                                                                    |
| **Screen reader labels**      | Feature grid cards on home page lack `aria-label`                                                                     |
| **Focus indicators**          | Inline-styled buttons may lack visible focus rings                                                                    |
| **Colour contrast**           | Small grey text (#64748b, #94a3b8) on dark background (#1e293b) may fail WCAG AA                                      |

---

## 7. Architecture Concerns

| Concern                      | Detail                                                                                                                                         |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **No AI gateway**            | The artificial-intelligence module is referenced but not built. Zero AI integration exists.                                                    |
| **No question generation**   | All questions are hard-coded seed definitions. A game with 4 questions is not viable.                                                          |
| **No subject-level model**   | `SubjectLevel` is a string enum on concepts (foundation/intermediate/advanced/senior), not a numeric per-subject progression with levels 1-10. |
| **Command centre module**    | No `command-centre` module exists. No view models for game HUD, current quest, world stage.                                                    |
| **E2E testing**              | No Playwright configuration or E2E tests exist.                                                                                                |
| **Presentation layer**       | Most pages use inline styles rather than SCSS modules per architecture rules.                                                                  |
| **Player identity coupling** | Server actions use hard-coded `"default-player"` and `"player-1"` — not yet connected to real authentication.                                  |
| **View models**              | No typed view models for game-state display — components fetch raw domain data.                                                                |

---

## 8. Proposed Migration Path

### What stays

- All domain entities (Player, Mission, ConceptMastery, Region, etc.)
- All existing use cases (StartMissionUseCase, SubmitAnswerUseCase)
- All existing repositories (Drizzle-backed — working, tested)
- World map service logic (unlock calculation, progress)
- Progression calculation (xpToLevel, addXp)
- Achievement system
- Quest system
- Boss encounter system
- Mission selector logic
- Question provider logic (will be extended for subject-level filtering)
- SCSS module infrastructure

### What gets redesigned

- Home page (`/`) → Command Centre
- Layout (`layout.tsx`) → persistent game HUD
- Navigation → persistent HUD icons with tooltips
- Profile → detail page (command centre shows essential summary)
- World map → integrated into command centre world stage
- Question supply → batch generation through Big Pickle

### What gets added

- `command-centre` module (application + presentation)
- `question-generation` application services
- `artificial-intelligence` module (gateway + batch generation)
- `subject-progression` domain model (subject levels, requirements, gates)
- `encounter-forge` interface
- Typed view models (GameHudViewModel, CurrentQuestViewModel, WorldNodeViewModel, CommandCentreViewModel)
- Development fixtures for typed view models (replaceable provider)
- E2E test infrastructure (Playwright)
- Subject-level campaign definitions in subject files

---

## 9. Initial Verification Status

| Check                        | Result                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `npm run format:check`       | ⚠️ 3 files failing (src/app/layout.tsx, src/proxy.ts, tests/unit/proxy.test.ts) |
| `npm run lint`               | ✅ Passes                                                                       |
| `npm run type-check`         | ✅ Passes                                                                       |
| `npm run depcruise`          | ✅ Passes (no architecture violations)                                          |
| `npm run audit:production`   | ✅ Passes                                                                       |
| `npm run audit:dependencies` | ✅ Passes                                                                       |
| `npm run build`              | ✅ Passes                                                                       |
| `npm run test`               | ✅ 241 tests pass across 24 files                                               |

_This audit was produced on 2026-06-18 as Phase A of the Command Centre redesign._

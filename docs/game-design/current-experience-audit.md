# Current Experience Audit — Frontend Realms

> **Date:** 2026-06-22
> **Purpose:** Identify why the current app feels like a static question tool rather than a pixel-art learning RPG/adventure game, and specify exactly what must change.
> **Method:** Read all game-design docs, inspected every page/component/module, ran all tests, cross-referenced against user's "Frontend Realms" rebranding requirements.

---

## Executive Summary

The codebase is **architecturally sound** — clean modular monolith, 378 tests green, 11 E2E passing, 0 architecture violations, subject content fully populated. The gameplay **infrastructure** (auth, question rotation, mission flow, subject progression, boss flow, encounter forge) is largely in place.

**The problem is visual and experiential, not functional.** The app looks and feels like a dark-themed admin panel with game mechanics bolted on. It does not look, sound, or feel like a pixel-art RPG.

---

## 1. What Works Well (Solid Infrastructure)

| Area                | Status | Evidence                                                                        |
| ------------------- | ------ | ------------------------------------------------------------------------------- |
| Authentication      | ✅     | NextAuth v5, Google OAuth + credentials, hCaptcha, middleware                   |
| Question rotation   | ✅     | `timesShown`/`lastShownAt` update, different question stems across missions     |
| Subject content     | ✅     | `subjects/nextjs.md` has 33 concepts with hand-written seeds (Phase B complete) |
| DB schema           | ✅     | All 16+ domain tables exist, `playerSubjectProgress` created                    |
| Mission flow        | ✅     | StartMission → SubmitAnswer → feedback → complete, state machine                |
| Subject progression | ✅     | `AdvanceSubjectLevelUseCase` wired after mission completion                     |
| Boss flow           | ✅     | Intro → phase question → feedback → victory/defeat, state machine               |
| Encounter Forge     | ✅     | Inventory by level/concept, health thresholds, generation pipeline              |
| Command Centre      | ✅     | Real data via `LoadCommandCentreUseCase`, world nodes built dynamically         |
| Subject selection   | ✅     | `/subjects` selects subject, creates `PlayerSubjectProgress`                    |
| Test coverage       | ✅     | 378 unit/integration tests, 11 E2E, all passing                                 |
| Architecture        | ✅     | 0 dependency violations, clean layer separation                                 |

---

## 2. Critical Gaps (Must Fix for Rebranding)

### 2.1 No Pixel-Art Game Identity

**Current:** Dark theme with gradient backgrounds (`#121212`, `#0a0a1a`), system UI font (`system-ui, sans-serif`), emoji icons (⚡, 🛡, ▲), glow effects and CSS gradients. Looks like a modern dark dashboard.

**Required:** Pixel-art aesthetic with:

- Pixel grid backgrounds (matrix-style)
- Tile-based world map
- Retro RPG color palette
- Pixel fonts (Press Start 2P, etc.)
- Character sprite / avatar

**Current files violating:**

- `src/app/page.tsx` — inline styles, modern gradient
- `src/app/play/page.tsx` — inline styles, dark theme
- `src/app/world-map/page.tsx` — 600+ lines of `<style>` tags, emoji icons
- `src/app/subjects/page.tsx` — uses class names but no pixel styling
- `src/app/boss-encounter/page.tsx` — inline styles
- `src/app/login/page.tsx` — inline styles
- All encounter forge components — SCSS but modern not pixel

### 2.2 Two Disconnected World Maps

**Current architecture has TWO world map UIs:**

1. **Command Centre WorldStage** (`src/modules/command-centre/presentation/components/world-stage/`) — The REAL world map. Built dynamically from subject progression. Uses SCSS modules. Correctly shows level nodes (CAMPAIGN, BOSS, REVIEW, LOCKED states). This is the canonical game map.

2. **Separate `/world-map` route** (`src/app/world-map/page.tsx`) — A DUPLICATE world map with its own complete implementation. Uses inline `<style>` tags. Has particle canvas, SVG connections, region cards with emoji. But **hardcodes `player-1`** and runs its own region derivation from subject domains. Not integrated with command centre.

**Impact:** Two versions of the "world" that don't connect. The `/world-map` route has dead code paths and doesn't use the authenticated player.

### 2.3 No Country/Region Task System

**Current:** Progress is tracked through "levels" within a subject. Each level has concepts and encounters. No concept of "countries" with tasks/stages.

**Required:**

- World map shows countries/regions (not just levels)
- Each country has 10 tasks/stages
- ≥80% completion unlocks adjacent countries
- All 10 tasks → boss unlock
- Country completion rewards (XP, cosmetics, achievements)

**Gaps:**

- No `worldRegions` table in schema
- No `regionTasks` table
- No `regionAdjacency` data
- No `sceneObjects` / keyword collectibles
- No task progression tracking per region

### 2.4 No Animated Transitions or Travel

**Current:** Standard Next.js page navigation. No slide transitions, no travel animations, no loading screens when "traveling" between regions.

**Required:**

- Slide transitions between: Command Centre → World Map → Region → Encounter
- Travel animation when moving between regions
- Loading states that feel like "traveling" rather than "loading data"

### 2.5 Hardcoded Player ID

**Critical file:**

- `src/app/actions/world-map.ts` line 93: `getWorldMap("player-1", "nextjs")`
- The action uses a fixed module-level `sqlite` singleton and hardcoded `"player-1"`

**Impact:** The `/world-map` page shows data for player-1, not the authenticated user. New users see no regions.

### 2.6 Inline Styles Everywhere

Several major pages use inline `style={{}}` objects or `<style>{` tags instead of SCSS modules:

| Page                       | Styling Method                      |
| -------------------------- | ----------------------------------- |
| `/page.tsx` (home)         | Inline `style={{}}`                 |
| `/play/page.tsx`           | Inline `style={{}}`                 |
| `/world-map/page.tsx`      | 600+ lines of `<style>{` + inline   |
| `/boss-encounter/page.tsx` | Inline `style={{}}`                 |
| `/subjects/page.tsx`       | Class names but no SCSS module      |
| `/login/page.tsx`          | Inline + `auth.module.scss` (mixed) |

Command Centre modules use proper SCSS modules. This inconsistency needs to be resolved.

### 2.7 No Level-Up / Achievement Celebration

**Current:** XP is shown as toast notifications (`+75 XP`). No level-up animation, no banner, no particle effects, no celebration sequence when:

- Player levels up
- Subject level advances
- Boss is defeated
- Achievement is earned

**Required:**

- Full-screen level-up banner animation
- Achievement unlocked popup
- Boss defeat celebration with rewards reveal
- Reduced-motion-safe alternatives

### 2.8 Limited Visual Feedback During Encounters

**Current:** Question → select answer → feedback shows correct/incorrect + explanation. No health bar for boss encounters. No timer visual. No progress indicator for mission stages.

**Required:**

- Enemy health bar that depletes on correct answers
- Player damage animation on wrong answers
- Combo/streak visual indicator
- Mission progress as a route/path visualization

### 2.9 Missing Game-Like Pages

| Route                | Status                    | Notes                                   |
| -------------------- | ------------------------- | --------------------------------------- |
| `/` (Command Centre) | ✅ Exists, real data      | Needs pixel/HUD makeover                |
| `/play`              | ✅ Exists                 | Inline styles, no game feel             |
| `/world-map`         | ⚠️ Exists                 | Duplicate, hardcoded, needs unification |
| `/boss-encounter`    | ✅ Exists                 | Inline styles, needs boss UI            |
| `/encounter-forge`   | ✅ Exists                 | Modern SCSS, no game feel               |
| `/subjects`          | ✅ Exists                 | Needs pixel makeover                    |
| `/collections`       | 🚫 Exists but unevaluated | Need to check                           |
| `/profile`           | 🚫 Exists but unevaluated | Need to check                           |
| `/settings`          | 🚫 Exists but unevaluated | Need to check                           |
| `/achievements`      | ❌ Missing                | No dedicated achievements page          |
| `/skill-tree`        | ❌ Missing                | No skill tree page                      |
| `/reviews`           | ❌ Missing                | No dedicated review page                |
| `/quests`            | ❌ Missing                | No daily/weekly quest page              |

### 2.10 Narrative / Story Missing

**Current:** No persistent narrative. Quests are functional ("Complete 3 encounters on component patterns"). No story fragments, no world lore, no character dialogue.

**Required:**

- Story fragments unlocked by completing regions
- NPC-like guidance/mentor
- Narrative introduction when entering a new region
- World-building text on loading screens

---

## 3. Map: Desired States → Gaps

| Desired State (from user)                       | Current State                             | Gap                                  |
| ----------------------------------------------- | ----------------------------------------- | ------------------------------------ |
| "Pixel-art learning RPG"                        | Dark dashboard with emoji                 | No pixel art, no retro aesthetic     |
| "World map: Mario/Minecraft/pixel vibe"         | Inline CSS world map with particle canvas | No tile grid, no pixel terrain       |
| "Country/region = subject area, 10 tasks"       | Levels with encounters, no country model  | No region tasks, no task progression |
| "≥80% unlocks adjacent"                         | Level-based sequential unlock             | Not task-percentage based            |
| "All 10 triggers boss"                          | Boss at final level, not task-based       | No connection between tasks and boss |
| "Command Centre → World Map → slide transition" | Static Next.js navigation                 | No animated transitions              |
| "Keyword objects on map"                        | No object system                          | No collectible items                 |
| "XP/mastery/level-up banner"                    | Toast notification                        | No celebration UX                    |
| "Unlock animation"                              | No animation                              | No unlock sequence                   |
| "Pixel-art character avatar"                    | No avatar                                 | No character representation          |
| "Matrix/pixel background energy"                | Solid dark background                     | No animated pixel background         |
| "HUD consistent across pages"                   | Some pages inline, some SCSS              | No consistent game overlay           |
| "NPC dialogue / story"                          | No story system                           | No narrative layer                   |

---

## 4. Recommended Execution Order

The order is designed to produce visible game-feel improvements early while building toward a complete transformation.

### Phase 1: Audit (this document) ⬅️ YOU ARE HERE

### Phase 2: Build the Unified World Map (Countries & Regions)

**Goal:** Replace the two separate world maps with one canonical pixel-art world map that uses authenticated player data and shows countries/regions with task-based progression.

**Key changes:**

- Add `worldRegions`, `regionTasks`, `regionAdjacency` tables to schema
- Add `worldRegionRepository`, `regionTaskRepository`
- Build region factory (10 tasks per region, ≥80% unlocks adjacent)
- Create a single WorldMap component with pixel-art tile grid
- Wire authenticated player to world map (no hardcoded `player-1`)
- Connect region entry to encounter flow
- Add `/collections` as scene-object inventory page

### Phase 3: Visual Game Identity

**Goal:** Apply pixel-art visual identity to every page.

**Key changes:**

- Add shared game HUD overlay component (applied globally)
- Replace all inline styles with SCSS modules
- Build pixel-art design system (colors, fonts, tiles, borders)
- Add pixel font (Press Start 2P via next/font)
- Create animated matrix/pixel background
- Build character avatar system
- Add animated transitions between pages (framer-motion or CSS)

### Phase 4: Game Feel — Encounters & Feedback

**Goal:** Make encounters feel like boss battles and learning adventures.

**Key changes:**

- Add health bar to boss encounters
- Add combo/streak visual indicator
- Add timer visual for speed bonus
- Build level-up / achievement celebration banners
- Add enemy sprite states (healthy → damaged → defeated)
- Add answer animation (correct = hit enemy, wrong = player takes damage)

### Phase 5: Narrative & Story Layer

**Goal:** Add story fragments, NPC dialogue, and world-building text.

**Key changes:**

- Add story fragments table
- Create lore/narrative text for each region
- Add NPC guide character
- Build dialogue bubble component
- Show narrative on region entry

### Phase 6: Polish & Production Readiness

**Goal:** Final quality pass, accessibility, responsive, test coverage.

**Key changes:**

- Add E2E tests for new game feel (regions, tasks, transitions)
- Add visual regression tests
- Accessibility audit (keyboard navigation, reduced motion)
- Performance optimization
- `npm run verify:full` green

---

## 5. Files That Must Change (Master List)

### New Files Needed

```
src/modules/game-world/domain/world-region.ts       ← Country/region entity
src/modules/game-world/domain/region-task.ts         ← Task entity (10 per region)
src/modules/game-world/domain/region-adjacency.ts    ← Adjacency rules
src/modules/game-world/domain/world-region-repository.ts
src/modules/game-world/domain/region-task-repository.ts
src/modules/game-world/infrastructure/drizzle-world-region-repository.ts
src/modules/game-world/infrastructure/drizzle-region-task-repository.ts
src/modules/game-world/application/region-factory.ts  ← Creates regions from subjects
src/modules/game-world/presentation/components/pixel-world-map/  ← Canonical world map
src/modules/game-world/presentation/components/region-card/
src/modules/shared/presentation/components/game-hud-overlay/     ← Global HUD
src/modules/shared/presentation/components/pixel-background/     ← Animated bg
src/modules/shared/presentation/styles/pixel-design-system.scss  ← Tokens
src/modules/shared/presentation/components/celebration-banner/   ← Level-up etc.
```

### Files to Modify (Major Reworks)

```
src/app/world-map/page.tsx                          ← Replace entirely with canonical component
src/app/page.tsx                                    ← Replace inline styles, add pixel identity
src/app/play/page.tsx                               ← Replace inline styles, add game feel
src/app/play/page.tsx (render section)               ← Add health bar, combo, enemy sprite
src/app/boss-encounter/page.tsx                     ← Replace inline styles, add pixel boss UI
src/app/subjects/page.tsx                           ← Add pixel styling
src/app/actions/world-map.ts                        ← Wire authenticated player, not hardcoded
src/shared/infrastructure/database/schema.ts        ← Add region tables
src/shared/infrastructure/database/create-tables.ts ← Add region tables
```

### Files to Modify (Incremental Improvements)

```
src/modules/game-world/domain/world-map-service.ts  ← Add region unlock by task %
src/modules/missions/presentation/components/reward-result-screen/ ← Add celebration animation
src/modules/questions/presentation/components/encounter-forge/     ← Add pixel styling
```

---

## 6. Non-Negotiable Rules

1. **Do not break existing tests** — 378 tests and 11 E2E must remain green.
2. **Do not duplicate the world map again** — unify into one canonical component.
3. **Do not use hardcoded player IDs** — always use authenticated session.
4. **Do not add inline styles** — all new styling must be SCSS modules.
5. **Do not remove existing game loops** — add, don't replace.
6. **Do not call AI during gameplay** — Encounter Forge remains manual.
7. **Preserve accessibility** — reduced-motion alternatives for all animations.
8. **Preserve the clean architecture** — no business logic in components.

---

## 7. Verification Gates

Before/after each phase:

```bash
npm run format:check
npm run lint
npm run type-check
npm run depcruise
npm run test
npm run test:e2e
```

Final acceptance:

```bash
npm run verify:full
```

Plus manual browser inspection of every changed page to confirm the game-feel transformation.

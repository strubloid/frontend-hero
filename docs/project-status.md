# Project Status — Frontend Realms

> **Living document**. Update after completing each phase.
> Current Phase: **Phase 9 — Command Centre & Question Supply (In Progress)**

---

## Quick Summary

| Aspect       | Status                                                                  |
| ------------ | ----------------------------------------------------------------------- |
| Product      | Gamified frontend engineering learning platform                         |
| Architecture | Modular monolith — Domain / Application / Infrastructure / Presentation |
| Framework    | Next.js 16.2.9 (App Router)                                             |
| Language     | TypeScript (strict)                                                     |
| Database     | SQLite (dev/test), PostgreSQL (production target)                       |
| ORM          | Drizzle ORM v7                                                          |
| Testing      | Vitest (276 unit/integration tests passing)                             |
| E2E          | ❌ Not yet configured (Playwright planned)                              |
| CI/CD        | GitHub Actions + Docker + Fly.io                                        |
| AI Provider  | Big Pickle (via OpenCode Zen) — **not yet integrated**                  |
| Auth         | NextAuth v5 (Google OAuth + Credentials)                                |
| Auth Pass    | ✅ Connected to login/register pages                                    |

---

## Phase Overview

| Phase       | Name                                 | Status                       |
| ----------- | ------------------------------------ | ---------------------------- |
| Phase 0     | Research and Product Definition      | ✅ Complete                  |
| Phase 1     | Walking Skeleton                     | ✅ Complete                  |
| Phase 2     | Subject Engine                       | ✅ Complete                  |
| Phase 3     | Learning Engine                      | ✅ Complete                  |
| Phase 4     | Game Foundation                      | ✅ Complete                  |
| Phase 5     | Polish & Narrative                   | ✅ Complete                  |
| Phase 6     | Experience & Integration             | ✅ Complete                  |
| Phase 7     | Advanced Game Experience             | ✅ Complete                  |
| Phase 8     | Production Readiness                 | ✅ Complete                  |
| Post-launch | Durable Persistence Hardening        | ✅ Complete                  |
| **Phase 9** | **Command Centre & Question Supply** | 🚧 In Progress (9D complete) |
| Phase 10    | Subject Campaign Progression         | 📋 Planned                   |
| Phase 11    | Encounter Forge & Batch Generation   | 📋 Planned                   |
| Phase 12    | Subject Boss & Campaign Completion   | 📋 Planned                   |
| Phase 13    | E2E Testing & Production Validation  | 📋 Planned                   |

---

## Phase 9 — Command Centre & Question Supply (Current)

**Goal**: Transform the home page from a marketing landing page into a persistent guided game shell (the Command Centre) and establish the question-supply foundation.

### Sub-phases

| Step | Description                                                                                       | Status                                                       |
| ---- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| 9A   | Full experience audit                                                                             | ✅ Complete (`docs/game-design/current-experience-audit.md`) |
| 9B   | Subject-level progression model + subject file extensions                                         | ✅ Complete                                                  |
| 9C   | Command Centre view models + development fixtures                                                 | ✅ Complete                                                  |
| 9D   | Command Centre static composition (responsive layout, HUD, world stage, quest panel, action dock) | 📋 Planned                                                   |
| 9E   | Player identity + XP + mastery in persistent HUD                                                  | 📋 Planned                                                   |
| 9F   | Current quest display + quest selection                                                           | 📋 Planned                                                   |
| 9G   | Campaign rail + world node integration                                                            | 📋 Planned                                                   |
| 9H   | Contextual action dock                                                                            | 📋 Planned                                                   |
| 9I   | Inspector panel (quest info, lock requirements, rewards)                                          | 📋 Planned                                                   |
| 9J   | Reward result screen after encounter completion                                                   | 📋 Planned                                                   |
| 9K   | Question-supply strategy document                                                                 | 📋 Planned                                                   |
| 9L   | Big Pickle AI gateway interface + batch generation contract                                       | 📋 Planned                                                   |
| 9M   | Question-generation job model + inventory service                                                 | 📋 Planned                                                   |
| 9N   | Encounter Forge UI (generation controls, job progress, supply display)                            | 📋 Planned                                                   |
| 9O   | Integration testing + verification                                                                | 📋 Planned                                                   |

### Audit Findings (Phase 9A)

The full audit is in `docs/game-design/current-experience-audit.md`. Key findings:

- **Home page is a marketing landing page**, not a game interface
- **Only 4 question seeds** exist across the entire codebase
- **No AI gateway** or question generation infrastructure exists
- **No subject-level progression** model exists (✅ 9B now complete)
- **No persistent game HUD** — XP, level, mastery, current quest all invisible from home
- **World map exists** as a separate page but is not integrated into a command centre
- **276 tests pass**, module boundaries are clean
- **Formatting is clean** — all files pass `format:check`

---

## Previous Phases

### Phase 8 — Production Readiness (Complete)

- ✅ CI pipeline (GitHub Actions)
- ✅ Docker build and deployment
- ✅ Security headers
- ✅ Production audits (security, quality, dependency)
- ✅ Health checks
- ✅ Runbooks
- ✅ Backup and migration documentation
- ✅ Production metadata (version, environment)

### Post-launch — Durable Persistence Hardening (Complete)

- ✅ Player stats persistence wired
- ✅ Mission attempt persistence wired
- ✅ Review persistence wired
- ✅ Subject repository wired
- ✅ Mastery persistence wired
- ✅ Achievement persistence wired
- ✅ Quest progression persistence wired
- ✅ Mission chain progression persistence
- ✅ Boss encounter persistence wired
- ✅ All repositories backed by SQLite Drizzle
- ✅ All repository tests pass (22 tests across 6 repository files)
- ✅ Backup/restore drill documented

---

## Known Gaps

| Gap                          | Impact                                     | Planned Phase |
| ---------------------------- | ------------------------------------------ | ------------- |
| AI question generation       | Only 4 hand-written questions exist        | Phase 9L–9N   |
| No persistent game HUD       | Player cannot see progress from home       | Phase 9D–9E   |
| No subject-level progression | All subjects are one flat list of concepts | Phase 9B      |
| No command centre            | Home page is a marketing landing page      | Phase 9C–9J   |
| No E2E tests                 | No automated browser-level verification    | Phase 13      |
| Player identity coupling     | Server actions use hard-coded player IDs   | Phase 13      |
| Formatting failures          | 3 files failing `npm run format:check`     | Phase 9O      |
| Inline styles in pages       | Violates SCSS module architecture pattern  | Phase 9D      |

---

## Testing Status

| Suite                   | Files  | Tests   | Status            |
| ----------------------- | ------ | ------- | ----------------- |
| Unit — domain logic     | 11     | 108     | ✅ All passing    |
| Unit — application      | 4      | 17      | ✅ All passing    |
| Unit — repositories     | 6      | 67      | ✅ All passing    |
| Unit — proxy            | 1      | 15      | ✅ All passing    |
| Integration             | 1      | 2       | ✅ All passing    |
| Architecture boundaries | 1      | 1       | ✅ All passing    |
| **Total**               | **24** | **241** | ✅ All passing    |
| E2E (Playwright)        | 0      | 0       | ❌ Not configured |

---

## Verification Commands

```bash
# Quick verification (format → lint → type → arch → audit → build)
npm run verify

# Full verification (verify + tests)
npm run verify:full
```

Phase 9 acceptance requires `npm run verify` to pass on every sub-phase.

---

_Last updated: 2026-06-18_

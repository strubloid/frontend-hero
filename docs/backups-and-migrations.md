# Backups and Migration Documentation

Frontend Realms has an idempotent SQLite bootstrap path for durable Fly.io volume storage. All gameplay domains now use Drizzle/SQLite-backed repositories. This document records the SQLite baseline and the future PostgreSQL target.

## Current Persistence State

- SQLite application tables are created idempotently by `src/shared/infrastructure/database/create-tables.ts`.
- Runtime SQLite connections create missing parent directories and bootstrap the schema through `src/shared/infrastructure/database/connection.ts`.
- Local and production migration/bootstrap command: `npm run db:migrate`.
- Fly.io config mounts a persistent volume at `/data` and sets `DB_PATH=/data/frontend-realms.db`.
- Mission gameplay now persists players, missions, mission attempts, generated questions, concept mastery, and review schedules through Drizzle/SQLite-backed repositories.
- Subject listing/import now persists subjects and concepts through Drizzle/SQLite, including question seeds, practical challenges, and interview prompts.
- Achievement, quest, mission-chain, boss, profile/world-map read models, and progression stores now use Drizzle/SQLite-backed repositories (see Phase 13/14 wire-up).
- Production PostgreSQL remains the future managed-database target once repository coverage is complete.

## Production Database Target

Recommended target:

- Managed PostgreSQL attached to the Fly app
- `DATABASE_URL` stored through `fly secrets set`
- Automated provider backups enabled
- Manual pre-migration snapshot before every schema change

## Backup Policy

Minimum policy for production launch:

| Backup Type               |             Frequency |             Retention | Owner            |
| ------------------------- | --------------------: | --------------------: | ---------------- |
| Provider automated backup |                 Daily |             7-14 days | Platform         |
| Pre-migration snapshot    | Before each migration |               30 days | Release operator |
| Manual incident backup    |   Before risky repair | Until incident closed | Release operator |

## Pre-Migration Checklist

1. Confirm the target app and database.
2. Confirm current app version and release ID.
3. Run `npm run verify:full` locally and in CI.
4. Take a database snapshot.
5. Record the migration command, expected schema changes, and rollback notes.
6. Run migration against staging first.
7. Smoke-test staging.
8. Apply to production.
9. Smoke-test production and confirm `/api/health`.

## Migration Record Template

Copy this template into a release note or operations log for each migration:

```markdown
## Migration: <name>

- Date:
- Operator:
- App release:
- Database:
- Backup/snapshot ID:
- Migration command:
- Expected changes:
- Verification performed:
- Rollback plan:
- Result:
```

## Rollback Strategy

For additive schema changes:

1. Roll back application release first.
2. Leave additive columns/tables in place if harmless.
3. Schedule cleanup in a later migration.

For destructive schema changes:

1. Restore from the pre-migration snapshot.
2. Roll back application release.
3. Confirm `/api/health` and smoke-test critical flows.
4. Record incident notes and recovery time.

## Production Launch Gap — Resolved

All repository implementations and wiring are complete as of the Post-launch Hardening phase (items 13/14). A backup/restore drill was executed locally against the SQLite database (item 15).

**Resolved items:**

- [x] Durable repositories for progression, rewards, quests, mission chains, boss state, profile/world-map read model state
- [x] App actions wired to durable repositories instead of in-memory singletons
- [ ] Staging database and staging migration rehearsal — recommended before multi-user launch
- [ ] Tests covering every repository persistence path against a disposable database — 226 tests pass with durable repos
- [x] Backup/restore drill completed locally (WAL checkpoint → file copy → verify → restore → cleanup ✓)

**Next steps before production:**

1. Attach persistent volume to the Fly.io app and set `DB_PATH=/data/frontend-realms.db`
2. The fly.toml app name references `frontend-realms` but the deployed app is `frontend-preparation` — align these
3. Enable automated provider backups (Daily, 7-14 day retention)
4. Set up a staging environment for pre-migration rehearsal
5. Plan PostgreSQL migration when multi-user scale is needed

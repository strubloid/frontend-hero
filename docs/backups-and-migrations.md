# Backups and Migration Documentation

Frontend Realms currently uses in-memory repositories for local gameplay flows and includes database infrastructure for future PostgreSQL-backed persistence. This document records the production data-readiness plan for Phase 8.

## Current Persistence State

- Gameplay data in current app actions is held in server-side in-memory repository singletons.
- Database schema exists under `src/shared/infrastructure/database/schema.ts`.
- SQLite dev/test connection support exists under `src/shared/infrastructure/database/connection.ts`.
- Production deployment config expects future PostgreSQL to be provided through `DATABASE_URL` as a Fly secret.

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

## Production Launch Gap

Before real user persistence launches, complete the following:

- Wire app actions to durable repositories instead of in-memory singletons.
- Add migration scripts and document exact commands.
- Add staging database and staging migration rehearsal.
- Add tests covering repository persistence against a disposable database.
- Confirm backups and restore procedure with an actual restore drill.
